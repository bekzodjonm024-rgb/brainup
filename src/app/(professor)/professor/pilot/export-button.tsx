"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  type: string;
  label: string;
  courseId?: string;
  size?: "default" | "xs";
}

export function ExportButton({ type, label, courseId, size = "default" }: Props) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    const params = new URLSearchParams({ type });
    if (courseId) params.set("courseId", courseId);

    const res = await fetch(`/api/research/export?${params}`);
    if (!res.ok) { setLoading(false); return; }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const cd = res.headers.get("content-disposition") ?? "";
    const match = cd.match(/filename="([^"]+)"/);
    a.download = match?.[1] ?? `brainup_${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  }

  if (size === "xs") {
    return (
      <button
        onClick={handle}
        disabled={loading}
        className={cn(
          "inline-flex items-center gap-1 text-xs text-[#B45309] hover:underline disabled:opacity-50"
        )}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
        CSV
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handle}
      disabled={loading}
      className="w-full justify-start text-xs gap-2"
    >
      {loading
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <Download className="h-3.5 w-3.5" />
      }
      {label}
    </Button>
  );
}
