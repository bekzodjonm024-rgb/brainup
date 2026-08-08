"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTopicPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({
    title: "",
    description: "",
    learningObjective: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const res = await fetch(`/api/courses/${courseId}/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrors(data.error ?? {});
      return;
    }

    router.push(`/professor/courses/${courseId}/topics/${data.id}`);
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Yangi mavzu qo'shish" />
      <main className="flex-1 p-6 max-w-2xl">
        <Link href={`/professor/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Kursga qaytish
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Mavzu ma'lumotlari</CardTitle>
            <CardDescription>
              Mavzu yaratilgach material va savollar qo'shishingiz mumkin
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Mavzu nomi <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Pedagogik mahorat tushunchasi"
                  required
                />
                {errors.title && <p className="text-xs text-red-600">{errors.title[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningObjective">O'quv maqsadi</Label>
                <Input
                  id="learningObjective"
                  value={form.learningObjective}
                  onChange={(e) => update("learningObjective", e.target.value)}
                  placeholder="Dars oxirida talaba... qila oladi"
                />
                <p className="text-xs text-slate-500">Misol: "Pedagogik mahorat tushunchasini ta'riflay oladi"</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Tavsif</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Mavzu haqida qo'shimcha ma'lumot..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Mavzu yaratish
                </Button>
                <Link href={`/professor/courses/${courseId}`}>
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
