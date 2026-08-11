"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Brain, Search, Users } from "lucide-react";
import { UserToggle } from "./user-toggle";
import { PasswordReset } from "./password-reset";
import { formatDate } from "@/lib/utils";

type User = {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  student: {
    firstName: string;
    lastName: string;
    yearLevel: number;
    groupName: string | null;
    university: { shortName: string | null } | null;
    _count: { enrollments: number; attempts: number };
    cognitiveProfile: { id: string } | null;
  } | null;
};

type FilterType = "all" | "active" | "blocked";

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : name.slice(0, 2);
  return (
    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 select-none uppercase">
      {letters}
    </div>
  );
}

export function UsersTable({ users }: { users: User[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const s = u.student;
      const name = s ? `${s.firstName} ${s.lastName}` : "";
      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (s?.groupName?.toLowerCase().includes(q) ?? false);
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && u.isActive) ||
        (filter === "blocked" && !u.isActive);
      return matchesSearch && matchesFilter;
    });
  }, [users, search, filter]);

  const activeCount = users.filter((u) => u.isActive).length;
  const blockedCount = users.length - activeCount;

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "Barchasi", count: users.length },
    { key: "active", label: "Faol", count: activeCount },
    { key: "blocked", label: "Bloklangan", count: blockedCount },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 text-xs ${filter === f.key ? "text-blue-200" : "text-slate-400"}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
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
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Kurslar</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Urinishlar</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Ro'yxatdan</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Holat</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => {
                const s = user.student;
                const name = s ? `${s.firstName} ${s.lastName}` : user.email;
                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Initials name={name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-slate-900 truncate max-w-[140px]">{name}</p>
                            {s?.cognitiveProfile && (
                              <span title="Baholash bajarilgan">
                                <Brain className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-[160px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {s?.university?.shortName && (
                          <Badge variant="secondary" className="text-xs">{s.university.shortName}</Badge>
                        )}
                        {s?.yearLevel && (
                          <Badge variant="secondary" className="text-xs">{s.yearLevel}-kurs</Badge>
                        )}
                        {s?.groupName && (
                          <span className="text-xs text-slate-500">{s.groupName}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                      {s?._count.enrollments ?? 0}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                      {s?._count.attempts ?? 0}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={user.isActive ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {user.isActive ? "Faol" : "Bloklangan"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        <PasswordReset userId={user.id} name={name} />
                        <UserToggle userId={user.id} isActive={user.isActive} name={name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">
                      {search ? `"${search}" bo'yicha natija topilmadi` : "Talaba topilmadi"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            {filtered.length} ta {search || filter !== "all" ? `(jami ${users.length} dan)` : "talaba"}
          </div>
        )}
      </div>
    </div>
  );
}
