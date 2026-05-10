'use strict';

const { sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');

/**
 * Ensures the authenticated user has the 'admin' role.
 * Must be chained AFTER authenticate middleware.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(
      res, 403,
      'Admin access required',
      ErrorCodes.FORBIDDEN,
      null,
      'You do not have permission to perform this action'
    );
  }
  next();
};

module.exports = { requireAdmin };
