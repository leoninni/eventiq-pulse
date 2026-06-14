# Talent Ecosystem View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new "Ecosystem" sidebar view showing DACH university talent pools and student communities as an intelligence layer no ATS can replicate.

**Architecture:** Five files total — new types and data in `mockData.ts`, one-liner additions to `store.tsx`, `Sidebar.tsx`, and `AppLayout.tsx`, and a new self-contained `Ecosystem.tsx` view component. No external dependencies.

**Tech Stack:** React, TypeScript, Tailwind CSS, lucide-react

---

### Task 1: Add UniversityProfile and StudentCommunity data to mockData

**Files:**

- Modify: `src/lib/eventiq/mockData.ts`

- [ ] **Step 1: Add the two new interfaces at the end of the interfaces block (after the existing `FunnelStage` interface)**

```ts
export interface UniversityProfile {
  id: string;
  name: string;
  shortName: string;
  location: string;
  candidates: number;
  topSkills: string[];
  roleAffinity: string;
}

export interface StudentCommunity {
  id: string;
  name: string;
  type:
    | "AI/ML"
    | "Robotics"
    | "Entrepreneurship"
    | "Cloud/DevOps"
    | "Data"
    | "Open Source"
    | "Community";
  university: string;
  members: number;
  topSkills: string[];
}
```

- [ ] **Step 2: Add the `universityProfiles` export at the end of the file (after `funnelData`)**

```ts
export const universityProfiles: UniversityProfile[] = [
  {
    id: "tum",
    name: "TU Munich",
    shortName: "TUM",
    location: "Munich",
    candidates: 67,
    topSkills: ["ML", "Python", "Robotics"],
    roleAffinity: "ML/AI · Systems",
  },
  {
    id: "eth",
    name: "ETH Zürich",
    shortName: "ETH",
    location: "Zürich",
    candidates: 48,
    topSkills: ["C++", "CUDA", "Rust"],
    roleAffinity: "Systems · Research",
  },
  {
    id: "tuberlin",
    name: "TU Berlin",
    shortName: "TU Berlin",
    location: "Berlin",
    candidates: 31,
    topSkills: ["React", "TypeScript", "Go"],
    roleAffinity: "Frontend · Backend",
  },
  {
    id: "kit",
    name: "KIT",
    shortName: "KIT",
    location: "Karlsruhe",
    candidates: 29,
    topSkills: ["Python", "Spark", "Embedded"],
    roleAffinity: "Data · Embedded",
  },
  {
    id: "rwth",
    name: "RWTH Aachen",
    shortName: "RWTH",
    location: "Aachen",
    candidates: 24,
    topSkills: ["Java", "NLP", "Systems"],
    roleAffinity: "Backend",
  },
  {
    id: "unistuttgart",
    name: "Uni Stuttgart",
    shortName: "Stuttgart",
    location: "Stuttgart",
    candidates: 18,
    topSkills: ["Go", "Kubernetes", "DevOps"],
    roleAffinity: "Backend · Infra",
  },
  {
    id: "tudarmstadt",
    name: "TU Darmstadt",
    shortName: "TU Darmstadt",
    location: "Darmstadt",
    candidates: 16,
    topSkills: ["C++", "Embedded", "RTOS"],
    roleAffinity: "Systems",
  },
  {
    id: "lmu",
    name: "LMU Munich",
    shortName: "LMU",
    location: "Munich",
    candidates: 14,
    topSkills: ["Rust", "WebAssembly", "Systems"],
    roleAffinity: "Systems",
  },
];
```

- [ ] **Step 3: Add the `studentCommunities` export directly after `universityProfiles`**

```ts
export const studentCommunities: StudentCommunity[] = [
  {
    id: "tum-ai",
    name: "TUM AI Society",
    type: "AI/ML",
    university: "TU Munich",
    members: 280,
    topSkills: ["Python", "LLMs"],
  },
  {
    id: "tum-ml",
    name: "TUM ML Society",
    type: "AI/ML",
    university: "TU Munich",
    members: 210,
    topSkills: ["PyTorch", "ML"],
  },
  {
    id: "tum-robotics",
    name: "TUM Robotics Club",
    type: "Robotics",
    university: "TU Munich",
    members: 145,
    topSkills: ["C++", "ROS"],
  },
  {
    id: "eth-robotics",
    name: "ETH Robotics Society",
    type: "Robotics",
    university: "ETH Zürich",
    members: 120,
    topSkills: ["C++", "CUDA"],
  },
  {
    id: "eth-women",
    name: "ETH Women in Tech",
    type: "Community",
    university: "ETH Zürich",
    members: 340,
    topSkills: ["Python", "ML"],
  },
  {
    id: "eth-entre",
    name: "ETH Entrepreneurship Club",
    type: "Entrepreneurship",
    university: "ETH Zürich",
    members: 190,
    topSkills: ["React", "TypeScript"],
  },
  {
    id: "kit-data",
    name: "KIT Data Science Club",
    type: "Data",
    university: "KIT",
    members: 95,
    topSkills: ["Python", "Spark"],
  },
  {
    id: "tud-robotics",
    name: "TU Darmstadt Robotics Club",
    type: "Robotics",
    university: "TU Darmstadt",
    members: 110,
    topSkills: ["C++", "Embedded"],
  },
  {
    id: "stuttgart-cloud",
    name: "Uni Stuttgart Cloud Native Club",
    type: "Cloud/DevOps",
    university: "Uni Stuttgart",
    members: 75,
    topSkills: ["Go", "Kubernetes"],
  },
  {
    id: "lmu-oss",
    name: "LMU Open Source Lab",
    type: "Open Source",
    university: "LMU Munich",
    members: 85,
    topSkills: ["Rust", "WebAssembly"],
  },
];
```

- [ ] **Step 4: Verify TypeScript is clean**

```bash
cd /Users/leoniebender/eventiq-pulse && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/lib/eventiq/mockData.ts
git commit -m "feat: add UniversityProfile and StudentCommunity types and data"
```

---

### Task 2: Wire up the Ecosystem route in store, sidebar, and layout

**Files:**

- Modify: `src/lib/eventiq/store.tsx`
- Modify: `src/components/eventiq/Sidebar.tsx`
- Modify: `src/components/eventiq/AppLayout.tsx`

- [ ] **Step 1: Add `"ecosystem"` to the `View` type in `store.tsx`**

Find:

```ts
type View = "overview" | "events" | "candidates" | "reports" | "recommendations";
```

Replace with:

```ts
type View = "overview" | "events" | "candidates" | "ecosystem" | "reports" | "recommendations";
```

- [ ] **Step 2: Add the Ecosystem nav item to `Sidebar.tsx`**

Find the existing import:

```ts
import { Home, Calendar, Users, BarChart3, Sparkles } from "lucide-react";
```

Replace with:

```ts
import { Home, Calendar, Users, BarChart3, Sparkles, Network } from "lucide-react";
```

Then find the `items` array:

```ts
const items: { id: View; label: string; icon: typeof Home }[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "events", label: "Events", icon: Calendar },
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "recommendations", label: "Recommendations", icon: Sparkles },
];
```

Replace with:

```ts
const items: { id: View; label: string; icon: typeof Home }[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "events", label: "Events", icon: Calendar },
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "ecosystem", label: "Ecosystem", icon: Network },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "recommendations", label: "Recommendations", icon: Sparkles },
];
```

- [ ] **Step 3: Add the Ecosystem render in `AppLayout.tsx`**

Find the existing imports block:

```ts
import { Overview } from "./views/Overview";
import { Events } from "./views/Events";
import { Candidates } from "./views/Candidates";
import { Reports } from "./views/Reports";
import { Recommendations } from "./views/Recommendations";
```

Replace with:

```ts
import { Overview } from "./views/Overview";
import { Events } from "./views/Events";
import { Candidates } from "./views/Candidates";
import { Ecosystem } from "./views/Ecosystem";
import { Reports } from "./views/Reports";
import { Recommendations } from "./views/Recommendations";
```

Then find the render block in `Main`:

```tsx
{
  view === "overview" && <Overview />;
}
{
  view === "events" && <Events />;
}
{
  view === "candidates" && <Candidates />;
}
{
  view === "reports" && <Reports />;
}
{
  view === "recommendations" && <Recommendations />;
}
```

Replace with:

```tsx
{
  view === "overview" && <Overview />;
}
{
  view === "events" && <Events />;
}
{
  view === "candidates" && <Candidates />;
}
{
  view === "ecosystem" && <Ecosystem />;
}
{
  view === "reports" && <Reports />;
}
{
  view === "recommendations" && <Recommendations />;
}
```

- [ ] **Step 4: Verify TypeScript is clean**

```bash
cd /Users/leoniebender/eventiq-pulse && npx tsc --noEmit 2>&1 | head -20
```

Expected: a TypeScript error saying `Ecosystem` cannot be found — this is expected since the component doesn't exist yet. Verify the other two changes (store, sidebar) are error-free aside from the missing module. If you see other errors, investigate.

- [ ] **Step 5: Commit**

```bash
git add src/lib/eventiq/store.tsx src/components/eventiq/Sidebar.tsx src/components/eventiq/AppLayout.tsx
git commit -m "feat: wire up Ecosystem route in store, sidebar, and layout"
```

---

### Task 3: Build the Ecosystem view component

**Files:**

- Create: `src/components/eventiq/views/Ecosystem.tsx`

- [ ] **Step 1: Create `Ecosystem.tsx` with the full component**

```tsx
import {
  universityProfiles,
  studentCommunities,
  type StudentCommunity,
} from "@/lib/eventiq/mockData";

const typeBadgeStyles: Record<StudentCommunity["type"], string> = {
  "AI/ML": "bg-[#DCEFE2] text-[#1F4A2E]",
  Robotics: "bg-[#E2E8F0] text-[#334155]",
  Entrepreneurship: "bg-[#F5E7CC] text-[#7A5712]",
  "Cloud/DevOps": "bg-[#E8F0F5] text-[#1A4A6E]",
  Data: "bg-[#F0E8F5] text-[#4A1A6E]",
  "Open Source": "bg-[#F5F0E8] text-[#6E4A1A]",
  Community: "bg-secondary text-muted-foreground",
};

export function Ecosystem() {
  const totalCandidates = universityProfiles.reduce((sum, u) => sum + u.candidates, 0);

  return (
    <div className="p-10 max-w-[1400px]">
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tight">Talent Ecosystem</h1>
        <p className="text-sm text-muted-foreground mt-2">
          University talent pools and student communities in your recruiting network.
        </p>
      </div>

      {/* Aggregate stats */}
      <div className="flex gap-4 mb-10">
        {[
          { value: totalCandidates, label: "candidates" },
          { value: universityProfiles.length, label: "universities" },
          { value: studentCommunities.length, label: "communities" },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-lg px-5 py-3 flex items-baseline gap-2"
          >
            <span className="text-2xl font-bold tabular-nums">{value}</span>
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* University Talent Pools */}
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          University Talent Pools
        </div>
        <div className="grid grid-cols-4 gap-3">
          {universityProfiles.map((u) => (
            <div key={u.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-1">
                <div className="text-sm font-semibold">{u.shortName}</div>
                <div className="text-[10px] text-muted-foreground">{u.location}</div>
              </div>
              <div className="text-2xl font-bold tabular-nums mt-2">{u.candidates}</div>
              <div className="text-xs text-muted-foreground mb-3">candidates</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {u.topSkills.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-1.5 py-0.5 rounded border border-primary/30 text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium inline-block">
                {u.roleAffinity}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Communities */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Student Communities
        </div>
        <div className="grid grid-cols-3 gap-3">
          {studentCommunities.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-semibold leading-tight">{c.name}</div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${typeBadgeStyles[c.type]}`}
                >
                  {c.type}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mb-3">{c.university}</div>
              <div className="text-lg font-bold tabular-nums">{c.members.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mb-3">members</div>
              <div className="flex flex-wrap gap-1">
                {c.topSkills.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-1.5 py-0.5 rounded border border-primary/30 text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript is clean**

```bash
cd /Users/leoniebender/eventiq-pulse && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output (zero errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/eventiq/views/Ecosystem.tsx
git commit -m "feat: add Ecosystem view with university and community cards"
```

---

## Self-Review

**Spec coverage:**

- ✅ `"ecosystem"` added to `View` type (Task 2)
- ✅ `Network` icon imported, sidebar item between Candidates and Reports (Task 2)
- ✅ `Ecosystem` imported and rendered in AppLayout (Task 2)
- ✅ `UniversityProfile` and `StudentCommunity` interfaces (Task 1)
- ✅ `universityProfiles` — 8 entries, total = 247 (Task 1)
- ✅ `studentCommunities` — 10 entries (Task 1)
- ✅ Aggregate stats strip: totalCandidates, university count, community count (Task 3)
- ✅ 4-column university grid with shortName, location, candidate count, top 3 skills, role affinity (Task 3)
- ✅ 3-column community grid with name, type badge, university, member count, top 2 skills (Task 3)
- ✅ Type badge color map covering all 7 type values (Task 3)

**Placeholders:** None.

**Type consistency:** `StudentCommunity["type"]` used as the key type in `typeBadgeStyles` — matches the union defined in Task 1 exactly. `universityProfiles` and `studentCommunities` imported by name in Task 3 — match the export names from Task 1.
