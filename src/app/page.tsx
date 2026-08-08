import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Brain, TrendingUp, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const session = await auth();

  if (session) {
    if (session.user.role === "PROFESSOR") redirect("/professor/dashboard");
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-slate-900 text-lg">BrainUP</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Kirish</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Boshlash</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm text-blue-700 mb-6">
          <Brain className="h-4 w-4" />
          Adaptiv ta&apos;lim texnologiyasi
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-6">
          Ko&apos;proq emas,{" "}
          <span className="text-blue-600">to&apos;g&apos;riroq o&apos;qing</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          BrainUP sizning bilim darajangiz, xatolaringiz va o&apos;rganish tempingizga asoslanib
          shaxsiy ta&apos;lim yo&apos;nalishi yaratadi.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Bepul boshlash <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">Hisobga kirish</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Qanday ishlaydi?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain className="h-6 w-6 text-blue-600" />,
                title: "Boshlang'ich baholash",
                desc: "10–15 daqiqa. Diqqat, xotira, qayta ishlash tezligi — shaxsiy profil yaratiladi.",
              },
              {
                icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
                title: "Adaptiv yo'nalish",
                desc: "Har bir mashqdan keyin tizim keyingi eng foydali qadamni aniqlaydi.",
              },
              {
                icon: <RefreshCw className="h-6 w-6 text-amber-600" />,
                title: "Retention monitoring",
                desc: "Bilimni eslab qolishni kuzatadi. Unutishdan oldin takrorlashni eslatadi.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Namangan DPI bilan hamkorlikda</h2>
        <p className="text-slate-600 mb-6 max-w-xl mx-auto">
          Pedagogik mahorat, Neyropedagogika va Umumiy pedagogika fanlarida pilot dastur.
        </p>
        <Link href="/register">
          <Button size="lg">Ro&apos;yxatdan o&apos;tish</Button>
        </Link>
      </section>

      <footer className="border-t border-slate-100 py-6 text-center text-sm text-slate-400">
        &copy; 2025 BrainUP — Barcha huquqlar himoyalangan
      </footer>
    </div>
  );
}
