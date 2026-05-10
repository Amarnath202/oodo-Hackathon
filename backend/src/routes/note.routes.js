'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const { getNotes, createNote, updateNote, deleteNote } = require('../controllers/note.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createNoteSchema, updateNoteSchema } = require('../validations/note.validation');

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Trip and stop notes
 */

router.get('/', authenticate, getNotes);
router.post('/', authenticate, validate(createNoteSchema), createNote);
router.put('/:noteId', authenticate, validate(updateNoteSchema), updateNote);
router.delete('/:noteId', authenticate, deleteNote);

module.exports = router;
