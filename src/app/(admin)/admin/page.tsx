import type { Metadata } from "next";
export const metadata: Metadata = { title: "Admin" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, Brain, UserCheck, GraduationCap } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const [
    totalStudents,
    totalProfessors,
    totalCourses,
    totalEnrollments,
    assessmentsCompleted,
    activeStudents,
  ] = await Promise.all([
    db.student.count(),
    db.professor.count(),
    db.course.count({ where: { isActive: true } }),
    db.enrollment.count(),
    db.assessmentSession.count({ where: { status: "COMPLETED" } }),
    db.user.count({ where: { role: "STUDENT", isActive: true } }),
  ]);

  const stats = [
    { icon: <Users className="h-5 w-5 text-blue-600" />, label: "Jami talabalar", value: totalStudents, bg: "bg-blue-50" },
    { icon: <UserCheck className="h-5 w-5 text-emerald-600" />, label: "Faol talabalar", value: activeStudents, bg: "bg-emerald-50" },
    { icon: <GraduationCap className="h-5 w-5 text-violet-600" />, label: "Professorlar", value: totalProfessors, bg: "bg-violet-50" },
    { icon: <BookOpen className="h-5 w-5 text-amber-600" />, label: "Faol kurslar", value: totalCourses, bg: "bg-amber-50" },
    { icon: <TrendingUp className="h-5 w-5 text-pink-600" />, label: "Yozilishlar", value: totalEnrollments, bg: "bg-pink-50" },
    { icon: <Brain className="h-5 w-5 text-cyan-600" />, label: "Baholash yakunlangan", value: assessmentsCompleted, bg: "bg-cyan-50" },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Admin panel" description="BrainUP tizimini boshqarish" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`rounded-xl p-2.5 ${s.bg} shrink-0`}>{s.icon}</div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">Tezkor havolalar</p>
          <ul className="space-y-1 text-blue-700">
            <li>→ <a href="/admin/users" className="underline hover:text-blue-900">Foydalanuvchilarni boshqarish</a></li>
            <li>→ <a href="/admin/professors" className="underline hover:text-blue-900">Yangi professor qo'shish</a></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
