import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import Link from "next/link";
import {
  Plus, ArrowLeft, BookOpen, Users, LayoutList,
  GripVertical, ChevronRight, CheckCircle2, Circle, BarChart3, UserCheck
} from "lucide-react";
import { EditCourseDialog } from "./edit-course-dialog";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

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
  if (course.professorId !== session.user.profileId) redirect("/professor/dashboard");

  const totalContent = course.topics.reduce((s, t) => s + t.contentItems.length, 0);
  const approvedContent = course.topics.reduce(
    (s, t) => s + t.contentItems.filter((c) => c.status === "APPROVED").length, 0
  );

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#F8F5EF] dark:bg-[#0e1117]">
      <Header title={course.title} description={course.faculty?.name ?? ""} />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/professor/courses">
            <button className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2720] px-3 py-1.5 rounded-lg transition-colors">
              <ArrowLeft className="h-4 w-4" /> Kurslar
            </button>
          </Link>
          <div className="flex gap-2">
            <EditCourseDialog
              courseId={courseId}
              currentTitle={course.title}
              currentDescription={course.description}
              currentSemester={course.semester}
            />
            <Link href={`/professor/courses/${courseId}/students`}>
              <button className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2720] border border-slate-300 dark:border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                <UserCheck className="h-4 w-4" /> Talabalar
              </button>
            </Link>
            <Link href={`/professor/courses/${courseId}/analytics`}>
              <button className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2720] border border-slate-300 dark:border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                <BarChart3 className="h-4 w-4" /> Analitika
              </button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <LayoutList className="h-5 w-5 text-[#B45309] dark:text-amber-400" />, label: "Mavzular", value: course.topics.length, iconBg: "bg-[#FEF4E7] dark:bg-blue-950/50" },
            { icon: <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, label: "Talabalar", value: course._count.enrollments, iconBg: "bg-emerald-50 dark:bg-emerald-950/50" },
            { icon: <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />, label: "Materiallar", value: totalContent, iconBg: "bg-violet-50 dark:bg-violet-950/50" },
            { icon: <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />, label: "Tasdiqlangan", value: approvedContent, iconBg: "bg-amber-50 dark:bg-amber-950/50" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e2840] p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>{s.icon}</div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wide font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Topics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">Mavzular ketma-ketligi</h2>
            <Link href={`/professor/courses/${courseId}/topics/new`}>
              <button className="flex items-center gap-1.5 text-sm bg-[#B45309] hover:bg-[#92400E] text-white px-3 py-1.5 rounded-lg transition-colors">
                <Plus className="h-4 w-4" /> Mavzu qo&apos;shish
              </button>
            </Link>
          </div>

          {course.topics.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/8 p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#1e2840] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-slate-400 dark:text-slate-600" />
              </div>
              <p className="font-medium text-slate-500 dark:text-slate-400 mb-1">Mavzular hali qo&apos;shilmagan</p>
              <p className="text-sm text-slate-400 dark:text-slate-600 mb-4">Birinchi mavzuni qo&apos;shing</p>
              <Link href={`/professor/courses/${courseId}/topics/new`}>
                <button className="text-sm bg-[#B45309] hover:bg-[#92400E] text-white px-4 py-2 rounded-lg transition-colors">
                  Mavzu qo&apos;shish
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {course.topics.map((topic, idx) => {
                const approved = topic.contentItems.filter((c) => c.status === "APPROVED").length;
                const total = topic.contentItems.length;
                const isReady = total > 0 && approved === total;

                return (
                  <div key={topic.id} className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] hover:border-slate-300 dark:hover:border-slate-700 transition-colors p-4 flex items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <GripVertical className="h-4 w-4 text-slate-400 dark:text-slate-700" />
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#1e2840] border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-medium text-slate-500">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-700 dark:text-slate-200 truncate">{topic.title}</h3>
                        {isReady
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          : <Circle className="h-4 w-4 text-slate-300 dark:text-slate-700 shrink-0" />}
                      </div>
                      {topic.learningObjective && (
                        <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5 line-clamp-1">{topic.learningObjective}</p>
                      )}
                      <div className="flex gap-3 mt-1 text-xs text-slate-400 dark:text-slate-600">
                        <span>{total} material ({approved} tasdiqlangan)</span>
                        <span>{topic._count.questions} savol</span>
                      </div>
                    </div>

                    <Link href={`/professor/courses/${courseId}/topics/${topic.id}`}>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2720] transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </Link>
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
