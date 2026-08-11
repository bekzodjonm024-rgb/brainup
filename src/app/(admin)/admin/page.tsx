import type { Metadata } from "next";
export const metadata: Metadata = { title: "Admin" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  Users, BookOpen, TrendingUp, Brain, UserCheck, GraduationCap,
  UserCog, FileText, BarChart3, University, UserCircle, ChevronRight,
} from "lucide-react";

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
    pendingContent,
  ] = await Promise.all([
    db.student.count(),
    db.professor.count(),
    db.course.count({ where: { isActive: true } }),
    db.enrollment.count(),
    db.assessmentSession.count({ where: { status: "COMPLETED" } }),
    db.user.count({ where: { role: "STUDENT", isActive: true } }),
    db.contentItem.count({ where: { status: "PENDING_REVIEW" } }),
  ]);

  const stats = [
    { icon: <Users className="h-5 w-5 text-blue-600" />, label: "Jami talabalar", value: totalStudents, bg: "bg-blue-50" },
    { icon: <UserCheck className="h-5 w-5 text-emerald-600" />, label: "Faol talabalar", value: activeStudents, bg: "bg-emerald-50" },
    { icon: <GraduationCap className="h-5 w-5 text-violet-600" />, label: "Professorlar", value: totalProfessors, bg: "bg-violet-50" },
    { icon: <BookOpen className="h-5 w-5 text-amber-600" />, label: "Faol kurslar", value: totalCourses, bg: "bg-amber-50" },
    { icon: <TrendingUp className="h-5 w-5 text-pink-600" />, label: "Yozilishlar", value: totalEnrollments, bg: "bg-pink-50" },
    { icon: <Brain className="h-5 w-5 text-cyan-600" />, label: "Baholash yakunlangan", value: assessmentsCompleted, bg: "bg-cyan-50" },
  ];

  const quickLinks = [
    { href: "/admin/users", label: "Talabalar", icon: Users, description: "Bloklash, parol reset" },
    { href: "/admin/professors", label: "Professorlar", icon: UserCog, description: "Hisob qo'shish va boshqarish" },
    { href: "/admin/courses", label: "Kurslar", icon: BookOpen, description: "Faollik holati" },
    {
      href: "/admin/content", label: "Kontent", icon: FileText,
      description: pendingContent > 0 ? `${pendingContent} ta kutmoqda` : "Tasdiqlash / rad etish",
      badge: pendingContent > 0 ? pendingContent : undefined,
    },
    { href: "/admin/analytics", label: "Statistika", icon: BarChart3, description: "Platform tahlili" },
    { href: "/admin/universities", label: "Universitetlar", icon: University, description: "Fakultetlar boshqaruvi" },
    { href: "/admin/profile", label: "Profilim", icon: UserCircle, description: "Avatar, parol" },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Admin panel" description="BrainUP tizimini boshqarish" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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

        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Bo'limlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className="rounded-lg bg-slate-100 p-2 group-hover:bg-blue-50 transition-colors shrink-0">
                    <Icon className="h-4 w-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{link.label}</p>
                      {"badge" in link && link.badge !== undefined && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white leading-none">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{link.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-400 shrink-0 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
