"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContentStatus } from "@/generated/prisma";
import { CheckCircle2, XCircle, Trash2, Loader2, UploadCloud } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ActionToast, useToast } from "@/components/admin/action-toast";

interface ContentActionsProps {
  contentId: string;
  status: ContentStatus;
  title: string;
  courseId: string;
  topicId: string;
  isFileType?: boolean;
}

export function ContentActions({ contentId, status, title, courseId, topicId, isFileType }: ContentActionsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    setLoading("upload");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error();
      const { url } = await uploadRes.json();

      const updateRes = await fetch(`/api/content/${contentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: url }),
      });
      if (!updateRes.ok) throw new Error();
      show("Fayl yuklandi", "success");
      router.refresh();
    } catch {
      show("Fayl yuklashda xato", "error");
    } finally {
      setLoading(null);
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
        {isFileType && (
          <>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
            <Button
              variant="ghost" size="icon"
              title="Fayl yuklash / almashtirish"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading !== null}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            >
              {loading === "upload"
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <UploadCloud className="h-4 w-4" />}
            </Button>
          </>
        )}
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
          className="text-stone-400 hover:text-red-600 hover:bg-red-50"
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
