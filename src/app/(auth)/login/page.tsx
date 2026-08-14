import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kirish" };

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { BrainUPLogo } from "@/components/ui/brainup-logo";
import { Brain, TrendingUp, RefreshCw, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f8faff" }}>

      {/* LEFT — orange brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-14 bg-blue-600 rounded-r-3xl">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/30 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-700/20 -translate-x-1/4 translate-y-1/4 pointer-events-none" />

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-14">
            <BrainUPLogo size="md" />
            <span className="font-extrabold text-white text-xl tracking-tight">BrainUP</span>
          </Link>

          <h2 className="font-black text-white text-[2.5rem] leading-tight mb-4 uppercase tracking-tight">
            AQLLI<br />O&apos;QISHNI<br />BOSHLANG
          </h2>
          <p className="text-white/65 text-sm leading-relaxed mb-12 max-w-xs">
            Kognitiv profil asosida shaxsiy ta&apos;lim yo&apos;nalishi.
            Har bir talaba — alohida yo&apos;l.
          </p>

          <div className="space-y-3">
            {[
              { Icon: Brain,      text: "Diqqat va xotira tahlili",    bg: "bg-white/15" },
              { Icon: TrendingUp, text: "Adaptiv o'quv rejasi",         bg: "bg-white/15" },
              { Icon: RefreshCw,  text: "Spaced repetition: 3→30 kun", bg: "bg-white/15" },
            ].map(({ Icon, text, bg }) => (
              <div key={text} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-white/75">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NamDPI badge */}
        <div className="relative flex items-center gap-3 rounded-2xl bg-white/15 border border-white/20 px-4 py-3 w-fit">
          <Image
            src="/namdpi-logo.jpg"
            alt="NamDPI"
            width={36}
            height={36}
            className="rounded-full object-cover bg-white"
            unoptimized
          />
          <div>
            <p className="text-xs font-semibold text-white">NamDPI</p>
            <p className="text-[11px] text-white/50">Namangan Davlat Pedagogika Instituti</p>
          </div>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[340px]">

          {/* Mobile brand */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-10">
            <BrainUPLogo size="lg" href="/" />
            <span className="font-extrabold text-slate-900 text-xl">BrainUP</span>
            <div className="flex items-center gap-2 rounded-xl border border-black/8 bg-white px-3 py-1.5 mt-1">
              <Image src="/namdpi-logo.jpg" alt="NamDPI" width={18} height={18} className="rounded-full" unoptimized />
              <span className="text-xs text-slate-500">NamDPI hamkorligida</span>
            </div>
          </div>

          <Suspense fallback={<div className="h-60 rounded-2xl bg-white animate-pulse" />}>
            <LoginForm />
          </Suspense>

          <p className="text-center text-xs text-slate-400 mt-6">
            Hisobingiz yo&apos;qmi?{" "}
            <Link href="/register" className="text-blue-600 font-medium hover:text-blue-400 transition-colors inline-flex items-center gap-0.5">
              Ro&apos;yxatdan o&apos;ting <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
