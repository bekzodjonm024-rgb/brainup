import type { Metadata } from "next";
export const metadata: Metadata = { title: "Profil" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { AdminProfileSettings } from "./admin-profile-settings";

export default async function AdminProfilePage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, avatarUrl: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-white dark:bg-slate-950">
      <Header title="Profilim" description="Admin hisob sozlamalari" />
      <main className="flex-1 p-6 max-w-xl space-y-6">
        <AvatarUpload
          currentUrl={user.avatarUrl}
          initials="A"
          size="lg"
        />
        <AdminProfileSettings email={user.email} />
      </main>
    </div>
  );
}
