"use client";

import { ThemeSwitcher } from "@/components/ui/theme-switcher";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between bg-white dark:bg-[#17130E] px-6"
      style={{ borderBottom: "1px solid rgba(28,18,8,0.07)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-6 w-1 rounded-full shrink-0" style={{ background: "#B45309" }} />
        <div className="min-w-0">
          <h1 className="text-base font-bold text-[#1C1208] dark:text-white leading-tight truncate">{title}</h1>
          {description && (
            <p className="hidden sm:block text-xs text-stone-400 dark:text-stone-500 leading-tight mt-0.5">
              {description}
            </p>
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
