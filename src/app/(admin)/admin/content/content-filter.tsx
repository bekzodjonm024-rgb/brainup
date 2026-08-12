"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "PENDING_REVIEW", label: "Kutmoqda", activeColor: "text-amber-400 border-amber-500" },
  { key: "APPROVED", label: "Tasdiqlangan", activeColor: "text-emerald-400 border-emerald-500" },
  { key: "REJECTED", label: "Rad etilgan", activeColor: "text-red-400 border-red-500" },
  { key: "DRAFT", label: "Qoralama", activeColor: "text-slate-400 border-slate-500" },
] as const;

export function ContentFilter({
  counts,
  active,
}: {
  counts: Record<string, number>;
  active: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setTab(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", key);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-0">
      {TABS.map(({ key, label, activeColor }) => {
        const count = counts[key] ?? 0;
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              isActive
                ? `${activeColor} bg-transparent`
                : "text-slate-500 dark:text-slate-600 border-transparent hover:text-slate-600 dark:hover:text-slate-400"
            )}
          >
            {label}
            {count > 0 && (
              <span className={cn(
                "inline-flex h-4.5 min-w-4 items-center justify-center rounded-full px-1.5 text-[11px] font-bold leading-none",
                isActive
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-600"
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
