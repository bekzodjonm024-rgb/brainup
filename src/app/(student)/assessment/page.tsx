import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CognitiveProfileCard } from "@/components/shared/cognitive-profile-card";
import { StartAssessmentButton } from "./start-assessment-button";
import { Brain, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default async function AssessmentPage() {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const student = await db.student.findUnique({
    where: { id: session.user.profileId },
    include: { cognitiveProfile: true },
  });

  if (!student) redirect("/login");

  const hasProfile = !!student.cognitiveProfile;
  const inProgress = await db.assessmentSession.findFirst({
    where: { studentId: student.id, status: "IN_PROGRESS" },
  });

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Kognitiv baholash" description="Boshlang'ich baholash natijalari" />
      <main className="flex-1 p-6 max-w-2xl space-y-6">

        {hasProfile ? (
          <>
            {/* Completed state */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-emerald-900">Baholash bajarildi</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  Quyida siz ushbu topshiriqlarda ko'rsatgan natijalar keltirilgan.
                  Bu natijalar klinik tashxis emas — learning pathway'ni moslashtirish uchun ishlatiladi.
                </p>
              </div>
            </div>
            <CognitiveProfileCard
              attentionScore={student.cognitiveProfile!.attentionScore}
              workingMemoryScore={student.cognitiveProfile!.workingMemoryScore}
              processingSpeedScore={student.cognitiveProfile!.processingSpeedScore}
              memoryScore={student.cognitiveProfile!.memoryScore}
            />
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-600">
                  Bu natijalar sizning o'quv yo'nalishingizni moslashtirish uchun ishlatiladi.
                  Ular vaqt o'tishi bilan o'zgarishi mumkin va doimiy "yorliq" emas.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Pre-assessment info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-3">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Boshlang'ich baholash</h3>
                    <p className="text-sm text-slate-500">BrainUP sizning o'quv yo'nalishingizni moslashtiradi</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Davomiyligi", value: "~12 daqiqa", icon: <Clock className="h-4 w-4 text-slate-500" /> },
                    { label: "Topshiriqlar", value: "4 xil turdagi", icon: <Brain className="h-4 w-4 text-slate-500" /> },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-slate-200 p-3 flex items-center gap-2">
                      {s.icon}
                      <div>
                        <p className="text-xs text-slate-500">{s.label}</p>
                        <p className="text-sm font-medium text-slate-900">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Nima o'lchanadi:</p>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    {[
                      "Diqqat bilan bog'liq topshiriqlar",
                      "Ishchi xotira topshiriqlari",
                      "Qayta ishlash tezligi",
                      "Xotira ko'rsatkichi",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  Bu baholash klinik tashxis bermaydi. Natijalarda faqat siz ushbu topshiriqlarda
                  ko'rsatgan ko'rsatkichlar aks etadi.
                </div>
              </CardContent>
            </Card>

            {inProgress ? (
              <Button
                asChild
                className="w-full"
              >
                <a href={`/assessment/${inProgress.id}`}>Davom etish →</a>
              </Button>
            ) : (
              <StartAssessmentButton />
            )}
          </>
        )}
      </main>
    </div>
  );
}
