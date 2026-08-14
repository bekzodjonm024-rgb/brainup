import type { Metadata } from "next";
export const metadata: Metadata = { title: "Professorlar" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { AddProfessorForm } from "./add-professor-form";
import { ProfessorsTable } from "./professors-table";

export default async function AdminProfessorsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const professors = await db.user.findMany({
    where: { role: "PROFESSOR" },
    select: {
      id: true,
      email: true,
      isActive: true,
      createdAt: true,
      professor: {
        select: {
          firstName: true,
          lastName: true,
          title: true,
          _count: { select: { courses: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#F8F5EF] dark:bg-[#100D09]">
      <Header title="Professorlar" description="Professor hisoblarini boshqarish" />
      <main className="flex-1 p-6 space-y-6">
        <AddProfessorForm />
        {professors.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-stone-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Mavjud professorlar</h2>
            <ProfessorsTable professors={professors} />
          </div>
        )}
      </main>
    </div>
  );
}
