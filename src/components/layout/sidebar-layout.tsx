"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrainUPLogo } from "@/components/ui/brainup-logo";

interface SidebarLayoutProps {
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
  userName: string;
  avatarUrl?: string | null;
  children: React.ReactNode;
  badges?: Record<string, number>;
}

export function SidebarLayout({ role, userName, avatarUrl, children, badges }: SidebarLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8F5EF] dark:bg-[#100D09]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          role={role}
          userName={userName}
          avatarUrl={avatarUrl}
          onClose={() => setMobileOpen(false)}
          badges={badges}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <div
          className="lg:hidden sticky top-0 z-10 px-4 h-14 flex items-center gap-3 shrink-0 bg-white dark:bg-[#17130E]"
          style={{ borderBottom: "1px solid rgba(28,18,8,0.07)" }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-[#F8F5EF] hover:text-[#1C1208] dark:hover:bg-amber-900/15 dark:hover:text-amber-400 transition-colors"
            aria-label="Menyuni ochish"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <BrainUPLogo size="sm" href="/" />
            <span className="font-bold text-[#1C1208] dark:text-white">BrainUP</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
