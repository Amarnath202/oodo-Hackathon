'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const { getBudget, updateBudget, getBudgetSummary } = require('../controllers/budget.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { updateBudgetSchema } = require('../validations/budget.validation');

/**
 * @swagger
 * tags:
 *   name: Budget
 *   description: Trip budget management
 */

/**
 * @swagger
 * /trips/{tripId}/budget:
 *   get:
 *     summary: Get trip budget
 *     tags: [Budget]
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Budget details }
 */
router.get('/', authenticate, getBudget);

/**
 * @swagger
 * /trips/{tripId}/budget:
 *   put:
 *     summary: Update trip budget
 *     tags: [Budget]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transport_cost: { type: number }
 *               stay_cost: { type: number }
 *               meal_cost: { type: number }
 *               budget_limit: { type: number }
 *     responses:
 *       200: { description: Budget updated }
 */
router.put('/', authenticate, validate(updateBudgetSchema), updateBudget);

/**
 * @swagger
 * /trips/{tripId}/budget/summary:
 *   get:
 *     summary: Get budget summary with category breakdown
 *     tags: [Budget]
 *     responses:
 *       200: { description: Budget summary }
 */
router.get('/summary', authenticate, getBudgetSummary);

module.exports = router;
