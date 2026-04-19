"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function SyncSheetsButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/sync/sheets");
      const data = await res.json();
      if (data.synced) {
        setStatus("success");
        setMessage(`✅ סונכרן ${data.rows} רשומות`);
      } else {
        setStatus("error");
        setMessage(data.message ?? "שגיאה בסנכרון");
      }
    } catch {
      setStatus("error");
      setMessage("שגיאת רשת");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleSync}
        loading={status === "loading"}
        title="סנכרן נתוני נוכחות ל-Google Sheets"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
        סנכרון Google Sheets
      </Button>
      {message && (
        <span
          className={`text-xs font-medium ${status === "success" ? "text-green-600" : "text-red-600"}`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
