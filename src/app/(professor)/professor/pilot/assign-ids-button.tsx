"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, FlaskConical } from "lucide-react";

export function AssignIdsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  async function handle() {
    setLoading(true);
    const res = await fetch("/api/research/assign-ids", { method: "POST" });
    const data = await res.json();
    setDone(data.assigned ?? 0);
    setLoading(false);
    router.refresh();
  }

  if (done !== null) {
    return (
      <span className="text-sm font-medium text-emerald-700">
        ✓ {done} ta talabaga ID berildi
      </span>
    );
  }

  return (
    <Button size="sm" onClick={handle} disabled={loading} className="shrink-0 bg-amber-600 hover:bg-amber-700">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <FlaskConical className="h-3.5 w-3.5 mr-1.5" />}
      ID berish
    </Button>
  );
}
