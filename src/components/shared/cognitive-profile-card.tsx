import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain } from "lucide-react";

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
    sublabel: "Diqqat bilan bog'liq topshiriqlar",
    barClass: "[&>div]:bg-violet-500",
    textClass: "text-violet-600",
    bgClass: "bg-violet-50",
  },
  {
    key: "workingMemoryScore" as const,
    label: "Ishchi xotira",
    sublabel: "Ishchi xotira topshiriqlari",
    barClass: "[&>div]:bg-blue-500",
    textClass: "text-blue-600",
    bgClass: "bg-blue-50",
  },
  {
    key: "processingSpeedScore" as const,
    label: "Tezlik",
    sublabel: "Qayta ishlash tezligi",
    barClass: "[&>div]:bg-amber-500",
    textClass: "text-amber-600",
    bgClass: "bg-amber-50",
  },
  {
    key: "memoryScore" as const,
    label: "Xotira",
    sublabel: "Xotira ko'rsatkichi",
    barClass: "[&>div]:bg-emerald-500",
    textClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
  },
] as const;

export function CognitiveProfileCard(props: CognitiveProfileCardProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-500" />
          Kognitiv profil
        </CardTitle>
        <p className="text-xs text-slate-400">
          Klinik tashxis emas — o&apos;quv moslashuvi uchun
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map(({ key, label, sublabel, barClass, textClass, bgClass }) => {
          const raw = props[key];
          const value = raw !== null && raw !== undefined ? Math.round(raw) : null;
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${bgClass} ${textClass}`}>
                    {label}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:block">{sublabel}</span>
                </div>
                <span className={`text-sm font-semibold ${value !== null ? textClass : "text-slate-400"}`}>
                  {value !== null ? `${value}/100` : "—"}
                </span>
              </div>
              <Progress
                value={value ?? 0}
                className={`h-2 bg-slate-100 ${barClass}`}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
