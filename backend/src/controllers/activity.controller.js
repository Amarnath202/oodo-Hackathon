'use strict';

const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { Activity, City, Stop, StopActivity, Trip } = require('../models');
const { sendSuccess, sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');
const { paginate } = require('../utils/paginate.util');
const { recalculateBudget } = require('../services/budget.service');
const { emitToTrip } = require('../services/socket.service');

/**
 * GET /api/v1/activities
 * Returns activities with optional search and type filter. Paginated.
 */
const getActivities = async (req, res, next) => {
  try {
    const { search, type, city_id, maxCost, duration } = req.query;
    const where = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (type) {
      where.type = type;
    }
    if (city_id) {
      where.city_id = city_id;
    }
    if (maxCost) {
      where.cost = { [Op.lte]: parseFloat(maxCost) };
    }
    if (duration) {
      // duration format: "0-2", "2-4", "4+", "full"
      if (duration === '0-2') where.duration = { [Op.between]: [0, 2] };
      else if (duration === '2-4') where.duration = { [Op.between]: [2, 4] };
      else if (duration === '4+') where.duration = { [Op.gte]: 4 };
      else if (duration === 'full') where.duration = { [Op.gte]: 8 };
    }

    const totalCount = await Activity.count({ where });
    const { limit, offset, pagination } = paginate(req.query, totalCount);

    const activities = await Activity.findAll({
      where,
      include: [{ model: City, as: 'city', attributes: ['id', 'name', 'country'] }],
      order: [['name', 'ASC']],
      limit,
      offset,
    });

    return sendSuccess(res, 200, 'Activities retrieved successfully', { activities }, pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/activities/:activityId
 * Returns a single activity by ID.
 */
const getActivityById = async (req, res, next) => {
  try {
    const activity = await Activity.findByPk(req.params.activityId, {
      include: [{ model: City, as: 'city' }],
    });

    if (!activity) {
      return sendError(res, 404, 'Activity not found', ErrorCodes.NOT_FOUND, null, 'No activity found with the provided ID');
    }

    return sendSuccess(res, 200, 'Activity retrieved successfully', { activity });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/activities/stops/:stopId/activities
 * Returns activities for a specific stop.
 */
const getStopActivities = async (req, res, next) => {
  try {
    const { stopId } = req.params;
    
    const stop = await Stop.findByPk(stopId, {
      include: [
        {
          model: Activity, as: 'activities',
          through: { attributes: ['id', 'scheduled_time'] },
        }
      ]
    });

    if (!stop) {
      return sendError(res, 404, 'Stop not found', ErrorCodes.NOT_FOUND, null, 'Stop not found');
    }

    return sendSuccess(res, 200, 'Stop activities retrieved successfully', { activities: stop.activities });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/activities/stops/:stopId/activities
 * Adds an activity to a stop. Triggers budget recalculation.
 */
const addActivityToStop = async (req, res, next) => {
  try {
    const { stopId } = req.params;
    const { activity_id, scheduled_time } = req.body;

    // Verify stop belongs to user's trip
    const stop = await Stop.findByPk(stopId, {
      include: [{ model: Trip, as: 'trip' }],
    });

    if (!stop || stop.trip.user_id !== req.user.id || stop.trip.is_deleted) {
      return sendError(res, 404, 'Stop not found', ErrorCodes.NOT_FOUND, null, 'Stop not found or access denied');
    }

    const activity = await Activity.findByPk(activity_id);
    if (!activity) {
      return sendError(res, 404, 'Activity not found', ErrorCodes.NOT_FOUND, 'activity_id', 'The specified activity does not exist');
    }

    // Check if already added
    const existing = await StopActivity.findOne({ where: { stop_id: stopId, activity_id } });
    if (existing) {
      return sendError(res, 409, 'Activity already added', ErrorCodes.ALREADY_EXISTS, 'activity_id', 'This activity has already been added to this stop');
    }

    const stopActivity = await StopActivity.create({
      id: uuidv4(),
      stop_id: stopId,
      activity_id,
      scheduled_time: scheduled_time || null,
    });

    // Recalculate budget after adding activity
    await recalculateBudget(stop.trip_id);

    emitToTrip(stop.trip_id, 'activity:added', { stopId, activity });

    return sendSuccess(res, 201, 'Activity added to stop successfully', { stopActivity, activity });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/activities/stops/:stopId/activities/:activityId
 * Removes an activity from a stop. Triggers budget recalculation.
 */
const removeActivityFromStop = async (req, res, next) => {
  try {
    const { stopId, activityId } = req.params;

    const stop = await Stop.findByPk(stopId, {
      include: [{ model: Trip, as: 'trip' }],
    });

    if (!stop || stop.trip.user_id !== req.user.id) {
      return sendError(res, 404, 'Stop not found', ErrorCodes.NOT_FOUND, null, 'Stop not found or access denied');
    }

    const deleted = await StopActivity.destroy({ where: { stop_id: stopId, activity_id: activityId } });
    if (!deleted) {
      return sendError(res, 404, 'Activity not found on this stop', ErrorCodes.NOT_FOUND, null, 'This activity is not on the specified stop');
    }

    // Recalculate budget after removing activity
    await recalculateBudget(stop.trip_id);

    emitToTrip(stop.trip_id, 'activity:removed', { stopId, activityId });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { getActivities, getActivityById, getStopActivities, addActivityToStop, removeActivityFromStop };
