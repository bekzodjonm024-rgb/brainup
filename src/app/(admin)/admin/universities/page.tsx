import type { Metadata } from "next";
export const metadata: Metadata = { title: "Universitetlar" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddUniversityForm, AddFacultyForm } from "./university-forms";

export default async function AdminUniversitiesPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const universities = await db.university.findMany({
    select: {
      id: true,
      name: true,
      shortName: true,
      city: true,
      createdAt: true,
      faculties: {
        select: { id: true, name: true, _count: { select: { students: true, courses: true } } },
        orderBy: { name: "asc" },
      },
      _count: { select: { students: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Universitetlar" description="Universitetlar va fakultetlarni boshqarish" />
      <main className="flex-1 p-6 space-y-6">
        <AddUniversityForm />

        <div className="space-y-4">
          {universities.map((uni) => (
            <Card key={uni.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{uni.name}</h3>
                      {uni.shortName && (
                        <Badge variant="secondary">{uni.shortName}</Badge>
                      )}
                      {uni.city && (
                        <span className="text-xs text-slate-400">{uni.city}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {uni._count.students} ta talaba · {uni.faculties.length} ta fakultet
                    </p>
                  </div>
                </div>

                {uni.faculties.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 space-y-1.5">
                    {uni.faculties.map((faculty) => (
                      <div key={faculty.id} className="flex items-center justify-between py-1">
                        <span className="text-sm text-slate-700">{faculty.name}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{faculty._count.students} talaba</span>
                          <span>·</span>
                          <span>{faculty._count.courses} kurs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <AddFacultyForm universityId={uni.id} universityName={uni.shortName ?? uni.name} />
              </CardContent>
            </Card>
          ))}

          {universities.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">Hech qanday universitet topilmadi</p>
          )}
        </div>
      </main>
    </div>
  );
}
