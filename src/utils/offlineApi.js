// Offline-aware API helper adapted from dashboard helper
// Determines BASE from Vite env or falls back to localhost
const BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE) ||
  "https://api.optislip.com";

const CACHE_PREFIX = "offline_api_cache:";
const QUEUE_KEY = "offline_api_queue";
const MAX_ATTEMPTS = 5;

function getUserIdFromToken() {
  try {
    const token =
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt");
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded && (decoded.userId || decoded.sub || decoded.id)
      ? String(decoded.userId || decoded.sub || decoded.id)
      : null;
  } catch (e) {
    return null;
  }
}

function effectiveCacheKey(cacheKey) {
  if (!cacheKey) return null;
  try {
    const uid = getUserIdFromToken();
    if (uid) return `${cacheKey}:${uid}`;
  } catch (e) {}
  return cacheKey;
}

const getQueue = () => JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
const setQueue = (q) => localStorage.setItem(QUEUE_KEY, JSON.stringify(q));

function dispatchQueueUpdated(detail = {}) {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("offline-queue-updated", { detail })
      );
    }
  } catch (e) {}
}

function dispatchQueueProcessed(detail = {}) {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("offline-queue-processed", { detail })
      );
    }
  } catch (e) {}
}

function getCurrentAuthHeaders() {
  const token =
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, options = {}, cacheKey = null) {
  const url = BASE + path;
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    if (!cacheKey) return null;
    return JSON.parse(localStorage.getItem(CACHE_PREFIX + cacheKey) || "null");
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    let errBody = null;
    try {
      errBody = await res.json();
    } catch (e) {}
    throw { status: res.status, body: errBody };
  }
  const data = await res.json();

  // merge queued POSTs for this path into returned data
  if (cacheKey) {
    try {
      const q = getQueue();
      const pending = q.filter((op) => {
        if (op.method !== "POST") return false;
        // prefer matching by cacheKey when available (creates should specify cacheKey)
        if (cacheKey && op.cacheKey) return op.cacheKey === cacheKey;
        // fallback to exact path match
        return op.path === path;
      });
      if (pending && pending.length) {
        if (Array.isArray(data)) {
          const merged = [...pending.map((p) => p.body), ...data];
          localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(merged));
          return merged;
        }

        if (data && typeof data === "object") {
          const keys = ["users", "subUsers", "pending", "items", "data", "all"];
          let merged = { ...data };
          let mergedInto = false;
          for (const k of keys) {
            if (Array.isArray(data[k])) {
              merged[k] = [...pending.map((p) => p.body), ...data[k]];
              mergedInto = true;
              break;
            }
          }
          if (mergedInto) {
            localStorage.setItem(
              CACHE_PREFIX + cacheKey,
              JSON.stringify(merged)
            );
            return merged;
          }
        }
      }
    } catch (e) {
      console.error("Error merging pending ops into fetch result", e);
    }

    localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(data));
  }
  return data;
}

function enqueue(op) {
  const q = getQueue();
  // initialize retry metadata
  const enriched = {
    attempts: op.attempts || 0,
    nextAttempt: op.nextAttempt || 0,
    ...op,
  };
  q.push(enriched);
  setQueue(q);
  dispatchQueueUpdated({ queue: q });
}

function applyLocalCacheInsert(cacheKey, item) {
  if (!cacheKey) return;
  const eKey = effectiveCacheKey(cacheKey);
  const curRaw = localStorage.getItem(CACHE_PREFIX + eKey);
  const cur = curRaw ? JSON.parse(curRaw) : null;
  if (Array.isArray(cur)) {
    cur.unshift(item);
    localStorage.setItem(CACHE_PREFIX + eKey, JSON.stringify(cur));
    return;
  }
  if (cur && typeof cur === "object") {
    const keys = ["pending", "users", "subUsers", "items", "all", "data"];
    for (const k of keys) {
      if (Array.isArray(cur[k])) {
        cur[k].unshift(item);
        localStorage.setItem(CACHE_PREFIX + eKey, JSON.stringify(cur));
        return;
        // Replace references to the tempId in remaining queued ops so follow-up
        // PUT/DELETE operations will target the real server id instead of the local id.
        try {
          const tempId = op.tempId;
          if (tempId) {
            newQueue = newQueue.map((pendingOp) => {
              if (pendingOp === op) return pendingOp; // skip current

              let updated = false;
              // replace in path
              if (pendingOp.path && String(pendingOp.path).includes(tempId)) {
                pendingOp.path = String(pendingOp.path)
                  .split(tempId)
                  .join(createdItem._id || createdItem.id);
                updated = true;
              }
              // replace id field
              if (pendingOp.id && pendingOp.id === tempId) {
                pendingOp.id = createdItem._id || createdItem.id;
                updated = true;
              }
              // replace occurrences inside body (shallow JSON replace)
              if (pendingOp.body) {
                try {
                  const s = JSON.stringify(pendingOp.body);
                  if (s.includes(tempId)) {
                    const replaced = s
                      .split(tempId)
                      .join(createdItem._id || createdItem.id);
                    pendingOp.body = JSON.parse(replaced);
                    updated = true;
                  }
                } catch (e) {
                  // ignore JSON errors and leave the op unchanged
                }
              }
              if (updated) {
                // ensure headers remain a plain object
                pendingOp.headers = pendingOp.headers || {};
              }
              return pendingOp;
            });
            console.info(
              "offlineApi: patched queued ops replacing",
              tempId,
              "->",
              createdItem._id || createdItem.id
            );
          }
        } catch (e) {
          console.error(
            "offlineApi: error patching queued ops for tempId replacement",
            e
          );
        }
      }
    }
  }
  localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify([item]));
  localStorage.setItem(CACHE_PREFIX + eKey, JSON.stringify([item]));
}

function applyLocalCacheRemove(cacheKey, id) {
  if (!cacheKey) return;
  const eKey = effectiveCacheKey(cacheKey);
  const curRaw = localStorage.getItem(CACHE_PREFIX + eKey);
  const cur = curRaw ? JSON.parse(curRaw) : null;
  if (Array.isArray(cur)) {
    const next = cur.filter((x) => x._id !== id && x.id !== id);
    localStorage.setItem(CACHE_PREFIX + eKey, JSON.stringify(next));
    return;
  }
  if (cur && typeof cur === "object") {
    const keys = ["pending", "users", "subUsers", "items", "all", "data"];
    let changed = false;
    for (const k of keys) {
      if (Array.isArray(cur[k])) {
        cur[k] = cur[k].filter((x) => x._id !== id && x.id !== id);
        changed = true;
      }
    }
    if (changed) localStorage.setItem(CACHE_PREFIX + eKey, JSON.stringify(cur));
  }
}

function isLocalId(id) {
  return typeof id === "string" && id.startsWith("local-");
}

async function apiCreate(path, body, cacheKey = null, options = {}) {
  const url = BASE + path;
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const tempId = `local-${Date.now()}`;
    // try to attach user's selected currency from cached profile so
    // offline-created items display with correct currency symbol
    let currencyFromProfile = null;
    try {
      const profileRaw = localStorage.getItem(CACHE_PREFIX + "profile");
      if (profileRaw) {
        const p = JSON.parse(profileRaw);
        // profile may be stored as object or { user: { ... } }
        const u = p && p.user ? p.user : p;
        currencyFromProfile = u && u.currency ? u.currency : null;
      }
    } catch (e) {}

    const localItem = {
      ...body,
      _id: tempId,
      createdAt: new Date().toISOString(),
      ...(currencyFromProfile ? { currency: currencyFromProfile } : {}),
    };
    applyLocalCacheInsert(cacheKey, localItem);
    enqueue({
      method: "POST",
      path,
      body: localItem,
      tempId,
      cacheKey,
      // capture authorization headers at enqueue time so offline-created
      // items remain associated with the creating user when the queue is processed
      headers: { ...(options.headers || {}), ...getCurrentAuthHeaders() },
    });
    return localItem;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...getCurrentAuthHeaders(),
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
  const data = await res.json();
  return data;
}

async function apiUpdate(path, id, body, cacheKey = null, options = {}) {
  const url = BASE + path;
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    if (isLocalId(id)) {
      const localItem = { ...body, _id: id };
      applyLocalCacheRemove(cacheKey, id);
      applyLocalCacheInsert(cacheKey, localItem);
      const q = getQueue();
      let changed = false;
      for (const op of q) {
        if (op.method === "POST" && op.tempId === id) {
          op.body = localItem;
          changed = true;
        }
      }
      if (changed) setQueue(q);
      return localItem;
    }

    const localItem = { ...body, _id: id };
    applyLocalCacheRemove(cacheKey, id);
    applyLocalCacheInsert(cacheKey, localItem);
    enqueue({
      method: "PUT",
      path,
      id,
      body: localItem,
      cacheKey,
      headers: { ...(options.headers || {}), ...getCurrentAuthHeaders() },
    });
    return localItem;
  }

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...getCurrentAuthHeaders(),
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
  const data = await res.json();
  return data;
}

async function apiDelete(path, id, cacheKey = null, options = {}) {
  const url = BASE + path;
  if (isLocalId(id)) {
    applyLocalCacheRemove(cacheKey, id);
    const q = getQueue().filter(
      (op) => !(op.method === "POST" && op.tempId === id)
    );
    setQueue(q);
    dispatchQueueUpdated({ queue: q });
    return { removedLocal: true };
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    applyLocalCacheRemove(cacheKey, id);
    enqueue({
      method: "DELETE",
      path,
      id,
      cacheKey,
      headers: { ...(options.headers || {}), ...getCurrentAuthHeaders() },
    });
    return { queued: true };
  }

  const res = await fetch(url, {
    method: "DELETE",
    headers: { ...(options.headers || {}), ...getCurrentAuthHeaders() },
  });
  if (!res.ok) {
    let errBody = null;
    try {
      errBody = await res.json();
    } catch (e) {}
    throw { status: res.status, body: errBody };
  }
  const data = await res.json();
  return data;
}

async function processQueue() {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  let q = getQueue();

  // Validate and clean invalid expense requests
  const validExpenseCategories = [
    "Salary",
    "Frame Vendors",
    "Lens Vendor",
    "Box Vendor",
    "Marketing",
    "Accessories",
    "Repair and Maintenance",
    "New Asset Purchase",
  ];

  q = q.filter((op) => {
    // Check if this is an expense POST request
    if (op.method === "POST" && op.path && op.path.includes("/expenses")) {
      // Validate category
      if (op.body && op.body.category) {
        if (!validExpenseCategories.includes(op.body.category)) {
          console.warn(
            `offlineApi: Removing invalid expense request with category "${op.body.category}"`,
            op
          );
          return false; // Remove this request
        }
      }
    }
    return true; // Keep other requests
  });

  setQueue(q); // Update queue with cleaned version

  if (!q.length) return;
  console.info("offlineApi: processing queue", q.length, "ops");
  let newQueue = [...q];
  const errors = [];

  const originalCount = newQueue.length;
  for (let i = 0; i < originalCount; i++) {
    const op = newQueue[0];
    // if operation is scheduled for a future attempt, skip it this run
    try {
      if (op.nextAttempt && Number(op.nextAttempt) > Date.now()) {
        // move to end and continue
        newQueue.shift();
        newQueue.push(op);
        continue;
      }
    } catch (e) {
      // if metadata malformed, proceed to attempt
    }
    try {
      if (op.method === "POST") {
        console.info(
          "offlineApi: processing POST op",
          op.path,
          op.tempId || "(",
          op.cacheKey,
          ")"
        );
        const body = { ...op.body };
        if (body._id && String(body._id).startsWith("local-")) delete body._id;
        const headers = {
          "Content-Type": "application/json",
          // prefer op.headers captured at enqueue time; fall back to current auth
          ...getCurrentAuthHeaders(),
          ...(op.headers || {}),
        };
        const res = await fetch(BASE + op.path, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const created = await res.json();
          // server responses may wrap the created resource (e.g. { order: {...} })
          const createdItem =
            created && created.order ? created.order : created;
          console.info(
            "offlineApi: POST succeeded",
            op.path,
            createdItem && (createdItem._id || createdItem.id)
          );
          if (op.cacheKey) {
            const curRaw = localStorage.getItem(CACHE_PREFIX + op.cacheKey);
            const cur = curRaw ? JSON.parse(curRaw) : null;
            const replaceInArray = (arr) =>
              arr.map((x) =>
                x._id === op.tempId || x.id === op.tempId ? createdItem : x
              );
            if (Array.isArray(cur)) {
              const replaced = replaceInArray(cur);
              localStorage.setItem(
                CACHE_PREFIX + op.cacheKey,
                JSON.stringify(replaced)
              );
            } else if (cur && typeof cur === "object") {
              const keys = [
                "pending",
                "users",
                "subUsers",
                "items",
                "all",
                "data",
              ];
              let changed = false;
              for (const k of keys) {
                if (Array.isArray(cur[k])) {
                  cur[k] = replaceInArray(cur[k]);
                  changed = true;
                }
              }
              if (changed)
                localStorage.setItem(
                  CACHE_PREFIX + op.cacheKey,
                  JSON.stringify(cur)
                );
            }
          }
          // remove processed op from the front
          newQueue.shift();
        } else {
          console.warn("offlineApi: POST failed", op.path, res.status);
          let errBody = null;
          try {
            errBody = await res.json();
          } catch (e) {}
          // increment attempts and schedule next attempt (exponential backoff)
          op.attempts = (op.attempts || 0) + 1;
          if (op.attempts >= MAX_ATTEMPTS) {
            errors.push({
              op,
              status: res.status,
              body: errBody,
              reason: "max attempts reached",
            });
            // drop this op (give up)
            newQueue.shift();
          } else {
            op.nextAttempt = Date.now() + Math.pow(2, op.attempts) * 1000;
            op.lastError = {
              status: res.status,
              body: errBody,
              when: Date.now(),
            };
            // move to end
            newQueue.shift();
            newQueue.push(op);
            errors.push({ op, status: res.status, body: errBody });
          }
        }
      } else if (op.method === "DELETE") {
        console.info("offlineApi: processing DELETE op", op.path, op.id);
        const headers = {
          // prefer op.headers captured at enqueue time; fall back to current auth
          ...getCurrentAuthHeaders(),
          ...(op.headers || {}),
        };
        const res = await fetch(BASE + op.path, { method: "DELETE", headers });
        if (res.ok) {
          // remove processed op
          newQueue.shift();
        } else {
          console.warn("offlineApi: DELETE failed", op.path, res.status);
          if (res.status === 404) {
            try {
              console.warn("offlineApi: DELETE 404 details - op:", op);
              const cache = localStorage.getItem(
                CACHE_PREFIX + (op.cacheKey || "")
              );
              console.warn("offlineApi: related cache content:", cache);
              console.warn(
                "offlineApi: current queue:",
                JSON.stringify(getQueue())
              );
            } catch (e) {
              console.error("offlineApi: error while logging 404 context", e);
            }
          }
          let errBody = null;
          try {
            errBody = await res.json();
          } catch (e) {}
          op.attempts = (op.attempts || 0) + 1;
          if (op.attempts >= MAX_ATTEMPTS) {
            errors.push({
              op,
              status: res.status,
              body: errBody,
              reason: "max attempts reached",
            });
            newQueue.shift();
          } else {
            op.nextAttempt = Date.now() + Math.pow(2, op.attempts) * 1000;
            op.lastError = {
              status: res.status,
              body: errBody,
              when: Date.now(),
            };
            newQueue.shift();
            newQueue.push(op);
            errors.push({ op, status: res.status, body: errBody });
          }
        }
      } else if (op.method === "PUT") {
        console.info(
          "offlineApi: processing PUT op",
          op.path,
          op.id || (op.body && op.body._id)
        );
        const headers = {
          "Content-Type": "application/json",
          // prefer op.headers captured at enqueue time; fall back to current auth
          ...getCurrentAuthHeaders(),
          ...(op.headers || {}),
        };
        const res = await fetch(BASE + op.path, {
          method: "PUT",
          headers,
          body: JSON.stringify(op.body),
        });
        if (res.ok) {
          console.info("offlineApi: PUT succeeded", op.path);
          // remove processed op
          newQueue.shift();
        } else {
          console.warn("offlineApi: PUT failed", op.path, res.status);
          if (res.status === 404) {
            try {
              console.warn("offlineApi: PUT 404 details - op:", op);
              const cache = localStorage.getItem(
                CACHE_PREFIX + (op.cacheKey || "")
              );
              console.warn("offlineApi: related cache content:", cache);
              console.warn(
                "offlineApi: current queue:",
                JSON.stringify(getQueue())
              );
            } catch (e) {
              console.error("offlineApi: error while logging 404 context", e);
            }
          }
          let errBody = null;
          try {
            errBody = await res.json();
          } catch (e) {}
          op.attempts = (op.attempts || 0) + 1;
          if (op.attempts >= MAX_ATTEMPTS) {
            errors.push({
              op,
              status: res.status,
              body: errBody,
              reason: "max attempts reached",
            });
            newQueue.shift();
          } else {
            op.nextAttempt = Date.now() + Math.pow(2, op.attempts) * 1000;
            op.lastError = {
              status: res.status,
              body: errBody,
              when: Date.now(),
            };
            newQueue.shift();
            newQueue.push(op);
            errors.push({ op, status: res.status, body: errBody });
          }
        }
      }
    } catch (err) {
      console.error("offlineApi: Error processing offline op", op, err);
      errors.push({ op, error: String(err) });
      break;
    }
  }

  setQueue(newQueue);
  try {
    const detail = {
      processed: q.length - newQueue.length,
      remaining: newQueue.length,
      errors,
    };
    console.info("offlineApi: queue processing finished", detail);
    dispatchQueueProcessed(detail);
  } catch (e) {}
}

// listen for online event to process queue
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    processQueue();
  });

  if (navigator.onLine) {
    setTimeout(() => processQueue(), 500);
  }
}

export { BASE, apiFetch, apiCreate, apiUpdate, apiDelete, processQueue };
