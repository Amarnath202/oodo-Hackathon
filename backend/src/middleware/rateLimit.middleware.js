'use strict';

const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');

const rateLimitHandler = (req, res) => {
  return sendError(
    res, 429,
    'Too many requests',
    ErrorCodes.VALIDATION_ERROR,
    null,
    'You have exceeded the request limit. Please wait before trying again.'
  );
};

const isDev = process.env.NODE_ENV === 'development';

/** Auth routes: 10 requests per 15 minutes (1000 in dev) */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** General routes: 100 requests per 15 minutes (5000 in dev) */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** Admin routes: 50 requests per 15 minutes (1000 in dev) */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

module.exports = { authLimiter, generalLimiter, adminLimiter };
