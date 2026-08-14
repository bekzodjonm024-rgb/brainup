"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteCourseButton({
  courseId,
  courseTitle,
  redirectTo,
}: {
  courseId: string;
  courseTitle: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (res.ok) {
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } else {
        setConfirming(false);
      }
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-stone-500 dark:text-slate-400 hidden sm:inline">O&apos;chirilsinmi?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-medium px-2 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60"
        >
          {loading ? "..." : "Ha"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-medium px-2 py-1 rounded-md bg-stone-100 dark:bg-[#2a2720] hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-600 dark:text-slate-300 transition-colors"
        >
          Bekor
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`"${courseTitle}" kursini o'chirish`}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
