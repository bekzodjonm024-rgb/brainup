import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kurslar" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CoursesTable } from "./courses-table";

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

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-white dark:bg-slate-950">
      <Header title="Kurslar" description="Barcha kurslarni boshqarish" />
      <main className="flex-1 p-6">
        <CoursesTable courses={courses} />
      </main>
    </div>
  );
}
