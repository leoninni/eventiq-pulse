# EventIQ Prototype Build Plan

A self-contained, fully interactive recruiter SaaS dashboard with 5 views, hardcoded mock data, and a Linear/Vercel-style dark design system.

## Design System (src/styles.css)

Add EventIQ tokens to `@theme`:
- `--color-background: #09090B`
- `--color-sidebar: #0F0F14`
- `--color-card: #111118`
- `--color-border: #1E1E2E`
- `--color-primary: #6366F1` (indigo)
- `--color-cyan: #22D3EE`
- `--color-success: #22C55E`
- `--color-warning: #F59E0B`
- `--color-danger: #EF4444`
- `--color-foreground: #F8FAFC`
- `--color-muted: #64748B`
- Radius 8px, Inter font (loaded via `<link>` in `__root.tsx`)

Map shadcn tokens (`--background`, `--primary`, etc.) to these via `@theme inline` so existing UI primitives inherit the look.

## File Structure

```
src/
  routes/
    __root.tsx          # Inter font link, root meta
    index.tsx           # Renders <AppLayout> with view switcher
  components/eventiq/
    AppLayout.tsx       # Sidebar + main content, holds active-view state
    Sidebar.tsx         # Logo, nav items, company footer
    views/
      Overview.tsx      # KPIs, bar chart, donut, activity feed
      Events.tsx        # Table + slide-in event detail
      Candidates.tsx    # Filter bar, candidate cards, slide-in profile, email modal
      Reports.tsx       # Report card list + full-screen HackTUM report
      Recommendations.tsx
    SlidePanel.tsx      # Reusable right-slide drawer (translateX 200ms)
    StatusBadge.tsx
    KpiCard.tsx
  lib/eventiq/
    mockData.ts         # Events, candidates, mappings, activity feed
    store.ts            # Zustand store (candidate statuses, shortlist set, toasts) — keeps changes reactive across views
```

A single shared store lets the candidate-detail status dropdown update the Candidates list and Overview donut in real time, and the Recommendations shortlist persist across nav switches.

## View Switching

Single-page app: `AppLayout` holds `activeView` state ("overview" | "events" | "candidates" | "reports" | "recommendations"). Sidebar buttons set state — no routing changes, no reloads. Active item gets indigo left border + brighter text.

The HackTUM full-screen report is a sub-state inside Reports (`selectedReport` local state with a back link), not a route.

## Mock Data

All 5 events, 12 candidates, event→candidate mapping, recent activity feed, and 3 recommendations exactly per spec, in `mockData.ts`. Pipeline status counts on Overview donut derive from live candidate statuses in the store (so changes reflect immediately).

## Charts

Recharts (already supportable):
- Overview: horizontal `BarChart` (indigo bars, hover tooltip with candidates / sponsorship / cost per candidate), `PieChart` donut with legend.
- HackTUM report: small vertical `BarChart` for pipeline breakdown.

## Interactions

- Slide-in panels: fixed right drawer with `translate-x` transition (200ms), backdrop click closes.
- Candidate detail: status `Select` updates store → list badge + donut update instantly.
- Email modal: shadcn `Dialog`, pre-filled subject/body with candidate + event interpolation, Send triggers sonner success toast.
- "Add to ATS" → sonner info toast.
- "Add to Shortlist" → toggles to "✓ Shortlisted" green state, persisted in store.
- "View all candidates" inside event detail → closes drawer, switches to Candidates view with event filter preset.
- Table rows + candidate cards: `hover:bg-card/60` highlight. CODE Berlin row gets a subtle cyan left border (best cost per lead).

## Polish

- All buttons functional (toast fallback where no real action).
- Status badge color map: Interested cyan, In Review amber, Interviewed indigo, Offer Extended green, Rejected muted gray.
- Sonner `<Toaster />` mounted in root (theme=dark, position top-right).
- Sidebar fixed 220px, main content scrollable.
- Dense, data-rich spacing (Linear/Vercel feel): tight padding, small text sizes, monospaced numerics for KPIs via `tabular-nums`.

## Deliverable

After build: load app → Overview renders by default with live KPIs/charts; all 5 nav items work; candidate status changes propagate; email modal + toasts fire; shortlist toggles persist; HackTUM report fully rendered. No backend, no API calls.
