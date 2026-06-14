# Event ROI Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cross-event ROI comparison table to the Reports view showing hires, cost-per-hire, and relative performance across all sponsored events.

**Architecture:** Two files only — add `hires` to `EventItem` in `mockData.ts`, then update `Reports.tsx` in three places: add an inline `EventROIComparison` component rendered at the top of the list view, add a Hires stat to the event cards, and add a cost/hire row to the individual report drilldown.

**Tech Stack:** React, TypeScript, Tailwind CSS (no new dependencies — the comparison bars are pure CSS divs)

---

### Task 1: Add `hires` field to EventItem and populate events

**Files:**

- Modify: `src/lib/eventiq/mockData.ts`

- [ ] **Step 1: Add `hires: number` to the `EventItem` interface**

Find the existing `EventItem` interface (lines 3–14) and add `hires` as the last field:

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
  hires: number;
}
```

- [ ] **Step 2: Add `hires` values to the `events` array**

Find the `events` array and replace it with:

```ts
export const events: EventItem[] = [
  {
    id: "hacktum",
    name: "HackTUM 2025",
    date: "Apr 12, 2025",
    shortDate: "Apr 12",
    location: "Munich",
    attendees: 600,
    optIns: 89,
    pipeline: 12,
    sponsorship: 8000,
    costPerLead: 667,
    hires: 5,
  },
  {
    id: "starthack",
    name: "START Hack 2025",
    date: "Mar 1, 2025",
    shortDate: "Mar 1",
    location: "St. Gallen",
    attendees: 450,
    optIns: 61,
    pipeline: 8,
    sponsorship: 5000,
    costPerLead: 625,
    hires: 3,
  },
  {
    id: "codeberlin",
    name: "CODE Berlin Hackathon",
    date: "Feb 14, 2025",
    shortDate: "Feb 14",
    location: "Berlin",
    attendees: 280,
    optIns: 48,
    pipeline: 7,
    sponsorship: 3500,
    costPerLead: 500,
    hires: 2,
  },
  {
    id: "ethbuild",
    name: "ETH Build Night",
    date: "Jan 18, 2025",
    shortDate: "Jan 18",
    location: "Zürich",
    attendees: 190,
    optIns: 17,
    pipeline: 4,
    sponsorship: 2500,
    costPerLead: 625,
    hires: 1,
  },
  {
    id: "kithack",
    name: "KIT Innovation Hack",
    date: "Nov 22, 2024",
    shortDate: "Nov 22",
    location: "Karlsruhe",
    attendees: 240,
    optIns: 32,
    pipeline: 3,
    sponsorship: 4000,
    costPerLead: 1333,
    hires: 1,
  },
];
```

- [ ] **Step 3: Verify TypeScript is clean**

```bash
cd /Users/leoniebender/eventiq-pulse && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output (zero errors).

- [ ] **Step 4: Commit**

```bash
git add src/lib/eventiq/mockData.ts
git commit -m "feat: add hires field to EventItem and populate events"
```

---

### Task 2: Add EventROIComparison component to Reports list view

**Files:**

- Modify: `src/components/eventiq/views/Reports.tsx`

- [ ] **Step 1: Add the `EventROIComparison` function at the bottom of the file**

The file currently ends with the `Section` and `Stat` helper functions. Add `EventROIComparison` after `Stat`:

```tsx
function EventROIComparison({ evs }: { evs: EventItem[] }) {
  const withCost = evs.map((e) => ({
    ...e,
    costPerHire: Math.round(e.sponsorship / e.hires),
  }));
  const minCPH = Math.min(...withCost.map((e) => e.costPerHire));
  const maxCPH = Math.max(...withCost.map((e) => e.costPerHire));

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Event ROI Comparison
      </h2>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left font-medium text-xs text-muted-foreground px-4 py-2.5">
                Event
              </th>
              <th className="text-right font-medium text-xs text-muted-foreground px-4 py-2.5">
                Opt-ins
              </th>
              <th className="text-right font-medium text-xs text-muted-foreground px-4 py-2.5">
                Pipeline
              </th>
              <th className="text-right font-medium text-xs text-muted-foreground px-4 py-2.5">
                Hires
              </th>
              <th className="text-right font-medium text-xs text-muted-foreground px-4 py-2.5">
                Cost/Hire
              </th>
              <th className="text-left font-medium text-xs text-muted-foreground px-4 py-2.5 w-36">
                Performance
              </th>
            </tr>
          </thead>
          <tbody>
            {withCost.map((e) => {
              const isBest = e.costPerHire === minCPH;
              const isWorst = e.costPerHire === maxCPH;
              const barWidth = Math.round((minCPH / e.costPerHire) * 100);
              const barColor = isBest ? "bg-[#2F7A47]" : isWorst ? "bg-[#C99A3E]" : "bg-[#6BAE82]";
              const borderColor = isBest
                ? "border-l-[#2F7A47]"
                : isWorst
                  ? "border-l-[#C99A3E]"
                  : "border-l-transparent";
              return (
                <tr
                  key={e.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  <td className={`px-4 py-3 font-medium border-l-2 ${borderColor}`}>{e.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {e.optIns}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {e.pipeline}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums font-semibold ${isBest ? "text-[#2F7A47]" : "text-foreground"}`}
                  >
                    {e.hires}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums font-semibold ${isBest ? "text-[#2F7A47]" : isWorst ? "text-[#C99A3E]" : "text-foreground"}`}
                  >
                    €{e.costPerHire.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32 bg-secondary rounded-full h-1.5">
                      <div
                        className={`${barColor} h-1.5 rounded-full`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

Note: `EventItem` is already imported at the top of the file via `import { events, eventCandidateMap } from "@/lib/eventiq/mockData"` — but the type `EventItem` itself needs to be imported. Check if `EventItem` is already in the import; if not, add it:

```ts
import { events, eventCandidateMap, type EventItem } from "@/lib/eventiq/mockData";
```

- [ ] **Step 2: Render `<EventROIComparison>` at the top of the list view return**

In the list view `return` branch (the one that is NOT the drilldown — starts with `<div className="p-8 max-w-[1100px]">`), find the section after the `<div className="mb-8">` header block and before the `<div className="space-y-3">` event cards list:

```tsx
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-2">Auto-generated ROI reports for each sponsored event.</p>
      </div>
      <div className="space-y-3">
```

Insert `<EventROIComparison evs={events} />` between them:

```tsx
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-2">Auto-generated ROI reports for each sponsored event.</p>
      </div>
      <EventROIComparison evs={events} />
      <div className="space-y-3">
```

- [ ] **Step 3: Verify TypeScript is clean**

```bash
cd /Users/leoniebender/eventiq-pulse && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/eventiq/views/Reports.tsx
git commit -m "feat: add event ROI comparison table to Reports list view"
```

---

### Task 3: Add Hires stat to event cards and cost/hire to drilldown

**Files:**

- Modify: `src/components/eventiq/views/Reports.tsx`

- [ ] **Step 1: Add Hires stat to each event card in the list view**

Find this block inside the `{events.map((e) => ( ... ))}` list (the three `<Stat>` components in the right section of each card):

```tsx
<div className="flex gap-6 text-xs">
  <Stat label="Opt-ins" value={e.optIns} />
  <Stat label="Pipeline" value={e.pipeline} />
  <Stat label="Cost/Lead" value={`€${e.costPerLead}`} />
</div>
```

Replace with:

```tsx
<div className="flex gap-6 text-xs">
  <Stat label="Opt-ins" value={e.optIns} />
  <Stat label="Pipeline" value={e.pipeline} />
  <Stat label="Hires" value={e.hires} />
  <Stat label="Cost/Lead" value={`€${e.costPerLead}`} />
</div>
```

- [ ] **Step 2: Add cost/hire row to the drilldown Cost Analysis section**

Find Section 3 (Cost Analysis) in the drilldown `return` branch. It maps an array of `[label, value]` pairs:

```tsx
              {[
                ["Sponsorship", `€${ev.sponsorship.toLocaleString()}`],
                ["Cost per opt-in", `€${Math.round(ev.sponsorship / ev.optIns)}`],
                ["Cost per pipeline entry", `€${ev.costPerLead}`],
                ["Benchmark (your 5-event avg)", "€876 per pipeline entry"],
              ].map(([k, v]) => (
```

Replace with:

```tsx
              {[
                ["Sponsorship", `€${ev.sponsorship.toLocaleString()}`],
                ["Cost per opt-in", `€${Math.round(ev.sponsorship / ev.optIns)}`],
                ["Cost per pipeline entry", `€${ev.costPerLead}`],
                ["Cost per hire", `€${Math.round(ev.sponsorship / ev.hires).toLocaleString()}`],
                ["Benchmark (your 5-event avg)", "€876 per pipeline entry"],
              ].map(([k, v]) => (
```

- [ ] **Step 3: Verify TypeScript is clean**

```bash
cd /Users/leoniebender/eventiq-pulse && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/eventiq/views/Reports.tsx
git commit -m "feat: add Hires stat to event cards and cost/hire to drilldown"
```

---

## Self-Review

**Spec coverage:**

- ✅ `hires: number` added to `EventItem` interface (Task 1)
- ✅ All 5 events populated with hires data (Task 1)
- ✅ `EventROIComparison` component with 6-column table (Task 2)
- ✅ Performance bar: `minCPH / costPerHire * 100` (Task 2)
- ✅ Best row: green left border + green text (Task 2)
- ✅ Worst row: amber left border + amber Cost/Hire text (Task 2)
- ✅ Middle rows: transparent border (Task 2)
- ✅ Section placed between header and event cards (Task 2)
- ✅ Hires stat added to event cards (Task 3)
- ✅ Cost/hire row in drilldown cost section (Task 3)

**Placeholders:** None.

**Type consistency:** `EventItem` type extended in Task 1 with `hires`; consumed in Tasks 2 and 3 as `e.hires` and `ev.hires` respectively — field name is consistent throughout.
