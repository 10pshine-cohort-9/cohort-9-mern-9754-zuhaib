const noteService = require('../services/noteService');
const asyncHandler = require('../utils/asyncHandler');

const listNotes = asyncHandler(async (req, res) => {
  const notes = await noteService.listNotes(req.user.id);
  res.status(200).json({
    data: { notes },
  });
});

const getNote = asyncHandler(async (req, res) => {
  const note = await noteService.getNote(req.params.id, req.user.id);
  res.status(200).json({
    data: { note },
  });
});

const createNote = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(req.user.id, req.body);
  res.status(201).json({
    message: 'Note created.',
    data: { note },
  });
});

const updateNote = asyncHandler(async (req, res) => {
  const note = await noteService.updateNote(req.params.id, req.user.id, req.body);
  res.status(200).json({
    message: 'Note updated.',
    data: { note },
  });
});

const deleteNote = asyncHandler(async (req, res) => {
  await noteService.deleteNote(req.params.id, req.user.id);
  res.status(200).json({
    message: 'Note deleted.',
  });
});

module.exports = {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};
