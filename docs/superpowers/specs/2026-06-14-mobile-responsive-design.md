# Mobile Responsive Design — EventIQ Pulse

**Date:** 2026-06-14  
**Approach:** Tailwind responsive prefixes (Option A)  
**Breakpoint:** `md` (768px) — below this is mobile, above is desktop

## Goal

Fix squished/clipping layouts on mobile screens while leaving all desktop layouts 100% unchanged. Every existing Tailwind class stays in place; we add `sm:`/`md:` prefixes so desktop styles only kick in at the right breakpoint.

## Constraint

Desktop layout must be pixel-identical before and after this change.

---

## Per-View Changes

### Overview (`Overview.tsx`)

- **Padding:** `p-10` → `p-4 md:p-10`
- **Heading:** `text-5xl` → `text-3xl md:text-5xl`
- **KPI grid:** `grid-cols-4` → `grid-cols-2 md:grid-cols-4`
- **Chart/funnel grid:** `grid-cols-5` → `grid-cols-1 md:grid-cols-5`; chart `col-span-3` → `col-span-1 md:col-span-3`; funnel `col-span-2` → `col-span-1 md:col-span-2`
- **Funnel label width:** `w-[90px]` → `w-[70px] md:w-[90px]`

### Events (`Events.tsx`)

- **Padding:** `p-10` → `p-4 md:p-10`
- **Table:** wrap in `<div className="overflow-x-auto">` — table scrolls horizontally on mobile, unchanged on desktop
- **Panel stats grid:** `grid-cols-4` → `grid-cols-2 md:grid-cols-4`

### Candidates (`Candidates.tsx`)

- **Padding:** `p-10` → `p-4 md:p-10`
- **Filter bar:** already `flex gap-2`; make it `flex flex-wrap gap-2` and set `<select>` to `max-w-[140px] md:max-w-none`; search input keeps `flex-1`
- **Candidate card right column:** `flex flex-col items-end gap-1.5 shrink-0` → add `max-w-[140px] md:max-w-none`; match score badge text: `text-[10px]` can truncate so wrap in `flex-col` on mobile. Or simplify: the `shrink-0` needs to go, replaced with `shrink min-w-0`
- **"View Profile" button + event name:** keep, just ensure the right column doesn't overflow

### Reports (`Reports.tsx`)

- **Padding:** `p-8` → `p-4 md:p-8`
- **ROI comparison table:** wrap in `overflow-x-auto`
- **Report list event cards:** `flex items-center gap-5` → `flex flex-col md:flex-row md:items-center gap-3 md:gap-5`; stats row `flex gap-6` → `grid grid-cols-2 md:flex md:gap-6`; "View Report" button stays aligned
- **Individual report tables:** wrap in `overflow-x-auto`

### Recommendations (`Recommendations.tsx`)

- **Padding:** `p-10` → `p-4 md:p-10`
- **Card inner layout:** `flex items-start gap-5` → `flex flex-col md:flex-row md:items-start md:gap-5`
- **Match score + button column:** `flex flex-col items-end gap-3 shrink-0` → on mobile becomes a row at the bottom: `flex flex-row-reverse md:flex-col md:items-end gap-3`
- **Mini stat grid:** `grid-cols-3 max-w-xl` → `grid-cols-3` (already compact enough at 3 small cells)

### Cooperations (`Cooperations.tsx`)

- **Header padding:** `px-8 py-5` → `px-4 py-4 md:px-8 md:py-5`
- **Body padding:** `px-8 py-6` → `px-4 py-4 md:px-8 md:py-6`
- **Club browser/configurator grid:** currently uses a JS-interpolated class string (`grid gap-4 ${selectedClubId ? "grid-cols-[1fr_400px]" : "grid-cols-2"}`). This won't respond to `md:` prefixes inline. Fix: always use `grid-cols-1` on mobile by wrapping the expression — `grid gap-4 grid-cols-1 md:${selectedClubId ? "grid-cols-[1fr_400px]" : "grid-cols-2"}` — or extract to a helper that returns the full class string with mobile prefix included. Configurator panel stacks below club list on mobile.
- **Type filter row:** already `flex-wrap`, fine

### Ecosystem (`Ecosystem.tsx`)

- Likely has `p-0` / full-bleed layout for the globe — needs a quick check during implementation. If padding exists, same treatment. Globe itself is responsive via `ResponsiveContainer` / canvas sizing.

---

## What We're NOT Changing

- All desktop grid structures, widths, and spacings
- Typography scale on `md:` and above
- Component logic, data, or interactivity
- SlidePanel / modal dimensions (already have `max-w-*` caps)

---

## Breakpoint Strategy

Single breakpoint: `md` (768px). No `sm:` needed — content either fits or it doesn't, and tablet-and-up gets the full desktop layout.

---

## Testing Checklist

- [ ] Overview: KPI grid 2-col on mobile, 4-col on desktop; chart stacks above funnel
- [ ] Events: table scrolls horizontally; panel stats wrap to 2×2
- [ ] Candidates: filter bar wraps; candidate cards don't overflow viewport
- [ ] Reports: tables scroll; event list cards stack vertically on mobile
- [ ] Recommendations: recommendation cards stack; match score accessible
- [ ] Cooperations: club browser is single-column; configurator stacks below
- [ ] Ecosystem: globe fills width correctly
- [ ] All desktop layouts unchanged at ≥768px
