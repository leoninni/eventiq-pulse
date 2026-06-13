# Event ROI Comparison

**Date:** 2026-06-13  
**Scope:** Add a cross-event ROI comparison table to the Reports list view — frontend only, mock data  
**Constraint:** No new files. No backend. No new dependencies. Changes limited to `mockData.ts` and `Reports.tsx`.

---

## Context

The Reports view currently shows per-event cards with opt-ins, pipeline, and cost-per-lead. There is no side-by-side comparison and no hires data — so a recruiter can't answer "which event is actually worth sponsoring again?" The Event ROI Comparison makes that answer immediate and visual. It is the core "money slide" for the startup demo.

---

## Data Model

### New field on `EventItem`

Add `hires: number` to the `EventItem` interface in `mockData.ts`:

```ts
export interface EventItem {
  id: string;
  name: string;
  date: string;
  shortDate: string;
  location: string;
  attendees: number;
  optIns: number;
  pipeline: number;
  sponsorship: number;
  costPerLead: number;
  hires: number;        // ← new
}
```

### Updated `events` array

All five events get a `hires` value. The numbers are chosen to tell a clear story — HackTUM wins on both volume and cost efficiency, KIT is the clear laggard:

| ID | Name | Hires | Cost/Hire (sponsorship ÷ hires) |
|---|---|---|---|
| hacktum | HackTUM 2025 | 5 | €1,600 |
| starthack | START Hack 2025 | 3 | €1,667 |
| codeberlin | CODE Berlin Hackathon | 2 | €1,750 |
| ethbuild | ETH Build Night | 1 | €2,500 |
| kithack | KIT Innovation Hack | 1 | €4,000 |

`costPerHire` is derived at render time as `Math.round(event.sponsorship / event.hires)`. It is not stored in the data.

---

## UI: Event ROI Comparison Section

A new section inserted at the top of the Reports list view (the `return` branch that is not the individual report drilldown), above the existing event cards.

### Section header

```tsx
<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
  Event ROI Comparison
</h2>
```

### Comparison table

A `<table>` with six columns: Event, Opt-ins, Pipeline, Hires, Cost/Hire, Performance.

**Columns:**
- **Event** — event name, left-aligned
- **Opt-ins** — `event.optIns`, right-aligned, tabular-nums
- **Pipeline** — `event.pipeline`, right-aligned, tabular-nums
- **Hires** — `event.hires`, right-aligned, tabular-nums
- **Cost/Hire** — `€${Math.round(event.sponsorship / event.hires).toLocaleString()}`, right-aligned, tabular-nums
- **Performance** — a horizontal bar `div`, width proportional to cost efficiency (best = 100%)

### Performance bar calculation

```ts
const bestCostPerHire = Math.min(...events.map(e => e.sponsorship / e.hires));
// For each event: barWidth = bestCostPerHire / (event.sponsorship / event.hires) * 100
// HackTUM (€1,600) → 100%, KIT (€4,000) → 40%
```

### Row styling

Three tiers based on cost/hire ranking:
- **Best** (lowest cost/hire = HackTUM): left border `border-l-2 border-[#2F7A47]`, bar color `bg-[#2F7A47]`
- **Middle** (START Hack, CODE Berlin, ETH Build Night): no border decoration, bar color `bg-[#6BAE82]`
- **Worst** (highest cost/hire = KIT): left border `border-l-2 border-[#C99A3E]`, bar color `bg-[#C99A3E]`

"Best" = `costPerHire === minCostPerHire`. "Worst" = `costPerHire === maxCostPerHire`. All others are middle.

### Table wrapper

```tsx
<div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
  <table className="w-full text-sm">
    ...
  </table>
</div>
```

Table header row: `text-xs text-muted-foreground font-medium`, `border-b border-border`, `px-4 py-2.5`.

Data rows: `border-b border-border last:border-0`, `px-4 py-3`, hover: `hover:bg-secondary/30`.

Performance bar container: fixed width (`w-32`), `bg-secondary rounded-full h-1.5`, inner bar uses calculated width and tier color.

---

## Existing Individual Report Cards

The five per-event report cards below the comparison table are unchanged. The existing `Stat` sub-component currently shows Opt-ins, Pipeline, Cost/Lead. Add `Hires` as a fourth stat to each card:

```tsx
<Stat label="Hires" value={e.hires} />
```

Inserted after the Pipeline stat, before Cost/Lead.

---

## Individual Report Drilldown (cost analysis section)

In the drilldown view (Section 3 — Cost Analysis), add one new row after "Cost per pipeline entry":

```
["Cost per hire", `€${Math.round(ev.sponsorship / ev.hires).toLocaleString()}`],
```

---

## Files Changed

| File | Change |
|---|---|
| `src/lib/eventiq/mockData.ts` | Add `hires` to `EventItem` interface; add `hires` values to all 5 events |
| `src/components/eventiq/views/Reports.tsx` | Add ROI comparison table at top of list view; add Hires stat to event cards; add cost/hire row to drilldown cost section |

No new files. No new dependencies (`recharts` is already installed but not used for this feature — pure Tailwind CSS table and bars).
