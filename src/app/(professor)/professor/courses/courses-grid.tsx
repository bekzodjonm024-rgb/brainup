"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { BookOpen, Users, LayoutList, ArrowRight, Search } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string | null;
  semester: string | null;
  isActive: boolean;
  _count: { enrollments: number; topics: number };
  faculty: { name: string } | null;
};

const TABS = [
  { label: "Barchasi", value: "all" },
  { label: "Faol", value: "active" },
  { label: "Nofaol", value: "inactive" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export function CoursesGrid({ courses }: { courses: Course[] }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return courses.filter((c) => {
      const matchTab =
        tab === "all" ||
        (tab === "active" && c.isActive) ||
        (tab === "inactive" && !c.isActive);
      if (!matchTab) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        (c.description?.toLowerCase().includes(q) ?? false) ||
        (c.semester?.toLowerCase().includes(q) ?? false) ||
        (c.faculty?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [courses, search, tab]);

  const counts = useMemo(
    () => ({
      all: courses.length,
      active: courses.filter((c) => c.isActive).length,
      inactive: courses.filter((c) => !c.isActive).length,
    }),
    [courses]
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-xs ${tab === t.value ? "text-slate-500" : "text-slate-400"}`}>
                {counts[t.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kurs nomi, semester..."
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-14 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-200 mb-3" />
          {search ? (
            <p className="text-slate-500 text-sm">
              &ldquo;{search}&rdquo; bo&apos;yicha kurs topilmadi
            </p>
          ) : (
            <>
              <p className="font-medium text-slate-600 mb-1">Kurs topilmadi</p>
              <p className="text-sm text-slate-400">Filtrni o&apos;zgartiring</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((course) => (
            <Card key={course.id} className="hover:border-blue-200 transition-colors">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{course.title}</h3>
                    {!course.isActive && (
                      <Badge variant="secondary" className="text-xs">Nofaol</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <LayoutList className="h-3 w-3" />
                      {course._count.topics} mavzu
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course._count.enrollments} talaba
                    </span>
                    {course.semester && <span>{course.semester}</span>}
                    {course.faculty && <span>{course.faculty.name}</span>}
                  </div>
                  {course.description && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{course.description}</p>
                  )}
                </div>
                <Link href={`/professor/courses/${course.id}`}>
                  <Button variant="outline" size="sm">
                    Boshqarish <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          {filtered.length} ta {search || tab !== "all" ? `(jami ${courses.length} dan)` : "kurs"}
        </p>
      )}
    </div>
  );
}
