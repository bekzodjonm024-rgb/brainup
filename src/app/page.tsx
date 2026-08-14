import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Users,
  BookOpen,
  Zap,
  Target,
  GraduationCap,
} from "lucide-react";
import { BrainUPLogo } from "@/components/ui/brainup-logo";

export default async function LandingPage() {
  const session = await auth();

  if (session) {
    if (session.user.role === "ADMIN") redirect("/admin");
    if (session.user.role === "PROFESSOR") redirect("/professor/dashboard");
    redirect("/dashboard");
  }

  const partners = ["NamDPI", "TATU", "SamDU", "ToshDTU", "BuxDU", "FarDPI", "AndDU", "NamMQI"];

  const cogBars = [
    { n: "Xotira",      v: 82 },
    { n: "Diqqat",      v: 71 },
    { n: "Mantiq",      v: 90 },
    { n: "Tezkorlik",   v: 65 },
    { n: "Ijodkorlik",  v: 78 },
    { n: "Motivatsiya", v: 88 },
  ];

  return (
    <>
      <style>{`
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .ticker-track { animation: ticker 30s linear infinite; }

        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .fl-1 { animation: floatUp 4.2s ease-in-out infinite; }
        .fl-2 { animation: floatUp 5.5s ease-in-out infinite 1s; }
        .fl-3 { animation: floatUp 4.8s ease-in-out infinite 2s; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .a1{animation:fadeUp .5s ease-out 0s both}
        .a2{animation:fadeUp .5s ease-out .12s both}
        .a3{animation:fadeUp .5s ease-out .22s both}
        .a4{animation:fadeUp .5s ease-out .32s both}

        .card-3d {
          transition: transform .35s cubic-bezier(.22,.61,.36,1), box-shadow .35s ease;
        }
        .card-3d:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 24px 48px rgba(28,18,8,0.13), 0 6px 16px rgba(28,18,8,0.07), 0 0 0 1px rgba(28,18,8,0.04) !important;
        }

        .btn-amber {
          background: #B45309;
          color: #fff;
          box-shadow: 0 4px 14px rgba(180,83,9,0.35);
          transition: all .2s ease;
        }
        .btn-amber:hover {
          background: #92400E;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(180,83,9,0.40);
        }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: "#F8F5EF" }}>

        {/* ── NAV ── */}
        <nav
          className="sticky top-0 z-50"
          style={{ backgroundColor: "rgba(248,245,239,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(28,18,8,0.07)" }}
        >
          <div className="mx-auto max-w-6xl px-6 h-[62px] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <BrainUPLogo size="sm" />
              <span className="font-extrabold text-[#1C1208] text-[1.05rem] tracking-tight">BrainUP</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-[0.875rem] font-medium" style={{ color: "#7D6855" }}>
              <Link href="/" className="transition-colors hover:text-[#1C1208]">Bosh sahifa</Link>
              <Link href="#how" className="transition-colors hover:text-[#1C1208]">Jarayon</Link>
              <Link href="#features" className="transition-colors hover:text-[#1C1208]">Imkoniyatlar</Link>
              <Link href="/login" className="transition-colors hover:text-[#1C1208]">Kirish</Link>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                style={{ background: "#1C1208" }}
              >
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
              <Link href="/register">
                <span
                  className="btn-amber text-[0.8rem] font-extrabold px-5 py-2.5 rounded-full tracking-wider inline-block"
                >
                  BOSHLASH
                </span>
              </Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-5">
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{ background: "#1C1208", minHeight: 560 }}
          >
            <div className="flex flex-col lg:flex-row" style={{ minHeight: 560 }}>

              {/* LEFT */}
              <div
                className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-14"
                style={{ minHeight: 560 }}
              >
                <div>
                  <div
                    className="a1 font-black text-white uppercase leading-none tracking-tight"
                    style={{ fontSize: "clamp(2.6rem,5.2vw,3.75rem)" }}
                  >
                    AQLLI<br />O&apos;QISHNING
                  </div>
                  <div className="a2 mt-2 mb-5">
                    <span
                      className="font-black uppercase tracking-tight px-2 py-0.5 inline-block"
                      style={{
                        fontSize: "clamp(2.6rem,5.2vw,3.75rem)",
                        lineHeight: 1,
                        background: "#B45309",
                        color: "#fff",
                      }}
                    >
                      TIZIMI
                    </span>
                  </div>
                  <p className="a3 leading-relaxed max-w-xs text-[0.95rem]" style={{ color: "rgba(240,234,224,0.65)" }}>
                    Kognitiv profilingizga asoslanib — har bir talaba uchun
                    alohida ta&apos;lim yo&apos;nalishi. NamDPI pilot, 2026.
                  </p>
                </div>

                <div className="a4 mt-8 space-y-5">
                  <Link href="/register" className="flex items-center gap-3 group w-fit">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: "#B45309", boxShadow: "0 4px 14px rgba(180,83,9,0.45)" }}
                    >
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white font-extrabold uppercase tracking-widest text-[0.8rem]">
                      O&apos;QISHNI BOSHLASH
                    </span>
                  </Link>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex -space-x-2.5">
                      {["AK", "BM", "ZT", "NK"].map((init, i) => (
                        <div
                          key={i}
                          className="rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                          style={{
                            width: 36,
                            height: 36,
                            background: i % 2 === 0 ? "#3D2A1A" : "#2A1C10",
                            border: "2px solid rgba(180,83,9,0.4)",
                          }}
                        >
                          {init}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-none">460+</p>
                      <p className="text-[0.7rem]" style={{ color: "rgba(240,234,224,0.45)" }}>faol talaba</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT — 3D Cognitive Card */}
              <div
                className="hidden lg:flex items-center justify-center flex-1 relative"
                style={{ minHeight: 560, padding: "40px 48px 40px 0" }}
              >
                {/* 3D perspective wrapper */}
                <div style={{ perspective: "1100px", perspectiveOrigin: "20% 50%" }}>
                  <div
                    className="bg-white relative"
                    style={{
                      width: 340,
                      borderRadius: 24,
                      padding: "28px 28px 24px",
                      transform: "rotateY(-16deg) rotateX(5deg)",
                      transformStyle: "preserve-3d",
                      boxShadow:
                        "48px 48px 96px rgba(0,0,0,0.32), 16px 16px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Score badge — elevated 3D */}
                    <div
                      className="absolute rounded-2xl text-white"
                      style={{
                        top: -18,
                        right: -18,
                        background: "#B45309",
                        padding: "10px 16px",
                        boxShadow: "0 12px 32px rgba(180,83,9,0.5), 0 4px 8px rgba(180,83,9,0.3)",
                        transform: "translateZ(20px)",
                      }}
                    >
                      <div style={{ fontFamily: "var(--font-geist-mono,monospace)", fontSize: 26, fontWeight: 700, lineHeight: 1, color: "#fff" }}>78</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>/ 100</div>
                    </div>

                    <div style={{ fontSize: 12, color: "#9C8272", marginBottom: 3 }}>Kognitiv Profil</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1C1208", marginBottom: 22 }}>
                      Sardor R. · NamDPI · 2-kurs
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                      {cogBars.map((item) => (
                        <div key={item.n}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 12, color: "#9C8272" }}>{item.n}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#1C1208", fontFamily: "monospace" }}>{item.v}</span>
                          </div>
                          <div style={{ height: 5, background: "#F5EEE4", borderRadius: 3, overflow: "hidden" }}>
                            <div
                              style={{ width: `${item.v}%`, height: "100%", background: "#B45309", borderRadius: 3 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating badge — Diqqat */}
                <div
                  className="fl-1 absolute bg-white rounded-2xl px-4 py-3"
                  style={{
                    top: 72,
                    left: "4%",
                    boxShadow: "0 20px 40px rgba(28,18,8,0.13), 0 4px 10px rgba(28,18,8,0.07), 0 0 0 1px rgba(28,18,8,0.04)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#FEF4E7" }}>
                      <Zap className="w-4 h-4" style={{ color: "#B45309" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "#9C8272", marginBottom: 2 }}>Diqqat skori</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#1C1208" }}>87%</p>
                    </div>
                  </div>
                </div>

                {/* Floating badge — O'sish */}
                <div
                  className="fl-2 absolute rounded-2xl px-4 py-3"
                  style={{
                    top: 170,
                    right: "4%",
                    background: "#1C1208",
                    boxShadow: "0 20px 40px rgba(28,18,8,0.25), 0 4px 10px rgba(28,18,8,0.15)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(180,83,9,0.18)" }}>
                      <TrendingUp className="w-4 h-4" style={{ color: "#D4973A" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "#8C7261", marginBottom: 2 }}>Mastery o&apos;sish</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>+34%</p>
                    </div>
                  </div>
                </div>

                {/* Floating badge — Retrieval */}
                <div
                  className="fl-3 absolute bg-white rounded-2xl px-4 py-3"
                  style={{
                    bottom: 130,
                    left: "4%",
                    boxShadow: "0 20px 40px rgba(28,18,8,0.10), 0 4px 10px rgba(28,18,8,0.06), 0 0 0 1px rgba(28,18,8,0.04)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Target className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "#9C8272", marginBottom: 2 }}>Retrieval</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#1C1208" }}>3→30 kun</p>
                    </div>
                  </div>
                </div>

                {/* Bottom stat cards */}
                <div className="absolute bottom-6 right-6 flex gap-3">
                  <div
                    className="card-3d rounded-2xl p-4"
                    style={{
                      background: "#F8F5EF",
                      minWidth: 104,
                      boxShadow: "0 8px 24px rgba(28,18,8,0.09), 0 2px 6px rgba(28,18,8,0.05), 0 0 0 1px rgba(28,18,8,0.04)",
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                      <GraduationCap className="w-4 h-4" style={{ color: "#B45309" }} />
                    </div>
                    <p className="text-2xl font-black" style={{ color: "#1C1208" }}>98%</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#9C8272" }}>muvaffaqiyat</p>
                  </div>
                  <div
                    className="card-3d rounded-2xl p-4"
                    style={{
                      background: "#1C1208",
                      minWidth: 120,
                      boxShadow: "0 12px 32px rgba(28,18,8,0.20), 0 4px 10px rgba(28,18,8,0.12)",
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <Users className="w-4 h-4" style={{ color: "#D4973A" }} />
                    </div>
                    <p className="text-2xl font-black text-white">100+</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(240,234,224,0.45)" }}>hamkor univ.</p>
                  </div>
                  <div
                    className="card-3d rounded-2xl p-4"
                    style={{
                      background: "#F8F5EF",
                      minWidth: 104,
                      boxShadow: "0 8px 24px rgba(28,18,8,0.09), 0 2px 6px rgba(28,18,8,0.05), 0 0 0 1px rgba(28,18,8,0.04)",
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: "#FEF4E7" }}>
                      <BookOpen className="w-4 h-4" style={{ color: "#B45309" }} />
                    </div>
                    <p className="text-2xl font-black" style={{ color: "#1C1208" }}>20+</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#9C8272" }}>faol kurslar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PARTNER TICKER ── */}
        <div
          className="py-8 overflow-hidden"
          style={{ borderBottom: "1px solid rgba(28,18,8,0.07)" }}
        >
          <div className="ticker-track flex gap-14 whitespace-nowrap">
            {[...partners, ...partners].map((p, i) => (
              <span
                key={i}
                className="font-bold text-sm tracking-[0.18em] uppercase"
                style={{ color: "#C4A882" }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-14">
              <p className="font-bold text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#B45309" }}>
                Jarayon
              </p>
              <h2 className="font-black text-4xl tracking-tight" style={{ color: "#1C1208" }}>
                Qanday ishlaydi?
              </h2>
              <p className="mt-3 max-w-sm mx-auto text-sm leading-relaxed" style={{ color: "#9C8272" }}>
                Uch bosqichda — baholash, moslashish, mustahkamlash.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  step: "01",
                  icon: <Brain className="h-6 w-6" style={{ color: "#B45309" }} />,
                  bg: "#FEF4E7",
                  title: "Kognitiv baholash",
                  desc: "10–15 daqiqa. Diqqat, xotira, qayta ishlash tezligi — shaxsiy kognitiv profil yaratiladi.",
                },
                {
                  step: "02",
                  icon: <TrendingUp className="h-6 w-6" style={{ color: "#B45309" }} />,
                  bg: "#FEF4E7",
                  title: "Adaptiv yo'nalish",
                  desc: "Har bir mashqdan keyin tizim keyingi eng foydali qadamni avtomatik aniqlaydi.",
                },
                {
                  step: "03",
                  icon: <RefreshCw className="h-6 w-6 text-emerald-600" />,
                  bg: "#ECFDF5",
                  title: "Spaced repetition",
                  desc: "Bilimni eslab qolishni kuzatadi. Ilmiy asoslangan: 3→7→14→30 kun intervallar.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="card-3d bg-white rounded-3xl p-8"
                  style={{
                    border: "1px solid rgba(28,18,8,0.06)",
                    boxShadow: "0 4px 16px rgba(28,18,8,0.06), 0 1px 4px rgba(28,18,8,0.04)",
                  }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: item.bg }}
                    >
                      {item.icon}
                    </div>
                    <span
                      className="font-black text-5xl leading-none select-none"
                      style={{ color: "rgba(28,18,8,0.06)" }}
                    >
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-black text-lg mb-2" style={{ color: "#1C1208" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#9C8272" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { v: "500+",  l: "Faol talaba",   bg: "#FEF4E7", color: "#B45309" },
                  { v: "12+",   l: "Kurslar",         bg: "#FEF4E7", color: "#B45309" },
                  { v: "1200+", l: "Baholashlar",     bg: "#F5F3FF", color: "#7C3AED" },
                  { v: "+34%",  l: "O'rtacha o'sish", bg: "#ECFDF5", color: "#059669" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="card-3d rounded-3xl p-8"
                    style={{
                      background: s.bg,
                      boxShadow: "0 4px 16px rgba(28,18,8,0.05), 0 1px 4px rgba(28,18,8,0.03)",
                    }}
                  >
                    <p className="font-black text-4xl mb-1" style={{ color: s.color }}>
                      {s.v}
                    </p>
                    <p className="text-sm" style={{ color: "#7D6855" }}>{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Text */}
              <div>
                <p className="text-xs font-bold tracking-[0.22em] uppercase mb-5" style={{ color: "#B45309" }}>
                  Nima uchun BrainUP?
                </p>
                <h2 className="font-black text-4xl mb-5 leading-tight tracking-tight" style={{ color: "#1C1208" }}>
                  Har bir talaba —<br />alohida yo&apos;l
                </h2>
                <p className="mb-8 leading-relaxed text-sm" style={{ color: "#9C8272" }}>
                  An&apos;anaviy o&apos;qitish barcha talabalarga bir xil materiallarni beradi.
                  BrainUP esa har bir talaba uchun individual yo&apos;l quradi —
                  zaif joylarni topib, kuchlilarini yanada mustahkamlaydi.
                </p>
                <div className="space-y-3">
                  {[
                    "Kognitiv profil asosida shaxsiy dars rejasi",
                    "Xatolar tahlili va zaif joylarni aniqlash",
                    "O'qituvchilar uchun real vaqt statistikasi",
                    "Ilmiy asoslangan spaced repetition algoritmi",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "#FEF4E7" }}
                      >
                        <CheckCircle2 className="h-3 w-3" style={{ color: "#B45309" }} />
                      </div>
                      <span className="text-sm leading-relaxed" style={{ color: "#4A3728" }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-8">
          <div
            className="rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden"
            style={{ background: "#1C1208" }}
          >
            <div
              className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
              style={{
                background: "rgba(180,83,9,0.12)",
                transform: "translate(33%, -33%)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none"
              style={{
                background: "rgba(180,83,9,0.08)",
                transform: "translate(-25%, 25%)",
              }}
            />
            <div className="relative">
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "rgba(180,83,9,0.7)" }}>
                NamDPI · 2026
              </p>
              <h2
                className="font-black text-4xl sm:text-5xl mb-5 tracking-tight text-white"
              >
                Bugundan boshlang
              </h2>
              <p className="mb-8 max-w-sm mx-auto text-sm leading-relaxed" style={{ color: "rgba(240,234,224,0.55)" }}>
                NamDPI pilotiga qo&apos;shiling. Ro&apos;yxatdan o&apos;tish bepul —
                bir daqiqada tayyor.
              </p>
              <Link
                href="/register"
                className="btn-amber inline-flex items-center gap-3 px-8 py-4 rounded-full font-extrabold text-sm tracking-wider"
              >
                <span>RO&apos;YXATDAN O&apos;TISH</span>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid rgba(28,18,8,0.07)" }} className="py-10">
          <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <BrainUPLogo size="sm" />
              <span className="font-bold" style={{ color: "#1C1208" }}>BrainUP</span>
            </Link>
            <div className="flex items-center gap-6 text-sm" style={{ color: "#9C8272" }}>
              <Link href="/login" className="transition-colors hover:text-[#1C1208]">Kirish</Link>
              <Link href="/register" className="transition-colors hover:text-[#1C1208]">Ro&apos;yxat</Link>
              <Link href="#how" className="transition-colors hover:text-[#1C1208]">Jarayon</Link>
            </div>
            <p className="text-sm" style={{ color: "#C4A882" }}>© 2026 BrainUP · NamDPI</p>
          </div>
        </footer>

      </div>
    </>
  );
}
