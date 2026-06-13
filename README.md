# EventIQ Pulse

**EventIQ Pulse** is a recruiter intelligence dashboard for sourcing early technical talent from university hackathons and student events. It tracks candidates from event opt-in to hire, shows which events produce qualified candidates at what cost, and surfaces the student ecosystem (universities, communities) that companies without insider access can't see.

Built as a fully self-contained frontend prototype with zero backend dependencies. All data is hardcoded mock data, making it ideal for VC demos and recruiter walkthroughs.

---

## Features

- **Overview** — KPI cards and a hiring conversion funnel (Attendees → Opt-ins → Contacted → In Pipeline → Interviewed → Offers) showing full-funnel drop-off at a glance
- **Events** — Sponsorship table with opt-in rates, cost-per-lead metrics, and per-event candidate breakdowns
- **Candidates** — Searchable, filterable candidate list with:
  - **Match score badges** — each candidate ranked against open roles (ML/AI Working Student, Backend Intern, etc.)
  - **Verified talent profiles** — skill tags annotated with proof sources (e.g. "Python · 1st place HackTUM 2025") and student community roles (e.g. "TUM Robotics Club Lead")
  - **ATS integration** — 3-step sync modal to push candidates to Greenhouse, Personio, Lever, or Ashby
  - Candidate detail drawer with role match breakdown, recruiter notes, and follow-up email drafting
- **Ecosystem** — Interactive WebGL globe (powered by [cobe](https://github.com/shuding/cobe)) centered on Europe, with continent → city drill-down showing university talent pools and student communities per city
- **Reports** — Cross-event ROI comparison table (opt-ins, pipeline, hires, cost-per-hire, performance bars) plus detailed per-event reports with pipeline breakdown and cost analysis
- **Recommendations** — AI-generated event suggestions ranked by predicted ROI, with shortlisting support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React meta-framework) |
| Routing | TanStack React Router (file-based) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) on Radix UI primitives |
| Charts | [Recharts](https://recharts.org/) |
| Globe | [cobe](https://cobe.vercel.app/) — 5KB WebGL globe |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4 |
| Icons | Lucide React |
| Build tool | Vite + Bun |
| Language | TypeScript 5 |

---

## Local Setup

**Prerequisites:** [Bun](https://bun.sh/) (recommended) or Node.js v18+

```bash
# 1. Clone the repository
git clone https://github.com/leoninni/eventiq-pulse.git
cd eventiq-pulse

# 2. Install dependencies
bun install

# 3. Start the development server
bun run dev
```

The app will be available at **http://localhost:5173**

---

## Project Structure

```
src/
├── routes/                  # File-based routing (TanStack Router)
│   ├── __root.tsx           # App shell, meta tags, font imports
│   └── index.tsx            # Home route (renders AppLayout)
├── components/
│   ├── eventiq/             # Domain-specific components
│   │   ├── AppLayout.tsx    # Main layout: sidebar + view switcher
│   │   ├── Sidebar.tsx      # Left navigation
│   │   ├── SlidePanel.tsx   # Reusable slide-in drawer
│   │   ├── StatusBadge.tsx  # Color-coded status pill
│   │   └── views/
│   │       ├── Overview.tsx       # Funnel + KPI cards
│   │       ├── Events.tsx         # Event sponsorship table
│   │       ├── Candidates.tsx     # Candidate list + drawer + ATS modal
│   │       ├── Ecosystem.tsx      # Interactive globe
│   │       ├── Reports.tsx        # ROI comparison + per-event reports
│   │       └── Recommendations.tsx
│   └── ui/                  # shadcn/Radix UI primitives
├── lib/
│   ├── eventiq/
│   │   ├── mockData.ts      # All mock data — events, candidates, universities,
│   │   │                    # communities, city markers, continents, funnel data
│   │   └── store.tsx        # React Context store (view, filters, ATS sync state)
│   └── utils.ts             # matchScore() and helpers
└── styles.css               # Tailwind config + design tokens
```

---

## Design System

Nature-inspired, sage green design language:

| Token | Value |
|---|---|
| Background | `#EEF3EE` (sage green-tinted) |
| Card | `#FFFFFF` |
| Primary | `#0F1410` (near-black) |
| Forest green | `#2F7A47` (accent, verified states) |
| Mint | `#B8E0C2` / `#DCEFE2` (highlights, badges) |
| Warning | `#B07A1F` |
| Body font | Inter |
| Display font | Instrument Serif / DM Serif Display |

Candidate status colors (consistent across all views):

| Status | Background | Dot |
|---|---|---|
| Interested | `#DCEFE2` | `#6BAE82` |
| In Review | `#F5E7CC` | `#C99A3E` |
| Interviewed | `#E2E8F0` | `#64748B` |
| Offer Extended | `#B8E0C2` | `#2F7A47` |
| Rejected | `#EFE3DC` | `#B07A5A` |

---

## Mock Data

`src/lib/eventiq/mockData.ts` contains everything:

- **5 events** — HackTUM 2025, START Hack 2025, CODE Berlin, ETH Build Night, KIT Innovation Hack — each with sponsorship, opt-ins, pipeline, hires, and cost metrics
- **12 candidates** — with skills, verified skill proofs, community roles, project descriptions, match scores, and ATS sync state
- **4 open roles** — ML/AI Working Student, Backend Engineering Intern, Systems Engineering Intern, Frontend Working Student
- **8 university profiles** — TUM, ETH, TU Berlin, KIT, RWTH, Uni Stuttgart, TU Darmstadt, LMU — with lat/lng coordinates, candidate counts, and role affinities
- **10 student communities** — TUM AI Society, ETH Robotics Society, KIT Data Science Club, etc.
- **7 city markers + 3 continent markers** — powering the Ecosystem globe
- **3 event recommendations** — with predicted opt-ins, pipeline counts, and match scores
- **Hiring funnel data** — 6-stage conversion (1,760 attendees → 3 offers)

To customize the prototype, edit this file directly. No API calls, no environment variables, no database required.

---

## Deployment

Pure frontend — deploy after `bun run build`. Output goes to `dist/`.

Works on: Vercel, Netlify, Cloudflare Pages, GitHub Pages.
