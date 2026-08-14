"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound, Copy, Check } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ActionToast, useToast } from "@/components/admin/action-toast";

export function PasswordReset({ userId, name }: { userId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast, show, dismiss } = useToast();

  async function handleConfirm() {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/reset-password`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    setOpen(false);
    if (data.tempPassword) {
      setTempPassword(data.tempPassword);
    } else {
      show("Xatolik yuz berdi", "error");
    }
  }

  async function handleCopy() {
    if (!tempPassword) return;
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (tempPassword) {
    return (
      <div className="flex items-center gap-1.5">
        <code className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono">
          {tempPassword}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-stone-400 hover:text-amber-600"
          onClick={handleCopy}
          title="Nusxa olish"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
        </Button>
        {toast && <ActionToast message={toast.message} type={toast.type} onDismiss={dismiss} />}
      </div>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-stone-400 hover:text-amber-600 hover:bg-amber-50"
        onClick={() => setOpen(true)}
        title="Parolni reset qilish"
      >
        <KeyRound className="h-4 w-4" />
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Parolni reset qilish"
        description={`${name}ning parolini vaqtinchalik parolga almashtirasiz. Yangi parolni foydalanuvchiga yetkazishni unutmang.`}
        confirmLabel="Reset qilish"
        variant="default"
        loading={loading}
        onConfirm={handleConfirm}
      />

      {toast && <ActionToast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </>
  );
}
