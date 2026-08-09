"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldOff, ShieldCheck } from "lucide-react";

export function UserToggle({
  userId,
  isActive,
  name,
}: {
  userId: string;
  isActive: boolean;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const action = isActive ? "bloklash" : "faollashtirish";
    if (!confirm(`${name}ni ${action}ni tasdiqlaysizmi?`)) return;
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={isActive ? "text-slate-400 hover:text-red-600" : "text-slate-400 hover:text-emerald-600"}
      onClick={handleToggle}
      disabled={loading}
      title={isActive ? "Bloklash" : "Faollashtirish"}
    >
      {isActive ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
    </Button>
  );
}
