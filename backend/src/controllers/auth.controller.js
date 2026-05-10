'use strict';

const { v4: uuidv4 } = require('uuid');
const { User } = require('../models');
const { hashPassword, comparePassword } = require('../utils/hash.util');
const { sendSuccess, sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');
const authService = require('../services/auth.service');
const emailService = require('../services/email.service');

/**
 * POST /api/v1/auth/register
 * Registers a new user with email + password.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return sendError(
        res, 409,
        'Email already registered',
        ErrorCodes.ALREADY_EXISTS,
        'email',
        'An account with this email already exists'
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    const { accessToken, refreshToken } = await authService.generateTokenPair(user);

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(user.email, user.name).catch(() => {});

    return sendSuccess(res, 201, 'Account created successfully', {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_photo: user.profile_photo,
        language_preference: user.language_preference,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/login
 * Authenticates user with email + password.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendError(
        res, 404,
        'Account not found',
        ErrorCodes.NOT_FOUND,
        'email',
        'No account found with this email address'
      );
    }

    if (user.is_deleted) {
      return sendError(
        res, 403,
        'Account deactivated',
        ErrorCodes.ACCOUNT_DEACTIVATED,
        null,
        'This account has been deactivated'
      );
    }

    if (user.banned) {
      return sendError(
        res, 403,
        'Account suspended',
        ErrorCodes.ACCOUNT_BANNED,
        null,
        'This account has been suspended'
      );
    }

    if (!user.password) {
      return sendError(
        res, 401,
        'Password login not available',
        ErrorCodes.INVALID_CREDENTIALS,
        'password',
        'This account uses Google sign-in. Please login with Google.'
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return sendError(
        res, 401,
        'Incorrect password',
        ErrorCodes.INVALID_CREDENTIALS,
        'password',
        'Incorrect password. Please try again'
      );
    }

    const { accessToken, refreshToken } = await authService.generateTokenPair(user);

    return sendSuccess(res, 200, 'Login successful', {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_photo: user.profile_photo,
        language_preference: user.language_preference,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/refresh-token
 * Issues a new access token using a valid refresh token.
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const { accessToken } = await authService.rotateRefreshToken(token);

    return sendSuccess(res, 200, 'Access token refreshed', { accessToken });
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, err.statusCode, err.message, err.code, 'token', err.message);
    }
    next(err);
  }
};

/**
 * POST /api/v1/auth/logout
 * Revokes the refresh token.
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await authService.revokeRefreshToken(token);
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/forgot-password
 * Sends a password reset email. Always returns success for security.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    // Always respond success to prevent email enumeration
    if (!user || user.is_deleted) {
      return sendSuccess(res, 200, 'If that email exists, a reset link has been sent');
    }

    const token = await authService.createPasswordResetToken(user.id);
    await emailService.sendPasswordResetEmail(user.email, user.name, token);

    return sendSuccess(res, 200, 'If that email exists, a reset link has been sent');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/reset-password
 * Resets the user password using a valid reset token.
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const resetRecord = await authService.validatePasswordResetToken(token);

    const user = await User.findByPk(resetRecord.user_id);
    if (!user) {
      return sendError(res, 404, 'User not found', ErrorCodes.NOT_FOUND, null, 'Associated user account not found');
    }

    const hashedPassword = await hashPassword(password);
    await user.update({ password: hashedPassword });

    // Mark token as used
    await resetRecord.update({ is_used: true });

    // Revoke all refresh tokens for security
    await authService.revokeAllUserTokens(user.id);

    return sendSuccess(res, 200, 'Password reset successfully. Please login with your new password.');
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, err.statusCode, err.message, err.code, err.field, err.message);
    }
    next(err);
  }
};

/**
 * GET /api/v1/auth/google/callback
 * Handles the Google OAuth callback, issues JWT tokens.
 */
const googleCallback = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    const { accessToken, refreshToken } = await authService.generateTokenPair(user);

    return res.redirect(
      `${process.env.CLIENT_URL}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refreshToken, logout, forgotPassword, resetPassword, googleCallback };
