'use strict';

const express = require('express');
const router = express.Router();
const { getTrips, createTrip, getTripById, updateTrip, deleteTrip, uploadCoverPhoto } = require('../controllers/trip.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const { createTripSchema, updateTripSchema } = require('../validations/trip.validation');

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Travel trip management
 */

// Basic CRUD
router.get('/', authenticate, getTrips);
router.post('/', authenticate, validate(createTripSchema), createTrip);

// Specific Trip Operations - MOVED UP TO ENSURE MATCHING
router.post('/:tripId/cover', authenticate, upload('cover'), uploadCoverPhoto);

router.get('/:tripId', authenticate, getTripById);
router.put('/:tripId', authenticate, validate(updateTripSchema), updateTrip);
router.delete('/:tripId', authenticate, deleteTrip);

module.exports = router;
