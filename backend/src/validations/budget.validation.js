'use strict';

const Joi = require('joi');

const updateBudgetSchema = Joi.object({
  transport_cost: Joi.number().min(0).precision(2).optional(),
  stay_cost: Joi.number().min(0).precision(2).optional(),
  meal_cost: Joi.number().min(0).precision(2).optional(),
  budget_limit: Joi.number().min(0).precision(2).optional().allow(null),
}).min(1).messages({
  'object.min': 'At least one budget field must be provided',
});

module.exports = { updateBudgetSchema };
