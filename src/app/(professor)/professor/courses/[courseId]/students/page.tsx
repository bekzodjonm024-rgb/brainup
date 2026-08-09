import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Users, BookOpen } from "lucide-react";
import { AddStudentDialog, RemoveStudentButton, ResetAssessmentButton } from "./student-actions";
import { formatDate } from "@/lib/utils";

export default async function CourseStudentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: {
      title: true,
      professorId: true,
      topics: { select: { id: true } },
    },
  });
  if (!course) notFound();
  if (course.professorId !== session.user.profileId) redirect("/professor/dashboard");

  const topicIds = course.topics.map((t) => t.id);

  const enrollments = await db.enrollment.findMany({
    where: { courseId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          yearLevel: true,
          groupName: true,
          user: { select: { email: true } },
          learnerKnowledge: {
            where: { topicId: { in: topicIds } },
            select: { masteryScore: true, attempts: true, updatedAt: true },
          },
          _count: { select: { attempts: true } },
        },
      },
    },
    orderBy: { enrolledAt: "asc" },
  });

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title="Talabalar"
        description={course.title}
      />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <Link href={`/professor/courses/${courseId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> {course.title}
            </Button>
          </Link>
          <AddStudentDialog courseId={courseId} />
        </div>

        {/* Summary */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-700">
            Jami <strong>{enrollments.length} ta talaba</strong> yozilgan
          </span>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-200 mb-3" />
            <p className="text-slate-500 text-sm">Hali talabalar yo'q</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Talaba</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Guruh</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Yozilgan</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Mastery</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Urinishlar</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(({ student, enrolledAt }) => {
                    const knowledge = student.learnerKnowledge;
                    const avgMastery = knowledge.length
                      ? knowledge.reduce((s, k) => s + k.masteryScore, 0) / knowledge.length
                      : 0;

                    return (
                      <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-900">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-slate-400">{student.user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="secondary">{student.yearLevel}-kurs</Badge>
                            {student.groupName && (
                              <Badge variant="secondary">{student.groupName}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">
                          {formatDate(enrolledAt)}
                        </td>
                        <td className="px-4 py-3">
                          <MasteryBadge score={avgMastery} />
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                          {student._count.attempts}
                        </td>
                        <td className="px-4 py-3">
                            <ResetAssessmentButton
                            courseId={courseId}
                            studentId={student.id}
                            name={`${student.firstName} ${student.lastName}`}
                          />
                          <RemoveStudentButton
                            courseId={courseId}
                            studentId={student.id}
                            name={`${student.firstName} ${student.lastName}`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
