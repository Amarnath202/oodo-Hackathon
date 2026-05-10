'use strict';

const Joi = require('joi');

const createNoteSchema = Joi.object({
  content: Joi.string().min(1).required().messages({
    'string.min': 'Note content cannot be empty',
    'any.required': 'Note content is required',
  }),
  stop_id: Joi.string().uuid().optional().allow(null).messages({
    'string.guid': 'stop_id must be a valid UUID',
  }),
});

const updateNoteSchema = Joi.object({
  content: Joi.string().min(1).required().messages({
    'string.min': 'Note content cannot be empty',
    'any.required': 'Note content is required',
  }),
});

module.exports = { createNoteSchema, updateNoteSchema };
