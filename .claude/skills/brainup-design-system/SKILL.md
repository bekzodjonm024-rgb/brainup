# BRAINUP DESIGN SYSTEM ARCHITECT

Maintain one consistent BrainUP design system.

Before creating new UI inspect existing:

- colors
- typography
- spacing
- radius
- shadows
- buttons
- inputs
- cards
- navigation
- icons

Reuse existing components whenever possible.

If a new component is needed:

1. Make it reusable.
2. Make it accessible.
3. Make it responsive.
4. Define variants.
5. Define states.
6. Avoid page-specific hacks.

Never create arbitrary visual values when a design token already exists.

Maintain consistency across the entire application.

---

# TOKEN REFERENCE

Complete design token reference for BrainUP. Never invent values outside these.

## Color Palette

### Backgrounds
| Context | Light | Dark |
|---------|-------|------|
| App background | `bg-white` / `bg-slate-50` | `bg-slate-900` |
| Sidebar | — | `bg-slate-950` |
| Card | `bg-white border border-slate-200` | `bg-slate-800 border border-slate-700` |
| Auth / Hero gradient | — | `from-slate-900 via-blue-950 to-indigo-950` |
| Hover row | `hover:bg-slate-50` | `hover:bg-slate-700/50` |
| Muted section | `bg-slate-50` | `bg-slate-800/50` |

### Brand Colors
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `blue-600` | Buttons, active sidebar, links, accents |
| Primary hover | `blue-700` | Button hover state |
| Primary light | `blue-50` | Icon backgrounds, badges |
| Primary dark | `blue-500` | Dark mode primary |
| Sidebar active | `bg-blue-600 text-white` | Active nav item |

### Semantic Colors
| Meaning | Light | Dark |
|---------|-------|------|
| Success / High mastery | `emerald-600` / `emerald-50` | `emerald-400` / `emerald-900/30` |
| Warning / Medium mastery | `amber-600` / `amber-50` | `amber-400` / `amber-900/30` |
| Danger / Low mastery / Error | `red-600` / `red-50` | `red-400` / `red-900/30` |
| Info | `blue-600` / `blue-50` | `blue-400` / `blue-900/30` |
| Neutral | `slate-600` / `slate-50` | `slate-400` / `slate-800` |

### Cognitive Profile Colors (assessment categories)
- **Attention** → `violet-600` / `violet-500` (dark)
- **Working Memory** → `blue-600` / `blue-500` (dark)
- **Processing Speed** → `amber-600` / `amber-500` (dark)
- **Recognition Memory** → `emerald-600` / `emerald-500` (dark)

### Content Status Badge Colors
- `DRAFT` → `bg-slate-100 text-slate-700`
- `PENDING_REVIEW` → `bg-amber-100 text-amber-700`
- `APPROVED` → `bg-emerald-100 text-emerald-700`
- `REJECTED` → `bg-red-100 text-red-700`

### Mastery Badge Colors
- `≥ 0.85` (Mastered) → `bg-emerald-100 text-emerald-700`
- `0.60–0.84` (Good) → `bg-blue-100 text-blue-700`
- `0.40–0.59` (Learning) → `bg-amber-100 text-amber-700`
- `< 0.40` (Beginner) → `bg-red-100 text-red-700`

## Typography

### Headings
```tsx
// Page title (in Header component)
<h1 className="text-xl font-bold text-slate-900 dark:text-white truncate min-w-0">

// Section heading
<h2 className="text-lg font-semibold text-slate-900 dark:text-white">

// Card title
<h3 className="text-base font-semibold text-slate-900 dark:text-white">

// Stat label (uppercase tracking)
<p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">

// Stat value
<p className="text-2xl font-bold text-slate-900 dark:text-white">
// Mobile-safe: text-xl sm:text-2xl
```

### Body Text
```tsx
// Primary body
<p className="text-sm text-slate-700 dark:text-slate-300">

// Muted / secondary
<p className="text-sm text-slate-500 dark:text-slate-400">

// Caption / metadata
<p className="text-xs text-slate-400 dark:text-slate-500">
```

## Spacing & Layout

### Page Container
```tsx
// Standard page wrapper (used inside sidebar layout)
<div className="p-4 sm:p-6 lg:p-8 space-y-6">
```

### Card
```tsx
<div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
```

### Stat Card
```tsx
<div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
  <div className="flex items-center justify-between mb-4">
    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    </div>
  </div>
  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">LABEL</p>
  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">42</p>
</div>
```

### Grid Layouts
```tsx
// Stat cards: 2 on mobile, 4 on desktop
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

// Content cards: 1 → 2 → 3 columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Two-column split
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

## Buttons

```tsx
// Primary
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">

// Secondary / outline
<button className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">

// Danger
<button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">

// Ghost / link-like
<button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
```

## Form Elements

```tsx
// Input
<input className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />

// Label
<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">

// Error text
<p className="text-xs text-red-600 dark:text-red-400 mt-1">
```

## Table

```tsx
<table className="w-full">
  <thead>
    <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">
    </tr>
  </thead>
  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
    </tr>
  </tbody>
</table>
```

## Badges & Pills

```tsx
// Generic badge
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">

// Role badge
// STUDENT → emerald, PROFESSOR → blue, ADMIN → violet
```

## Sidebar Layout

```tsx
// Sidebar bg
<nav className="bg-slate-950 ...">

// Nav item — inactive
<Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm">

// Nav item — active
<Link className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">
```

## Blue Accent Header Bar
```tsx
// Each page has a 4px top blue bar
<div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />
```

## Logo Usage
```tsx
// Always use the component — never raw <Image>
import { BrainUPLogo } from "@/components/ui/brainup-logo";
<BrainUPLogo size="sm" />   // 32px — sidebar top, mobile topbar
<BrainUPLogo size="md" />   // 48px — auth cards
<BrainUPLogo size="lg" />   // 64px — landing hero

// NamDPI logo — always in white container on dark bg
<div className="rounded-full bg-white p-1 w-10 h-10 flex items-center justify-center">
  <Image src="/namdpi-logo.jpg" alt="NamDPI" width={32} height={32} unoptimized />
</div>
```
