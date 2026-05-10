'use strict';

const { User, Trip, City, Activity } = require('../models');
const { sendSuccess, sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');
const { paginate } = require('../utils/paginate.util');
const { sequelize } = require('../config/db.config');

/**
 * GET /api/v1/admin/stats
 * Returns platform-wide statistics.
 */
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTrips, totalCities, totalActivities] = await Promise.all([
      User.count({ where: { is_deleted: false } }),
      Trip.count({ where: { is_deleted: false } }),
      City.count(),
      Activity.count(),
    ]);

    return sendSuccess(res, 200, 'Stats retrieved successfully', {
      stats: { totalUsers, totalTrips, totalCities, totalActivities },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/users
 * Returns paginated list of all users.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const totalCount = await User.count({ where: { is_deleted: false } });
    const { limit, offset, pagination } = paginate(req.query, totalCount);

    const users = await User.findAll({
      where: { is_deleted: false },
      attributes: { exclude: ['password', 'google_id'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return sendSuccess(res, 200, 'Users retrieved successfully', { users }, pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/users/:userId
 * Soft deletes a user account.
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return sendError(res, 404, 'User not found', ErrorCodes.NOT_FOUND, null, 'No user found with the provided ID');

    if (user.id === req.user.id) {
      return sendError(res, 403, 'Cannot delete yourself', ErrorCodes.FORBIDDEN, null, 'You cannot delete your own admin account');
    }

    if (user.role === 'admin') {
      // Optional: Prevent deleting other admins if that's the desired policy, 
      // but the user said they "cannot delete users", which might include other admins.
      // For now, let's keep the admin protection but ensure it's not blocking everything.
      // If the user in the table is an admin, this error is expected.
      return sendError(res, 403, 'Cannot delete admin', ErrorCodes.FORBIDDEN, null, 'Other admin accounts cannot be deleted for security');
    }

    await user.update({ is_deleted: true });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/trips
 * Returns paginated list of all trips across all users.
 */
const getAllTrips = async (req, res, next) => {
  try {
    const totalCount = await Trip.count({ where: { is_deleted: false } });
    const { limit, offset, pagination } = paginate(req.query, totalCount);

    const trips = await Trip.findAll({
      where: { is_deleted: false },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return sendSuccess(res, 200, 'Trips retrieved successfully', { trips }, pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/cities/top
 * Returns top 10 most popular cities by popularity_score.
 */
const getTopCities = async (req, res, next) => {
  try {
    const cities = await City.findAll({
      order: [['popularity_score', 'DESC']],
      limit: 10,
    });

    return sendSuccess(res, 200, 'Top cities retrieved', { cities });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/activities/top
 * Returns top 10 activities by usage count (how many times added to stops).
 */
const getTopActivities = async (req, res, next) => {
  try {
    const activities = await Activity.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT(*) FROM stop_activities WHERE stop_activities.activity_id = activities.id)`),
            'usage_count',
          ],
        ],
      },
      include: [{ model: City, as: 'city', attributes: ['name', 'country'] }],
      order: [[sequelize.literal('usage_count'), 'DESC']],
      limit: 10,
    });

    return sendSuccess(res, 200, 'Top activities retrieved', { activities });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/admin/users/:userId/ban
 * Toggles the banned status of a user.
 */
const banUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return sendError(res, 404, 'User not found', ErrorCodes.NOT_FOUND);

    if (user.role === 'admin') {
      return sendError(res, 403, 'Cannot ban admin', ErrorCodes.FORBIDDEN);
    }

    await user.update({ banned: !user.banned });
    return sendSuccess(res, 200, `User ${user.banned ? 'banned' : 'unbanned'} successfully`, { user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/admin/cities
 * Creates a new city.
 */
const createCity = async (req, res, next) => {
  try {
    const city = await City.create(req.body);
    return sendSuccess(res, 201, 'City created successfully', { city });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/admin/cities/:cityId
 * Updates an existing city.
 */
const updateCity = async (req, res, next) => {
  try {
    const city = await City.findByPk(req.params.cityId);
    if (!city) return sendError(res, 404, 'City not found', ErrorCodes.NOT_FOUND);

    await city.update(req.body);
    return sendSuccess(res, 200, 'City updated successfully', { city });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/cities/:cityId
 * Permanently deletes a city from the platform.
 */
const deleteCity = async (req, res, next) => {
  try {
    const city = await City.findByPk(req.params.cityId);
    if (!city) return sendError(res, 404, 'City not found', ErrorCodes.NOT_FOUND);

    await city.destroy();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/admin/activities
 * Creates a new activity.
 */
const createActivity = async (req, res, next) => {
  try {
    const activity = await Activity.create(req.body);
    return sendSuccess(res, 201, 'Activity created successfully', { activity });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/admin/activities/:activityId
 * Updates an existing activity.
 */
const updateActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findByPk(req.params.activityId);
    if (!activity) return sendError(res, 404, 'Activity not found', ErrorCodes.NOT_FOUND);

    await activity.update(req.body);
    return sendSuccess(res, 200, 'Activity updated successfully', { activity });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/activities/:activityId
 * Permanently deletes an activity from the platform.
 */
const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findByPk(req.params.activityId);
    if (!activity) return sendError(res, 404, 'Activity not found', ErrorCodes.NOT_FOUND);

    await activity.destroy();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/cities
 * Returns all cities for management.
 */
const getAllCities = async (req, res, next) => {
  try {
    const cities = await City.findAll({
      order: [['name', 'ASC']],
    });
    return sendSuccess(res, 200, 'All cities retrieved', { cities });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/activities
 * Returns all activities for management.
 */
const getAllActivities = async (req, res, next) => {
  try {
    const activities = await Activity.findAll({
      include: [{ model: City, as: 'city', attributes: ['name', 'country'] }],
      order: [['name', 'ASC']],
    });
    return sendSuccess(res, 200, 'All activities retrieved', { activities });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats,
  getAllUsers,
  deleteUser,
  banUser,
  getAllTrips,
  getTopCities,
  getTopActivities,
  getAllCities,
  getAllActivities,
  createCity,
  updateCity,
  deleteCity,
  createActivity,
  updateActivity,
  deleteActivity,
};
