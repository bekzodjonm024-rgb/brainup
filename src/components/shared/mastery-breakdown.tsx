import { cn } from "@/lib/utils";

interface MasteryBreakdownProps {
  recentAccuracy: number;
  historicalAccuracy: number;
  retrievalScore: number;
  consistencyScore: number;
  className?: string;
}

const COMPONENTS = [
  { key: "recentAccuracy", label: "So'nggi aniqlik", weight: "40%", color: "bg-blue-500" },
  { key: "historicalAccuracy", label: "Umumiy aniqlik", weight: "25%", color: "bg-emerald-500" },
  { key: "retrievalScore", label: "Eslab qolish", weight: "20%", color: "bg-violet-500" },
  { key: "consistencyScore", label: "Izchillik", weight: "15%", color: "bg-amber-500" },
] as const;

export function MasteryBreakdown({
  recentAccuracy, historicalAccuracy, retrievalScore, consistencyScore, className,
}: MasteryBreakdownProps) {
  const values: Record<string, number> = {
    recentAccuracy, historicalAccuracy, retrievalScore, consistencyScore,
  };

  return (
    <div className={cn("space-y-3", className)}>
      {COMPONENTS.map(({ key, label, weight, color }) => {
        const pct = Math.round((values[key] ?? 0) * 100);
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">og'irlik {weight}</span>
                <span className="text-xs font-semibold text-slate-700">{pct}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", color)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
