# BRAINUP RESPONSIVE DESIGN EXPERT

Every BrainUP page must work across:

- large desktop
- laptop
- tablet
- mobile

Do not simply shrink desktop layouts.

For mobile:

- simplify
- prioritize
- stack
- reduce density
- preserve readability

Check:

- navigation
- cards
- charts
- tables
- forms
- modals
- buttons
- typography

Never allow:

- horizontal scrolling
- clipped content
- overlapping elements
- inaccessible controls

Touch targets should be comfortably usable.

Test extreme but realistic viewport widths.

---

# IMPLEMENTATION REFERENCE

Mobile-first responsive patterns for BrainUP. All pages must work on 375px (iPhone SE) through 1440px (desktop). Read before writing layout code.

## Breakpoints (Tailwind v4)

| Prefix | Min-width | Context |
|--------|-----------|---------|
| (none) | 0px | Mobile default — design mobile FIRST |
| `sm:` | 640px | Large mobile / small tablet |
| `md:` | 768px | Tablet portrait |
| `lg:` | 1024px | Tablet landscape / small desktop |
| `xl:` | 1280px | Desktop |

## Sidebar Layout Behavior

```
Mobile (< lg):
  - Sidebar hidden off-screen (translate-x-[-100%])
  - Top bar visible: bg-slate-950, BrainUPLogo left, hamburger right
  - Hamburger opens sidebar as overlay with backdrop

Desktop (≥ lg):
  - Sidebar pinned: w-64 fixed left
  - Top bar hidden
  - Content area: ml-64
```

```tsx
// The layout handles this automatically in:
// src/components/layout/sidebar-layout.tsx
// src/components/layout/sidebar.tsx

// Usage in each role's layout.tsx:
export default async function Layout({ children }) {
  // fetch session, avatarUrl
  return (
    <SidebarLayout navItems={navItems} avatarUrl={user.avatarUrl} userName={user.name}>
      {children}
    </SidebarLayout>
  );
}
```

## Page Content Container

```tsx
// Standard: always wrap page content in this
<div className="p-4 sm:p-6 lg:p-8 space-y-6">
  ...
</div>

// With max-width for readability
<div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
```

## Grid Patterns

```tsx
// Stat cards: 2 mobile, 4 desktop (most common)
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

// Feature cards: 1 → 2 → 3
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Two-column layout with sidebar
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">Main content</div>
  <div>Sidebar panel</div>
</div>

// Form: single column always (max-w-2xl)
<form className="max-w-2xl space-y-6">
```

## Tables on Mobile

Wide tables cannot fit on 375px. Use these patterns:

### Pattern 1: Hide non-critical columns
```tsx
<thead>
  <tr>
    <th>Ism</th>                                          {/* always visible */}
    <th className="hidden sm:table-cell">Email</th>      {/* ≥640px */}
    <th className="hidden md:table-cell">Guruh</th>      {/* ≥768px */}
    <th className="hidden lg:table-cell">Ro'yxatdan o'tgan</th> {/* ≥1024px */}
    <th>Amallar</th>                                      {/* always visible */}
  </tr>
</thead>
```

### Pattern 2: Horizontal scroll
```tsx
<div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
  <table className="w-full min-w-[600px]">
    ...
  </table>
</div>
```

### Pattern 3: Card list on mobile, table on desktop
```tsx
{/* Mobile: cards */}
<div className="sm:hidden space-y-3">
  {items.map(item => (
    <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">...</div>
  ))}
</div>
{/* Desktop: table */}
<div className="hidden sm:block overflow-x-auto">
  <table>...</table>
</div>
```

## Tabs on Mobile

```tsx
// Scrollable tab bar — always use this pattern
<div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
  <TabsList className="flex w-max">
    {tabs.map(tab => (
      <TabsTrigger key={tab.value} value={tab.value} className="shrink-0 whitespace-nowrap px-4 py-2">
        {tab.label}
      </TabsTrigger>
    ))}
  </TabsList>
</div>
```

## Header Title on Mobile

Long titles (topic names, course names) must not overflow the fixed `h-16` header:

```tsx
// In header.tsx — already applied
<h1 className="text-xl font-bold text-slate-900 dark:text-white truncate min-w-0">
  {title}
</h1>
// description is hidden on mobile
<p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
  {description}
</p>
```

## Stat Values on Mobile

Large numbers in stat cards can overflow on 375px:

```tsx
// Always use responsive text size for stat values
<p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
  {value}
</p>
```

## Metadata / Secondary Text on Mobile

```tsx
// Hide secondary metadata on smallest screens
<span className="hidden sm:inline text-slate-400"> • {semester}</span>
<span className="hidden sm:inline text-slate-400"> • {faculty}</span>
```

## Mobile-Friendly Buttons

```tsx
// Touch targets must be ≥ 44px tall
<button className="w-full sm:w-auto px-4 py-2.5 ..."> {/* py-2.5 = ~42px with text */}

// Icon buttons need padding
<button className="p-2 rounded-lg ..."> {/* 8px padding + 20px icon = 36px min */}

// Destructive actions: full width on mobile
<div className="flex flex-col sm:flex-row gap-2">
  <button className="flex-1">Bekor qilish</button>
  <button className="flex-1">O'chirish</button>
</div>
```

## Dialog / Modal on Mobile

```tsx
// DialogContent — max width with mobile padding
<DialogContent className="sm:max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
```

## Images on Mobile

```tsx
// Always use unoptimized for public files
<Image src="/namdpi-logo.jpg" width={40} height={40} unoptimized className="rounded-full" />

// Hero images: full-width on mobile
<div className="relative w-full h-48 sm:h-64 lg:h-80">
  <Image src="..." fill className="object-cover" />
</div>
```

## Typography Scale on Mobile

```tsx
// Page heading — smaller on mobile
<h1 className="text-2xl sm:text-3xl font-bold">

// Section heading
<h2 className="text-lg sm:text-xl font-semibold">

// Truncate long strings
<p className="truncate max-w-xs sm:max-w-none">{longString}</p>
```

## Common Mobile Bugs to Avoid

1. **Fixed header overflow** — Never use `overflow-hidden` on a parent that contains fixed children
2. **Touch targets too small** — Minimum 44×44px for all interactive elements
3. **Horizontal scroll** — Check for `min-w-0` on flex children that contain text
4. **Table overflow** — Always wrap tables in `overflow-x-auto`
5. **Tab bar overflow** — Always `overflow-x-auto` + `shrink-0` on tabs
6. **Long title wrapping** — Always `truncate` + `min-w-0` on titles in headers

## Viewport Meta (already in root layout)

```tsx
// src/app/layout.tsx — already set
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

## Testing Checklist (before commit)

- [ ] iPhone SE (375px): no horizontal scroll on any page
- [ ] All buttons: ≥ 44px touch target
- [ ] Tables: visible and usable (hide columns or scroll)
- [ ] Tabs: scrollable on mobile
- [ ] Stat cards: 2-column grid works
- [ ] Sidebar: hamburger opens/closes correctly
- [ ] Dialogs: fit within viewport, scrollable if tall
- [ ] Images: not distorted, load correctly
