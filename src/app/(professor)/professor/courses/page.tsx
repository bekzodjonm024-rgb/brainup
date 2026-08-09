import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kurslar" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, Plus, Users, LayoutList, ArrowRight } from "lucide-react";

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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Kurslarim" description="Kurslarni boshqarish va tahlil" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{courses.length} ta kurs</p>
          <Link href="/professor/courses/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Yangi kurs
            </Button>
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-14 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-200 mb-4" />
            <p className="font-medium text-slate-600 mb-1">Hali kurs yaratilmagan</p>
            <p className="text-sm text-slate-400 mb-4">Birinchi kursni yarating va mavzularni qo'shing</p>
            <Link href="/professor/courses/new">
              <Button size="sm">Kurs yaratish</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {courses.map((course) => (
              <Card key={course.id} className="hover:border-blue-200 transition-colors">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{course.title}</h3>
                      {!course.isActive && <Badge variant="secondary">Nofaol</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <LayoutList className="h-3 w-3" />{course._count.topics} mavzu
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />{course._count.enrollments} talaba
                      </span>
                      {course.semester && <span>{course.semester}</span>}
                      {course.faculty && <span>{course.faculty.name}</span>}
                    </div>
                    {course.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">{course.description}</p>
                    )}
                  </div>
                  <Link href={`/professor/courses/${course.id}`}>
                    <Button variant="outline" size="sm">
                      Boshqarish <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
