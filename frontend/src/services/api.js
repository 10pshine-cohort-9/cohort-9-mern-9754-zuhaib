const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Sends an HTTP request to the API and parses JSON responses.
 * @param {string} path - API path beginning with `/`.
 * @param {RequestInit} [options={}] - Fetch options.
 * @returns {Promise<Object|null>} Parsed JSON body when successful.
 * @throws {Error} When the response status is not ok.
 */
async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let body = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await response.json();
  }

  if (!response.ok) {
    const error = new Error(body?.message || 'Something went wrong.');
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

/**
 * Performs an authenticated or public GET request.
 * @param {string} path - API path.
 * @param {string} [token] - Optional Bearer token.
 * @returns {Promise<Object|null>} Parsed JSON response.
 */
export function apiGet(path, token) {
  return request(path, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

/**
 * Performs an authenticated or public POST request.
 * @param {string} path - API path.
 * @param {Object} data - JSON request body.
 * @param {string} [token] - Optional Bearer token.
 * @returns {Promise<Object|null>} Parsed JSON response.
 */
export function apiPost(path, data, token) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
