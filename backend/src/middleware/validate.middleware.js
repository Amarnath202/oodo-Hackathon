'use strict';

const { sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');

/**
 * Creates a Joi validation middleware for a given schema.
 * Validates req.body against the schema.
 * Returns field-level errors on validation failure.
 *
 * @param {object} schema - Joi schema object
 * @param {string} [property='body'] - Which req property to validate
 * @returns {Function} Express middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,   // collect ALL errors at once
      allowUnknown: false, // reject unknown fields
    });

    if (!error) return next();

    // Map Joi errors to our standardized field-level format
    const firstError = error.details[0];
    const field = firstError.path.join('.') || null;
    const type = firstError.type;

    // Map Joi error types to our machine-readable codes
    let code = ErrorCodes.VALIDATION_ERROR;
    if (type.includes('required') || type === 'any.required') {
      code = ErrorCodes.REQUIRED;
    } else if (type.includes('format') || type.includes('email') || type.includes('pattern')) {
      code = ErrorCodes.INVALID_FORMAT;
    }

    return sendError(
      res, 400,
      'Validation failed',
      code,
      field,
      firstError.message.replace(/['"]/g, '')
    );
  };
};

module.exports = { validate };
