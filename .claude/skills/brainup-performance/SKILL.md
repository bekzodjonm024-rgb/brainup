# BrainUP Performance

Performance patterns for BrainUP on Next.js 16 / Vercel / Neon PostgreSQL. Read before adding new data fetching, images, or heavy components.

## Core Principle

> Server components are free. Client components cost a bundle. Async I/O is the bottleneck, not JavaScript.

## Server vs Client Components

```tsx
// DEFAULT: server component — no "use client" needed
// Can fetch from DB, access session, use server-only code
export default async function CoursesPage() {
  const courses = await db.course.findMany(...);
  return <CourseList courses={courses} />;
}

// "use client" ONLY when needed:
// - useState, useEffect, useRef
// - Event handlers (onClick, onChange, etc.)
// - Browser APIs (window, localStorage)
// - Third-party client libs

// Pattern: server fetches, passes to client
// src/app/(student)/courses/page.tsx — server component
// src/components/courses/course-list.tsx — client component (for search/filter)
```

## Parallel Data Fetching

```typescript
// WRONG — sequential (slow)
const user = await db.user.findUnique(...);
const courses = await db.course.findMany(...);
const profile = await db.cognitiveProfile.findUnique(...);

// CORRECT — parallel (fast)
const [user, courses, profile] = await Promise.all([
  db.user.findUnique(...),
  db.course.findMany(...),
  db.cognitiveProfile.findUnique(...),
]);
```

## Prisma Query Optimization

```typescript
// Include only what you need — never include everything
// BAD:
db.course.findMany({ include: { topics: { include: { content: true, questions: true } }, enrollment: true } })

// GOOD — select only fields used in UI:
db.course.findMany({
  select: {
    id: true,
    name: true,
    _count: { select: { topics: true, enrollments: true } },
  },
  where: { isPublished: true },
  orderBy: { createdAt: "desc" },
  take: 20, // always paginate
})

// Use _count for counts (not .length on includes)
// Use findFirst instead of findMany + [0] when you want one record
// Use select over include when you don't need relations

// Avoid N+1: never query in a loop
// BAD:
const courses = await db.course.findMany();
for (const c of courses) {
  c.topicCount = await db.topic.count({ where: { courseId: c.id } }); // N queries!
}
// GOOD:
const courses = await db.course.findMany({ include: { _count: { select: { topics: true } } } });
```

## Next.js Caching Strategy

```typescript
// API routes — dynamic (real-time data)
export const dynamic = "force-dynamic";
// or: export const revalidate = 0;

// Pages with slowly-changing data — ISR
export const revalidate = 60; // re-generate every 60 seconds

// Static pages (landing, login)
// No export needed — Next.js static by default

// Route-level cache override in fetch (if using fetch instead of Prisma)
fetch(url, { cache: "no-store" })          // always fresh
fetch(url, { next: { revalidate: 30 } })   // 30-second cache
```

## Image Optimization

```tsx
// public/ images — always unoptimized (Vercel optimizer sometimes breaks JPGs)
<Image src="/namdpi-logo.jpg" width={40} height={40} unoptimized />

// External images — use next/image with proper sizing
<Image
  src={avatarUrl}
  alt="Avatar"
  width={40}
  height={40}
  className="rounded-full object-cover"
/>

// Don't add sizes to tiny fixed images (avatars, logos)
// Add sizes only for responsive images that fill containers
<Image src={heroImg} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
```

## Bundle Size

```tsx
// Import only what you need from lucide-react
import { BookIcon, UsersIcon } from "lucide-react"; // ✓ tree-shaken

// Lazy load heavy client components
const HeavyChart = dynamic(() => import("@/components/charts/heavy-chart"), {
  loading: () => <div className="animate-pulse h-64 bg-slate-200 rounded-xl" />,
  ssr: false, // charts often need browser APIs
});

// Dynamic imports for dialogs/modals (only load when opened)
const EditDialog = dynamic(() => import("./edit-dialog"));

// Don't import entire libraries
// BAD: import _ from "lodash"
// GOOD: import { groupBy } from "lodash/groupBy" or write the function inline
```

## Suspense Boundaries

```tsx
// Wrap client components that use useSearchParams
import { Suspense } from "react";
<Suspense fallback={<div className="animate-pulse h-8 bg-slate-200 rounded" />}>
  <ComponentUsingSearchParams />
</Suspense>

// Streaming — wrap slow sections
<Suspense fallback={<SkeletonCard />}>
  <SlowDataComponent /> {/* Next.js streams this independently */}
</Suspense>
```

## API Route Performance

```typescript
// Always validate auth first (short-circuit unauthorized early)
export async function GET(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Then validate params
  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");
  if (!topicId) return Response.json({ error: "topicId required" }, { status: 400 });

  // Then fetch
  const data = await db.learnerKnowledge.findUnique({ where: { studentId_topicId: { ... } } });
  return Response.json(data);
}
```

## Neon PostgreSQL (Connection Pooling)

```typescript
// src/lib/db/index.ts — singleton pattern
// The PrismaPg adapter uses connection pooling automatically via Neon serverless driver
// Don't create new PrismaClient per request — use the singleton

// Neon cold start: first query after inactivity can be 200-400ms
// Mitigation: use Neon's connection pooler URL (already set in DATABASE_URL)
// Pattern: SELECT 1 warm-up not needed — Prisma handles reconnect
```

## Vercel Edge vs Node.js

```typescript
// src/proxy.ts (middleware) — runs on Edge runtime
// Edge: no Prisma, no Node.js APIs, fast global distribution
// Only import: authConfig from src/lib/auth/config.ts

// API routes and pages — run on Node.js serverless (default)
// Can use Prisma, bcrypt, Node.js APIs

// NEVER import db or bcrypt in proxy.ts — it will fail
```

## Performance Checklist (before deploy)

- [ ] All DB queries use `select` or limit includes to needed fields
- [ ] Parallel `Promise.all` for multiple independent queries
- [ ] No N+1 queries (no DB calls inside loops)
- [ ] Heavy components are lazy-loaded with `dynamic()`
- [ ] Images use `unoptimized` for public files
- [ ] API routes validate auth before any DB access
- [ ] Pages that don't need client interactivity have no "use client"
- [ ] Tables paginate (use `take`/`skip` in Prisma queries)
