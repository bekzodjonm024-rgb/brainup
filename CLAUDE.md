@AGENTS.md

# BrainUP — Claude uchun qoidalar

## Loyiha nima
BrainUP — universitetlarda adaptiv o'qitish platformasi. Pilot: NamDPI (Namangan Davlat Pedagogika Instituti).
Foydalanuvchilar: talabalar (STUDENT), o'qituvchilar (PROFESSOR), admin (ADMIN).
Maqsad: kognitiv baholash + mastery asosida shaxsiy ta'lim yo'nalishi.
Deployed: https://brainup-ndpi.vercel.app — 9 sprint + Design Sprint tugagan.

## Texnik chegaralar
- Stack: Next.js 16, Prisma 7 (pg adapter, Neon), NextAuth v5, Tailwind v4, TypeScript, Zod v4
- DB: 22 jadval — o'zgartirishdan oldin `prisma/schema.prisma` o'qi
- Auth: faqat JWT credentials — parol yoki kalit HECH QACHON kodga yozma
- `src/proxy.ts` — edge runtime: faqat `authConfig` import, DB import YO'Q
- Middleware matcher `src/proxy.ts`: jpg/png/svg/gif/webp istisno SHART — aks holda public fayllar /login ga redirect bo'ladi
- `next/image` local fayllar: `unoptimized` prop qo'sh — `/_next/image` Vercel'da ishlamay qolishi mumkin
- Yangi fayl ochishdan oldin `memory/file-map.md` tekshir — modul allaqachon bo'lishi mumkin

## Dizayn tizimi
- Sidebar: `bg-slate-950`, active holat: `bg-blue-600`
- Auth/hero fonlar: `from-slate-900 via-blue-950 to-indigo-950`
- BrainUP logosi: **faqat** `<BrainUPLogo size="sm|md|lg" />` — `src/components/ui/brainup-logo.tsx`
- NamDPI logosi: `/public/namdpi-logo.jpg` — dark fonda `rounded-full bg-white` container ichida
- Tayyor UI komponentlar: `src/components/ui/` — avval ularni ishlat, yangi yozma
- Kommentariy faqat "nima uchun" noaniq bo'lganda; "nima" uchun yozma

## Ish qoidalari
- Sprint yoki katta o'zgarish oldidan **reja ko'rsat**, tasdiq so'ra
- Mavjud holat: `memory/sprint-progress.md` dan o'qi, qayta qurishdan saqi
- Bitta commit — bitta narsa; deploy: `git push` → `vercel --prod --force`
- Parol, `.env`, API kalit hech qachon commitga tushmasin
