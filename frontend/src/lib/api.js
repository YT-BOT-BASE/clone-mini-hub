// CLONE MINI HUB API Client
const API_BASE = import.meta.env.VITE_API_URL || '';

let accessToken = localStorage.getItem('cmh_access_token') || null;
let onUnauthorized = null;

export function setToken(token) {
  accessToken = token;
  if (token) localStorage.setItem('cmh_access_token', token);
  else localStorage.removeItem('cmh_access_token');
}
export function getToken() { return accessToken; }
export function setOnUnauthorized(fn) { onUnauthorized = fn; }

async function request(path, { method = 'GET', body, headers = {}, raw = false, retry = true } = {}) {
  const opts = {
    method,
    credentials: 'include',
    headers: { ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...headers },
  };
  if (body && !(body instanceof FormData)) opts.body = JSON.stringify(body);
  if (body instanceof FormData) opts.body = body;

  const res = await fetch(`${API_BASE}${path}`, opts);
  if (raw) return res;

  let data = null;
  try { data = await res.json(); } catch { data = { success: false, error: { code: 'BAD_RESPONSE', message: 'Invalid server response' } }; }

  if (res.status === 401 && retry && !path.includes('/auth/')) {
    // try refresh once
    const refreshed = await refreshSession();
    if (refreshed) return request(path, { method, body, headers, raw, retry: false });
    if (onUnauthorized) onUnauthorized();
    throw new ApiError(data?.error?.message || 'Session expired', 401, data?.error?.code);
  }
  if (!res.ok || data?.success === false) {
    throw new ApiError(data?.error?.message || `Request failed (${res.status})`, res.status, data?.error?.code, data?.error);
  }
  return data;
}

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function refreshSession() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.success && data.data.accessToken) {
      setToken(data.data.accessToken);
      return true;
    }
    return false;
  } catch { return false; }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  raw: (path, opts) => request(path, { ...opts, raw: true }),
};
export default api;
