"use client";

import { ThemeSwitcher } from "@/components/ui/theme-switcher";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-6 w-0.5 rounded-full bg-blue-500 shrink-0" />
        <div className="min-w-0">
          <h1 className="f-syne text-base font-bold text-slate-900 dark:text-white leading-tight truncate">{title}</h1>
          {description && (
            <p className="hidden sm:block text-xs text-slate-500 leading-tight mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <ThemeSwitcher />
      </div>
    </header>
  );
}
