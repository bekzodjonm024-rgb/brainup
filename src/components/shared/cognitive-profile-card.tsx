import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CognitiveProfileCardProps {
  attentionScore: number | null;
  workingMemoryScore: number | null;
  processingSpeedScore: number | null;
  memoryScore: number | null;
}

const metrics = [
  { key: "attentionScore", label: "Diqqat bilan bog'liq topshiriqlar" },
  { key: "workingMemoryScore", label: "Ishchi xotira topshiriqlari" },
  { key: "processingSpeedScore", label: "Qayta ishlash tezligi" },
  { key: "memoryScore", label: "Xotira ko'rsatkichi" },
] as const;

export function CognitiveProfileCard(props: CognitiveProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Boshlang'ich baholash natijalari</CardTitle>
        <p className="text-xs text-slate-500">
          Bu natijalar klinik tashxis emas — ushbu topshiriqlardagi ko'rsatkichlar.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map(({ key, label }) => {
          const raw = props[key];
          const value = raw !== null && raw !== undefined ? Math.round(raw) : null;
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-medium text-slate-900">
                  {value !== null ? `${value}/100` : "—"}
                </span>
              </div>
              <Progress value={value ?? 0} className="h-1.5" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
