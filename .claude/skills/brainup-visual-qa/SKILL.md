# BrainUP Visual QA

Pre-commit visual and functional QA checklist. Run through this before every commit that touches UI. Catch regressions before deploy.

## Quick Check (every commit)

```
□ No TypeScript errors: npm run build (or check terminal for red squiggles)
□ Dev server running without console errors
□ Changed page loads without crash on desktop
□ Changed page loads without crash on mobile (375px width in DevTools)
□ Dark mode: toggle dark mode, no white-on-white or black-on-black text
□ Light mode: toggle light mode, all text readable
```

## Page-Level QA Checklist

### Layout
- [ ] Sidebar renders with correct active nav item highlighted
- [ ] Mobile: hamburger menu opens/closes sidebar
- [ ] Page has blue accent bar under header (via Header component)
- [ ] Header title truncates on mobile (doesn't break layout)
- [ ] No horizontal scrollbar on any viewport width
- [ ] Page has loading.tsx or Suspense (not blank on slow connections)

### Color Modes
- [ ] All text visible in light mode (no `dark:text-white` without `text-slate-900`)
- [ ] All text visible in dark mode (no `text-slate-900` without `dark:text-white`)
- [ ] Borders visible in both modes (`border-slate-200 dark:border-slate-700`)
- [ ] Backgrounds correct in both modes (`bg-white dark:bg-slate-800`)
- [ ] Badges/pills readable in both modes (bg + text both specified)
- [ ] Buttons have hover states in both modes
- [ ] Input fields visible with text in both modes
- [ ] Icons have colors in both modes

### Mobile (375px — iPhone SE)
- [ ] No content cut off horizontally
- [ ] Stat cards: 2-column grid (not 4)
- [ ] Tables: either scrollable horizontally or columns hidden
- [ ] Tabs: horizontally scrollable (no wrap)
- [ ] Buttons: large enough to tap (min 44px height)
- [ ] Text: not too small to read (min 14px / `text-sm`)
- [ ] Dialogs: fit viewport, scrollable if tall
- [ ] Images: not distorted

### Tablet (768px)
- [ ] Sidebar: still collapsed (opens on click)
- [ ] Grid adjusts appropriately (2 or 3 columns)

### Desktop (1280px)
- [ ] Sidebar: pinned and visible
- [ ] Content not stretched too wide (max-w constraint if needed)
- [ ] Tables show all relevant columns

## Component-Specific Checks

### Stat Cards
- [ ] Icon background color is role-appropriate (blue/emerald/amber/violet/red)
- [ ] Value text is `text-xl sm:text-2xl font-bold` (not too small)
- [ ] Label is `uppercase tracking-wide text-xs`

### Tables
- [ ] `th` cells are uppercase tracking-wide
- [ ] Alternating hover (not stripes — use `hover:bg-slate-50 dark:hover:bg-slate-700/50`)
- [ ] Action buttons have aria-labels
- [ ] Empty state shown when no rows
- [ ] Avatar/initials: no "Aundefined" bug (split by whitespace, filter empty)

### Forms
- [ ] Labels above inputs (not inside)
- [ ] Error state visible (red border + error text)
- [ ] Loading state on submit button (spinner + disabled)
- [ ] Success confirmation shown after save
- [ ] Cancel/reset works correctly

### Dialogs
- [ ] Opens on trigger click
- [ ] Closes on X button, Escape key, backdrop click
- [ ] Focus trapped inside dialog when open
- [ ] Mobile: doesn't overflow viewport

### Avatar / Initials
- [ ] If avatarUrl: shows circular image
- [ ] If no avatarUrl: shows initials (first letter of first name + last name)
- [ ] Initials formula: `name.split(/\s+/).filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase()`
- [ ] No "Aundefined", "undefined", "null" text

### Progress Bars
- [ ] Color matches mastery level (emerald/blue/amber/red)
- [ ] 0% shows correctly (no invisible or negative bar)
- [ ] 100% fills completely without overflow

### Badges
- [ ] Content status: DRAFT(slate) / PENDING_REVIEW(amber) / APPROVED(emerald) / REJECTED(red)
- [ ] Mastery: text + color consistent with badge colors
- [ ] Readable in both dark and light mode

## API / Data QA

### After fetching data
- [ ] Loading state while fetching (spinner or skeleton)
- [ ] Error state if fetch fails (message shown, not blank/crashed)
- [ ] Empty state if no data returned

### Forms / mutations
- [ ] Optimistic UI not needed — always wait for server confirmation
- [ ] Success: show confirmation + optionally refresh data
- [ ] Error: show specific error message (not generic "error occurred")

### Authentication checks
- [ ] API routes return 401 for unauthenticated (not 500)
- [ ] Pages redirect to /login if session expired
- [ ] Role-protected pages redirect to correct dashboard if wrong role

## Known Bugs to Watch For (historical)

1. **Initials "Aundefined" bug** — when name has multiple spaces or is undefined. Fix: `split(/\s+/).filter(Boolean)`
2. **Retrieval link bug** — `/topics/${id}/practice` vs `/retrieval/${id}?recordId=...`. Due retrievals go to retrieval, not practice.
3. **CPT color bug** — target letter X must be white, not emerald (green)
4. **RT stale state** — task components must have `key={currentTask.id}` to force remount
5. **Turbopack cache** — if 404 appears on valid route, delete `.next` folder and restart
6. **Proxy.ts image bug** — if images break after proxy changes, check matcher excludes image extensions

## Before Deploying

```bash
# 1. TypeScript check
npm run build

# 2. If schema changed
npm run db:generate
npm run db:migrate

# 3. Deploy
git add <specific files>
git commit -m "feat/fix: description"
git push origin main
vercel --prod --force
```

## Vercel Deploy Checks (after deploy)

- [ ] Visit https://brainup-ndpi.vercel.app — landing page loads
- [ ] Login as student@ndpi.uz — student dashboard loads
- [ ] Login as professor@ndpi.uz — professor dashboard loads  
- [ ] Login as admin@ndpi.uz — admin dashboard loads
- [ ] Images load (NamDPI logo, BrainUP logo, any avatars)
- [ ] No 500 errors in Vercel function logs
