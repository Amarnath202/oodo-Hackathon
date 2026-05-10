'use strict';

/**
 * All machine-readable error codes used across the application.
 * Every error response must use a code from this enum.
 */
const ErrorCodes = {
  // Validation
  REQUIRED: 'REQUIRED',
  INVALID_FORMAT: 'INVALID_FORMAT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  WEAK_PASSWORD: 'WEAK_PASSWORD',

  // Authentication & Authorization
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Resource
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Budget
  BUDGET_EXCEEDED: 'BUDGET_EXCEEDED',

  // File
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',

  // Server
  SERVER_ERROR: 'SERVER_ERROR',

  // Account
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  ACCOUNT_BANNED: 'ACCOUNT_BANNED',
};

module.exports = ErrorCodes;
