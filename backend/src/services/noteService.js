const logger = require('../config/logger');
const noteRepository = require('../repositories/noteRepository');
const AppError = require('../utils/AppError');

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 200000;

/**
 * Maps a database note row to the public API shape.
 * @param {Object} note
 * @returns {Object}
 */
function toPublicNote(note) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  };
}

/**
 * Parses a note id from a route parameter.
 * @param {string} value
 * @returns {number}
 */
function parseNoteId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Note id must be a positive integer.', 400, 'INVALID_ID');
  }
  return id;
}

/**
 * Validates create/update note payloads.
 * @param {unknown} body
 * @returns {{ title: string, content: string }}
 */
function validateNoteBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Request body must be a JSON object.', 400, 'INVALID_BODY');
  }

  const { title, content } = body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required.');
  } else if (title.trim().length > MAX_TITLE_LENGTH) {
    errors.push(`Title must be at most ${MAX_TITLE_LENGTH} characters.`);
  }

  if (content == null || typeof content !== 'string') {
    errors.push('Content is required.');
  } else if (content.length > MAX_CONTENT_LENGTH) {
    errors.push('Content is too large.');
  }

  if (errors.length > 0) {
    throw new AppError(errors.join(' '), 400, 'VALIDATION_ERROR');
  }

  return {
    title: title.trim(),
    content,
  };
}

/**
 * Ensures the note exists and belongs to the caller.
 * @param {Object|null} note
 * @param {number} userId
 * @returns {Object}
 */
function assertOwnedNote(note, userId) {
  if (!note) {
    throw new AppError('Note not found.', 404, 'NOTE_NOT_FOUND');
  }
  if (Number(note.user_id) !== Number(userId)) {
    throw new AppError('Note not found.', 404, 'NOTE_NOT_FOUND');
  }
  return note;
}

const MAX_SEARCH_LENGTH = 100;
const VALID_SORTS = ['newest', 'oldest', 'title'];

/**
 * Parses and validates list query parameters.
 * @param {Object} query
 * @returns {{ search: string, sort: string }}
 */
function parseListFilters(query = {}) {
  let sort = typeof query.sort === 'string' ? query.sort.trim() : 'newest';
  if (!VALID_SORTS.includes(sort)) {
    throw new AppError('Invalid sort value. Use newest, oldest, or title.', 400, 'VALIDATION_ERROR');
  }

  let search = '';
  if (query.q != null && String(query.q).trim()) {
    search = String(query.q)
      .trim()
      .slice(0, MAX_SEARCH_LENGTH)
      .replace(/[%_\\]/g, '\\$&');
  }

  return { search, sort };
}

/**
 * Lists notes for the authenticated user.
 * @param {number} userId
 * @param {Object} [query]
 * @returns {Promise<Object[]>}
 */
async function listNotes(userId, query = {}) {
  const filters = parseListFilters(query);
  const notes = await noteRepository.findAllByUserId(userId, filters);
  return notes.map(toPublicNote);
}

/**
 * Returns one note owned by the authenticated user.
 * @param {string} rawId
 * @param {number} userId
 * @returns {Promise<Object>}
 */
async function getNote(rawId, userId) {
  const id = parseNoteId(rawId);
  const note = assertOwnedNote(await noteRepository.findById(id), userId);
  return toPublicNote(note);
}

/**
 * Creates a note for the authenticated user.
 * @param {unknown} body
 * @param {number} userId
 * @returns {Promise<Object>}
 */
async function createNote(body, userId) {
  const payload = validateNoteBody(body);
  const note = await noteRepository.createNote({ userId, ...payload });
  logger.info({ userId, noteId: note.id }, 'Note created');
  return toPublicNote(note);
}

/**
 * Updates a note owned by the authenticated user.
 * @param {string} rawId
 * @param {unknown} body
 * @param {number} userId
 * @returns {Promise<Object>}
 */
async function updateNote(rawId, body, userId) {
  const id = parseNoteId(rawId);
  assertOwnedNote(await noteRepository.findById(id), userId);
  const payload = validateNoteBody(body);
  const note = await noteRepository.updateNote({ id, userId, ...payload });
  if (!note) {
    throw new AppError('Note not found.', 404, 'NOTE_NOT_FOUND');
  }
  logger.info({ userId, noteId: id }, 'Note updated');
  return toPublicNote(note);
}

/**
 * Deletes a note owned by the authenticated user.
 * @param {string} rawId
 * @param {number} userId
 * @returns {Promise<void>}
 */
async function deleteNote(rawId, userId) {
  const id = parseNoteId(rawId);
  assertOwnedNote(await noteRepository.findById(id), userId);
  const deleted = await noteRepository.deleteNote(id, userId);
  if (!deleted) {
    throw new AppError('Note not found.', 404, 'NOTE_NOT_FOUND');
  }
  logger.info({ userId, noteId: id }, 'Note deleted');
}

module.exports = {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};
