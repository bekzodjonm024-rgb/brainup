"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const inputCls =
  "w-full h-11 px-4 rounded-xl bg-white border border-stone-200 text-[#1C1208] text-sm outline-none transition-colors placeholder:text-stone-400 shadow-sm focus:border-[#B45309] focus:ring-0";

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
      <h2 className="text-2xl font-black mb-1" style={{ color: "#1C1208" }}>Xush kelibsiz</h2>
      <p className="text-stone-400 text-sm mb-8">Hisobingizga kiring</p>

      {registered && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Ro&apos;yxatdan o&apos;tish muvaffaqiyatli! Endi kiring.
        </div>
      )}
      {error && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: "#5C4A3A" }}>Email</label>
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
          <label className="block text-sm font-medium" style={{ color: "#5C4A3A" }}>Parol</label>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 text-white border-0 gap-2 mt-1"
          style={{
            background: "#B45309",
            boxShadow: "0 4px 14px rgba(180,83,9,0.28)",
          }}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Kirish
        </Button>
      </form>

      <div className="mt-6 pt-6 text-center text-sm text-stone-400" style={{ borderTop: "1px solid rgba(28,18,8,0.07)" }}>
        Hisobingiz yo&apos;qmi?{" "}
        <Link
          href="/register"
          className="font-medium transition-colors"
          style={{ color: "#B45309" }}
        >
          Ro&apos;yxatdan o&apos;ting
        </Link>
      </div>
    </div>
  );
}
