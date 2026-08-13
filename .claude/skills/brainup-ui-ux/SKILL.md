# BrainUP UI/UX Patterns

Interaction patterns, user flows, and UX conventions for BrainUP. Read before adding new pages or modifying user flows.

## Page Structure (every page)

```
SidebarLayout
  └── Header (blue accent bar + title + description)
      └── Page content (p-4 sm:p-6 lg:p-8 space-y-6)
          ├── Stat cards row (optional)
          ├── Main content sections
          └── Tables / lists
```

### Header Component Usage
```tsx
import { Header } from "@/components/layout/header";

<Header
  title="Kurslar"                          // required — keep short, truncates on mobile
  description="Barcha kurslaringiz"        // optional — hidden on mobile (hidden sm:block)
  actions={<Button>Yangi kurs</Button>}    // optional — right side
/>
```

## Navigation Structure

### Student Navigation
1. Dashboard (`/dashboard`) — qo'ng'iroq belgisi stat, kurslar, retrieval due
2. Kurslar (`/courses`) — enrolled + available
3. Baholash (`/assessment`) — cognitive assessment
4. Bilim (`/retrieval`) — spaced repetition queue
5. Profil (`/profile`) — avatar, info, password

### Professor Navigation
1. Dashboard (`/professor/dashboard`)
2. Kurslar (`/professor/courses`)
3. Analitika (`/professor/analytics`)
4. Pilot (`/professor/pilot`)
5. Profil (`/professor/profile`)

### Admin Navigation
1. Dashboard (`/admin`)
2. Foydalanuvchilar (`/admin/users`)
3. O'qituvchilar (`/admin/professors`)
4. Kurslar (`/admin/courses`)
5. Kontent (`/admin/content`)
6. Analitika (`/admin/analytics`)
7. Universitetlar (`/admin/universities`)

## Loading States

Always provide skeleton or spinner — never blank screen during async operations.

```tsx
// Page-level loading — use loading.tsx in Next.js App Router
// src/app/(student)/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

// Inline loading (button)
<button disabled={loading}>
  {loading ? (
    <span className="flex items-center gap-2">
      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
      Yuklanmoqda...
    </span>
  ) : "Saqlash"}
</button>

// Skeleton card
<div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl h-32" />
```

## Error States

```tsx
// Inline error message (form fields)
{error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}

// Page-level error (use error.tsx or inline)
<div className="text-center py-12">
  <p className="text-slate-500 dark:text-slate-400">Xatolik yuz berdi.</p>
  <button onClick={retry} className="mt-4 text-blue-600 hover:underline text-sm">Qayta urinish</button>
</div>

// Empty state
<div className="text-center py-12">
  <Icon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
  <p className="text-slate-500 dark:text-slate-400 font-medium">Hech narsa topilmadi</p>
  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">...</p>
</div>
```

## Dialogs / Modals

Use the existing `Dialog` component from `src/components/ui/dialog.tsx` (shadcn/ui pattern).

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Sarlavha</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

## Toast / Notifications

No toast library installed — show inline success/error messages near the action:

```tsx
const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

// After save:
setStatus("success");
setTimeout(() => setStatus("idle"), 3000);

// UI
{status === "success" && (
  <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
    <CheckIcon className="h-4 w-4" /> Saqlandi
  </p>
)}
```

## Tabs Pattern

Use existing `Tabs` from `src/components/ui/tabs.tsx`. For mobile-scrollable tabs:

```tsx
<div className="overflow-x-auto">
  <TabsList className="flex w-max min-w-full">
    <TabsTrigger className="shrink-0" value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger className="shrink-0" value="tab2">Tab 2</TabsTrigger>
  </TabsList>
</div>
```

## Confirmation Pattern

Before destructive actions (delete, block user), show inline confirm:

```tsx
const [confirmId, setConfirmId] = useState<string | null>(null);

{confirmId === item.id ? (
  <div className="flex gap-2">
    <button onClick={() => handleDelete(item.id)} className="text-red-600 text-xs hover:underline">Ha, o'chirish</button>
    <button onClick={() => setConfirmId(null)} className="text-slate-500 text-xs hover:underline">Bekor</button>
  </div>
) : (
  <button onClick={() => setConfirmId(item.id)} className="text-red-600 text-xs hover:underline">O'chirish</button>
)}
```

## Avatar / Initials Pattern

```tsx
// With avatarUrl: show image
// Without: show colored initials circle
function Avatar({ name, avatarUrl, size = "md" }: { name: string; avatarUrl?: string | null; size?: "sm" | "md" | "lg" }) {
  const sizeClass = { sm: "h-7 w-7 text-xs", md: "h-9 w-9 text-sm", lg: "h-12 w-12 text-base" }[size];
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase();

  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${sizeClass} rounded-full object-cover`} />;
  }
  return (
    <div className={`${sizeClass} rounded-full bg-blue-600 text-white flex items-center justify-center font-medium shrink-0`}>
      {initials}
    </div>
  );
}
```

## Search & Filter Pattern

```tsx
// Search input at top of list pages
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
  <input
    className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Qidirish..."
    value={query}
    onChange={e => setQuery(e.target.value)}
  />
</div>
```

## Pagination

For tables with many rows, use simple prev/next:

```tsx
<div className="flex items-center justify-between mt-4 text-sm text-slate-500 dark:text-slate-400">
  <span>{total} ta natija</span>
  <div className="flex gap-2">
    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
      className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
      Oldingi
    </button>
    <span className="px-3 py-1">Sahifa {page}</span>
    <button disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)}
      className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
      Keyingi
    </button>
  </div>
</div>
```

## Language (Uzbek UI)
All UI text is in **Uzbek**. Key translations used in the project:
- Saqlash / Bekor qilish / O'chirish
- Yuklanmoqda... / Xatolik yuz berdi
- Yangi kurs / Kurs qo'shish
- Talabalar / O'qituvchilar / Administrator
- Mastery: Boshlang'ich / O'rganmoqda / Yaxshi / Ustuvor
- Baholash / Amaliyot / Qaytarish (retrieval)
- Tasdiqlanmagan / Ko'rib chiqilmoqda / Tasdiqlangan / Rad etilgan

## Route Protection Summary
- `/dashboard/*` → STUDENT only (proxy.ts)
- `/professor/*` → PROFESSOR only
- `/admin/*` → ADMIN only
- `/assessment/*` → STUDENT only
- All others → any authenticated user
