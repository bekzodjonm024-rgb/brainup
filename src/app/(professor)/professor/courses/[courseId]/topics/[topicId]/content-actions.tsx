"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContentStatus } from "@/generated/prisma";
import { CheckCircle2, XCircle, Trash2, Loader2 } from "lucide-react";

interface ContentActionsProps {
  contentId: string;
  status: ContentStatus;
  courseId: string;
  topicId: string;
}

export function ContentActions({ contentId, status, courseId, topicId }: ContentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function action(type: "approve" | "reject" | "delete") {
    setLoading(type);

    if (type === "delete") {
      await fetch(`/api/content/${contentId}`, { method: "DELETE" });
    } else {
      await fetch(`/api/content/${contentId}/${type}`, { method: "POST" });
    }

    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      {status !== "APPROVED" && (
        <Button
          variant="ghost"
          size="icon"
          title="Tasdiqlash"
          onClick={() => action("approve")}
          disabled={loading !== null}
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        >
          {loading === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        </Button>
      )}
      {status === "APPROVED" && (
        <Button
          variant="ghost"
          size="icon"
          title="Rad etish"
          onClick={() => action("reject")}
          disabled={loading !== null}
          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
        >
          {loading === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        title="O'chirish"
        onClick={() => action("delete")}
        disabled={loading !== null}
        className="text-red-500 hover:text-red-600 hover:bg-red-50"
      >
        {loading === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
