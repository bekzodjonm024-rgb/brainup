"use client";

import type { Metadata } from "next";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Brain, TrendingUp, RefreshCw } from "lucide-react";
import { BrainUPLogo } from "@/components/ui/brainup-logo";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Faculty { id: string; name: string; }
interface University { id: string; name: string; faculties: Faculty[]; }

export default function RegisterPage() {
  const router = useRouter();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    universityId: "",
    facultyId: "",
    yearLevel: "1",
    groupName: "",
  });

  useEffect(() => {
    fetch("/api/universities").then((r) => r.json()).then(setUniversities);
  }, []);

  const selectedUniversity = universities.find((u) => u.id === form.universityId);

  function update(field: string, value: string) {
    if (field === "universityId") {
      setForm((prev) => ({ ...prev, universityId: value, facultyId: "" }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, yearLevel: parseInt(form.yearLevel) }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (typeof data.error === "object" && data.error !== null) {
        setErrors(data.error);
      } else {
        setErrors({ _form: [data.error ?? "Xatolik yuz berdi. Qayta urinib ko'ring."] });
      }
      return;
    }

    router.push("/login?registered=1");
  }

  function fieldError(field: string) {
    return errors[field]?.[0];
  }

  return (
    <>
      <style>{`
        @keyframes orb-float {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-24px) scale(1.03); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .orb-a { animation: orb-float 9s  ease-in-out infinite; }
        .orb-b { animation: orb-float 13s ease-in-out infinite 3s; }
        .shimmer-text {
          background: linear-gradient(90deg,#93c5fd 0%,#e0e7ff 30%,#818cf8 60%,#3b82f6 80%,#93c5fd 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .auth-input {
          width: 100%;
          height: 42px;
          padding: 0 14px;
          border-radius: 10px;
          background: rgb(15 23 42);
          border: 1px solid rgb(30 41 59);
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color .2s;
        }
        .auth-input::placeholder { color: rgb(71 85 105); }
        .auth-input:focus { border-color: rgb(59 130 246); }
      `}</style>

      <div className="min-h-screen bg-slate-950 flex">

        {/* ── LEFT BRAND PANEL ── */}
        <div className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden p-14 border-r border-white/5 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-slate-950 to-indigo-950/30 pointer-events-none" />
          <div className="orb-a absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-blue-700/10 blur-[100px] pointer-events-none" />
          <div className="orb-b absolute bottom-0 right-0 w-[280px] h-[280px] rounded-full bg-indigo-700/8 blur-[80px] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3 mb-14">
              <BrainUPLogo size="md" />
              <span className="f-syne font-bold text-white text-xl">BrainUP</span>
            </Link>

            <h2 className="f-syne text-[2.2rem] font-bold text-white leading-tight mb-5">
              Adaptiv ta&apos;lim —<br />
              <span className="shimmer-text">bugundan</span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-10 max-w-[240px]">
              Ro&apos;yxatdan o&apos;ting va kognitiv profil asosida shaxsiy yo&apos;nalish oling.
            </p>

            <div className="space-y-3">
              {[
                { Icon: Brain,     text: "Boshlang'ich baholash — 10 daqiqa",  iconCls: "text-violet-400", bgCls: "bg-violet-500/10 border-violet-500/20" },
                { Icon: TrendingUp,text: "Adaptiv dars rejasi yaratiladi",       iconCls: "text-blue-400",   bgCls: "bg-blue-500/10   border-blue-500/20" },
                { Icon: RefreshCw, text: "Bilim 30 kungacha mustahkamlanadi",    iconCls: "text-emerald-400",bgCls: "bg-emerald-500/10 border-emerald-500/20" },
              ].map(({ Icon, text, iconCls, bgCls }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${bgCls}`}>
                    <Icon className={`h-4 w-4 ${iconCls}`} />
                  </div>
                  <span className="text-sm text-slate-400">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-4 py-3 w-fit">
            <Image src="/namdpi-logo.jpg" alt="NamDPI" width={40} height={40} className="rounded-full object-cover" unoptimized />
            <div>
              <p className="text-xs font-semibold text-slate-300">NamDPI</p>
              <p className="text-[11px] text-slate-600">Namangan Davlat Pedagogika Instituti</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-y-auto">
          <div className="w-full max-w-[420px] py-8">

            {/* Mobile brand */}
            <div className="lg:hidden flex flex-col items-center gap-2 mb-8">
              <BrainUPLogo size="lg" href="/" />
              <span className="f-syne font-bold text-white text-xl">BrainUP</span>
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5 mt-1">
                <Image src="/namdpi-logo.jpg" alt="NamDPI" width={18} height={18} className="rounded-full" unoptimized />
                <span className="text-xs text-slate-500">NamDPI hamkorligida</span>
              </div>
            </div>

            <h2 className="f-syne text-2xl font-bold text-white mb-1">Hisob yarating</h2>
            <p className="text-slate-500 text-sm mb-8">Talaba sifatida ro&apos;yxatdan o&apos;ting</p>

            {errors._form?.[0] && (
              <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errors._form[0]}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Ism</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    placeholder="Sardor"
                    required
                    className="auth-input"
                  />
                  {fieldError("firstName") && <p className="text-xs text-red-400">{fieldError("firstName")}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Familiya</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    placeholder="Rahimov"
                    required
                    className="auth-input"
                  />
                  {fieldError("lastName") && <p className="text-xs text-red-400">{fieldError("lastName")}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="example@email.com"
                  required
                  autoComplete="email"
                  className="auth-input"
                />
                {fieldError("email") && <p className="text-xs text-red-400">{fieldError("email")}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Parol</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Kamida 6 ta belgi"
                  required
                  autoComplete="new-password"
                  className="auth-input"
                />
                {fieldError("password") && <p className="text-xs text-red-400">{fieldError("password")}</p>}
              </div>

              {/* Divider */}
              <div className="border-t border-white/5 pt-4">
                <p className="text-xs text-slate-600 mb-4 uppercase tracking-wide font-medium">O&apos;quv ma&apos;lumotlari</p>

                {/* University */}
                <div className="space-y-1.5 mb-3">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Universitet</label>
                  <Select value={form.universityId} onValueChange={(v) => update("universityId", v)}>
                    <SelectTrigger className="h-[42px] rounded-[10px] bg-slate-900 border-slate-800 text-slate-300 text-sm focus:border-blue-500 focus:ring-0 data-[placeholder]:text-slate-600">
                      <SelectValue placeholder="Universitetni tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      {universities.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer">
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError("universityId") && <p className="text-xs text-red-400">{fieldError("universityId")}</p>}
                </div>

                {/* Faculty */}
                {selectedUniversity && (
                  <div className="space-y-1.5 mb-3">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Fakultet</label>
                    <Select value={form.facultyId} onValueChange={(v) => update("facultyId", v)}>
                      <SelectTrigger className="h-[42px] rounded-[10px] bg-slate-900 border-slate-800 text-slate-300 text-sm focus:border-blue-500 focus:ring-0 data-[placeholder]:text-slate-600">
                        <SelectValue placeholder="Fakultetni tanlang" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {selectedUniversity.faculties.map((f) => (
                          <SelectItem key={f.id} value={f.id} className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer">
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldError("facultyId") && <p className="text-xs text-red-400">{fieldError("facultyId")}</p>}
                  </div>
                )}

                {/* Year + Group */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Kurs</label>
                    <Select value={form.yearLevel} onValueChange={(v) => update("yearLevel", v)}>
                      <SelectTrigger className="h-[42px] rounded-[10px] bg-slate-900 border-slate-800 text-slate-300 text-sm focus:border-blue-500 focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {[1, 2, 3, 4, 5, 6].map((y) => (
                          <SelectItem key={y} value={String(y)} className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer">
                            {y}-kurs
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Guruh</label>
                    <input
                      value={form.groupName}
                      onChange={(e) => update("groupName", e.target.value)}
                      placeholder="M-11"
                      className="auth-input"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-600/20 gap-2 mt-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Ro&apos;yxatdan o&apos;tish
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center text-sm text-slate-600">
              Hisobingiz bormi?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Kirish
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
