# BRAINUP UI/UX DESIGNER

Design BrainUP interfaces as a premium EdTech SaaS product.

Always establish:

- clear visual hierarchy
- predictable navigation
- strong CTA hierarchy
- consistent spacing
- readable typography
- intentional whitespace
- meaningful grouping

Before designing any page identify:

1. User
2. User goal
3. Primary action
4. Secondary actions
5. Important information
6. Supporting information

Avoid visual noise.

Every element must have a purpose.

Never add UI simply to fill empty space.

Use progressive disclosure when information is complex.

Prefer one strong interaction over many weak interactions.

---

# PAGE STRUCTURE

Every BrainUP page follows:

```
SidebarLayout
  └── Header (blue accent bar + title + optional description + optional actions)
      └── Page content (p-4 sm:p-6 lg:p-8 space-y-6)
          ├── Primary section (most important)
          ├── Secondary sections
          └── Supporting content
```

Header component:
```tsx
import { Header } from "@/components/layout/header";

<Header
  title="Kurslar"
  description="Barcha kurslaringiz"   // hidden sm:block on mobile
  actions={<Button>Yangi kurs</Button>}
/>
```

---

# NAVIGATION

### Student
Dashboard → Kurslar → Baholash → Bilim (Retrieval) → Profil

### Professor
Dashboard → Kurslar → Analitika → Pilot → Profil

### Admin
Dashboard → Foydalanuvchilar → O'qituvchilar → Kurslar → Kontent → Analitika → Universitetlar

Sidebar tokens:
- bg: `bg-slate-950`
- inactive item: `text-slate-400 hover:text-white hover:bg-slate-800`
- active item: `bg-blue-600 text-white`

---

# INFORMATION HIERARCHY

Apply this order consistently:

```
Primary information    → largest, highest contrast, most prominent position
Secondary information  → medium size, slightly muted
Supporting information → small, muted, secondary position
Optional information   → collapsed, tooltip, or on-demand
```

---

# LOADING STATES

Never show a blank screen during async operations.

```tsx
// Page-level (loading.tsx)
<div className="p-6 flex items-center justify-center min-h-[400px]">
  <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-blue-600" />
</div>

// Button loading
<button disabled={loading} aria-busy={loading}>
  {loading
    ? <span className="flex items-center gap-2">
        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        Yuklanmoqda...
      </span>
    : "Saqlash"}
</button>

// Skeleton
<div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl h-32" />
```

---

# EMPTY STATES

Empty states must communicate: what is empty, why, and what to do.

```tsx
<div className="text-center py-16">
  <Icon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
  <p className="font-medium text-slate-600 dark:text-slate-400">Hech narsa topilmadi</p>
  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Birinchi kursni qo'shing</p>
  <Button className="mt-4">Kurs yaratish</Button>
</div>
```

---

# ERROR STATES

```tsx
// Inline field error
{error && (
  <p id="field-error" role="alert" className="text-sm text-red-600 dark:text-red-400 mt-1">
    {error}
  </p>
)}

// Page error
<div className="text-center py-12">
  <p className="text-slate-500 dark:text-slate-400">Xatolik yuz berdi.</p>
  <button onClick={retry} className="mt-4 text-blue-600 hover:underline text-sm">
    Qayta urinish
  </button>
</div>
```

---

# SUCCESS FEEDBACK

No toast library. Show inline confirmation near the action.

```tsx
const [saved, setSaved] = useState(false);

const handleSave = async () => {
  await save();
  setSaved(true);
  setTimeout(() => setSaved(false), 3000);
};

{saved && (
  <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
    <CheckIcon className="h-4 w-4" /> Saqlandi
  </p>
)}
```

---

# DIALOGS

Use existing `Dialog` from `src/components/ui/dialog.tsx`.

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Sarlavha</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

---

# TABS

For mobile-scrollable tabs always use overflow pattern:

```tsx
<div className="overflow-x-auto border-b border-slate-200 dark:border-slate-700">
  <TabsList className="flex w-max">
    <TabsTrigger className="shrink-0 whitespace-nowrap" value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger className="shrink-0 whitespace-nowrap" value="tab2">Tab 2</TabsTrigger>
  </TabsList>
</div>
```

---

# DESTRUCTIVE CONFIRMATION

Never delete without inline confirmation. No modal needed.

```tsx
{confirmId === item.id ? (
  <div className="flex gap-2 items-center">
    <button onClick={() => handleDelete(item.id)}
      className="text-red-600 text-xs font-medium hover:underline">
      Ha, o'chirish
    </button>
    <button onClick={() => setConfirmId(null)}
      className="text-slate-400 text-xs hover:underline">
      Bekor
    </button>
  </div>
) : (
  <button onClick={() => setConfirmId(item.id)}
    className="text-red-600 text-xs hover:underline">
    O'chirish
  </button>
)}
```

---

# AVATAR / INITIALS

```tsx
const initials = name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(n => n[0])
  .join("")
  .toUpperCase();

// With avatarUrl: <img className="h-9 w-9 rounded-full object-cover" src={avatarUrl} />
// Without: colored circle with initials
<div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium shrink-0">
  {initials}
</div>
```

---

# SEARCH

```tsx
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
  <input
    className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Qidirish..."
    value={query}
    onChange={e => setQuery(e.target.value)}
  />
</div>
```

---

# LANGUAGE

All UI text is in **Uzbek**. Key phrases:

| Action | Label |
|--------|-------|
| Save | Saqlash |
| Cancel | Bekor qilish |
| Delete | O'chirish |
| Edit | Tahrirlash |
| Create | Yaratish |
| Loading | Yuklanmoqda... |
| Error | Xatolik yuz berdi |
| Success | Saqlandi / Muvaffaqiyatli |
| Start | Boshlash |
| Continue | Davom etish |
| Back | Orqaga |
| Next | Keyingi |
| Submit | Yuborish |

---

# ROUTE PROTECTION

- `/dashboard/*` → STUDENT only
- `/professor/*` → PROFESSOR only
- `/admin/*` → ADMIN only
- `/assessment/*` → STUDENT only
- All routes → authenticated (proxy.ts handles redirects)
