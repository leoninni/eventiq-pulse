# Ecosystem Globe Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix geographical accuracy bugs in the Ecosystem globe, add event pins with ROI data, size city markers by candidate count, and wire a "View candidates →" button from each event card to the Candidates view.

**Architecture:** Single-file rewrite of `Ecosystem.tsx` across four sequential tasks. `mockData.ts` is extended first (Task 1) since all subsequent tasks depend on the new fields. Each task produces a working, shippable state. No new files are created.

**Tech Stack:** React 18, TypeScript, cobe (WebGL globe), Tailwind CSS v4, TanStack Router, existing store context.

---

## Critical Math Note (Read Before Implementing)

The existing `projectGlobe` function and the phi-to-longitude formula are both wrong because they use a different coordinate system than cobe's internal `U()` and `O()` functions.

**cobe's coordinate system** (from `U([lat, lng])` in the minified source):
```
x = cos(lat_r) * cos(lng_r)
y = sin(lat_r)
z = -cos(lat_r) * sin(lng_r)
```

**cobe's projection** (from `O([x, y, z])` in the minified source):
```
c  = cos(phi)*x + sin(phi)*z               // → screen x
s  = sin(phi)*sin(theta)*x + cos(theta)*y - cos(phi)*sin(theta)*z  // → screen y (negated)
dep = -sin(phi)*cos(theta)*x + sin(theta)*y + cos(phi)*cos(theta)*z  // > 0 = visible
```

**To center longitude L at the front**: `phi = -π/2 - L*π/180`
- Europe (10°E): phi ≈ -1.745
- North America (-95°W): phi ≈ +0.087
- Asia (100°E): phi ≈ -3.316

**To center latitude L vertically**: `theta = L * π/180` (existing formula is correct)

---

## File Map

| File | Change |
|---|---|
| `src/lib/eventiq/mockData.ts` | Add `lat`, `lng`, `cityId` to `EventItem`; add St. Gallen to `cityMarkers`; update Europe anchor |
| `src/components/eventiq/views/Ecosystem.tsx` | Complete rewrite of constants, projectGlobe, marker system, right panel, controls |
| `src/lib/eventiq/store.tsx` | No changes — `eventFilter` + `setEventFilter` already exist |
| `src/components/eventiq/views/Candidates.tsx` | Verify `eventFilter` is wired (no changes expected) |

---

## Task 1: Extend mockData

**Files:**
- Modify: `src/lib/eventiq/mockData.ts`

- [ ] **Step 1: Add lat/lng/cityId to the EventItem interface**

Replace the `EventItem` interface (lines 3–15) with:

```ts
export interface EventItem {
  id: string;
  name: string;
  date: string;
  shortDate: string;
  location: string;
  lat: number;
  lng: number;
  cityId: string;
  attendees: number;
  optIns: number;
  pipeline: number;
  sponsorship: number;
  costPerLead: number;
  hires: number;
}
```

- [ ] **Step 2: Add lat/lng/cityId values to each event**

Replace the `events` array (lines 30–36) with:

```ts
export const events: EventItem[] = [
  { id: "hacktum",    name: "HackTUM 2025",         date: "Apr 12, 2025", shortDate: "Apr 12", location: "Munich",     lat: 48.14, lng:  11.58, cityId: "munich",     attendees: 600, optIns: 89, pipeline: 12, sponsorship: 8000, costPerLead: 667,  hires: 5 },
  { id: "starthack",  name: "START Hack 2025",       date: "Mar 1, 2025",  shortDate: "Mar 1",  location: "St. Gallen", lat: 47.42, lng:   9.37, cityId: "st-gallen",  attendees: 450, optIns: 61, pipeline: 8,  sponsorship: 5000, costPerLead: 625,  hires: 3 },
  { id: "codeberlin", name: "CODE Berlin Hackathon", date: "Feb 14, 2025", shortDate: "Feb 14", location: "Berlin",     lat: 52.52, lng:  13.41, cityId: "berlin",     attendees: 280, optIns: 48, pipeline: 7,  sponsorship: 3500, costPerLead: 500,  hires: 2 },
  { id: "ethbuild",   name: "ETH Build Night",       date: "Jan 18, 2025", shortDate: "Jan 18", location: "Zürich",     lat: 47.38, lng:   8.54, cityId: "zurich",     attendees: 190, optIns: 17, pipeline: 4,  sponsorship: 2500, costPerLead: 625,  hires: 1 },
  { id: "kithack",    name: "KIT Innovation Hack",   date: "Nov 22, 2024", shortDate: "Nov 22", location: "Karlsruhe",  lat: 49.01, lng:   8.40, cityId: "karlsruhe",  attendees: 240, optIns: 32, pipeline: 3,  sponsorship: 4000, costPerLead: 1333, hires: 1 },
];
```

- [ ] **Step 3: Update Europe's continent anchor and add St. Gallen city marker**

Replace the `continents` array (lines 267–271) with:

```ts
export const continents: Continent[] = [
  { id: "europe",        name: "Europe",        lat: 48, lng:  10, zoom: 2.8 },
  { id: "north-america", name: "North America", lat: 40, lng: -95, zoom: 2.4 },
  { id: "asia",          name: "Asia",          lat: 20, lng: 100, zoom: 2.2 },
];
```

Add St. Gallen as the first entry in the Europe section of `cityMarkers`:

```ts
export const cityMarkers: CityMarker[] = [
  // Europe
  { id: "munich",     name: "Munich",     continent: "europe",        lat: 48.14, lng:  11.58 },
  { id: "zurich",     name: "Zürich",     continent: "europe",        lat: 47.38, lng:   8.54 },
  { id: "berlin",     name: "Berlin",     continent: "europe",        lat: 52.52, lng:  13.41 },
  { id: "karlsruhe",  name: "Karlsruhe",  continent: "europe",        lat: 49.01, lng:   8.40 },
  { id: "aachen",     name: "Aachen",     continent: "europe",        lat: 50.78, lng:   6.08 },
  { id: "stuttgart",  name: "Stuttgart",  continent: "europe",        lat: 48.78, lng:   9.18 },
  { id: "darmstadt",  name: "Darmstadt",  continent: "europe",        lat: 49.88, lng:   8.66 },
  { id: "st-gallen",  name: "St. Gallen", continent: "europe",        lat: 47.42, lng:   9.37 },
  // North America
  { id: "boston",    name: "Boston",    continent: "north-america", lat: 42.36, lng:  -71.09 },
  { id: "sf-bay",    name: "SF Bay",    continent: "north-america", lat: 37.77, lng: -122.42 },
  { id: "nyc",       name: "New York",  continent: "north-america", lat: 40.73, lng:  -73.99 },
  { id: "toronto",   name: "Toronto",   continent: "north-america", lat: 43.66, lng:  -79.40 },
  { id: "waterloo",  name: "Waterloo",  continent: "north-america", lat: 43.47, lng:  -80.54 },
  { id: "austin",    name: "Austin",    continent: "north-america", lat: 30.29, lng:  -97.74 },
  { id: "seattle",   name: "Seattle",   continent: "north-america", lat: 47.66, lng: -122.31 },
  // Asia
  { id: "singapore", name: "Singapore", continent: "asia",          lat:  1.30, lng: 103.77 },
  { id: "tokyo",     name: "Tokyo",     continent: "asia",          lat: 35.68, lng: 139.76 },
  { id: "seoul",     name: "Seoul",     continent: "asia",          lat: 37.55, lng: 126.99 },
  { id: "bangalore", name: "Bangalore", continent: "asia",          lat: 12.97, lng:  77.59 },
  { id: "beijing",   name: "Beijing",   continent: "asia",          lat: 39.90, lng: 116.40 },
  { id: "shanghai",  name: "Shanghai",  continent: "asia",          lat: 31.23, lng: 121.47 },
];
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `bun run build 2>&1 | head -30`

Expected: no errors about `EventItem` missing fields. If there are errors, they'll say "Property 'lat' is missing" — fix any usages of `events` that spread `EventItem` without the new fields.

- [ ] **Step 5: Commit**

```bash
git add src/lib/eventiq/mockData.ts
git commit -m "feat: add lat/lng/cityId to events, add St. Gallen city marker"
```

---

## Task 2: Fix Globe Rendering Bugs

**Files:**
- Modify: `src/components/eventiq/views/Ecosystem.tsx`

This task rewrites the top of the file: constants, the `projectGlobe` function, the continent-selection `useEffect`, the animation loop inside the globe `useEffect`, and the auto-rotate logic. The JSX is unchanged in this task.

- [ ] **Step 1: Replace the constants block**

Replace lines 13–19 (the five `const` declarations):

```ts
const GLOBE_SIZE = 560;
const ZOOM_MIN = 0.8;
const ZOOM_MAX = 4;
const THETA_LIMIT = Math.PI / 2 - 0.05;

// phi = -π/2 - lng*π/180 centers that longitude at the globe front.
// Default centers on ~10°E so DACH cities are visible on load.
const DEFAULT_PHI   = -Math.PI / 2 - (10 * Math.PI) / 180;
const DEFAULT_THETA = 0.35;
const DEFAULT_ZOOM  = 1;
```

- [ ] **Step 2: Replace the projectGlobe function**

Replace the entire `projectGlobe` function (lines 32–59) with a version that matches cobe's internal coordinate system exactly:

```ts
// Projects a geographic point onto the globe canvas using cobe's exact
// coordinate system (derived from cobe's U() and O() functions).
function projectGlobe(
  lat: number,
  lng: number,
  phi: number,
  theta: number,
  size: number,
  zoom: number
): { x: number; y: number; visible: boolean } {
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;

  // cobe's U([lat, lng]) coordinate system
  const x0 =  Math.cos(latR) * Math.cos(lngR);
  const y0 =  Math.sin(latR);
  const z0 = -Math.cos(latR) * Math.sin(lngR);

  const cP = Math.cos(phi), sP = Math.sin(phi);
  const cT = Math.cos(theta), sT = Math.sin(theta);

  // cobe's O([x, y, z]) projection
  const c   =  cP * x0 + sP * z0;
  const s   =  sP * sT * x0 + cT * y0 - cP * sT * z0;
  const dep = -sP * cT * x0 + sT * y0 + cP * cT * z0;

  const half = size / 2;
  return {
    x: half + c * half * zoom,
    y: half - s * half * zoom,
    visible: dep > 0.05,
  };
}
```

- [ ] **Step 3: Fix the continent-selection useEffect**

Replace the `useEffect` that depends on `[selectedContinentId]` (lines 103–116):

```ts
useEffect(() => {
  if (selectedContinentId === null) {
    targetRef.current = { phi: DEFAULT_PHI, theta: DEFAULT_THETA, zoom: DEFAULT_ZOOM };
    autoRotateRef.current = true;
  } else {
    const c = continents.find((x) => x.id === selectedContinentId)!;
    targetRef.current = {
      phi:   -Math.PI / 2 - (c.lng * Math.PI) / 180,
      theta: (c.lat * Math.PI) / 180,
      zoom:  c.zoom,
    };
    autoRotateRef.current = false;
  }
}, [selectedContinentId]);
```

- [ ] **Step 4: Enable auto-rotate on initial mount**

Change the `autoRotateRef` initial value from `false` to `true` (line ~70):

```ts
const autoRotateRef = useRef(true);
```

And pass `scale` to `globe.update()` inside the `frame` function (the existing call on line ~165):

```ts
globe.update({ phi: phiRef.current, theta: thetaRef.current, scale: zoomRef.current });
```

- [ ] **Step 5: Start the dev server and verify Europe is centered on load**

Run: `bun run dev`

Open the Ecosystem tab. You should see Europe (Germany, Switzerland, France visible) on load with a slow auto-rotate. Clicking "Europe" in the right panel should zoom in to show DACH cities near center. Clicking "North America" should show eastern US/Canada. If continents still zoom to wrong regions, check that `phiRef` is being initialized to `DEFAULT_PHI` — add `phiRef.current = DEFAULT_PHI` before `globe` creation in the second `useEffect` if needed.

- [ ] **Step 6: Commit**

```bash
git add src/components/eventiq/views/Ecosystem.tsx
git commit -m "fix: correct globe phi formula, projectGlobe coordinate system, scale passthrough"
```

---

## Task 3: Marker System

**Files:**
- Modify: `src/components/eventiq/views/Ecosystem.tsx`

This task adds the import of `events` from mockData, computes derived maps, adds event diamond overlays and sized city circle overlays, and hover tooltips. The right panel JSX is not changed yet.

- [ ] **Step 1: Add the events import**

At the top of `Ecosystem.tsx`, extend the import from `mockData`:

```ts
import {
  universityProfiles,
  studentCommunities,
  cityMarkers,
  continents,
  events,
  type StudentCommunity,
  type ContinentId,
} from "@/lib/eventiq/mockData";
```

- [ ] **Step 2: Add useStore import and hook**

At the top of the file, add:

```ts
import { useStore } from "@/lib/eventiq/store";
```

Inside the `Ecosystem` component (after the `useState` declarations), add:

```ts
const { setView, setEventFilter } = useStore();
```

- [ ] **Step 3: Add derived data computations**

Inside the `Ecosystem` component, after the existing `continentCandidateCount` computation, add:

```ts
// Per-city candidate count for marker sizing
const cityCandidateCount: Record<string, number> = {};
universityProfiles.forEach((u) => {
  cityCandidateCount[u.city] = (cityCandidateCount[u.city] ?? 0) + u.candidates;
});
const maxCandidates = Math.max(1, ...Object.values(cityCandidateCount));

// Events grouped by cityId for city cards and event markers
const cityEvents: Record<string, typeof events> = {};
events.forEach((e) => {
  if (!cityEvents[e.cityId]) cityEvents[e.cityId] = [];
  cityEvents[e.cityId].push(e);
});

// Helper: cost-per-hire color tier
function eventRoiColor(e: (typeof events)[0]): string {
  const cph = Math.round(e.sponsorship / e.hires);
  if (cph < 1700) return "#2F7A47";   // green — top performer
  if (cph <= 2500) return "#D97706";  // amber — mid
  return "#9CA3AF";                   // gray — lower
}

// Helper: city marker dot size in px
function cityDotSize(cityId: string): number {
  const count = cityCandidateCount[cityId] ?? 0;
  return 6 + Math.sqrt(count / maxCandidates) * 8;
}
```

- [ ] **Step 4: Add tooltip state**

Add a hover state to track which marker is hovered:

```ts
const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
```

- [ ] **Step 5: Replace the continent-mode overlay block with city circles**

Locate the block that renders `{!inContinentMode && continentOverlays.map(...)}` (lines ~277–306). Keep it as-is (continent labels in world view).

Locate the block `{inContinentMode && cityOverlays.filter(...).map(...)}` (lines ~309–350). Replace it with city circles that show in BOTH world and continent view — but only clickable in continent mode:

```tsx
{/* City circles — visible in both views, clickable only in continent mode */}
{cityOverlays
  .filter((pos) =>
    inContinentMode
      ? visibleCities.some((c) => c.id === pos.id)
      : true
  )
  .map((pos) => {
    const city = cityMarkers.find((c) => c.id === pos.id)!;
    const isSelected = selectedCityId === pos.id;
    const dotSize = cityDotSize(city.id);
    const cityEvts = cityEvents[city.id] ?? [];
    const cands = cityCandidateCount[city.id] ?? 0;
    const isHovered = hoveredMarkerId === city.id;

    const tooltipLines = [
      city.name,
      [
        cands ? `${cands} candidates` : null,
        cityEvts.length === 1 ? cityEvts[0].name : cityEvts.length > 1 ? `${cityEvts.length} events` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    ].filter(Boolean);

    return (
      <div
        key={city.id}
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
          pointerEvents: pos.visible && inContinentMode ? "auto" : "none",
          zIndex: isSelected ? 20 : 10,
        }}
        className={`transition-opacity ${pos.visible ? "opacity-100" : "opacity-0"}`}
        onMouseEnter={() => setHoveredMarkerId(city.id)}
        onMouseLeave={() => setHoveredMarkerId(null)}
        onClick={(e) => {
          if (!inContinentMode) return;
          e.stopPropagation();
          setSelectedCityId(isSelected ? null : city.id);
        }}
      >
        {/* Tooltip */}
        {isHovered && (
          <div
            style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", zIndex: 30 }}
            className="bg-white border border-border rounded-md px-2 py-1 shadow-md pointer-events-none whitespace-nowrap"
          >
            {tooltipLines.map((line, i) => (
              <div key={i} className={i === 0 ? "text-[11px] font-semibold text-foreground" : "text-[10px] text-muted-foreground"}>
                {line}
              </div>
            ))}
          </div>
        )}
        {/* Dot */}
        <div
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            backgroundColor: "#2F7A47",
            border: `2px solid white`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            cursor: inContinentMode ? "pointer" : "default",
            transform: isSelected || isHovered ? "scale(1.3)" : "scale(1)",
            transition: "transform 150ms",
            outline: isSelected ? "2px solid #2F7A47" : "none",
            outlineOffset: 2,
          }}
        />
      </div>
    );
  })}

{/* Event diamond markers — continent mode only */}
{inContinentMode && events
  .filter((ev) => visibleCities.some((c) => c.id === ev.cityId))
  .map((ev) => {
    const cityPos = cityOverlays.find((p) => p.id === ev.cityId);
    if (!cityPos || !cityPos.visible) return null;
    const isHovered = hoveredMarkerId === `event-${ev.id}`;
    const color = eventRoiColor(ev);
    const cands = candidates.filter((c) => c.eventId === ev.id).length;
    return (
      <div
        key={ev.id}
        style={{
          position: "absolute",
          left: cityPos.x,
          top: cityPos.y - 12,  // 12px above city dot
          transform: "translate(-50%, -50%)",
          pointerEvents: "auto",
          zIndex: 15,
        }}
        onMouseEnter={() => setHoveredMarkerId(`event-${ev.id}`)}
        onMouseLeave={() => setHoveredMarkerId(null)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedCityId(ev.cityId);
          // scroll to events section after state update
          setTimeout(() => eventsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
        }}
      >
        {/* Tooltip */}
        {isHovered && (
          <div
            style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", zIndex: 30 }}
            className="bg-white border border-border rounded-md px-2 py-1 shadow-md pointer-events-none whitespace-nowrap"
          >
            <div className="text-[11px] font-semibold text-foreground">{ev.name}</div>
            <div className="text-[10px] text-muted-foreground">
              {ev.hires} {ev.hires === 1 ? "hire" : "hires"} · €{Math.round(ev.sponsorship / ev.hires).toLocaleString()}/hire
              {cands > 0 ? ` · ${cands} in pipeline` : ""}
            </div>
          </div>
        )}
        {/* Diamond */}
        <div
          style={{
            width: 10,
            height: 10,
            backgroundColor: color,
            border: "2px solid white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transform: `rotate(45deg) ${isHovered ? "scale(1.3)" : "scale(1)"}`,
            transition: "transform 150ms",
            cursor: "pointer",
          }}
        />
      </div>
    );
  })}
```

Note: `eventsRef` is declared in Task 4. Add it now as a forward declaration before the JSX:
```ts
const eventsRef = useRef<HTMLDivElement>(null);
```

Also add `candidates` to the destructure from `useStore()`:
```ts
const { setView, setEventFilter, candidates } = useStore();
```

- [ ] **Step 6: Verify in browser**

In the dev server: continent view should show sized city dots and green/amber/gray diamonds for each event city. Hovering a dot shows a tooltip. Hovering a diamond shows event name + cost/hire.

- [ ] **Step 7: Commit**

```bash
git add src/components/eventiq/views/Ecosystem.tsx
git commit -m "feat: add sized city markers, event diamond markers, and hover tooltips"
```

---

## Task 4: Unified City Card + Controls Cleanup

**Files:**
- Modify: `src/components/eventiq/views/Ecosystem.tsx`

This task rewrites the right panel city card section and removes the +/- zoom buttons.

- [ ] **Step 1: Remove the +/- zoom buttons from JSX**

Locate the zoom controls div (lines ~353–369):

```tsx
<div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
  <button onClick={() => applyZoom(1.2)} ...>+</button>
  <button onClick={() => applyZoom(1 / 1.2)} ...>−</button>
  <button onClick={resetView} ...>⟳</button>
</div>
```

Replace with just the reset button:

```tsx
<div className="absolute bottom-4 right-4">
  <button
    onClick={resetView}
    className="w-9 h-9 rounded-md bg-white border border-border text-foreground hover:bg-muted text-[16px] leading-none flex items-center justify-center shadow-sm"
    aria-label="Reset view"
  >⟳</button>
</div>
```

- [ ] **Step 2: Update hint text**

Replace the hint text div (lines ~372–376) with:

```tsx
<div className="absolute bottom-4 left-4 text-[10px] text-muted-foreground">
  {inContinentMode
    ? "Click a city or event marker · Drag to rotate · Scroll to zoom"
    : "Drag to spin · Click a continent to explore"}
</div>
```

- [ ] **Step 3: Replace the city detail panel with the unified city card**

Locate the block `{inContinentMode && selectedCity && (` (lines ~444–511). Replace the entire block with:

```tsx
{inContinentMode && selectedCity && (
  <div className="p-6">
    {/* Breadcrumb */}
    <button
      onClick={() => setSelectedCityId(null)}
      className="text-xs text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1"
    >← {selectedContinent!.name}</button>

    {/* City header */}
    <div className="mb-5">
      <h2 className="text-xl font-bold">{selectedCity.name}</h2>
      <div className="text-xs text-muted-foreground mt-0.5">
        {[
          cityTotalCandidates > 0 ? `${cityTotalCandidates} candidates` : null,
          cityUniversities.length > 0 ? `${cityUniversities.length} ${cityUniversities.length === 1 ? "university" : "universities"}` : null,
          (cityEvents[selectedCity.id] ?? []).length > 0
            ? `${(cityEvents[selectedCity.id] ?? []).length} ${(cityEvents[selectedCity.id] ?? []).length === 1 ? "event" : "events"}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </div>
    </div>

    {/* Section 1: Events */}
    {(cityEvents[selectedCity.id] ?? []).length > 0 && (
      <>
        <div ref={eventsRef} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Events
        </div>
        <div className="space-y-3 mb-5">
          {(cityEvents[selectedCity.id] ?? []).map((ev) => {
            const costPerHire = Math.round(ev.sponsorship / ev.hires);
            const optInPct = ((ev.optIns / ev.attendees) * 100).toFixed(1);
            const evCandidates = candidates.filter((c) => c.eventId === ev.id);
            return (
              <div key={ev.id} className="bg-card border border-border rounded-md p-3">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-sm font-semibold">{ev.name}</div>
                  <div className="text-[10px] text-muted-foreground">{ev.date}</div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
                  <div>
                    <span className="text-[10px] text-muted-foreground">Opt-in rate</span>
                    <div className="text-sm font-semibold tabular-nums">{optInPct}%</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Cost/hire</span>
                    <div className="text-sm font-semibold tabular-nums">€{costPerHire.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Pipeline</span>
                    <div className="text-sm font-semibold tabular-nums">{ev.pipeline}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Hires</span>
                    <div className="text-sm font-semibold tabular-nums">{ev.hires}</div>
                  </div>
                </div>
                {evCandidates.length > 0 && (
                  <button
                    onClick={() => {
                      setEventFilter(ev.id);
                      setView("candidates");
                    }}
                    className="w-full text-left text-xs text-primary hover:underline font-medium"
                  >
                    View {evCandidates.length} {evCandidates.length === 1 ? "candidate" : "candidates"} →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </>
    )}

    {/* Section 2: Universities */}
    {cityUniversities.length > 0 && (
      <>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Universities
        </div>
        <div className="space-y-2 mb-5">
          {cityUniversities.map((u) => (
            <div key={u.id} className="bg-card border border-border rounded-md p-3">
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-sm font-semibold">{u.shortName}</div>
                <div className="text-xs tabular-nums text-muted-foreground">{u.candidates}</div>
              </div>
              <div className="text-[11px] text-muted-foreground mb-2">{u.name}</div>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {u.topSkills.slice(0, 3).map((s) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded border border-primary/30 text-primary">{s}</span>
                ))}
              </div>
              <div className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium inline-block">
                {u.roleAffinity}
              </div>
            </div>
          ))}
        </div>
      </>
    )}

    {/* Section 3: Communities */}
    {cityCommunities.length > 0 && (
      <>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Communities
        </div>
        <div className="space-y-2">
          {cityCommunities.map((c) => (
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
          ))}
        </div>
      </>
    )}
  </div>
)}
```

- [ ] **Step 4: Verify the full flow in browser**

1. Load Ecosystem. Globe shows Europe with slow auto-rotate. ✓
2. Click "Europe" continent label. Globe zooms to Europe. City dots (sized) and event diamonds appear. ✓
3. Click the Munich city dot. Right panel shows Munich city card: HackTUM event card + TUM/LMU universities + communities. ✓
4. In the HackTUM event card, "View 5 candidates →" button is visible. Click it. Candidates view opens pre-filtered to HackTUM. ✓
5. Navigate back to Ecosystem. Click a HackTUM diamond marker. Munich card appears with Events section scrolled into view. ✓
6. Click "← Europe" breadcrumb. Returns to continent list. ✓
7. Click ⟳. Returns to world view with auto-rotate. ✓
8. Click "St. Gallen" in Europe city list. Card shows START Hack event only (no universities, no communities). ✓

- [ ] **Step 5: Commit**

```bash
git add src/components/eventiq/views/Ecosystem.tsx
git commit -m "feat: unified city card with event ROI, view-candidates CTA, and breadcrumb nav"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Phi sign bug fixed (Task 2 — formula verified against cobe source)
- ✅ projectGlobe rewritten to match cobe's U()/O() exactly (Task 2)
- ✅ scale passed to globe.update() (Task 2)
- ✅ DEFAULT_PHI centers Europe on load (Task 2)
- ✅ Idle auto-rotate on world view (Task 2)
- ✅ St. Gallen added (Task 1)
- ✅ City markers sized by candidate count (Task 3)
- ✅ Event diamond markers with ROI color tier (Task 3)
- ✅ Hover tooltips on both marker types (Task 3)
- ✅ Unified city card — events section (Task 4)
- ✅ Unified city card — universities + communities sections (Task 4)
- ✅ "View candidates →" CTA wires setEventFilter + setView (Task 4)
- ✅ eventsRef.scrollIntoView on event diamond click (Tasks 3+4)
- ✅ Breadcrumb in city card header (Task 4)
- ✅ +/- zoom buttons removed (Task 4)
- ✅ Hint text updated (Task 4)

**ROI color tier calibration note:** The spec stated ≤€600/hire → green, but all five events have cost/hire > €1,000 (computed as `sponsorship / hires`). Thresholds have been adjusted to produce a meaningful three-tier distribution across actual data: < €1,700 → green, ≤ €2,500 → amber, > €2,500 → gray. This gives HackTUM/START Hack green, CODE Berlin/ETH amber, and KIT gray.
