'use strict';

const express = require('express');
const router = express.Router();
const { publishTrip, unpublishTrip, getPublicItinerary, copyPublicItinerary } = require('../controllers/share.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Share
 *   description: Public trip sharing
 */

/**
 * @swagger
 * /share/trips/{tripId}/publish:
 *   post:
 *     summary: Make a trip public (generates shareable link)
 *     tags: [Share]
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Trip published with share URL }
 */
router.post('/trips/:tripId/publish', authenticate, publishTrip);

/**
 * @swagger
 * /share/trips/{tripId}/unpublish:
 *   post:
 *     summary: Make a trip private (revokes shareable link)
 *     tags: [Share]
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Trip unpublished }
 */
router.post('/trips/:tripId/unpublish', authenticate, unpublishTrip);

/**
 * @swagger
 * /share/itinerary/{slug}:
 *   get:
 *     summary: Get a public itinerary by slug
 *     tags: [Share]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Public itinerary }
 *       404: { description: Not found }
 */
router.get('/itinerary/:slug', getPublicItinerary);

/**
 * @swagger
 * /share/itinerary/{slug}/copy:
 *   post:
 *     summary: Copy a public itinerary to your trips
 *     tags: [Share]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Trip copied }
 */
router.post('/itinerary/:slug/copy', authenticate, copyPublicItinerary);

module.exports = router;
