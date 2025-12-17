import { getAuthHeaders } from "./api";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) ||
  "https://api.optislip.com";

/**
 * Frontend Offline Sync Client
 * Communicates with backend sync endpoints for offline-first workflow
 */

// Get all pending syncs from backend
export async function getPendingSyncsFromBackend() {
  try {
    const response = await fetch(`${BASE_URL}/api/sync/pending`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("[Sync Client] Pending syncs:", data);
    return data;
  } catch (error) {
    console.error("[Sync Client] Error getting pending syncs:", error);
    throw error;
  }
}

// Send single item to sync queue
export async function sendToSyncQueue(endpoint, method, data, deviceId = null) {
  try {
    const response = await fetch(`${BASE_URL}/api/sync/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        endpoint,
        method,
        data,
        deviceId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add to sync queue");
    }

    const result = await response.json();
    console.log("[Sync Client] Added to queue:", result);
    return result;
  } catch (error) {
    console.error("[Sync Client] Error sending to sync queue:", error);
    throw error;
  }
}

// Send multiple items to sync queue at once
export async function bulkSyncQueue(items) {
  try {
    const response = await fetch(`${BASE_URL}/api/sync/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Bulk sync failed");
    }

    const result = await response.json();
    console.log("[Sync Client] Bulk sync added:", result);
    return result;
  } catch (error) {
    console.error("[Sync Client] Bulk sync error:", error);
    throw error;
  }
}

// Trigger sync processing on backend
export async function triggerBackendSync() {
  try {
    const response = await fetch(`${BASE_URL}/api/sync/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Sync process failed");
    }

    const result = await response.json();
    console.log("[Sync Client] Sync processed:", result);

    // Dispatch event for UI
    window.dispatchEvent(
      new CustomEvent("backend-sync-complete", {
        detail: result,
      })
    );

    return result;
  } catch (error) {
    console.error("[Sync Client] Sync process error:", error);
    throw error;
  }
}

// Clear sync queue (for testing/debugging)
export async function clearBackendSyncQueue() {
  try {
    const response = await fetch(`${BASE_URL}/api/sync/clear`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to clear sync queue");
    }

    const result = await response.json();
    console.log("[Sync Client] Sync queue cleared:", result);
    return result;
  } catch (error) {
    console.error("[Sync Client] Error clearing queue:", error);
    throw error;
  }
}

// Initialize auto-sync - periodically trigger backend sync when online
export function initializeBackendSync(intervalMs = 30000) {
  console.log("[Sync Client] Initializing backend sync...");

  // Trigger sync when online
  window.addEventListener("online", async () => {
    console.log("[Sync Client] Online detected - triggering sync");
    try {
      await triggerBackendSync();
    } catch (error) {
      console.error("[Sync Client] Auto-sync error:", error);
    }
  });

  // Periodic sync check
  setInterval(async () => {
    if (navigator.onLine) {
      try {
        const pending = await getPendingSyncsFromBackend();
        if (pending.count > 0) {
          console.log(
            `[Sync Client] Found ${pending.count} pending items - syncing`
          );
          await triggerBackendSync();
        }
      } catch (error) {
        console.error("[Sync Client] Periodic sync error:", error);
      }
    }
  }, intervalMs);

  console.log("[Sync Client] Backend sync initialized");
}

// Offline-aware wrapper for API calls
export async function apiCallWithSync(endpoint, method, data) {
  if (!navigator.onLine) {
    // Offline - queue for sync
    console.log("[Sync Client] Offline - queuing request:", endpoint);
    return await sendToSyncQueue(endpoint, method, data);
  }

  // Online - make direct request
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };

  const url = method === "GET" ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers,
    body: method !== "GET" ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return await response.json();
}
