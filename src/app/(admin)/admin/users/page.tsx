import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { UserToggle } from "./user-toggle";
import { PasswordReset } from "./password-reset";
import { Brain } from "lucide-react";

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
    take: 200,
  });

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Foydalanuvchilar" description="Barcha talabalar ro'yxati" />
      <main className="flex-1 p-6 space-y-4">
        <div className="text-sm text-slate-500">
          Jami <strong className="text-slate-900">{users.length} ta talaba</strong>
          {" · "}
          <span className="text-emerald-600">{users.filter((u) => u.isActive).length} faol</span>
          {" · "}
          <span className="text-red-500">{users.filter((u) => !u.isActive).length} bloklangan</span>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Talaba</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Universitet</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Yozilgan</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Urinishlar</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Holat</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 hidden lg:table-cell">Parol</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const s = user.student;
                    const name = s ? `${s.firstName} ${s.lastName}` : user.email;
                    return (
                      <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-900 flex items-center gap-1.5">
                              {name}
                              {s?.cognitiveProfile && (
                                <span title="Assessment bajarilgan">
                                  <Brain className="h-3.5 w-3.5 text-violet-500" />
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {s?.university?.shortName && (
                              <Badge variant="secondary">{s.university.shortName}</Badge>
                            )}
                            {s?.yearLevel && (
                              <Badge variant="secondary">{s.yearLevel}-kurs</Badge>
                            )}
                            {s?.groupName && (
                              <Badge variant="secondary">{s.groupName}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                          {s?._count.enrollments ?? 0} kurs
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                          {s?._count.attempts ?? 0}
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
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
