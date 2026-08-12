"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTopicPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({
    title: "",
    description: "",
    learningObjective: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const res = await fetch(`/api/courses/${courseId}/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrors(data.error ?? {});
      return;
    }

    router.push(`/professor/courses/${courseId}/topics/${data.id}`);
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-white dark:bg-slate-950">
      <Header title="Yangi mavzu qo'shish" />
      <main className="flex-1 p-6 max-w-2xl">
        <Link href={`/professor/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kursga qaytish
        </Link>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-lg">Mavzu ma&apos;lumotlari</h2>
            <p className="text-sm text-slate-500 mt-1">
              Mavzu yaratilgach material va savollar qo&apos;shishingiz mumkin
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Mavzu nomi <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Pedagogik mahorat tushunchasi"
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {errors.title && <p className="text-xs text-red-400">{errors.title[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="learningObjective" className="text-sm font-medium text-slate-600 dark:text-slate-300">O&apos;quv maqsadi</label>
              <input
                id="learningObjective"
                value={form.learningObjective}
                onChange={(e) => update("learningObjective", e.target.value)}
                placeholder="Dars oxirida talaba... qila oladi"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-slate-400 dark:text-slate-600">Misol: &quot;Pedagogik mahorat tushunchasini ta&apos;riflay oladi&quot;</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-slate-600 dark:text-slate-300">Tavsif</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Mavzu haqida qo'shimcha ma'lumot..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Mavzu yaratish
              </button>
              <Link href={`/professor/courses/${courseId}`}>
                <button
                  type="button"
                  className="px-5 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
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
