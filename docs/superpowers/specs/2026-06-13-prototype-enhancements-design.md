# EventIQ Pulse — Prototype Enhancements

**Date:** 2026-06-13  
**Scope:** Three additive UI features to strengthen the demo for VC and customer audiences  
**Constraint:** Pure frontend, no backend. All data remains hardcoded mock data. Must integrate seamlessly with the existing sage green design system.

---

## Context

The current prototype covers the full recruiter workflow (Overview → Events → Candidates → Reports → Recommendations) but has three gaps that weaken live demos:

1. The Overview pipeline donut doesn't tell an ROI story — it shows status distribution but not conversion drop-off.
2. Candidates have no match signal — there's no answer to "which of these 247 people should I actually call?"
3. The "Add to ATS" button shows a "coming soon" toast, which kills credibility in any real demo.

All three features target **early talent recruiting from technical universities** — the mock data focuses on interns and working students sourced from DACH hackathons (HackTUM, START Hack, ETH Build Night, etc.).

---

## Feature 1: Pipeline Conversion Funnel

### What it replaces
The donut chart in the Overview's right panel (`col-span-2`) is replaced by a custom horizontal funnel. The donut is removed entirely.

### Funnel stages and data
Six stages, hardcoded in `mockData.ts` as a `funnelData` export:

| Stage | Value | Notes |
|---|---|---|
| Attendees | 1,760 | Sum of `event.attendees` across all events |
| Opt-ins | 247 | Sum of `event.optIns` — matches existing KPI card |
| Contacted | 178 | ~72% of opt-ins; realistic follow-up rate |
| In Pipeline | 34 | Matches existing "in active pipeline" KPI |
| Interviewed | 12 | Derived from candidate statuses |
| Offers | 3 | Independently hardcoded; tells a realistic story (mock candidate list has 1, but funnelData is a separate export) |

Each stage has a `label`, `value`, and an optional `pct` (conversion rate from previous stage, shown as a small annotation on the bar).

### Visual treatment
A vertical stack of horizontal bars inside the existing card. Each bar is a `div` with percentage-based width relative to the widest stage (Attendees = 100%). Color transitions from light mint (`#E3E8E3` for Attendees) through mint green (`#B8E0C2`) to forest green (`#2F7A47`) to near-black (`#0F1410`) as stages narrow. Conversion percentages shown in muted green next to each value. No external chart library — pure Tailwind CSS divs.

### Location
Implemented as an inline `ConversionFunnel` component within `Overview.tsx`. Not extracted to a separate file.

---

## Feature 2: Candidate Match Score + Open Roles

### New data: `openRoles`
Added to `mockData.ts` as `OpenRole[]`:

```ts
interface OpenRole {
  id: string;
  title: string;
  skills: string[]; // required skills for matching
}
```

Four roles focused on early talent / university hiring:

| ID | Title | Required Skills |
|---|---|---|
| `role-ml` | ML/AI Working Student | Python, ML, PyTorch, LLMs |
| `role-backend` | Backend Engineering Intern | Go, Java, Node, Microservices, Spark |
| `role-systems` | Systems Engineering Intern | C++, CUDA, Rust, Embedded, RTOS |
| `role-frontend` | Frontend Working Student | React, TypeScript, GraphQL |

### Match score algorithm
A pure utility function `matchScore(candidate: Candidate, roles: OpenRole[])` in `src/lib/utils.ts`:

- For each role: `score = (intersection(candidate.skills, role.skills).length / role.skills.length) * 100`
- Returns `{ roleId, roleTitle, score }[]` sorted by score descending
- The best match (`[0]`) is used for the list row badge; all four are shown in the drawer

### UI: Candidate list row
A match score badge is added to the right column of each candidate row, above the status badge:

```
[ 92% · ML/AI Working Student ]   ← green pill (bg #DCEFE2, text #1F4A2E)
[ Interviewed ]                    ← existing status badge
```

Only shown when the best match score ≥ 40%. Below that threshold the badge is omitted (candidate doesn't fit any open role well enough to signal).

### UI: Candidate detail drawer
A new **Role Match** section is inserted between the skills tags and the project description. Shows all four roles as a stacked list:

- Best match: highlighted row with mint background (`#DCEFE2`), score in forest green
- Other roles: muted background (`#F8FAF8`), score in `text-muted-foreground`

No interactivity — read-only display.

---

## Feature 3: ATS Integration Flow

### State
`atsSync: Record<string, string>` added to the Context store in `store.tsx`, mapping `candidateId → atsName`. Persists in-memory for the session (resets on page reload, consistent with all other prototype state).

Action: `syncToAts(candidateId: string, atsName: string) => void` — sets the mapping only. Modal closing is handled by component state, consistent with how the email modal works.

### ATS options
Four systems, ordered by DACH market relevance:

| Name | Color | Initial |
|---|---|---|
| Greenhouse | `#23A47C` | G |
| Personio | `#1A56DB` | P |
| Lever | `#5865F2` | L |
| Ashby | `#FF6B35` | A |

### Modal flow (3 steps)
Implemented inline in `Candidates.tsx` alongside the existing email modal, using the same fixed-overlay pattern.

**Step 1 — Choose ATS:** Four ATS cards in a vertical list. Clicking one selects it (green border + checkmark). A "Sync to [ATS]" primary button triggers step 2.

**Step 2 — Syncing:** Spinner (CSS `border-top` animation using existing design tokens) with "Syncing [name] to [ATS]..." label. Auto-advances to step 3 after 1200ms via `setTimeout`.

**Step 3 — Success:** Green checkmark circle, candidate name, confirmation copy ("added as a candidate in your [ATS] pipeline"). Closes modal on button click or overlay click.

### Post-sync UI
After syncing, the candidate row and detail drawer both show a small synced pill badge:

```
[ Synced · Greenhouse ]   ← bg #DCEFE2, text #2F7A47, border #B8E0C2
```

The "Add to ATS" button in the drawer is replaced by a disabled "Synced to [ATS]" state when already synced.

---

## Architecture Summary

### Files changed

| File | Change |
|---|---|
| `src/lib/eventiq/mockData.ts` | Add `OpenRole` type, `openRoles` export, `funnelData` export. Candidate records are unchanged — the early talent framing is expressed through the `openRoles` data (intern/working student titles), not edits to existing candidates. |
| `src/lib/eventiq/store.tsx` | Add `atsSync: Record<string, string>` state, `syncToAts(id, ats)` action |
| `src/lib/utils.ts` | Add `matchScore(candidate, roles)` utility |
| `src/components/eventiq/views/Overview.tsx` | Replace donut + legend with inline `ConversionFunnel` component |
| `src/components/eventiq/views/Candidates.tsx` | Add match badge on rows, Role Match section in drawer, ATS modal, synced badge logic |

### No new files
All new logic lives inside existing files, following the current pattern. No new component files are introduced.

---

## Design constraints

- All new UI uses only existing Tailwind CSS design tokens (`bg-card`, `border-border`, `text-muted-foreground`, `bg-mint`, etc.)
- No new dependencies
- No changes to routing, layout, sidebar, or any view other than Overview and Candidates
- Reports and Events views are untouched
- The hardcoded company name "Syntara Engineering" in the email template is out of scope for this spec
