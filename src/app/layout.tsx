import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrainUP — Adaptiv O'quv Platformasi",
  description: "BrainUP — universitet talabalari uchun individual va adaptiv ta'lim platformasi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50">{children}</body>
    </html>
  );
}
