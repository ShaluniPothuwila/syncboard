const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const SOCKET_URL = BASE_URL.replace(/\/api\/?$/, "");

function getToken() {
  return localStorage.getItem("syncboard_token");
}

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