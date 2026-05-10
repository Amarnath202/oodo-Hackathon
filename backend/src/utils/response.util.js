'use strict';

/**
 * Sends a standardized success response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable success message
 * @param {*} data - Response payload
 * @param {object|null} pagination - Optional pagination metadata
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, pagination = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Sends a standardized error response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable error message
 * @param {string} code - Machine-readable error code from ErrorCodes enum
 * @param {string|null} field - Field that caused the error (for validation)
 * @param {string|null} details - Specific explanation of the error
 */
const sendError = (res, statusCode = 500, message = 'An error occurred', code = 'SERVER_ERROR', field = null, details = null) => {
  const errorPayload = { code };

  if (field) {
    errorPayload.field = field;
  }

  if (details) {
    errorPayload.details = details;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error: errorPayload,
  });
};

module.exports = { sendSuccess, sendError };
