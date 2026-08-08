"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
      <Button variant="ghost" size="icon">
        <Bell className="h-4 w-4" />
      </Button>
    </header>
  );
}
