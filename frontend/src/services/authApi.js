import { apiGet, apiPost } from './api';

/**
 * Creates a new user account via the backend API.
 * @param {{ name: string, email: string, password: string }} params - Registration fields.
 * @returns {Promise<Object>} API response containing token and user.
 */
export function registerUser({ name, email, password }) {
  return apiPost('/api/auth/register', { name, email, password });
}

/**
 * Authenticates an existing user via the backend API.
 * @param {{ email: string, password: string }} params - Login credentials.
 * @returns {Promise<Object>} API response containing token and user.
 */
export function loginUser({ email, password }) {
  return apiPost('/api/auth/login', { email, password });
}

/**
 * Fetches the profile for the currently authenticated user.
 * @param {string} token - Bearer JWT.
 * @returns {Promise<Object>} API response containing the user profile.
 */
export function fetchCurrentUser(token) {
  return apiGet('/api/auth/me', token);
}
