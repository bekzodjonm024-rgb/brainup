"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainUPLogo } from "@/components/ui/brainup-logo";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  BarChart3,
  RefreshCw,
  LogOut,
  FlaskConical,
  Users,
  UserCog,
  TrendingUp,
  UserCircle,
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
  { href: "/retrieval", label: "Takrorlash", icon: RefreshCw },
  { href: "/progress", label: "Progressim", icon: TrendingUp },
  { href: "/profile", label: "Profilim", icon: BarChart3 },
];

const professorNav: NavItem[] = [
  { href: "/professor/dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
  { href: "/professor/courses", label: "Kurslar", icon: BookOpen },
  { href: "/professor/analytics", label: "Tahlil", icon: BarChart3 },
  { href: "/professor/pilot", label: "Pilot", icon: FlaskConical },
  { href: "/professor/profile", label: "Profilim", icon: UserCircle },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
  { href: "/admin/professors", label: "Professorlar", icon: UserCog },
];

interface SidebarProps {
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
  userName: string;
  avatarUrl?: string | null;
  onClose?: () => void;
  badges?: Record<string, number>;
}

export function Sidebar({ role, userName, avatarUrl, onClose, badges }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "ADMIN" ? adminNav : role === "PROFESSOR" ? professorNav : studentNav;
  const initial = userName.charAt(0).toUpperCase();

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-950">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-800 px-5">
        <BrainUPLogo size="sm" href="/" />
        <span className="text-lg font-bold text-white">BrainUP</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const badge = badges?.[item.href] ?? 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white leading-none">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3 space-y-0.5">
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 overflow-hidden">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-slate-200">{initial}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{userName}</p>
            <p className="text-[11px] text-slate-500 capitalize">{role.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Chiqish
        </button>
      </div>
    </aside>
  );
}
