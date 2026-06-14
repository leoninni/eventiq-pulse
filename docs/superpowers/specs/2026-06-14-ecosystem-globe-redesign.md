# Ecosystem Globe Redesign

**Date:** 2026-06-14  
**Status:** Approved

## Problem

The Ecosystem globe has two categories of issues:

1. **Bugs** — continent zoom targets the wrong region (phi sign mismatch between `projectGlobe` and cobe's renderer); theta over-tilts for high-latitude cities; zoom only applies via CSS stretch so the canvas goes blurry at high magnification; dead auto-rotate code that never fires.

2. **Missing recruiter value** — hackathon events are invisible on the globe despite being the product's core data asset; city markers are uniform dots with no size signal; no hover previews; no direct path from a globe location to the candidate list.

## Goal

A geographically accurate, interactive globe that lets a recruiter go from "where should I sponsor next quarter?" to candidate profiles without leaving the Ecosystem view.

---

## Data Model Changes (`mockData.ts`)

### `EventItem` — add fields

```ts
lat: number      // event venue latitude
lng: number      // event venue longitude
cityId: string   // links to a CityMarker id (or null if no city marker)
```

Populated values:

| Event | lat | lng | cityId |
|---|---|---|---|
| HackTUM 2025 | 48.14 | 11.58 | munich |
| START Hack 2025 | 47.42 | 9.37 | st-gallen |
| CODE Berlin Hackathon | 52.52 | 13.41 | berlin |
| ETH Build Night | 47.38 | 8.54 | zurich |
| KIT Innovation Hack | 49.01 | 8.40 | karlsruhe |

### `CityMarker` — add St. Gallen

```ts
{ id: "st-gallen", name: "St. Gallen", continent: "europe", lat: 47.42, lng: 9.37 }
```

No university or community data yet — the city card will show only the START Hack event card. Universities/communities sections are conditionally omitted when empty.

### `continents` — update default center

Change Europe's anchor to center DACH:

```ts
{ id: "europe", name: "Europe", lat: 48, lng: 10, zoom: 2.8 }
```

---

## Globe Rendering Fixes

### Phi sign bug

Current code: `phi = (c.lng * Math.PI) / 180`  
Fixed: `phi = -(c.lng * Math.PI) / 180`

cobe rotates the globe such that positive phi spins it clockwise (viewed from above), which moves eastern longitudes away from center — the opposite of the current assumption. The `projectGlobe` overlay projection function must use the conjugate rotation to match cobe's direction. Both lines change:

```ts
// before
const x1 = x0 * cP - z0 * sP;
const z1 = x0 * sP + z0 * cP;
// after (conjugate = rotate by -phi)
const x1 = x0 * cP + z0 * sP;
const z1 = -x0 * sP + z0 * cP;
```

Verify after implementing: clicking Europe should bring Munich/Zürich/Berlin to front-center of the canvas.

### Theta normalization

Current: `theta = (c.lat * Math.PI) / 180` — treats lat degrees as radians, over-tilts at high latitudes.  
Fixed: `theta = (c.lat / 90) * (Math.PI / 2 - 0.1)` — maps 0–90° lat to 0–~1.47 rad, capped slightly below the pole to avoid gimbal clamp.

### Scale passed to cobe

`globe.update()` currently omits scale. Add:

```ts
globe.update({ phi: phiRef.current, theta: thetaRef.current, scale: zoomRef.current })
```

This keeps the canvas rendering resolution locked to the globe's logical size at all zoom levels, eliminating blur at zoom > 1.

### Default orientation

```ts
const DEFAULT_PHI = -(10 * Math.PI) / 180   // center on ~10°E (central Europe)
const DEFAULT_THETA = 0.35                    // slight northern tilt
const DEFAULT_ZOOM = 1
```

DACH cities (Munich, Zürich, Berlin, Karlsruhe) are visible on load without any click.

### Idle auto-rotate

Restore subtle auto-rotate on world view only: `phiRef.current += 0.0008` per frame, cancelled immediately on any pointer interaction or continent selection. Gives the globe life on first impression.

---

## Marker System

Two overlay types rendered on the same canvas. Both are absolutely-positioned divs in front of the `<canvas>`, positioned via `projectGlobe`.

### City markers (circles)

- Size proportional to total candidate count for that city: `6px` (0 candidates) → `14px` (largest city). Formula: `6 + Math.sqrt(candidates / maxCandidates) * 8` where `maxCandidates` is computed at render time as `Math.max(...cityMarkers.map(c => aggregated candidate count for c))`.
- Color: `#2F7A47` fill, white ring.
- Shown in all views (world + continent).
- In world view: not clickable (clicking a continent label is the entry point).
- In continent view: clicking opens the unified city card in the right panel.

### Event markers (diamonds)

- Positioned at the event's lat/lng.
- Shape: a rotated square (`rotate-45`) in an overlay div, 10×10px.
- Color by ROI tier (cost/hire):
  - ≤ €600/hire → `#2F7A47` (green, top performer)
  - €601–€1000 → `#D97706` (amber, mid)
  - > €1000 → `#9CA3AF` (gray, lower)
- Shown in continent view only (too dense on world view).
- Clicking opens the unified city card for that event's city; the right panel scrolls to the Events section via `eventsRef.current?.scrollIntoView({ behavior: "smooth" })` where `eventsRef` is a ref attached to the Events section header element.
- For cities with both a city marker and an event marker (Munich, Berlin, Zürich, Karlsruhe), the event marker is offset 12px upward in screen pixels from the city marker's projected position so both are visible without overlap.

### Hover tooltips

Both marker types show a tooltip on hover (no click required):

```
Munich
340 candidates · HackTUM 2025
```

For cities with multiple events:

```
Berlin
180 candidates · CODE Berlin Hackathon
```

Tooltip is a small white rounded pill positioned above the marker, z-indexed above other overlays.

---

## Right Panel — Unified City Card

Three stacked sections rendered in order. Sections with no data are omitted entirely.

### Header

```
← Europe          (breadcrumb, clickable back to continent view)
Munich
340 candidates · 2 universities · 1 event
```

Breadcrumb is a clickable path: clicking `← Europe` returns to continent panel (sets selectedCityId to null). "World" level is always reachable via the ⟳ reset button on the globe.

### Section 1: Events (shown only if city has events)

Each event renders as a card:

```
HackTUM 2025                          Apr 12, 2025
────────────────────────────────────────────────
Opt-in rate    14.8%     Cost/hire    €1,600
Pipeline         12      Hires             5
                         [View 5 candidates →]
```

"View candidates →" is a button that calls `setView("candidates")` and `setEventFilter(event.id)` on the global store, navigating directly to the Candidates view pre-filtered to that event.

### Section 2: Universities

Unchanged from current design — shortName, candidate count, top skills (3 chips), role affinity badge.

### Section 3: Communities

Unchanged from current design — name, type badge, member count, university affiliation.

---

## Controls Simplification

**Remove:** +/− zoom buttons. Scroll-to-zoom and pinch-to-zoom cover all use cases. The buttons add visual noise without meaningful recruiter utility.

**Keep:** ⟳ reset button (bottom-right). Essential for returning to world view without knowing to click the breadcrumb.

**Keep:** drag-to-rotate and scroll-to-zoom.

**Keep:** hint text at bottom-left (update copy to reflect new interactions):
- World view: `"Drag to spin · Click a continent to explore"`
- Continent view: `"Click a city or event marker · Drag to rotate · Scroll to zoom"`

---

## Store Changes (`store.tsx`)

No changes needed. `eventFilter: string` and `setEventFilter` already exist in the store (default: `"all"`). The Ecosystem view calls `setEventFilter(event.id)` then `setView("candidates")` to navigate. The Candidates view already reads `eventFilter` to filter the list.

---

## Files Changed

| File | Change |
|---|---|
| `src/lib/eventiq/mockData.ts` | Add lat/lng/cityId to EventItem; add St. Gallen CityMarker; update Europe continent anchor |
| `src/lib/eventiq/store.tsx` | No changes needed — eventFilter already exists |
| `src/components/eventiq/views/Ecosystem.tsx` | All globe fixes + new marker system + unified city card |
| `src/components/eventiq/views/Candidates.tsx` | Verify eventFilter is already wired; no changes expected |

---

## What This Is Not

- No backend. All data remains hardcoded in mockData.ts.
- No new views. Navigation stays on the existing 6-view structure.
- No map tiles or third-party geo APIs. cobe WebGL globe only.
