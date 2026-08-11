"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "PENDING_REVIEW", label: "Kutmoqda", color: "text-amber-600 border-amber-500" },
  { key: "APPROVED", label: "Tasdiqlangan", color: "text-emerald-600 border-emerald-500" },
  { key: "REJECTED", label: "Rad etilgan", color: "text-red-500 border-red-400" },
  { key: "DRAFT", label: "Qoralama", color: "text-slate-500 border-slate-400" },
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
    <div className="flex items-center gap-1 border-b border-slate-100 pb-0">
      {TABS.map(({ key, label, color }) => {
        const count = counts[key] ?? 0;
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              isActive
                ? `${color} bg-transparent`
                : "text-slate-400 border-transparent hover:text-slate-600"
            )}
          >
            {label}
            {count > 0 && (
              <span className={cn(
                "inline-flex h-4.5 min-w-4 items-center justify-center rounded-full px-1.5 text-[11px] font-bold leading-none",
                isActive ? "bg-current/10" : "bg-slate-100 text-slate-500"
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
