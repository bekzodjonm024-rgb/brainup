"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

export function AddProfessorForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", title: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  function update(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: [] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const res = await fetch("/api/admin/professors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setForm({ firstName: "", lastName: "", email: "", password: "", title: "" });
      router.refresh();
    } else {
      setErrors(data.error ?? {});
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 flex items-center gap-3">
        <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
        <div>
          <p className="font-medium text-emerald-900">Professor muvaffaqiyatli qo'shildi</p>
          <button onClick={() => setSuccess(false)} className="text-sm text-emerald-700 underline mt-0.5">
            Yana qo'shish
          </button>
        </div>
      </div>
    );
  }

  function fieldError(f: string) { return errors[f]?.[0]; }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base">Yangi professor</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Ism</Label>
              <Input id="firstName" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
              {fieldError("firstName") && <p className="text-xs text-red-600">{fieldError("firstName")}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Familiya</Label>
              <Input id="lastName" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
              {fieldError("lastName") && <p className="text-xs text-red-600">{fieldError("lastName")}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Unvon (ixtiyoriy)</Label>
            <Input id="title" placeholder="Prof. Dr., PhD, ..." value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            {fieldError("email") && <p className="text-xs text-red-600">{fieldError("email")}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Parol</Label>
            <Input id="password" type="password" placeholder="Kamida 6 belgi" value={form.password} onChange={(e) => update("password", e.target.value)} required />
            {fieldError("password") && <p className="text-xs text-red-600">{fieldError("password")}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Professor qo'shish
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
