# Talent Ecosystem View

**Date:** 2026-06-13  
**Scope:** New sidebar view showing the DACH student tech ecosystem — universities, communities, and talent distribution — using hardcoded mock data  
**Constraint:** No new dependencies. No backend. One new file (`Ecosystem.tsx`); four existing files get small additions.

---

## Context

EventIQ's core pitch is that its founders are inside the student ecosystem — robotics clubs, entrepreneurship networks, hackathon organizers. The Talent Ecosystem view makes that insider position visible to recruiters and investors. It answers "who are these students and where do they come from?" in a way no ATS can. It is the third of three demo-critical features alongside Verified Talent Profiles and Event ROI Comparison.

---

## Routing

Add `"ecosystem"` to the `View` union in `src/lib/eventiq/store.tsx`:

```ts
type View = "overview" | "events" | "candidates" | "reports" | "recommendations" | "ecosystem";
```

---

## Sidebar

In `src/components/eventiq/Sidebar.tsx`, import `Network` from lucide-react and add a new nav item between Candidates and Reports:

```ts
import { Home, Calendar, Users, BarChart3, Sparkles, Network } from "lucide-react";

const items: { id: View; label: string; icon: typeof Home }[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "events", label: "Events", icon: Calendar },
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "ecosystem", label: "Ecosystem", icon: Network },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "recommendations", label: "Recommendations", icon: Sparkles },
];
```

---

## AppLayout

In `src/components/eventiq/AppLayout.tsx`, import and render `Ecosystem`:

```ts
import { Ecosystem } from "./views/Ecosystem";
// ...
{view === "ecosystem" && <Ecosystem />}
```

---

## Mock Data

Two new exports added to `src/lib/eventiq/mockData.ts`.

### Types

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

### `universityProfiles` array (8 entries)

Numbers reflect the full 247-candidate opt-in pool distributed across universities (not derived from the 12 mock candidate records):

| id           | name          | shortName    | location  | candidates | topSkills                         | roleAffinity       |
| ------------ | ------------- | ------------ | --------- | ---------- | --------------------------------- | ------------------ |
| tum          | TU Munich     | TUM          | Munich    | 67         | ML, Python, Robotics, Embedded    | ML/AI · Systems    |
| eth          | ETH Zürich    | ETH          | Zürich    | 48         | C++, CUDA, Rust, Research         | Systems · Research |
| tuberlin     | TU Berlin     | TU Berlin    | Berlin    | 31         | React, TypeScript, Go, Node       | Frontend · Backend |
| kit          | KIT           | KIT          | Karlsruhe | 29         | Python, Spark, Embedded, Data Eng | Data · Embedded    |
| rwth         | RWTH Aachen   | RWTH         | Aachen    | 24         | Java, NLP, APIs, Systems          | Backend            |
| unistuttgart | Uni Stuttgart | Stuttgart    | Stuttgart | 18         | Go, Kubernetes, DevOps            | Backend · Infra    |
| tudarmstadt  | TU Darmstadt  | TU Darmstadt | Darmstadt | 16         | C++, Embedded, RTOS               | Systems            |
| lmu          | LMU Munich    | LMU          | Munich    | 14         | Rust, WebAssembly, Systems        | Systems            |

Total: 67 + 48 + 31 + 29 + 24 + 18 + 16 + 14 = **247** (matches existing KPI)

### `studentCommunities` array (10 entries)

| id              | name                            | type             | university    | members | topSkills                       |
| --------------- | ------------------------------- | ---------------- | ------------- | ------- | ------------------------------- |
| tum-ai          | TUM AI Society                  | AI/ML            | TU Munich     | 280     | Python, LLMs, ML                |
| tum-ml          | TUM ML Society                  | AI/ML            | TU Munich     | 210     | PyTorch, ML, Computer Vision    |
| tum-robotics    | TUM Robotics Club               | Robotics         | TU Munich     | 145     | C++, Embedded, ROS              |
| eth-robotics    | ETH Robotics Society            | Robotics         | ETH Zürich    | 120     | C++, CUDA, Control Systems      |
| eth-women       | ETH Women in Tech               | Community        | ETH Zürich    | 340     | Python, ML, Systems             |
| eth-entre       | ETH Entrepreneurship Club       | Entrepreneurship | ETH Zürich    | 190     | React, TypeScript, Product      |
| kit-data        | KIT Data Science Club           | Data             | KIT           | 95      | Python, Spark, Data Engineering |
| tud-robotics    | TU Darmstadt Robotics Club      | Robotics         | TU Darmstadt  | 110     | C++, Embedded, RTOS             |
| stuttgart-cloud | Uni Stuttgart Cloud Native Club | Cloud/DevOps     | Uni Stuttgart | 75      | Go, Kubernetes, DevOps          |
| lmu-oss         | LMU Open Source Lab             | Open Source      | LMU Munich    | 85      | Rust, WebAssembly, Open Source  |

---

## Ecosystem Component

New file: `src/components/eventiq/views/Ecosystem.tsx`

### Aggregate stats strip

Three stat chips in a horizontal row at the top:

- `247 candidates`
- `8 universities`
- `10 communities`

Styling: same compact card style as other views — `bg-card border border-border rounded-lg px-4 py-3` with a large number and small label.

### University Talent Pools section

Heading: `"University Talent Pools"` in `text-xs font-semibold uppercase tracking-wider text-muted-foreground`.

4-column card grid (`grid grid-cols-4 gap-3`). Each card (`bg-card border border-border rounded-lg p-4`):

- University short name: `text-sm font-semibold`
- Location: `text-xs text-muted-foreground`
- Candidate count: `text-2xl font-bold tabular-nums text-foreground` + `"candidates"` label in muted xs
- Top 3 skill chips: `text-[10px] px-1.5 py-0.5 rounded border border-primary/30 text-primary`
- Role affinity tag: `text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium`

### Student Communities section

Heading: `"Student Communities"` — same style as University section heading.

3-column card grid (`grid grid-cols-3 gap-3`). Each card (`bg-card border border-border rounded-lg p-4`):

- Org name: `text-sm font-semibold`
- Type badge — color-coded pill by `type`:
  - `"AI/ML"`: `bg-[#DCEFE2] text-[#1F4A2E]`
  - `"Robotics"`: `bg-[#E2E8F0] text-[#334155]`
  - `"Entrepreneurship"`: `bg-[#F5E7CC] text-[#7A5712]`
  - `"Cloud/DevOps"`: `bg-[#E8F0F5] text-[#1A4A6E]`
  - `"Data"`: `bg-[#F0E8F5] text-[#4A1A6E]`
  - `"Open Source"`: `bg-[#F5F0E8] text-[#6E4A1A]`
  - `"Community"`: `bg-secondary text-muted-foreground`
- University name: `text-xs text-muted-foreground`
- Member count: `text-lg font-bold tabular-nums` + `"members"` in `text-xs text-muted-foreground`
- Top 2 skill chips: same style as university cards

---

## Files Changed

| File                                         | Change                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/lib/eventiq/store.tsx`                  | Add `"ecosystem"` to `View` type                                                                             |
| `src/components/eventiq/Sidebar.tsx`         | Import `Network`; add ecosystem nav item                                                                     |
| `src/components/eventiq/AppLayout.tsx`       | Import and render `<Ecosystem />`                                                                            |
| `src/lib/eventiq/mockData.ts`                | Add `UniversityProfile`, `StudentCommunity` types; add `universityProfiles` and `studentCommunities` exports |
| `src/components/eventiq/views/Ecosystem.tsx` | New file — full view component                                                                               |

No new dependencies. No changes to any other view.
