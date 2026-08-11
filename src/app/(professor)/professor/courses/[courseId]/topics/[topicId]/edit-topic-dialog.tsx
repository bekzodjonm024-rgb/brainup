"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2, X } from "lucide-react";

interface Props {
  topicId: string;
  currentTitle: string;
  currentObjective: string | null;
}

export function EditTopicDialog({ topicId, currentTitle, currentObjective }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(currentTitle);
  const [objective, setObjective] = useState(currentObjective ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/topics/${topicId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        learningObjective: objective.trim() || null,
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
          <h2 className="font-semibold text-slate-900">Mavzuni tahrirlash</h2>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="et-title">Mavzu nomi <span className="text-red-500">*</span></Label>
            <Input
              id="et-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mavzu nomi"
              required
              autoFocus
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="et-obj">O'quv maqsadi</Label>
            <Input
              id="et-obj"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Dars oxirida talaba... qila oladi"
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
