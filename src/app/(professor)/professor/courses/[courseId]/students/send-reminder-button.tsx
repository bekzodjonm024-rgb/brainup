"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  courseId: string;
}

export function SendReminderButton({ courseId }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error" | "disabled">("idle");
  const [message, setMessage] = useState("");

  async function handleSend() {
    setState("loading");
    try {
      const res = await fetch("/api/notifications/retrieval-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message ?? "Yuborildi");
        setState("success");
      } else if (res.status === 503) {
        setState("disabled");
        setMessage("Email xizmati sozlanmagan");
      } else {
        setState("error");
        setMessage(data.error ?? "Xato yuz berdi");
      }
    } catch {
      setState("error");
      setMessage("Tarmoq xatosi");
    }
  }

  if (state === "success") {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {message}
      </div>
    );
  }

  if (state === "disabled") {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {message}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {state === "error" && (
        <span className="text-xs text-red-600">{message}</span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSend}
        disabled={state === "loading"}
      >
        {state === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
        ) : (
          <Bell className="h-4 w-4 mr-1.5" />
        )}
        Takrorlash eslatmasi
      </Button>
    </div>
  );
}
