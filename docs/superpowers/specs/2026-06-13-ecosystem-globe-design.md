# Ecosystem Interactive Globe

**Date:** 2026-06-13  
**Scope:** Replace the Ecosystem card grid with an interactive WebGL globe centered on Europe. Clicking city markers opens a detail panel showing that city's universities and communities.  
**New dependency:** `cobe` (5KB WebGL globe, zero transitive deps)  
**Files changed:** `mockData.ts`, `Ecosystem.tsx`

---

## Context

The current Ecosystem view shows university and community cards in a static grid. The interactive globe replaces this with a rotating WebGL globe centered on DACH, with clickable city markers that reveal the universities and student communities in each city. This is the highest-impact visual demo moment — showing that EventIQ has a mental map of the European student tech ecosystem that no ATS can replicate.

---

## Installation

```bash
bun add cobe
```

---

## Data Model Changes (`mockData.ts`)

### Add `lat`, `lng`, `city` to `UniversityProfile`

```ts
export interface UniversityProfile {
  id: string;
  name: string;
  shortName: string;
  location: string; // human-readable city name (unchanged)
  city: string; // city id for grouping (new)
  lat: number; // new
  lng: number; // new
  candidates: number;
  topSkills: string[];
  roleAffinity: string;
}
```

Updated `universityProfiles` array with coordinates:

| id           | city      | lat   | lng   |
| ------------ | --------- | ----- | ----- |
| tum          | munich    | 48.14 | 11.58 |
| eth          | zurich    | 47.38 | 8.54  |
| tuberlin     | berlin    | 52.52 | 13.41 |
| kit          | karlsruhe | 49.01 | 8.40  |
| rwth         | aachen    | 50.78 | 6.08  |
| unistuttgart | stuttgart | 48.78 | 9.18  |
| tudarmstadt  | darmstadt | 49.88 | 8.66  |
| lmu          | munich    | 48.14 | 11.58 |

### Add `city` to `StudentCommunity`

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
  city: string; // new — city id for grouping
  members: number;
  topSkills: string[];
}
```

City assignments for communities:

- tum-ai, tum-ml, tum-robotics, lmu-oss → `"munich"`
- eth-robotics, eth-women, eth-entre → `"zurich"`
- kit-data → `"karlsruhe"`
- tud-robotics → `"darmstadt"`
- stuttgart-cloud → `"stuttgart"`

### New `CityMarker` type and `cityMarkers` export

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

---

## Ecosystem Component Rewrite (`Ecosystem.tsx`)

### Layout

Full-height two-panel flex row:

- **Left panel** (55% width, `flex-1`): Globe canvas + city overlay buttons
- **Right panel** (45% width, `w-[420px] shrink-0`): Detail panel (empty state or selected city)

Outer wrapper: `flex h-screen overflow-hidden` (no padding — globe fills the panel edge to edge).

Header (`h-16`) sits above the two-panel area, containing the page title and aggregate stats strip.

### Globe Setup (cobe)

Canvas element: `width="600" height="600"` in the DOM but scaled to fill the left panel via `width: 100%`. The globe is initialized in `useEffect` on mount:

```ts
import createGlobe from "cobe";

// Inside useEffect:
const globe = createGlobe(canvasRef.current!, {
  devicePixelRatio: 2,
  width: 600 * 2,
  height: 600 * 2,
  phi: 0.25, // initial rotation — center on Europe
  theta: 0.25, // slight tilt downward
  dark: 1,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 5,
  baseColor: [0.12, 0.16, 0.12], // dark forest base matching app bg
  markerColor: [0.69, 0.87, 0.76], // #B0DEBB mint green for markers
  glowColor: [0.18, 0.47, 0.28], // #2F7847 forest green glow
  markers: cityMarkers.map((c) => ({ location: [c.lat, c.lng] as [number, number], size: 0.04 })),
  onRender: (state) => {
    if (!isDragging.current) {
      phiRef.current += 0.003; // slow auto-rotate
    }
    state.phi = phiRef.current;
    state.theta = thetaRef.current;
    // Store current phi/theta for overlay projection
    currentPhi.current = state.phi;
    currentTheta.current = state.theta;
  },
});
```

Refs needed:

- `canvasRef` — canvas DOM element
- `phiRef`, `thetaRef` — current rotation (mutable, not state)
- `currentPhi`, `currentTheta` — snapshot for overlay projection
- `isDragging` — true during pointer drag
- `pointerStart` — pointer-down x/y for drag handling

**Drag interaction:** On `pointerdown` store x/y, set `isDragging = true`. On `pointermove` compute delta and update `phiRef`. On `pointerup` set `isDragging = false`.

### City Marker Overlay (click buttons)

On each animation frame, `onRender` updates `currentPhi`/`currentTheta`. A separate `useEffect` uses `requestAnimationFrame` to recompute and reposition overlay buttons every frame.

**Projection math** (lat/lon → canvas 2D):

```ts
function projectToScreen(
  lat: number,
  lng: number,
  phi: number,
  theta: number,
  canvasWidth: number,
  canvasHeight: number,
): { x: number; y: number; visible: boolean } {
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;

  // 3D point on unit sphere
  const x0 = Math.cos(latR) * Math.sin(lngR);
  const y0 = Math.sin(latR);
  const z0 = Math.cos(latR) * Math.cos(lngR);

  // Rotate by phi (Y axis)
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const x1 = x0 * cosPhi + z0 * sinPhi;
  const y1 = y0;
  const z1 = -x0 * sinPhi + z0 * cosPhi;

  // Rotate by theta (X axis)
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const x2 = x1;
  const y2 = y1 * cosTheta - z1 * sinTheta;
  const z2 = y1 * sinTheta + z1 * cosTheta;

  const radius = Math.min(canvasWidth, canvasHeight) * 0.42;
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;

  return {
    x: cx + x2 * radius,
    y: cy - y2 * radius,
    visible: z2 > 0.05, // only show when on front hemisphere
  };
}
```

For each city marker, render a positioned `<button>` absolute over the canvas:

```tsx
<button
  style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
  className={`absolute w-3 h-3 rounded-full transition-all cursor-pointer
    ${
      selectedCityId === city.id
        ? "bg-[#2F7A47] ring-2 ring-[#B0DEBB] ring-offset-1 ring-offset-transparent scale-150"
        : "bg-[#6BAE82] hover:bg-[#2F7A47] hover:scale-125"
    }
    ${!pos.visible ? "opacity-0 pointer-events-none" : "opacity-100"}`}
  onClick={() => setSelectedCityId(city.id === selectedCityId ? null : city.id)}
/>
```

The `<div>` wrapping the canvas and overlay buttons must be `position: relative` with `overflow: hidden`.

### Right Panel — Detail

**Empty state** (no city selected):

```tsx
<div className="flex flex-col items-center justify-center h-full text-center gap-3">
  <div className="text-4xl">🌍</div>
  <div className="text-sm font-medium">Click a city on the globe</div>
  <div className="text-xs text-muted-foreground">to explore its universities and communities</div>
  <div className="mt-4 flex gap-4">
    <Stat value={247} label="candidates" />
    <Stat value={8} label="universities" />
    <Stat value={10} label="communities" />
  </div>
</div>
```

**Selected city state:**

```
[City name + candidate count]
[Divider]
[Section: Universities]
  [Card per university in that city]
    - shortName, candidates count, skills, roleAffinity
[Section: Communities]  (if any)
  [Card per community in that city]
    - name, type badge, members
```

Universities in city: `universityProfiles.filter(u => u.city === selectedCityId)`
Communities in city: `studentCommunities.filter(c => c.city === selectedCityId)`

Total candidates for city: `sum of u.candidates for universities in city`

Detail panel header: city name (`cityMarkers.find(c => c.id === selectedCityId)?.name`), total candidates, close button (×).

---

## Files Changed

| File                                         | Change                                                                                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/eventiq/mockData.ts`                | Add `lat`, `lng`, `city` to `UniversityProfile`; add `city` to `StudentCommunity`; add `CityMarker` interface + `cityMarkers` export; update all data |
| `src/components/eventiq/views/Ecosystem.tsx` | Full rewrite — globe canvas, overlay buttons, two-panel layout, detail panel                                                                          |

No routing, store, sidebar, or AppLayout changes needed.
