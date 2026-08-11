import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kirish" };

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { BrainUPLogo } from "@/components/ui/brainup-logo";
import { Brain, TrendingUp, RefreshCw } from "lucide-react";

export default function LoginPage() {
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
          height: 44px;
          padding: 0 16px;
          border-radius: 12px;
          background: rgb(15 23 42);
          border: 1px solid rgb(30 41 59);
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color .2s;
        }
        .auth-input::placeholder { color: rgb(71 85 105); }
        .auth-input:focus { border-color: rgb(59 130 246); }
        .auth-input-pw { padding-right: 44px; }
      `}</style>

      <div className="min-h-screen bg-slate-950 flex">

        {/* ── LEFT BRAND PANEL ── */}
        <div className="hidden lg:flex flex-col justify-between w-[54%] relative overflow-hidden p-14 border-r border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-slate-950 to-indigo-950/30 pointer-events-none" />
          <div className="orb-a absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-blue-700/10 blur-[110px] pointer-events-none" />
          <div className="orb-b absolute bottom-0 right-0 w-[320px] h-[320px] rounded-full bg-indigo-700/8 blur-[80px] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Top: brand + content */}
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3 mb-14">
              <BrainUPLogo size="md" />
              <span className="f-syne font-bold text-white text-xl">BrainUP</span>
            </Link>

            <h2 className="f-syne text-[2.6rem] font-bold text-white leading-tight mb-5">
              O&apos;rganish &mdash;<br />
              <span className="shimmer-text">ilm bilan</span> boshlanadi
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-12 max-w-xs">
              Kognitiv profil asosida shaxsiy ta&apos;lim yo&apos;nalishi.
              Har bir talaba — alohida yo&apos;l.
            </p>

            <div className="space-y-3">
              {[
                { Icon: Brain,     text: "Diqqat va xotira tahlili",    iconCls: "text-violet-400", bgCls: "bg-violet-500/10 border-violet-500/20" },
                { Icon: TrendingUp,text: "Adaptiv o'quv rejasi",         iconCls: "text-blue-400",   bgCls: "bg-blue-500/10   border-blue-500/20" },
                { Icon: RefreshCw, text: "Spaced repetition: 3→30 kun", iconCls: "text-emerald-400",bgCls: "bg-emerald-500/10 border-emerald-500/20" },
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

          {/* Bottom: NamDPI badge */}
          <div className="relative flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-4 py-3 w-fit">
            <Image
              src="/namdpi-logo.jpg"
              alt="NamDPI"
              width={40}
              height={40}
              className="rounded-full object-cover"
              unoptimized
            />
            <div>
              <p className="text-xs font-semibold text-slate-300">NamDPI</p>
              <p className="text-[11px] text-slate-600">Namangan Davlat Pedagogika Instituti</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-[340px]">

            {/* Mobile brand */}
            <div className="lg:hidden flex flex-col items-center gap-2 mb-10">
              <BrainUPLogo size="lg" href="/" />
              <span className="f-syne font-bold text-white text-xl">BrainUP</span>
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5 mt-1">
                <Image src="/namdpi-logo.jpg" alt="NamDPI" width={18} height={18} className="rounded-full" unoptimized />
                <span className="text-xs text-slate-500">NamDPI hamkorligida</span>
              </div>
            </div>

            <Suspense fallback={<div className="h-60 rounded-2xl bg-white/5 animate-pulse" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
