import { apiDelete, apiGet, apiPost, apiPut } from './api';

export function fetchNotes(token) {
  return apiGet('/api/notes', token);
}

export function fetchNote(id, token) {
  return apiGet(`/api/notes/${id}`, token);
}

export function createNote({ title, content }, token) {
  return apiPost('/api/notes', { title, content }, token);
}

export function updateNote(id, { title, content }, token) {
  return apiPut(`/api/notes/${id}`, { title, content }, token);
}

export function deleteNote(id, token) {
  return apiDelete(`/api/notes/${id}`, token);
}
