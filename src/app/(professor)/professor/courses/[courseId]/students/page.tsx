import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddStudentDialog } from "./student-actions";
import { SendReminderButton } from "./send-reminder-button";
import { StudentsTable } from "./students-table";

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
    select: { title: true, professorId: true, topics: { select: { id: true } } },
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
    <div className="flex flex-col flex-1 overflow-auto bg-[#F8F5EF] dark:bg-[#100D09]">
      <Header title="Talabalar" description={course.title} />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href={`/professor/courses/${courseId}`}>
            <button className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-[#2a2720] px-3 py-1.5 rounded-lg transition-colors">
              <ArrowLeft className="h-4 w-4" /> {course.title}
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <SendReminderButton courseId={courseId} />
            <AddStudentDialog courseId={courseId} />
          </div>
        </div>

        <StudentsTable enrollments={enrollments} courseId={courseId} />
      </main>
    </div>
  );
}
