'use strict';

const express = require('express');
const router = express.Router();
const { getMe, updateMe, deleteMe, updatePhoto, getSavedDestinations, saveDestination, removeSavedDestination } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Users]
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Unauthorized }
 */
router.get('/me', authenticate, getMe);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               language_preference: { type: string }
 *     responses:
 *       200: { description: Profile updated }
 */
router.put('/me', authenticate, updateMe);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Soft delete user account
 *     tags: [Users]
 *     responses:
 *       204: { description: Account deleted }
 */
router.delete('/me', authenticate, deleteMe);

/**
 * @swagger
 * /users/me/photo:
 *   put:
 *     summary: Upload profile photo
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: Photo updated }
 */
router.put('/me/photo', authenticate, upload('photo'), updatePhoto);

/**
 * @swagger
 * /users/me/saved-destinations:
 *   get:
 *     summary: Get user's saved destinations
 *     tags: [Users]
 *     responses:
 *       200: { description: List of saved destinations }
 */
router.get('/me/saved-destinations', authenticate, getSavedDestinations);

/**
 * @swagger
 * /users/me/saved-destinations:
 *   post:
 *     summary: Save a destination
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [city_id]
 *             properties:
 *               city_id: { type: string, format: uuid }
 *     responses:
 *       201: { description: Destination saved }
 */
router.post('/me/saved-destinations', authenticate, saveDestination);

/**
 * @swagger
 * /users/me/saved-destinations/{cityId}:
 *   delete:
 *     summary: Remove a saved destination
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: cityId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Destination removed }
 */
router.delete('/me/saved-destinations/:cityId', authenticate, removeSavedDestination);

module.exports = router;
