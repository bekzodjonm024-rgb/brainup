"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, UserPlus } from "lucide-react";

export function AddProfessorForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", title: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  function update(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: [] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const res = await fetch("/api/admin/professors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setForm({ firstName: "", lastName: "", email: "", password: "", title: "" });
      router.refresh();
    } else {
      setErrors(data.error ?? {});
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <p className="font-medium text-emerald-400">Professor muvaffaqiyatli qo'shildi</p>
          <button onClick={() => setSuccess(false)} className="text-sm text-emerald-600 hover:text-emerald-400 underline mt-0.5 transition-colors">
            Yana qo'shish
          </button>
        </div>
      </div>
    );
  }

  function fieldError(f: string) { return errors[f]?.[0]; }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-6 max-w-lg">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-5">
        <UserPlus className="h-4 w-4 text-violet-400" />
        Yangi professor
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Ism</Label>
            <input
              id="firstName"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
              className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1e2840] text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {fieldError("firstName") && <p className="text-xs text-red-400">{fieldError("firstName")}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Familiya</Label>
            <input
              id="lastName"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
              className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1e2840] text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {fieldError("lastName") && <p className="text-xs text-red-400">{fieldError("lastName")}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Unvon (ixtiyoriy)</Label>
          <input
            id="title"
            placeholder="Prof. Dr., PhD, ..."
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1e2840] text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prof-email" className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Email</Label>
          <input
            id="prof-email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1e2840] text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {fieldError("email") && <p className="text-xs text-red-400">{fieldError("email")}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prof-password" className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Parol</Label>
          <input
            id="prof-password"
            type="password"
            placeholder="Kamida 6 belgi"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1e2840] text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {fieldError("password") && <p className="text-xs text-red-400">{fieldError("password")}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white border-0"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Professor qo'shish
        </Button>
      </form>
    </div>
  );
}
