import React from "react";
import { processQueue } from "../utils/api";
import { useToast } from "./ToastProvider";

export default function SyncButton() {
  const toast = useToast();

  const handleSync = async () => {
    try {
      toast.addToast("Syncing queued changes…", {
        type: "success",
        duration: 2000,
      });
      await processQueue();
      // processQueue dispatches offline-queue-processed which the ToastProvider listens to
    } catch (e) {
      console.error("Sync button error", e);
      toast.addToast("Sync failed", { type: "error" });
    }
  };

  return (
    <button
      onClick={handleSync}
      title="Sync Now"
      className="fixed right-4 bottom-20 z-50 bg-[#169D53] text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600"
    >
      Sync Now
    </button>
  );
}
