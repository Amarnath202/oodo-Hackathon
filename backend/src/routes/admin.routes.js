'use strict';

const express = require('express');
const router = express.Router();
const { 
  getStats, 
  getAllUsers, 
  deleteUser, 
  banUser, 
  getAllTrips, 
  getTopCities, 
  getTopActivities,
  getAllCities,
  getAllActivities,
  createCity,
  updateCity,
  deleteCity,
  createActivity,
  updateActivity,
  deleteActivity 
} = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const { adminLimiter } = require('../middleware/rateLimit.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only platform management
 */

router.use(adminLimiter, authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:userId', deleteUser);
router.post('/users/:userId/ban', banUser);
router.get('/trips', getAllTrips);

// City Management
router.get('/cities', getAllCities);
router.get('/cities/top', getTopCities);
router.post('/cities', createCity);
router.put('/cities/:cityId', updateCity);
router.delete('/cities/:cityId', deleteCity);

// Activity Management
router.get('/activities', getAllActivities);
router.get('/activities/top', getTopActivities);
router.post('/activities', createActivity);
router.put('/activities/:activityId', updateActivity);
router.delete('/activities/:activityId', deleteActivity);

module.exports = router;
