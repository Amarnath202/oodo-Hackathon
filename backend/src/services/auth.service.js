'use strict';

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { RefreshToken, PasswordResetToken } = require('../models');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/token.util');

/**
 * Generates an access + refresh token pair and stores refresh token in DB.
 * @param {object} user - User model instance
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokenPair = async (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshToken.create({
    id: uuidv4(),
    user_id: user.id,
    token: refreshToken,
    expires_at: expiresAt,
  });

  return { accessToken, refreshToken };
};

/**
 * Validates a refresh token from the DB and returns a new access token.
 * @param {string} token - Refresh token string
 * @returns {{ accessToken: string, user: object }}
 */
const rotateRefreshToken = async (token) => {
  const storedToken = await RefreshToken.findOne({ where: { token } });

  if (!storedToken) {
    const err = new Error('Refresh token not found or already revoked');
    err.statusCode = 401;
    err.code = 'TOKEN_INVALID';
    throw err;
  }

  if (new Date() > storedToken.expires_at) {
    await storedToken.destroy();
    const err = new Error('Refresh token has expired');
    err.statusCode = 401;
    err.code = 'TOKEN_EXPIRED';
    throw err;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (e) {
    await storedToken.destroy();
    const err = new Error('Invalid refresh token');
    err.statusCode = 401;
    err.code = 'TOKEN_INVALID';
    throw err;
  }

  const accessToken = signAccessToken({ id: decoded.id, email: decoded.email, role: decoded.role });
  return { accessToken, userId: decoded.id };
};

/**
 * Revokes a specific refresh token by deleting from DB.
 * @param {string} token - Refresh token string
 */
const revokeRefreshToken = async (token) => {
  await RefreshToken.destroy({ where: { token } });
};

/**
 * Revokes ALL refresh tokens for a user (e.g. after password reset).
 * @param {string} userId
 */
const revokeAllUserTokens = async (userId) => {
  await RefreshToken.destroy({ where: { user_id: userId } });
};

/**
 * Creates a password reset token (crypto, 1hr expiry) and stores in DB.
 * @param {string} userId
 * @returns {string} Raw token (to be sent via email)
 */
const createPasswordResetToken = async (userId) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Invalidate any existing reset tokens for this user
  await PasswordResetToken.destroy({ where: { user_id: userId, is_used: false } });

  await PasswordResetToken.create({
    id: uuidv4(),
    user_id: userId,
    token: rawToken,
    expires_at: expiresAt,
  });

  return rawToken;
};

/**
 * Validates a password reset token.
 * @param {string} token
 * @returns {object} PasswordResetToken record
 */
const validatePasswordResetToken = async (token) => {
  const record = await PasswordResetToken.findOne({
    where: {
      token,
      is_used: false,
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!record) {
    const err = new Error('Password reset token is invalid or has expired');
    err.statusCode = 400;
    err.code = 'TOKEN_INVALID';
    err.field = 'token';
    throw err;
  }

  return record;
};

module.exports = {
  generateTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  createPasswordResetToken,
  validatePasswordResetToken,
};
