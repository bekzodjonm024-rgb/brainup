"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen } from "lucide-react";
import { CourseToggle } from "./course-toggle";
import { formatDate } from "@/lib/utils";

type Course = {
  id: string;
  title: string;
  semester: string | null;
  isActive: boolean;
  createdAt: Date;
  professor: { firstName: string; lastName: string; title: string | null };
  faculty: { name: string; university: { shortName: string | null } | null } | null;
  _count: { topics: number; enrollments: number };
};

type FilterType = "all" | "active" | "inactive";

export function CoursesTable({ courses }: { courses: Course[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return courses.filter((c) => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        `${c.professor.firstName} ${c.professor.lastName}`.toLowerCase().includes(q) ||
        (c.faculty?.name.toLowerCase().includes(q) ?? false);
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && c.isActive) ||
        (filter === "inactive" && !c.isActive);
      return matchesSearch && matchesFilter;
    });
  }, [courses, search, filter]);

  const activeCount = courses.filter((c) => c.isActive).length;

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "Barchasi", count: courses.length },
    { key: "active", label: "Faol", count: activeCount },
    { key: "inactive", label: "Nofaol", count: courses.length - activeCount },
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
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 text-xs ${filter === f.key ? "text-blue-200" : "text-slate-600"}`}>
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
            placeholder="Kurs nomi, professor..."
            className="w-full pl-9 pr-3 h-9 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800">
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Kurs</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Professor</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Fakultet</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Mavzu</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Talaba</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Holat</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wide">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((course) => {
                const profName = `${course.professor.firstName} ${course.professor.lastName}`;
                return (
                  <tr key={course.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-200">{course.title}</p>
                        {course.semester && (
                          <p className="text-xs text-slate-600">{course.semester}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div>
                        <p className="text-slate-400">{profName}</p>
                        {course.professor.title && (
                          <p className="text-xs text-slate-600">{course.professor.title}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {course.faculty?.university?.shortName && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                            {course.faculty.university.shortName}
                          </span>
                        )}
                        {course.faculty?.name && (
                          <span className="text-xs text-slate-600 max-w-[120px] truncate">{course.faculty.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{course._count.topics}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{course._count.enrollments}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        course.isActive
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : "bg-slate-800 border border-slate-700 text-slate-500"
                      }`}>
                        {course.isActive ? "Faol" : "Nofaol"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <CourseToggle courseId={course.id} isActive={course.isActive} title={course.title} />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <BookOpen className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">
                      {search ? `"${search}" bo'yicha natija topilmadi` : "Kurs topilmadi"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-600">
            {filtered.length} ta {search || filter !== "all" ? `(jami ${courses.length} dan)` : "kurs"}
          </div>
        )}
      </div>
    </div>
  );
}
