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

const inputCls =
  "w-full h-[42px] px-[14px] rounded-xl bg-white border border-stone-200 text-[#1C1208] text-sm outline-none transition-colors placeholder:text-stone-400 shadow-sm focus:border-[#B45309] focus:ring-0";

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
    <div className="min-h-screen flex" style={{ backgroundColor: "#F8F5EF" }}>

      {/* LEFT — warm dark brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden p-14 shrink-0"
        style={{ background: "#1C1208", borderRadius: "0 32px 32px 0" }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "rgba(180,83,9,0.12)", transform: "translate(33%, -33%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "rgba(180,83,9,0.08)", transform: "translate(-25%, 25%)" }}
        />

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-14">
            <BrainUPLogo size="md" />
            <span className="font-extrabold text-white text-xl tracking-tight">BrainUP</span>
          </Link>

          <h2
            className="font-black text-white uppercase tracking-tight leading-tight mb-4"
            style={{ fontSize: "clamp(1.8rem,2.8vw,2.3rem)" }}
          >
            ADAPTIV TA&apos;LIM —<br />BUGUNDAN
          </h2>
          <p className="text-sm leading-relaxed mb-10 max-w-xs" style={{ color: "rgba(240,234,224,0.55)" }}>
            Ro&apos;yxatdan o&apos;ting va kognitiv profil asosida shaxsiy yo&apos;nalish oling.
          </p>

          <div className="space-y-3">
            {[
              { Icon: Brain,      text: "Boshlang'ich baholash — 10 daqiqa" },
              { Icon: TrendingUp, text: "Adaptiv dars rejasi yaratiladi" },
              { Icon: RefreshCw,  text: "Bilim 30 kungacha mustahkamlanadi" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(180,83,9,0.18)" }}
                >
                  <Icon className="h-4 w-4" style={{ color: "#D4973A" }} />
                </div>
                <span className="text-sm" style={{ color: "rgba(240,234,224,0.65)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NamDPI badge */}
        <div
          className="relative flex items-center gap-3 px-4 py-3 w-fit rounded-2xl"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Image src="/namdpi-logo.jpg" alt="NamDPI" width={36} height={36} className="rounded-full object-cover bg-white" unoptimized />
          <div>
            <p className="text-xs font-semibold text-white">NamDPI</p>
            <p className="text-[11px]" style={{ color: "rgba(240,234,224,0.45)" }}>Namangan Davlat Pedagogika Instituti</p>
          </div>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-[420px] py-8">

          {/* Mobile brand */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-8">
            <BrainUPLogo size="lg" href="/" />
            <span className="font-extrabold text-xl" style={{ color: "#1C1208" }}>BrainUP</span>
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 mt-1"
              style={{ border: "1px solid rgba(28,18,8,0.08)", background: "white" }}
            >
              <Image src="/namdpi-logo.jpg" alt="NamDPI" width={18} height={18} className="rounded-full" unoptimized />
              <span className="text-xs" style={{ color: "#9C8272" }}>NamDPI hamkorligida</span>
            </div>
          </div>

          <h2 className="text-2xl font-black mb-1" style={{ color: "#1C1208" }}>Hisob yarating</h2>
          <p className="text-sm mb-8" style={{ color: "#9C8272" }}>Talaba sifatida ro&apos;yxatdan o&apos;ting</p>

          {errors._form?.[0] && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errors._form[0]}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#5C4A3A" }}>Ism</label>
                <input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Sardor" required className={inputCls} />
                {fieldError("firstName") && <p className="text-xs text-red-500">{fieldError("firstName")}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#5C4A3A" }}>Familiya</label>
                <input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Rahimov" required className={inputCls} />
                {fieldError("lastName") && <p className="text-xs text-red-500">{fieldError("lastName")}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#5C4A3A" }}>Email</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="example@email.com" required autoComplete="email" className={inputCls} />
              {fieldError("email") && <p className="text-xs text-red-500">{fieldError("email")}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#5C4A3A" }}>Parol</label>
              <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Kamida 6 ta belgi" required autoComplete="new-password" className={inputCls} />
              {fieldError("password") && <p className="text-xs text-red-500">{fieldError("password")}</p>}
            </div>

            <div className="pt-3" style={{ borderTop: "1px solid rgba(28,18,8,0.07)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#9C8272" }}>O&apos;quv ma&apos;lumotlari</p>

              <div className="space-y-1.5 mb-3">
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#5C4A3A" }}>Universitet</label>
                <Select value={form.universityId} onValueChange={(v) => update("universityId", v)}>
                  <SelectTrigger className="h-[42px] rounded-xl bg-white border border-stone-200 text-sm shadow-sm focus:border-[#B45309] focus:ring-0" style={{ color: "#1C1208" }}>
                    <SelectValue placeholder="Universitetni tanlang" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-stone-200">
                    {universities.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-[#1C1208] focus:bg-[#FEF4E7] focus:text-[#B45309] cursor-pointer">
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError("universityId") && <p className="text-xs text-red-500">{fieldError("universityId")}</p>}
              </div>

              {selectedUniversity && (
                <div className="space-y-1.5 mb-3">
                  <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#5C4A3A" }}>Fakultet</label>
                  <Select value={form.facultyId} onValueChange={(v) => update("facultyId", v)}>
                    <SelectTrigger className="h-[42px] rounded-xl bg-white border border-stone-200 text-sm shadow-sm focus:border-[#B45309] focus:ring-0" style={{ color: "#1C1208" }}>
                      <SelectValue placeholder="Fakultetni tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-stone-200">
                      {selectedUniversity.faculties.map((f) => (
                        <SelectItem key={f.id} value={f.id} className="text-[#1C1208] focus:bg-[#FEF4E7] focus:text-[#B45309] cursor-pointer">
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
                  <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#5C4A3A" }}>Kurs</label>
                  <Select value={form.yearLevel} onValueChange={(v) => update("yearLevel", v)}>
                    <SelectTrigger className="h-[42px] rounded-xl bg-white border border-stone-200 text-sm shadow-sm focus:border-[#B45309] focus:ring-0" style={{ color: "#1C1208" }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-stone-200">
                      {[1, 2, 3, 4, 5, 6].map((y) => (
                        <SelectItem key={y} value={String(y)} className="text-[#1C1208] focus:bg-[#FEF4E7] focus:text-[#B45309] cursor-pointer">
                          {y}-kurs
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#5C4A3A" }}>Guruh</label>
                  <input value={form.groupName} onChange={(e) => update("groupName", e.target.value)} placeholder="M-11" className={inputCls} />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-white border-0 gap-2 mt-2"
              style={{ background: "#B45309", boxShadow: "0 4px 14px rgba(180,83,9,0.28)" }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Ro&apos;yxatdan o&apos;tish
            </Button>
          </form>

          <p className="mt-6 pt-6 text-center text-sm" style={{ borderTop: "1px solid rgba(28,18,8,0.07)", color: "#9C8272" }}>
            Hisobingiz bormi?{" "}
            <Link href="/login" className="font-medium transition-colors" style={{ color: "#B45309" }}>
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
