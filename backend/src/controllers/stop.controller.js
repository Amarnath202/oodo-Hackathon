'use strict';

const { v4: uuidv4 } = require('uuid');
const { Stop, Trip, City, Activity, StopActivity } = require('../models');
const { sendSuccess, sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');
const { emitToTrip } = require('../services/socket.service');

/** Verifies the trip exists and belongs to the requesting user */
const getOwnedTrip = async (tripId, userId) => {
  const trip = await Trip.findOne({ where: { id: tripId, user_id: userId, is_deleted: false } });
  return trip;
};

/**
 * GET /api/v1/trips/:tripId/stops
 * Returns all stops for a trip, ordered by order_index.
 */
const getStops = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const stops = await Stop.findAll({
      where: { trip_id: req.params.tripId },
      include: [
        { model: City, as: 'city' },
        {
          model: Activity, as: 'activities',
          through: { attributes: ['id', 'scheduled_time'] },
        },
      ],
      order: [['order_index', 'ASC']],
    });

    return sendSuccess(res, 200, 'Stops retrieved successfully', { stops });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/trips/:tripId/stops
 * Creates a new stop in the trip itinerary.
 */
const createStop = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const { city_id, order_index, start_date, end_date, notes } = req.body;

    const city = await City.findByPk(city_id);
    if (!city) {
      return sendError(res, 404, 'City not found', ErrorCodes.NOT_FOUND, 'city_id', 'The specified city does not exist');
    }

    const stop = await Stop.create({
      id: uuidv4(),
      trip_id: req.params.tripId,
      city_id,
      order_index,
      start_date,
      end_date,
      notes: notes || null,
    });

    const fullStop = await Stop.findByPk(stop.id, {
      include: [{ model: City, as: 'city' }],
    });

    emitToTrip(req.params.tripId, 'stop:added', { stop: fullStop });

    return sendSuccess(res, 201, 'Stop created successfully', { stop: fullStop });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/trips/:tripId/stops/:stopId
 * Updates a stop.
 */
const updateStop = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const stop = await Stop.findOne({ where: { id: req.params.stopId, trip_id: req.params.tripId } });
    if (!stop) return sendError(res, 404, 'Stop not found', ErrorCodes.NOT_FOUND, null, 'No stop found');

    await stop.update(req.body);
    const updated = await Stop.findByPk(stop.id, { include: [{ model: City, as: 'city' }] });

    emitToTrip(req.params.tripId, 'stop:updated', { stop: updated });

    return sendSuccess(res, 200, 'Stop updated successfully', { stop: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/trips/:tripId/stops/:stopId
 * Deletes a stop and all its activities.
 */
const deleteStop = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const stop = await Stop.findOne({ where: { id: req.params.stopId, trip_id: req.params.tripId } });
    if (!stop) return sendError(res, 404, 'Stop not found', ErrorCodes.NOT_FOUND, null, 'No stop found');

    await stop.destroy();
    emitToTrip(req.params.tripId, 'stop:deleted', { stopId: req.params.stopId });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/trips/:tripId/stops/reorder
 * Reorders stops by updating their order_index values.
 */
const reorderStops = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const { order } = req.body;

    await Promise.all(
      order.map(({ id, order_index }) =>
        Stop.update({ order_index }, { where: { id, trip_id: req.params.tripId } })
      )
    );

    emitToTrip(req.params.tripId, 'stop:reordered', { order });

    return sendSuccess(res, 200, 'Stops reordered successfully', { order });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStops, createStop, updateStop, deleteStop, reorderStops };
