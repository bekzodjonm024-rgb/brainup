import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CognitiveProfileCard } from "@/components/shared/cognitive-profile-card";
import { CognitiveHistoryChart } from "@/components/shared/cognitive-history-chart";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { ProfileSettings } from "@/components/shared/profile-settings";
import { formatDate } from "@/lib/utils";
import { GraduationCap, BookOpen, TrendingUp, Calendar, Brain } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const [student, cognitiveHistory] = await Promise.all([
    db.student.findUnique({
      where: { id: session.user.profileId },
      include: {
        user: { select: { email: true, createdAt: true, avatarUrl: true } },
        university: { select: { name: true } },
        faculty: { select: { name: true } },
        cognitiveProfile: true,
        enrollments: {
          include: {
            course: {
              include: {
                topics: {
                  include: {
                    learnerKnowledge: { where: { studentId: session.user.profileId }, take: 1 },
                  },
                },
              },
            },
          },
        },
        _count: { select: { attempts: true, learningEvents: true } },
      },
    }),
    db.cognitiveHistory.findMany({
      where: { studentId: session.user.profileId },
      orderBy: { takenAt: "asc" },
      select: {
        id: true,
        attentionScore: true,
        workingMemoryScore: true,
        processingSpeedScore: true,
        memoryScore: true,
        takenAt: true,
      },
    }),
  ]);

  if (!student) redirect("/login");

  const allKnowledge = student.enrollments.flatMap((e) =>
    e.course.topics.flatMap((t) => t.learnerKnowledge)
  );
  const masteredTopics = allKnowledge.filter((k) => k.masteryScore >= 0.85).length;
  const avgMastery = allKnowledge.length
    ? allKnowledge.reduce((s, k) => s + k.masteryScore, 0) / allKnowledge.length
    : 0;

  const initials = `${student.firstName[0]}${student.lastName[0]}`;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#F8F5EF] dark:bg-[#100D09]">
      <Header title="Mening profilim" description="Shaxsiy o'quv profili" />
      <main className="flex-1 p-6 space-y-6 max-w-3xl mx-auto w-full">

        {/* Student info */}
        <div className="card-lift rounded-xl border border-stone-200 dark:border-white/8 bg-white dark:bg-[#17130E] p-5">
          <div className="flex items-start gap-4">
            <AvatarUpload
              currentUrl={student.user.avatarUrl}
              initials={initials}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-[#1C1208] dark:text-white text-lg">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-sm text-stone-500">{student.user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {[student.university.name, student.faculty.name, `${student.yearLevel}-kurs`, student.groupName].filter(Boolean).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-[#1C1710] border border-stone-200 dark:border-white/10 text-stone-500 dark:text-slate-400">{tag}</span>
                ))}
              </div>
            </div>
            <div className="text-right text-xs text-stone-400 dark:text-slate-600 shrink-0">
              <p className="flex items-center gap-1 justify-end">
                <Calendar className="h-3 w-3" />
                {formatDate(student.user.createdAt)}
              </p>
              <p>Ro'yxatdan o'tgan</p>
            </div>
          </div>
        </div>

        {/* Learning stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <BookOpen className="h-5 w-5 text-[#B45309] dark:text-amber-400" />, label: "Kurslar", value: student.enrollments.length, iconBg: "bg-[#FEF4E7] dark:bg-amber-950/30" },
            { icon: <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, label: "O'zlashtirildi", value: masteredTopics, iconBg: "bg-emerald-50 dark:bg-emerald-950/50" },
            { icon: <GraduationCap className="h-5 w-5 text-violet-600 dark:text-violet-400" />, label: "Urinishlar", value: student._count.attempts, iconBg: "bg-violet-50 dark:bg-violet-950/50" },
            { icon: <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />, label: "O'rtacha mastery", value: `${Math.round(avgMastery * 100)}%`, iconBg: "bg-amber-50 dark:bg-amber-950/50" },
          ].map((s) => (
            <div key={s.label} className="stat-card rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#1C1710] p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>{s.icon}</div>
              <p className="text-2xl font-bold text-[#1C1208] dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-2 uppercase tracking-wide font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Cognitive profile */}
        {student.cognitiveProfile ? (
          <CognitiveProfileCard
            attentionScore={student.cognitiveProfile.attentionScore}
            workingMemoryScore={student.cognitiveProfile.workingMemoryScore}
            processingSpeedScore={student.cognitiveProfile.processingSpeedScore}
            memoryScore={student.cognitiveProfile.memoryScore}
          />
        ) : (
          <div className="rounded-2xl border border-[#B45309]/20 bg-[#FEF4E7]/5 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FEF4E7]/10 flex items-center justify-center shrink-0">
              <Brain className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-stone-700 dark:text-slate-200">Baholash hali bajarilmagan</p>
              <p className="text-sm text-stone-500 mt-0.5">
                Kognitiv profil yaratish uchun boshlang'ich baholashni bajaring.
              </p>
            </div>
          </div>
        )}

        {/* Cognitive history chart */}
        {cognitiveHistory.length > 0 && (
          <div className="card-lift rounded-xl border border-stone-200 dark:border-white/8 bg-white dark:bg-[#17130E] p-5">
            <h3 className="font-semibold text-stone-700 dark:text-slate-200 mb-1">Kognitiv rivojlanish</h3>
            <p className="text-xs text-stone-400 mb-4">{cognitiveHistory.length} ta diagnostik test natijasi</p>
            <CognitiveHistoryChart
              history={cognitiveHistory.map((h) => ({ ...h, takenAt: h.takenAt.toISOString() }))}
            />
          </div>
        )}

        {/* Profile settings */}
        <div>
          <h2 className="text-base font-semibold text-stone-600 dark:text-slate-300 mb-3">Sozlamalar</h2>
          <ProfileSettings
            role="STUDENT"
            firstName={student.firstName}
            lastName={student.lastName}
            yearLevel={student.yearLevel}
            groupName={student.groupName}
          />
        </div>

        {/* Knowledge state per course */}
        {student.enrollments.map((enrollment) => {
          const topics = enrollment.course.topics;
          if (topics.length === 0) return null;
          return (
            <div key={enrollment.courseId} className="rounded-xl border border-stone-200 dark:border-white/8 bg-white dark:bg-[#17130E] overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-200 dark:border-white/8">
                <h3 className="font-semibold text-stone-700 dark:text-slate-200">{enrollment.course.title}</h3>
              </div>
              <div className="p-5 space-y-3">
                {topics.map((topic) => {
                  const knowledge = topic.learnerKnowledge[0];
                  const mastery = knowledge?.masteryScore ?? 0;
                  return (
                    <div key={topic.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500 dark:text-slate-400 truncate flex-1 mr-2">{topic.title}</span>
                        {mastery > 0 ? (
                          <MasteryBadge score={mastery} />
                        ) : (
                          <span className="text-xs text-stone-400 dark:text-slate-700">Boshlanmagan</span>
                        )}
                      </div>
                      <div className="h-1 bg-stone-200 dark:bg-[#1C1710] rounded-full overflow-hidden">
                        <div className="h-full bg-[#B45309] rounded-full" style={{ width: `${mastery * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
