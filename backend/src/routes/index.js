'use strict';

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const tripRoutes = require('./trip.routes');
const stopRoutes = require('./stop.routes');
const activityRoutes = require('./activity.routes');
const cityRoutes = require('./city.routes');
const budgetRoutes = require('./budget.routes');
const checklistRoutes = require('./checklist.routes');
const noteRoutes = require('./note.routes');
const shareRoutes = require('./share.routes');
const adminRoutes = require('./admin.routes');

// Mount all route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/trips', tripRoutes);
router.use('/trips/:tripId/stops', stopRoutes);
router.use('/trips/:tripId/budget', budgetRoutes);
router.use('/trips/:tripId/checklist', checklistRoutes);
router.use('/trips/:tripId/notes', noteRoutes);
router.use('/activities', activityRoutes);
router.use('/cities', cityRoutes);
router.use('/share', shareRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
