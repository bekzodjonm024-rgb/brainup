import type { Metadata } from "next";
import { Geist, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
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
    <html
      lang="uz"
      suppressHydrationWarning
      className={`${geist.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
