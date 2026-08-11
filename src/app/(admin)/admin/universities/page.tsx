import type { Metadata } from "next";
export const metadata: Metadata = { title: "Universitetlar" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddUniversityForm, AddFacultyForm } from "./university-forms";
import { University, Users, BookOpen } from "lucide-react";

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
              <CardContent className="p-0">
                {/* University header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                  <div className="rounded-xl bg-blue-50 p-2.5 shrink-0">
                    <University className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{uni.name}</h3>
                      {uni.shortName && (
                        <Badge variant="secondary" className="text-xs">{uni.shortName}</Badge>
                      )}
                      {uni.city && (
                        <span className="text-xs text-slate-400">{uni.city}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {uni._count.students} talaba
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {uni.faculties.length} fakultet
                      </span>
                    </div>
                  </div>
                </div>

                {/* Faculty list */}
                {uni.faculties.length > 0 && (
                  <div className="divide-y divide-slate-50">
                    {uni.faculties.map((faculty) => (
                      <div key={faculty.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                        <span className="text-sm text-slate-700 font-medium">{faculty.name}</span>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{faculty._count.students} talaba</span>
                          <span>·</span>
                          <span>{faculty._count.courses} kurs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                  <AddFacultyForm universityId={uni.id} universityName={uni.shortName ?? uni.name} />
                </div>
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
