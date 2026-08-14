import { Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CognitiveProfileCardProps {
  attentionScore: number | null;
  workingMemoryScore: number | null;
  processingSpeedScore: number | null;
  memoryScore: number | null;
}

const metrics = [
  {
    key: "attentionScore" as const,
    label: "Diqqat",
    sublabel: "Diqqat bilan bog'liq",
    barClass: "[&>div]:bg-violet-500",
    textClass: "text-violet-400",
    bgClass: "bg-violet-500/10",
  },
  {
    key: "workingMemoryScore" as const,
    label: "Ishchi xotira",
    sublabel: "Ishchi xotira",
    barClass: "[&>div]:bg-blue-500",
    textClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
  },
  {
    key: "processingSpeedScore" as const,
    label: "Tezlik",
    sublabel: "Qayta ishlash tezligi",
    barClass: "[&>div]:bg-amber-500",
    textClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
  },
  {
    key: "memoryScore" as const,
    label: "Xotira",
    sublabel: "Xotira ko'rsatkichi",
    barClass: "[&>div]:bg-emerald-500",
    textClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
  },
] as const;

export function CognitiveProfileCard(props: CognitiveProfileCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Brain className="h-3.5 w-3.5 text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Kognitiv profil</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-600">Klinik tashxis emas — o&apos;quv moslashuvi uchun</p>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map(({ key, label, sublabel, barClass, textClass, bgClass }) => {
          const raw   = props[key];
          const value = raw !== null && raw !== undefined ? Math.round(raw * 100) : null;
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bgClass} ${textClass}`}>
                    {label}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-600 hidden sm:block">{sublabel}</span>
                </div>
                <span className={`text-sm font-bold ${value !== null ? textClass : "text-slate-300 dark:text-slate-700"}`}>
                  {value !== null ? `${value}` : "—"}
                  {value !== null && <span className="text-xs font-normal text-slate-400 dark:text-slate-600">/100</span>}
                </span>
              </div>
              <Progress value={value ?? 0} className={`h-1.5 bg-slate-200 dark:bg-[#1e2840] ${barClass}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
