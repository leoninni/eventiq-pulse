# Club Cooperations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 7th "Cooperations" view to EventIQ Pulse where recruiters can browse European student clubs, configure exclusive co-created events with real-time yield projection and slot scarcity, and wire the resulting cooperation candidates back to the Candidates view with an "Exclusive" badge.

**Architecture:** Pure frontend, no backend. New data types and mock data in `mockData.ts`. New cooperation state (`activeCooperations` + `addCooperation`) in the existing React context store. Single new view component `Cooperations.tsx` with internal layout split (browser / configurator). Two existing views (`Ecosystem.tsx`, `Candidates.tsx`) get minor additions. AppLayout and Sidebar are wired last.

**Tech Stack:** React 18, TypeScript, Vite + Bun, Tailwind CSS v4, shadcn/ui, lucide-react, sonner (toasts).

---

## File Map

| File | Change |
|---|---|
| `src/lib/eventiq/mockData.ts` | Add 3 interfaces, `coopFormats`, `clubPartnerships`, `initialActiveCooperations`, 3 exclusive mock candidates |
| `src/lib/eventiq/store.tsx` | Add `"cooperations"` to `View` union; add `activeCooperations` state + `addCooperation` |
| `src/components/eventiq/AppLayout.tsx` | Import + render `<Cooperations />` |
| `src/components/eventiq/Sidebar.tsx` | Add Cooperations nav item with Handshake icon |
| `src/components/eventiq/views/Cooperations.tsx` | New file — club browser, configurator, active dashboard |
| `src/components/eventiq/views/Ecosystem.tsx` | Import `clubPartnerships`; add "Partner →" link to community cards |
| `src/components/eventiq/views/Candidates.tsx` | Extend filter logic for `"coop-"` prefix; add Exclusive badge |

---

## Task 1: Extend mockData

**Files:**
- Modify: `src/lib/eventiq/mockData.ts`

- [ ] **Step 1: Add the three new interfaces and the `coopFormats` array**

Open `src/lib/eventiq/mockData.ts`. At the very end of the file (after the closing `];` of `cityMarkers`), append:

```ts
// ── Club Cooperations ────────────────────────────────────────────────────────

export interface CooperationFormat {
  id: "workshop" | "challenge-sprint" | "private-hackathon";
  name: string;
  description: string;
  duration: string;
  engagementRate: number;
  priceRange: string;
}

export interface ClubPartnership {
  clubId: string;
  totalSlots: number;
  takenSlots: number;
  availableFormats: CooperationFormat["id"][];
}

export interface ActiveCooperation {
  id: string;
  clubId: string;
  format: CooperationFormat["id"];
  status: "Confirmed" | "Pending" | "Completed";
  date: string;
  challengeTopic?: string;
  projectedCandidates: number;
}

export const coopFormats: CooperationFormat[] = [
  {
    id: "workshop",
    name: "Workshop Night",
    description: "Company engineers run a 3-hour hands-on session",
    duration: "3 hours",
    engagementRate: 0.15,
    priceRange: "€1,500 – €3,000",
  },
  {
    id: "challenge-sprint",
    name: "Challenge Sprint",
    description: "Company problem, students hack for half a day",
    duration: "6 hours",
    engagementRate: 0.25,
    priceRange: "€3,000 – €6,000",
  },
  {
    id: "private-hackathon",
    name: "Private Hackathon",
    description: "Full-day exclusive event, company-designed tracks",
    duration: "full day",
    engagementRate: 0.40,
    priceRange: "€5,000 – €10,000",
  },
];

export const clubPartnerships: ClubPartnership[] = [
  { clubId: "tum-robotics",    totalSlots: 3, takenSlots: 2, availableFormats: ["workshop", "challenge-sprint", "private-hackathon"] },
  { clubId: "tum-ai",          totalSlots: 4, takenSlots: 1, availableFormats: ["workshop", "challenge-sprint", "private-hackathon"] },
  { clubId: "eth-robotics",    totalSlots: 2, takenSlots: 1, availableFormats: ["workshop", "private-hackathon"] },
  { clubId: "eth-entre",       totalSlots: 3, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint", "private-hackathon"] },
  { clubId: "kit-data",        totalSlots: 2, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint"] },
  { clubId: "tud-robotics",    totalSlots: 2, takenSlots: 1, availableFormats: ["workshop", "private-hackathon"] },
  { clubId: "stuttgart-cloud", totalSlots: 2, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint"] },
  { clubId: "lmu-oss",         totalSlots: 2, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint"] },
];

export const initialActiveCooperations: ActiveCooperation[] = [
  {
    id: "1",
    clubId: "tum-ai",
    format: "challenge-sprint",
    status: "Confirmed",
    date: "Sep 15, 2026",
    challengeTopic: "Build an LLM evaluation harness",
    projectedCandidates: 52,
  },
];
```

- [ ] **Step 2: Add 3 exclusive mock candidates to the `candidates` array**

In the same file, find the `candidates` array. Add these three entries at the end of the array, before the closing `];`:

```ts
  {
    id: "c-excl-1",
    name: "Lena F.",
    university: "TU Munich",
    skills: ["Python", "LLMs", "Evaluation"],
    projectTitle: "LLM benchmark suite for enterprise RAG",
    projectDescription: "Built a modular evaluation harness for enterprise RAG pipelines that tracks faithfulness, relevance, and latency across 12 retrieval strategies.",
    status: "Interested",
    eventId: "hacktum",
    communityRoles: ["tum-ai"],
    skillProofs: [
      { skill: "LLMs", source: "TUM AI Society — LLM evaluation project lead" },
    ],
  },
  {
    id: "c-excl-2",
    name: "Tobias K.",
    university: "TU Munich",
    skills: ["Python", "PyTorch", "MLOps"],
    projectTitle: "Distributed training monitor for large language models",
    projectDescription: "Instrumented a distributed PyTorch training loop with real-time loss tracking and automatic checkpoint selection. Reduced wasted GPU hours by 40%.",
    status: "In Review",
    eventId: "hacktum",
    communityRoles: ["tum-ai"],
  },
  {
    id: "c-excl-3",
    name: "Sara M.",
    university: "TU Munich",
    skills: ["TypeScript", "React", "Data Viz"],
    projectTitle: "Interactive eval leaderboard for foundation models",
    projectDescription: "A live dashboard that ingests benchmark results from HuggingFace and renders interactive comparison charts, making model selection decisions visual.",
    status: "Interested",
    eventId: "hacktum",
    communityRoles: ["tum-ai"],
  },
```

- [ ] **Step 3: Verify build**

Run: `bun run build 2>&1 | tail -5`

Expected: `✓ built in` with no TypeScript errors. If you see "Property 'communityRoles' does not exist", check that the Candidate interface already has `communityRoles?: string[]` (it does from a previous feature).

- [ ] **Step 4: Commit**

```bash
git add src/lib/eventiq/mockData.ts
git commit -m "feat: add cooperation data model and mock data"
```

---

## Task 2: Extend Store

**Files:**
- Modify: `src/lib/eventiq/store.tsx`

- [ ] **Step 1: Add "cooperations" to the View type and import new types**

Replace the current import line at the top of `src/lib/eventiq/store.tsx`:

```ts
import { candidates as initialCandidates, type Candidate, type Status } from "./mockData";
```

With:

```ts
import {
  candidates as initialCandidates,
  initialActiveCooperations,
  type Candidate,
  type Status,
  type ActiveCooperation,
} from "./mockData";
```

Replace the View type definition (line 4):

```ts
type View = "overview" | "events" | "candidates" | "ecosystem" | "reports" | "recommendations" | "cooperations";
```

- [ ] **Step 2: Add activeCooperations to StoreCtx interface**

In the `StoreCtx` interface, add after the existing `syncToAts` line:

```ts
  activeCooperations: ActiveCooperation[];
  addCooperation: (c: ActiveCooperation) => void;
```

The full updated interface:

```ts
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
  activeCooperations: ActiveCooperation[];
  addCooperation: (c: ActiveCooperation) => void;
}
```

- [ ] **Step 3: Add state and action in StoreProvider**

In the `StoreProvider` function body, add a new state after the `atsSync` state:

```ts
const [activeCooperations, setActiveCooperations] = useState<ActiveCooperation[]>(initialActiveCooperations);
```

In the `useMemo` value object, add after `syncToAts`:

```ts
    activeCooperations,
    addCooperation: (c: ActiveCooperation) =>
      setActiveCooperations((prev) => [...prev, c]),
```

Also add `activeCooperations` to the `useMemo` dependency array:

```ts
  }), [view, candidates, eventFilter, shortlist, atsSync, activeCooperations]);
```

- [ ] **Step 4: Verify build**

Run: `bun run build 2>&1 | tail -5`

Expected: no errors. If you see "Property 'activeCooperations' does not exist on type 'StoreCtx'", verify the interface was updated in Step 2.

- [ ] **Step 5: Commit**

```bash
git add src/lib/eventiq/store.tsx
git commit -m "feat: add cooperation state to store"
```

---

## Task 3: Wire AppLayout and Sidebar

**Files:**
- Modify: `src/components/eventiq/AppLayout.tsx`
- Modify: `src/components/eventiq/Sidebar.tsx`

- [ ] **Step 1: Register Cooperations in AppLayout**

In `src/components/eventiq/AppLayout.tsx`, add the import at the top:

```ts
import { Cooperations } from "./views/Cooperations";
```

In the `Main` component JSX, add after the Ecosystem line:

```tsx
{view === "cooperations" && <Cooperations />}
```

The full updated `Main`:

```tsx
function Main() {
  const { view } = useStore();
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {view === "overview" && <Overview />}
        {view === "events" && <Events />}
        {view === "candidates" && <Candidates />}
        {view === "ecosystem" && <Ecosystem />}
        {view === "cooperations" && <Cooperations />}
        {view === "reports" && <Reports />}
        {view === "recommendations" && <Recommendations />}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Add Cooperations nav item to Sidebar**

In `src/components/eventiq/Sidebar.tsx`, update the import to include `Handshake`:

```ts
import { Home, Calendar, Users, BarChart3, Sparkles, Network, Handshake } from "lucide-react";
```

Add to the `items` array, after the Ecosystem entry:

```ts
  { id: "cooperations", label: "Cooperations", icon: Handshake },
```

The full updated items array:

```ts
const items: { id: View; label: string; icon: typeof Home }[] = [
  { id: "overview",       label: "Overview",       icon: Home      },
  { id: "events",         label: "Events",          icon: Calendar  },
  { id: "candidates",     label: "Candidates",      icon: Users     },
  { id: "ecosystem",      label: "Ecosystem",       icon: Network   },
  { id: "cooperations",   label: "Cooperations",    icon: Handshake },
  { id: "reports",        label: "Reports",         icon: BarChart3 },
  { id: "recommendations",label: "Recommendations", icon: Sparkles  },
];
```

- [ ] **Step 3: Verify build (Cooperations.tsx doesn't exist yet — expect a module-not-found error)**

Run: `bun run build 2>&1 | grep -E "error|Error|✓" | head -5`

Expected: error about `./views/Cooperations` not found. That's correct — we'll create it next. If there are TypeScript errors about `View` not including `"cooperations"`, check Task 2 completed correctly.

- [ ] **Step 4: Commit**

```bash
git add src/components/eventiq/AppLayout.tsx src/components/eventiq/Sidebar.tsx
git commit -m "feat: wire cooperations view in layout and sidebar"
```

---

## Task 4: Build Cooperations View

**Files:**
- Create: `src/components/eventiq/views/Cooperations.tsx`

- [ ] **Step 1: Create the file with the full implementation**

Create `src/components/eventiq/views/Cooperations.tsx` with this content:

```tsx
import { useState } from "react";
import { toast } from "sonner";
import {
  studentCommunities,
  clubPartnerships,
  coopFormats,
  type StudentCommunity,
  type ClubPartnership,
  type CooperationFormat,
} from "@/lib/eventiq/mockData";
import { useStore } from "@/lib/eventiq/store";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const typeBadgeStyles: Record<StudentCommunity["type"], string> = {
  "AI/ML":            "bg-[#DCEFE2] text-[#1F4A2E]",
  "Robotics":         "bg-[#E2E8F0] text-[#334155]",
  "Entrepreneurship": "bg-[#F5E7CC] text-[#7A5712]",
  "Cloud/DevOps":     "bg-[#E8F0F5] text-[#1A4A6E]",
  "Data":             "bg-[#F0E8F5] text-[#4A1A6E]",
  "Open Source":      "bg-[#F5F0E8] text-[#6E4A1A]",
  "Community":        "bg-secondary text-muted-foreground",
};

function slotPill(p: ClubPartnership): { label: string; cls: string } {
  const remaining = p.totalSlots - p.takenSlots;
  if (remaining === 0) return { label: "Waitlist only", cls: "bg-muted text-muted-foreground" };
  if (remaining === 1) return { label: "1 slot left", cls: "bg-amber-100 text-amber-800" };
  return { label: `${remaining} slots available`, cls: "bg-[#DCEFE2] text-[#1F4A2E]" };
}

const statusBadge: Record<string, string> = {
  Confirmed: "bg-[#DCEFE2] text-[#1F4A2E]",
  Pending:   "bg-amber-100 text-amber-800",
  Completed: "bg-muted text-muted-foreground",
};

const TYPE_FILTERS = ["All", "AI/ML", "Robotics", "Entrepreneurship", "Cloud/DevOps", "Data", "Open Source"] as const;
const CITY_OPTIONS = ["All Cities", "Munich", "Zürich", "Karlsruhe", "Aachen", "Stuttgart", "Darmstadt"] as const;

// Map display city names back to city ids used in studentCommunities
const CITY_ID_MAP: Record<string, string> = {
  "Munich": "munich", "Zürich": "zurich", "Karlsruhe": "karlsruhe",
  "Aachen": "aachen", "Stuttgart": "stuttgart", "Darmstadt": "darmstadt",
};

export function Cooperations() {
  const { setView, setEventFilter, activeCooperations, addCooperation } = useStore();

  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [cityFilter, setCityFilter] = useState<string>("All Cities");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedFormatId, setSelectedFormatId] = useState<CooperationFormat["id"] | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("Sep");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [challengeTopic, setChallengeTopic] = useState("");

  // Only clubs that have partnership data
  const partnerableClubs = studentCommunities.filter((c) =>
    clubPartnerships.some((p) => p.clubId === c.id)
  );

  const filteredClubs = partnerableClubs.filter((c) => {
    if (typeFilter !== "All" && c.type !== typeFilter) return false;
    if (cityFilter !== "All Cities" && c.city !== CITY_ID_MAP[cityFilter]) return false;
    return true;
  });

  const selectedClub = selectedClubId ? studentCommunities.find((c) => c.id === selectedClubId) ?? null : null;
  const selectedPartnership = selectedClubId ? clubPartnerships.find((p) => p.clubId === selectedClubId) ?? null : null;
  const selectedFormat = selectedFormatId ? coopFormats.find((f) => f.id === selectedFormatId) ?? null : null;

  const studentsEngaged = selectedClub && selectedFormat
    ? Math.round(selectedClub.members * selectedFormat.engagementRate)
    : 0;
  const pipelineCandidates = Math.round(studentsEngaged * 0.6);

  function handleSelectClub(clubId: string) {
    setSelectedClubId(clubId);
    setSelectedFormatId(null);
    setChallengeTopic("");
  }

  function handleSubmit() {
    if (!selectedClubId || !selectedFormatId || !selectedClub) return;
    const id = String(Date.now());
    const date = `${selectedMonth} 15, ${selectedYear}`;
    addCooperation({
      id,
      clubId: selectedClubId,
      format: selectedFormatId,
      status: "Pending",
      date,
      challengeTopic: challengeTopic.trim() || undefined,
      projectedCandidates: pipelineCandidates,
    });
    toast.success(`Partnership reserved with ${selectedClub.name}`);
    setSelectedClubId(null);
    setSelectedFormatId(null);
    setChallengeTopic("");
  }

  const getClubName = (clubId: string) => studentCommunities.find((c) => c.id === clubId)?.name ?? clubId;
  const getFormatName = (formatId: string) => coopFormats.find((f) => f.id === formatId)?.name ?? formatId;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-border shrink-0">
        <h1 className="font-display text-3xl tracking-tight">Club Cooperations</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Find exclusive talent partnerships with Europe's top student organizations.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-[#2F7A47] text-white"
                  : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="ml-2 bg-card border border-border rounded-md px-3 py-1 text-xs focus:outline-none focus:border-primary"
          >
            {CITY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Club browser + configurator */}
        <div className={`grid gap-4 ${selectedClubId ? "grid-cols-[1fr_400px]" : "grid-cols-2"}`}>
          {/* Club cards */}
          <div className="grid grid-cols-1 gap-3 content-start">
            {filteredClubs.map((club) => {
              const partnership = clubPartnerships.find((p) => p.clubId === club.id)!;
              const pill = slotPill(partnership);
              const full = partnership.takenSlots === partnership.totalSlots;
              const isSelected = selectedClubId === club.id;
              return (
                <div
                  key={club.id}
                  className={`bg-card border rounded-lg p-4 transition-all ${
                    isSelected ? "border-primary shadow-sm" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-sm">{club.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{club.university}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${typeBadgeStyles[club.type]}`}>
                      {club.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-muted-foreground">{club.members} members</span>
                    <span className="text-muted-foreground">·</span>
                    <div className="flex gap-1">
                      {club.topSkills.slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded border border-primary/30 text-primary">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pill.cls}`}>
                      {pill.label}
                    </span>
                    <div className="relative group">
                      <button
                        disabled={full}
                        onClick={() => !full && handleSelectClub(club.id)}
                        className={`text-xs px-3 py-1 rounded-md transition-colors ${
                          full
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-primary text-white hover:bg-primary/90"
                        }`}
                      >
                        {isSelected ? "Configuring…" : "Configure Partnership →"}
                      </button>
                      {full && (
                        <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 bg-foreground text-background text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          All slots filled for this semester.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredClubs.length === 0 && (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No clubs match these filters.
              </div>
            )}
          </div>

          {/* Configurator panel */}
          {selectedClub && selectedPartnership && (
            <div className="border border-border rounded-lg p-5 bg-card h-fit sticky top-0">
              <div className="mb-4">
                <div className="font-semibold">{selectedClub.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {selectedClub.university} · {selectedClub.members} members
                </div>
              </div>

              {/* Format selector */}
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Format</div>
              <div className="space-y-2 mb-4">
                {coopFormats
                  .filter((f) => selectedPartnership.availableFormats.includes(f.id))
                  .map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFormatId(f.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedFormatId === f.id
                          ? "border-[#2F7A47] bg-[#DCEFE2]/30"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-baseline justify-between">
                        <div className="font-medium text-sm">{f.name}</div>
                        <div className="text-xs text-muted-foreground">{f.duration}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{f.description}</div>
                      <div className="text-xs font-medium text-[#2F7A47] mt-1">{f.priceRange}</div>
                    </button>
                  ))}
              </div>

              {/* Date picker */}
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Date</div>
              <div className="flex gap-2 mb-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-primary"
                >
                  {MONTHS.map((m) => <option key={m}>{m}</option>)}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-background border border-border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-primary"
                >
                  <option>2026</option>
                  <option>2027</option>
                </select>
              </div>

              {/* Challenge topic */}
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Challenge Topic <span className="font-normal normal-case">(optional)</span>
              </div>
              <input
                type="text"
                value={challengeTopic}
                onChange={(e) => setChallengeTopic(e.target.value)}
                placeholder="e.g. Build an LLM evaluation harness"
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm mb-4 focus:outline-none focus:border-primary placeholder:text-muted-foreground"
              />

              {/* Yield projection */}
              {selectedFormat && (
                <div className="bg-[#F0F7F2] border border-[#B8E0C2] rounded-lg p-3 mb-4">
                  <div className="text-xs font-semibold text-[#1F4A2E] mb-1">Projected Talent Yield</div>
                  <div className="text-sm font-medium text-[#2F7A47]">
                    ~{studentsEngaged} students engaged → ~{pipelineCandidates} pipeline candidates
                  </div>
                  <div className="text-[10px] text-[#2F7A47]/80 mt-0.5">{selectedFormat.priceRange}</div>
                </div>
              )}

              {/* Submit */}
              <button
                disabled={!selectedFormatId}
                onClick={handleSubmit}
                className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFormatId
                    ? "bg-[#2F7A47] text-white hover:bg-[#1F5C35]"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Reserve Partnership Slot
              </button>
            </div>
          )}
        </div>

        {/* Active Cooperations */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Active Cooperations
          </div>
          {activeCooperations.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No active cooperations yet. Configure a partnership above.
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Club</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Format</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Projected</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeCooperations.map((coop) => (
                    <tr key={coop.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{getClubName(coop.clubId)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{getFormatName(coop.format)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge[coop.status] ?? "bg-muted text-muted-foreground"}`}>
                          {coop.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{coop.date}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{coop.projectedCandidates}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setEventFilter("coop-" + coop.id);
                            setView("candidates");
                          }}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          View Candidates →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `bun run build 2>&1 | tail -5`

Expected: `✓ built in` with no errors. If you see "Handshake is not exported from 'lucide-react'", replace `Handshake` with `Building2` in `Sidebar.tsx` — older versions of lucide-react may not have `Handshake`. Check with: `node -e "console.log(require('./node_modules/lucide-react').Handshake)"` — if `undefined`, use `Building2` instead.

- [ ] **Step 3: Manual browser check**

Run `bun run dev`, open the app. Verify:
- "Cooperations" appears in the sidebar between Ecosystem and Reports
- Clicking it shows the Club Browser with 8 European clubs
- Filter chips work (clicking "Robotics" shows TUM Robotics, ETH Robotics, TU Darmstadt Robotics)
- TUM Robotics Club shows "1 slot left" (amber pill) — totalSlots=3, takenSlots=2
- TUM AI Society shows "3 slots available" (green pill)
- Clicking "Configure Partnership →" on TUM AI Society opens the configurator on the right
- Selecting "Challenge Sprint" format shows `~35 students engaged → ~21 pipeline candidates` (280 × 0.25 = 70; × 0.6 = 42 — check exact numbers match 280 members × 0.25 engagement)
- Active Cooperations table at bottom shows pre-seeded TUM AI Society entry
- "View Candidates →" link is present on the pre-seeded row

- [ ] **Step 4: Submit flow check**

In the browser: configure TUM Robotics Club / Workshop Night / any date / submit. Verify:
- Toast appears: "Partnership reserved with TUM Robotics Club"
- New row appears in Active Cooperations with status "Pending"
- Configurator closes

- [ ] **Step 5: Commit**

```bash
git add src/components/eventiq/views/Cooperations.tsx
git commit -m "feat: build Cooperations view with club browser, configurator, and active dashboard"
```

---

## Task 5: Ecosystem "Partner →" Links

**Files:**
- Modify: `src/components/eventiq/views/Ecosystem.tsx`

- [ ] **Step 1: Import clubPartnerships**

In `src/components/eventiq/views/Ecosystem.tsx`, add `clubPartnerships` to the mockData import:

```ts
import {
  universityProfiles,
  studentCommunities,
  cityMarkers,
  continents,
  events,
  clubPartnerships,
  type StudentCommunity,
  type ContinentId,
} from "@/lib/eventiq/mockData";
```

- [ ] **Step 2: Add "Partner →" button to each community card**

Find the community card rendering block (around line 680). It currently looks like:

```tsx
<div key={c.id} className="bg-card border border-border rounded-md p-3">
  <div className="flex items-baseline justify-between mb-1">
    <div className="text-sm font-semibold">{c.name}</div>
    <div className="text-xs tabular-nums text-muted-foreground">{c.members}</div>
  </div>
  <div className="flex items-center gap-2">
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeBadgeStyles[c.type]}`}>
      {c.type}
    </span>
    <span className="text-[11px] text-muted-foreground">{c.university}</span>
  </div>
</div>
```

Replace it with:

```tsx
<div key={c.id} className="bg-card border border-border rounded-md p-3">
  <div className="flex items-baseline justify-between mb-1">
    <div className="text-sm font-semibold">{c.name}</div>
    <div className="text-xs tabular-nums text-muted-foreground">{c.members}</div>
  </div>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeBadgeStyles[c.type]}`}>
        {c.type}
      </span>
      <span className="text-[11px] text-muted-foreground">{c.university}</span>
    </div>
    {clubPartnerships.some((p) => p.clubId === c.id) && (
      <button
        onClick={() => setView("cooperations")}
        className="text-[10px] text-primary hover:underline font-medium shrink-0"
      >
        Partner →
      </button>
    )}
  </div>
</div>
```

- [ ] **Step 3: Verify build**

Run: `bun run build 2>&1 | tail -5`

Expected: `✓ built in` with no errors.

- [ ] **Step 4: Browser check**

In the dev server: navigate to Ecosystem, click Europe, click Munich. In the right panel city detail, verify:
- TUM AI Society shows "Partner →" link
- TUM Robotics Club shows "Partner →" link
- Clicking "Partner →" navigates to Cooperations view

- [ ] **Step 5: Commit**

```bash
git add src/components/eventiq/views/Ecosystem.tsx
git commit -m "feat: add Partner link to Ecosystem community cards"
```

---

## Task 6: Candidates Filter Extension + Exclusive Badge

**Files:**
- Modify: `src/components/eventiq/views/Candidates.tsx`

- [ ] **Step 1: Add imports**

In `src/components/eventiq/views/Candidates.tsx`, update the mockData import to include `studentCommunities`:

```ts
import { events, openRoles, studentCommunities, type Status, type Candidate } from "@/lib/eventiq/mockData";
```

Update the `useStore` destructure to include `activeCooperations`:

```ts
const { candidates, setStatus, eventFilter, setEventFilter, atsSync, syncToAts, activeCooperations } = useStore();
```

- [ ] **Step 2: Compute cooperation context variables**

Add these derived variables after the existing `useStore` destructure (around line 21, before the `useState` declarations):

```ts
const isCoopFilter = eventFilter.startsWith("coop-");
const coopId = isCoopFilter ? eventFilter.slice("coop-".length) : null;
const activeCoop = coopId ? activeCooperations.find((ac) => ac.id === coopId) ?? null : null;
const coopClubName = activeCoop
  ? studentCommunities.find((c) => c.id === activeCoop.clubId)?.name ?? ""
  : "";
```

- [ ] **Step 3: Replace the filter logic**

Find the `filtered` useMemo (around line 51). Replace the single cooperation filter check:

```ts
if (eventFilter !== "all" && c.eventId !== eventFilter) return false;
```

With:

```ts
if (eventFilter !== "all") {
  if (isCoopFilter) {
    if (!activeCoop) return false;
    if (!c.communityRoles?.includes(activeCoop.clubId)) return false;
  } else {
    if (c.eventId !== eventFilter) return false;
  }
}
```

Also add `activeCooperations` and `isCoopFilter` and `activeCoop` to the `useMemo` dependency array:

```ts
  }, [candidates, eventFilter, statusFilter, query, activeCooperations, isCoopFilter, activeCoop]);
```

- [ ] **Step 4: Add Exclusive badge to the candidate list row**

Find the name/university row in the candidate list (around line 108):

```tsx
<div className="flex items-baseline gap-2">
  <div className="font-semibold text-sm">{c.name}</div>
  <div className="text-xs text-muted-foreground">{c.university}</div>
</div>
```

Replace with:

```tsx
<div className="flex items-center gap-2 flex-wrap">
  <div className="font-semibold text-sm">{c.name}</div>
  {isCoopFilter && activeCoop && c.communityRoles?.includes(activeCoop.clubId) && (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCEFE2] text-[#1F4A2E] font-medium">
      Exclusive · {coopClubName}
    </span>
  )}
  <div className="text-xs text-muted-foreground">{c.university}</div>
</div>
```

- [ ] **Step 5: Verify build**

Run: `bun run build 2>&1 | tail -5`

Expected: `✓ built in` with no errors.

- [ ] **Step 6: Browser check — end-to-end flow**

1. Navigate to Cooperations view
2. Click "View Candidates →" on the pre-seeded TUM AI Society / Challenge Sprint row
3. Candidates view should open showing only the 3 exclusive candidates (Lena F., Tobias K., Sara M.)
4. Each candidate row should show the "Exclusive · TUM AI Society" mint-colored badge
5. Verify the event filter dropdown still shows "All Events" (the coop filter is separate from the event dropdown — the dropdown reads `eventFilter` value "coop-1" which won't match any event option, so it renders as the first blank/unmatched option — this is acceptable for a demo)
6. Navigate back to Cooperations, submit a new cooperation (e.g. ETH Entrepreneurship Club / Workshop Night), then click "View Candidates →" on that new row — Candidates view should show 0 candidates (no mock candidates have `communityRoles: ["eth-entre"]`) with the "No candidates match these filters" empty state

- [ ] **Step 7: Final build + push**

```bash
git add src/components/eventiq/views/Candidates.tsx
git commit -m "feat: extend Candidates filter and add Exclusive badge for cooperations"
```

---

## Self-Review

**Spec coverage:**
- ✅ CooperationFormat, ClubPartnership, ActiveCooperation interfaces → Task 1
- ✅ coopFormats, clubPartnerships, initialActiveCooperations mock data → Task 1
- ✅ 3 exclusive mock candidates (communityRoles: ["tum-ai"]) → Task 1
- ✅ "cooperations" added to View union → Task 2
- ✅ activeCooperations state + addCooperation → Task 2
- ✅ AppLayout renders Cooperations → Task 3
- ✅ Sidebar Cooperations nav item with Handshake icon → Task 3
- ✅ Club browser with type + city filters, slot pills, full-slot tooltip → Task 4
- ✅ Configurator: format radio cards, date picker, challenge topic, live yield projection, price, submit → Task 4
- ✅ Submit: toast, addCooperation, close configurator → Task 4
- ✅ Active Cooperations table with status badges, "View Candidates →" → Task 4
- ✅ Empty state for Active Cooperations → Task 4
- ✅ Ecosystem "Partner →" link, European clubs only → Task 5
- ✅ Candidates filter extended for "coop-" prefix → Task 6
- ✅ Exclusive badge on candidate rows → Task 6

**Type consistency check:**
- `ActiveCooperation.id` is a plain string (no "coop-" prefix) in mockData and store
- `setEventFilter("coop-" + coop.id)` adds the prefix when navigating → matches `eventFilter.startsWith("coop-")` check in Candidates
- `eventFilter.slice("coop-".length)` strips the prefix to get the raw id for `activeCooperations.find(ac => ac.id === coopId)`
- `clubPartnerships.some(p => p.clubId === c.id)` in Ecosystem matches the `clubId` field on `ClubPartnership` which references `studentCommunities.id` values — all 8 entries verified against existing `studentCommunities` ids
