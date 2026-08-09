"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function EnrollButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleEnroll() {
    setLoading(true);
    const res = await fetch("/api/student/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    setLoading(false);
    if (res.ok || res.status === 409) router.refresh();
  }

  return (
    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleEnroll} disabled={loading}>
      {loading ? "Yozilmoqda..." : "Kursga yozilish"}
    </Button>
  );
}
