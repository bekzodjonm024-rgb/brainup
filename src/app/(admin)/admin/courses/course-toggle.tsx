"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EyeOff, Eye } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ActionToast, useToast } from "@/components/admin/action-toast";

export function CourseToggle({
  courseId,
  isActive,
  title,
}: {
  courseId: string;
  isActive: boolean;
  title: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast, show, dismiss } = useToast();

  async function handleConfirm() {
    setLoading(true);
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setLoading(false);
    setOpen(false);
    if (res.ok) {
      show(isActive ? `Kurs o'chirildi` : "Kurs faollashtirildi", "success");
      router.refresh();
    } else {
      show("Xatolik yuz berdi", "error");
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={isActive
          ? "text-stone-400 hover:text-red-600 hover:bg-red-50"
          : "text-stone-400 hover:text-emerald-600 hover:bg-emerald-50"
        }
        onClick={() => setOpen(true)}
        title={isActive ? "O'chirish" : "Faollashtirish"}
      >
        {isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={isActive ? "Kursni o'chirish" : "Kursni faollashtirish"}
        description={isActive
          ? `"${title}" kursi talabalar uchun ko'rinmay qoladi.`
          : `"${title}" kursi talabalar uchun ko'rinadigan bo'ladi.`
        }
        confirmLabel={isActive ? "O'chirish" : "Faollashtirish"}
        variant={isActive ? "destructive" : "default"}
        loading={loading}
        onConfirm={handleConfirm}
      />

      {toast && <ActionToast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
