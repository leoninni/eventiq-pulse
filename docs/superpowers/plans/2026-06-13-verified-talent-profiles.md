# Verified Talent Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add skill proof annotations and community roles to candidates, making EventIQ's data moat visible in both the list and the detail drawer.

**Architecture:** Two files only — extend the `Candidate` type in `mockData.ts` with two optional fields, then update `Candidates.tsx` to render them. No new files, no store changes, no routing changes.

**Tech Stack:** React, TypeScript, Tailwind CSS, lucide-react

---

### Task 1: Extend the Candidate type and populate mock data

**Files:**
- Modify: `src/lib/eventiq/mockData.ts`

- [ ] **Step 1: Add `skillProofs` and `communityRoles` to the `Candidate` interface**

Find the existing interface (lines 7–16) and replace it with:

```ts
export interface Candidate {
  id: string;
  name: string;
  university: string;
  skills: string[];
  projectTitle: string;
  projectDescription: string;
  status: Status;
  eventId: string;
  skillProofs?: { skill: string; source: string }[];
  communityRoles?: string[];
}
```

- [ ] **Step 2: Update 8 candidates with verified data**

Replace the `candidates` array with the following (the 4 unverified candidates — c3, c8, c10, c12 — are unchanged):

```ts
export const candidates: Candidate[] = [
  {
    id: "c1", name: "Felix M.", university: "TU Munich",
    skills: ["Python", "ML", "LLMs"],
    projectTitle: "Real-time RAG pipeline for enterprise docs",
    projectDescription: "An end-to-end retrieval pipeline that indexes internal documentation and serves grounded answers with sub-second latency. Built with hybrid search and a fine-tuned reranker.",
    status: "Interviewed", eventId: "hacktum",
    skillProofs: [
      { skill: "Python", source: "1st place · HackTUM 2025" },
      { skill: "ML",     source: "HackTUM best AI project award" },
    ],
    communityRoles: ["TUM AI Society"],
  },
  {
    id: "c2", name: "Anika S.", university: "ETH Zürich",
    skills: ["C++", "Systems", "CUDA"],
    projectTitle: "GPU-accelerated graph traversal",
    projectDescription: "A CUDA implementation of frontier-based BFS that outperforms standard CPU baselines on billion-edge graphs. Submitted to a systems track at ETH Build Night.",
    status: "Interested", eventId: "hacktum",
    skillProofs: [
      { skill: "C++",    source: "ETH Build Night systems track winner" },
      { skill: "CUDA",   source: "ETH HPC Seminar — top project" },
    ],
    communityRoles: ["TUM Robotics Club", "ETH Women in Tech"],
  },
  {
    id: "c3", name: "Jonas W.", university: "TU Berlin",
    skills: ["React", "TypeScript", "Node"],
    projectTitle: "Collaborative whiteboard with CRDT sync",
    projectDescription: "A multiplayer whiteboard built on Yjs with offline-first sync. Designed for low-bandwidth classrooms with conflict-free merges across devices.",
    status: "Interested", eventId: "starthack",
  },
  {
    id: "c4", name: "Lena K.", university: "KIT",
    skills: ["Python", "Data Engineering", "Spark"],
    projectTitle: "Stream processing pipeline for IoT sensors",
    projectDescription: "A Spark-streaming pipeline ingesting telemetry from 10k sensors with windowed aggregation and anomaly detection. Production-grade backpressure handling.",
    status: "In Review", eventId: "kithack",
    skillProofs: [
      { skill: "Python", source: "KIT Innovation Hack finalist" },
      { skill: "Spark",  source: "KIT Data Engineering seminar — top project" },
    ],
    communityRoles: ["KIT Data Science Club"],
  },
  {
    id: "c5", name: "Markus B.", university: "LMU Munich",
    skills: ["Rust", "WebAssembly", "Systems"],
    projectTitle: "WASM-based in-browser SQL engine",
    projectDescription: "A SQLite-compatible query engine compiled to WebAssembly, enabling rich analytics without a backend. Won the systems track at START Hack.",
    status: "Interviewed", eventId: "starthack",
    skillProofs: [
      { skill: "Rust",          source: "START Hack systems track winner" },
      { skill: "WebAssembly",   source: "Mozilla Hacks open-source contributor" },
    ],
    communityRoles: ["TU Darmstadt OS Lab"],
  },
  {
    id: "c6", name: "Priya N.", university: "TU Munich",
    skills: ["ML", "PyTorch", "Computer Vision"],
    projectTitle: "Real-time defect detection for manufacturing",
    projectDescription: "A lightweight vision model running at 60fps on edge hardware, trained with synthetic data augmentation. Already piloted at a Bavarian auto supplier.",
    status: "Offer Extended", eventId: "hacktum",
    skillProofs: [
      { skill: "ML",             source: "HackTUM computer vision track — 1st place" },
      { skill: "PyTorch",        source: "NeurIPS 2024 student workshop paper" },
    ],
    communityRoles: ["TUM ML Society", "Women in AI Munich"],
  },
  {
    id: "c7", name: "Tim R.", university: "Uni Stuttgart",
    skills: ["Go", "Kubernetes", "DevOps"],
    projectTitle: "Self-healing k8s cluster management tool",
    projectDescription: "An operator that detects failing nodes via custom probes and automatically reschedules workloads with zero downtime. Tested on a 200-node cluster.",
    status: "In Review", eventId: "starthack",
    skillProofs: [
      { skill: "Go",          source: "START Hack infrastructure track winner" },
      { skill: "Kubernetes",  source: "CNCF Student Contributor — open-source" },
    ],
    communityRoles: ["Uni Stuttgart Cloud Native Club"],
  },
  {
    id: "c8", name: "Clara V.", university: "RWTH Aachen",
    skills: ["Python", "NLP", "APIs"],
    projectTitle: "Multilingual intent classifier for B2B chatbots",
    projectDescription: "Fine-tuned multilingual transformer reaching 94% F1 on a custom enterprise intent dataset across 6 languages.",
    status: "Rejected", eventId: "codeberlin",
  },
  {
    id: "c9", name: "Daniel H.", university: "TU Munich",
    skills: ["Java", "Spring", "Microservices"],
    projectTitle: "Event-driven inventory sync system",
    projectDescription: "A Kafka-backed inventory service synchronizing stock across 50 warehouses with exactly-once delivery semantics.",
    status: "In Review", eventId: "hacktum",
    skillProofs: [
      { skill: "Java",          source: "TUM Software Engineering Excellence Award" },
      { skill: "Microservices", source: "HackTUM enterprise track — finalist" },
    ],
    communityRoles: ["TUM Enterprise Software Group"],
  },
  {
    id: "c10", name: "Sophie A.", university: "ETH Zürich",
    skills: ["Python", "Reinforcement Learning"],
    projectTitle: "RL agent for dynamic pricing optimization",
    projectDescription: "A PPO agent that learns dynamic pricing strategies in simulated marketplaces, outperforming rule-based baselines by 18% revenue.",
    status: "Interested", eventId: "hacktum",
  },
  {
    id: "c11", name: "Lukas F.", university: "TU Darmstadt",
    skills: ["C++", "Embedded", "RTOS"],
    projectTitle: "Low-latency sensor fusion for robotics",
    projectDescription: "A real-time sensor fusion stack on FreeRTOS combining LIDAR and IMU at sub-millisecond latency for autonomous robotics.",
    status: "Interested", eventId: "codeberlin",
    skillProofs: [
      { skill: "C++",      source: "CODE Berlin embedded track — 1st place" },
      { skill: "Embedded", source: "TUM Robotics team technical lead" },
    ],
    communityRoles: ["TUM Robotics Club Lead", "FIRST Robotics Germany"],
  },
  {
    id: "c12", name: "Mia T.", university: "Uni Hamburg",
    skills: ["TypeScript", "GraphQL", "React"],
    projectTitle: "Real-time collaborative code editor",
    projectDescription: "A browser-based code editor with sub-100ms multiplayer sync, Monaco integration, and language-server protocol support.",
    status: "Rejected", eventId: "codeberlin",
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/eventiq/mockData.ts
git commit -m "feat: add skillProofs and communityRoles to Candidate type and mock data"
```

---

### Task 2: Add verified chip to candidate list row

**Files:**
- Modify: `src/components/eventiq/views/Candidates.tsx`

- [ ] **Step 1: Add `ShieldCheck` and `Users` to the lucide-react import**

Find the existing import at the top of the file:
```ts
import { Search, Mail, PlusCircle, Check } from "lucide-react";
```

Replace with:
```ts
import { Search, Mail, PlusCircle, Check, ShieldCheck, Users } from "lucide-react";
```

- [ ] **Step 2: Add the verified chip after the match score badge in the list row**

Find this block in the list row (inside the `<div className="flex flex-col items-end gap-1.5 shrink-0">` at line ~119):

```tsx
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
```

Replace with:

```tsx
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
                {c.skillProofs && c.skillProofs.length > 0 && (
                  <div className="flex items-center gap-1 bg-[#F0F7F2] border border-[#B8E0C2] rounded px-1.5 py-0.5">
                    <ShieldCheck className="w-3 h-3 text-[#2F7A47] shrink-0" />
                    <span className="text-[10px] font-medium text-[#1F4A2E]">
                      Verified · {c.skillProofs.length} skill{c.skillProofs.length > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                <StatusBadge status={c.status} />
```

- [ ] **Step 3: Visually verify**

Start the dev server (`bun dev`) and open the Candidates view. Verified candidates (Felix M., Anika S., Lena K., Markus B., Priya N., Tim R., Daniel H., Lukas F.) should show a small green "Verified · N skills" chip below the match score badge. Unverified candidates (Jonas W., Clara V., Sophie A., Mia T.) should look unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/components/eventiq/views/Candidates.tsx
git commit -m "feat: add verified chip to candidate list row"
```

---

### Task 3: Update skills section in drawer with proof chips

**Files:**
- Modify: `src/components/eventiq/views/Candidates.tsx`

- [ ] **Step 1: Replace the flat skills flex-wrap in the drawer with proof-aware chips**

Find this block inside the `<SlidePanel>` (lines ~165–169):

```tsx
            <div className="flex gap-1 flex-wrap mb-5">
              {open.skills.map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded border border-primary/30 text-primary">{s}</span>
              ))}
            </div>
```

Replace with:

```tsx
            <div className="flex gap-1.5 flex-wrap mb-5">
              {open.skills.map((s) => {
                const proof = open.skillProofs?.find((p) => p.skill === s);
                return proof ? (
                  <div key={s} className="flex flex-col px-2 py-1 rounded border border-[#B8E0C2] bg-[#F0F7F2]">
                    <span className="text-xs font-medium text-[#1F4A2E]">{s}</span>
                    <span className="text-[10px] text-[#2F7A47] mt-0.5">{proof.source}</span>
                  </div>
                ) : (
                  <span key={s} className="text-xs px-2 py-0.5 rounded border border-primary/30 text-primary">{s}</span>
                );
              })}
            </div>
```

- [ ] **Step 2: Visually verify**

Open Felix M.'s profile drawer. The "Python" chip should now show "1st place · HackTUM 2025" in small text beneath the skill name. The "LLMs" chip (no proof) should stay as a plain chip. Open Jonas W.'s drawer — all chips should be plain (unchanged).

- [ ] **Step 3: Commit**

```bash
git add src/components/eventiq/views/Candidates.tsx
git commit -m "feat: show skill proof sources in candidate drawer"
```

---

### Task 4: Add Community section to drawer

**Files:**
- Modify: `src/components/eventiq/views/Candidates.tsx`

- [ ] **Step 1: Insert the Community section between the skills block and the Role Match block**

Find the start of the Role Match block inside the `<SlidePanel>` (line ~171):

```tsx
            <div className="mb-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Role Match</div>
```

Insert this block immediately before it:

```tsx
            {open.communityRoles && open.communityRoles.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Community</div>
                <div className="flex gap-1.5 flex-wrap">
                  {open.communityRoles.map((role) => (
                    <div key={role} className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border border-primary/20 bg-secondary/40 text-muted-foreground">
                      <Users className="w-3 h-3 shrink-0" />
                      {role}
                    </div>
                  ))}
                </div>
              </div>
            )}
```

- [ ] **Step 2: Visually verify**

Open Anika S.'s drawer. A "Community" section should appear between Skills and Role Match, showing "TUM Robotics Club" and "ETH Women in Tech" as tag chips with a small users icon. Open Jonas W.'s drawer — no Community section should appear (field absent).

- [ ] **Step 3: Final commit**

```bash
git add src/components/eventiq/views/Candidates.tsx
git commit -m "feat: add community roles section to candidate drawer"
```

---

## Self-Review

**Spec coverage:**
- ✅ `skillProofs` and `communityRoles` fields added to `Candidate`
- ✅ 8 candidates populated with realistic DACH hackathon data
- ✅ Verified chip in list row (ShieldCheck icon, count, green colors)
- ✅ Proof-annotated skill chips in drawer
- ✅ Community section in drawer, hidden when empty
- ✅ No changes outside `mockData.ts` and `Candidates.tsx`

**Placeholders:** None.

**Type consistency:** `skillProofs` and `communityRoles` are defined in Task 1 and consumed in Tasks 2–4. The `proof.skill` lookup against `c.skills[]` uses plain string matching — the mock data is written so all `skillProofs[].skill` values exactly match strings in the corresponding `skills[]` arrays.
