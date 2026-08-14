"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function StartAssessmentButton({ retake = false }: { retake?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/assessment/start", { method: "POST" });
      const data = await res.json();
      if (res.ok) { router.push(`/assessment/${data.id}`); return; }
      if (res.status === 409 && data.completed) { router.refresh(); return; }
      setErrorMsg(data.error ?? "Baholashni boshlashda xatolik yuz berdi.");
    } catch {
      setErrorMsg("Tarmoq xatosi. Internet aloqangizni tekshiring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleStart}
        disabled={loading}
        size="lg"
        className={
          retake
            ? "w-full h-11 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2a2720] bg-transparent"
            : "w-full h-11 bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-600/20"
        }
        variant={retake ? "outline" : "default"}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {retake ? "Qayta topshirish" : "Baholashni boshlash"}
      </Button>
      {errorMsg && (
        <p className="text-sm text-red-400 text-center">{errorMsg}</p>
      )}
    </div>
  );
}
