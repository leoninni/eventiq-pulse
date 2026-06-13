# Verified Talent Profiles

**Date:** 2026-06-13  
**Scope:** Add skill verification proofs and community roles to candidates — frontend only, mock data  
**Constraint:** No new files. No backend. All data hardcoded in mockData.ts.

---

## Context

EventIQ's core moat is first-party access to student event data that no ATS or LinkedIn has. The current candidate profiles show skills as plain text tags — indistinguishable from a self-reported LinkedIn profile. The Verified Talent layer makes that moat visible: skills are annotated with proof sources (hackathon placement, project work, competition result) and candidates show their community roles (robotics club lead, entrepreneurship network member). This is the primary demo differentiator for the startup pitch.

---

## Data Model

Two new optional fields added to the `Candidate` interface in `mockData.ts`:

```ts
interface Candidate {
  // ...existing fields...
  skillProofs?: { skill: string; source: string }[];
  communityRoles?: string[];
}
```

**`skillProofs`** — Each entry maps one skill to a human-readable proof source. The `skill` value must exactly match a string in the candidate's existing `skills[]` array (for rendering lookup). Unmatched skills render as plain chips.

Example:
```ts
skillProofs: [
  { skill: "Python", source: "1st place · HackTUM 2025" },
  { skill: "ML",     source: "ETH Build Night finalist" },
]
```

**`communityRoles`** — Free-form strings displayed as tags. Empty or absent = section hidden.

Example:
```ts
communityRoles: ["Robotics Club Lead · TUM", "ETH Entrepreneurship Network"]
```

### Candidates updated with verified data (8 of 12)

| ID | Name | Skill proofs | Community roles |
|---|---|---|---|
| c1 | Felix M. | Python → 1st HackTUM 2025; ML → HackTUM best AI project | TUM AI Society |
| c2 | Anika S. | C++ → ETH Build Night systems winner; CUDA → ETH HPC course top project | TUM Robotics Club, ETH Women in Tech |
| c4 | Lena K. | Python → KIT Innovation Hack finalist; Spark → KIT Data Engineering seminar | KIT Data Science Club |
| c5 | Markus B. | Rust → START Hack systems track winner; WebAssembly → Mozilla Hacks contributor | TU Darmstadt OS Lab |
| c6 | Priya N. | ML → HackTUM computer vision track 1st; PyTorch → NeurIPS workshop paper | TUM ML Society, Women in AI Munich |
| c7 | Tim R. | Go → START Hack infra track winner; Kubernetes → CNCF student contributor | Uni Stuttgart Cloud Native Club |
| c9 | Daniel H. | Java → TUM Software Engineering award; Microservices → HackTUM enterprise track | TUM Enterprise Software Group |
| c11 | Lukas F. | C++ → CODE Berlin embedded track 1st; Embedded → TUM Robotics team lead | TUM Robotics Club Lead, FIRST Germany |

---

## UI: Candidate List Row

The existing row layout shows name, university, skills, match badge, and status badge. Add one line below the match badge when `skillProofs` is non-empty:

```
[ 92% · ML/AI Working Student ]   ← existing match badge
[ ✓ Verified · 2 skill proofs  ]  ← new verified indicator
[ Interviewed ]                    ← existing status badge
```

**Verified indicator chip:** `bg-[#DCEFE2] text-[#1F4A2E]` with a small `ShieldCheck` icon (lucide). Shows count of proofs. Single line, compact.

Only rendered when `skillProofs?.length > 0`. Candidates with no proofs are unchanged.

---

## UI: Candidate Drawer — Skills Section

Current: plain flex-wrap of skill name badges.

New: if the candidate has `skillProofs`, render each skill as a two-line chip:
- Line 1: skill name (existing style)
- Line 2: proof source in `text-xs text-muted-foreground` below

Skills with no matching proof entry render as plain single-line chips (existing behaviour).

Layout: still flex-wrap, but chips are taller when they have a proof. No fixed height — let content drive it.

---

## UI: Candidate Drawer — Community Section

New section inserted between the Skills section and the Role Match section.

Only rendered when `communityRoles` is non-empty.

**Header:** "Community" in the same style as existing section headers.

**Body:** flex-wrap of role tags, same chip style as skills but with a `Users` icon prefix.

```
[ 👥 Robotics Club Lead · TUM ]  [ 👥 ETH Entrepreneurship Network ]
```

---

## Files Changed

| File | Change |
|---|---|
| `src/lib/eventiq/mockData.ts` | Add `skillProofs` and `communityRoles` to `Candidate` interface; populate 8 candidates |
| `src/components/eventiq/views/Candidates.tsx` | Add verified chip to list row; update skills rendering in drawer; add Community section |

No new files. No routing changes. No store changes.

---

## Design Constraints

- All new UI uses existing colour tokens: `#DCEFE2`, `#1F4A2E`, `#2F7A47`, `text-muted-foreground`
- Icons from lucide-react only (`ShieldCheck`, `Users`)
- No external dependencies
- Candidates without verified data are visually identical to current state
