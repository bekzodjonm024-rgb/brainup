import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Kurslar" description="Mening kurslarim va mavjud kurslar" />

      <main className="flex-1 p-6 space-y-8">
        {/* Enrolled courses */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 mb-4">Mening kurslarim</h2>
          {enrollments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300 mb-3" />
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
                  <Card key={course.id} className="hover:border-blue-200 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{course.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {course.professor.firstName} {course.professor.lastName}
                          </CardDescription>
                        </div>
                        <MasteryBadge score={avgMastery} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{mastered}/{topics.length} mavzu</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                      <Link href={`/courses/${course.id}`}>
                        <Button size="sm" className="w-full">
                          Davom etish <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Available courses */}
        {availableCourses.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-4">Mavjud kurslar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCourses.map((course) => (
                <Card key={course.id} className="hover:border-blue-200 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{course.title}</CardTitle>
                    <CardDescription>
                      {course.professor.firstName} {course.professor.lastName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function EnrollButton({ courseId }: { courseId: string }) {
  return (
    <form action={`/api/student/enroll`} method="POST">
      <input type="hidden" name="courseId" value={courseId} />
      <Button size="sm" variant="outline" className="w-full" type="submit">
        Kursga yozilish
      </Button>
    </form>
  );
}
