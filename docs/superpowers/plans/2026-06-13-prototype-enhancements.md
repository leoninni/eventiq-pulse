# Prototype Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three demo-strengthening features to EventIQ Pulse: a conversion funnel on Overview, candidate match scores against open roles, and a working ATS integration modal.

**Architecture:** All changes are pure frontend with no new dependencies. New data (open roles, funnel stages) is added to `mockData.ts`; new store state (ATS sync) lives in `store.tsx`; a pure `matchScore` utility goes in `utils.ts`. UI changes touch only `Overview.tsx` and `Candidates.tsx`.

**Tech Stack:** React 19, TypeScript 5, Tailwind CSS v4, TanStack Router, shadcn/ui, Recharts (existing — not extended)

---

## Task 1: Extend mockData.ts with OpenRole and funnelData

**Files:**
- Modify: `src/lib/eventiq/mockData.ts`

- [ ] **Step 1: Append OpenRole type and openRoles export**

Add to the bottom of `src/lib/eventiq/mockData.ts`:

```typescript
export interface OpenRole {
  id: string;
  title: string;
  skills: string[];
}

export const openRoles: OpenRole[] = [
  { id: "role-ml", title: "ML/AI Working Student", skills: ["Python", "ML", "PyTorch", "LLMs"] },
  { id: "role-backend", title: "Backend Engineering Intern", skills: ["Go", "Java", "Node", "Microservices", "Spark"] },
  { id: "role-systems", title: "Systems Engineering Intern", skills: ["C++", "CUDA", "Rust", "Embedded", "RTOS"] },
  { id: "role-frontend", title: "Frontend Working Student", skills: ["React", "TypeScript", "GraphQL"] },
];
```

- [ ] **Step 2: Append FunnelStage type and funnelData export**

Append directly below the openRoles block:

```typescript
export interface FunnelStage {
  label: string;
  value: number;
  pct?: string;
  widthPct: number;
}

export const funnelData: FunnelStage[] = [
  { label: "Attendees",   value: 1760, widthPct: 100 },
  { label: "Opt-ins",     value: 247,  pct: "14%", widthPct: 70 },
  { label: "Contacted",   value: 178,  pct: "72%", widthPct: 50 },
  { label: "In Pipeline", value: 34,   pct: "19%", widthPct: 20 },
  { label: "Interviewed", value: 12,   pct: "35%", widthPct: 10 },
  { label: "Offers",      value: 3,    pct: "25%", widthPct: 5  },
];
```

- [ ] **Step 3: Type-check**

```bash
bunx tsc
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/eventiq/mockData.ts
git commit -m "feat: add OpenRole, openRoles, FunnelStage, funnelData to mockData"
```

---

## Task 2: Add matchScore utility to utils.ts

**Files:**
- Modify: `src/lib/utils.ts`

- [ ] **Step 1: Add RoleMatch interface and matchScore function**

Replace the entire contents of `src/lib/utils.ts` with:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Candidate, OpenRole } from "./eventiq/mockData";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface RoleMatch {
  roleId: string;
  roleTitle: string;
  score: number;
}

export function matchScore(candidate: Candidate, roles: OpenRole[]): RoleMatch[] {
  return roles
    .map((role) => {
      const matches = candidate.skills.filter((s) => role.skills.includes(s)).length;
      const score = Math.round((matches / role.skills.length) * 100);
      return { roleId: role.id, roleTitle: role.title, score };
    })
    .sort((a, b) => b.score - a.score);
}
```

- [ ] **Step 2: Manually verify expected outputs**

Open the browser console in the running dev app (`bun run dev`, visit http://localhost:5173) and run:

```javascript
// Felix M. has skills: Python, ML, LLMs
// role-ml requires: Python, ML, PyTorch, LLMs → 3/4 = 75%
// role-backend requires: Go, Java, Node, Microservices, Spark → 0/5 = 0%
```

Expected best match: `ML/AI Working Student` at `75%`.

- [ ] **Step 3: Type-check**

```bash
bunx tsc
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils.ts
git commit -m "feat: add matchScore utility to utils.ts"
```

---

## Task 3: Add atsSync state to store.tsx

**Files:**
- Modify: `src/lib/eventiq/store.tsx`

- [ ] **Step 1: Extend StoreCtx interface**

In `src/lib/eventiq/store.tsx`, add two fields to the `StoreCtx` interface (after `toggleShortlist`):

```typescript
interface StoreCtx {
  view: View;
  setView: (v: View) => void;
  candidates: Candidate[];
  setStatus: (id: string, status: Status) => void;
  eventFilter: string;
  setEventFilter: (id: string) => void;
  shortlist: Set<string>;
  toggleShortlist: (id: string) => void;
  atsSync: Record<string, string>;
  syncToAts: (candidateId: string, atsName: string) => void;
}
```

- [ ] **Step 2: Add useState and action inside StoreProvider**

Inside the `StoreProvider` function body, add after the `shortlist` useState:

```typescript
const [atsSync, setAtsSync] = useState<Record<string, string>>({});
```

Then inside the `useMemo` value object, add after `toggleShortlist`:

```typescript
atsSync,
syncToAts: (id, atsName) => setAtsSync((prev) => ({ ...prev, [id]: atsName })),
```

- [ ] **Step 3: Type-check**

```bash
bunx tsc
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/eventiq/store.tsx
git commit -m "feat: add atsSync state and syncToAts action to store"
```

---

## Task 4: Replace donut chart with ConversionFunnel in Overview.tsx

**Files:**
- Modify: `src/components/eventiq/views/Overview.tsx`

- [ ] **Step 1: Update imports**

Replace the existing import block at the top of `Overview.tsx` with:

```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUp, ArrowDown, UserCheck, FileText, Mail, Calendar, Users } from "lucide-react";
import { events, recentActivity, funnelData, type FunnelStage } from "@/lib/eventiq/mockData";
```

Note: `PieChart`, `Pie`, `Cell` removed from recharts. `type Status` removed from mockData import. `useStore` import removed. `funnelData` and `FunnelStage` added.

- [ ] **Step 2: Remove donut-only variables from Overview function body**

Inside the `Overview` function, remove these lines entirely (they are only used by the donut):

```typescript
const { candidates } = useStore();

const statusCounts = candidates.reduce<Record<string, number>>((acc, c) => {
  acc[c.status] = (acc[c.status] || 0) + 1;
  return acc;
}, {});
const total = candidates.length;
const order: Status[] = ["Interested", "In Review", "Interviewed", "Offer Extended", "Rejected"];
const fixedPct: Record<Status, number> = { "Interested": 38, "In Review": 25, "Interviewed": 18, "Offer Extended": 6, "Rejected": 13 };
const donutData = order.map((s) => ({ name: s, value: fixedPct[s], live: statusCounts[s] || 0, color: donutPalette[s] }));
```

Also remove the `donutPalette` constant defined above the `Kpi` component:

```typescript
// DELETE this entire block:
const donutPalette: Record<Status, string> = {
  "Interested": "#6BAE82",
  "In Review": "#C99A3E",
  "Interviewed": "#64748B",
  "Offer Extended": "#2F7A47",
  "Rejected": "#B07A5A",
};
```

- [ ] **Step 3: Add ConversionFunnel component**

Add this component directly above the `Overview` function (below the `Kpi` component):

```typescript
const FUNNEL_BG = ["#E3E8E3", "#B8E0C2", "#B8E0C2", "#6BAE82", "#2F7A47", "#0F1410"];
const FUNNEL_FG = ["#1A1F1A", "#1F4A2E", "#1F4A2E", "#ffffff", "#ffffff", "#ffffff"];

function ConversionFunnel({ data }: { data: FunnelStage[] }) {
  return (
    <div className="space-y-2">
      {data.map((stage, i) => (
        <div key={stage.label} className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground w-[90px] shrink-0 text-right tabular-nums">
            {stage.label}
          </span>
          <div className="flex-1 bg-secondary rounded h-7 overflow-hidden">
            <div
              className="h-full rounded flex items-center gap-2 px-3"
              style={{ width: `${stage.widthPct}%`, background: FUNNEL_BG[i] }}
            >
              <span className="text-xs font-semibold tabular-nums" style={{ color: FUNNEL_FG[i] }}>
                {stage.value.toLocaleString()}
              </span>
              {stage.pct && (
                <span className="text-[10px] tabular-nums" style={{ color: FUNNEL_FG[i], opacity: 0.75 }}>
                  {stage.pct}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Replace the donut card in the JSX**

Find and replace the entire `col-span-2` donut card in the Overview return JSX:

Old block to replace:
```typescript
<div className="col-span-2 bg-card border border-border rounded-xl p-6">
  <div className="flex items-center justify-between mb-5">
    <h3 className="font-display text-2xl">Pipeline status</h3>
    <span className="text-xs text-muted-foreground">{total} active</span>
  </div>
  <div className="h-[180px]">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={donutData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2} stroke="none">
          {donutData.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, ""]} />
      </PieChart>
    </ResponsiveContainer>
  </div>
  <div className="mt-3 space-y-1.5">
    {donutData.map((d) => (
      <div key={d.name} className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
          <span className="text-foreground">{d.name}</span>
        </div>
        <span className="text-muted-foreground tabular-nums">{d.value}%</span>
      </div>
    ))}
  </div>
</div>
```

New block:
```typescript
<div className="col-span-2 bg-card border border-border rounded-xl p-6">
  <div className="flex items-center justify-between mb-5">
    <h3 className="font-display text-2xl">Hiring funnel</h3>
    <span className="text-xs text-muted-foreground">All events · 2025</span>
  </div>
  <ConversionFunnel data={funnelData} />
</div>
```

- [ ] **Step 5: Type-check and visual verify**

```bash
bunx tsc
bun run dev
```

Visit http://localhost:5173. The Overview should show the hiring funnel in place of the donut. Six horizontal bars narrowing from Attendees (full width) to Offers (5%). No TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/eventiq/views/Overview.tsx
git commit -m "feat: replace pipeline donut with hiring conversion funnel"
```

---

## Task 5: Add match score badge (rows) and Role Match section (drawer) to Candidates.tsx

**Files:**
- Modify: `src/components/eventiq/views/Candidates.tsx`

- [ ] **Step 1: Add new imports**

Update the import block at the top of `Candidates.tsx`:

```typescript
import { useMemo, useState } from "react";
import { events, openRoles, type Status, type Candidate } from "@/lib/eventiq/mockData";
import { useStore } from "@/lib/eventiq/store";
import { StatusBadge } from "../StatusBadge";
import { SlidePanel } from "../SlidePanel";
import { Search, Mail, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { matchScore } from "@/lib/utils";
```

- [ ] **Step 2: Add match score badge to candidate list rows**

Find the right column of the candidate row (the `flex flex-col items-end` div). Add the match badge as the first child, before `<StatusBadge>`:

```typescript
<div className="flex flex-col items-end gap-1.5 shrink-0">
  {(() => {
    const best = matchScore(c, openRoles)[0];
    return best && best.score >= 40 ? (
      <div className="flex items-center gap-1.5 bg-[#DCEFE2] border border-[#B8E0C2] rounded px-2 py-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2F7A47] shrink-0" />
        <span className="text-[11px] font-semibold text-[#1F4A2E] tabular-nums">{best.score}%</span>
        <span className="text-[10px] text-[#2F7A47]">{best.roleTitle}</span>
      </div>
    ) : null;
  })()}
  <StatusBadge status={c.status} />
  <div className="text-[10px] text-muted-foreground">{ev?.name}</div>
  <button
    onClick={() => setOpenId(c.id)}
    className="px-2.5 py-1 text-xs rounded-md border border-border hover:bg-secondary transition-colors"
  >
    View Profile
  </button>
</div>
```

- [ ] **Step 3: Add Role Match section to the candidate drawer**

Inside the `SlidePanel`, find the skills flex block and the project description block. Insert the Role Match section between them:

```typescript
{/* after skills flex block */}
<div className="mb-5">
  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Role Match</div>
  <div className="space-y-1.5">
    {matchScore(open, openRoles).map((m, i) => (
      <div
        key={m.roleId}
        className={`flex items-center justify-between px-3 py-1.5 rounded-md border ${
          i === 0
            ? "bg-[#DCEFE2] border-[#B8E0C2]"
            : "bg-secondary/40 border-border"
        }`}
      >
        <span className={`text-xs ${i === 0 ? "font-medium text-[#1F4A2E]" : "text-muted-foreground"}`}>
          {m.roleTitle}
        </span>
        <span className={`text-sm font-semibold tabular-nums ${i === 0 ? "text-[#2F7A47]" : "text-muted-foreground"}`}>
          {m.score}%
        </span>
      </div>
    ))}
  </div>
</div>
{/* then the existing project description block */}
```

- [ ] **Step 4: Type-check and visual verify**

```bash
bunx tsc
bun run dev
```

Visit http://localhost:5173 → Candidates tab. Candidates with strong skill matches (e.g. Felix M. — Python/ML/LLMs) should show a green `75% · ML/AI Working Student` badge. Open any candidate drawer — the Role Match section should appear between skills and project, showing all four roles sorted by score.

- [ ] **Step 5: Commit**

```bash
git add src/components/eventiq/views/Candidates.tsx
git commit -m "feat: add candidate match score badge and role match drawer section"
```

---

## Task 6: Add ATS integration modal to Candidates.tsx

**Files:**
- Modify: `src/components/eventiq/views/Candidates.tsx`

- [ ] **Step 1: Update imports to add useEffect and Check**

```typescript
import { useMemo, useState, useEffect } from "react";
import { events, openRoles, type Status, type Candidate } from "@/lib/eventiq/mockData";
import { useStore } from "@/lib/eventiq/store";
import { StatusBadge } from "../StatusBadge";
import { SlidePanel } from "../SlidePanel";
import { Search, Mail, PlusCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { matchScore } from "@/lib/utils";
```

- [ ] **Step 2: Add ATS_OPTIONS constant above the Candidates function**

Add this constant directly above the `export function Candidates()` line:

```typescript
const ATS_OPTIONS = [
  { name: "Greenhouse", color: "#23A47C", initial: "G" },
  { name: "Personio",   color: "#1A56DB", initial: "P" },
  { name: "Lever",      color: "#5865F2", initial: "L" },
  { name: "Ashby",      color: "#FF6B35", initial: "A" },
] as const;
```

- [ ] **Step 3: Add ATS modal state and effect inside the Candidates function**

Add these three useState declarations and a useEffect inside the `Candidates` function body, after the existing `useState` declarations:

```typescript
const { candidates, setStatus, eventFilter, setEventFilter, atsSync, syncToAts } = useStore();
// ... existing state ...
const [atsModalFor, setAtsModalFor] = useState<Candidate | null>(null);
const [selectedAts, setSelectedAts] = useState<string | null>(null);
const [atsStep, setAtsStep] = useState<1 | 2 | 3>(1);

useEffect(() => {
  if (atsStep !== 2) return;
  const t = setTimeout(() => setAtsStep(3), 1200);
  return () => clearTimeout(t);
}, [atsStep]);

function openAtsModal(candidate: Candidate) {
  setAtsModalFor(candidate);
  setSelectedAts(null);
  setAtsStep(1);
}

function closeAtsModal() {
  setAtsModalFor(null);
  setSelectedAts(null);
  setAtsStep(1);
}
```

Also update the `useStore` destructure to include `atsSync` and `syncToAts`:

```typescript
const { candidates, setStatus, eventFilter, setEventFilter, atsSync, syncToAts } = useStore();
```

- [ ] **Step 4: Update the "Add to ATS" button in the drawer to use the modal**

Find the existing "Add to ATS" button in the drawer's action row. Replace it:

Old:
```typescript
<button
  onClick={() => toast.info("ATS integration coming soon")}
  className="px-3 py-2 text-sm rounded-md border border-border hover:bg-secondary transition-colors inline-flex items-center gap-1.5"
>
  <PlusCircle className="w-3.5 h-3.5" /> Add to ATS
</button>
```

New:
```typescript
{atsSync[open.id] ? (
  <button
    disabled
    className="px-3 py-2 text-sm rounded-md border border-[#B8E0C2] bg-[#DCEFE2] text-[#2F7A47] inline-flex items-center gap-1.5 cursor-default"
  >
    <Check className="w-3.5 h-3.5" /> Synced · {atsSync[open.id]}
  </button>
) : (
  <button
    onClick={() => openAtsModal(open)}
    className="px-3 py-2 text-sm rounded-md border border-border hover:bg-secondary transition-colors inline-flex items-center gap-1.5"
  >
    <PlusCircle className="w-3.5 h-3.5" /> Add to ATS
  </button>
)}
```

- [ ] **Step 5: Add synced badge to candidate list rows**

In the candidate list row right column, add this after the `View Profile` button:

```typescript
{atsSync[c.id] && (
  <div className="text-[10px] px-1.5 py-0.5 rounded border border-[#B8E0C2] bg-[#DCEFE2] text-[#2F7A47] font-medium">
    Synced · {atsSync[c.id]}
  </div>
)}
```

- [ ] **Step 6: Add the ATS modal JSX**

Add this block at the bottom of the Candidates component return, after the existing email modal closing tag and before the final closing `</div>`:

```typescript
{/* ATS Modal */}
{atsModalFor && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div onClick={closeAtsModal} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
    <div className="relative bg-card border border-border rounded-lg w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">

      {atsStep === 1 && (
        <>
          <h3 className="text-base font-semibold mb-4">Add to ATS</h3>
          <div className="space-y-2 mb-5">
            {ATS_OPTIONS.map((ats) => (
              <button
                key={ats.name}
                onClick={() => setSelectedAts(ats.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors text-left ${
                  selectedAts === ats.name
                    ? "border-[#2F7A47] bg-[#F5FBF7]"
                    : "border-border hover:bg-secondary"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ background: ats.color }}
                >
                  {ats.initial}
                </div>
                <span className="text-sm font-medium">{ats.name}</span>
                {selectedAts === ats.name && (
                  <Check className="w-4 h-4 text-[#2F7A47] ml-auto" />
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={closeAtsModal}
              className="flex-1 px-3 py-2 text-sm rounded-md border border-border hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!selectedAts}
              onClick={() => setAtsStep(2)}
              className="flex-1 px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {selectedAts ? `Sync to ${selectedAts}` : "Select an ATS"}
            </button>
          </div>
        </>
      )}

      {atsStep === 2 && (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <div className="w-9 h-9 rounded-full border-[3px] border-[#B8E0C2] border-t-[#2F7A47] animate-spin" />
          <p className="text-sm text-muted-foreground text-center">
            Syncing {atsModalFor.name} to {selectedAts}...
          </p>
        </div>
      )}

      {atsStep === 3 && (
        <>
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-[#DCEFE2] flex items-center justify-center">
              <Check className="w-6 h-6 text-[#2F7A47]" />
            </div>
            <div className="text-base font-semibold">Synced to {selectedAts}</div>
            <p className="text-sm text-muted-foreground text-center">
              {atsModalFor.name} has been added as a candidate in your {selectedAts} pipeline.
            </p>
            <div className="mt-1 px-2.5 py-1 rounded border border-[#B8E0C2] bg-[#DCEFE2] text-[10px] font-medium text-[#2F7A47]">
              Synced · {selectedAts}
            </div>
          </div>
          <button
            onClick={() => {
              syncToAts(atsModalFor.id, selectedAts!);
              closeAtsModal();
            }}
            className="w-full px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </>
      )}

    </div>
  </div>
)}
```

- [ ] **Step 7: Type-check and full visual verify**

```bash
bunx tsc
bun run dev
```

Test the full flow:
1. Open any candidate drawer → click "Add to ATS"
2. Step 1: four ATS cards appear (Greenhouse, Personio, Lever, Ashby) — click one, verify checkmark appears and button label updates
3. Click "Sync to [ATS]" → Step 2: spinner appears, auto-advances after ~1.2s
4. Step 3: success screen with green checkmark → click Done
5. Verify: drawer now shows "Synced · [ATS]" button (disabled); candidate row shows synced badge
6. Re-open the same candidate drawer — "Add to ATS" remains replaced by synced state

- [ ] **Step 8: Commit**

```bash
git add src/components/eventiq/views/Candidates.tsx
git commit -m "feat: add ATS integration modal with Greenhouse, Personio, Lever, Ashby"
```

---

## Completion Checklist

- [ ] Overview shows a 6-stage horizontal conversion funnel (no donut)
- [ ] Candidates list shows match score badges (≥40% threshold) referencing intern/working-student roles
- [ ] Candidate drawer shows Role Match section with all 4 roles sorted by score
- [ ] "Add to ATS" opens 3-step modal: choose → syncing animation → success
- [ ] Post-sync: row shows synced badge, drawer button replaced with disabled synced state
- [ ] `bunx tsc` passes with no errors
- [ ] No new npm dependencies introduced
