"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, FileText } from "lucide-react";
import Link from "next/link";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { formatDate } from "@/lib/utils";
import { ResetAssessmentButton, RemoveStudentButton } from "./student-actions";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  yearLevel: number;
  groupName: string | null;
  user: { email: string };
  learnerKnowledge: { masteryScore: number; attempts: number; updatedAt: Date }[];
  _count: { attempts: number };
};

type Enrollment = {
  enrolledAt: Date;
  student: Student;
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return (
    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 select-none uppercase">
      {letters}
    </div>
  );
}

export function StudentsTable({
  enrollments,
  courseId,
}: {
  enrollments: Enrollment[];
  courseId: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enrollments.filter(({ student: s }) => {
      if (!q) return true;
      return (
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.user.email.toLowerCase().includes(q) ||
        (s.groupName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [enrollments, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Jami <strong className="text-slate-900">{enrollments.length}</strong> ta talaba
        </p>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, email, guruh..."
            className="pl-9 h-9"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Talaba</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Guruh</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Yozilgan</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Mastery</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Urinish</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wide">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(({ student: s, enrolledAt }) => {
                const knowledge = s.learnerKnowledge;
                const avgMastery = knowledge.length
                  ? knowledge.reduce((sum, k) => sum + k.masteryScore, 0) / knowledge.length
                  : 0;
                const name = `${s.firstName} ${s.lastName}`;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Initials name={name} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate max-w-[140px]">{name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[160px]">{s.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{s.yearLevel}-kurs</Badge>
                        {s.groupName && (
                          <span className="text-xs text-slate-500">{s.groupName}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                      {formatDate(enrolledAt)}
                    </td>
                    <td className="px-4 py-3">
                      <MasteryBadge score={avgMastery} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                      {s._count.attempts}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        <Link href={`/professor/courses/${courseId}/students/${s.id}/report`}>
                          <Button variant="ghost" size="icon"
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            title="Hisobot">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                        <ResetAssessmentButton courseId={courseId} studentId={s.id} name={name} />
                        <RemoveStudentButton courseId={courseId} studentId={s.id} name={name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">
                      {search ? `"${search}" bo'yicha talaba topilmadi` : "Hali talabalar yo'q"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            {filtered.length} ta {search ? `(jami ${enrollments.length} dan)` : "talaba"}
          </div>
        )}
      </div>
    </div>
  );
}
