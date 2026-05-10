'use strict';

const Joi = require('joi');

const createTripSchema = Joi.object({
  name: Joi.string().min(1).max(150).required().messages({
    'string.min': 'Trip name cannot be empty',
    'string.max': 'Trip name must not exceed 150 characters',
    'any.required': 'Trip name is required',
  }),
  description: Joi.string().max(2000).optional().allow(''),
  start_date: Joi.date().iso().required().messages({
    'date.base': 'Start date must be a valid date',
    'any.required': 'Start date is required',
  }),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required().messages({
    'date.base': 'End date must be a valid date',
    'date.min': 'End date must be on or after the start date',
    'any.required': 'End date is required',
  }),
  is_public: Joi.boolean().optional(),
});

const updateTripSchema = Joi.object({
  name: Joi.string().min(1).max(150).optional(),
  description: Joi.string().max(2000).optional().allow(''),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  is_public: Joi.boolean().optional(),
}).min(1);

module.exports = { createTripSchema, updateTripSchema };
