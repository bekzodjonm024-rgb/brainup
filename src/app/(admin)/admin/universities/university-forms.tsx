"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function AddUniversityForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", shortName: "", city: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/universities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Xatolik yuz berdi");
      return;
    }
    setForm({ name: "", shortName: "", city: "" });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-5">
      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Yangi universitet qo&apos;shish</h3>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="text-xs text-slate-500 font-medium">Nomi *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="To'liq nomi"
            className="h-9 w-64 px-3 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1e2840] text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#B45309] transition-colors"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500 font-medium">Qisqa nomi</label>
          <input
            value={form.shortName}
            onChange={(e) => setForm((p) => ({ ...p, shortName: e.target.value }))}
            placeholder="NamDPI"
            className="h-9 w-28 px-3 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1e2840] text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#B45309] transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500 font-medium">Shahar</label>
          <input
            value={form.city}
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            placeholder="Namangan"
            className="h-9 w-32 px-3 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1e2840] text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#B45309] transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-9 px-4 flex items-center gap-1.5 text-sm bg-[#B45309] hover:bg-[#92400E] disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Qo&apos;shish
        </button>
        {error && <p className="text-xs text-red-400 w-full">{error}</p>}
      </form>
    </div>
  );
}

export function AddFacultyForm({ universityId, universityName }: { universityId: string; universityName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`/api/admin/universities/${universityId}/faculties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Xatolik");
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`${universityName} — yangi fakultet`}
        className="h-8 flex-1 px-3 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1e2840] text-slate-900 dark:text-slate-200 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#B45309] transition-colors"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="h-8 px-3 flex items-center gap-1 text-xs bg-slate-100 dark:bg-[#1e2840] hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 disabled:opacity-50 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Fakultet
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
