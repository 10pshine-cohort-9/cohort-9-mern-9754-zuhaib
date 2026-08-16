const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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

export function apiGet(path, token) {
  return request(path, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function apiPost(path, data, token) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function apiPut(path, data, token) {
  return request(path, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function apiDelete(path, token) {
  return request(path, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
