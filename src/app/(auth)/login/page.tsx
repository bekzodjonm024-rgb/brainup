import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">BrainUP</span>
          </div>
          <p className="text-sm text-slate-500">Adaptiv o&apos;qish platformasi</p>
        </div>
        <Suspense fallback={<div className="h-64 rounded-xl border border-slate-200 bg-white animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
