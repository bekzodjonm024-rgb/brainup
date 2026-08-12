import type { Metadata } from "next";
export const metadata: Metadata = { title: "Talabalar" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { UsersTable } from "./users-table";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const users = await db.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      email: true,
      isActive: true,
      createdAt: true,
      student: {
        select: {
          firstName: true,
          lastName: true,
          yearLevel: true,
          groupName: true,
          university: { select: { shortName: true } },
          _count: { select: { enrollments: true, attempts: true } },
          cognitiveProfile: { select: { id: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-white dark:bg-slate-950">
      <Header title="Talabalar" description="Barcha talabalar ro'yxati va boshqaruvi" />
      <main className="flex-1 p-6">
        <UsersTable users={users} />
      </main>
    </div>
  );
}
