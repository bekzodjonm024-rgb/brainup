"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Trash2, RotateCcw, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ActionToast, useToast } from "@/components/admin/action-toast";

export function AddStudentDialog({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast, show, dismiss } = useToast();

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
      show("Talaba kursga qo'shildi", "success");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Xatolik yuz berdi");
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-1" /> Talaba qo'shish
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
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
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Bekor</Button>
              <Button size="sm" onClick={handleAdd} disabled={loading || !email.trim()}>
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                Qo'shish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {toast && <ActionToast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}

export function ResetAssessmentButton({
  courseId, studentId, name,
}: {
  courseId: string; studentId: string; name: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast, show, dismiss } = useToast();

  async function handleConfirm() {
    setLoading(true);
    const res = await fetch(
      `/api/courses/${courseId}/students/${studentId}/reset-assessment`,
      { method: "DELETE" }
    );
    setLoading(false);
    setOpen(false);
    if (res.ok) {
      show(`${name}ning baholash natijasi o'chirildi`, "success");
      router.refresh();
    } else {
      show("Xatolik yuz berdi", "error");
    }
  }

  return (
    <>
      <Button
        variant="ghost" size="icon"
        className="text-stone-400 hover:text-amber-600 hover:bg-amber-50"
        onClick={() => setOpen(true)}
        title="Baholash natijasini o'chirish"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Baholash natijasini o'chirish"
        description={`${name}ning kognitiv profili o'chiriladi. Talaba assessment'ni qayta topshirishi kerak bo'ladi.`}
        confirmLabel="O'chirish"
        variant="destructive"
        loading={loading}
        onConfirm={handleConfirm}
      />
      {toast && <ActionToast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}

export function RemoveStudentButton({
  courseId, studentId, name,
}: {
  courseId: string; studentId: string; name: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast, show, dismiss } = useToast();

  async function handleConfirm() {
    setLoading(true);
    const res = await fetch(`/api/courses/${courseId}/students/${studentId}`, { method: "DELETE" });
    setLoading(false);
    setOpen(false);
    if (res.ok) {
      show(`${name} kursdan chiqarildi`, "success");
      router.refresh();
    } else {
      show("Xatolik yuz berdi", "error");
    }
  }

  return (
    <>
      <Button
        variant="ghost" size="icon"
        className="text-stone-400 hover:text-red-600 hover:bg-red-50"
        onClick={() => setOpen(true)}
        title="Kursdan chiqarish"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Talabani kursdan chiqarish"
        description={`${name} bu kursdan chiqariladi. Barcha progress saqlanib qoladi.`}
        confirmLabel="Chiqarish"
        variant="destructive"
        loading={loading}
        onConfirm={handleConfirm}
      />
      {toast && <ActionToast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
