import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Brain, TrendingUp, RefreshCw, ArrowRight, CheckCircle2, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const session = await auth();

  if (session) {
    if (session.user.role === "ADMIN") redirect("/admin");
    if (session.user.role === "PROFESSOR") redirect("/professor/dashboard");
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/brainup-logo.png" alt="BrainUP" width={36} height={36} className="h-9 w-9 object-contain" unoptimized />
            <span className="font-bold text-slate-900 text-lg tracking-tight">BrainUP</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-600">Kirish</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm">Boshlash</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 mb-8">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <Image
                src="/namdpi-logo.jpg"
                alt="NamDPI"
                width={26}
                height={26}
                className="rounded-full"
                unoptimized
              />
            </div>
            NamDPI bilan hamkorlikda
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Ko&apos;proq emas,{" "}
            <span className="text-blue-400">to&apos;g&apos;riroq o&apos;qing</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            BrainUP sizning bilim darajangiz, xatolaringiz va o&apos;rganish tempingizga
            asoslanib shaxsiy ta&apos;lim yo&apos;nalishi yaratadi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/register">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-400 text-white gap-2 h-12 px-8 text-base shadow-lg shadow-blue-500/25">
                Bepul boshlash <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white h-12 px-8 text-base">
                Hisobga kirish
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-center">
            {[
              { value: "500+", label: "Faol talaba" },
              { value: "3", label: "Universitet" },
              { value: "98%", label: "Qoniqish darajasi" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Qanday ishlaydi?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Uch bosqichda — baholash, moslashish, mustahkamlash.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain className="h-6 w-6 text-violet-600" />,
                accent: "border-violet-500",
                bg: "bg-violet-50",
                step: "01",
                title: "Boshlang'ich baholash",
                desc: "10–15 daqiqa. Diqqat, xotira, qayta ishlash tezligi — shaxsiy kognitiv profil yaratiladi.",
              },
              {
                icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
                accent: "border-blue-500",
                bg: "bg-blue-50",
                step: "02",
                title: "Adaptiv yo'nalish",
                desc: "Har bir mashqdan keyin tizim keyingi eng foydali qadamni avtomatik aniqlaydi.",
              },
              {
                icon: <RefreshCw className="h-6 w-6 text-emerald-600" />,
                accent: "border-emerald-500",
                bg: "bg-emerald-50",
                step: "03",
                title: "Retention monitoring",
                desc: "Bilimni eslab qolishni kuzatadi. Spaced repetition: 3→7→14→30 kun.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`bg-white rounded-xl border-t-2 ${f.accent} border border-slate-200 p-6 space-y-4 shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center`}>
                    {f.icon}
                  </div>
                  <span className="text-3xl font-black text-slate-100">{f.step}</span>
                </div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Nima uchun BrainUP?
              </h2>
              <p className="text-slate-500 mb-8">
                An&apos;anaviy o&apos;qitish usullari barcha talabalarga bir xil materiallarni beradi.
                BrainUP esa har bir talaba uchun individual yo&apos;l quradi.
              </p>
              <div className="space-y-4">
                {[
                  "Kognitiv profil asosida shaxsiy dars rejasi",
                  "Xatolar tahlili va zaif joylarni aniqlash",
                  "O'qituvchilar uchun real vaqt statistikasi",
                  "Ilmiy asoslangan spaced repetition algoritmi",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Users className="h-6 w-6 text-blue-600" />, bg: "bg-blue-50", label: "Talabalar", value: "500+" },
                { icon: <BookOpen className="h-6 w-6 text-emerald-600" />, bg: "bg-emerald-50", label: "Kurslar", value: "12+" },
                { icon: <Brain className="h-6 w-6 text-violet-600" />, bg: "bg-violet-50", label: "Baholashlar", value: "1 200+" },
                { icon: <TrendingUp className="h-6 w-6 text-amber-600" />, bg: "bg-amber-50", label: "O'rtacha o'sish", value: "+34%" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                    {s.icon}
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-sm text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl ring-4 ring-white/20">
              <Image
                src="/namdpi-logo.jpg"
                alt="NamDPI"
                width={72}
                height={72}
                className="rounded-full"
                unoptimized
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Bugundan boshlang
          </h2>
          <p className="text-blue-100 mb-8">
            NamDPI pilotiga qo&apos;shiling. Ro&apos;yxatdan o&apos;tish bepul.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 h-12 px-10 text-base font-semibold shadow-lg">
              Ro&apos;yxatdan o&apos;tish
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Image src="/brainup-logo.png" alt="BrainUP" width={28} height={28} className="h-7 w-7 object-contain" unoptimized />
              <span className="font-semibold text-slate-600">BrainUP</span>
            </div>

            {/* Partner */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <Image
                src="/namdpi-logo.jpg"
                alt="NamDPI"
                width={44}
                height={44}
                className="rounded-full object-cover"
                unoptimized
              />
              <div>
                <p className="text-xs font-semibold text-slate-700">NamDPI</p>
                <p className="text-[11px] text-slate-400">Namangan Davlat Pedagogika Instituti</p>
              </div>
            </div>

            <span className="text-sm text-slate-400">&copy; 2026 BrainUP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
