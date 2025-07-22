/**
 * Simple API utility functions
 */

// Base API function
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

// GET request
export async function get(url: string) {
  return apiRequest(url, { method: 'GET' });
}

// POST request
export async function post(url: string, data?: any) {
  return apiRequest(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT request
export async function put(url: string, data?: any) {
  return apiRequest(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE request
export async function del(url: string) {
  return apiRequest(url, { method: 'DELETE' });
}