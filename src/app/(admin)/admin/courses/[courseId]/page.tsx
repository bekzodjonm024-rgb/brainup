import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kurs mavzulari" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { DeleteTopicButton } from "@/components/shared/delete-topic-button";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, Users, LayoutList, CheckCircle2, Circle, ChevronRight,
} from "lucide-react";

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      professor: { select: { firstName: true, lastName: true } },
      faculty: { select: { name: true } },
      topics: {
        orderBy: { orderIndex: "asc" },
        include: {
          contentItems: { select: { id: true, status: true } },
          _count: { select: { questions: true } },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();

  const totalContent = course.topics.reduce((s, t) => s + t.contentItems.length, 0);
  const approvedContent = course.topics.reduce(
    (s, t) => s + t.contentItems.filter((c) => c.status === "APPROVED").length, 0
  );

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#F8F5EF] dark:bg-[#100D09]">
      <Header
        title={course.title}
        description={`${course.professor.firstName} ${course.professor.lastName}${course.faculty ? ` · ${course.faculty.name}` : ""}`}
      />
      <main className="flex-1 p-6 space-y-6">
        <Link href="/admin/courses">
          <button className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-[#2a2720] px-3 py-1.5 rounded-lg transition-colors">
            <ArrowLeft className="h-4 w-4" /> Kurslar
          </button>
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <LayoutList className="h-5 w-5 text-[#B45309] dark:text-amber-400" />, label: "Mavzular", value: course.topics.length, iconBg: "bg-[#FEF4E7] dark:bg-amber-950/30" },
            { icon: <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, label: "Talabalar", value: course._count.enrollments, iconBg: "bg-emerald-50 dark:bg-emerald-950/50" },
            { icon: <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />, label: "Materiallar", value: totalContent, iconBg: "bg-violet-50 dark:bg-violet-950/50" },
            { icon: <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />, label: "Tasdiqlangan", value: approvedContent, iconBg: "bg-amber-50 dark:bg-amber-950/50" },
          ].map((s) => (
            <div key={s.label} className="stat-card rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#1C1710] p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>{s.icon}</div>
              <p className="text-2xl font-bold text-[#1C1208] dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-2 uppercase tracking-wide font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Topics */}
        <div className="space-y-3">
          <h2 className="font-semibold text-stone-700 dark:text-slate-200">Mavzular ketma-ketligi</h2>

          {course.topics.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-200 dark:border-white/8 p-12 text-center">
              <BookOpen className="h-8 w-8 text-stone-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-stone-400 dark:text-slate-600">Mavzular hali qo&apos;shilmagan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {course.topics.map((topic, idx) => {
                const approved = topic.contentItems.filter((c) => c.status === "APPROVED").length;
                const total = topic.contentItems.length;
                const isReady = total > 0 && approved === total;

                return (
                  <div
                    key={topic.id}
                    className="rounded-xl border border-stone-200 dark:border-white/8 bg-white dark:bg-[#17130E] hover:border-stone-300 dark:hover:border-stone-700 transition-colors p-4 flex items-center gap-3"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-[#1C1710] border border-stone-200 dark:border-white/10 flex items-center justify-center text-xs font-medium text-stone-500">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-stone-700 dark:text-slate-200 truncate">{topic.title}</h3>
                        {isReady
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          : <Circle className="h-4 w-4 text-slate-300 dark:text-slate-700 shrink-0" />}
                      </div>
                      {topic.learningObjective && (
                        <p className="text-xs text-stone-400 dark:text-slate-600 mt-0.5 line-clamp-1">{topic.learningObjective}</p>
                      )}
                      <div className="flex gap-3 mt-1 text-xs text-stone-400 dark:text-slate-600">
                        <span>{total} material ({approved} tasdiqlangan)</span>
                        <span>{topic._count.questions} savol</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <DeleteTopicButton topicId={topic.id} topicTitle={topic.title} />
                      <Link href={`/professor/courses/${courseId}/topics/${topic.id}`}>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 hover:text-stone-700 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-[#2a2720] transition-colors">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
