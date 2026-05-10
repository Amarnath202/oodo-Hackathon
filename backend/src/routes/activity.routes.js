'use strict';

const express = require('express');
const router = express.Router();
const { getActivities, getActivityById, getStopActivities, addActivityToStop, removeActivityFromStop } = require('../controllers/activity.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { addActivityToStopSchema } = require('../validations/activity.validation');

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Activity catalog and stop-activity management
 */

/**
 * @swagger
 * /activities:
 *   get:
 *     summary: Get all activities (search + filter + paginate)
 *     tags: [Activities]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sightseeing, food, adventure, shopping, culture, wellness]
 *       - in: query
 *         name: city_id
 *         schema: { type: string }
 *     responses:
 *       200: { description: Activities list }
 */
router.get('/', getActivities);

/**
 * @swagger
 * /activities/{activityId}:
 *   get:
 *     summary: Get activity by ID
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Activity details }
 */
router.get('/:activityId', getActivityById);

/**
 * @swagger
 * /activities/stops/{stopId}/activities:
 *   get:
 *     summary: Get all activities for a stop
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: stopId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of activities for the stop }
 */
router.get('/stops/:stopId/activities', authenticate, getStopActivities);

/**
 * @swagger
 * /activities/stops/{stopId}/activities:
 *   post:
 *     summary: Add an activity to a stop
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: stopId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [activity_id]
 *             properties:
 *               activity_id: { type: string }
 *               scheduled_time: { type: string, example: "09:00" }
 *     responses:
 *       201: { description: Activity added to stop }
 */
router.post('/stops/:stopId/activities', authenticate, validate(addActivityToStopSchema), addActivityToStop);

/**
 * @swagger
 * /activities/stops/{stopId}/activities/{activityId}:
 *   delete:
 *     summary: Remove an activity from a stop
 *     tags: [Activities]
 *     responses:
 *       204: { description: Activity removed }
 */
router.delete('/stops/:stopId/activities/:activityId', authenticate, removeActivityFromStop);

module.exports = router;
