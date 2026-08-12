import { apiGet, apiPost } from './api';

export function registerUser({ name, email, password }) {
  return apiPost('/api/auth/register', { name, email, password });
}

export function loginUser({ email, password }) {
  return apiPost('/api/auth/login', { email, password });
}

export function fetchCurrentUser(token) {
  return apiGet('/api/auth/me', token);
}
