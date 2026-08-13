# BRAINUP DASHBOARD DESIGNER

Design dashboards around user decisions, not data volume.

The dashboard should quickly answer:

- How am I progressing?
- What should I do now?
- What improved?
- What needs attention?

Recommended hierarchy:

1. Welcome / context
2. Current progress
3. Key cognitive indicators
4. Recommended next action
5. Learning progress
6. Recent activity
7. Achievements / milestones

Do not overwhelm users with every metric.

Metrics should always have context.

Bad:

"Processing Speed: 74"

Better:

"Processing Speed
74
+8% this month"

Best when appropriate:

"Processing Speed
74
Improving
Try today's speed practice"

Every dashboard element should either:

- inform
- guide
- motivate
- enable action

---

# IMPLEMENTATION REFERENCE

Reference for dashboard pages across all three roles. Read when building or modifying dashboard, stat cards, or overview pages.

## Dashboard Architecture

Each role has its own dashboard layout:
- **Student**: `/dashboard` → `src/app/(student)/dashboard/page.tsx`
- **Professor**: `/professor/dashboard` → `src/app/(professor)/dashboard/page.tsx`
- **Admin**: `/admin` → `src/app/(admin)/page.tsx`

All are **server components** that fetch data and pass to client sub-components.

## Stat Card Pattern (canonical)

```tsx
import { UsersIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;   // e.g. "bg-blue-50 dark:bg-blue-900/30"
  iconColor: string; // e.g. "text-blue-600 dark:text-blue-400"
  trend?: { value: string; positive: boolean }; // optional trend indicator
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 ${iconBg} rounded-lg`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
```

### Icon color mapping (use consistently)
| Metric type | iconBg | iconColor |
|-------------|--------|-----------|
| Users / students | `bg-blue-50 dark:bg-blue-900/30` | `text-blue-600 dark:text-blue-400` |
| Courses | `bg-indigo-50 dark:bg-indigo-900/30` | `text-indigo-600 dark:text-indigo-400` |
| Success / mastered | `bg-emerald-50 dark:bg-emerald-900/30` | `text-emerald-600 dark:text-emerald-400` |
| Pending / alerts | `bg-amber-50 dark:bg-amber-900/30` | `text-amber-600 dark:text-amber-400` |
| Assessment | `bg-violet-50 dark:bg-violet-900/30` | `text-violet-600 dark:text-violet-400` |
| Revenue / growth | `bg-pink-50 dark:bg-pink-900/30` | `text-pink-600 dark:text-pink-400` |

## Student Dashboard Sections

### 1. Stat Cards (top row)
```tsx
// 2 cols mobile, 4 cols desktop
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard label="Kurslar" value={enrolledCount} icon={BookIcon} ... />
  <StatCard label="O'rganilgan mavzular" value={masteredTopics} icon={CheckIcon} ... />
  <StatCard label="Qaytarish kerak" value={dueRetrievals} icon={RefreshIcon} ... />
  <StatCard label="Kognitiv ball" value={`${cogScore}%`} icon={BrainIcon} ... />
</div>
```

### 2. Adaptive "Keyingi qadam" Section
```tsx
// Calls GET /api/learning/next-action for the most recent topic
// Shows decision banner: CONTINUE / PRACTICE / RETRIEVE / etc.
<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Keyingi qadam</h3>
  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{actionMessage}</p>
  <Link href={actionHref} className="mt-3 inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
    Boshlash <ArrowRightIcon className="h-4 w-4" />
  </Link>
</div>
```

### 3. Enrolled Courses with Mastery
```tsx
// Grid of course cards, each with overall mastery progress bar
<div className="space-y-3">
  {courses.map(course => (
    <Link key={course.id} href={`/courses/${course.id}`}
      className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
      <div className="min-w-0">
        <p className="font-medium text-slate-900 dark:text-white truncate">{course.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{course.topicCount} mavzu</p>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${mastery * 100}%` }} />
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-10 text-right">
          {Math.round(mastery * 100)}%
        </span>
      </div>
    </Link>
  ))}
</div>
```

### 4. Retrieval Due List
```tsx
// Shows topics due for spaced repetition review
// Link goes to /retrieval/{topicId}?recordId={recordId} (NOT /topics/{topicId}/practice)
{dueRetrievals.map(r => (
  <Link href={`/retrieval/${r.topicId}?recordId=${r.id}`} key={r.id} ...>
    <span>{r.topic.title}</span>
    <span className="text-amber-600 text-xs">Bugun qaytarish kerak</span>
  </Link>
))}
```

### 5. Cognitive Profile Preview
```tsx
// 4 metrics as small progress bars, links to /assessment for full view
// Uses CognitiveProfileCard component
import { CognitiveProfileCard } from "@/components/shared/cognitive-profile-card";
<CognitiveProfileCard profile={cognitiveProfile} compact />
```

## Professor Dashboard Sections

### 1. Stat Cards
- Jami talabalar, Faol kurslar, Kutilayotgan kontent (PENDING_REVIEW), O'rtacha mastery

### 2. Course Overview Table
```tsx
// Each course row: name, enrolled count, avg mastery, action link
<table className="w-full">
  <thead className="bg-slate-50 dark:bg-slate-700/50">
    <tr>
      <th className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 px-4 py-3">Kurs</th>
      <th className="text-right ...">Talabalar</th>
      <th className="text-right ...">O'rt. mastery</th>
      <th className="text-right ...">Amallar</th>
    </tr>
  </thead>
</table>
```

### 3. Intervention Alerts
- Topics where many students have mastery < 0.40 → "Yordam kerak" alert card

## Admin Dashboard Sections

### 1. Stat Cards (6 cards, 2+4 grid)
- Jami foydalanuvchilar, O'qituvchilar, Talabalar, Kurslar, Kontent, Universitetlar

### 2. Recent Activity
- Last 10 events from LearningEvent table, anonymized

### 3. Quick Actions
- Foydalanuvchi qo'shish, Kurs qo'shish, Kontent moderatsiya

## Progress Bars

```tsx
// Mastery progress bar
<div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
  <div
    className={`h-2 rounded-full transition-all ${
      mastery >= 0.85 ? "bg-emerald-500" :
      mastery >= 0.60 ? "bg-blue-500" :
      mastery >= 0.40 ? "bg-amber-500" : "bg-red-500"
    }`}
    style={{ width: `${Math.round(mastery * 100)}%` }}
  />
</div>
```

## Data Fetching Pattern (Server Components)

```typescript
// In page.tsx — always fetch in server component, pass to client children
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  // session.user.profileId is the student/professor profile ID
  const profileId = session!.user.profileId;

  const [enrollments, dueRetrievals, cogProfile] = await Promise.all([
    db.enrollment.findMany({ where: { studentId: profileId }, include: { course: true } }),
    db.retrievalRecord.findMany({ where: { studentId: profileId, dueDate: { lte: new Date() } } }),
    db.cognitiveProfile.findUnique({ where: { studentId: profileId } }),
  ]);

  return <DashboardClient enrollments={enrollments} dueRetrievals={dueRetrievals} cogProfile={cogProfile} />;
}
```
