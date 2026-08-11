import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Brain,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrainUPLogo } from "@/components/ui/brainup-logo";

export default async function LandingPage() {
  const session = await auth();

  if (session) {
    if (session.user.role === "ADMIN") redirect("/admin");
    if (session.user.role === "PROFESSOR") redirect("/professor/dashboard");
    redirect("/dashboard");
  }

  const nodes = [
    { angle: 0, colorClass: "bg-violet-500/20 border-violet-500/30", icon: <Zap className="h-4 w-4 text-violet-400" />, label: "Diqqat" },
    { angle: 72, colorClass: "bg-blue-500/20 border-blue-500/30", icon: <Brain className="h-4 w-4 text-blue-400" />, label: "Xotira" },
    { angle: 144, colorClass: "bg-emerald-500/20 border-emerald-500/30", icon: <RefreshCw className="h-4 w-4 text-emerald-400" />, label: "Retrieval" },
    { angle: 216, colorClass: "bg-amber-500/20 border-amber-500/30", icon: <Target className="h-4 w-4 text-amber-400" />, label: "Mastery" },
    { angle: 288, colorClass: "bg-pink-500/20 border-pink-500/30", icon: <BarChart3 className="h-4 w-4 text-pink-400" />, label: "Analytics" },
  ];

  const R = 180;
  const CX = 240;
  const CY = 240;

  return (
    <>
      <style>{`
        @keyframes orb-float {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-28px) scale(1.04); }
        }
        @keyframes fade-up {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes live-pulse {
          0%,100% { transform:scale(1);   opacity:1; }
          50%      { transform:scale(2.2); opacity:0; }
        }
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .orb-a { animation: orb-float 8s  ease-in-out infinite; }
        .orb-b { animation: orb-float 11s ease-in-out infinite 2s; }
        .orb-c { animation: orb-float 14s ease-in-out infinite 4s; }

        .a1 { animation: fade-up .7s ease-out .0s both; }
        .a2 { animation: fade-up .7s ease-out .15s both; }
        .a3 { animation: fade-up .7s ease-out .30s both; }
        .a4 { animation: fade-up .7s ease-out .45s both; }
        .a5 { animation: fade-up .7s ease-out .60s both; }

        .shimmer-text {
          background: linear-gradient(90deg,#93c5fd 0%,#e0e7ff 30%,#818cf8 60%,#3b82f6 80%,#93c5fd 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }

        .live-dot {
          animation: live-pulse 2s cubic-bezier(0,0,.2,1) infinite;
        }

        .ring-spin {
          transform-origin: 240px 240px;
          animation: slow-spin 30s linear infinite;
        }

        .card-lift {
          transition: transform .3s ease, box-shadow .3s ease;
        }
        .card-lift:hover {
          transform: translateY(-6px);
        }

        .step-ghost {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 6rem;
          line-height: 1;
          background: linear-gradient(180deg,rgba(255,255,255,.1) 0%,rgba(255,255,255,.01) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          user-select: none;
        }
      `}</style>

      <div className="min-h-screen bg-slate-950">

        {/* ── NAV ── */}
        <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrainUPLogo size="md" href="/" />
              <span className="f-syne font-bold text-white text-lg tracking-tight">BrainUP</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/5">
                  Kirish
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-600/25">
                  Boshlash
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
          {/* Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
            <div className="orb-a absolute -top-20 -left-40  w-[600px] h-[600px] rounded-full bg-blue-700/10   blur-[120px]" />
            <div className="orb-b absolute bottom-0  -right-40 w-[500px] h-[500px] rounded-full bg-indigo-700/10 blur-[100px]" />
            <div className="orb-c absolute top-2/3 left-1/3   w-[300px] h-[300px] rounded-full bg-violet-700/8  blur-[80px]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-6 py-28 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* LEFT */}
              <div>
                <div className="a1 inline-flex items-center gap-2.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-sm text-blue-400 mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
                  </span>
                  NamDPI pilot &mdash; 2026
                </div>

                <h1 className="a2 f-syne text-5xl lg:text-[3.75rem] font-bold text-white leading-[1.08] mb-6">
                  Ko&apos;proq emas,{" "}
                  <br />
                  <span className="shimmer-text">to&apos;g&apos;riroq</span> o&apos;qing
                </h1>

                <p className="a3 text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
                  BrainUP kognitiv profilingiz, xatolaringiz va temingizga
                  asoslanib &mdash; har bir talaba uchun individual ta&apos;lim
                  yo&apos;nalishi yaratadi.
                </p>

                <div className="a4 flex flex-wrap items-center gap-4">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-8 text-base gap-2 border-0 shadow-xl shadow-blue-600/20"
                    >
                      Bepul boshlash <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white h-12 px-8 text-base"
                    >
                      Kirish
                    </Button>
                  </Link>
                </div>

                <div className="a5 mt-12 flex items-center gap-8">
                  {[
                    { v: "500+", l: "Faol talaba" },
                    { v: "98%",  l: "Qoniqish" },
                    { v: "3×",   l: "Tezroq o'zlashtiruv" },
                  ].map((s, i) => (
                    <div key={s.l} className={i > 0 ? "border-l border-white/10 pl-8" : ""}>
                      <p className="f-syne text-2xl font-bold text-white">{s.v}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — neural network */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative w-[480px] h-[480px]">
                  {/* Ring decorations */}
                  <div className="absolute inset-0   rounded-full border border-white/[0.04]" />
                  <div className="absolute inset-8   rounded-full border border-white/[0.04]" />
                  <div className="absolute inset-16  rounded-full border border-white/[0.04]" />

                  {/* SVG lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 480" fill="none">
                    <defs>
                      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="#3b82f6" stopOpacity=".5" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity=".05" />
                      </linearGradient>
                    </defs>

                    {/* Spinning dashed ring */}
                    <circle
                      cx={CX} cy={CY} r={R}
                      stroke="url(#ringGrad)"
                      strokeWidth="1"
                      strokeDasharray="6 14"
                      className="ring-spin"
                    />

                    {/* Spokes center → node */}
                    {nodes.map((n) => {
                      const rad = (n.angle * Math.PI) / 180;
                      return (
                        <line
                          key={n.angle}
                          x1={CX} y1={CY}
                          x2={CX + R * Math.cos(rad)}
                          y2={CY + R * Math.sin(rad)}
                          stroke="rgba(99,102,241,.18)"
                          strokeWidth="1"
                          strokeDasharray="4 6"
                        />
                      );
                    })}

                    {/* Pentagon edges */}
                    {nodes.map((n, i) => {
                      const next = nodes[(i + 1) % nodes.length];
                      const r1 = (n.angle    * Math.PI) / 180;
                      const r2 = (next.angle * Math.PI) / 180;
                      return (
                        <line
                          key={`e${i}`}
                          x1={CX + R * Math.cos(r1)} y1={CY + R * Math.sin(r1)}
                          x2={CX + R * Math.cos(r2)} y2={CY + R * Math.sin(r2)}
                          stroke="rgba(59,130,246,.1)"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>

                  {/* Center node */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-24 h-24 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
                      <Brain className="h-10 w-10 text-blue-400" />
                      <span
                        className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping"
                        style={{ animationDuration: "3s" }}
                      />
                    </div>
                  </div>

                  {/* Orbital nodes */}
                  {nodes.map((n, i) => {
                    const rad = (n.angle * Math.PI) / 180;
                    const nx  = CX + R * Math.cos(rad);
                    const ny  = CY + R * Math.sin(rad);
                    return (
                      <div
                        key={n.label}
                        className="absolute flex flex-col items-center gap-1.5"
                        style={{
                          left: nx - 24,
                          top:  ny - 24,
                          animation: `fade-up .6s ease-out ${i * .15}s both`,
                        }}
                      >
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${n.colorClass}`}>
                          {n.icon}
                        </div>
                        <span className="text-[11px] text-slate-600 whitespace-nowrap">{n.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 border-y border-white/5 bg-slate-900/40">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-16">
              <p className="text-blue-400 text-xs font-medium tracking-[0.2em] uppercase mb-4">Jarayon</p>
              <h2 className="f-syne text-4xl font-bold text-white mb-4">Qanday ishlaydi?</h2>
              <p className="text-slate-500 max-w-sm mx-auto">
                Uch bosqichda — baholash, moslashish, mustahkamlash.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  icon: <Brain className="h-6 w-6 text-violet-400" />,
                  border: "border-violet-500/20",
                  glow: "0 0 40px rgba(139,92,246,.08)",
                  title: "Kognitiv baholash",
                  desc: "10–15 daqiqa. Diqqat, xotira, qayta ishlash tezligi — shaxsiy kognitiv profil yaratiladi.",
                },
                {
                  step: "02",
                  icon: <TrendingUp className="h-6 w-6 text-blue-400" />,
                  border: "border-blue-500/20",
                  glow: "0 0 40px rgba(59,130,246,.08)",
                  title: "Adaptiv yo'nalish",
                  desc: "Har bir mashqdan keyin tizim keyingi eng foydali qadamni avtomatik aniqlaydi.",
                },
                {
                  step: "03",
                  icon: <RefreshCw className="h-6 w-6 text-emerald-400" />,
                  border: "border-emerald-500/20",
                  glow: "0 0 40px rgba(16,185,129,.08)",
                  title: "Spaced repetition",
                  desc: "Bilimni eslab qolishni kuzatadi. Ilmiy asoslangan: 3→7→14→30 kun intervallar.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`card-lift relative rounded-2xl border ${item.border} bg-slate-950/90 p-8`}
                  style={{ boxShadow: item.glow }}
                >
                  <div className="step-ghost absolute top-4 right-5 select-none">{item.step}</div>
                  <div className="mb-5 w-13 h-13 w-[52px] h-[52px] rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="f-syne text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BENEFITS ── */}
        <section className="py-24 bg-slate-950">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { v: "500+",  l: "Faol talaba",     border: "border-blue-500/20",   grad: "from-blue-600/10 to-transparent",    text: "text-blue-400" },
                  { v: "12+",   l: "Kurslar",          border: "border-emerald-500/20", grad: "from-emerald-600/10 to-transparent",  text: "text-emerald-400" },
                  { v: "1200+", l: "Baholashlar",      border: "border-violet-500/20", grad: "from-violet-600/10 to-transparent",   text: "text-violet-400" },
                  { v: "+34%",  l: "O'rtacha o'sish",  border: "border-amber-500/20",  grad: "from-amber-600/10 to-transparent",    text: "text-amber-400" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className={`card-lift rounded-2xl border ${s.border} bg-gradient-to-br ${s.grad} p-8`}
                  >
                    <p className={`f-syne text-4xl font-bold ${s.text} mb-1`}>{s.v}</p>
                    <p className="text-slate-600 text-sm">{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Text */}
              <div>
                <p className="text-blue-400 text-xs font-medium tracking-[0.2em] uppercase mb-5">Nima uchun BrainUP?</p>
                <h2 className="f-syne text-4xl font-bold text-white mb-6 leading-tight">
                  Har bir talaba &mdash; alohida yo&apos;l
                </h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  An&apos;anaviy o&apos;qitish barcha talabalarga bir xil materiallarni beradi.
                  BrainUP esa har bir talaba uchun individual yo&apos;l quradi —
                  zaif joylarni topib, kuchlilarini yanada mustahkamlaydi.
                </p>
                <div className="space-y-4">
                  {[
                    "Kognitiv profil asosida shaxsiy dars rejasi",
                    "Xatolar tahlili va zaif joylarni aniqlash",
                    "O'qituvchilar uchun real vaqt statistikasi",
                    "Ilmiy asoslangan spaced repetition algoritmi",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-blue-400" />
                      </div>
                      <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,.8) 1px,transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="orb-a absolute -top-16 left-1/4 w-[450px] h-[450px] rounded-full bg-blue-600/12 blur-[90px] pointer-events-none" />

          <div className="relative mx-auto max-w-2xl px-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 mb-8 mx-auto">
              <Image
                src="/namdpi-logo.jpg"
                alt="NamDPI"
                width={56}
                height={56}
                className="rounded-xl object-cover"
                unoptimized
              />
            </div>
            <h2 className="f-syne text-4xl lg:text-5xl font-bold text-white mb-5">
              Bugundan boshlang
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
              NamDPI pilotiga qo&apos;shiling. Ro&apos;yxatdan o&apos;tish bepul —
              bir daqiqada tayyor.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="f-syne font-bold bg-blue-500 hover:bg-blue-400 text-white h-14 px-12 text-lg gap-2 border-0 shadow-2xl shadow-blue-500/20"
              >
                Ro&apos;yxatdan o&apos;tish <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/5 bg-slate-950 py-10">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <BrainUPLogo size="sm" href="/" />
                <span className="f-syne font-bold text-white">BrainUP</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5">
                <Image
                  src="/namdpi-logo.jpg"
                  alt="NamDPI"
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                  unoptimized
                />
                <div>
                  <p className="text-xs font-semibold text-slate-300">NamDPI</p>
                  <p className="text-[11px] text-slate-600">Namangan Davlat Pedagogika Instituti</p>
                </div>
              </div>

              <span className="text-sm text-slate-700">&copy; 2026 BrainUP</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
