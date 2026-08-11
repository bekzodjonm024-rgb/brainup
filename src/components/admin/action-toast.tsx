"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

export function ActionToast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4 fade-in",
      type === "success"
        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
        : "bg-red-50 border-red-200 text-red-800"
    )}>
      {type === "success"
        ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
      }
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const show = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
  };

  const dismiss = () => setToast(null);

  return { toast, show, dismiss };
}
