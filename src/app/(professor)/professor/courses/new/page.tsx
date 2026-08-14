"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Faculty {
  id: string;
  name: string;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    semester: "",
    facultyId: "",
  });

  useEffect(() => {
    fetch("/api/universities")
      .then((r) => r.json())
      .then((data: { faculties: Faculty[] }[]) => {
        const allFaculties = data.flatMap((u) => u.faculties);
        setFaculties(allFaculties);
      });
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, facultyId: form.facultyId || undefined }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrors(data.error ?? {});
      return;
    }

    router.push(`/professor/courses/${data.id}`);
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#F8F5EF] dark:bg-[#100D09]">
      <Header title="Yangi kurs yaratish" />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <Link href="/professor/courses" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Orqaga
        </Link>

        <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#17130E] p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-lg">Kurs ma&apos;lumotlari</h2>
            <p className="text-sm text-slate-500 mt-1">
              Kurs yaratilgach mavzular va materiallar qo&apos;shishingiz mumkin
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Kurs nomi <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Pedagogik mahorat"
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1C1710] text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#B45309] transition-colors"
              />
              {errors.title && <p className="text-xs text-red-400">{errors.title[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-slate-600 dark:text-slate-300">Tavsif</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Kurs haqida qisqacha ma'lumot..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1C1710] text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#B45309] transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="semester" className="text-sm font-medium text-slate-600 dark:text-slate-300">Semester</label>
                <input
                  id="semester"
                  value={form.semester}
                  onChange={(e) => update("semester", e.target.value)}
                  placeholder="2024-2025/1"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1C1710] text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#B45309] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Fakultet</label>
                <Select value={form.facultyId} onValueChange={(v) => update("facultyId", v)}>
                  <SelectTrigger className="h-10 border-slate-300 dark:border-white/10 bg-white dark:bg-[#1C1710] text-slate-900 dark:text-slate-200">
                    <SelectValue placeholder="Tanlash (ixtiyoriy)" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-[#B45309] hover:bg-[#92400E] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Kurs yaratish
              </button>
              <Link href="/professor/courses">
                <button
                  type="button"
                  className="px-5 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2720] border border-slate-300 dark:border-white/10 rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
