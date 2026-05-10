'use strict';

const { sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');

/**
 * Global Express error handler.
 * Catches all errors passed via next(err).
 * Maps common error types to appropriate HTTP responses.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[Error]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const field = err.errors[0]?.path || null;
    return sendError(res, 400, 'Database validation error', ErrorCodes.VALIDATION_ERROR, field, err.errors[0]?.message);
  }

  // Sequelize unique constraint violation
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || null;
    return sendError(res, 409, 'Resource already exists', ErrorCodes.ALREADY_EXISTS, field, `${field} is already in use`);
  }

  // Sequelize FK constraint violation
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return sendError(res, 400, 'Invalid reference', ErrorCodes.VALIDATION_ERROR, null, 'Referenced resource does not exist');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token', ErrorCodes.TOKEN_INVALID, 'token', 'The provided token is invalid');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired', ErrorCodes.TOKEN_EXPIRED, 'token', 'Your session has expired. Please login again');
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 413, 'File too large', ErrorCodes.FILE_TOO_LARGE, 'file', 'File must not exceed 5MB');
  }

  // Application-level errors with custom status
  if (err.statusCode) {
    return sendError(res, err.statusCode, err.message, err.code || ErrorCodes.SERVER_ERROR, err.field || null, err.details || null);
  }

  // Unknown errors
  return sendError(
    res, 500,
    'Internal server error',
    ErrorCodes.SERVER_ERROR,
    null,
    process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  );
};

module.exports = { errorHandler };
