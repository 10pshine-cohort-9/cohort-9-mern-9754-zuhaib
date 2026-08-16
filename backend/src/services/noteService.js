const noteRepository = require('../repositories/noteRepository');
const AppError = require('../utils/AppError');

const TITLE_MAX_LENGTH = 200;
const CONTENT_MAX_LENGTH = 50000;

function toPublicNote(note) {
  return {
    id: note.id,
    userId: note.user_id,
    title: note.title,
    content: note.content,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  };
}

function parseNoteId(rawId) {
  if (rawId === undefined || rawId === null || String(rawId).trim() === '') {
    throw new AppError('Note ID is required.', 400);
  }

  const parsed = Number(rawId);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError('Invalid note ID.', 400);
  }

  return parsed;
}

function assertJsonObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Request body must be a JSON object.', 400);
  }
}

function validateNoteInput(body) {
  assertJsonObject(body);

  const errors = [];
  const { title, content } = body;

  if (title === undefined || title === null) {
    errors.push('Title is required.');
  } else if (typeof title !== 'string') {
    errors.push('Title must be a string.');
  } else if (title.trim().length < 1) {
    errors.push('Title cannot be empty.');
  } else if (title.trim().length > TITLE_MAX_LENGTH) {
    errors.push(`Title must be at most ${TITLE_MAX_LENGTH} characters.`);
  }

  if (content === undefined || content === null) {
    errors.push('Content is required.');
  } else if (typeof content !== 'string') {
    errors.push('Content must be a string.');
  } else if (content.length > CONTENT_MAX_LENGTH) {
    errors.push(`Content must be at most ${CONTENT_MAX_LENGTH} characters.`);
  }

  if (errors.length > 0) {
    throw new AppError(errors.join(' '), 400);
  }

  return {
    title: title.trim(),
    content,
  };
}

function notFound() {
  throw new AppError('Note not found.', 404);
}

async function listNotes(userId) {
  const notes = await noteRepository.findAllByUserId(userId);
  return notes.map(toPublicNote);
}

async function getNote(rawId, userId) {
  const id = parseNoteId(rawId);
  const note = await noteRepository.findByIdForUser(id, userId);
  if (!note) {
    notFound();
  }
  return toPublicNote(note);
}

async function createNote(userId, body) {
  const { title, content } = validateNoteInput(body);
  const note = await noteRepository.createNote({ userId, title, content });
  return toPublicNote(note);
}

async function updateNote(rawId, userId, body) {
  const id = parseNoteId(rawId);
  const { title, content } = validateNoteInput(body);
  const note = await noteRepository.updateNote({ id, userId, title, content });
  if (!note) {
    notFound();
  }
  return toPublicNote(note);
}

async function deleteNote(rawId, userId) {
  const id = parseNoteId(rawId);
  const deleted = await noteRepository.deleteNote({ id, userId });
  if (!deleted) {
    notFound();
  }
}

module.exports = {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};
