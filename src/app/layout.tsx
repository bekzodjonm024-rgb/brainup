import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BrainUP — Adaptiv o'qish platformasi",
    template: "%s | BrainUP",
  },
  description:
    "Kognitiv baholash va spaced repetition asosida shaxsiy ta'lim yo'nalishi. NamDPI hamkorligida.",
  keywords: ["adaptiv o'qish", "edtech", "NamDPI", "talabalar", "kognitiv baholash"],
  metadataBase: new URL("https://brainup-ndpi.vercel.app"),
  openGraph: {
    title: "BrainUP — Adaptiv o'qish platformasi",
    description:
      "Kognitiv baholash va spaced repetition asosida shaxsiy ta'lim yo'nalishi. NamDPI hamkorligida.",
    url: "https://brainup-ndpi.vercel.app",
    siteName: "BrainUP",
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrainUP — Adaptiv o'qish platformasi",
    description: "Kognitiv baholash va spaced repetition asosida shaxsiy ta'lim yo'nalishi.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50">{children}</body>
    </html>
  );
}
