# Mobile Responsive Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Tailwind `md:` responsive prefixes to all seven view files so layouts reflow correctly on mobile (< 768px) while leaving desktop layouts pixel-identical.

**Architecture:** Pure CSS change — no logic, data, or component structure changes. Every existing Tailwind class is kept; we add `md:` so the desktop style only applies at ≥ 768px, and supply a sensible mobile default. Data-dense tables get `overflow-x-auto` wrappers for horizontal scroll. Ecosystem is a special case: it uses a full-screen `h-screen` layout with a hardcoded 560px canvas, so on mobile we switch to a stacked scrollable layout and let `overflow-hidden` clip the canvas edges (globe remains interactive).

**Tech Stack:** React 18, Tailwind CSS v4, Vite (dev server: `bun run dev`). No test runner — visual verification in a browser at 375px viewport width (Chrome DevTools mobile simulation).

---

## Files Modified

- `src/components/eventiq/views/Overview.tsx` — KPI grid, chart/funnel grid, padding, heading size
- `src/components/eventiq/views/Events.tsx` — padding, table overflow, panel stats grid
- `src/components/eventiq/views/Candidates.tsx` — padding, filter bar wrapping, card right-column shrink
- `src/components/eventiq/views/Reports.tsx` — padding, table overflow, event list card stacking, stat grid
- `src/components/eventiq/views/Recommendations.tsx` — padding, card inner stacking, match score row
- `src/components/eventiq/views/Cooperations.tsx` — padding, club/configurator grid mobile handling
- `src/components/eventiq/views/Ecosystem.tsx` — layout switch from fixed-height to stacked scrollable

---

## How to Run the Dev Server

```bash
bun run dev
```

Open `http://localhost:5173`. In Chrome DevTools → Toggle device toolbar (Cmd+Shift+M) → set to 375×812 (iPhone). After each task, verify the changed view at 375px, then switch to 1280px and confirm desktop is unchanged.

---

## Task 1: Overview — responsive grid and typography

**Files:**

- Modify: `src/components/eventiq/views/Overview.tsx`

- [ ] **Step 1: Apply responsive classes**

Replace the outer wrapper, heading, KPI grid, and chart/funnel grid. The full updated `return` block of `Overview`:

```tsx
return (
  <div className="p-4 md:p-10 max-w-[1400px]">
    <div className="mb-8">
      <h1 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-tight max-w-3xl">
        Hiring intelligence for <span className="highlight-marker">technical talent</span>
      </h1>
      <p className="text-sm text-muted-foreground mt-3">
        A snapshot of every sponsored event, candidate, and follow-up across your pipeline.
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <Kpi label="Candidates captured" value="247" delta="18% vs last quarter" deltaPositive />
      <Kpi label="Events sponsored" value="5" />
      <Kpi label="In active pipeline" value="35" />
      <Kpi label="Avg cost per lead" value="€312" delta="22% vs last quarter" deltaPositive />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
      <div className="col-span-1 md:col-span-3 bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-2xl">Candidates by event</h3>
          <span className="text-xs text-muted-foreground">Opt-ins per event</span>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 30, right: 20, top: 8, bottom: 8 }}
            >
              <XAxis
                type="number"
                tick={{ fill: "#5C6660", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "#1A1F1A", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip
                cursor={{ fill: "#F4F7F4" }}
                contentStyle={tooltipStyle}
                formatter={(
                  value: number,
                  _name,
                  item: { payload?: { sponsorship: number; cpl: number } },
                ) => {
                  const p = item?.payload;
                  return [
                    `${value} candidates · €${p?.sponsorship.toLocaleString()} spent · €${p?.cpl}/lead`,
                    "",
                  ];
                }}
              />
              <Bar dataKey="candidates" fill="#2F7A47" radius={[0, 6, 6, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-2xl">Hiring funnel</h3>
          <span className="text-xs text-muted-foreground">All events · 2025</span>
        </div>
        <ConversionFunnel data={funnelData} />
      </div>
    </div>

    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-display text-2xl mb-3">Recent activity</h3>
      <div className="divide-y divide-border">
        {recentActivity.map((a) => {
          const Icon = iconMap[a.icon as keyof typeof iconMap];
          return (
            <div key={a.id} className="flex items-center gap-3 py-2.5">
              <div className="w-7 h-7 rounded-md bg-mint/50 text-mint-ink flex items-center justify-center">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 text-sm">{a.text}</div>
              <div className="text-xs text-muted-foreground">{a.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
```

Also update `ConversionFunnel` — the label column is `w-[90px]` which is tight on 375px. Change to `w-[70px] md:w-[90px]`:

```tsx
<span className="text-[11px] text-muted-foreground w-[70px] md:w-[90px] shrink-0 text-right tabular-nums">
  {stage.label}
</span>
```

- [ ] **Step 2: Visual check at 375px**

Run `bun run dev`. Open `http://localhost:5173` in Chrome. Enable DevTools mobile (375×812).

Expected on mobile:

- Heading fits in ~2 lines, no overflow
- KPI cards: 2×2 grid, all 4 cards visible
- Charts section: bar chart full width, funnel below it full width
- No horizontal scroll on the page

Expected on desktop (1280px):

- Identical to before: 4-col KPIs, 5-col grid with chart left and funnel right

- [ ] **Step 3: Commit**

```bash
git add src/components/eventiq/views/Overview.tsx
git commit -m "feat(mobile): responsive layout for Overview view"
```

---

## Task 2: Events — scrollable table and panel stats

**Files:**

- Modify: `src/components/eventiq/views/Events.tsx`

- [ ] **Step 1: Apply responsive changes**

Three changes:

**1. Outer padding:**

```tsx
<div className="p-4 md:p-10 max-w-[1400px]">
```

**2. Wrap the table in an overflow container** (add a `<div>` around the `<table>`):

```tsx
<div className="bg-card border border-border rounded-lg overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-sm">{/* ... unchanged ... */}</table>
  </div>
</div>
```

**3. Panel stats grid** (inside `SlidePanel`, the 4-stat grid):

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5">
```

- [ ] **Step 2: Visual check at 375px**

Expected on mobile:

- Events page: padding is tight but comfortable (16px)
- Table: scrolls horizontally; all columns accessible by swiping
- SlidePanel (tap "View" on any row): the 4 stat boxes appear as 2×2

Expected on desktop: table identical, stats row is 4-col

- [ ] **Step 3: Commit**

```bash
git add src/components/eventiq/views/Events.tsx
git commit -m "feat(mobile): scrollable table and responsive panel stats for Events"
```

---

## Task 3: Candidates — filter bar and card layout

**Files:**

- Modify: `src/components/eventiq/views/Candidates.tsx`

- [ ] **Step 1: Apply responsive changes**

**1. Outer padding:**

```tsx
<div className="p-4 md:p-10 max-w-[1400px]">
```

**2. Filter bar** — add `flex-wrap` and constrain the selects on mobile:

```tsx
<div className="flex flex-wrap gap-2 mb-4">
  <select
    value={eventFilter}
    onChange={(e) => setEventFilter(e.target.value)}
    className="bg-card border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary max-w-[160px] md:max-w-none"
  >
    <option value="all">All Events</option>
    {events.map((e) => (
      <option key={e.id} value={e.id}>
        {e.name}
      </option>
    ))}
  </select>
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="bg-card border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary max-w-[140px] md:max-w-none"
  >
    <option value="all">All Statuses</option>
    {statuses.map((s) => (
      <option key={s} value={s}>
        {s}
      </option>
    ))}
  </select>
  <div className="flex-1 min-w-[160px] relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search by name or skill"
      className="w-full bg-card border border-border rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-primary placeholder:text-muted-foreground"
    />
  </div>
</div>
```

**3. Candidate card right column** — remove hard `shrink-0`, let it shrink with a min-width cap:

```tsx
<div className="flex flex-col items-end gap-1.5 shrink-0 max-w-[150px] md:max-w-none">
```

- [ ] **Step 2: Visual check at 375px**

Expected on mobile:

- Filter bar: selects on row 1, search on row 2 (wraps naturally)
- Candidate cards: right column (score badge, status, "View Profile") is visible and doesn't overlap main info
- No horizontal overflow

Expected on desktop: filter bar single row, cards unchanged

- [ ] **Step 3: Commit**

```bash
git add src/components/eventiq/views/Candidates.tsx
git commit -m "feat(mobile): wrap filter bar and constrain candidate card right column"
```

---

## Task 4: Reports — table overflow and card stacking

**Files:**

- Modify: `src/components/eventiq/views/Reports.tsx`

- [ ] **Step 1: Apply responsive changes**

**1. Padding on the list view** (both `return` branches):

```tsx
<div className="p-4 md:p-8 max-w-[1100px]">
```

Apply to both the drilldown report `return` and the main list `return`.

**2. Wrap ROI comparison table in overflow** — inside `EventROIComparison`:

```tsx
<div className="bg-card border border-border rounded-lg overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-sm">{/* unchanged */}</table>
  </div>
</div>
```

**3. Event list cards** — make them stack on mobile:

```tsx
<div
  key={e.id}
  className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 hover:border-primary/30 transition-colors"
>
  <div className="w-9 h-9 rounded-md bg-primary/15 text-primary flex items-center justify-center shrink-0">
    <FileText className="w-4 h-4" />
  </div>
  <div className="flex-1 min-w-0">
    <div className="text-sm font-semibold">{e.name}</div>
    <div className="text-xs text-muted-foreground">
      {e.date} · Generated {generatedDays[e.id]} days ago
    </div>
  </div>
  <div className="grid grid-cols-2 md:flex md:gap-6 text-xs gap-3">
    <Stat label="Opt-ins" value={e.optIns} />
    <Stat label="Pipeline" value={e.pipeline} />
    <Stat label="Hires" value={e.hires} />
    <Stat label="Cost/Lead" value={`€${e.costPerLead}`} />
  </div>
  <button
    onClick={() => setOpenId(e.id)}
    className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors self-start md:self-auto"
  >
    View Report
  </button>
</div>
```

**4. Drilldown report — wrap the two `<table>` elements** (Pipeline Breakdown candidate table and Event Summary table) in `overflow-x-auto` divs:

```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">{/* unchanged */}</table>
</div>
```

- [ ] **Step 2: Visual check at 375px**

Expected on mobile:

- ROI comparison table scrolls horizontally
- Event list: each card shows icon + title/date, then 2×2 stat grid, then "View Report" button below
- Drilldown report: candidate table and summary tables scroll horizontally

Expected on desktop: identical card layout with flex row, tables unchanged

- [ ] **Step 3: Commit**

```bash
git add src/components/eventiq/views/Reports.tsx
git commit -m "feat(mobile): scrollable tables and stacking event cards in Reports"
```

---

## Task 5: Recommendations — card stacking

**Files:**

- Modify: `src/components/eventiq/views/Recommendations.tsx`

- [ ] **Step 1: Apply responsive changes**

**1. Outer padding:**

```tsx
<div className="p-4 md:p-10 max-w-[1200px]">
```

**2. Each recommendation card inner layout** — stack on mobile, row on desktop. The inner `<div className="flex items-start gap-5">` becomes:

```tsx
<div className="flex flex-col md:flex-row md:items-start md:gap-5 gap-4">
```

**3. Match score + shortlist button column** — on mobile show as a row below the text, on desktop stays as a right-side column:

```tsx
<div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0">
```

The full card inner JSX after changes (only the layout divs change, content is identical):

```tsx
<div className="flex items-start gap-5 flex-col md:flex-row">
  <div className="flex-1">
    <div className="flex items-baseline gap-3 mb-1 flex-wrap">
      <h3 className="text-base font-semibold">{r.event}</h3>
      <span className="text-xs text-muted-foreground">
        {r.date} · {r.location}
      </span>
    </div>
    <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{r.why}</p>
    <div className="grid grid-cols-3 gap-3 mt-4 max-w-xl">
      <Mini label="Predicted opt-ins" value={r.optIns} />
      <Mini label="Predicted pipeline" value={r.pipeline} />
      <Mini label="Estimated cost" value={r.cost} />
    </div>
  </div>
  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 w-full md:w-auto">
    <div className="text-left md:text-right">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Match Score</div>
      <div className="text-2xl font-semibold tabular-nums text-cyan">
        {r.matchScore}
        <span className="text-muted-foreground text-sm">/100</span>
      </div>
    </div>
    {/* shortlist button — unchanged */}
  </div>
</div>
```

- [ ] **Step 2: Visual check at 375px**

Expected on mobile:

- AI banner fits without clipping
- Each recommendation card: event name + why text full width, then match score + button in a row below
- Mini stat grid (3 cols) still fits — cells are small enough

Expected on desktop: cards show text left, match score + button column on right

- [ ] **Step 3: Commit**

```bash
git add src/components/eventiq/views/Recommendations.tsx
git commit -m "feat(mobile): stack recommendation cards on mobile"
```

---

## Task 6: Cooperations — mobile single-column layout

**Files:**

- Modify: `src/components/eventiq/views/Cooperations.tsx`

- [ ] **Step 1: Apply responsive changes**

**1. Header padding:**

```tsx
<div className="px-4 py-4 md:px-8 md:py-5 border-b border-border shrink-0">
```

**2. Body padding:**

```tsx
<div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6 space-y-8">
```

**3. Club browser / configurator grid** — the current code uses a JS-interpolated class string:

```tsx
// BEFORE:
<div className={`grid gap-4 ${selectedClubId ? "grid-cols-[1fr_400px]" : "grid-cols-2"}`}>
```

This can't have `md:` prefixes added inline. Replace with a helper that returns the full mobile+desktop class:

```tsx
// AFTER:
<div className={`grid gap-4 grid-cols-1 ${selectedClubId ? "md:grid-cols-[1fr_400px]" : "md:grid-cols-2"}`}>
```

This always gives `grid-cols-1` on mobile and the existing desktop layout on `md:+`.

**4. No other grids need changes** — the only other `grid` in the file is `grid grid-cols-1 gap-3 content-start` at line 149 (the club card list), which is already single-column on all breakpoints.

- [ ] **Step 2: Visual check at 375px**

Expected on mobile:

- Cooperations header has comfortable 16px padding
- Club browser: single-column list of club cards
- After tapping "Configure Partnership →": configurator panel stacks below the club list
- Type filter pills wrap correctly (already `flex-wrap`)

Expected on desktop: two-column layout restored (club list + configurator side-by-side)

- [ ] **Step 3: Commit**

```bash
git add src/components/eventiq/views/Cooperations.tsx
git commit -m "feat(mobile): single-column club browser on mobile for Cooperations"
```

---

## Task 7: Ecosystem — stacked scrollable layout

**Files:**

- Modify: `src/components/eventiq/views/Ecosystem.tsx`

**Note:** The globe canvas is hardcoded at 560px (`GLOBE_SIZE = 560`). On mobile, the canvas overflows its container — but the container has `overflow-hidden`, so the globe appears centered and clipped on both sides. This is acceptable: the globe is still interactive, and the right detail panel stacks below it.

- [ ] **Step 1: Apply responsive changes**

**1. Outer container** — remove the fixed-height lock on mobile:

```tsx
// BEFORE:
<div className="flex flex-col h-screen overflow-hidden">
// AFTER:
<div className="flex flex-col md:h-screen md:overflow-hidden">
```

**2. Header padding:**

```tsx
// BEFORE:
<div className="px-8 py-5 border-b border-border shrink-0">
// AFTER:
<div className="px-4 py-4 md:px-8 md:py-5 border-b border-border shrink-0">
```

**3. Inner content area** — switch from side-by-side to stacked on mobile:

```tsx
// BEFORE:
<div className="flex flex-1 min-h-0">
// AFTER:
<div className="flex flex-col md:flex-row flex-1 md:min-h-0">
```

**4. Globe container** — on mobile give it a fixed height so it doesn't collapse:

```tsx
// BEFORE:
<div className="flex-1 flex items-center justify-center bg-background relative overflow-hidden">
// AFTER:
<div className="flex-1 h-[320px] md:h-auto flex items-center justify-center bg-background relative overflow-hidden">
```

**5. Right panel** — go full-width on mobile, fixed-width on desktop, adjust border:

```tsx
// BEFORE:
<div className="w-[400px] shrink-0 border-l border-border overflow-y-auto bg-card">
// AFTER:
<div className="w-full md:w-[400px] md:shrink-0 border-t md:border-t-0 md:border-l border-border overflow-y-auto bg-card">
```

- [ ] **Step 2: Visual check at 375px**

Expected on mobile:

- Header: 16px padding
- Globe area: 320px tall, globe is centered (clipped on sides is fine), interactive
- Right detail panel: full width below the globe, scrollable
- Page scrolls vertically (no `h-screen` lock)

Expected on desktop: identical — globe fills left area, right panel is 400px pinned on the right, no scroll on the page itself

- [ ] **Step 3: Commit**

```bash
git add src/components/eventiq/views/Ecosystem.tsx
git commit -m "feat(mobile): stacked scrollable layout for Ecosystem globe view"
```

---

## Task 8: Final cross-view verification

**Files:** None modified — verification only.

- [ ] **Step 1: Full mobile pass (375px)**

Open each view in sequence at 375px. Check:

- [ ] Overview: 2×2 KPI cards, full-width charts stacked, heading fits
- [ ] Events: table scrolls, no horizontal page overflow
- [ ] Candidates: filter bar wraps, cards don't overflow viewport
- [ ] Reports: event cards stack, tables scroll
- [ ] Recommendations: cards stack, match score visible
- [ ] Cooperations: single-column clubs, configurator stacks
- [ ] Ecosystem: globe clipped but centered, right panel below

- [ ] **Step 2: Full desktop pass (1280px)**

Switch to 1280px. Verify each view is pixel-identical to before this PR.

- [ ] **Step 3: Check sidebar hamburger still works on mobile**

Tap the hamburger (top-left on mobile) → sidebar slides in → tap overlay → sidebar closes. (This was already built; just confirm nothing regressed.)
