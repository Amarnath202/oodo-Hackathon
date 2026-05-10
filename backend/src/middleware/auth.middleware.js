'use strict';

const { verifyAccessToken } = require('../utils/token.util');
const { sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');
const { User } = require('../models');

/**
 * Verifies JWT access token from Authorization header.
 * Attaches decoded user to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(
        res, 401,
        'Authentication required',
        ErrorCodes.UNAUTHORIZED,
        null,
        'You must be logged in to access this resource'
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Fetch fresh user to ensure account still active
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role', 'is_deleted'],
    });

    if (!user) {
      return sendError(
        res, 401,
        'User not found',
        ErrorCodes.UNAUTHORIZED,
        null,
        'The account associated with this token no longer exists'
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

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(
        res, 401,
        'Token expired',
        ErrorCodes.TOKEN_EXPIRED,
        'token',
        'Your session has expired. Please login again'
      );
    }
    return sendError(
      res, 401,
      'Invalid token',
      ErrorCodes.TOKEN_INVALID,
      'token',
      'The provided token is invalid'
    );
  }
};

module.exports = { authenticate };
