import type { Metadata } from "next";
export const metadata: Metadata = { title: "Takrorlash" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import Link from "next/link";
import { RotateCcw, CheckCircle2, Clock, BookOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDueDate(dueAt: Date): { label: string; urgent: boolean } {
  const now = new Date();
  const diffMs = dueAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `${Math.abs(diffDays)} kun kechikdi`, urgent: true };
  if (diffDays === 0) return { label: "Bugun", urgent: true };
  if (diffDays === 1) return { label: "Ertaga", urgent: false };
  return { label: `${diffDays} kundan keyin`, urgent: false };
}

export default async function RetrievalPage() {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const studentId = session.user.profileId;

  const [dueRecords, upcomingRecords, completedCount] = await Promise.all([
    // Due now
    db.retrievalRecord.findMany({
      where: { studentId, status: "PENDING", dueAt: { lte: new Date() } },
      orderBy: { dueAt: "asc" },
      include: {
        topic: {
          select: {
            id: true, title: true, courseId: true,
            course: { select: { title: true } },
            learnerKnowledge: { where: { studentId }, take: 1 },
          },
        },
      },
    }),
    // Coming up (next 14 days)
    db.retrievalRecord.findMany({
      where: {
        studentId, status: "PENDING",
        dueAt: { gt: new Date(), lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { dueAt: "asc" },
      take: 5,
      include: {
        topic: { select: { id: true, title: true, course: { select: { title: true } } } },
      },
    }),
    // Completed this month
    db.retrievalRecord.count({
      where: {
        studentId, status: "COMPLETED",
        completedAt: { gte: new Date(new Date().setDate(1)) },
      },
    }),
  ]);

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title="Takrorlash"
        description="Spaced repetition — bilimlarni uzoq muddatga saqlash"
      />

      <main className="flex-1 p-6 space-y-6 max-w-2xl">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <RotateCcw className="h-4 w-4 text-amber-600" />, label: "Bugun muddati o'tgan", value: dueRecords.length, bg: "bg-amber-50" },
            { icon: <Clock className="h-4 w-4 text-blue-600" />, label: "Kelayotgan (14 kun)", value: upcomingRecords.length, bg: "bg-blue-50" },
            { icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />, label: "Bu oy bajarildi", value: completedCount, bg: "bg-emerald-50" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-3 flex items-center gap-2">
                <div className={cn("rounded-lg p-1.5", s.bg)}>{s.icon}</div>
                <div>
                  <p className="text-xs text-slate-500 leading-tight">{s.label}</p>
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Due records */}
        <section className="space-y-3">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-amber-500" />
            Takrorlash kerak
            {dueRecords.length > 0 && (
              <Badge variant="warning" className="ml-1">{dueRecords.length}</Badge>
            )}
          </h2>

          {dueRecords.length === 0 ? (
            <Card>
              <CardContent className="py-10 flex flex-col items-center gap-3 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-300" />
                <p className="text-slate-600 font-medium">Hozircha takrorlash kerak emas</p>
                <p className="text-sm text-slate-400">
                  Mavzularni o'zlashtirsangiz, takrorlash jadvali avtomatik tuziladi.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {dueRecords.map((rec) => {
                const knowledge = rec.topic.learnerKnowledge[0];
                const mastery = knowledge?.masteryScore ?? 0;
                const { label, urgent } = formatDueDate(rec.dueAt);

                return (
                  <Card key={rec.id} className={cn(urgent && "border-amber-200")}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <RotateCcw className={cn("h-5 w-5 shrink-0", urgent ? "text-amber-500" : "text-slate-400")} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-slate-900 text-sm">{rec.topic.title}</h3>
                          <MasteryBadge score={mastery} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{rec.topic.course.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={cn(
                            "text-xs font-medium",
                            urgent ? "text-amber-600" : "text-slate-400"
                          )}>
                            {label}
                          </span>
                          <span className="text-xs text-slate-400">
                            Interval: {rec.intervalDays} kun
                          </span>
                        </div>
                      </div>
                      <Link href={`/retrieval/${rec.topic.id}?recordId=${rec.id}`}>
                        <Button size="sm">
                          Boshlash <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Upcoming */}
        {upcomingRecords.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              Kelayotgan takrorlashlar
            </h2>
            <div className="space-y-2">
              {upcomingRecords.map((rec) => {
                const { label } = formatDueDate(rec.dueAt);
                return (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-100 bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{rec.topic.title}</p>
                      <p className="text-xs text-slate-400 truncate">{rec.topic.course.title}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0 ml-3">{label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Explanation */}
        <Card className="border-blue-100 bg-blue-50/50">
          <CardContent className="p-4 flex gap-3">
            <BookOpen className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 space-y-1">
              <p className="font-medium">Spaced Repetition nima?</p>
              <p className="text-blue-700">
                Mavzuni o'zlashtirganingizdan so'ng, uni to'g'ri vaqtda takrorlash
                uzoq muddatli xotirani mustahkamlaydi. Intervalar: 3 → 7 → 14 → 30 kun.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
