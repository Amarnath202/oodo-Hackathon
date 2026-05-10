'use strict';

const { Budget, StopActivity, Activity, Stop } = require('../models');

/**
 * Recalculates the activity_cost field of a trip's budget
 * by summing all activity costs across all stops.
 * Then updates total_cost and is_over_budget, emits socket events.
 *
 * @param {string} tripId
 */
const recalculateBudget = async (tripId) => {
  // Find or create the budget record
  let budget = await Budget.findOne({ where: { trip_id: tripId } });
  if (!budget) return;

  // Sum activity costs from all stop activities in this trip
  const stops = await Stop.findAll({ where: { trip_id: tripId }, attributes: ['id'] });
  const stopIds = stops.map((s) => s.id);

  let activityCostTotal = 0;

  if (stopIds.length > 0) {
    const stopActivities = await StopActivity.findAll({
      where: { stop_id: stopIds },
      include: [{ model: Activity, as: 'activity', attributes: ['cost'] }],
    });

    activityCostTotal = stopActivities.reduce((sum, sa) => {
      return sum + parseFloat(sa.activity?.cost || 0);
    }, 0);
  }

  const total =
    parseFloat(budget.transport_cost) +
    parseFloat(budget.stay_cost) +
    activityCostTotal +
    parseFloat(budget.meal_cost);

  const isOverBudget = budget.budget_limit ? total > parseFloat(budget.budget_limit) : false;
  const overBy = isOverBudget ? total - parseFloat(budget.budget_limit) : 0;

  await budget.update({
    activity_cost: activityCostTotal.toFixed(2),
    total_cost: total.toFixed(2),
    is_over_budget: isOverBudget,
  });

  // Reload fresh budget data
  budget = await Budget.findOne({ where: { trip_id: tripId } });

  // Emit real-time budget update
  try {
    const { getIO } = require('../config/socket.config');
    const io = getIO();
    io.to(`trip:${tripId}`).emit('budget:updated', { budget });

    if (isOverBudget) {
      io.to(`trip:${tripId}`).emit('budget:alert', {
        message: `This trip exceeds your budget limit by ₹${overBy.toFixed(2)}`,
        overBy: parseFloat(overBy.toFixed(2)),
        code: 'BUDGET_EXCEEDED',
      });
    }
  } catch {
    // Socket may not be initialized in test contexts — non-fatal
  }

  return budget;
};

/**
 * Updates a budget's manual cost fields and recalculates total.
 * @param {string} tripId
 * @param {object} data - { transport_cost, stay_cost, meal_cost, budget_limit }
 */
const updateBudgetFields = async (tripId, data) => {
  let budget = await Budget.findOne({ where: { trip_id: tripId } });
  if (!budget) {
    const { v4: uuidv4 } = require('uuid');
    budget = await Budget.create({ id: uuidv4(), trip_id: tripId });
  }

  const updates = {};
  if (data.transport_cost !== undefined) updates.transport_cost = data.transport_cost;
  if (data.stay_cost !== undefined) updates.stay_cost = data.stay_cost;
  if (data.meal_cost !== undefined) updates.meal_cost = data.meal_cost;
  if (data.budget_limit !== undefined) updates.budget_limit = data.budget_limit;

  await budget.update(updates);
  return recalculateBudget(tripId);
};

module.exports = { recalculateBudget, updateBudgetFields };
