# EventIQ Pulse

**EventIQ Pulse** is a recruiter SaaS dashboard prototype for tracking candidates sourced from hackathons and student tech events. It provides a unified view of your sponsorship pipeline — from event ROI and candidate profiles to AI-powered recommendations for future events.

Built as a fully self-contained frontend prototype with zero backend dependencies. All data is hardcoded mock data, making it ideal for design reviews and stakeholder demos.

---

## Features

- **Overview** — KPI cards, bar chart of candidates by event, pipeline status donut chart, and a live activity feed
- **Events** — Sponsorship table with opt-in rates, cost-per-lead metrics, and per-event candidate breakdowns
- **Candidates** — Searchable, filterable candidate list with skill tags, university info, status management, and email drafting
- **Reports** — Detailed post-event reports with executive summaries, pipeline charts, and candidate tables
- **Recommendations** — AI-generated event suggestions ranked by predicted ROI, with shortlisting support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19 meta-framework) |
| Routing | TanStack React Router (file-based) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) on Radix UI primitives |
| Charts | [Recharts](https://recharts.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Build tool | Vite 7 + Nitro |
| Language | TypeScript 5 |

---

## Local Setup

**Prerequisites:** Node.js v18+ (v22 recommended)

```bash
# 1. Clone the repository
git clone https://github.com/leoninni/eventiq-pulse.git
cd eventiq-pulse

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Other commands

```bash
# Production build
npm run build

# Preview the production build locally
npm run preview

# Lint the codebase
npm run lint

# Format code with Prettier
npm run format
```

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
│   │   └── views/           # One file per dashboard view
│   │       ├── Overview.tsx
│   │       ├── Events.tsx
│   │       ├── Candidates.tsx
│   │       ├── Reports.tsx
│   │       └── Recommendations.tsx
│   └── ui/                  # shadcn/Radix UI primitives (45+ components)
├── lib/
│   ├── eventiq/
│   │   ├── mockData.ts      # All mock events, candidates, recommendations
│   │   └── store.tsx        # React Context store (view state, filters, shortlist)
│   └── utils.ts
└── styles.css               # Tailwind config + design tokens
```

---

## Design System

The UI uses a dark design language inspired by Linear and Vercel:

| Token | Value |
|---|---|
| Background | `#09090B` |
| Card | `#111118` |
| Border | `#1E1E2E` |
| Primary (Indigo) | `#6366F1` |
| Accent (Cyan) | `#22D3EE` |
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |
| Font | Inter (Google Fonts) |

Candidate pipeline statuses are color-coded consistently across every view: Interested (cyan), In Review (amber), Interviewed (indigo), Offer Extended (green), Rejected (gray).

---

## State Management

The app uses a lightweight React Context + hooks pattern (`src/lib/eventiq/store.tsx`) with no external state library. The store holds:

- Active view
- Candidate list (statuses are mutable — changing one in the detail drawer updates the Overview donut chart instantly)
- Active event filter
- Shortlisted recommendation IDs

---

## Mock Data

`src/lib/eventiq/mockData.ts` contains:

- **5 events** — HackTUM, START Hack, CODE Berlin, ETH Build, KIT Hackathon
- **12 candidates** — with university, skills, project title, project description, event ID, and pipeline status
- **3 AI recommendations** — with predicted opt-ins, pipeline counts, estimated cost, and match score
- **5 activity feed items**

To customize the prototype, edit this file directly. No API calls, no environment variables, no database required.

---

## Deployment

Since this is a pure frontend prototype, it can be deployed to any static hosting provider after running `npm run build`. The output goes to `dist/`.

Suitable hosts: Vercel, Netlify, Cloudflare Pages, GitHub Pages.
