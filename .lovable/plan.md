# Globe: Continent → City Drill-In, Fixed Markers, Darker Sphere

Three fixes to `src/components/eventiq/views/Ecosystem.tsx` (+ small additions to `src/lib/eventiq/mockData.ts`).

## 1. Fix marker alignment (Europe clicks)

The overlay buttons are misaligned with the dots cobe draws on the sphere — that's why European markers don't catch clicks and others appear in wrong spots. cobe rotates the globe with the opposite phi convention from what `projectToScreen` currently assumes (we flipped drag-direction last turn without flipping projection).

Fix in `projectToScreen`:
- `x1 = x0 * cosPhi − z0 * sinPhi`
- `z1 = x0 * sinPhi + z0 * cosPhi`

(Sign of the phi rotation matrix flipped.) Verified by tracing: Munich (lat 48.14, lng 11.58) with phi=−0.20, theta=0.25 then lands directly under the cobe-rendered dot. Initial `phiRef` becomes `−0.20` (was `+0.25`) so Europe sits centered at load.

## 2. Continent → City drill-in

### Data (`mockData.ts`)
- Add `continent: "europe" | "north-america" | "asia"` to `UniversityProfile`, `StudentCommunity`, and `CityMarker`. Existing 8 DACH cities → `"europe"`.
- Add 3 demo cities so the continent interaction reads with more than one option (small numbers, flagged as "Expanding network"):
  - North America: `boston` (45 candidates, MIT/Harvard hackathons), `sf-bay` (38)
  - Asia: `singapore` (22)
  - Add matching `universityProfiles` entries (MIT, Stanford, NUS) and one community each.
- Export `continents`:
  ```ts
  [
    { id: "europe",        name: "Europe",        lat: 50,  lng: 10,   zoom: 2.6 },
    { id: "north-america", name: "North America", lat: 40,  lng: -95,  zoom: 2.4 },
    { id: "asia",          name: "Asia",          lat: 20,  lng: 100,  zoom: 2.2 },
  ]
  ```

### Interaction model
Add `selectedContinentId` state. Three modes:

| Mode | Trigger | Renders |
|---|---|---|
| **World** (default) | none selected | Continent markers only (large dot + label + candidate count) at each continent centroid |
| **Continent** | click continent marker | Animate phi/theta/zoom toward `continents[id]`, hide continent dots, render that continent's city markers |
| **City** | click city marker (continent already selected) | Same as Continent + right-panel detail (existing behavior) |

Animated transition: in a `useEffect` watching `selectedContinentId`, set a `targetPhi/targetTheta/targetZoom`; the existing rAF frame loop lerps `phiRef/thetaRef/zoomRef` toward targets at 0.08/frame until close enough. Manual drag/scroll cancels the lerp (clears target).

Back navigation:
- Right panel gains a "← Back to world" button when a continent is selected (clears `selectedContinentId` and `selectedCityId`, animates back to phi=−0.20, theta=0.25, zoom=1).
- Empty-state right panel in world mode lists the continents with their candidate totals, clickable as an alternative to globe dots.

Continent dots styled larger than city dots: `w-4 h-4` charcoal with green ring, label always visible. City dots stay as today.

## 3. Darker globe

Globe panel keeps light page background, but the sphere itself gets contrast against it:
- `baseColor:   [0.18, 0.24, 0.20]` — deep forest, reads as a globe object on the mint page
- `markerColor: [0.72, 0.90, 0.78]` — pale mint dots, visible against dark sphere
- `glowColor:   [0.55, 0.75, 0.62]` — soft mint halo bleeds into background without a hard edge
- `mapBrightness: 4`, `diffuse: 1.2`, `dark: 1` — restored for proper shading on a dark base

Overlay marker dots restyled for visibility on the now-dark sphere:
- City default: `bg-white` w/ subtle ring; hover scales up
- City selected: `bg-[#B8E0C2] ring-2 ring-white`
- Continent: `bg-white ring-2 ring-[#2F7A47]`, label chip `bg-[#1A1F1A]/80 text-white`

## Out of scope
No changes to other views, store, layout shell, or candidate/event data.

## Files
- `src/components/eventiq/views/Ecosystem.tsx` — projection sign, continent state machine, lerp, dot restyle, cobe color tweak
- `src/lib/eventiq/mockData.ts` — `continent` field, `continents` export, 3 demo cities + universities + communities
