import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { GraduationCap, Brain, TrendingUp, RefreshCw } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">BrainUP</span>
          </div>
          <p className="text-blue-300 text-sm">Adaptiv o&apos;qish platformasi</p>
        </div>

        <Suspense fallback={<div className="h-64 rounded-2xl bg-white/10 animate-pulse" />}>
          <LoginForm />
        </Suspense>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: <Brain className="h-4 w-4" />, label: "Kognitiv profil" },
            { icon: <TrendingUp className="h-4 w-4" />, label: "Adaptiv darslar" },
            { icon: <RefreshCw className="h-4 w-4" />, label: "Spaced repetition" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1.5 text-slate-400">
              {f.icon}
              <span className="text-xs">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
