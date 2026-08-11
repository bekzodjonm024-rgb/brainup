"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export function ContentActions({
  contentId,
  status,
  title,
}: {
  contentId: string;
  status: string;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "approve" | "reject") {
    const label = action === "approve" ? "tasdiqlash" : "rad etish";
    if (!confirm(`"${title}" kontentini ${label}ni tasdiqlaysizmi?`)) return;
    setLoading(true);
    await fetch(`/api/content/${contentId}/${action}`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  if (status !== "PENDING_REVIEW") return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="text-slate-400 hover:text-emerald-600"
        onClick={() => handleAction("approve")}
        disabled={loading}
        title="Tasdiqlash"
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-slate-400 hover:text-red-600"
        onClick={() => handleAction("reject")}
        disabled={loading}
        title="Rad etish"
      >
        <XCircle className="h-4 w-4" />
      </Button>
    </div>
  );
}
