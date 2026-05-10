'use strict';

const { User, SavedDestination, City } = require('../models');
const { sendSuccess, sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');

/**
 * GET /api/v1/users/me
 * Returns the authenticated user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'google_id', 'is_deleted'] },
    });

    return sendSuccess(res, 200, 'Profile retrieved successfully', { user });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/users/me
 * Updates the authenticated user's profile.
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, language_preference } = req.body;

    const user = await User.findByPk(req.user.id);
    const updates = {};
    if (name) updates.name = name;
    if (language_preference) updates.language_preference = language_preference;

    await user.update(updates);

    return sendSuccess(res, 200, 'Profile updated successfully', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        language_preference: user.language_preference,
        profile_photo: user.profile_photo,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/users/me
 * Soft deletes the authenticated user's account.
 */
const deleteMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    await user.update({ is_deleted: true });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/users/me/photo
 * Updates the user's profile photo via Multer upload.
 */
const updatePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(
        res, 400,
        'No file uploaded',
        ErrorCodes.REQUIRED,
        'file',
        'A photo file is required'
      );
    }

    const photoPath = `/uploads/${req.file.filename}`;
    const user = await User.findByPk(req.user.id);
    await user.update({ profile_photo: photoPath });

    return sendSuccess(res, 200, 'Profile photo updated successfully', {
      profile_photo: photoPath,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/users/me/saved-destinations
 * Returns all saved destinations for the authenticated user.
 */
const getSavedDestinations = async (req, res, next) => {
  try {
    const saved = await SavedDestination.findAll({
      where: { user_id: req.user.id },
      include: [{ model: City, as: 'city' }],
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(res, 200, 'Saved destinations retrieved', { destinations: saved });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/users/me/saved-destinations
 * Saves a city to the user's destinations.
 */
const saveDestination = async (req, res, next) => {
  try {
    const { city_id } = req.body;
    const { v4: uuidv4 } = require('uuid');

    const city = await City.findByPk(city_id);
    if (!city) {
      return sendError(res, 404, 'City not found', ErrorCodes.NOT_FOUND, 'city_id', 'The specified city does not exist');
    }

    const existing = await SavedDestination.findOne({
      where: { user_id: req.user.id, city_id },
    });
    if (existing) {
      return sendError(
        res, 409,
        'Already saved',
        ErrorCodes.ALREADY_EXISTS,
        'city_id',
        'This destination is already in your saved list'
      );
    }

    const saved = await SavedDestination.create({
      id: uuidv4(),
      user_id: req.user.id,
      city_id,
    });

    const result = await SavedDestination.findByPk(saved.id, {
      include: [{ model: City, as: 'city' }],
    });

    return sendSuccess(res, 201, 'Destination saved successfully', { destination: result });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/users/me/saved-destinations/:cityId
 * Removes a city from the user's saved destinations.
 */
const removeSavedDestination = async (req, res, next) => {
  try {
    const { cityId } = req.params;

    const deleted = await SavedDestination.destroy({
      where: { user_id: req.user.id, city_id: cityId },
    });

    if (!deleted) {
      return sendError(
        res, 404,
        'Saved destination not found',
        ErrorCodes.NOT_FOUND,
        null,
        'This destination is not in your saved list'
      );
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, deleteMe, updatePhoto, getSavedDestinations, saveDestination, removeSavedDestination };
