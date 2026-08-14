"use client";

import { useState, useMemo } from "react";
import { Search, UserCog } from "lucide-react";
import { UserToggle } from "../users/user-toggle";
import { PasswordReset } from "../users/password-reset";
import { formatDate } from "@/lib/utils";

type Professor = {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  professor: {
    firstName: string;
    lastName: string;
    title: string | null;
    _count: { courses: number };
  } | null;
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return (
    <div className="h-8 w-8 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold shrink-0 select-none uppercase">
      {letters}
    </div>
  );
}

export function ProfessorsTable({ professors }: { professors: Professor[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return professors.filter((u) => {
      if (!q) return true;
      const p = u.professor;
      const name = p ? `${p.firstName} ${p.lastName}` : "";
      return (
        name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (p?.title?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [professors, search]);

  const activeCount = professors.filter((u) => u.isActive).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Jami <strong className="text-stone-700 dark:text-slate-200">{professors.length}</strong> professor
          {" · "}
          <span className="text-emerald-400">{activeCount} faol</span>
          {" · "}
          <span className="text-stone-400 dark:text-slate-600">{professors.length - activeCount} bloklangan</span>
        </p>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, email, unvon..."
            className="w-full pl-9 pr-3 h-9 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-[#1C1710] text-[#1C1208] dark:text-slate-200 text-sm placeholder:text-stone-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#B45309] transition-colors"
          />
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 dark:border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#17130E] border-b border-stone-200 dark:border-white/8">
                <th className="text-left px-4 py-3 font-medium text-stone-500 dark:text-slate-600 text-xs uppercase tracking-wide">Professor</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 dark:text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 dark:text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Kurslar</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 dark:text-slate-600 text-xs uppercase tracking-wide hidden lg:table-cell">Qo'shilgan</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 dark:text-slate-600 text-xs uppercase tracking-wide">Holat</th>
                <th className="px-4 py-3 text-xs font-medium text-stone-500 dark:text-slate-600 uppercase tracking-wide text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-slate-800/60 bg-[#f8faff] dark:bg-[#100D09]">
              {filtered.map((user) => {
                const p = user.professor;
                const name = p ? `${p.firstName} ${p.lastName}` : user.email;
                return (
                  <tr key={user.id} className="hover:bg-stone-50 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Initials name={name} />
                        <div className="min-w-0">
                          <p className="font-medium text-stone-700 dark:text-slate-200 truncate max-w-[160px]">{name}</p>
                          {p?.title && <p className="text-xs text-stone-400 dark:text-slate-600">{p.title}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-400 dark:text-slate-600 text-xs hidden sm:table-cell">{user.email}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-[#1C1710] border border-stone-200 dark:border-white/10 text-stone-500 dark:text-slate-400">{p?._count.courses ?? 0} ta</span>
                    </td>
                    <td className="px-4 py-3 text-stone-400 dark:text-slate-600 text-xs hidden lg:table-cell">
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
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <UserCog className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-stone-500">
                      {search ? `"${search}" bo'yicha natija topilmadi` : "Professor topilmadi"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 bg-stone-50 dark:bg-[#17130E] border-t border-stone-200 dark:border-white/8 text-xs text-stone-400 dark:text-slate-600">
            {filtered.length} ta {search ? `(jami ${professors.length} dan)` : "professor"}
          </div>
        )}
      </div>
    </div>
  );
}
