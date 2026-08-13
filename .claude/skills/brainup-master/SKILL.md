# BrainUP Master Skill

You are working on **BrainUP** — an adaptive learning platform for universities, piloted at NamDPI (Namangan Davlat Pedagogika Instituti). All 9 sprints + Design Sprint are complete and deployed at https://brainup-ndpi.vercel.app.

## Stack (hard requirements — do not deviate)
- **Next.js 16** (App Router, `src/proxy.ts` not middleware.ts, async params must be awaited)
- **Prisma 7** + `PrismaPg` driver adapter + Neon PostgreSQL (no `url` in schema.prisma)
- **NextAuth v5** — JWT credentials only, faqat `authConfig` import in edge runtime
- **Tailwind v4** — `@import "tailwindcss"` syntax, `dark:` prefix for dark mode
- **TypeScript** + **Zod v4** (`z.email()` not `z.string().email()`)
- **Vercel Blob** — file uploads via `/api/upload`

## User Roles
| Role | Entry point | Key pages |
|------|------------|-----------|
| STUDENT | `/dashboard` | courses, topics, practice, assessment, retrieval, profile |
| PROFESSOR | `/professor/dashboard` | courses, analytics, pilot, profile |
| ADMIN | `/admin` | users, professors, courses, content, analytics, universities |

## Critical Code Patterns
```typescript
// Next.js 16 — params always async
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// Prisma 7 — driver adapter required
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// Tailwind v4 dark mode
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">

// useSearchParams must be in Suspense
<Suspense><ComponentUsingSearchParams /></Suspense>
```

## File System Rules
- Check `memory/file-map.md` before creating new files — module may already exist
- Check `src/components/ui/` before writing new components
- `BrainUPLogo` → always `<BrainUPLogo size="sm|md|lg" />` from `src/components/ui/brainup-logo.tsx`
- NamDPI logo → `/public/namdpi-logo.jpg` with `unoptimized` prop + `rounded-full bg-white` container
- Public images → always add `unoptimized` to `next/image`
- `src/proxy.ts` matcher must exclude image extensions

## DB Schema Key Tables
22 tables total. Most important:
- `User` — role, email, firstName, lastName, avatarUrl, researchId
- `Course`, `Topic`, `Content` (DRAFT→PENDING_REVIEW→APPROVED→REJECTED)
- `Question`, `Answer` (MCQ)
- `LearnerKnowledge` — mastery score per user/topic
- `AssessmentSession`, `CognitiveProfile`
- `PracticeAttempt`, `RetrievalRecord`
- `LearningEvent` — event log for research

## Deploy
```bash
git push origin main
vercel --prod --force
```

## Skills Available
- `/brainup-design-system` — colors, typography, spacing tokens
- `/brainup-ui-ux` — interaction patterns, user flows
- `/brainup-dashboard` — stat cards, dashboard patterns
- `/brainup-assessment` — cognitive tasks, scoring
- `/brainup-learning` — practice/retrieval/mastery engine
- `/brainup-responsive` — mobile-first breakpoints
- `/brainup-motion` — animation conventions
- `/brainup-accessibility` — a11y requirements
- `/brainup-performance` — optimization patterns
- `/brainup-visual-qa` — QA checklist before commit
