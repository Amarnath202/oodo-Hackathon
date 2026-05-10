'use strict';

const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { Trip, Stop, City, Budget, Checklist, StopActivity } = require('../models');
const { sendSuccess, sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');
const { paginate } = require('../utils/paginate.util');
const { emitToTrip } = require('../services/socket.service');

/**
 * GET /api/v1/trips
 * Returns paginated list of trips for the authenticated user.
 */
const getTrips = async (req, res, next) => {
  try {
    const { search, sortField, sortOrder } = req.query;
    const where = { user_id: req.user.id, is_deleted: false };

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const order = [];
    if (sortField && sortOrder) {
      order.push([sortField, sortOrder.toUpperCase()]);
    } else {
      order.push(['createdAt', 'DESC']);
    }

    const totalCount = await Trip.count({ where });
    const { limit, offset, pagination } = paginate(req.query, totalCount);

    const trips = await Trip.findAll({
      where,
      include: [
        { model: Stop, as: 'stops', include: [{ model: City, as: 'city' }] },
        { model: Budget, as: 'budget' }
      ],
      order,
      limit,
      offset,
    });

    // Calculate metadata for each trip
    const tripsWithMeta = trips.map(trip => {
      const json = trip.toJSON();
      json.stopCount = json.stops?.length || 0;
      json.totalBudget = parseFloat(json.budget?.total_budget || 0);
      return json;
    });

    return sendSuccess(res, 200, 'Trips retrieved successfully', { trips: tripsWithMeta }, pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/trips
 * Creates a new trip with an auto-created budget and checklist.
 */
const createTrip = async (req, res, next) => {
  try {
    const { name, description, start_date, end_date, is_public } = req.body;

    const trip = await Trip.create({
      id: uuidv4(),
      user_id: req.user.id,
      name,
      description: description || null,
      start_date,
      end_date,
      is_public: is_public || false,
    });

    // Auto-create budget record
    await Budget.create({ id: uuidv4(), trip_id: trip.id });

    // Auto-create checklist record
    await Checklist.create({ id: uuidv4(), trip_id: trip.id });

    const fullTrip = await Trip.findByPk(trip.id, {
      include: [{ model: Budget, as: 'budget' }, { model: Checklist, as: 'checklist' }],
    });

    return sendSuccess(res, 201, 'Trip created successfully', { trip: fullTrip });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/trips/:tripId
 * Returns a single trip with full details.
 */
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      where: { id: req.params.tripId, user_id: req.user.id, is_deleted: false },
      include: [
        {
          model: Stop, as: 'stops',
          include: [
            { model: City, as: 'city' },
          ],
          order: [['order_index', 'ASC']],
        },
        { model: Budget, as: 'budget' },
        { model: Checklist, as: 'checklist' },
      ],
    });

    if (!trip) {
      return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found with the provided ID');
    }

    // Calculate metadata
    const json = trip.toJSON();
    json.stopCount = json.stops?.length || 0;
    json.totalBudget = parseFloat(json.budget?.total_budget || 0);
    
    // Count total activities across all stops
    let activityCount = 0;
    if (json.stops) {
      for (const stop of json.stops) {
        activityCount += await StopActivity.count({ where: { stop_id: stop.id } });
      }
    }
    json.activityCount = activityCount;

    return sendSuccess(res, 200, 'Trip retrieved successfully', { trip: json });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/trips/:tripId
 * Updates trip details.
 */
const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      where: { id: req.params.tripId, user_id: req.user.id, is_deleted: false },
    });

    if (!trip) {
      return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found with the provided ID');
    }

    const { name, description, start_date, end_date, is_public } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;
    if (is_public !== undefined) updates.is_public = is_public;

    await trip.update(updates);
    emitToTrip(trip.id, 'trip:updated', { trip });

    return sendSuccess(res, 200, 'Trip updated successfully', { trip });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/trips/:tripId
 * Soft deletes a trip.
 */
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      where: { id: req.params.tripId, user_id: req.user.id, is_deleted: false },
    });

    if (!trip) {
      return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found with the provided ID');
    }

    await trip.update({ is_deleted: true });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/trips/:tripId/cover-photo
 * Uploads a cover photo for the trip.
 */
const uploadCoverPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded', ErrorCodes.REQUIRED, 'file', 'A cover photo file is required');
    }

    const trip = await Trip.findOne({
      where: { id: req.params.tripId, user_id: req.user.id, is_deleted: false },
    });

    if (!trip) {
      return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found with the provided ID');
    }

    const photoPath = `/uploads/${req.file.filename}`;
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const fullUrl = `${serverUrl}${photoPath}`;

    await trip.update({ cover_image: fullUrl, cover_photo: fullUrl });
    emitToTrip(trip.id, 'trip:updated', { trip });

    return sendSuccess(res, 200, 'Cover photo uploaded successfully', { 
      cover_photo: fullUrl,
      cover_image: fullUrl 
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTrips, createTrip, getTripById, updateTrip, deleteTrip, uploadCoverPhoto };
