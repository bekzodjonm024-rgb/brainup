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
  GraduationCap,
  FileText,
  University,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

const studentNav: NavItem[] = [
  { href: "/dashboard",  label: "Bosh sahifa",     icon: LayoutDashboard, exact: true },
  { href: "/courses",    label: "Kurslarim",        icon: BookOpen },
  { href: "/assessment", label: "Baholash",         icon: Brain },
  { href: "/training",   label: "Kognitiv mashqlar",icon: FlaskConical },
  { href: "/retrieval",  label: "Takrorlash",       icon: RefreshCw },
  { href: "/progress",   label: "Progressim",       icon: TrendingUp },
  { href: "/profile",    label: "Profilim",         icon: UserCircle },
];

const professorNav: NavItem[] = [
  { href: "/professor/dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
  { href: "/professor/courses",   label: "Kurslar",     icon: BookOpen },
  { href: "/professor/analytics", label: "Tahlil",      icon: BarChart3 },
  { href: "/professor/pilot",     label: "Pilot",       icon: FlaskConical },
  { href: "/professor/profile",   label: "Profilim",    icon: UserCircle },
];

const adminNav: NavItem[] = [
  { href: "/admin",              label: "Dashboard",    icon: LayoutDashboard, exact: true },
  { href: "/admin/users",        label: "Talabalar",    icon: Users },
  { href: "/admin/professors",   label: "Professorlar", icon: UserCog },
  { href: "/admin/courses",      label: "Kurslar",      icon: GraduationCap },
  { href: "/admin/content",      label: "Kontent",      icon: FileText },
  { href: "/admin/analytics",    label: "Statistika",   icon: BarChart3 },
  { href: "/admin/universities", label: "Universitetlar",icon: University },
  { href: "/admin/profile",      label: "Profilim",     icon: UserCircle },
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

  const roleLabel: Record<string, string> = {
    STUDENT: "Talaba",
    PROFESSOR: "Professor",
    ADMIN: "Administrator",
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-white dark:bg-[#17130E]" style={{ borderRight: "1px solid rgba(28,18,8,0.07)" }}>

      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5" style={{ borderBottom: "1px solid rgba(28,18,8,0.07)" }}>
        <BrainUPLogo size="sm" href="/" />
        <span className="text-lg font-extrabold tracking-tight" style={{ color: "#1C1208" }}>
          <span className="dark:text-white">BrainUP</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const badge = badges?.[item.href] ?? 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "text-white shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:bg-[#F8F5EF] hover:text-[#1C1208] dark:hover:bg-amber-900/15 dark:hover:text-amber-400"
              )}
              style={active ? { background: "#1C1208", boxShadow: "0 2px 8px rgba(28,18,8,0.18)" } : {}}
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
      <div className="px-3 py-3 space-y-0.5" style={{ borderTop: "1px solid rgba(28,18,8,0.07)" }}>
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden dark:bg-amber-900/30" style={{ background: "#FEF4E7" }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold dark:text-amber-400" style={{ color: "#B45309" }}>{initial}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-stone-700 dark:text-slate-200 truncate">{userName}</p>
            <p className="text-[11px] text-stone-400 dark:text-slate-500">{roleLabel[role]}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-stone-500 dark:text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Chiqish
        </button>
      </div>
    </aside>
  );
}
