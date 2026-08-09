"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-blue-500" />
        <div>
          <h1 className="text-base font-semibold text-slate-900 leading-tight">{title}</h1>
          {description && (
            <p className="text-xs text-slate-400 leading-tight mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
        <Bell className="h-4 w-4" />
      </Button>
    </header>
  );
}
