# BRAINUP ACCESSIBILITY SPECIALIST

Review every interface for accessibility.

Check:

- semantic HTML
- keyboard navigation
- focus states
- contrast
- labels
- form errors
- screen-reader meaning
- touch targets
- reduced motion

Never communicate information only through color.

Never remove visible focus without replacing it with an accessible alternative.

Interactive elements must be understandable without visual context alone.

Accessibility is a product requirement, not an optional enhancement.

---

# IMPLEMENTATION REFERENCE

Accessibility requirements for BrainUP. Target: WCAG 2.1 AA compliance. These are not optional — students with disabilities are a target user group.

## Core Requirements

### 1. Keyboard Navigation
Every interactive element must be reachable and operable by keyboard:

```tsx
// Focusable elements: <a>, <button>, <input>, <select>, <textarea>
// Custom interactive elements need tabIndex and keyboard handlers

// Good: native button
<button onClick={handleClick}>Saqlash</button>

// If using div as button (avoid — use <button>):
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleClick()}
>

// Focus ring — always visible (already in Tailwind default)
// Never do: outline-none without a custom focus indicator
// OK: focus-visible:ring-2 focus-visible:ring-blue-500 (keyboard only, not mouse click)
```

### 2. Focus Indicators

```tsx
// Standard focus ring (use on all interactive elements)
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"

// On dark backgrounds
className="focus-visible:ring-offset-slate-950"

// Already applied in src/components/ui/ components — don't remove these
```

### 3. Color Contrast

Minimum ratios (WCAG AA):
- Normal text (< 18px): **4.5:1**
- Large text (≥ 18px bold or ≥ 24px): **3:1**
- UI components / icons: **3:1**

Verified combinations in BrainUP design system:
| Foreground | Background | Ratio | Pass |
|-----------|-----------|-------|------|
| `slate-900` (#0f172a) | `white` | 19.5:1 | ✓ |
| `slate-700` (#334155) | `white` | 9.7:1 | ✓ |
| `slate-500` (#64748b) | `white` | 4.6:1 | ✓ AA |
| `white` | `blue-600` (#2563eb) | 4.9:1 | ✓ |
| `slate-400` (#94a3b8) | `slate-950` (#020617) | 7.2:1 | ✓ |
| `slate-400` (#94a3b8) | `white` | 2.8:1 | ✗ — avoid for body text |

**Rule**: `text-slate-400` is only for secondary/metadata text, never for primary content.

### 4. Semantic HTML

```tsx
// Page structure
<main>          // main content area (one per page)
<nav>           // sidebar navigation
<header>        // page header
<section>       // logical sections
<article>       // standalone content pieces
<aside>         // supplementary content

// Headings hierarchy (never skip levels)
<h1>            // page title (one per page — in Header component)
<h2>            // section headings
<h3>            // sub-sections, card titles

// Lists — use ul/ol for nav and item groups
<ul role="list">
  <li><Link href="...">...</Link></li>
</ul>

// Tables — always include captions and scope
<table>
  <caption className="sr-only">Talabalar ro'yxati</caption>
  <thead>
    <tr>
      <th scope="col">Ism</th>
      <th scope="col">Email</th>
    </tr>
  </thead>
</table>
```

### 5. ARIA Labels

```tsx
// Icon-only buttons MUST have aria-label
<button aria-label="Foydalanuvchini o'chirish">
  <TrashIcon className="h-4 w-4" />
</button>

// Form inputs need labels (use htmlFor + id)
<label htmlFor="email" className="...">Email</label>
<input id="email" name="email" type="email" />

// Or aria-label if label not visible
<input aria-label="Qidirish" placeholder="Qidirish..." />

// Dialog title
<DialogTitle>Kurs tahrirlash</DialogTitle>
// Already in Dialog component

// Status messages (live regions)
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {statusMessage}
</div>

// Loading state
<button aria-busy={loading} disabled={loading}>
  {loading ? "Yuklanmoqda..." : "Saqlash"}
</button>
```

### 6. Images

```tsx
// Meaningful images — descriptive alt text in Uzbek
<Image src="/namdpi-logo.jpg" alt="NamDPI universiteti logosi" ... />

// Decorative images — empty alt
<Image src="/pattern.png" alt="" role="presentation" ... />

// Avatar with name
<Image src={avatarUrl} alt={`${firstName} ${lastName} profil rasmi`} ... />

// Icon images — if icon + text label, icon is decorative
<span aria-hidden="true"><BooksIcon /></span>
<span>Kurslar</span>
```

### 7. Forms

```tsx
// Required fields
<label htmlFor="name">
  Ism <span aria-label="majburiy" className="text-red-500">*</span>
</label>
<input
  id="name"
  required
  aria-required="true"
  aria-describedby={error ? "name-error" : undefined}
/>
{error && (
  <p id="name-error" role="alert" className="text-sm text-red-600 mt-1">
    {error}
  </p>
)}

// Error summary at top of form
<div role="alert" aria-live="assertive">
  {formErrors.length > 0 && <p>Xatoliklar bor: {formErrors.join(", ")}</p>}
</div>
```

### 8. Assessment Tasks (special considerations)

```tsx
// ReactionTime task — timed task
// Announce to screen reader when stimulus appears
<div aria-live="assertive" aria-atomic="true" className="sr-only">
  {stimulusVisible ? "Bosing!" : ""}
</div>

// DigitSpan — announce digits
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {currentDigit !== null ? `Raqam: ${currentDigit}` : ""}
</div>

// Progress in assessment
<div role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}
  aria-label={`${current} dan ${total} ta savol`}>
```

### 9. Skip Links

```tsx
// Already should be at top of SidebarLayout — add if missing
<a href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50
    bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
  Asosiy kontentga o'tish
</a>

<main id="main-content">
  {children}
</main>
```

### 10. Screen-Reader Only Text

```tsx
// Utility class for visually hidden but accessible text
className="sr-only"
// Use for: skip links, status announcements, context for icon buttons

// Pattern: visually show icon, describe for screen reader
<button>
  <EditIcon aria-hidden="true" className="h-4 w-4" />
  <span className="sr-only">Kursni tahrirlash: {courseName}</span>
</button>
```

## Reduced Motion

```tsx
// In globals.css — already should be present
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

// In Tailwind
className="motion-safe:animate-spin motion-reduce:opacity-50"
```

## Pre-Commit Accessibility Checklist

- [ ] All buttons have visible labels (text or aria-label)
- [ ] All images have appropriate alt text
- [ ] Form inputs have associated labels
- [ ] Error messages use role="alert" or aria-live
- [ ] No color-only information (always pair color with text/icon)
- [ ] Heading hierarchy is correct (h1 → h2 → h3)
- [ ] Tables have scope on th elements
- [ ] Focus is managed after dialogs open/close
- [ ] Loading states announce to screen reader (aria-busy or aria-live)
