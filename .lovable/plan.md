# Redesign EventIQ in the "Jump" Visual Language

Reskin the existing dashboard (sidebar + 5 views) to match the attached reference: a light, airy, editorial aesthetic with serif display type, a soft mint-tinted background, and charcoal/green accents. No structural or functional changes — same views, same data, same interactions.

## Visual language (from reference)

- **Background**: very light mint/cream (`#EEF3EE` app bg, `#FFFFFF` cards)
- **Surfaces**: white cards with subtle 1px border `#E3E8E3` and soft shadow
- **Text**: charcoal `#1A1F1A` headings, muted `#5C6660` body
- **Accent green** (highlight pill / chart bars): `#B8E0C2` fill, `#2F7A47` ink
- **Primary CTA**: charcoal `#0F1410` with white text, pill radius
- **Highlight**: signature green "marker" rectangle behind a key word in serif headings
- **Type**: serif display (Instrument Serif / DM Serif Display) for H1/H2/KPI numbers; Inter for UI and body
- **Radius**: 12–16px on cards, full pill on buttons
- **Density**: more whitespace than current dense Linear feel — generous padding

## Token changes (`src/styles.css`)

Swap dark tokens for the light palette above. Re-map shadcn vars (`--background`, `--card`, `--primary`, `--border`, `--muted`, etc.) and keep `@theme inline` mapping. Add `--font-display` for the serif. Load Instrument Serif via the `<link>` in `__root.tsx` alongside Inter. Update Sonner to `theme="light"`.

## Component restyle (no logic changes)

- **Sidebar** (`Sidebar.tsx`): white panel, charcoal text, green left-accent on active item, serif "EventIQ" wordmark, soft border
- **KPI cards** (Overview): serif numerals, small uppercase label, green delta chip
- **Overview headline**: add a serif H1 "Hiring intelligence for technical talent" with green highlight behind one phrase, matching the reference's marker effect (using a `<span>` with `bg-accent-green/60` and slight padding)
- **Charts** (Recharts): swap indigo `#6366F1` → green `#2F7A47`; donut palette to green/charcoal/sand tones; tooltip surface white with border
- **Status badges**: lighter pastel fills (mint, sand, blush, slate) instead of saturated dark-mode chips
- **Tables / candidate cards**: white surface, hover `bg-muted/40`, charcoal text
- **Buttons**: primary = charcoal pill; secondary = white pill with border
- **Slide panel + dialogs**: white surface, soft shadow, charcoal headings in serif
- **Reports / Recommendations**: same restyle — serif section titles, green accent for "Add to Shortlist" active state

## Files touched

- `src/styles.css` — token overhaul + serif font family
- `src/routes/__root.tsx` — add Instrument Serif `<link>`
- `src/components/eventiq/AppLayout.tsx` — Sonner `theme="light"`
- `src/components/eventiq/Sidebar.tsx` — light surface, serif wordmark
- `src/components/eventiq/StatusBadge.tsx` — pastel color map
- `src/components/eventiq/SlidePanel.tsx` — light surface
- `src/components/eventiq/views/Overview.tsx` — serif headline w/ green highlight, chart colors, KPI typography
- `src/components/eventiq/views/Events.tsx`, `Candidates.tsx`, `Reports.tsx`, `Recommendations.tsx` — serif section headings, button/card restyle
- `src/lib/eventiq/mockData.ts` — update `statusColors` to pastel set (values only; keys unchanged)

## Out of scope

No changes to navigation, state, mock data shape, or interactions. The "Jump"-style hero illustration/product mockup is not added — this is a dashboard, not a marketing page.
