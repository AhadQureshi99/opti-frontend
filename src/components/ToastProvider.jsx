import React, { createContext, useContext, useState, useCallback } from "react";
import { useEffect } from "react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, options = {}) => {
    const id = ++idCounter;
    const toast = {
      id,
      message,
      type: options.type || "success",
      duration: options.duration || 4000,
    };
    setToasts((t) => [...t, toast]);
    if (toast.duration > 0) {
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, toast.duration);
    }
    return id;
  }, []);

  const removeToast = useCallback(
    (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    []
  );

  // listen for offline queue processing events and show a toast
  useEffect(() => {
    function onQueueProcessed(e) {
      try {
        const d = e && e.detail ? e.detail : {};
        const processed = d.processed || 0;
        const errors = d.errors || [];
        if (processed > 0 && errors.length === 0) {
          addToast(`${processed} change${processed > 1 ? "s" : ""} synced`, {
            type: "success",
            duration: 4000,
          });
        } else if (errors.length > 0) {
          addToast(
            `Sync completed with ${errors.length} error${
              errors.length > 1 ? "s" : ""
            }`,
            {
              type: "error",
              duration: 6000,
            }
          );
          console.error("offline-queue errors:", errors);
        }
      } catch (err) {
        console.error(
          "ToastProvider: error handling offline-queue-processed",
          err
        );
      }
    }

    window.addEventListener("offline-queue-processed", onQueueProcessed);
    return () =>
      window.removeEventListener("offline-queue-processed", onQueueProcessed);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full rounded-md shadow-lg p-3 text-sm ${
              t.type === "error"
                ? "bg-red-600 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
