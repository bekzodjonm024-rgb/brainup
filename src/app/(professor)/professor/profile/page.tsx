import type { Metadata } from "next";
export const metadata: Metadata = { title: "Profil sozlamalari" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { ProfileSettings } from "@/components/shared/profile-settings";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ProfessorProfilePage() {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const professor = await db.professor.findUnique({
    where: { id: session.user.profileId },
    include: {
      user: { select: { email: true, createdAt: true, avatarUrl: true } },
    },
  });

  if (!professor) redirect("/login");

  const initials = `${professor.firstName[0]}${professor.lastName[0]}`;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#F8F5EF] dark:bg-[#100D09]">
      <Header title="Profil sozlamalari" description="Shaxsiy ma'lumotlar va xavfsizlik" />
      <main className="flex-1 p-6 space-y-6 max-w-2xl mx-auto w-full">

        {/* Info card */}
        <div className="card-lift rounded-xl border border-stone-200 dark:border-white/8 bg-white dark:bg-[#17130E] p-5">
          <div className="flex items-start gap-4">
            <AvatarUpload
              currentUrl={professor.user.avatarUrl}
              initials={initials}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-[#1C1208] dark:text-white text-lg">
                {professor.firstName} {professor.lastName}
              </h2>
              {professor.title && (
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 mt-1">
                  {professor.title}
                </span>
              )}
              <p className="text-sm text-stone-500 mt-1">{professor.user.email}</p>
            </div>
            <div className="text-right text-xs text-stone-400 dark:text-slate-600 shrink-0">
              <p className="flex items-center gap-1 justify-end">
                <Calendar className="h-3 w-3" />
                {formatDate(professor.user.createdAt)}
              </p>
              <p>Ro'yxatdan o'tgan</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <ProfileSettings
          role="PROFESSOR"
          firstName={professor.firstName}
          lastName={professor.lastName}
          title={professor.title}
        />
      </main>
    </div>
  );
}
