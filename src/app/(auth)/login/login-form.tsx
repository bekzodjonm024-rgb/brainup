"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const inputCls = "w-full h-11 px-4 rounded-xl bg-white border text-slate-900 text-sm outline-none transition-colors focus:border-blue-500 placeholder:text-slate-400 shadow-sm";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email yoki parol noto'g'ri");
      return;
    }

    const session = await getSession();
    const role = (session?.user as { role?: string } | undefined)?.role;
    const defaultUrl =
      role === "ADMIN" ? "/admin" : role === "PROFESSOR" ? "/professor/dashboard" : "/dashboard";

    router.push(callbackUrl ?? defaultUrl);
    router.refresh();
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-900 mb-1">Xush kelibsiz</h2>
      <p className="text-slate-400 text-sm mb-8">Hisobingizga kiring</p>

      {registered && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Ro&apos;yxatdan o&apos;tish muvaffaqiyatli! Endi kiring.
        </div>
      )}
      {error && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            autoComplete="email"
            className={inputCls}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-600">Parol</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={`${inputCls} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-600/20 gap-2 mt-1"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Kirish
        </Button>
      </form>

      <div className="mt-6 pt-6 text-center text-sm text-slate-400" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
        Hisobingiz yo&apos;qmi?{" "}
        <Link href="/register" className="text-blue-600 font-medium hover:text-blue-400 transition-colors">
          Ro&apos;yxatdan o&apos;ting
        </Link>
      </div>
    </div>
  );
}
