"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldOff, ShieldCheck } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ActionToast, useToast } from "@/components/admin/action-toast";

export function UserToggle({
  userId,
  isActive,
  name,
}: {
  userId: string;
  isActive: boolean;
  name: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast, show, dismiss } = useToast();

  async function handleConfirm() {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setLoading(false);
    setOpen(false);
    if (res.ok) {
      show(isActive ? `${name} bloklandi` : `${name} faollashtirildi`, "success");
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
          ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
          : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
        }
        onClick={() => setOpen(true)}
        title={isActive ? "Bloklash" : "Faollashtirish"}
      >
        {isActive ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={isActive ? "Foydalanuvchini bloklash" : "Foydalanuvchini faollashtirish"}
        description={isActive
          ? `${name} tizimga kira olmaydi. Istalgan vaqt qayta faollashtirish mumkin.`
          : `${name} tizimga kirish huquqini tiklaysiz.`
        }
        confirmLabel={isActive ? "Bloklash" : "Faollashtirish"}
        variant={isActive ? "destructive" : "default"}
        loading={loading}
        onConfirm={handleConfirm}
      />

      {toast && <ActionToast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
