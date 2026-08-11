import type { Metadata } from "next";
export const metadata: Metadata = { title: "Admin" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  Users, BookOpen, TrendingUp, Brain, UserCheck, GraduationCap,
  UserCog, FileText, BarChart3, University, UserCircle, ChevronRight,
  AlertCircle, Clock,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalStudents,
    totalProfessors,
    totalCourses,
    totalEnrollments,
    assessmentsCompleted,
    activeStudents,
    pendingContent,
    blockedUsers,
    recentUsers,
    recentContent,
  ] = await Promise.all([
    db.student.count(),
    db.professor.count(),
    db.course.count({ where: { isActive: true } }),
    db.enrollment.count(),
    db.assessmentSession.count({ where: { status: "COMPLETED" } }),
    db.user.count({ where: { role: "STUDENT", isActive: true } }),
    db.contentItem.count({ where: { status: "PENDING_REVIEW" } }),
    db.user.count({ where: { isActive: false } }),
    db.user.findMany({
      where: { role: "STUDENT", createdAt: { gte: sevenDaysAgo } },
      select: {
        id: true, email: true, createdAt: true,
        student: { select: { firstName: true, lastName: true, university: { select: { shortName: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.contentItem.findMany({
      where: { status: "PENDING_REVIEW" },
      select: {
        id: true, title: true, type: true, createdAt: true,
        topic: { select: { course: { select: { professor: { select: { firstName: true, lastName: true } } } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
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

  const hasAlerts = pendingContent > 0 || blockedUsers > 0;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Admin panel" description="BrainUP tizimini boshqarish" />
      <main className="flex-1 p-6 space-y-6">

        {/* Alerts */}
        {hasAlerts && (
          <div className="flex flex-wrap gap-3">
            {pendingContent > 0 && (
              <Link
                href="/admin/content"
                className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <span><strong>{pendingContent}</strong> ta kontent tasdiqlash kutmoqda</span>
                <ChevronRight className="h-4 w-4 text-amber-400" />
              </Link>
            )}
            {blockedUsers > 0 && (
              <Link
                href="/admin/users?filter=blocked"
                className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 transition-colors"
              >
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span><strong>{blockedUsers}</strong> ta bloklangan hisob</span>
                <ChevronRight className="h-4 w-4 text-red-300" />
              </Link>
            )}
          </div>
        )}

        {/* Stats */}
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

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Bo'limlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
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

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                <Clock className="h-4 w-4 text-slate-400" />
                So'nggi ro'yxatdan o'tganlar (7 kun)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentUsers.length === 0 ? (
                <p className="text-xs text-slate-400 px-4 pb-4">So'nggi 7 kunda ro'yxatdan o'tgan yo'q</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recentUsers.map((u) => {
                    const s = u.student;
                    const name = s ? `${s.firstName} ${s.lastName}` : u.email;
                    return (
                      <div key={u.id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 uppercase">
                          {name.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
                          <p className="text-xs text-slate-400">
                            {s?.university?.shortName ?? u.email}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">{formatDate(u.createdAt)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                <FileText className="h-4 w-4 text-slate-400" />
                Tasdiqlash kutayotgan kontent
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentContent.length === 0 ? (
                <p className="text-xs text-slate-400 px-4 pb-4">Tasdiqlash kutayotgan kontent yo'q</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recentContent.map((item) => {
                    const prof = item.topic.course.professor;
                    return (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                        <Badge variant="secondary" className="text-xs shrink-0">{item.type}</Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 truncate">{item.title}</p>
                          <p className="text-xs text-slate-400">{prof.firstName} {prof.lastName}</p>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">{formatDate(item.createdAt)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {recentContent.length > 0 && (
                <div className="px-4 pb-3 pt-2">
                  <Link href="/admin/content" className="text-xs text-blue-600 hover:underline">
                    Hammasini ko'rish →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
