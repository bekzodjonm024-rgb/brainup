import type { Metadata } from "next";
export const metadata: Metadata = { title: "Admin" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
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
    { icon: <Users className="h-5 w-5 text-[#B45309] dark:text-amber-400" />, label: "Jami talabalar", value: totalStudents, iconBg: "bg-[#FEF4E7] dark:bg-amber-950/30" },
    { icon: <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, label: "Faol talabalar", value: activeStudents, iconBg: "bg-emerald-50 dark:bg-emerald-950/50" },
    { icon: <GraduationCap className="h-5 w-5 text-violet-600 dark:text-violet-400" />, label: "Professorlar", value: totalProfessors, iconBg: "bg-violet-50 dark:bg-violet-950/50" },
    { icon: <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />, label: "Faol kurslar", value: totalCourses, iconBg: "bg-amber-50 dark:bg-amber-950/50" },
    { icon: <TrendingUp className="h-5 w-5 text-pink-600 dark:text-pink-400" />, label: "Yozilishlar", value: totalEnrollments, iconBg: "bg-pink-50 dark:bg-pink-950/50" },
    { icon: <Brain className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />, label: "Baholash yakunlangan", value: assessmentsCompleted, iconBg: "bg-cyan-50 dark:bg-cyan-950/50" },
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
    <div className="flex flex-col flex-1 overflow-auto bg-[#F8F5EF] dark:bg-[#100D09]">
      <Header title="Admin panel" description="BrainUP tizimini boshqarish" />
      <main className="flex-1 p-6 space-y-6">

        {/* Alerts */}
        {hasAlerts && (
          <div className="flex flex-wrap gap-3">
            {pendingContent > 0 && (
              <Link
                href="/admin/content"
                className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span><strong>{pendingContent}</strong> ta kontent tasdiqlash kutmoqda</span>
                <ChevronRight className="h-4 w-4 text-amber-500/50" />
              </Link>
            )}
            {blockedUsers > 0 && (
              <Link
                href="/admin/users?filter=blocked"
                className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span><strong>{blockedUsers}</strong> ta bloklangan hisob</span>
                <ChevronRight className="h-4 w-4 text-red-500/50" />
              </Link>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-card rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#1C1710] p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>{s.icon}</div>
              <p className="text-2xl font-bold text-[#1C1208] dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-2 uppercase tracking-wide font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-xs font-semibold text-stone-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Bo&apos;limlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl border border-stone-200 dark:border-white/8 bg-white dark:bg-[#17130E] p-4 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-[#2a2720]/60 transition-all group"
                >
                  <div className="rounded-lg bg-stone-100 dark:bg-[#1C1710] p-2 group-hover:bg-[#92400E]/10 transition-colors shrink-0">
                    <Icon className="h-4 w-4 text-stone-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-stone-700 dark:text-slate-200">{link.label}</p>
                      {"badge" in link && link.badge !== undefined && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white leading-none">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 truncate">{link.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-700 group-hover:text-slate-400 shrink-0 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Recent users */}
          <div className="rounded-xl border border-stone-200 dark:border-white/8 bg-white dark:bg-[#17130E] overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-white/8">
              <h3 className="text-sm font-semibold text-stone-600 dark:text-slate-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-stone-500" />
                So&apos;nggi ro&apos;yxatdan o&apos;tganlar (7 kun)
              </h3>
            </div>
            {recentUsers.length === 0 ? (
              <p className="text-xs text-stone-400 dark:text-slate-600 p-5">So&apos;nggi 7 kunda ro&apos;yxatdan o&apos;tgan yo&apos;q</p>
            ) : (
              <div className="divide-y divide-stone-200 dark:divide-slate-800/60">
                {recentUsers.map((u) => {
                  const s = u.student;
                  const name = s ? `${s.firstName} ${s.lastName}` : u.email;
                  return (
                    <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="h-8 w-8 rounded-full bg-[#FEF4E7]/10 border border-[#B45309]/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 uppercase">
                        {name.split(/\s+/).filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-700 dark:text-slate-200 truncate">{name}</p>
                        <p className="text-xs text-stone-400 dark:text-slate-600">
                          {s?.university?.shortName ?? u.email}
                        </p>
                      </div>
                      <span className="text-xs text-stone-400 dark:text-slate-600 shrink-0">{formatDate(u.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending content */}
          <div className="rounded-xl border border-stone-200 dark:border-white/8 bg-white dark:bg-[#17130E] overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-white/8">
              <h3 className="text-sm font-semibold text-stone-600 dark:text-slate-300 flex items-center gap-2">
                <FileText className="h-4 w-4 text-stone-500" />
                Tasdiqlash kutayotgan kontent
              </h3>
            </div>
            {recentContent.length === 0 ? (
              <p className="text-xs text-stone-400 dark:text-slate-600 p-5">Tasdiqlash kutayotgan kontent yo&apos;q</p>
            ) : (
              <>
                <div className="divide-y divide-stone-200 dark:divide-slate-800/60">
                  {recentContent.map((item) => {
                    const prof = item.topic.course.professor;
                    return (
                      <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">{item.type}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-stone-700 dark:text-slate-200 truncate">{item.title}</p>
                          <p className="text-xs text-stone-400 dark:text-slate-600">{prof.firstName} {prof.lastName}</p>
                        </div>
                        <span className="text-xs text-stone-400 dark:text-slate-600 shrink-0">{formatDate(item.createdAt)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="px-5 py-3 border-t border-stone-200 dark:border-white/8">
                  <Link href="/admin/content" className="text-xs text-amber-400 hover:text-amber-400 transition-colors">
                    Hammasini ko&apos;rish →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
