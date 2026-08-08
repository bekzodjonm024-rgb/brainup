"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function StartAssessmentButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/assessment/start", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        router.push(`/assessment/${data.id}`);
        return;
      }
      if (res.status === 409 && data.completed) {
        // Profile should be visible — just refresh the page
        router.refresh();
        return;
      }
      setErrorMsg(data.error ?? "Baholashni boshlashda xatolik yuz berdi.");
    } catch {
      setErrorMsg("Tarmoq xatosi. Internet aloqangizni tekshiring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleStart} disabled={loading} className="w-full" size="lg">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Baholashni boshlash
      </Button>
      {errorMsg && (
        <p className="text-sm text-red-600 text-center">{errorMsg}</p>
      )}
    </div>
  );
}
