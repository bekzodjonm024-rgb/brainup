"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Faculty {
  id: string;
  name: string;
}

interface University {
  id: string;
  name: string;
  faculties: Faculty[];
}

export default function RegisterPage() {
  const router = useRouter();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    universityId: "",
    facultyId: "",
    yearLevel: "1",
    groupName: "",
  });

  useEffect(() => {
    fetch("/api/universities").then((r) => r.json()).then(setUniversities);
  }, []);

  const selectedUniversity = universities.find((u) => u.id === form.universityId);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "universityId") setForm((prev) => ({ ...prev, universityId: value, facultyId: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, yearLevel: parseInt(form.yearLevel) }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (typeof data.error === "object" && data.error !== null) {
        setErrors(data.error);
      } else {
        setErrors({ _form: [data.error ?? "Xatolik yuz berdi. Qayta urinib ko'ring."] });
      }
      return;
    }

    router.push("/login?registered=1");
  }

  function fieldError(field: string) {
    return errors[field]?.[0];
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">BrainUP</span>
          </div>
          <p className="text-sm text-slate-500">Adaptiv o'qish platformasi</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ro'yxatdan o'tish</CardTitle>
            <CardDescription>Talaba sifatida hisob yarating</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errors._form?.[0] && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {errors._form[0]}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ism</Label>
                  <Input id="firstName" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required placeholder="Sardor" />
                  {fieldError("firstName") && <p className="text-xs text-red-600">{fieldError("firstName")}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Familiya</Label>
                  <Input id="lastName" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required placeholder="Rahimov" />
                  {fieldError("lastName") && <p className="text-xs text-red-600">{fieldError("lastName")}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required placeholder="example@email.com" />
                {fieldError("email") && <p className="text-xs text-red-600">{fieldError("email")}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Parol</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required placeholder="Kamida 6 ta belgi" />
                {fieldError("password") && <p className="text-xs text-red-600">{fieldError("password")}</p>}
              </div>

              <div className="space-y-2">
                <Label>Universitet</Label>
                <Select value={form.universityId} onValueChange={(v) => update("universityId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Universitetni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError("universityId") && <p className="text-xs text-red-600">{fieldError("universityId")}</p>}
              </div>

              {selectedUniversity && (
                <div className="space-y-2">
                  <Label>Fakultet</Label>
                  <Select value={form.facultyId} onValueChange={(v) => update("facultyId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Fakultetni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedUniversity.faculties.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError("facultyId") && <p className="text-xs text-red-600">{fieldError("facultyId")}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kurs</Label>
                  <Select value={form.yearLevel} onValueChange={(v) => update("yearLevel", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}-kurs</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groupName">Guruh</Label>
                  <Input id="groupName" value={form.groupName} onChange={(e) => update("groupName", e.target.value)} placeholder="M-11" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Ro'yxatdan o'tish
              </Button>
              <p className="text-center text-sm text-slate-500">
                Hisobingiz bormi?{" "}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Kirish
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
