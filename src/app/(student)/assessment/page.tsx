import type { Metadata } from "next";
export const metadata: Metadata = { title: "Baholash" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { CognitiveProfileCard } from "@/components/shared/cognitive-profile-card";
import { StartAssessmentButton } from "./start-assessment-button";
import { Brain, Clock, CheckCircle2, AlertCircle, Zap, Eye, RefreshCw } from "lucide-react";

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
    <div className="flex flex-col flex-1 overflow-auto bg-[#F8F5EF] dark:bg-[#100D09]">
      <Header title="Kognitiv baholash" description="Boshlang'ich baholash natijalari" />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-5">

        {hasProfile ? (
          <>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1C1208] dark:text-white text-sm">Baholash bajarildi</h3>
                <p className="text-sm text-stone-500 mt-1">
                  Quyida siz ushbu topshiriqlarda ko&apos;rsatgan natijalar keltirilgan.
                  Bu natijalar klinik tashxis emas — learning pathway&apos;ni moslashtirish uchun ishlatiladi.
                </p>
              </div>
            </div>

            <CognitiveProfileCard
              attentionScore={student.cognitiveProfile!.attentionScore}
              workingMemoryScore={student.cognitiveProfile!.workingMemoryScore}
              processingSpeedScore={student.cognitiveProfile!.processingSpeedScore}
              memoryScore={student.cognitiveProfile!.memoryScore}
            />

            <div className="rounded-xl border border-stone-200 dark:border-white/8 bg-white dark:bg-[#17130E] p-4 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-stone-400 dark:text-slate-600 mt-0.5 shrink-0" />
              <p className="text-xs text-stone-500">
                Bu natijalar sizning o&apos;quv yo&apos;nalishingizni moslashtirish uchun ishlatiladi.
                Ular vaqt o&apos;tishi bilan o&apos;zgarishi mumkin va doimiy &quot;yorliq&quot; emas.
              </p>
            </div>

            <div className="pt-1">
              <StartAssessmentButton retake />
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-stone-200 dark:border-white/8 bg-white dark:bg-[#17130E] p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF4E7]/10 border border-[#B45309]/20 flex items-center justify-center shrink-0">
                  <Brain className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1C1208] dark:text-white">Boshlang&apos;ich baholash</h3>
                  <p className="text-sm text-stone-500 mt-0.5">BrainUP sizning o&apos;quv yo&apos;nalishingizni moslashtiradi</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Davomiyligi", value: "~12 daqiqa", icon: <Clock className="h-4 w-4 text-stone-500" /> },
                  { label: "Topshiriqlar", value: "4 xil turdagi", icon: <Brain className="h-4 w-4 text-stone-500" /> },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-stone-200 dark:border-white/8 bg-stone-50 dark:bg-slate-950 p-4 flex items-center gap-3">
                    {s.icon}
                    <div>
                      <p className="text-xs text-stone-400 dark:text-slate-600">{s.label}</p>
                      <p className="text-sm font-semibold text-stone-700 dark:text-slate-200">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-3">Nima o&apos;lchanadi</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <Eye className="h-3.5 w-3.5 text-violet-400" />,   text: "Diqqat topshiriqlari",   bg: "bg-violet-500/10 border-violet-500/20" },
                    { icon: <Brain className="h-3.5 w-3.5 text-amber-400" />,   text: "Ishchi xotira",           bg: "bg-[#FEF4E7]/10   border-[#B45309]/20" },
                    { icon: <Zap className="h-3.5 w-3.5 text-amber-400" />,    text: "Qayta ishlash tezligi",   bg: "bg-amber-500/10  border-amber-500/20" },
                    { icon: <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />, text: "Xotira ko'rsatkichi", bg: "bg-emerald-500/10 border-emerald-500/20" },
                  ].map((m) => (
                    <div key={m.text} className={`flex items-center gap-2.5 rounded-xl border p-3 ${m.bg}`}>
                      {m.icon}
                      <span className="text-xs text-stone-500 dark:text-slate-400">{m.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-stone-500">
                Bu baholash klinik tashxis bermaydi. Natijalarda faqat siz ushbu topshiriqlarda
                ko&apos;rsatgan ko&apos;rsatkichlar aks etadi.
              </div>
            </div>

            {inProgress ? (
              <Button
                asChild
                className="w-full h-11 bg-[#B45309] hover:bg-[#92400E] border-0 text-white shadow-lg shadow-[#1C1208]/12"
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
