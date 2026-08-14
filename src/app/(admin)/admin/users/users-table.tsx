"use client";

import { useState, useMemo } from "react";
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
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : name.slice(0, 2);
  return (
    <div className="h-8 w-8 rounded-full bg-[#FEF4E7]/10 border border-[#B45309]/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 select-none uppercase">
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
                  ? "bg-[#B45309] text-white"
                  : "bg-slate-100 dark:bg-[#1C1710] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 text-xs ${filter === f.key ? "text-blue-200" : "text-slate-400 dark:text-slate-600"}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, email, guruh..."
            className="w-full pl-9 pr-3 h-9 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1C1710] text-slate-900 dark:text-slate-200 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#B45309] transition-colors"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#17130E] border-b border-slate-200 dark:border-white/8">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-600 text-xs uppercase tracking-wide">Talaba</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Guruh</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Kurslar</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Urinishlar</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-600 text-xs uppercase tracking-wide hidden lg:table-cell">Ro&apos;yxatdan</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-600 text-xs uppercase tracking-wide">Holat</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-600 uppercase tracking-wide text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-[#f8faff] dark:bg-[#100D09]">
              {filtered.map((user) => {
                const s = user.student;
                const name = s ? `${s.firstName} ${s.lastName}` : user.email;
                return (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Initials name={name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[140px]">{name}</p>
                            {s?.cognitiveProfile && (
                              <span title="Baholash bajarilgan">
                                <Brain className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-600 truncate max-w-[160px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {s?.university?.shortName && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1C1710] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">{s.university.shortName}</span>
                        )}
                        {s?.yearLevel && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1C1710] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">{s.yearLevel}-kurs</span>
                        )}
                        {s?.groupName && (
                          <span className="text-xs text-slate-400 dark:text-slate-600">{s.groupName}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                      {s?._count.enrollments ?? 0}
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                      {s?._count.attempts ?? 0}
                    </td>
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-600 text-xs hidden lg:table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.isActive
                          ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                          : "text-red-400 bg-red-500/10 border border-red-500/20"
                      }`}>
                        {user.isActive ? "Faol" : "Bloklangan"}
                      </span>
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
                    <Users className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      {search ? `"${search}" bo&apos;yicha natija topilmadi` : "Talaba topilmadi"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#17130E] border-t border-slate-200 dark:border-white/8 text-xs text-slate-400 dark:text-slate-600">
            {filtered.length} ta {search || filter !== "all" ? `(jami ${users.length} dan)` : "talaba"}
          </div>
        )}
      </div>
    </div>
  );
}
