import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kontent" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ContentActions } from "./content-actions";
import { ContentFilter } from "./content-filter";
import { Suspense } from "react";

const TYPE_LABELS: Record<string, string> = {
  PDF: "PDF", WORD: "Word", PPT: "PPT", TEXT: "Matn",
  VIDEO: "Video", ARTICLE: "Maqola", BOOK: "Kitob", LINK: "Havola",
};

const VALID_STATUSES = ["PENDING_REVIEW", "APPROVED", "REJECTED", "DRAFT"] as const;
type Status = typeof VALID_STATUSES[number];

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const { status: rawStatus } = await searchParams;
  const activeStatus: Status = VALID_STATUSES.includes(rawStatus as Status)
    ? (rawStatus as Status)
    : "PENDING_REVIEW";

  const [byStatus, items] = await Promise.all([
    db.contentItem.groupBy({ by: ["status"], _count: { id: true } }),
    db.contentItem.findMany({
      where: { status: activeStatus },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        createdAt: true,
        topic: {
          select: {
            title: true,
            course: {
              select: {
                title: true,
                professor: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const counts = Object.fromEntries(byStatus.map((r) => [r.status, r._count.id]));

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Kontent" description="Materiallar boshqaruvi" />
      <main className="flex-1 p-6 space-y-4">
        <Suspense>
          <ContentFilter counts={counts} active={activeStatus} />
        </Suspense>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kontent</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Mavzu / Kurs</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Professor</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Sana</th>
                    {activeStatus === "PENDING_REVIEW" && <th className="px-4 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{item.title}</p>
                          <Badge variant="secondary" className="text-xs mt-0.5">
                            {TYPE_LABELS[item.type] ?? item.type}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div>
                          <p className="text-slate-700 text-xs font-medium">{item.topic.title}</p>
                          <p className="text-xs text-slate-400">{item.topic.course.title}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell text-xs">
                        {item.topic.course.professor.firstName} {item.topic.course.professor.lastName}
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell text-xs">
                        {formatDate(item.createdAt)}
                      </td>
                      {activeStatus === "PENDING_REVIEW" && (
                        <td className="px-4 py-3">
                          <ContentActions contentId={item.id} status={item.status} title={item.title} />
                        </td>
                      )}
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                        Bu bo'limda kontent yo'q
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
