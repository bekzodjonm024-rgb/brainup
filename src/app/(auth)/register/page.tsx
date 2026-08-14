"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Brain, TrendingUp, RefreshCw, ArrowRight } from "lucide-react";
import { BrainUPLogo } from "@/components/ui/brainup-logo";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const inputCls = "w-full h-[42px] px-[14px] rounded-xl bg-white border text-slate-900 text-sm outline-none transition-colors focus:border-blue-500 placeholder:text-slate-400 shadow-sm";

interface Faculty { id: string; name: string; }
interface University { id: string; name: string; faculties: Faculty[]; }

export default function RegisterPage() {
  const router = useRouter();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    universityId: "", facultyId: "", yearLevel: "1", groupName: "",
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
        setErrors({ _form: [data.error ?? "Xatolik yuz berdi."] });
      }
      return;
    }
    router.push("/login?registered=1");
  }

  function fieldError(field: string) {
    return errors[field]?.[0];
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f8faff" }}>

      {/* LEFT — orange brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden p-14 bg-blue-600 rounded-r-3xl shrink-0">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blue-500/30 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-blue-700/20 -translate-x-1/4 translate-y-1/4 pointer-events-none" />

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-14">
            <BrainUPLogo size="md" />
            <span className="font-extrabold text-white text-xl tracking-tight">BrainUP</span>
          </Link>

          <h2 className="font-black text-white text-[2.2rem] leading-tight mb-4 uppercase tracking-tight">
            ADAPTIV TA&apos;LIM —<br />
            BUGUNDAN
          </h2>
          <p className="text-white/65 text-sm leading-relaxed mb-10 max-w-[240px]">
            Ro&apos;yxatdan o&apos;ting va kognitiv profil asosida shaxsiy yo&apos;nalish oling.
          </p>

          <div className="space-y-3">
            {[
              { Icon: Brain,      text: "Boshlang'ich baholash — 10 daqiqa" },
              { Icon: TrendingUp, text: "Adaptiv dars rejasi yaratiladi" },
              { Icon: RefreshCw,  text: "Bilim 30 kungacha mustahkamlanadi" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-white/75">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3 rounded-2xl bg-white/15 border border-white/20 px-4 py-3 w-fit">
          <Image src="/namdpi-logo.jpg" alt="NamDPI" width={36} height={36} className="rounded-full object-cover bg-white" unoptimized />
          <div>
            <p className="text-xs font-semibold text-white">NamDPI</p>
            <p className="text-[11px] text-white/50">Namangan Davlat Pedagogika Instituti</p>
          </div>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-[420px] py-8">

          {/* Mobile brand */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-8">
            <BrainUPLogo size="lg" href="/" />
            <span className="font-extrabold text-slate-900 text-xl">BrainUP</span>
            <div className="flex items-center gap-2 rounded-xl border border-black/8 bg-white px-3 py-1.5 mt-1">
              <Image src="/namdpi-logo.jpg" alt="NamDPI" width={18} height={18} className="rounded-full" unoptimized />
              <span className="text-xs text-slate-500">NamDPI hamkorligida</span>
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-1">Hisob yarating</h2>
          <p className="text-slate-400 text-sm mb-8">Talaba sifatida ro&apos;yxatdan o&apos;ting</p>

          {errors._form?.[0] && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errors._form[0]}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide">Ism</label>
                <input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Sardor" required className={inputCls} />
                {fieldError("firstName") && <p className="text-xs text-red-500">{fieldError("firstName")}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide">Familiya</label>
                <input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Rahimov" required className={inputCls} />
                {fieldError("lastName") && <p className="text-xs text-red-500">{fieldError("lastName")}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide">Email</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="example@email.com" required autoComplete="email" className={inputCls} />
              {fieldError("email") && <p className="text-xs text-red-500">{fieldError("email")}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide">Parol</label>
              <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Kamida 6 ta belgi" required autoComplete="new-password" className={inputCls} />
              {fieldError("password") && <p className="text-xs text-red-500">{fieldError("password")}</p>}
            </div>

            <div className="pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
              <p className="text-xs text-slate-400 mb-4 uppercase tracking-wide font-medium">O&apos;quv ma&apos;lumotlari</p>

              <div className="space-y-1.5 mb-3">
                <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide">Universitet</label>
                <Select value={form.universityId} onValueChange={(v) => update("universityId", v)}>
                  <SelectTrigger className="h-[42px] rounded-xl bg-white border text-slate-700 text-sm focus:border-blue-500 focus:ring-0 shadow-sm">
                    <SelectValue placeholder="Universitetni tanlang" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-black/10">
                    {universities.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-slate-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError("universityId") && <p className="text-xs text-red-500">{fieldError("universityId")}</p>}
              </div>

              {selectedUniversity && (
                <div className="space-y-1.5 mb-3">
                  <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide">Fakultet</label>
                  <Select value={form.facultyId} onValueChange={(v) => update("facultyId", v)}>
                    <SelectTrigger className="h-[42px] rounded-xl bg-white border text-slate-700 text-sm focus:border-blue-500 focus:ring-0 shadow-sm">
                      <SelectValue placeholder="Fakultetni tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-black/10">
                      {selectedUniversity.faculties.map((f) => (
                        <SelectItem key={f.id} value={f.id} className="text-slate-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError("facultyId") && <p className="text-xs text-red-500">{fieldError("facultyId")}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide">Kurs</label>
                  <Select value={form.yearLevel} onValueChange={(v) => update("yearLevel", v)}>
                    <SelectTrigger className="h-[42px] rounded-xl bg-white border text-slate-700 text-sm focus:border-blue-500 focus:ring-0 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-black/10">
                      {[1, 2, 3, 4, 5, 6].map((y) => (
                        <SelectItem key={y} value={String(y)} className="text-slate-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                          {y}-kurs
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide">Guruh</label>
                  <input value={form.groupName} onChange={(e) => update("groupName", e.target.value)} placeholder="M-11" className={inputCls} />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white border-0 gap-2 mt-2 shadow-sm shadow-blue-600/20">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Ro&apos;yxatdan o&apos;tish
            </Button>
          </form>

          <p className="mt-6 pt-6 text-center text-sm text-slate-400" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
            Hisobingiz bormi?{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:text-blue-400 transition-colors">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
