"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound, Copy, Check } from "lucide-react";

export function PasswordReset({ userId, name }: { userId: string; name: string }) {
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleReset() {
    if (!confirm(`${name}ning parolini reset qilasizmi? Yangi vaqtinchalik parol beriladi.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/reset-password`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (data.tempPassword) setTempPassword(data.tempPassword);
  }

  async function handleCopy() {
    if (!tempPassword) return;
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (tempPassword) {
    return (
      <div className="flex items-center gap-1.5">
        <code className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono">
          {tempPassword}
        </code>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} title="Nusxa olish">
          {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-400" />}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-slate-400 hover:text-amber-600"
      onClick={handleReset}
      disabled={loading}
      title="Parolni reset qilish"
    >
      <KeyRound className="h-4 w-4" />
    </Button>
  );
}
