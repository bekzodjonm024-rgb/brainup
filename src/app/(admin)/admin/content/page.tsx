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

const TYPE_LABELS: Record<string, string> = {
  PDF: "PDF", WORD: "Word", PPT: "PPT", TEXT: "Matn",
  VIDEO: "Video", ARTICLE: "Maqola", BOOK: "Kitob", LINK: "Havola",
};

export default async function AdminContentPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const [pending, approved, rejected] = await Promise.all([
    db.contentItem.count({ where: { status: "PENDING_REVIEW" } }),
    db.contentItem.count({ where: { status: "APPROVED" } }),
    db.contentItem.count({ where: { status: "REJECTED" } }),
  ]);

  const items = await db.contentItem.findMany({
    where: { status: "PENDING_REVIEW" },
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
  });

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Kontent" description="Tasdiqlash kutayotgan materiallar" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-amber-600 font-medium">{pending} kutmoqda</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-600">{approved} tasdiqlangan</span>
          <span className="text-slate-300">|</span>
          <span className="text-red-500">{rejected} rad etilgan</span>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Kontent</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Mavzu / Kurs</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Professor</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Sana</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
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
                      <td className="px-4 py-3">
                        <ContentActions contentId={item.id} status={item.status} title={item.title} />
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Tasdiqlash kutayotgan kontent yo'q
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
