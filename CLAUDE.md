@AGENTS.md

# BrainUP — Claude uchun qoidalar

## Loyiha nima
BrainUP — universitetlarda adaptiv o'qitish platformasi. Pilot: NDPI Namangan.
Foydalanuvchilar: talabalar (STUDENT) va o'qituvchilar (PROFESSOR).
Maqsad: kognitiv baholash + mastery asosida moslashuvchan o'qitish.

## Texnik chegaralar
- Stack: Next.js 16, Prisma 7 (pg adapter), NextAuth v5, Tailwind v4, TypeScript, Zod v4
- DB schema 22 jadval — o'zgartirish oldidan `prisma/schema.prisma` o'qi
- Auth: faqat JWT credentials, parol yoki kalit hech qachon kodga yozma
- `src/proxy.ts` — edge runtime, faqat `authConfig` import qilinadi (DB import YO'Q)
- Yangi fayl ochishdan oldin `memory/file-map.md` tekshir — modul allaqachon bo'lishi mumkin

## Uslub qoidalari
- UI: minimal, toza, Tailwind v4 utility klasslari — murakkab animatsiya qo'shma
- Komponentlar: `src/components/ui/` da tayyor elementlar bor, avval ulardan foydalan
- Til: kod inglizcha, foydalanuvchiga ko'rinadigan matnlar inglizcha (hozircha)
- Kommentariy faqat "nima uchun" aniq bo'lmasa yoz, "nima" uchun yozma

## Ish qoidalari
- Har qanday sprint yoki katta o'zgarish oldidan **reja ko'rsat**, tasdiq so'ra
- Kichik qadam: bitta commit — bitta narsa; sprint bo'yicha yo'l: `memory/sprint-progress.md`
- Mavjud sprint holatini `memory/sprint-progress.md` dan o'qi, qayta qurishdan saqi
- Parol, `.env` qiymati, API kaliti hech qachon commitga tushmasin
