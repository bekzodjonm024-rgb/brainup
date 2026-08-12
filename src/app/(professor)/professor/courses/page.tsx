import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kurslar" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { CoursesGrid } from "./courses-grid";

export default async function ProfessorCoursesPage() {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const courses = await db.course.findMany({
    where: { professorId: session.user.profileId },
    include: {
      _count: { select: { enrollments: true, topics: true } },
      faculty: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-white dark:bg-slate-950">
      <Header title="Kurslarim" description="Kurslarni boshqarish va tahlil" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{courses.length} ta kurs</p>
          <Link href="/professor/courses/new">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-0">
              <Plus className="h-4 w-4 mr-1" /> Yangi kurs
            </Button>
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-7 w-7 text-slate-400 dark:text-slate-600" />
            </div>
            <p className="font-medium text-slate-500 dark:text-slate-400 mb-1">Hali kurs yaratilmagan</p>
            <p className="text-sm text-slate-400 dark:text-slate-600 mb-4">Birinchi kursni yarating va mavzularni qo&apos;shing</p>
            <Link href="/professor/courses/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-0">Kurs yaratish</Button>
            </Link>
          </div>
        ) : (
          <CoursesGrid courses={courses} />
        )}
      </main>
    </div>
  );
}
