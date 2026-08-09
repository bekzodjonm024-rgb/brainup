"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  BarChart3,
  RefreshCw,
  GraduationCap,
  LogOut,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const studentNav: NavItem[] = [
  { href: "/dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
  { href: "/courses", label: "Kurslarim", icon: BookOpen },
  { href: "/assessment", label: "Baholash", icon: Brain },
  { href: "/profile", label: "Profilim", icon: BarChart3 },
  { href: "/retrieval", label: "Takrorlash", icon: RefreshCw },
];

const professorNav: NavItem[] = [
  { href: "/professor/dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
  { href: "/professor/courses", label: "Kurslar", icon: BookOpen },
  { href: "/professor/analytics", label: "Tahlil", icon: BarChart3 },
  { href: "/professor/pilot", label: "Pilot", icon: FlaskConical },
];

interface SidebarProps {
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
  userName: string;
  onClose?: () => void;
}

export function Sidebar({ role, userName, onClose }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "PROFESSOR" ? professorNav : studentNav;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <GraduationCap className="h-7 w-7 text-blue-600" />
        <span className="text-xl font-bold text-slate-900">BrainUP</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4 space-y-1">
        <div className="px-3 py-2">
          <p className="text-xs text-slate-500">Foydalanuvchi</p>
          <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          Chiqish
        </button>
      </div>
    </aside>
  );
}
