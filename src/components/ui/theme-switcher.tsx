"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Kunduzgi rejim" : "Tungi rejim"}
      className="relative h-8 w-14 rounded-full border border-slate-700 bg-slate-800 transition-colors duration-300 hover:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      {/* Track */}
      <span
        className={`absolute inset-0.5 rounded-full transition-colors duration-300 ${
          isDark ? "bg-slate-700" : "bg-blue-100"
        }`}
      />

      {/* Icons */}
      <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Sun
          className={`h-3.5 w-3.5 transition-all duration-300 ${
            isDark ? "text-slate-600 scale-75 opacity-40" : "text-amber-500 scale-100 opacity-100"
          }`}
        />
        <Moon
          className={`h-3.5 w-3.5 transition-all duration-300 ${
            isDark ? "text-blue-400 scale-100 opacity-100" : "text-slate-400 scale-75 opacity-40"
          }`}
        />
      </span>

      {/* Thumb */}
      <span
        className={`absolute top-1 h-5 w-5 rounded-full shadow-md transition-all duration-300 ${
          isDark
            ? "left-[calc(100%-1.5rem)] bg-slate-900 border border-slate-600"
            : "left-1 bg-white border border-amber-200"
        }`}
      />
    </button>
  );
}
