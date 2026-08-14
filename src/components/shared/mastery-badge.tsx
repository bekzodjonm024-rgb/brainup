import { cn } from "@/lib/utils";

interface MasteryBadgeProps {
  score: number;
  className?: string;
}

export function MasteryBadge({ score, className }: MasteryBadgeProps) {
  const pct = Math.round(score * 100);

  let color: string;
  let label: string;

  if (pct < 50) {
    color = "bg-red-100 text-red-700";
    label = "Boshlang'ich";
  } else if (pct < 70) {
    color = "bg-amber-100 text-amber-700";
    label = "Rivojlanmoqda";
  } else if (pct < 85) {
    color = "bg-[#FDE8C8] text-blue-700";
    label = "Yaxshi";
  } else {
    color = "bg-emerald-100 text-emerald-700";
    label = "O'zlashtirildi";
  }

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", color, className)}>
      <span>{pct}%</span>
      <span>·</span>
      <span>{label}</span>
    </span>
  );
}
