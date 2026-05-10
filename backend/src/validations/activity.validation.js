'use strict';

const Joi = require('joi');

const addActivityToStopSchema = Joi.object({
  activity_id: Joi.string().uuid().required().messages({
    'string.guid': 'activity_id must be a valid UUID',
    'any.required': 'activity_id is required',
  }),
  scheduled_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'scheduled_time must be in HH:MM or HH:MM:SS format',
    }),
});

module.exports = { addActivityToStopSchema };
