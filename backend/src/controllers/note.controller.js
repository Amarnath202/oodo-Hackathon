'use strict';

const { v4: uuidv4 } = require('uuid');
const { Note, Trip } = require('../models');
const { sendSuccess, sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');
const { emitToTrip } = require('../services/socket.service');

const getOwnedTrip = async (tripId, userId) =>
  Trip.findOne({ where: { id: tripId, user_id: userId, is_deleted: false } });

/**
 * GET /api/v1/trips/:tripId/notes
 * Returns all notes for a trip, sorted by most recent.
 */
const getNotes = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const notes = await Note.findAll({
      where: { trip_id: req.params.tripId },
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(res, 200, 'Notes retrieved successfully', { notes });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/trips/:tripId/notes
 * Creates a new note for a trip (optionally linked to a stop).
 */
const createNote = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const { content, stop_id } = req.body;

    const note = await Note.create({
      id: uuidv4(),
      trip_id: req.params.tripId,
      stop_id: stop_id || null,
      content,
    });

    emitToTrip(req.params.tripId, 'note:added', { note });

    return sendSuccess(res, 201, 'Note created successfully', { note });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/trips/:tripId/notes/:noteId
 * Updates a note's content.
 */
const updateNote = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const note = await Note.findOne({ where: { id: req.params.noteId, trip_id: req.params.tripId } });
    if (!note) return sendError(res, 404, 'Note not found', ErrorCodes.NOT_FOUND, null, 'Note not found');

    await note.update({ content: req.body.content });
    emitToTrip(req.params.tripId, 'note:updated', { note });

    return sendSuccess(res, 200, 'Note updated successfully', { note });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/trips/:tripId/notes/:noteId
 * Deletes a note.
 */
const deleteNote = async (req, res, next) => {
  try {
    const trip = await getOwnedTrip(req.params.tripId, req.user.id);
    if (!trip) return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found');

    const deleted = await Note.destroy({ where: { id: req.params.noteId, trip_id: req.params.tripId } });
    if (!deleted) return sendError(res, 404, 'Note not found', ErrorCodes.NOT_FOUND, null, 'Note not found');

    emitToTrip(req.params.tripId, 'note:deleted', { noteId: req.params.noteId });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
