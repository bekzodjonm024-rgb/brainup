"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Lock } from "lucide-react";

export function AdminProfileSettings({ email }: { email: string }) {
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  async function handlePwSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (pwForm.next !== pwForm.confirm) {
      setPwError("Yangi parollar mos kelmadi");
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    setPwLoading(true);
    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
    });
    setPwLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setPwError(data.error ?? "Xatolik yuz berdi");
      return;
    }
    setPwSaved(true);
    setPwForm({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 3000);
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-400" />
            Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">{email}</p>
          <p className="text-xs text-slate-400 mt-1">Email manzilni o'zgartirish uchun texnik qo'llab-quvvatlashga murojaat qiling.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-400" />
            Parolni o'zgartirish
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePwSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Joriy parol</Label>
              <Input
                type="password"
                value={pwForm.current}
                onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Yangi parol</Label>
              <Input
                type="password"
                value={pwForm.next}
                onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Yangi parolni tasdiqlang</Label>
              <Input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                required
              />
            </div>
            {pwError && <p className="text-xs text-red-500">{pwError}</p>}
            <Button type="submit" size="sm" disabled={pwLoading}>
              {pwLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : pwSaved ? (
                <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-500" />
              ) : null}
              {pwSaved ? "Saqlandi" : "Saqlash"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
