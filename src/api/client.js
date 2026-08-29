const BASE_URL = "http://localhost:4000/api";

// Reads the saved login token, if any.
function getToken() {
  return localStorage.getItem("syncboard_token");
}

/**
 * Thin wrapper around fetch that:
 * - prefixes every call with the API base URL
 * - attaches the JWT automatically if we're logged in
 * - parses JSON and throws a real Error on non-2xx responses
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // DELETE requests return no body (204 No Content)
  const isEmpty = res.status === 204;
  const data = isEmpty ? null : await res.json();

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.body = data;
    throw error;
  }

  return data;
}