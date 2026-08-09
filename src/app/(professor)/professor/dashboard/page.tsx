import type { Metadata } from "next";
export const metadata: Metadata = { title: "Professor Dashboard" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { BookOpen, Users, TrendingUp, AlertTriangle, ArrowRight, Plus, BarChart3 } from "lucide-react";

export default async function ProfessorDashboard() {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const professor = await db.professor.findUnique({
    where: { id: session.user.profileId },
    include: {
      courses: {
        where: { isActive: true },
        include: {
          _count: { select: { enrollments: true, topics: true } },
          topics: {
            include: {
              learnerKnowledge: {
                select: { masteryScore: true },
              },
            },
            take: 20,
          },
          enrollments: {
            select: { studentId: true },
            take: 200,
          },
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

  // Find difficult topics (avg mastery < 0.65)
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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title={`Salom, ${professor.firstName}!`}
        description="Professor boshqaruv paneli"
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={<BookOpen className="h-5 w-5 text-blue-600" />} label="Kurslar" value={totalCourses} bg="bg-blue-50" />
          <StatCard icon={<Users className="h-5 w-5 text-emerald-600" />} label="Talabalar" value={totalStudents} bg="bg-emerald-50" />
          <StatCard icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} label="Qiyin mavzular" value={difficultTopics.length} bg="bg-amber-50" />
          <Link href="/professor/analytics">
            <Card className="hover:border-blue-200 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3 h-full">
                <div className="rounded-lg p-2 bg-violet-50">
                  <BarChart3 className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Analitika</p>
                  <p className="text-sm font-semibold text-violet-600">Ko'rish →</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Mening kurslarim</h2>
              <Link href="/professor/courses/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Yangi kurs
                </Button>
              </Link>
            </div>

            {professor.courses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                  <BookOpen className="h-10 w-10 text-slate-300" />
                  <p className="text-sm text-slate-500">Hali kurs yaratilinmadi</p>
                  <Link href="/professor/courses/new">
                    <Button size="sm">Kurs yaratish</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              professor.courses.map((course) => {
                const allKnowledge = course.topics.flatMap((t) => t.learnerKnowledge);
                const avgMastery = allKnowledge.length
                  ? allKnowledge.reduce((s, k) => s + k.masteryScore, 0) / allKnowledge.length
                  : 0;

                return (
                  <Card key={course.id} className="hover:border-blue-200 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 truncate">{course.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span>{course._count.enrollments} talaba</span>
                          <span>{course._count.topics} mavzu</span>
                          <span>O'rtacha mastery: {Math.round(avgMastery * 100)}%</span>
                        </div>
                        <div className="mt-2">
                          <Progress value={avgMastery * 100} className="h-1.5" />
                        </div>
                      </div>
                      <Link href={`/professor/courses/${course.id}`}>
                        <Button size="sm" variant="outline">
                          Ko'rish <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Difficult topics */}
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900">Qiyin mavzular</h2>
            {difficultTopics.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <TrendingUp className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                  <p className="text-sm text-slate-500">Qiyin mavzular aniqlanmadi</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-3">
                  {difficultTopics.map((topic) => (
                    <div key={topic.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 truncate flex-1 mr-2">
                          {topic.title}
                        </span>
                        <Badge variant="warning" className="text-xs flex-shrink-0">
                          {Math.round(topic.avgMastery * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{topic.courseTitle}</p>
                      <Progress value={topic.avgMastery * 100} className="h-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string | number; bg: string }) {
  return (
    <Card className="border-slate-200 hover:border-slate-300 transition-colors">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`rounded-xl p-2.5 ${bg} shrink-0`}>{icon}</div>
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
