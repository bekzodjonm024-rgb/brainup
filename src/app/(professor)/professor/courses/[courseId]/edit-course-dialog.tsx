"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Loader2, X } from "lucide-react";

interface Props {
  courseId: string;
  currentTitle: string;
  currentDescription: string | null;
  currentSemester: string | null;
}

export function EditCourseDialog({ courseId, currentTitle, currentDescription, currentSemester }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription ?? "");
  const [semester, setSemester] = useState(currentSemester ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/courses/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || undefined,
        semester: semester.trim() || undefined,
      }),
    });

    setLoading(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error?.title?.[0] ?? "Xatolik yuz berdi");
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4 mr-1" /> Tahrirlash
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Kursni tahrirlash</h2>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ec-title">Kurs nomi <span className="text-red-500">*</span></Label>
            <Input
              id="ec-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pedagogik mahorat"
              required
              autoFocus
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ec-semester">Semester</Label>
            <Input
              id="ec-semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="2024-2025/1"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ec-desc">Tavsif</Label>
            <Textarea
              id="ec-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurs haqida qisqacha ma'lumot..."
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Saqlash
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
