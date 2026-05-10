'use strict';

const Joi = require('joi');

const addChecklistItemSchema = Joi.object({
  name: Joi.string().min(1).max(150).required().messages({
    'string.min': 'Item name cannot be empty',
    'string.max': 'Item name must not exceed 150 characters',
    'any.required': 'Item name is required',
  }),
  category: Joi.string()
    .valid(
      'Clothing',
      'Documents',
      'Electronics',
      'Toiletries',
      'Medications',
      'Money',
      'Accessories',
      'Other'
    )
    .required()
    .messages({
      'any.only': 'Invalid category selected',
      'any.required': 'Category is required',
    }),
});

const updateChecklistItemSchema = Joi.object({
  name: Joi.string().min(1).max(150).optional(),
  category: Joi.string()
    .valid(
      'Clothing',
      'Documents',
      'Electronics',
      'Toiletries',
      'Medications',
      'Money',
      'Accessories',
      'Other'
    )
    .optional(),
  is_packed: Joi.boolean().optional(),
}).min(1);

module.exports = { addChecklistItemSchema, updateChecklistItemSchema };
