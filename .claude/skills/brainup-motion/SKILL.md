# BrainUP Motion & Animation

Animation conventions for BrainUP. No external animation library (no Framer Motion, no GSAP) — only Tailwind CSS transitions and CSS animations. Keep animations subtle and purposeful.

## Guiding Principles

1. **Purposeful** — animations communicate state change or guide attention, never decorative
2. **Fast** — default 150ms, max 300ms for UI interactions
3. **Respectful** — always honor `prefers-reduced-motion`
4. **Consistent** — same transition for same interaction type across all pages

## Transition Utilities (Tailwind)

```tsx
// Standard transition (color, border, background changes)
className="transition-colors"            // 150ms ease
className="transition-colors duration-200"

// Scale + shadow (card hover, button press)
className="transition-all duration-200"

// Opacity (show/hide overlays, loading states)
className="transition-opacity duration-150"

// Transform (sidebar slide, expand/collapse)
className="transition-transform duration-300 ease-in-out"
```

## Interactive Element Animations

### Buttons
```tsx
// Primary button
<button className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 ...">

// Secondary / outline
<button className="border hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all duration-150 ...">

// Icon button
<button className="hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg p-2 transition-colors duration-150 ...">
```

### Card Hover
```tsx
// Clickable card — subtle lift
<Link className="... hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200">

// Stat card — no hover animation (static)
// Course card in list — border color change only (no transform)
```

### Nav Items (Sidebar)
```tsx
<Link className="... hover:bg-slate-800 transition-colors duration-150">
// Active state has no animation — instant bg-blue-600
```

### BrainUP Logo
```tsx
// Already in BrainUPLogo component
<div className="hover:scale-105 transition-transform duration-200">
```

## Loading Animations

### Spinner (standard)
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-blue-600" />

// Inline small spinner (button loading)
<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />

// Large page spinner
<div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600" />
```

### Skeleton Loading
```tsx
// Card skeleton
<div className="animate-pulse space-y-4">
  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
  <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
</div>

// Table row skeleton
<div className="animate-pulse flex gap-4 py-3">
  <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-full" />
  <div className="flex-1 space-y-2">
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
  </div>
</div>
```

## Progress Bars

```tsx
// Mastery / progress bar — animated fill
<div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
  <div
    className="h-2 rounded-full transition-all duration-500 ease-out"
    style={{ width: `${percent}%` }}
  />
</div>
// Note: transition-all duration-500 for bar fill — slower than UI interactions
```

## Assessment Task Animations

### Reaction Time Task — stimulus flash
```tsx
// Stimulus appears with fade-in
<div className={`transition-opacity duration-100 ${visible ? "opacity-100" : "opacity-0"}`}>
  <div className="w-16 h-16 rounded-full bg-blue-500" />
</div>
```

### Digit Span — digit reveal
```tsx
// Each digit: fade in → hold → fade out
<div className={`transition-all duration-200 ${showing ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
  <span className="text-6xl font-bold">{digit}</span>
</div>
```

### Answer Reveal — correct/wrong flash
```tsx
// Correct answer
<div className="animate-[pulse_0.3s_ease-in-out] bg-emerald-100 dark:bg-emerald-900/30 ...">

// Wrong answer — shake
<div className="animate-[shake_0.3s_ease-in-out]">
// Define in global CSS if needed:
// @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
```

## Sidebar Mobile Open/Close

```tsx
// Already implemented in sidebar-layout.tsx
// Sidebar panel:
<div className={`
  fixed inset-y-0 left-0 z-50 w-64 bg-slate-950
  transform transition-transform duration-300 ease-in-out
  ${open ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0 lg:static lg:z-auto
`}>

// Backdrop:
<div className={`
  fixed inset-0 bg-black/50 z-40 lg:hidden
  transition-opacity duration-300
  ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
`} onClick={() => setOpen(false)} />
```

## Success / Completion Animation

```tsx
// After form save, assessment complete, etc.
// Simple: icon swap with fade
const [saved, setSaved] = useState(false);

<button onClick={async () => { await save(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
  <span className={`transition-all duration-200 ${saved ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}>
    {saved ? <CheckIcon className="text-emerald-500" /> : "Saqlash"}
  </span>
</button>
```

## Reduced Motion

```tsx
// Always add to animated elements that move (transform, position)
// Tailwind: motion-safe: and motion-reduce: prefixes
<div className="motion-safe:animate-spin motion-reduce:hidden">

// Or respect in CSS
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
// This is typically in globals.css
```

## What NOT to do

- No page transition animations (route changes are instant in Next.js App Router)
- No parallax effects
- No auto-playing animations that loop more than 3 times
- No animations on stat values (counter animations) — too distracting
- No bounce or spring physics (no Framer Motion needed)
- No full-page loading animations — use skeleton or spinner within content area
