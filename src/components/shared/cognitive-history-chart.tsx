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
  if (history.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        Grafik uchun kamida 2 ta diagnostik test natijasi kerak
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
