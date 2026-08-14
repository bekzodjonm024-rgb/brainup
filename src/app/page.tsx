import type { CSSProperties } from "react";
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
        /* ── Ticker ── */
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .ticker-track { animation: ticker 30s linear infinite; }

        /* ── Hero left text ── */
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .a1{animation:fadeUp .55s ease-out 0s both}
        .a2{animation:fadeUp .55s ease-out .12s both}
        .a3{animation:fadeUp .55s ease-out .22s both}
        .a4{animation:fadeUp .55s ease-out .34s both}

        /* ── Card reveal ── */
        @keyframes cardReveal {
          from { opacity:0; transform:rotate(-1.5deg) translateY(20px) }
          to   { opacity:1; transform:rotate(-1.5deg) translateY(0) }
        }
        .card-main { animation: cardReveal .7s ease-out .2s both; }

        /* ── Badge stagger ── */
        @keyframes badgeFade {
          from { opacity:0; transform:translateY(10px) }
          to   { opacity:1; transform:translateY(0) }
        }
        .bg-a { animation: badgeFade .5s ease-out .38s both; }
        .bg-b { animation: badgeFade .5s ease-out .50s both; }
        .bg-c { animation: badgeFade .5s ease-out .62s both; }
        .bg-d { animation: badgeFade .5s ease-out .74s both; }
        .st-row { animation: badgeFade .5s ease-out .82s both; }

        /* ── Progress bar fill ── */
        @keyframes barFill { from{width:0} to{width:var(--bw)} }
        .bar-fill { animation: barFill 1s ease-out var(--bd,0.5s) both; }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .card-main,.bg-a,.bg-b,.bg-c,.bg-d,.st-row { animation: none; }
          .card-main { transform: rotate(-1.5deg); }
          .bar-fill   { animation: none; width: var(--bw); }
        }

        /* ── "How it works" card hover ── */
        .card-3d { transition: transform .35s cubic-bezier(.22,.61,.36,1), box-shadow .35s ease; }
        .card-3d:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 24px 48px rgba(28,18,8,0.13), 0 6px 16px rgba(28,18,8,0.07), 0 0 0 1px rgba(28,18,8,0.04) !important;
        }

        /* ── Shimmer keyframes ── */
        @keyframes shimmerSweep {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes heroSweep {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes blockFloat {
          0%, 100% { transform: translateY(-2px); box-shadow: 0 4px 0 #6B2A04, 0 8px 0 #3D1502, 0 10px 24px rgba(0,0,0,0.55); }
          50%       { transform: translateY(-7px); box-shadow: 0 8px 0 #6B2A04, 0 14px 0 #3D1502, 0 18px 36px rgba(0,0,0,0.40); }
        }

        /* ── 3D brand text with shimmer (nav, footer, inline) ── */
        .brand-3d {
          background: linear-gradient(
            90deg,
            #92400E 0%,
            #C47518 18%,
            #F0A828 35%,
            #FFE566 47%,
            #FFFAB0 50%,
            #FFE566 53%,
            #F0A828 65%,
            #C47518 82%,
            #92400E 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter:
            drop-shadow(0 2px 0 rgba(100,38,5,0.85))
            drop-shadow(0 4px 0 rgba(50,15,0,0.55))
            drop-shadow(0 5px 12px rgba(0,0,0,0.55));
          animation: shimmerSweep 3s linear infinite;
        }

        /* ── 3D hero display heading with shimmer (large text) ── */
        .hero-3d {
          background: linear-gradient(
            90deg,
            #7C2D12 0%,
            #B45309 15%,
            #E8921C 30%,
            #FFD060 43%,
            #FFF4A0 50%,
            #FFD060 57%,
            #E8921C 70%,
            #B45309 85%,
            #7C2D12 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter:
            drop-shadow(0 3px 0 rgba(90,35,3,1.0))
            drop-shadow(0 6px 0 rgba(45,12,0,0.65))
            drop-shadow(0 9px 0 rgba(15,3,0,0.35))
            drop-shadow(0 12px 24px rgba(0,0,0,0.60));
          animation: heroSweep 4s linear infinite;
        }

        /* ── TIZIMI floating block ── */
        .tizimi-float {
          animation: blockFloat 3.2s ease-in-out infinite;
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .brand-3d, .hero-3d { animation: none; background-position: 0% 50%; }
          .tizimi-float { animation: none; transform: translateY(-2px); }
        }

        /* ── Nav button ── */
        .btn-amber {
          background: #B45309; color: #fff;
          box-shadow: 0 4px 14px rgba(180,83,9,0.35);
          transition: all .2s ease;
        }
        .btn-amber:hover {
          background: #92400E; transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(180,83,9,0.40);
        }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: "#0E0A06" }}>

        {/* ── NAV ── */}
        <nav
          className="sticky top-0 z-50"
          style={{ backgroundColor: "rgba(14,10,6,0.94)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="mx-auto max-w-6xl px-6 h-[62px] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <BrainUPLogo size="sm" />
              <span className="brand-3d font-extrabold text-[1.05rem] tracking-tight">BrainUP</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-[0.875rem] font-medium" style={{ color: "#A89078" }}>
              <Link href="/" className="transition-colors hover:text-[#F0EAE0]">Bosh sahifa</Link>
              <Link href="#how" className="transition-colors hover:text-[#F0EAE0]">Jarayon</Link>
              <Link href="#features" className="transition-colors hover:text-[#F0EAE0]">Imkoniyatlar</Link>
              <Link href="/login" className="transition-colors hover:text-[#F0EAE0]">Kirish</Link>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.06)" }}
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
                    className="a1 hero-3d font-black uppercase leading-none tracking-tight"
                    style={{ fontSize: "clamp(2.6rem,5.2vw,3.75rem)" }}
                  >
                    AQLLI<br />O&apos;QISHNING
                  </div>
                  <div className="a2 mt-2 mb-5">
                    <span
                      className="tizimi-float font-black uppercase tracking-tight px-2 py-0.5 inline-block"
                      style={{
                        fontSize: "clamp(2.6rem,5.2vw,3.75rem)",
                        lineHeight: 1,
                        background: "linear-gradient(135deg, #D4781A 0%, #B45309 55%, #92400E 100%)",
                        color: "#fff",
                        textShadow: "0 1px 3px rgba(0,0,0,0.35)",
                      }}
                    >
                      TIZIMI
                    </span>
                  </div>
                  <p className="a3 leading-relaxed max-w-xs text-[0.95rem]" style={{ color: "rgba(240,234,224,0.65)" }}>
                    Kognitiv profilingizga asoslanib — har bir talaba uchun
                    alohida ta&apos;lim yo&apos;nalishi. <span className="brand-3d font-bold">NamDPI</span> pilot, 2026.
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

              {/* RIGHT — 3-column layout: no overlap guaranteed by structure */}
              <div
                className="hidden lg:flex flex-col flex-1 select-none"
                style={{ minHeight: 560, padding: "20px 40px 20px 8px" }}
              >
                {/* ── 3-col scene: [left badges] [card] [right badges] ── */}
                <div className="flex-1 flex items-center gap-3" style={{ minHeight: 0 }}>

                  {/* COL 1 — left badges (fixed 122px, can't reach card) */}
                  <div style={{ width: 122, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>

                    <div className="bg-a" style={{
                      background: "#fff", borderRadius: 16, padding: "10px 12px",
                      boxShadow: "0 8px 24px rgba(28,18,8,0.10), 0 0 0 1px rgba(28,18,8,0.05)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FEF4E7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Zap className="w-3 h-3" style={{ color: "#B45309" }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 8, color: "#9C8272", fontWeight: 600, letterSpacing: "0.04em", marginBottom: 2 }}>DIQQAT SKORI</p>
                          <p style={{ fontSize: 15, fontWeight: 800, color: "#1C1208", lineHeight: 1 }}>87%</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-c" style={{
                      background: "#fff", borderRadius: 16, padding: "10px 12px",
                      boxShadow: "0 8px 24px rgba(28,18,8,0.08), 0 0 0 1px rgba(28,18,8,0.05)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Target className="w-3 h-3 text-emerald-500" />
                        </div>
                        <div>
                          <p style={{ fontSize: 8, color: "#9C8272", fontWeight: 600, letterSpacing: "0.04em", marginBottom: 2 }}>RETRIEVAL</p>
                          <p style={{ fontSize: 14, fontWeight: 800, color: "#1C1208", lineHeight: 1 }}>3 → 30 kun</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* COL 2 — main card (flex-1, centers itself) */}
                  <div className="flex-1 relative flex items-center justify-center" style={{ minWidth: 0 }}>

                    <div style={{
                      position: "absolute", inset: 0, pointerEvents: "none",
                      background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(180,83,9,0.08) 0%, transparent 68%)",
                    }} />

                    <div
                      className="card-main"
                      style={{
                        width: "100%", maxWidth: 276,
                        background: "#fff", borderRadius: 24,
                        padding: "28px 26px 22px",
                        boxShadow: "0 20px 56px rgba(0,0,0,0.20), 0 6px 20px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)",
                        position: "relative", zIndex: 10,
                      }}
                    >
                      <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: 8, color: "#B45309", letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 5 }}>
                          Kognitiv Profil
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1208", lineHeight: 1.3 }}>
                          Sardor R. <span style={{ color: "#D4B896" }}>·</span> NamDPI <span style={{ color: "#D4B896" }}>·</span> 2-kurs
                        </p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                        {cogBars.map((item, idx) => (
                          <div key={item.n}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                              <span style={{ fontSize: 11, color: "#7A6557", fontWeight: 500 }}>{item.n}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#1C1208", fontVariantNumeric: "tabular-nums" }}>{item.v}</span>
                            </div>
                            <div style={{ height: 4, background: "#F0EAE0", borderRadius: 99, overflow: "hidden" }}>
                              <div
                                className="bar-fill"
                                style={{
                                  "--bw": `${item.v}%`,
                                  "--bd": `${0.52 + idx * 0.07}s`,
                                  height: "100%", borderRadius: 99,
                                  background: item.v >= 85 ? "linear-gradient(90deg,#92400E,#B45309)" : item.v >= 70 ? "#B45309" : "#C4A882",
                                } as CSSProperties}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{
                        marginTop: 18, paddingTop: 13,
                        borderTop: "1px solid rgba(28,18,8,0.06)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}>
                        <span style={{ fontSize: 10, color: "#9C8272" }}>Keyingi sessiya</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#B45309", background: "#FEF4E7", padding: "3px 10px", borderRadius: 99 }}>3 kun</span>
                      </div>
                    </div>
                  </div>

                  {/* COL 3 — right badges (fixed 130px, can't reach card) */}
                  <div style={{ width: 130, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, paddingTop: 20 }}>

                    <div className="bg-b" style={{
                      background: "#B45309", borderRadius: 18,
                      padding: "12px 16px 10px",
                      boxShadow: "0 12px 36px rgba(180,83,9,0.44), 0 4px 12px rgba(180,83,9,0.22)",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>78</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.58)", marginTop: 3, letterSpacing: "0.08em", fontWeight: 600 }}>/ 100 BALL</div>
                    </div>

                    <div className="bg-d" style={{
                      background: "#17130E",
                      border: "1px solid rgba(180,83,9,0.18)",
                      borderRadius: 16, padding: "10px 12px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.24)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(180,83,9,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <TrendingUp className="w-3 h-3" style={{ color: "#D4973A" }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 8, color: "#7A6252", letterSpacing: "0.07em", fontWeight: 600, marginBottom: 2 }}>MASTERY O&apos;SISH</p>
                          <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1 }}>+34%</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ── STAT ROW ── */}
                <div className="st-row" style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  {([
                    { icon: <GraduationCap className="w-3 h-3" style={{ color: "#B45309" }} />, iconBg: "#FEF4E7", value: "98%",  label: "muvaffaqiyat", dark: false },
                    { icon: <Users         className="w-3 h-3" style={{ color: "#D4973A" }} />, iconBg: "rgba(255,255,255,0.09)", value: "100+", label: "hamkor univ.",  dark: true  },
                    { icon: <BookOpen      className="w-3 h-3" style={{ color: "#B45309" }} />, iconBg: "#FEF4E7", value: "20+",  label: "faol kurslar", dark: false },
                  ] as const).map((s, i) => (
                    <div key={i} style={{
                      flex: 1, borderRadius: 14, padding: "11px 13px",
                      background: s.dark ? "#1C1208" : "rgba(255,255,255,0.88)",
                      boxShadow: s.dark
                        ? "0 8px 24px rgba(0,0,0,0.22)"
                        : "0 6px 18px rgba(28,18,8,0.08), 0 0 0 1px rgba(28,18,8,0.05)",
                    }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 7 }}>
                        {s.icon}
                      </div>
                      <p style={{ fontSize: 18, fontWeight: 900, color: s.dark ? "#fff" : "#1C1208", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</p>
                      <p style={{ fontSize: 9, marginTop: 3, color: s.dark ? "rgba(240,234,224,0.45)" : "#9C8272", fontWeight: 500 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* MOBILE visual — stacked below left content */}
              <div className="lg:hidden px-8 pb-8">
                <div style={{
                  background: "#fff", borderRadius: 20,
                  padding: "22px 22px 18px",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)",
                  marginBottom: 12,
                }}>
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 8, color: "#B45309", letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Kognitiv Profil</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1208" }}>Sardor R. · NamDPI · 2-kurs</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {cogBars.map((item) => (
                      <div key={item.n}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "#7A6557", fontWeight: 500 }}>{item.n}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#1C1208" }}>{item.v}</span>
                        </div>
                        <div style={{ height: 4, background: "#F0EAE0", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{
                            width: `${item.v}%`, height: "100%", borderRadius: 99,
                            background: item.v >= 85 ? "linear-gradient(90deg,#92400E,#B45309)" : item.v >= 70 ? "#B45309" : "#C4A882",
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(28,18,8,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "#9C8272" }}>Keyingi sessiya</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#B45309", background: "#FEF4E7", padding: "3px 10px", borderRadius: 99 }}>3 kun</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "9px 11px", boxShadow: "0 4px 14px rgba(28,18,8,0.08), 0 0 0 1px rgba(28,18,8,0.04)", display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#FEF4E7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Zap className="w-2.5 h-2.5" style={{ color: "#B45309" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 7, color: "#9C8272", fontWeight: 600 }}>DIQQAT</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: "#1C1208", lineHeight: 1 }}>87%</p>
                    </div>
                  </div>
                  <div style={{ flex: 1, background: "#B45309", borderRadius: 14, padding: "9px 11px", boxShadow: "0 8px 20px rgba(180,83,9,0.42)", textAlign: "center" }}>
                    <p style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>78</p>
                    <p style={{ fontSize: 8, color: "rgba(255,255,255,0.60)", marginTop: 1 }}>/ 100 BALL</p>
                  </div>
                  <div style={{ flex: 1, background: "#17130E", borderRadius: 14, padding: "9px 11px", border: "1px solid rgba(180,83,9,0.18)", display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(180,83,9,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <TrendingUp className="w-2.5 h-2.5" style={{ color: "#D4973A" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 7, color: "#7A6252", fontWeight: 600 }}>MASTERY</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1 }}>+34%</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {([
                    { icon: <GraduationCap className="w-2.5 h-2.5" style={{ color: "#B45309" }} />, iconBg: "#FEF4E7", value: "98%",  label: "muvaffaqiyat", dark: false },
                    { icon: <Users         className="w-2.5 h-2.5" style={{ color: "#D4973A" }} />, iconBg: "rgba(255,255,255,0.09)", value: "100+", label: "hamkor univ.",  dark: true  },
                    { icon: <BookOpen      className="w-2.5 h-2.5" style={{ color: "#B45309" }} />, iconBg: "#FEF4E7", value: "20+",  label: "faol kurslar", dark: false },
                  ] as const).map((s, i) => (
                    <div key={i} style={{
                      flex: 1, borderRadius: 12, padding: "10px 12px",
                      background: s.dark ? "#1C1208" : "rgba(255,255,255,0.88)",
                      boxShadow: s.dark ? "0 6px 18px rgba(0,0,0,0.22)" : "0 4px 14px rgba(28,18,8,0.08), 0 0 0 1px rgba(28,18,8,0.04)",
                    }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                        {s.icon}
                      </div>
                      <p style={{ fontSize: 16, fontWeight: 900, color: s.dark ? "#fff" : "#1C1208", lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: 8, marginTop: 2, color: s.dark ? "rgba(240,234,224,0.45)" : "#9C8272", fontWeight: 500 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PARTNER TICKER ── */}
        <div
          className="py-8 overflow-hidden"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="ticker-track flex gap-14 whitespace-nowrap">
            {[...partners, ...partners].map((p, i) => (
              <span
                key={i}
                className="font-bold text-sm tracking-[0.18em] uppercase"
                style={{ color: "#6B5540" }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* ── LIGHT CONTENT ISLAND (How It Works + Features) ── */}
        <div style={{ background: "#F8F5EF", borderRadius: "40px 40px 0 0" }}>

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
                <p className="text-xs font-bold tracking-[0.22em] uppercase mb-5">
                  Nima uchun <span className="brand-3d">BrainUP</span>?
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

        </div>{/* end light island */}

        {/* ── CTA ── */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-8 pt-12">
          <div
            className="rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden"
            style={{ background: "#1C1208", border: "1px solid rgba(180,83,9,0.18)" }}
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
              <p className="brand-3d text-xs font-bold tracking-widest uppercase mb-4">
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
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} className="py-10">
          <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <BrainUPLogo size="sm" />
              <span className="brand-3d font-bold">BrainUP</span>
            </Link>
            <div className="flex items-center gap-6 text-sm" style={{ color: "#6B5540" }}>
              <Link href="/login" className="transition-colors hover:text-[#F0EAE0]">Kirish</Link>
              <Link href="/register" className="transition-colors hover:text-[#F0EAE0]">Ro&apos;yxat</Link>
              <Link href="#how" className="transition-colors hover:text-[#F0EAE0]">Jarayon</Link>
            </div>
            <p className="text-sm" style={{ color: "#4A3520" }}>© 2026 <span className="brand-3d font-semibold">BrainUP</span> · <span className="brand-3d font-semibold">NamDPI</span></p>
          </div>
        </footer>

      </div>
    </>
  );
}
