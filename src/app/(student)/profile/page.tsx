import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CognitiveProfileCard } from "@/components/shared/cognitive-profile-card";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { ProfileSettings } from "@/components/shared/profile-settings";
import { formatDate } from "@/lib/utils";
import { GraduationCap, BookOpen, TrendingUp, Calendar } from "lucide-react";

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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Mening profilim" description="Shaxsiy o'quv profili" />
      <main className="flex-1 p-6 space-y-6 max-w-3xl">

        {/* Student info */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <AvatarUpload
                currentUrl={student.user.avatarUrl}
                initials={initials}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-slate-900 text-lg">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-sm text-slate-500">{student.user.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{student.university.name}</Badge>
                  <Badge variant="secondary">{student.faculty.name}</Badge>
                  <Badge variant="secondary">{student.yearLevel}-kurs</Badge>
                  {student.groupName && <Badge variant="secondary">{student.groupName}</Badge>}
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 shrink-0">
                <p className="flex items-center gap-1 justify-end">
                  <Calendar className="h-3 w-3" />
                  {formatDate(student.user.createdAt)}
                </p>
                <p>Ro'yxatdan o'tgan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <BookOpen className="h-4 w-4 text-blue-600" />, label: "Kurslar", value: student.enrollments.length, bg: "bg-blue-50" },
            { icon: <TrendingUp className="h-4 w-4 text-emerald-600" />, label: "O'zlashtirildi", value: masteredTopics, bg: "bg-emerald-50" },
            { icon: <GraduationCap className="h-4 w-4 text-violet-600" />, label: "Urinishlar", value: student._count.attempts, bg: "bg-violet-50" },
            { icon: <TrendingUp className="h-4 w-4 text-amber-600" />, label: "O'rtacha mastery", value: `${Math.round(avgMastery * 100)}%`, bg: "bg-amber-50" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`rounded-lg p-1.5 ${s.bg} shrink-0`}>{s.icon}</div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
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
          <Card className="border-blue-200">
            <CardContent className="p-5 flex items-center gap-4">
              <GraduationCap className="h-8 w-8 text-blue-400 shrink-0" />
              <div>
                <p className="font-medium text-slate-900">Baholash hali bajarilmagan</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Kognitiv profil yaratish uchun boshlang'ich baholashni bajaring.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile settings */}
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Sozlamalar</h2>
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
            <Card key={enrollment.courseId}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{enrollment.course.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topics.map((topic) => {
                  const knowledge = topic.learnerKnowledge[0];
                  const mastery = knowledge?.masteryScore ?? 0;
                  return (
                    <div key={topic.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700 truncate flex-1 mr-2">{topic.title}</span>
                        {mastery > 0 ? (
                          <MasteryBadge score={mastery} />
                        ) : (
                          <span className="text-xs text-slate-400">Boshlanmagan</span>
                        )}
                      </div>
                      <Progress value={mastery * 100} className="h-1" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </main>
    </div>
  );
}
