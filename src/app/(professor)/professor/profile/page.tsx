import type { Metadata } from "next";
export const metadata: Metadata = { title: "Profil sozlamalari" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Profil sozlamalari" description="Shaxsiy ma'lumotlar va xavfsizlik" />
      <main className="flex-1 p-6 space-y-6 max-w-2xl">

        {/* Info card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <AvatarUpload
                currentUrl={professor.user.avatarUrl}
                initials={initials}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-slate-900 text-lg">
                  {professor.firstName} {professor.lastName}
                </h2>
                {professor.title && (
                  <Badge variant="secondary" className="mt-1">{professor.title}</Badge>
                )}
                <p className="text-sm text-slate-500 mt-1">{professor.user.email}</p>
              </div>
              <div className="text-right text-xs text-slate-400 shrink-0">
                <p className="flex items-center gap-1 justify-end">
                  <Calendar className="h-3 w-3" />
                  {formatDate(professor.user.createdAt)}
                </p>
                <p>Ro'yxatdan o'tgan</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
