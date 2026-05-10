'use strict';

const express = require('express');
const router = express.Router();
const { getCities, getCityById, getCityActivities } = require('../controllers/city.controller');

/**
 * @swagger
 * tags:
 *   name: Cities
 *   description: City catalog (public)
 */

/**
 * @swagger
 * /cities:
 *   get:
 *     summary: Get all cities (search + filter + paginate)
 *     tags: [Cities]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: region
 *         schema: { type: string }
 *       - in: query
 *         name: country
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated city list }
 */
router.get('/', getCities);

/**
 * @swagger
 * /cities/{cityId}:
 *   get:
 *     summary: Get a city by ID
 *     tags: [Cities]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: cityId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: City details }
 *       404: { description: City not found }
 */
router.get('/:cityId', getCityById);

/**
 * @swagger
 * /cities/{cityId}/activities:
 *   get:
 *     summary: Get activities for a city
 *     tags: [Cities]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: cityId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sightseeing, food, adventure, shopping, culture, wellness]
 *     responses:
 *       200: { description: City activities }
 */
router.get('/:cityId/activities', getCityActivities);

module.exports = router;
