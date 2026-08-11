"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EyeOff, Eye } from "lucide-react";

export function CourseToggle({
  courseId,
  isActive,
  title,
}: {
  courseId: string;
  isActive: boolean;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const action = isActive ? "o'chirish" : "faollashtirish";
    if (!confirm(`"${title}" kursini ${action}ni tasdiqlaysizmi?`)) return;
    setLoading(true);
    await fetch(`/api/admin/courses/${courseId}`, {
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
      title={isActive ? "O'chirish" : "Faollashtirish"}
    >
      {isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
  );
}
