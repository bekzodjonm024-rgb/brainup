import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kurslar" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CourseToggle } from "./course-toggle";

export default async function AdminCoursesPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const courses = await db.course.findMany({
    select: {
      id: true,
      title: true,
      semester: true,
      isActive: true,
      createdAt: true,
      professor: {
        select: { firstName: true, lastName: true, title: true },
      },
      faculty: {
        select: { name: true, university: { select: { shortName: true } } },
      },
      _count: { select: { topics: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const active = courses.filter((c) => c.isActive).length;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Kurslar" description="Barcha kurslarni boshqarish" />
      <main className="flex-1 p-6 space-y-4">
        <div className="text-sm text-slate-500">
          Jami <strong className="text-slate-900">{courses.length} ta kurs</strong>
          {" · "}
          <span className="text-emerald-600">{active} faol</span>
          {" · "}
          <span className="text-slate-400">{courses.length - active} nofaol</span>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Kurs</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Professor</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Fakultet</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Mavzular</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Yozilganlar</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Holat</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => {
                    const profName = `${course.professor.firstName} ${course.professor.lastName}`;
                    return (
                      <tr key={course.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-900">{course.title}</p>
                            {course.semester && (
                              <p className="text-xs text-slate-400">{course.semester}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div>
                            <p className="text-slate-700">{profName}</p>
                            {course.professor.title && (
                              <p className="text-xs text-slate-400">{course.professor.title}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {course.faculty?.university?.shortName && (
                              <Badge variant="secondary">{course.faculty.university.shortName}</Badge>
                            )}
                            {course.faculty?.name && (
                              <span className="text-xs text-slate-500 max-w-[140px] truncate">{course.faculty.name}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                          {course._count.topics} ta
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                          {course._count.enrollments} ta
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={course.isActive ? "default" : "secondary"} className="text-xs">
                            {course.isActive ? "Faol" : "Nofaol"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <CourseToggle courseId={course.id} isActive={course.isActive} title={course.title} />
                        </td>
                      </tr>
                    );
                  })}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        Hech qanday kurs topilmadi
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
