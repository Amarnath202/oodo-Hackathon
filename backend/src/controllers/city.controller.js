'use strict';

const { Op } = require('sequelize');
const { City, Activity } = require('../models');
const { sendSuccess, sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');
const { paginate } = require('../utils/paginate.util');

/**
 * GET /api/v1/cities
 * Returns paginated city list with optional search and region filters.
 */
const getCities = async (req, res, next) => {
  try {
    const { search, region, country, cost_index } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { country: { [Op.like]: `%${search}%` } },
      ];
    }
    if (region) where.region = region;
    if (country) where.country = { [Op.like]: `%${country}%` };
    if (cost_index) where.cost_index = cost_index;

    const totalCount = await City.count({ where });
    const { limit, offset, pagination } = paginate(req.query, totalCount);

    const cities = await City.findAll({
      where,
      order: [['popularity_score', 'DESC'], ['name', 'ASC']],
      limit,
      offset,
    });

    return sendSuccess(res, 200, 'Cities retrieved successfully', { cities }, pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/cities/:cityId
 * Returns a single city by ID.
 */
const getCityById = async (req, res, next) => {
  try {
    const city = await City.findByPk(req.params.cityId);

    if (!city) {
      return sendError(res, 404, 'City not found', ErrorCodes.NOT_FOUND, null, 'No city found with the provided ID');
    }

    return sendSuccess(res, 200, 'City retrieved successfully', { city });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/cities/:cityId/activities
 * Returns all activities for a specific city.
 */
const getCityActivities = async (req, res, next) => {
  try {
    const city = await City.findByPk(req.params.cityId);
    if (!city) {
      return sendError(res, 404, 'City not found', ErrorCodes.NOT_FOUND, null, 'No city found with the provided ID');
    }

    const { type } = req.query;
    const where = { city_id: req.params.cityId };
    if (type) where.type = type;

    const totalCount = await Activity.count({ where });
    const { limit, offset, pagination } = paginate(req.query, totalCount);

    const activities = await Activity.findAll({
      where,
      order: [['type', 'ASC'], ['name', 'ASC']],
      limit,
      offset,
    });

    return sendSuccess(res, 200, 'City activities retrieved successfully', { city, activities }, pagination);
  } catch (err) {
    next(err);
  }
};

module.exports = { getCities, getCityById, getCityActivities };
