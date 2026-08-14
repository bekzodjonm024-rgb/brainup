"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface HistoryEntry {
  id: string;
  attentionScore: number;
  workingMemoryScore: number;
  processingSpeedScore: number;
  memoryScore: number;
  takenAt: string;
}

interface Props {
  history: HistoryEntry[];
}

const LINES = [
  { key: "attentionScore", label: "Diqqat", color: "#6366f1" },
  { key: "workingMemoryScore", label: "Ishchi xotira", color: "#3b82f6" },
  { key: "processingSpeedScore", label: "Tezlik", color: "#f59e0b" },
  { key: "memoryScore", label: "Xotira", color: "#10b981" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" });
}

export function CognitiveHistoryChart({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-stone-400 text-sm">
        Hali diagnostik test topshirilmagan
      </div>
    );
  }

  if (history.length === 1) {
    const h = history[0];
    const metrics = [
      { label: "Diqqat",        score: h.attentionScore,        color: "bg-indigo-500", textColor: "text-indigo-600" },
      { label: "Ishchi xotira", score: h.workingMemoryScore,    color: "bg-[#FEF4E7]0",   textColor: "text-[#B45309]" },
      { label: "Tezlik",        score: h.processingSpeedScore,  color: "bg-amber-500",  textColor: "text-amber-600" },
      { label: "Xotira",        score: h.memoryScore,           color: "bg-emerald-500", textColor: "text-emerald-600" },
    ];
    return (
      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-stone-500">{m.label}</span>
              <span className={`font-semibold ${m.textColor}`}>{Math.round(m.score)}%</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.score}%` }} />
            </div>
          </div>
        ))}
        <p className="text-xs text-stone-400 pt-1">
          1-test: {formatDate(h.takenAt)} — dinamika grafigi 2-testdan keyin ko&apos;rinadi
        </p>
      </div>
    );
  }

  const data = history.map((h) => ({
    date: formatDate(h.takenAt),
    attentionScore: Math.round(h.attentionScore),
    workingMemoryScore: Math.round(h.workingMemoryScore),
    processingSpeedScore: Math.round(h.processingSpeedScore),
    memoryScore: Math.round(h.memoryScore),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
        <Tooltip formatter={(v) => `${v}%`} />
        <Legend />
        {LINES.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stroke={l.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
