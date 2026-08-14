import type { Metadata } from "next";
export const metadata: Metadata = { title: "Takrorlash" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import Link from "next/link";
import { RotateCcw, CheckCircle2, Clock, BookOpen, ArrowRight } from "lucide-react";

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
    db.retrievalRecord.count({
      where: {
        studentId, status: "COMPLETED",
        completedAt: { gte: new Date(new Date().setDate(1)) },
      },
    }),
  ]);

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#f8faff] dark:bg-[#0e1117]">
      <Header
        title="Takrorlash"
        description="Spaced repetition — bilimlarni uzoq muddatga saqlash"
      />

      <main className="flex-1 p-6 space-y-6 max-w-2xl mx-auto w-full">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />, label: "Bugun muddati o'tgan", value: dueRecords.length, iconBg: "bg-amber-50 dark:bg-amber-950/50" },
            { icon: <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />, label: "Kelayotgan (14 kun)", value: upcomingRecords.length, iconBg: "bg-blue-50 dark:bg-blue-950/50" },
            { icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, label: "Bu oy bajarildi", value: completedCount, iconBg: "bg-emerald-50 dark:bg-emerald-950/50" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e2840] p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>{s.icon}</div>
              <p className="text-xl font-bold text-slate-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Due records */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-amber-500" />
            Takrorlash kerak
            {dueRecords.length > 0 && (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 ml-1">
                {dueRecords.length}
              </span>
            )}
          </h2>

          {dueRecords.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] py-10 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Hozircha takrorlash kerak emas</p>
              <p className="text-sm text-slate-500 max-w-xs">
                Mavzularni o'zlashtirsangiz, takrorlash jadvali avtomatik tuziladi.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {dueRecords.map((rec) => {
                const knowledge = rec.topic.learnerKnowledge[0];
                const mastery = knowledge?.masteryScore ?? 0;
                const { label, urgent } = formatDueDate(rec.dueAt);

                return (
                  <div key={rec.id} className={`rounded-xl border bg-white dark:bg-[#151f35] p-4 flex items-center gap-3 ${urgent ? "border-amber-500/20" : "border-slate-200 dark:border-white/8"}`}>
                    <RotateCcw className={`h-5 w-5 shrink-0 ${urgent ? "text-amber-400" : "text-slate-400 dark:text-slate-600"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-slate-700 dark:text-slate-200 text-sm">{rec.topic.title}</h3>
                        <MasteryBadge score={mastery} />
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{rec.topic.course.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs font-medium ${urgent ? "text-amber-400" : "text-slate-500"}`}>
                          {label}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-700">
                          Interval: {rec.intervalDays} kun
                        </span>
                      </div>
                    </div>
                    <Link href={`/retrieval/${rec.topic.id}?recordId=${rec.id}`}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-0">
                        Boshlash <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Upcoming */}
        {upcomingRecords.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Kelayotgan takrorlashlar
            </h2>
            <div className="space-y-2">
              {upcomingRecords.map((rec) => {
                const { label } = formatDueDate(rec.dueAt);
                return (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">{rec.topic.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600 truncate">{rec.topic.course.title}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0 ml-3">{label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Explanation */}
        <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 p-4 flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <BookOpen className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-sm space-y-1">
            <p className="font-medium text-blue-400">Spaced Repetition nima?</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Mavzuni o'zlashtirganingizdan so'ng, uni to'g'ri vaqtda takrorlash
              uzoq muddatli xotirani mustahkamlaydi. Intervalar: 3 → 7 → 14 → 30 kun.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
