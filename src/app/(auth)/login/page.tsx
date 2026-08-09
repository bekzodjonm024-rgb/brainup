import { Suspense } from "react";
import { LoginForm } from "./login-form";
import Image from "next/image";
import { Brain, TrendingUp, RefreshCw } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/brainup-logo-transparent.png" alt="BrainUP" width={80} height={80} className="h-20 w-20 object-contain" unoptimized />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">BrainUP</h1>
          <p className="text-blue-300 text-sm">Adaptiv o&apos;qish platformasi</p>
        </div>

        <Suspense fallback={<div className="h-64 rounded-2xl bg-white/10 animate-pulse" />}>
          <LoginForm />
        </Suspense>

        {/* Partner badge */}
        <div className="mt-8 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-md">
            <Image
              src="/namdpi-logo.jpg"
              alt="NamDPI"
              width={38}
              height={38}
              className="rounded-full"
              unoptimized
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-300">NamDPI hamkorligida</p>
            <p className="text-[11px] text-slate-500">Namangan Davlat Pedagogika Instituti</p>
          </div>
        </div>
      </div>
    </div>
  );
}
