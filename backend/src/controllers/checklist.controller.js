'use strict';

const { v4: uuidv4 } = require('uuid');
const { Checklist, ChecklistItem, Trip } = require('../models');
const { sendSuccess, sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');

const getOwnedTrip = async (tripId, userId) =>
  Trip.findOne({ where: { id: tripId, user_id: userId, is_deleted: false } });

/**
 * GET /api/v1/trips/:tripId/checklist
 * Returns the checklist with all items.
 */
const getChecklist = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const checklist = await Checklist.findOne({
      where: { trip_id: req.params.tripId },
      include: [{ model: ChecklistItem, as: 'items', order: [['createdAt', 'ASC']] }],
    });

    if (!checklist) return sendError(res, 404, 'Checklist not found', ErrorCodes.NOT_FOUND, null, 'Checklist not found for this trip');

    return sendSuccess(res, 200, 'Checklist retrieved successfully', { checklist });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/trips/:tripId/checklist/items
 * Adds a new item to the checklist.
 */
const addChecklistItem = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const checklist = await Checklist.findOne({ where: { trip_id: req.params.tripId } });
    if (!checklist) return sendError(res, 404, 'Checklist not found', ErrorCodes.NOT_FOUND, null, 'Checklist not found');

    const { name, category } = req.body;
    const item = await ChecklistItem.create({
      id: uuidv4(),
      checklist_id: checklist.id,
      name,
      category,
    });

    return sendSuccess(res, 201, 'Checklist item added successfully', { item });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/trips/:tripId/checklist/items/:itemId
 * Updates a checklist item (name, category, or packed status).
 */
const updateChecklistItem = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const item = await ChecklistItem.findByPk(req.params.itemId);
    if (!item) return sendError(res, 404, 'Item not found', ErrorCodes.NOT_FOUND, null, 'Checklist item not found');

    await item.update(req.body);

    return sendSuccess(res, 200, 'Checklist item updated successfully', { item });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/trips/:tripId/checklist/items/:itemId
 * Deletes a checklist item.
 */
const deleteChecklistItem = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const deleted = await ChecklistItem.destroy({ where: { id: req.params.itemId } });
    if (!deleted) return sendError(res, 404, 'Item not found', ErrorCodes.NOT_FOUND, null, 'Checklist item not found');

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/trips/:tripId/checklist/reset
 * Resets all items to unpacked status.
 */
const resetChecklist = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const checklist = await Checklist.findOne({ where: { trip_id: req.params.tripId } });
    if (!checklist) return sendError(res, 404, 'Checklist not found', ErrorCodes.NOT_FOUND, null, 'Checklist not found');

    await ChecklistItem.update({ is_packed: false }, { where: { checklist_id: checklist.id } });

    const updated = await Checklist.findByPk(checklist.id, {
      include: [{ model: ChecklistItem, as: 'items' }],
    });

    return sendSuccess(res, 200, 'Checklist reset successfully', { checklist: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { getChecklist, addChecklistItem, updateChecklistItem, deleteChecklistItem, resetChecklist };
