import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CognitiveProfileCard } from "@/components/shared/cognitive-profile-card";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { ProfileSettings } from "@/components/shared/profile-settings";
import { formatDate } from "@/lib/utils";
import { GraduationCap, BookOpen, TrendingUp, Calendar, Brain } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const student = await db.student.findUnique({
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
  });

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
    <div className="flex flex-col flex-1 overflow-auto bg-white dark:bg-slate-950">
      <Header title="Mening profilim" description="Shaxsiy o'quv profili" />
      <main className="flex-1 p-6 space-y-6 max-w-3xl">

        {/* Student info */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-start gap-4">
            <AvatarUpload
              currentUrl={student.user.avatarUrl}
              initials={initials}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-slate-900 dark:text-white text-lg">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-sm text-slate-500">{student.user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {[student.university.name, student.faculty.name, `${student.yearLevel}-kurs`, student.groupName].filter(Boolean).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">{tag}</span>
                ))}
              </div>
            </div>
            <div className="text-right text-xs text-slate-400 dark:text-slate-600 shrink-0">
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
            { icon: <BookOpen className="h-5 w-5 text-blue-400" />, label: "Kurslar", value: student.enrollments.length, border: "border-blue-500/20", glow: "bg-blue-500/5", iconBg: "bg-blue-500/10" },
            { icon: <TrendingUp className="h-5 w-5 text-emerald-400" />, label: "O'zlashtirildi", value: masteredTopics, border: "border-emerald-500/20", glow: "bg-emerald-500/5", iconBg: "bg-emerald-500/10" },
            { icon: <GraduationCap className="h-5 w-5 text-violet-400" />, label: "Urinishlar", value: student._count.attempts, border: "border-violet-500/20", glow: "bg-violet-500/5", iconBg: "bg-violet-500/10" },
            { icon: <TrendingUp className="h-5 w-5 text-amber-400" />, label: "O'rtacha mastery", value: `${Math.round(avgMastery * 100)}%`, border: "border-amber-500/20", glow: "bg-amber-500/5", iconBg: "bg-amber-500/10" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border ${s.border} ${s.glow} p-5`}>
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>{s.icon}</div>
              <p className="f-syne text-2xl font-bold text-slate-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide font-medium">{s.label}</p>
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
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Brain className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-200">Baholash hali bajarilmagan</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Kognitiv profil yaratish uchun boshlang'ich baholashni bajaring.
              </p>
            </div>
          </div>
        )}

        {/* Profile settings */}
        <div>
          <h2 className="f-syne font-bold text-slate-600 dark:text-slate-300 mb-3">Sozlamalar</h2>
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
            <div key={enrollment.courseId} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">{enrollment.course.title}</h3>
              </div>
              <div className="p-5 space-y-3">
                {topics.map((topic) => {
                  const knowledge = topic.learnerKnowledge[0];
                  const mastery = knowledge?.masteryScore ?? 0;
                  return (
                    <div key={topic.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400 truncate flex-1 mr-2">{topic.title}</span>
                        {mastery > 0 ? (
                          <MasteryBadge score={mastery} />
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-700">Boshlanmagan</span>
                        )}
                      </div>
                      <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${mastery * 100}%` }} />
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
