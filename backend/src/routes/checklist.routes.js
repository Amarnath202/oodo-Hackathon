'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const { getChecklist, addChecklistItem, updateChecklistItem, deleteChecklistItem, resetChecklist } = require('../controllers/checklist.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { addChecklistItemSchema, updateChecklistItemSchema } = require('../validations/checklist.validation');

/**
 * @swagger
 * tags:
 *   name: Checklist
 *   description: Trip packing checklist management
 */

router.get('/', authenticate, getChecklist);
router.post('/items', authenticate, validate(addChecklistItemSchema), addChecklistItem);
router.put('/items/:itemId', authenticate, validate(updateChecklistItemSchema), updateChecklistItem);
router.delete('/items/:itemId', authenticate, deleteChecklistItem);
router.post('/reset', authenticate, resetChecklist);

module.exports = router;
