"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Trash2, RotateCcw } from "lucide-react";

export function AddStudentDialog({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/courses/${courseId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setEmail("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Xatolik yuz berdi");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-1" /> Talaba qo'shish
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Talaba qo'shish</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="email">Talaba emaili</Label>
            <Input
              id="email"
              type="email"
              placeholder="talaba@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button>
            <Button onClick={handleAdd} disabled={loading || !email.trim()}>
              {loading ? "Qo'shilmoqda..." : "Qo'shish"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ResetAssessmentButton({
  courseId,
  studentId,
  name,
}: {
  courseId: string;
  studentId: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!confirm(`${name}ning kognitiv profilini o'chirasizmi? Talaba assessment'ni qayta topshirishi kerak bo'ladi.`)) return;
    setLoading(true);
    await fetch(`/api/courses/${courseId}/students/${studentId}/reset-assessment`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-slate-400 hover:text-amber-600"
      onClick={handleReset}
      disabled={loading}
      title="Assessment natijasini o'chirish"
    >
      <RotateCcw className="h-4 w-4" />
    </Button>
  );
}

export function RemoveStudentButton({
  courseId,
  studentId,
  name,
}: {
  courseId: string;
  studentId: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (!confirm(`${name}ni kursdan chiqarasizmi?`)) return;
    setLoading(true);
    await fetch(`/api/courses/${courseId}/students/${studentId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-slate-400 hover:text-red-600"
      onClick={handleRemove}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
