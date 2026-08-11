import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { AddProfessorForm } from "./add-professor-form";
import { UserToggle } from "../users/user-toggle";
import { PasswordReset } from "../users/password-reset";

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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Professorlar" description="Professor hisoblarini boshqarish" />
      <main className="flex-1 p-6 space-y-6">
        <AddProfessorForm />

        {professors.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-900 text-sm">
              Mavjud professorlar ({professors.length})
            </h2>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Professor</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Email</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Kurslar</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Qo'shilgan</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Holat</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500 hidden lg:table-cell">Parol</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {professors.map((user) => {
                      const p = user.professor;
                      const name = p ? `${p.firstName} ${p.lastName}` : user.email;
                      return (
                        <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-slate-900">{name}</p>
                              {p?.title && <p className="text-xs text-slate-400">{p.title}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{user.email}</td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <Badge variant="secondary">{p?._count.courses ?? 0} ta</Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={user.isActive ? "default" : "destructive"} className="text-xs">
                              {user.isActive ? "Faol" : "Bloklangan"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <PasswordReset userId={user.id} name={name} />
                          </td>
                          <td className="px-4 py-3">
                            <UserToggle userId={user.id} isActive={user.isActive} name={name} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
