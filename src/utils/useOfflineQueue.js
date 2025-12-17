import { useState, useEffect } from "react";

const QUEUE_KEY = "offline_api_queue";

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

export function useOfflineQueue(cacheKey = null) {
  const [count, setCount] = useState(() => {
    if (!cacheKey) return 0;
    const q = readQueue();
    return q.filter((op) => op.cacheKey === cacheKey).length;
  });

  useEffect(() => {
    function update() {
      if (!cacheKey) return setCount(0);
      const q = readQueue();
      setCount(q.filter((op) => op.cacheKey === cacheKey).length);
    }

    update();
    window.addEventListener("offline-queue-updated", update);
    window.addEventListener("offline-queue-processed", update);
    return () => {
      window.removeEventListener("offline-queue-updated", update);
      window.removeEventListener("offline-queue-processed", update);
    };
  }, [cacheKey]);

  return { count };
}

export function getQueuedOperations(cacheKey = null) {
  const q = readQueue();
  if (!cacheKey) return q;
  return q.filter((op) => op.cacheKey === cacheKey);
}
