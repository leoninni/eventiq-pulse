# Ecosystem Interactive Globe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Ecosystem card grid with a rotating WebGL globe centered on Europe, where clicking city markers opens a detail panel showing that city's universities and communities.

**Architecture:** `cobe` (5KB WebGL lib) renders the globe on a `<canvas>`; absolutely-positioned DOM `<button>` elements overlaid on the canvas provide click targets at each city's projected screen position (computed from lat/lon + current rotation state on every animation frame). Selecting a city updates React state; the right panel re-renders with filtered universities and communities for that city.

**Tech Stack:** React, TypeScript, Tailwind CSS, `cobe` (new dep, 5KB)

---

### Task 1: Install cobe and update mockData with coordinates and city grouping

**Files:**

- Modify: `src/lib/eventiq/mockData.ts`

- [ ] **Step 1: Install the `cobe` package**

```bash
cd /Users/leoniebender/eventiq-pulse && bun add cobe
```

Expected output: `bun add v...` with `cobe` added to dependencies. No errors.

- [ ] **Step 2: Add `lat`, `lng`, `city` to the `UniversityProfile` interface**

Find the `UniversityProfile` interface and replace it with:

```ts
export interface UniversityProfile {
  id: string;
  name: string;
  shortName: string;
  location: string;
  city: string;
  lat: number;
  lng: number;
  candidates: number;
  topSkills: string[];
  roleAffinity: string;
}
```

- [ ] **Step 3: Add `city` to the `StudentCommunity` interface**

Find the `StudentCommunity` interface and replace it with:

```ts
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
  city: string;
  members: number;
  topSkills: string[];
}
```

- [ ] **Step 4: Replace the `universityProfiles` array with coordinates and city fields**

```ts
export const universityProfiles: UniversityProfile[] = [
  {
    id: "tum",
    name: "TU Munich",
    shortName: "TUM",
    location: "Munich",
    city: "munich",
    lat: 48.14,
    lng: 11.58,
    candidates: 67,
    topSkills: ["ML", "Python", "Robotics"],
    roleAffinity: "ML/AI · Systems",
  },
  {
    id: "eth",
    name: "ETH Zürich",
    shortName: "ETH",
    location: "Zürich",
    city: "zurich",
    lat: 47.38,
    lng: 8.54,
    candidates: 48,
    topSkills: ["C++", "CUDA", "Rust"],
    roleAffinity: "Systems · Research",
  },
  {
    id: "tuberlin",
    name: "TU Berlin",
    shortName: "TU Berlin",
    location: "Berlin",
    city: "berlin",
    lat: 52.52,
    lng: 13.41,
    candidates: 31,
    topSkills: ["React", "TypeScript", "Go"],
    roleAffinity: "Frontend · Backend",
  },
  {
    id: "kit",
    name: "KIT",
    shortName: "KIT",
    location: "Karlsruhe",
    city: "karlsruhe",
    lat: 49.01,
    lng: 8.4,
    candidates: 29,
    topSkills: ["Python", "Spark", "Embedded"],
    roleAffinity: "Data · Embedded",
  },
  {
    id: "rwth",
    name: "RWTH Aachen",
    shortName: "RWTH",
    location: "Aachen",
    city: "aachen",
    lat: 50.78,
    lng: 6.08,
    candidates: 24,
    topSkills: ["Java", "NLP", "Systems"],
    roleAffinity: "Backend",
  },
  {
    id: "unistuttgart",
    name: "Uni Stuttgart",
    shortName: "Stuttgart",
    location: "Stuttgart",
    city: "stuttgart",
    lat: 48.78,
    lng: 9.18,
    candidates: 18,
    topSkills: ["Go", "Kubernetes", "DevOps"],
    roleAffinity: "Backend · Infra",
  },
  {
    id: "tudarmstadt",
    name: "TU Darmstadt",
    shortName: "TU Darmstadt",
    location: "Darmstadt",
    city: "darmstadt",
    lat: 49.88,
    lng: 8.66,
    candidates: 16,
    topSkills: ["C++", "Embedded", "RTOS"],
    roleAffinity: "Systems",
  },
  {
    id: "lmu",
    name: "LMU Munich",
    shortName: "LMU",
    location: "Munich",
    city: "munich",
    lat: 48.14,
    lng: 11.58,
    candidates: 14,
    topSkills: ["Rust", "WebAssembly", "Systems"],
    roleAffinity: "Systems",
  },
];
```

- [ ] **Step 5: Replace the `studentCommunities` array with `city` fields added**

```ts
export const studentCommunities: StudentCommunity[] = [
  {
    id: "tum-ai",
    name: "TUM AI Society",
    type: "AI/ML",
    university: "TU Munich",
    city: "munich",
    members: 280,
    topSkills: ["Python", "LLMs"],
  },
  {
    id: "tum-ml",
    name: "TUM ML Society",
    type: "AI/ML",
    university: "TU Munich",
    city: "munich",
    members: 210,
    topSkills: ["PyTorch", "ML"],
  },
  {
    id: "tum-robotics",
    name: "TUM Robotics Club",
    type: "Robotics",
    university: "TU Munich",
    city: "munich",
    members: 145,
    topSkills: ["C++", "ROS"],
  },
  {
    id: "eth-robotics",
    name: "ETH Robotics Society",
    type: "Robotics",
    university: "ETH Zürich",
    city: "zurich",
    members: 120,
    topSkills: ["C++", "CUDA"],
  },
  {
    id: "eth-women",
    name: "ETH Women in Tech",
    type: "Community",
    university: "ETH Zürich",
    city: "zurich",
    members: 340,
    topSkills: ["Python", "ML"],
  },
  {
    id: "eth-entre",
    name: "ETH Entrepreneurship Club",
    type: "Entrepreneurship",
    university: "ETH Zürich",
    city: "zurich",
    members: 190,
    topSkills: ["React", "TypeScript"],
  },
  {
    id: "kit-data",
    name: "KIT Data Science Club",
    type: "Data",
    university: "KIT",
    city: "karlsruhe",
    members: 95,
    topSkills: ["Python", "Spark"],
  },
  {
    id: "tud-robotics",
    name: "TU Darmstadt Robotics Club",
    type: "Robotics",
    university: "TU Darmstadt",
    city: "darmstadt",
    members: 110,
    topSkills: ["C++", "Embedded"],
  },
  {
    id: "stuttgart-cloud",
    name: "Uni Stuttgart Cloud Native Club",
    type: "Cloud/DevOps",
    university: "Uni Stuttgart",
    city: "stuttgart",
    members: 75,
    topSkills: ["Go", "Kubernetes"],
  },
  {
    id: "lmu-oss",
    name: "LMU Open Source Lab",
    type: "Open Source",
    university: "LMU Munich",
    city: "munich",
    members: 85,
    topSkills: ["Rust", "WebAssembly"],
  },
];
```

- [ ] **Step 6: Add `CityMarker` interface and `cityMarkers` export after `studentCommunities`**

```ts
export interface CityMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const cityMarkers: CityMarker[] = [
  { id: "munich", name: "Munich", lat: 48.14, lng: 11.58 },
  { id: "zurich", name: "Zürich", lat: 47.38, lng: 8.54 },
  { id: "berlin", name: "Berlin", lat: 52.52, lng: 13.41 },
  { id: "karlsruhe", name: "Karlsruhe", lat: 49.01, lng: 8.4 },
  { id: "aachen", name: "Aachen", lat: 50.78, lng: 6.08 },
  { id: "stuttgart", name: "Stuttgart", lat: 48.78, lng: 9.18 },
  { id: "darmstadt", name: "Darmstadt", lat: 49.88, lng: 8.66 },
];
```

- [ ] **Step 7: Verify TypeScript is clean**

```bash
cd /Users/leoniebender/eventiq-pulse && npx tsc --noEmit 2>&1 | head -20
```

Expected: errors only about `Ecosystem.tsx` using `city`/`lat`/`lng` fields (pre-existing component will now fail type check since it doesn't import `cityMarkers` yet — that's fine). If you see unexpected errors elsewhere, investigate.

Actually: since `Ecosystem.tsx` currently does NOT reference `city`, `lat`, `lng`, or `cityMarkers`, there should be zero TypeScript errors. If the current `Ecosystem.tsx` uses the `UniversityProfile` or `StudentCommunity` types in a way that now breaks due to the added required fields, you'll see errors there — in that case the fix is in Task 2.

- [ ] **Step 8: Commit**

```bash
git add src/lib/eventiq/mockData.ts bun.lock package.json
git commit -m "feat: install cobe and add lat/lng/city/cityMarkers to mockData"
```

---

### Task 2: Rewrite Ecosystem.tsx as interactive globe with two-panel layout

**Files:**

- Modify: `src/components/eventiq/views/Ecosystem.tsx`

- [ ] **Step 1: Replace the entire contents of `Ecosystem.tsx` with the new component**

```tsx
import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import {
  universityProfiles,
  studentCommunities,
  cityMarkers,
  type StudentCommunity,
} from "@/lib/eventiq/mockData";

const GLOBE_SIZE = 580;

const typeBadgeStyles: Record<StudentCommunity["type"], string> = {
  "AI/ML": "bg-[#DCEFE2] text-[#1F4A2E]",
  Robotics: "bg-[#E2E8F0] text-[#334155]",
  Entrepreneurship: "bg-[#F5E7CC] text-[#7A5712]",
  "Cloud/DevOps": "bg-[#E8F0F5] text-[#1A4A6E]",
  Data: "bg-[#F0E8F5] text-[#4A1A6E]",
  "Open Source": "bg-[#F5F0E8] text-[#6E4A1A]",
  Community: "bg-secondary text-muted-foreground",
};

function projectToScreen(
  lat: number,
  lng: number,
  phi: number,
  theta: number,
  size: number,
): { x: number; y: number; visible: boolean } {
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;

  const x0 = Math.cos(latR) * Math.sin(lngR);
  const y0 = Math.sin(latR);
  const z0 = Math.cos(latR) * Math.cos(lngR);

  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const x1 = x0 * cosPhi + z0 * sinPhi;
  const y1 = y0;
  const z1 = -x0 * sinPhi + z0 * cosPhi;

  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const x2 = x1;
  const y2 = y1 * cosTheta - z1 * sinTheta;
  const z2 = y1 * sinTheta + z1 * cosTheta;

  const radius = size * 0.42;
  return {
    x: size / 2 + x2 * radius,
    y: size / 2 - y2 * radius,
    visible: z2 > 0.05,
  };
}

type OverlayPos = { id: string; x: number; y: number; visible: boolean };

export function Ecosystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0.25);
  const thetaRef = useRef(0.25);
  const isDragging = useRef(false);
  const pointerStart = useRef<{ x: number; phi: number } | null>(null);
  const [overlayPositions, setOverlayPositions] = useState<OverlayPos[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: GLOBE_SIZE * 2,
      height: GLOBE_SIZE * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 5,
      baseColor: [0.12, 0.16, 0.12],
      markerColor: [0.69, 0.87, 0.76],
      glowColor: [0.18, 0.47, 0.28],
      markers: cityMarkers.map((c) => ({
        location: [c.lat, c.lng] as [number, number],
        size: 0.04,
      })),
      onRender: (state) => {
        if (!isDragging.current) phiRef.current += 0.003;
        state.phi = phiRef.current;
        state.theta = thetaRef.current;
        setOverlayPositions(
          cityMarkers.map((c) => ({
            id: c.id,
            ...projectToScreen(c.lat, c.lng, state.phi, state.theta, GLOBE_SIZE),
          })),
        );
      },
    });
    return () => globe.destroy();
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    isDragging.current = true;
    pointerStart.current = { x: e.clientX, phi: phiRef.current };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current || !pointerStart.current) return;
    phiRef.current =
      pointerStart.current.phi - ((e.clientX - pointerStart.current.x) / GLOBE_SIZE) * Math.PI * 2;
  }
  function onPointerUp() {
    isDragging.current = false;
    pointerStart.current = null;
  }

  const selectedCity = selectedCityId ? cityMarkers.find((c) => c.id === selectedCityId) : null;
  const cityUniversities = selectedCityId
    ? universityProfiles.filter((u) => u.city === selectedCityId)
    : [];
  const cityCommunities = selectedCityId
    ? studentCommunities.filter((c) => c.city === selectedCityId)
    : [];
  const cityTotalCandidates = cityUniversities.reduce((s, u) => s + u.candidates, 0);
  const totalCandidates = universityProfiles.reduce((s, u) => s + u.candidates, 0);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-border shrink-0">
        <h1 className="font-display text-3xl tracking-tight">Talent Ecosystem</h1>
        <p className="text-xs text-muted-foreground mt-1">
          University talent pools and student communities in your recruiting network.
        </p>
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Globe */}
        <div className="flex-1 flex items-center justify-center bg-[#0A0D0A] relative overflow-hidden">
          <div className="relative" style={{ width: GLOBE_SIZE, height: GLOBE_SIZE }}>
            <canvas
              ref={canvasRef}
              style={{ width: GLOBE_SIZE, height: GLOBE_SIZE }}
              width={GLOBE_SIZE * 2}
              height={GLOBE_SIZE * 2}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className="cursor-grab active:cursor-grabbing select-none"
            />
            {overlayPositions.map((pos) => {
              const city = cityMarkers.find((c) => c.id === pos.id)!;
              const isSelected = selectedCityId === pos.id;
              return (
                <button
                  key={pos.id}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: pos.visible ? "auto" : "none",
                  }}
                  className={`group flex flex-col items-center gap-0.5 transition-all ${
                    pos.visible ? "opacity-100" : "opacity-0"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCityId(isSelected ? null : pos.id);
                  }}
                >
                  <div
                    className={`rounded-full transition-all duration-150 ${
                      isSelected
                        ? "w-3 h-3 bg-white ring-2 ring-[#B0DEBB] ring-offset-1 ring-offset-black scale-150"
                        : "w-2.5 h-2.5 bg-[#6BAE82] group-hover:bg-white group-hover:scale-125"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-medium px-1 py-0.5 rounded whitespace-nowrap leading-none transition-all ${
                      isSelected
                        ? "text-white bg-black/70 opacity-100"
                        : "text-[#B0DEBB] opacity-0 group-hover:opacity-100 bg-black/50"
                    }`}
                  >
                    {city.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detail panel */}
        <div className="w-[400px] shrink-0 border-l border-border overflow-y-auto">
          {!selectedCity ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 p-8">
              <div className="text-5xl mb-2">🌍</div>
              <div className="text-sm font-semibold">Click a city on the globe</div>
              <div className="text-xs text-muted-foreground">
                Explore universities and communities in each city
              </div>
              <div className="mt-6 flex gap-6">
                {[
                  { value: totalCandidates, label: "candidates" },
                  { value: universityProfiles.length, label: "universities" },
                  { value: studentCommunities.length, label: "communities" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-bold tabular-nums">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold">{selectedCity.name}</h2>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {cityTotalCandidates} candidates · {cityUniversities.length}{" "}
                    {cityUniversities.length === 1 ? "university" : "universities"}
                    {cityCommunities.length > 0 &&
                      ` · ${cityCommunities.length} ${
                        cityCommunities.length === 1 ? "community" : "communities"
                      }`}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCityId(null)}
                  className="text-muted-foreground hover:text-foreground text-xl leading-none mt-0.5 px-1"
                >
                  ×
                </button>
              </div>

              {/* Universities */}
              <div className="mb-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Universities
                </div>
                <div className="space-y-2">
                  {cityUniversities.map((u) => (
                    <div key={u.id} className="bg-card border border-border rounded-lg p-3">
                      <div className="flex items-baseline justify-between mb-1">
                        <div className="text-sm font-semibold">{u.shortName}</div>
                        <div className="text-[10px] text-muted-foreground">{u.name}</div>
                      </div>
                      <div className="text-xl font-bold tabular-nums">
                        {u.candidates.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">candidates</div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {u.topSkills.map((s) => (
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

              {/* Communities */}
              {cityCommunities.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Communities
                  </div>
                  <div className="space-y-2">
                    {cityCommunities.map((c) => (
                      <div key={c.id} className="bg-card border border-border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div className="text-sm font-semibold leading-tight">{c.name}</div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${typeBadgeStyles[c.type]}`}
                          >
                            {c.type}
                          </span>
                        </div>
                        <div className="text-lg font-bold tabular-nums">
                          {c.members.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">members</div>
                        <div className="flex flex-wrap gap-1">
                          {c.topSkills.map((s) => (
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
              )}

              {cityCommunities.length === 0 && (
                <div className="text-xs text-muted-foreground italic">
                  No communities tracked in this city yet.
                </div>
              )}
            </div>
          )}
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
git commit -m "feat: replace Ecosystem card grid with interactive cobe globe"
```

---

## Self-Review

**Spec coverage:**

- ✅ `cobe` installed (Task 1, Step 1)
- ✅ `lat`, `lng`, `city` added to `UniversityProfile` (Task 1, Steps 2+4)
- ✅ `city` added to `StudentCommunity` (Task 1, Steps 3+5)
- ✅ `CityMarker` interface + `cityMarkers` export (Task 1, Step 6)
- ✅ `projectToScreen` rotation math with phi/theta Y+X rotation matrices (Task 2)
- ✅ `createGlobe` with dark theme, mint markers, auto-rotate, drag interaction (Task 2)
- ✅ Overlay `<button>` per city, positioned from `overlayPositions` state (Task 2)
- ✅ `visible: z2 > 0.05` hides back-hemisphere markers (Task 2)
- ✅ Selected city highlighted with white dot + ring (Task 2)
- ✅ City name label: always visible when selected, hover-only otherwise (Task 2)
- ✅ Right panel: empty state with globe emoji + aggregate stats (Task 2)
- ✅ Right panel: city detail with university cards + community cards (Task 2)
- ✅ Toggle deselect: clicking selected city sets `selectedCityId` to `null` (Task 2)
- ✅ `typeBadgeStyles` covers all 7 community types (Task 2)

**Placeholders:** None.

**Type consistency:** `cityMarkers` exported as `CityMarker[]` in Task 1; imported as `cityMarkers` in Task 2. `StudentCommunity["type"]` union defined in Task 1; used as key of `typeBadgeStyles` in Task 2. `u.city` and `c.city` added in Task 1; filtered on in Task 2 (`u.city === selectedCityId`, `c.city === selectedCityId`). All consistent.
