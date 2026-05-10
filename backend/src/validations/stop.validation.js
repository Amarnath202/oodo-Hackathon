'use strict';

const Joi = require('joi');

const createStopSchema = Joi.object({
  city_id: Joi.string().uuid().required().messages({
    'string.guid': 'city_id must be a valid UUID',
    'any.required': 'city_id is required',
  }),
  order_index: Joi.number().integer().min(0).required().messages({
    'number.base': 'order_index must be a number',
    'any.required': 'order_index is required',
  }),
  start_date: Joi.date().iso().required().messages({
    'any.required': 'Start date is required',
  }),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required().messages({
    'date.min': 'End date must be on or after start date',
    'any.required': 'End date is required',
  }),
  notes: Joi.string().max(2000).optional().allow('', null),
});

const updateStopSchema = Joi.object({
  city_id: Joi.string().uuid().optional(),
  order_index: Joi.number().integer().min(0).optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  notes: Joi.string().max(2000).optional().allow('', null),
}).min(1);

const reorderStopsSchema = Joi.object({
  order: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().uuid().required(),
        order_index: Joi.number().integer().min(0).required(),
      })
    )
    .min(1)
    .required()
    .messages({
      'any.required': 'order array is required',
    }),
});

module.exports = { createStopSchema, updateStopSchema, reorderStopsSchema };
