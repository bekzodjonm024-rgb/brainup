"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6">
      <div className="flex items-center gap-3">
        <div className="h-6 w-0.5 rounded-full bg-blue-500" />
        <div>
          <h1 className="f-syne text-base font-bold text-slate-900 dark:text-white leading-tight">{title}</h1>
          {description && (
            <p className="hidden sm:block text-xs text-slate-500 leading-tight mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
