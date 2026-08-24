const express = require('express');
const noteService = require('../services/noteService');
const { authenticate } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * GET /api/notes — list notes for the authenticated user.
 * @type {import('express').RequestHandler}
 */
const listNotes = asyncHandler(async (req, res) => {
  const notes = await noteService.listNotes(req.user.id);
  res.status(200).json({ data: { notes } });
});

/**
 * GET /api/notes/:id — fetch one owned note.
 * @type {import('express').RequestHandler}
 */
const getNote = asyncHandler(async (req, res) => {
  const note = await noteService.getNote(req.params.id, req.user.id);
  res.status(200).json({ data: { note } });
});

/**
 * POST /api/notes — create a note.
 * @type {import('express').RequestHandler}
 */
const createNote = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(req.body, req.user.id);
  res.status(201).json({ message: 'Note created.', data: { note } });
});

/**
 * PATCH /api/notes/:id — update an owned note.
 * @type {import('express').RequestHandler}
 */
const updateNote = asyncHandler(async (req, res) => {
  const note = await noteService.updateNote(req.params.id, req.body, req.user.id);
  res.status(200).json({ message: 'Note updated.', data: { note } });
});

/**
 * DELETE /api/notes/:id — delete an owned note.
 * @type {import('express').RequestHandler}
 */
const deleteNote = asyncHandler(async (req, res) => {
  await noteService.deleteNote(req.params.id, req.user.id);
  res.status(200).json({ message: 'Note deleted.' });
});

router.use(authenticate);
router.get('/', listNotes);
router.get('/:id', getNote);
router.post('/', createNote);
router.patch('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
