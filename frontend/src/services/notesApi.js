import { apiDelete, apiGet, apiPatch, apiPost } from './api';

/**
 * Lists notes for the authenticated user.
 * @param {string} token
 * @param {{ q?: string, sort?: string }} [filters]
 * @returns {Promise<Object>}
 */
export function fetchNotes(token, { q = '', sort = 'newest' } = {}) {
  const params = new URLSearchParams();
  if (q.trim()) {
    params.set('q', q.trim());
  }
  if (sort && sort !== 'newest') {
    params.set('sort', sort);
  }
  const query = params.toString();
  return apiGet(`/api/notes${query ? `?${query}` : ''}`, token);
}

/**
 * Loads a single note by id.
 * @param {string|number} id
 * @param {string} token
 * @returns {Promise<Object>}
 */
export function fetchNote(id, token) {
  return apiGet(`/api/notes/${id}`, token);
}

/**
 * Creates a note with HTML content.
 * @param {{ title: string, content: string }} payload
 * @param {string} token
 * @returns {Promise<Object>}
 */
export function createNote(payload, token) {
  return apiPost('/api/notes', payload, token);
}

/**
 * Updates an existing note.
 * @param {string|number} id
 * @param {{ title: string, content: string }} payload
 * @param {string} token
 * @returns {Promise<Object>}
 */
export function updateNote(id, payload, token) {
  return apiPatch(`/api/notes/${id}`, payload, token);
}

/**
 * Deletes a note by id.
 * @param {string|number} id
 * @param {string} token
 * @returns {Promise<Object>}
 */
export function deleteNote(id, token) {
  return apiDelete(`/api/notes/${id}`, token);
}
