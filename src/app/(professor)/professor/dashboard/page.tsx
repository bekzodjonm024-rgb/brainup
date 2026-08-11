import type { Metadata } from "next";
export const metadata: Metadata = { title: "Professor Dashboard" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Users, TrendingUp, AlertTriangle, ArrowRight, Plus, BarChart3 } from "lucide-react";
import { AvatarUpload } from "@/components/shared/avatar-upload";

export default async function ProfessorDashboard() {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const professor = await db.professor.findUnique({
    where: { id: session.user.profileId },
    include: {
      user: { select: { avatarUrl: true } },
      courses: {
        where: { isActive: true },
        include: {
          _count: { select: { enrollments: true, topics: true } },
          topics: {
            include: { learnerKnowledge: { select: { masteryScore: true } } },
            take: 20,
          },
          enrollments: { select: { studentId: true }, take: 200 },
        },
        take: 10,
      },
    },
  });

  if (!professor) redirect("/login");

  const totalStudents = new Set(
    professor.courses.flatMap((c) => c.enrollments.map((e) => e.studentId))
  ).size;

  const totalCourses = professor.courses.length;

  const difficultTopics = professor.courses
    .flatMap((c) =>
      c.topics.map((t) => {
        const knowledge = t.learnerKnowledge;
        const avgMastery = knowledge.length
          ? knowledge.reduce((s, k) => s + k.masteryScore, 0) / knowledge.length
          : 0;
        return { id: t.id, title: t.title, courseTitle: c.title, avgMastery, count: knowledge.length };
      })
    )
    .filter((t) => t.count >= 3 && t.avgMastery < 0.65)
    .sort((a, b) => a.avgMastery - b.avgMastery)
    .slice(0, 5);

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-950">
      <Header title={`Salom, ${professor.firstName}!`} description="Professor boshqaruv paneli" />

      <main className="flex-1 p-6 space-y-6">

        {/* Profile row */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <AvatarUpload
            currentUrl={professor.user.avatarUrl}
            initials={`${professor.firstName[0]}${professor.lastName[0]}`}
            size="md"
          />
          <div>
            <p className="font-semibold text-white">{professor.firstName} {professor.lastName}</p>
            {professor.title && <p className="text-sm text-slate-500">{professor.title}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <BookOpen className="h-5 w-5 text-blue-400" />,     label: "Kurslar",        value: totalCourses,         border: "border-blue-500/20",   glow: "bg-blue-500/5",   iconBg: "bg-blue-500/10" },
            { icon: <Users className="h-5 w-5 text-emerald-400" />,      label: "Talabalar",      value: totalStudents,         border: "border-emerald-500/20",glow: "bg-emerald-500/5",iconBg: "bg-emerald-500/10" },
            { icon: <AlertTriangle className="h-5 w-5 text-amber-400" />, label: "Qiyin mavzular", value: difficultTopics.length, border: "border-amber-500/20",  glow: "bg-amber-500/5",  iconBg: "bg-amber-500/10" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border ${s.border} ${s.glow} p-5`}>
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>{s.icon}</div>
              <p className="f-syne text-2xl font-bold text-white leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide font-medium">{s.label}</p>
            </div>
          ))}

          <Link href="/professor/analytics">
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 hover:border-violet-500/40 transition-colors h-full flex flex-col justify-between cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Analitika</p>
                <p className="text-sm font-semibold text-violet-400">Ko&apos;rish →</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="f-syne font-bold text-white">Mening kurslarim</h2>
              <Link href="/professor/courses/new">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 border-0 text-white gap-1">
                  <Plus className="h-3.5 w-3.5" /> Yangi kurs
                </Button>
              </Link>
            </div>

            {professor.courses.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 py-10 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-500">Hali kurs yaratilinmadi</p>
                <Link href="/professor/courses/new">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-500 border-0 text-white">Kurs yaratish</Button>
                </Link>
              </div>
            ) : (
              professor.courses.map((course) => {
                const allKnowledge = course.topics.flatMap((t) => t.learnerKnowledge);
                const avgMastery = allKnowledge.length
                  ? allKnowledge.reduce((s, k) => s + k.masteryScore, 0) / allKnowledge.length
                  : 0;

                return (
                  <div key={course.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="min-w-0">
                        <h3 className="font-medium text-slate-200 truncate">{course.title}</h3>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-600">
                          <span>{course._count.enrollments} talaba</span>
                          <span>{course._count.topics} mavzu</span>
                          <span>{Math.round(avgMastery * 100)}% mastery</span>
                        </div>
                      </div>
                      <Link href={`/professor/courses/${course.id}`}>
                        <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 hover:bg-slate-800 bg-transparent shrink-0 text-xs">
                          Ko&apos;rish <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${avgMastery * 100}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Difficult topics */}
          <div className="space-y-4">
            <h2 className="f-syne font-bold text-white">Qiyin mavzular</h2>
            {difficultTopics.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-sm text-slate-500">Qiyin mavzular aniqlanmadi</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-500/20 bg-slate-900 p-5 space-y-4">
                {difficultTopics.map((topic) => (
                  <div key={topic.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-300 truncate flex-1">{topic.title}</span>
                      <span className="text-xs font-bold text-amber-400 shrink-0">{Math.round(topic.avgMastery * 100)}%</span>
                    </div>
                    <p className="text-xs text-slate-600">{topic.courseTitle}</p>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${topic.avgMastery * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
