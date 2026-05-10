'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const { getStops, createStop, updateStop, deleteStop, reorderStops } = require('../controllers/stop.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createStopSchema, updateStopSchema, reorderStopsSchema } = require('../validations/stop.validation');

/**
 * @swagger
 * tags:
 *   name: Stops
 *   description: Trip itinerary stop management
 */

/**
 * @swagger
 * /trips/{tripId}/stops:
 *   get:
 *     summary: Get all stops for a trip
 *     tags: [Stops]
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of stops ordered by index }
 */
router.get('/', authenticate, getStops);

/**
 * @swagger
 * /trips/{tripId}/stops:
 *   post:
 *     summary: Add a stop to the itinerary
 *     tags: [Stops]
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [city_id, order_index, start_date, end_date]
 *             properties:
 *               city_id: { type: string }
 *               order_index: { type: integer }
 *               start_date: { type: string, format: date }
 *               end_date: { type: string, format: date }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Stop created }
 */
router.post('/', authenticate, validate(createStopSchema), createStop);

/**
 * @swagger
 * /trips/{tripId}/stops/reorder:
 *   patch:
 *     summary: Reorder stops
 *     tags: [Stops]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     order_index: { type: integer }
 *     responses:
 *       200: { description: Stops reordered }
 */
router.patch('/reorder', authenticate, validate(reorderStopsSchema), reorderStops);

/**
 * @swagger
 * /trips/{tripId}/stops/{stopId}:
 *   put:
 *     summary: Update a stop
 *     tags: [Stops]
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: stopId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Stop updated }
 */
router.put('/:stopId', authenticate, validate(updateStopSchema), updateStop);

/**
 * @swagger
 * /trips/{tripId}/stops/{stopId}:
 *   delete:
 *     summary: Delete a stop
 *     tags: [Stops]
 *     responses:
 *       204: { description: Stop deleted }
 */
router.delete('/:stopId', authenticate, deleteStop);

module.exports = router;
