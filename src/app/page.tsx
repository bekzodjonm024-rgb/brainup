import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  BookOpen,
  Zap,
  Target,
  Play,
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

  return (
    <>
      <style>{`
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .ticker-track { animation: ticker 28s linear infinite; }

        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        .fl-1 { animation: floatUp 4s ease-in-out infinite; }
        .fl-2 { animation: floatUp 5s ease-in-out infinite .9s; }
        .fl-3 { animation: floatUp 6s ease-in-out infinite 1.8s; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .a1{animation:fadeUp .5s ease-out 0s both}
        .a2{animation:fadeUp .5s ease-out .1s both}
        .a3{animation:fadeUp .5s ease-out .2s both}
        .a4{animation:fadeUp .5s ease-out .3s both}

        @keyframes pulseRing {
          0%{transform:scale(1);opacity:.25}
          100%{transform:scale(1.7);opacity:0}
        }
        .pulse-ring { animation: pulseRing 2.8s cubic-bezier(0,0,.2,1) infinite; }

        @keyframes slowSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .slow-spin { animation: slowSpin 22s linear infinite; transform-origin: 50% 50%; }

        .card-hover { transition: transform .25s ease, box-shadow .25s ease; }
        .card-hover:hover { transform: translateY(-5px); }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: "#f8faff" }}>

        {/* ── NAV ── */}
        <nav
          className="sticky top-0 z-50"
          style={{ backgroundColor: "#f8faff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="mx-auto max-w-6xl px-6 h-[62px] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <BrainUPLogo size="sm" />
              <span className="font-extrabold text-slate-900 text-[1.05rem] tracking-tight">BrainUP</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-[0.875rem] text-slate-600 font-medium">
              <Link href="/" className="hover:text-slate-900 transition-colors">Bosh sahifa</Link>
              <Link href="#how" className="hover:text-slate-900 transition-colors">Jarayon</Link>
              <Link href="#features" className="hover:text-slate-900 transition-colors">Imkoniyatlar</Link>
              <Link href="/login" className="hover:text-slate-900 transition-colors">Kirish</Link>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
              <Link href="/register">
                <span className="bg-slate-900 text-white text-[0.8rem] font-extrabold px-5 py-2.5 rounded-full hover:bg-slate-700 transition-colors tracking-wider inline-block">
                  BOSHLASH
                </span>
              </Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4">
          <div className="relative rounded-3xl overflow-hidden bg-blue-600" style={{ minHeight: 560 }}>

            <div className="flex flex-col lg:flex-row" style={{ minHeight: 560 }}>

              {/* LEFT */}
              <div className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-14" style={{ minHeight: 560 }}>
                <div>
                  <div className="a1 font-black text-white uppercase leading-none tracking-tight" style={{ fontSize: "clamp(2.6rem,5.2vw,3.75rem)" }}>
                    AQLLI<br />O&apos;QISHNING
                  </div>
                  <div className="a2 mt-2 mb-5">
                    <span
                      className="bg-white text-blue-600 font-black uppercase tracking-tight px-2 py-0.5 inline-block"
                      style={{ fontSize: "clamp(2.6rem,5.2vw,3.75rem)", lineHeight: 1 }}
                    >
                      TIZIMI
                    </span>
                  </div>
                  <p className="a3 text-white/70 leading-relaxed max-w-xs text-[0.95rem]">
                    Kognitiv profilingizga asoslanib — har bir talaba uchun
                    alohida ta&apos;lim yo&apos;nalishi. NamDPI pilot, 2026.
                  </p>
                </div>

                <div className="a4 mt-8 space-y-5">
                  <Link href="/register" className="flex items-center gap-3 group w-fit">
                    <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
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
                          className="rounded-full bg-blue-800 border-2 border-blue-400 flex items-center justify-center text-white text-[11px] font-bold"
                          style={{ width: 36, height: 36 }}
                        >
                          {init}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-none">460+</p>
                      <p className="text-white/50 text-xs">faol talaba</p>
                    </div>
                    <button className="w-9 h-9 rounded-full flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors ml-1">
                      <Play className="h-3.5 w-3.5 text-white fill-white ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT — Illustration */}
              <div className="hidden lg:block relative flex-1" style={{ minHeight: 560 }}>

                {/* Background rings */}
                <div
                  className="absolute rounded-full"
                  style={{ width: 380, height: 380, top: "50%", left: "45%", transform: "translate(-50%,-56%)", background: "rgba(255,255,255,0.07)" }}
                />
                <div
                  className="absolute rounded-full"
                  style={{ width: 260, height: 260, top: "50%", left: "45%", transform: "translate(-50%,-56%)", background: "rgba(255,255,255,0.05)" }}
                />

                {/* Spinning SVG ring */}
                <div className="absolute" style={{ width: 310, height: 310, top: "50%", left: "45%", transform: "translate(-50%,-56%)" }}>
                  <svg className="w-full h-full" viewBox="0 0 310 310" fill="none">
                    <circle
                      className="slow-spin"
                      cx="155" cy="155" r="150"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth="1.5"
                      strokeDasharray="8 14"
                    />
                  </svg>
                </div>

                {/* Central brain */}
                <div className="absolute" style={{ top: "50%", left: "45%", transform: "translate(-50%,-56%)" }}>
                  <div className="relative">
                    <div className="pulse-ring absolute -inset-5 rounded-3xl" style={{ background: "rgba(255,255,255,0.12)" }} />
                    <div
                      className="w-[130px] h-[130px] rounded-3xl flex items-center justify-center border border-white/20"
                      style={{ background: "rgba(255,255,255,0.14)" }}
                    >
                      <Brain className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>

                {/* Floating badge — Diqqat */}
                <div className="fl-1 absolute bg-white rounded-2xl shadow-2xl px-4 py-3" style={{ top: 55, left: 20 }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 leading-none mb-0.5">Diqqat skori</p>
                      <p className="font-black text-slate-900 text-sm">87%</p>
                    </div>
                  </div>
                </div>

                {/* Floating badge — O'sish */}
                <div className="fl-2 absolute bg-slate-900 rounded-2xl shadow-2xl px-4 py-3" style={{ top: 140, right: 24 }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-950 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 leading-none mb-0.5">Mastery o&apos;sish</p>
                      <p className="font-black text-white text-sm">+34%</p>
                    </div>
                  </div>
                </div>

                {/* Floating badge — Retrieval */}
                <div className="fl-3 absolute bg-white rounded-2xl shadow-2xl px-4 py-3" style={{ top: 260, left: 10 }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Target className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 leading-none mb-0.5">Retrieval</p>
                      <p className="font-black text-slate-900 text-sm">3→30 kun</p>
                    </div>
                  </div>
                </div>

                {/* GradCap decoration */}
                <div className="absolute" style={{ bottom: 180, right: 30 }}>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/20"
                    style={{ background: "rgba(255,255,255,0.14)" }}
                  >
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Bottom stat cards */}
                <div className="absolute bottom-5 right-4 flex gap-3">
                  <div className="rounded-2xl p-4 shadow-xl" style={{ backgroundColor: "#f8faff", minWidth: 108 }}>
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                      <Star className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">98%</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">muvaffaqiyat</p>
                  </div>
                  <div className="bg-slate-900 rounded-2xl p-4 shadow-xl" style={{ minWidth: 125 }}>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mb-2">
                      <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-2xl font-black text-white">100+</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">hamkor universitetlar</p>
                  </div>
                  <div className="rounded-2xl p-4 shadow-xl" style={{ backgroundColor: "#f8faff", minWidth: 108 }}>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">20+</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">faol kurslar</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ── PARTNER TICKER ── */}
        <div className="py-9 overflow-hidden" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="ticker-track flex gap-14 whitespace-nowrap">
            {[...partners, ...partners].map((p, i) => (
              <span key={i} className="text-slate-400 font-bold text-sm tracking-[0.18em] uppercase">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-14">
              <p className="text-blue-600 font-bold text-xs tracking-[0.22em] uppercase mb-3">Jarayon</p>
              <h2 className="font-black text-slate-900 text-4xl tracking-tight">Qanday ishlaydi?</h2>
              <p className="text-slate-500 mt-3 max-w-sm mx-auto text-sm leading-relaxed">
                Uch bosqichda — baholash, moslashish, mustahkamlash.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  step: "01",
                  icon: <Brain className="h-6 w-6 text-blue-600" />,
                  bg: "bg-blue-50",
                  title: "Kognitiv baholash",
                  desc: "10–15 daqiqa. Diqqat, xotira, qayta ishlash tezligi — shaxsiy kognitiv profil yaratiladi.",
                },
                {
                  step: "02",
                  icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
                  bg: "bg-blue-50",
                  title: "Adaptiv yo'nalish",
                  desc: "Har bir mashqdan keyin tizim keyingi eng foydali qadamni avtomatik aniqlaydi.",
                },
                {
                  step: "03",
                  icon: <RefreshCw className="h-6 w-6 text-emerald-500" />,
                  bg: "bg-emerald-50",
                  title: "Spaced repetition",
                  desc: "Bilimni eslab qolishni kuzatadi. Ilmiy asoslangan: 3→7→14→30 kun intervallar.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="card-hover bg-white rounded-3xl p-8 shadow-sm"
                  style={{ border: "1px solid rgba(0,0,0,0.05)" }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center`}>
                      {item.icon}
                    </div>
                    <span className="font-black text-slate-100 text-5xl leading-none select-none">{item.step}</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
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
                  { v: "500+",  l: "Faol talaba",    bg: "bg-blue-50", text: "text-blue-600" },
                  { v: "12+",   l: "Kurslar",          bg: "bg-blue-50",   text: "text-blue-500" },
                  { v: "1200+", l: "Baholashlar",      bg: "bg-violet-50", text: "text-violet-500" },
                  { v: "+34%",  l: "O'rtacha o'sish",  bg: "bg-emerald-50",text: "text-emerald-500" },
                ].map((s) => (
                  <div key={s.l} className={`card-hover ${s.bg} rounded-3xl p-8`}>
                    <p className={`font-black text-4xl ${s.text} mb-1`}>{s.v}</p>
                    <p className="text-slate-600 text-sm">{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Text */}
              <div>
                <p className="text-blue-600 text-xs font-bold tracking-[0.22em] uppercase mb-5">
                  Nima uchun BrainUP?
                </p>
                <h2 className="font-black text-slate-900 text-4xl mb-5 leading-tight tracking-tight">
                  Har bir talaba —<br />alohida yo&apos;l
                </h2>
                <p className="text-slate-500 mb-8 leading-relaxed text-sm">
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
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-slate-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-8">
          <div className="bg-blue-600 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blue-500/25 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-blue-700/20 -translate-x-1/4 translate-y-1/4 pointer-events-none" />
            <div className="relative">
              <p className="text-white/50 text-xs font-bold tracking-widest uppercase mb-4">NamDPI · 2026</p>
              <h2 className="font-black text-white text-4xl sm:text-5xl mb-5 tracking-tight">
                Bugundan boshlang
              </h2>
              <p className="text-white/65 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                NamDPI pilotiga qo&apos;shiling. Ro&apos;yxatdan o&apos;tish bepul —
                bir daqiqada tayyor.
              </p>
              <Link href="/register" className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full font-extrabold text-sm tracking-wider hover:bg-slate-700 transition-colors">
                <span>RO&apos;YXATDAN O&apos;TISH</span>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }} className="py-10">
          <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <BrainUPLogo size="sm" />
              <span className="font-bold text-slate-900">BrainUP</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/login" className="hover:text-slate-900 transition-colors">Kirish</Link>
              <Link href="/register" className="hover:text-slate-900 transition-colors">Ro&apos;yxat</Link>
              <Link href="#how" className="hover:text-slate-900 transition-colors">Jarayon</Link>
            </div>
            <p className="text-slate-400 text-sm">© 2026 BrainUP · NamDPI</p>
          </div>
        </footer>

      </div>
    </>
  );
}
