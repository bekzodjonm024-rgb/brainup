"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ActionToast, useToast } from "@/components/admin/action-toast";

export function ContentActions({
  contentId,
  status,
  title,
}: {
  contentId: string;
  status: string;
  title: string;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, show, dismiss } = useToast();

  async function handleConfirm() {
    if (!dialog) return;
    setLoading(true);
    const res = await fetch(`/api/content/${contentId}/${dialog}`, { method: "POST" });
    setLoading(false);
    setDialog(null);
    if (res.ok) {
      show(dialog === "approve" ? "Kontent tasdiqlandi" : "Kontent rad etildi",
        dialog === "approve" ? "success" : "error");
      router.refresh();
    } else {
      show("Xatolik yuz berdi", "error");
    }
  }

  if (status !== "PENDING_REVIEW") return null;

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
          onClick={() => setDialog("approve")}
          title="Tasdiqlash"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
          onClick={() => setDialog("reject")}
          title="Rad etish"
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>

      <ConfirmDialog
        open={dialog === "approve"}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Kontentni tasdiqlash"
        description={`"${title}" materialini tasdiqlaysiz. Talabalar ko'ra oladi.`}
        confirmLabel="Tasdiqlash"
        variant="default"
        loading={loading}
        onConfirm={handleConfirm}
      />

      <ConfirmDialog
        open={dialog === "reject"}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Kontentni rad etish"
        description={`"${title}" materialini rad etasiz. Professor qayta tahrirlashi kerak bo'ladi.`}
        confirmLabel="Rad etish"
        variant="destructive"
        loading={loading}
        onConfirm={handleConfirm}
      />

      {toast && <ActionToast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
