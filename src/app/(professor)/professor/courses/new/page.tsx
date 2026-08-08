"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Faculty {
  id: string;
  name: string;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    semester: "",
    facultyId: "",
  });

  useEffect(() => {
    fetch("/api/universities")
      .then((r) => r.json())
      .then((data: { faculties: Faculty[] }[]) => {
        const allFaculties = data.flatMap((u) => u.faculties);
        setFaculties(allFaculties);
      });
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, facultyId: form.facultyId || undefined }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrors(data.error ?? {});
      return;
    }

    router.push(`/professor/courses/${data.id}`);
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Yangi kurs yaratish" />
      <main className="flex-1 p-6 max-w-2xl">
        <Link href="/professor/courses" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Orqaga
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Kurs ma'lumotlari</CardTitle>
            <CardDescription>
              Kurs yaratilgach mavzular va materiallar qo'shishingiz mumkin
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Kurs nomi <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Pedagogik mahorat"
                  required
                />
                {errors.title && <p className="text-xs text-red-600">{errors.title[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Tavsif</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Kurs haqida qisqacha ma'lumot..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    value={form.semester}
                    onChange={(e) => update("semester", e.target.value)}
                    placeholder="2024-2025/1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fakultet</Label>
                  <Select value={form.facultyId} onValueChange={(v) => update("facultyId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlash (ixtiyoriy)" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Kurs yaratish
                </Button>
                <Link href="/professor/courses">
                  <Button type="button" variant="outline">Bekor qilish</Button>
                </Link>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  );
}
