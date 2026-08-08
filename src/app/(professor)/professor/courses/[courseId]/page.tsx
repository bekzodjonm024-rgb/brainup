import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Plus, ArrowLeft, BookOpen, Users, LayoutList,
  GripVertical, ChevronRight, CheckCircle2, Circle, BarChart3
} from "lucide-react";

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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title={course.title} description={course.faculty?.name ?? ""} />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/professor/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Kurslar
            </Button>
          </Link>
          <Link href={`/professor/courses/${courseId}/analytics`}>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-1" /> Analitika
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <LayoutList className="h-4 w-4 text-blue-600" />, label: "Mavzular", value: course.topics.length },
            { icon: <Users className="h-4 w-4 text-emerald-600" />, label: "Talabalar", value: course._count.enrollments },
            { icon: <BookOpen className="h-4 w-4 text-violet-600" />, label: "Materiallar", value: totalContent },
            { icon: <CheckCircle2 className="h-4 w-4 text-amber-600" />, label: "Tasdiqlangan", value: approvedContent },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="shrink-0">{s.icon}</div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Topics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Mavzular ketma-ketligi</h2>
            <Link href={`/professor/courses/${courseId}/topics/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Mavzu qo'shish
              </Button>
            </Link>
          </div>

          {course.topics.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-200 mb-3" />
              <p className="font-medium text-slate-600 mb-1">Mavzular hali qo'shilmagan</p>
              <p className="text-sm text-slate-400 mb-4">Birinchi mavzuni qo'shing</p>
              <Link href={`/professor/courses/${courseId}/topics/new`}>
                <Button size="sm">Mavzu qo'shish</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {course.topics.map((topic, idx) => {
                const approved = topic.contentItems.filter((c) => c.status === "APPROVED").length;
                const total = topic.contentItems.length;
                const isReady = total > 0 && approved === total;

                return (
                  <Card key={topic.id} className="hover:border-blue-200 transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex items-center gap-2 shrink-0">
                        <GripVertical className="h-4 w-4 text-slate-300" />
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">
                          {idx + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900 truncate">{topic.title}</h3>
                          {isReady
                            ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            : <Circle className="h-4 w-4 text-slate-300 shrink-0" />}
                        </div>
                        {topic.learningObjective && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{topic.learningObjective}</p>
                        )}
                        <div className="flex gap-3 mt-1 text-xs text-slate-400">
                          <span>{total} material ({approved} tasdiqlangan)</span>
                          <span>{topic._count.questions} savol</span>
                        </div>
                      </div>

                      <Link href={`/professor/courses/${courseId}/topics/${topic.id}`}>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
