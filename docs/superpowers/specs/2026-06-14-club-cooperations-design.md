# Club Cooperations Feature

**Date:** 2026-06-14
**Status:** Approved

## Problem

EventIQ Pulse currently only lets companies sponsor existing hackathons and events. The founders ARE the student ecosystem — they run robotics clubs, AI societies, and entrepreneurship groups at top European universities. This gives them something no competitor can replicate: the ability to sell exclusive co-created events between companies and specific student clubs. The product has no way to surface or sell this. This spec adds it.

## Goal

A recruiter can browse European student clubs, see real-time slot scarcity, configure a custom co-created event (format, dates, challenge topic), reserve a partnership slot, and immediately see a projected talent yield. Submitted cooperations appear in an active dashboard and wire back to the Candidates view via an "Exclusive" badge.

## What This Is Not

- No backend. All data is hardcoded mock data.
- No payment processing. "Reserve Partnership Slot" is a UI-only action.
- No real-time backend state. Active cooperations live in React state and reset on page reload.

---

## Data Model (`src/lib/eventiq/mockData.ts`)

### New interfaces

```ts
export interface CooperationFormat {
  id: "workshop" | "challenge-sprint" | "private-hackathon";
  name: string;
  description: string;
  duration: string;
  engagementRate: number;   // fraction of club members expected to engage
  priceRange: string;
}

export interface ClubPartnership {
  clubId: string;           // matches a studentCommunities id
  totalSlots: number;
  takenSlots: number;
  availableFormats: CooperationFormat["id"][];
}

export interface ActiveCooperation {
  id: string;
  clubId: string;
  format: CooperationFormat["id"];
  status: "Confirmed" | "Pending" | "Completed";
  date: string;             // formatted as "Mon DD, YYYY", e.g. "Sep 15, 2026"
  challengeTopic?: string;
  projectedCandidates: number;
}
```

### `coopFormats` array (canonical, referenced everywhere)

```ts
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
```

### `clubPartnerships` array (European clubs only)

```ts
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
```

### `initialActiveCooperations` array (pre-seeded for demo)

```ts
export const initialActiveCooperations: ActiveCooperation[] = [
  {
    id: "1",   // plain id; filter value = "coop-1"
    clubId: "tum-ai",
    format: "challenge-sprint",
    status: "Confirmed",
    date: "Sep 15, 2026",
    challengeTopic: "Build an LLM evaluation harness",
    projectedCandidates: 52,
  },
];
```

### New mock candidates with `communityRoles: ["tum-ai"]`

Add 2–3 candidates to the existing `candidates` array whose `communityRoles` includes `"tum-ai"`. These will carry the Exclusive badge when filtered via `"coop-1"`. Example:

```ts
{
  id: "c-excl-1",
  name: "Lena F.",
  university: "TU Munich",
  skills: ["Python", "LLMs", "Evaluation"],
  projectTitle: "LLM benchmark suite for enterprise RAG",
  projectDescription: "Built a modular eval harness for enterprise RAG pipelines...",
  status: "Interested",
  eventId: "hacktum",
  communityRoles: ["tum-ai"],
},
```

---

## Store (`src/lib/eventiq/store.tsx`)

### View type

Add `"cooperations"` to the `View` union:

```ts
type View = "overview" | "events" | "candidates" | "ecosystem" | "reports" | "recommendations" | "cooperations";
```

### Active cooperations state

Add to `StoreCtx`:

```ts
activeCooperations: ActiveCooperation[];
addCooperation: (c: ActiveCooperation) => void;
```

Initialize from `initialActiveCooperations`. The `addCooperation` action appends to local state (no backend).

---

## New View (`src/components/eventiq/views/Cooperations.tsx`)

Single file, three logical sections rendered top-to-bottom. When a club card is clicked, the layout splits: club browser on the left (narrowed), configurator on the right.

### Page header

```
h1: "Club Cooperations"
p:  "Find exclusive talent partnerships with Europe's top student organizations."
```

### Club Browser

**Filter row:**
- Type chips: All / AI/ML / Robotics / Entrepreneurship / Cloud/DevOps / Data / Open Source. Active chip is filled green.
- City dropdown: All Cities / Munich / Zürich / Karlsruhe / Aachen / Stuttgart / Darmstadt.
- Filtering is done by joining `studentCommunities` (for name, type, city, members, topSkills) with `clubPartnerships` (for slot data). Only clubs present in `clubPartnerships` appear.

**Club cards (2-column grid when no configurator open; single column when configurator open):**

Each card shows:
- Club name (font-semibold) + type badge (duplicate the `typeBadgeStyles` Record from `Ecosystem.tsx` into `Cooperations.tsx` — same values, no shared import needed for a demo)
- University name (text-muted-foreground text-xs)
- Member count + top 2 skills as small chips
- Slot pill:
  - `takenSlots === totalSlots` → gray "Waitlist only"
  - `totalSlots - takenSlots === 1` → amber "1 slot left"
  - else → green "{N} slots available"
- "Configure Partnership →" button (primary style). Disabled + tooltip "All slots filled for this semester" when full.
- Clicking a non-full card sets `selectedClubId` state and opens the configurator.

### Configurator (right panel, inline)

State: `selectedFormatId`, `selectedMonth`, `selectedYear`, `challengeTopic`.

**Club header:** name, university, member count.

**Format selector:** 3 radio cards from `coopFormats`. Each shows name, description, duration, price range. Selected card has green ring border. Only formats in `partnership.availableFormats` are shown.

**Date picker:** two `<select>` dropdowns:
- Month: Jan / Feb / Mar / Apr / May / Jun / Jul / Aug / Sep / Oct / Nov / Dec
- Year: 2026 / 2027
- Default: Sep / 2026

**Challenge topic:** `<input type="text">`, optional, placeholder "e.g. Build an LLM evaluation harness".

**Live yield projection** (updates when format changes):
```
studentsEngaged = Math.round(club.members × format.engagementRate)
pipelineCandidates = Math.round(studentsEngaged × 0.6)
Display: "~{studentsEngaged} students engaged → ~{pipelineCandidates} pipeline candidates"
```

**Price estimate:** `format.priceRange`

**Submit button:** "Reserve Partnership Slot"

On submit:
1. Construct date string: `"{MonthName} 15, {Year}"` (hardcoded day 15 for demo)
2. Generate a unique id: `const id = String(Date.now())` (plain timestamp, no prefix)
3. Call `addCooperation({ id, clubId, format: selectedFormatId, status: "Pending", date, challengeTopic: challengeTopic || undefined, projectedCandidates: pipelineCandidates })`
4. Fire sonner toast: `toast.success("Partnership reserved with {clubName}")`
5. Clear `selectedClubId` to close configurator

### Active Cooperations (bottom section)

Header: "Active Cooperations"

Table with columns: Club, Format, Status, Date, Projected Candidates, Action.

- Club: club name (looked up from `studentCommunities`)
- Format: format name (looked up from `coopFormats`)
- Status: colored badge — Confirmed (green), Pending (amber), Completed (muted)
- Date: date string
- Projected Candidates: tabular-nums
- Action: "View Candidates →" link. On click: `setEventFilter("coop-" + cooperation.id)` then `setView("candidates")`. Since `cooperation.id` is a plain timestamp string (e.g. `"1718362800000"`), the filter value becomes `"coop-1718362800000"` — which the Candidates filter recognizes via the `startsWith("coop-")` check.

If `activeCooperations` is empty: show an empty state — "No active cooperations yet. Configure a partnership above."

---

## Ecosystem View (`src/components/eventiq/views/Ecosystem.tsx`)

On each community card in the right panel (city detail view), add a small "Partner →" text link below the type badge:

```tsx
<button
  onClick={() => setView("cooperations")}
  className="text-[10px] text-primary hover:underline font-medium mt-1"
>
  Partner →
</button>
```

Only show this link if the club has a partnership entry in `clubPartnerships` (i.e., `clubPartnerships.some(p => p.clubId === c.id)`). Non-partnered clubs (North America / Asia) show nothing.

---

## Candidates View (`src/components/eventiq/views/Candidates.tsx`)

### Filter logic extension

Current logic (line ~53):
```ts
if (eventFilter !== "all" && c.eventId !== eventFilter) return false;
```

Extend to handle cooperation filter:
```ts
if (eventFilter !== "all") {
  if (eventFilter.startsWith("coop-")) {
    // Find the cooperation and filter by communityRoles matching its clubId
    const coopId = eventFilter.slice("coop-".length);  // strip prefix to get raw id
    const coop = activeCooperations.find(ac => ac.id === coopId);
    if (!coop) return false;
    if (!c.communityRoles?.includes(coop.clubId)) return false;
  } else {
    if (c.eventId !== eventFilter) return false;
  }
}
```

`activeCooperations` comes from `useStore()`.

### Exclusive badge

In the candidate row/drawer, when `eventFilter.startsWith("coop-")`, show an "Exclusive" chip next to the candidate name:

```tsx
{isCoopFilter && candidate.communityRoles?.some(r => coopClubId === r) && (
  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCEFE2] text-[#1F4A2E] font-medium">
    Exclusive · {clubName}
  </span>
)}
```

Where `clubName` is looked up from `studentCommunities` using the cooperation's `clubId`.

---

## AppLayout (`src/components/eventiq/AppLayout.tsx`)

Import `Cooperations` and add:
```tsx
{view === "cooperations" && <Cooperations />}
```

---

## Sidebar (`src/components/eventiq/Sidebar.tsx`)

Add to the `items` array (after Ecosystem, before Reports):
```ts
{ id: "cooperations", label: "Cooperations", icon: Handshake },
```

Import `Handshake` from `lucide-react`.

---

## Success Criteria

1. Recruiter can browse clubs, see slot scarcity, configure a cooperation, and submit in under 60 seconds.
2. Projected yield updates live when format is changed.
3. Active Cooperations dashboard shows the pre-seeded TUM AI Society / Challenge Sprint entry on load.
4. "View Candidates →" from Active Cooperations navigates to Candidates view showing only TUM AI Society candidates.
5. Those candidates display an "Exclusive · TUM AI Society" badge.
6. "Partner →" in Ecosystem community cards navigates to Cooperations view (only for European clubs with partnership data).
7. TypeScript compiles cleanly (`bun run build` passes).
