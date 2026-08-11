import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kurslarim" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { EnrollButton } from "./enroll-button";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import Link from "next/link";
import { BookOpen, ArrowRight, Users } from "lucide-react";

export default async function CoursesPage() {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const studentId = session.user.profileId;

  const [enrollments, availableCourses] = await Promise.all([
    db.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            professor: { select: { firstName: true, lastName: true } },
            topics: {
              include: {
                learnerKnowledge: {
                  where: { studentId },
                  take: 1,
                },
              },
              orderBy: { orderIndex: "asc" },
            },
            _count: { select: { enrollments: true } },
          },
        },
      },
    }),
    db.course.findMany({
      where: {
        isActive: true,
        enrollments: { none: { studentId } },
      },
      include: {
        professor: { select: { firstName: true, lastName: true } },
        _count: { select: { enrollments: true, topics: true } },
      },
      take: 10,
    }),
  ]);

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-950">
      <Header title="Kurslar" description="Mening kurslarim va mavjud kurslar" />

      <main className="flex-1 p-6 space-y-8">
        {/* Enrolled courses */}
        <section>
          <h2 className="f-syne text-base font-bold text-slate-300 mb-4">Mening kurslarim</h2>
          {enrollments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm">Hali kurslarga yozilmadingiz</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map(({ course }) => {
                const topics = course.topics;
                const mastered = topics.filter((t) => t.learnerKnowledge[0]?.masteryScore >= 0.85).length;
                const progress = topics.length > 0 ? (mastered / topics.length) * 100 : 0;
                const avgMastery = topics.length > 0
                  ? topics.reduce((s, t) => s + (t.learnerKnowledge[0]?.masteryScore ?? 0), 0) / topics.length
                  : 0;

                return (
                  <div key={course.id} className="rounded-2xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-colors p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-200 truncate">{course.title}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {course.professor.firstName} {course.professor.lastName}
                        </p>
                      </div>
                      <MasteryBadge score={avgMastery} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>{mastered}/{topics.length} mavzu</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white border-0">
                        Davom etish <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Available courses */}
        {availableCourses.length > 0 && (
          <section>
            <h2 className="f-syne text-base font-bold text-slate-300 mb-4">Mavjud kurslar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCourses.map((course) => (
                <div key={course.id} className="rounded-2xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-colors p-5 space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-200">{course.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {course.professor.firstName} {course.professor.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course._count.topics} mavzu
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course._count.enrollments} talaba
                    </span>
                  </div>
                  <EnrollButton courseId={course.id} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
