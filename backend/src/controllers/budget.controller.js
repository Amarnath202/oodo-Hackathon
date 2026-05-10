'use strict';

const { Budget, Trip } = require('../models');
const { sendSuccess, sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');
const { updateBudgetFields } = require('../services/budget.service');

/** Verifies trip ownership */
const getOwnedTrip = async (tripId, userId) =>
  Trip.findOne({ where: { id: tripId, user_id: userId, is_deleted: false } });

/**
 * GET /api/v1/trips/:tripId/budget
 * Returns the trip budget.
 */
const getBudget = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found with the provided ID');

    const budget = await Budget.findOne({ where: { trip_id: req.params.tripId } });
    if (!budget) return sendError(res, 404, 'Budget not found', ErrorCodes.NOT_FOUND, null, 'Budget record not found for this trip');

    return sendSuccess(res, 200, 'Budget retrieved successfully', { budget });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/trips/:tripId/budget
 * Updates budget cost fields and auto-recalculates total.
 */
const updateBudget = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found with the provided ID');

    const budget = await updateBudgetFields(req.params.tripId, req.body);

    return sendSuccess(res, 200, 'Budget updated successfully', { budget });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/trips/:tripId/budget/summary
 * Returns a budget breakdown summary with percentage allocations.
 */
const getBudgetSummary = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found with the provided ID');

    const budget = await Budget.findOne({ where: { trip_id: req.params.tripId } });
    if (!budget) return sendError(res, 404, 'Budget not found', ErrorCodes.NOT_FOUND, null, 'Budget not found');

    const total = parseFloat(budget.total_cost) || 0;
    const pct = (val) => total > 0 ? ((parseFloat(val) / total) * 100).toFixed(1) : '0.0';

    const summary = {
      budget,
      breakdown: {
        transport: { cost: budget.transport_cost, percentage: pct(budget.transport_cost) },
        stay: { cost: budget.stay_cost, percentage: pct(budget.stay_cost) },
        activities: { cost: budget.activity_cost, percentage: pct(budget.activity_cost) },
        meals: { cost: budget.meal_cost, percentage: pct(budget.meal_cost) },
      },
      remaining: budget.budget_limit
        ? (parseFloat(budget.budget_limit) - total).toFixed(2)
        : null,
    };

    return sendSuccess(res, 200, 'Budget summary retrieved', { summary });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBudget, updateBudget, getBudgetSummary };
