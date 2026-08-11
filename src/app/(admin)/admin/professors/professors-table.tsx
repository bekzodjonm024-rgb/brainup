"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return (
    <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0 select-none uppercase">
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
        <p className="text-sm text-slate-500">
          Jami <strong className="text-slate-900">{professors.length}</strong> professor
          {" · "}
          <span className="text-emerald-600">{activeCount} faol</span>
          {" · "}
          <span className="text-slate-400">{professors.length - activeCount} bloklangan</span>
        </p>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, email, unvon..."
            className="pl-9 h-9"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Professor</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Kurslar</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Qo'shilgan</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Holat</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => {
                const p = user.professor;
                const name = p ? `${p.firstName} ${p.lastName}` : user.email;
                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Initials name={name} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate max-w-[160px]">{name}</p>
                          {p?.title && <p className="text-xs text-slate-400">{p.title}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{user.email}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs">{p?._count.courses ?? 0} ta</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isActive ? "default" : "destructive"} className="text-xs">
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
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <UserCog className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">
                      {search ? `"${search}" bo'yicha natija topilmadi` : "Professor topilmadi"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            {filtered.length} ta {search ? `(jami ${professors.length} dan)` : "professor"}
          </div>
        )}
      </div>
    </div>
  );
}
