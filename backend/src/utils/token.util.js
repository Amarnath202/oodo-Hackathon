'use strict';

const jwt = require('jsonwebtoken');

/**
 * Signs a JWT access token (15 min expiry).
 * @param {object} payload - Data to encode
 * @returns {string} Signed JWT
 */
const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  });
};

/**
 * Signs a JWT refresh token (7 day expiry).
 * @param {object} payload - Data to encode
 * @returns {string} Signed JWT
 */
const signRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  });
};

/**
 * Verifies a JWT access token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws jwt.JsonWebTokenError | jwt.TokenExpiredError
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

/**
 * Verifies a JWT refresh token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws jwt.JsonWebTokenError | jwt.TokenExpiredError
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
