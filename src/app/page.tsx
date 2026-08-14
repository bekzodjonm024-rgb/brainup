import type { CSSProperties } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Brain, TrendingUp, RefreshCw, ArrowRight, CheckCircle2, Zap } from "lucide-react";
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
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .ticker-track{animation:ticker 28s linear infinite}

        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .a1{animation:fadeUp .55s ease-out 0s both}
        .a2{animation:fadeUp .55s ease-out .12s both}
        .a3{animation:fadeUp .55s ease-out .24s both}
        .a4{animation:fadeUp .55s ease-out .36s both}
        .a5{animation:fadeUp .55s ease-out .48s both}

        @keyframes slideLeft{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}
        .card-reveal{animation:slideLeft .65s ease-out .22s both}

        @keyframes popIn{from{opacity:0;transform:scale(.82) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .bp-a{animation:popIn .45s cubic-bezier(.34,1.56,.64,1) .56s both}
        .bp-b{animation:popIn .45s cubic-bezier(.34,1.56,.64,1) .72s both}

        @keyframes barFill{from{width:0}to{width:var(--bw)}}
        .bar-fill{animation:barFill 1s ease-out var(--bd,.5s) both}

        .step-card{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
        .step-card:hover{
          transform:translateY(-5px);
          border-color:rgba(26,86,219,.22)!important;
          box-shadow:0 20px 48px rgba(26,86,219,.10),0 4px 12px rgba(0,0,0,.05)!important;
        }
        .stat-hover{transition:transform .22s ease,box-shadow .22s ease}
        .stat-hover:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.08)!important}

        .btn-blue{background:#1A56DB;box-shadow:0 4px 18px rgba(26,86,219,.30);transition:all .2s ease}
        .btn-blue:hover{background:#1447B5;transform:translateY(-1px);box-shadow:0 8px 28px rgba(26,86,219,.40)}

        .btn-ghost{border:1.5px solid rgba(0,0,0,.12);transition:all .2s ease}
        .btn-ghost:hover{border-color:#1A56DB!important;color:#1A56DB!important}

        .nav-link{transition:color .15s ease}
        .nav-link:hover{color:#111318!important}
        .footer-link{transition:color .15s ease}
        .footer-link:hover{color:#111318!important}

        @media(prefers-reduced-motion:reduce){
          .a1,.a2,.a3,.a4,.a5,.card-reveal,.bp-a,.bp-b{animation:none!important;opacity:1!important;transform:none!important}
          .bar-fill{animation:none!important;width:var(--bw)!important}
        }
      `}</style>

      <div style={{ background: "#FAFAF8", minHeight: "100vh" }}>

        {/* ── NAV ── */}
        <nav className="sticky top-0 z-50 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <div className="mx-auto max-w-6xl px-6 h-[60px] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <BrainUPLogo size="sm" />
              <span className="font-extrabold text-[1rem] tracking-tight" style={{ color: "#111318" }}>BrainUP</span>
            </Link>
            <div className="hidden md:flex items-center gap-7 text-[0.875rem] font-medium" style={{ color: "#6B7280" }}>
              <Link href="#how"      className="nav-link" style={{ color: "#6B7280" }}>Jarayon</Link>
              <Link href="#features" className="nav-link" style={{ color: "#6B7280" }}>Imkoniyatlar</Link>
              <Link href="/login"    className="nav-link" style={{ color: "#6B7280" }}>Kirish</Link>
            </div>
            <Link href="/register">
              <span className="btn-blue text-[0.82rem] font-bold px-5 py-2.5 rounded-full inline-block text-white">
                Boshlash
              </span>
            </Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ background: "linear-gradient(150deg,#EEF4FF 0%,#F3F7FF 55%,#EDF0FF 100%)" }} className="py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

              {/* LEFT */}
              <div className="flex-1 max-w-xl">
                <div className="a1 inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full"
                  style={{ background: "rgba(26,86,219,0.08)", border: "1px solid rgba(26,86,219,0.15)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#1A56DB" }} />
                  <span className="text-[0.68rem] font-bold tracking-[0.2em] uppercase" style={{ color: "#1A56DB" }}>
                    NamDPI · 2026
                  </span>
                </div>

                <h1 className="a2 f-serif leading-[1.08] tracking-[-0.01em] mb-6"
                  style={{ fontSize: "clamp(3rem,5.8vw,4.4rem)", color: "#0F1724" }}
                >
                  <em>
                    Har bir talaba —<br />
                    <span style={{ color: "#1A56DB" }}>o&apos;ziga xos yo&apos;l</span>
                  </em>
                </h1>

                <p className="a3 leading-[1.75] mb-8 max-w-[400px]" style={{ fontSize: "0.97rem", color: "#5A6270" }}>
                  Kognitiv baholash va adaptiv algoritmlar asosida — platforma
                  har bir talaba uchun individual ta&apos;lim yo&apos;nalishini qurib beradi.
                </p>

                <div className="a4 flex flex-wrap items-center gap-3 mb-10">
                  <Link href="/register">
                    <span className="btn-blue inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white">
                      O&apos;qishni boshlash <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                  <Link href="#how">
                    <span className="btn-ghost inline-flex items-center px-6 py-3 rounded-full text-sm font-bold"
                      style={{ color: "#374151" }}
                    >
                      Ko&apos;proq bilish
                    </span>
                  </Link>
                </div>

                <div className="a5 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["AK", "BM", "ZT", "NK"].map((init, i) => (
                      <div key={i}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: i % 2 === 0 ? "#1A56DB" : "#3B82F6", border: "2.5px solid #EEF4FF" }}
                      >
                        {init}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm" style={{ color: "#6B7280" }}>
                    <span className="font-bold" style={{ color: "#111318" }}>460+</span>{" "}faol talaba
                  </p>
                </div>
              </div>

              {/* RIGHT — cognitive card */}
              <div className="lg:flex-none lg:w-[360px] relative w-full max-w-[340px] mx-auto lg:mx-0">
                <div
                  className="card-reveal bg-white rounded-2xl p-6"
                  style={{ boxShadow: "0 28px 70px rgba(26,86,219,0.14),0 8px 24px rgba(0,0,0,0.06),0 0 0 1px rgba(26,86,219,0.08)" }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-[0.6rem] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: "#1A56DB" }}>
                        Kognitiv Profil
                      </p>
                      <p className="text-[0.82rem] font-bold" style={{ color: "#111318" }}>
                        Sardor R. · NamDPI · 2-kurs
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EBF3FF" }}>
                      <Brain className="h-4 w-4" style={{ color: "#1A56DB" }} />
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {cogBars.map((item, idx) => (
                      <div key={item.n}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[0.74rem] font-medium" style={{ color: "#6B7280" }}>{item.n}</span>
                          <span className="text-[0.74rem] font-bold tabular-nums" style={{ color: "#1A56DB" }}>{item.v}</span>
                        </div>
                        <div className="h-[4px] rounded-full" style={{ background: "#EBF3FF" }}>
                          <div
                            className="bar-fill h-full rounded-full"
                            style={{
                              "--bw": `${item.v}%`,
                              "--bd": `${0.5 + idx * 0.08}s`,
                              background: item.v >= 85
                                ? "linear-gradient(90deg,#1447B5,#3B82F6)"
                                : item.v >= 70 ? "#1A56DB" : "#93C5FD",
                            } as CSSProperties}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 flex items-center justify-between"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <span className="text-[0.68rem]" style={{ color: "#9BA5B3" }}>Keyingi sessiya</span>
                    <span className="text-[0.68rem] font-bold px-2.5 py-1 rounded-full"
                      style={{ color: "#1A56DB", background: "#EBF3FF" }}
                    >3 kun</span>
                  </div>
                </div>

                {/* Floating badges — desktop only */}
                <div className="bp-a absolute -top-3 -right-3 hidden lg:flex bg-white rounded-xl px-3 py-2 items-center gap-2"
                  style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10),0 0 0 1px rgba(0,0,0,0.05)" }}
                >
                  <Zap className="h-3.5 w-3.5" style={{ color: "#1A56DB" }} />
                  <div>
                    <p className="text-[0.55rem] font-bold uppercase tracking-wider" style={{ color: "#9BA5B3" }}>Diqqat</p>
                    <p className="text-[0.82rem] font-black leading-none" style={{ color: "#111318" }}>87%</p>
                  </div>
                </div>

                <div className="bp-b absolute -bottom-3 -left-3 hidden lg:flex bg-white rounded-xl px-3 py-2 items-center gap-2"
                  style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10),0 0 0 1px rgba(0,0,0,0.05)" }}
                >
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <div>
                    <p className="text-[0.55rem] font-bold uppercase tracking-wider" style={{ color: "#9BA5B3" }}>Mastery</p>
                    <p className="text-[0.82rem] font-black leading-none" style={{ color: "#111318" }}>+34%</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── PARTNER TICKER ── */}
        <div className="bg-white py-5"
          style={{ borderTop: "1px solid rgba(0,0,0,0.07)", borderBottom: "1px solid rgba(0,0,0,0.07)" }}
        >
          <p className="text-center text-[0.62rem] font-bold tracking-[0.24em] uppercase mb-4"
            style={{ color: "#9BA5B3" }}
          >
            Hamkor universitetlar
          </p>
          <div className="overflow-hidden">
            <div className="ticker-track flex gap-14 whitespace-nowrap">
              {[...partners, ...partners].map((p, i) => (
                <span key={i} className="text-sm font-bold tracking-[0.16em] uppercase" style={{ color: "#6B7280" }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="py-24 bg-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-16">
              <p className="text-[0.68rem] font-bold tracking-[0.24em] uppercase mb-3" style={{ color: "#1A56DB" }}>
                Jarayon
              </p>
              <h2 className="font-black text-[2.5rem] tracking-tight mb-3" style={{ color: "#111318" }}>
                Qanday ishlaydi?
              </h2>
              <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: "#6B7280" }}>
                Uch bosqichda: baholash, moslashish, mustahkamlash.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  num: "01",
                  icon: <Brain className="h-5 w-5" style={{ color: "#1A56DB" }} />,
                  iconBg: "#EBF3FF",
                  title: "Kognitiv baholash",
                  desc: "10–15 daqiqa. Diqqat, xotira, qayta ishlash tezligi — shaxsiy kognitiv profil yaratiladi.",
                },
                {
                  num: "02",
                  icon: <TrendingUp className="h-5 w-5" style={{ color: "#1A56DB" }} />,
                  iconBg: "#EBF3FF",
                  title: "Adaptiv yo'nalish",
                  desc: "Har bir mashqdan keyin tizim keyingi eng foydali qadamni avtomatik aniqlaydi.",
                },
                {
                  num: "03",
                  icon: <RefreshCw className="h-5 w-5 text-emerald-500" />,
                  iconBg: "#ECFDF5",
                  title: "Spaced repetition",
                  desc: "Bilimni eslab qolishni kuzatadi. Ilmiy asoslangan: 3→7→14→30 kun intervallar.",
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className="step-card rounded-3xl p-8 relative overflow-hidden"
                  style={{
                    border: "1px solid rgba(26,86,219,0.09)",
                    background: "#FAFBFF",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <span
                    className="absolute top-4 right-5 font-black leading-none select-none"
                    style={{ fontSize: "5.5rem", color: "rgba(26,86,219,0.07)", fontVariantNumeric: "tabular-nums" }}
                  >
                    {item.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 relative z-10"
                    style={{ background: item.iconBg }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="font-black text-[1rem] mb-2 relative z-10" style={{ color: "#111318" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed relative z-10" style={{ color: "#6B7280" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-24" style={{ background: "#F1F5FF" }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              <div className="grid grid-cols-2 gap-4">
                {[
                  { v: "500+",  l: "Faol talaba",    c: "#1A56DB" },
                  { v: "12+",   l: "Kurslar",         c: "#1A56DB" },
                  { v: "1200+", l: "Baholashlar",     c: "#059669" },
                  { v: "+34%",  l: "O'rtacha o'sish", c: "#7C3AED" },
                ].map((s) => (
                  <div key={s.l} className="stat-hover rounded-3xl p-7 bg-white"
                    style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
                  >
                    <p className="font-black text-[2.5rem] mb-1.5 leading-none tabular-nums" style={{ color: s.c }}>{s.v}</p>
                    <p className="text-sm" style={{ color: "#6B7280" }}>{s.l}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[0.68rem] font-bold tracking-[0.22em] uppercase mb-5" style={{ color: "#1A56DB" }}>
                  Nima uchun BrainUP?
                </p>
                <h2 className="font-black text-[2.2rem] mb-5 leading-tight tracking-tight" style={{ color: "#111318" }}>
                  Har bir talaba —<br />alohida yo&apos;l
                </h2>
                <p className="mb-8 text-sm leading-[1.8]" style={{ color: "#6B7280" }}>
                  An&apos;anaviy o&apos;qitish barcha talabalarga bir xil materiallarni beradi.
                  BrainUP esa har bir talaba uchun individual yo&apos;l quradi —
                  zaif joylarni topib, kuchlilarini yanada mustahkamlaydi.
                </p>
                <div className="space-y-3.5">
                  {[
                    "Kognitiv profil asosida shaxsiy dars rejasi",
                    "Xatolar tahlili va zaif joylarni aniqlash",
                    "O'qituvchilar uchun real vaqt statistikasi",
                    "Ilmiy asoslangan spaced repetition algoritmi",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "#EBF3FF" }}
                      >
                        <CheckCircle2 className="h-3 w-3" style={{ color: "#1A56DB" }} />
                      </div>
                      <span className="text-sm leading-relaxed" style={{ color: "#374151" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 text-center" style={{ background: "#0C1B3B" }}>
          <div className="mx-auto max-w-lg px-6">
            <p className="text-[0.68rem] font-bold tracking-[0.24em] uppercase mb-5" style={{ color: "#93C5FD" }}>
              NamDPI · 2026
            </p>
            <h2 className="font-black text-[2.8rem] sm:text-[3.4rem] text-white mb-5 tracking-tight leading-tight">
              Bugundan<br />boshlang
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "#93C5FD" }}>
              NamDPI pilotiga qo&apos;shiling. Ro&apos;yxatdan o&apos;tish bepul — bir daqiqada tayyor.
            </p>
            <Link href="/register">
              <span className="btn-blue inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm text-white">
                Ro&apos;yxatdan o&apos;tish <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-white py-8" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
          <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <BrainUPLogo size="sm" />
              <span className="font-bold text-[0.95rem]" style={{ color: "#111318" }}>BrainUP</span>
            </Link>
            <div className="flex items-center gap-6 text-sm" style={{ color: "#9CA3AF" }}>
              <Link href="/login"    className="footer-link" style={{ color: "#9CA3AF" }}>Kirish</Link>
              <Link href="/register" className="footer-link" style={{ color: "#9CA3AF" }}>Ro&apos;yxat</Link>
              <Link href="#how"      className="footer-link" style={{ color: "#9CA3AF" }}>Jarayon</Link>
            </div>
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              © 2026{" "}
              <span style={{ color: "#1A56DB", fontWeight: 600 }}>BrainUP</span>
              {" "}·{" "}
              <span style={{ color: "#1A56DB", fontWeight: 600 }}>NamDPI</span>
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}
