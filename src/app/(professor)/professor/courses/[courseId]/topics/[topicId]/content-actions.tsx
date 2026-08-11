"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContentStatus } from "@/generated/prisma";
import { CheckCircle2, XCircle, Trash2, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ActionToast, useToast } from "@/components/admin/action-toast";

interface ContentActionsProps {
  contentId: string;
  status: ContentStatus;
  title: string;
  courseId: string;
  topicId: string;
}

export function ContentActions({ contentId, status, title, courseId, topicId }: ContentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { toast, show, dismiss } = useToast();

  async function handleAction(type: "approve" | "reject") {
    setLoading(type);
    const res = await fetch(`/api/content/${contentId}/${type}`, { method: "POST" });
    setLoading(null);
    if (res.ok) {
      show(type === "approve" ? "Kontent tasdiqlandi" : "Kontent rad etildi",
        type === "approve" ? "success" : "error");
      router.refresh();
    } else {
      show("Xatolik yuz berdi", "error");
    }
  }

  async function handleDelete() {
    setLoading("delete");
    const res = await fetch(`/api/content/${contentId}`, { method: "DELETE" });
    setLoading(null);
    setDeleteOpen(false);
    if (res.ok) {
      show("Kontent o'chirildi", "success");
      router.refresh();
    } else {
      show("Xatolik yuz berdi", "error");
    }
  }

  return (
    <>
      <div className="flex items-center gap-1 shrink-0">
        {status !== "APPROVED" && (
          <Button
            variant="ghost" size="icon"
            title="Tasdiqlash"
            onClick={() => handleAction("approve")}
            disabled={loading !== null}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            {loading === "approve"
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <CheckCircle2 className="h-4 w-4" />}
          </Button>
        )}
        {status === "APPROVED" && (
          <Button
            variant="ghost" size="icon"
            title="Rad etish"
            onClick={() => handleAction("reject")}
            disabled={loading !== null}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          >
            {loading === "reject"
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <XCircle className="h-4 w-4" />}
          </Button>
        )}
        <Button
          variant="ghost" size="icon"
          title="O'chirish"
          onClick={() => setDeleteOpen(true)}
          disabled={loading !== null}
          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
        >
          {loading === "delete"
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Kontentni o'chirish"
        description={`"${title}" materialini o'chirasiz. Bu amalni qaytarib bo'lmaydi.`}
        confirmLabel="O'chirish"
        variant="destructive"
        loading={loading === "delete"}
        onConfirm={handleDelete}
      />

      {toast && <ActionToast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
