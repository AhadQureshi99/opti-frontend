// This file now delegates API calls to an offline-aware helper.
// It still exports `getAuthHeaders` for callers that need headers.
import {
  BASE,
  apiFetch,
  apiCreate,
  apiUpdate,
  apiDelete,
  processQueue,
} from "./offlineApi";

export function getAuthHeaders() {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Read (GET) — supports optional `cacheKey` via third arg in options
export async function get(path, opts = {}) {
  // opts.cacheKey can be used by callers to enable offline cache reads
  return await apiFetch(
    path,
    { headers: { ...(opts.headers || {}), ...getAuthHeaders() } },
    opts.cacheKey || null
  );
}

// Create (POST)
export async function post(path, body, opts = {}) {
  // allow callers to bypass offline queuing for time-sensitive endpoints
  if (opts.noOffline) {
    const res = await fetch(BASE + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers || {}),
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let errBody = null;
      try {
        errBody = await res.json();
      } catch (e) {}
      throw { status: res.status, body: errBody };
    }
    return await res.json();
  }

  return await apiCreate(path, body, opts.cacheKey || null, {
    headers: { ...(opts.headers || {}) },
  });
}

// Update (PUT)
export async function put(path, body, opts = {}) {
  // Some callers used (path, id, body) — keep path plus body signature.
  return await apiUpdate(
    path,
    body && body._id ? body._id : opts.id || null,
    body,
    opts.cacheKey || null,
    { headers: { ...(opts.headers || {}) } }
  );
}

// Delete
export async function del(path, opts = {}) {
  return await apiDelete(path, opts.id || null, opts.cacheKey || null, {
    headers: { ...(opts.headers || {}) },
  });
}

// Expose processQueue so app can manually trigger queue processing if desired
export { processQueue };
