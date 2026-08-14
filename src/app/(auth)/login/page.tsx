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
    <div className="min-h-screen flex" style={{ backgroundColor: "#F8F5EF" }}>

      {/* LEFT — warm dark brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-14 shrink-0"
        style={{ background: "#1C1208", borderRadius: "0 32px 32px 0" }}
      >
        {/* Warm decorative circles */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: "rgba(180,83,9,0.12)",
            transform: "translate(33%, -33%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "rgba(180,83,9,0.08)",
            transform: "translate(-25%, 25%)",
          }}
        />

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-14">
            <BrainUPLogo size="md" />
            <span className="font-extrabold text-white text-xl tracking-tight">BrainUP</span>
          </Link>

          <h2
            className="font-black text-white uppercase tracking-tight leading-tight mb-4"
            style={{ fontSize: "clamp(2rem,3.2vw,2.6rem)" }}
          >
            AQLLI<br />O&apos;QISHNI<br />BOSHLANG
          </h2>
          <p className="text-sm leading-relaxed mb-12 max-w-xs" style={{ color: "rgba(240,234,224,0.55)" }}>
            Kognitiv profil asosida shaxsiy ta&apos;lim yo&apos;nalishi.
            Har bir talaba — alohida yo&apos;l.
          </p>

          <div className="space-y-3">
            {[
              { Icon: Brain,      text: "Diqqat va xotira tahlili" },
              { Icon: TrendingUp, text: "Adaptiv o'quv rejasi" },
              { Icon: RefreshCw,  text: "Spaced repetition: 3→30 kun" },
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
            <p className="text-[11px]" style={{ color: "rgba(240,234,224,0.45)" }}>Namangan Davlat Pedagogika Instituti</p>
          </div>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[340px]">

          {/* Mobile brand */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-10">
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

          <Suspense fallback={<div className="h-60 rounded-2xl bg-white animate-pulse" />}>
            <LoginForm />
          </Suspense>

          <p className="text-center text-xs mt-6" style={{ color: "#9C8272" }}>
            Hisobingiz yo&apos;qmi?{" "}
            <Link
              href="/register"
              className="font-medium transition-colors inline-flex items-center gap-0.5"
              style={{ color: "#B45309" }}
            >
              Ro&apos;yxatdan o&apos;ting <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
