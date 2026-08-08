import { Badge } from "@/components/ui/badge";
import { ContentStatus } from "@/generated/prisma";

interface ContentStatusBadgeProps {
  status: ContentStatus;
}

const statusConfig: Record<ContentStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  DRAFT: { label: "Qoralama", variant: "secondary" },
  PENDING_REVIEW: { label: "Tekshiruv kutilmoqda", variant: "warning" },
  APPROVED: { label: "Tasdiqlangan", variant: "success" },
  REJECTED: { label: "Rad etilgan", variant: "destructive" },
};

export function ContentStatusBadge({ status }: ContentStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
