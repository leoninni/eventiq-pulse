# Globe Interaction Fix

Update `src/components/eventiq/views/Ecosystem.tsx` so the globe behaves like a real interactive map: no auto-rotation, and zoomable to inspect continents/cities.

## Changes

### 1. Remove auto-rotation
In the `onRender`/frame loop, delete `phiRef.current += 0.003`. The globe stays put until the user drags. Initial `phi`/`theta` stay centered on Europe.

### 2. Add zoom
Introduce a `zoomRef` (default `1`, clamped `0.6` – `4`) controlling effective globe size.

- **Wheel zoom**: `onWheel` on the canvas wrapper — `zoomRef.current *= e.deltaY < 0 ? 1.1 : 0.9`, clamp, `preventDefault`.
- **Pinch zoom** (trackpad/touch): handle via pointer events with 2 active pointers, tracking distance delta. (Optional polish — wheel covers the main case.)
- **+/− buttons**: small floating controls bottom-right of the globe panel for discoverability, each stepping zoom by ×1.2 / ÷1.2.

### 3. Apply zoom to globe + overlays
cobe doesn't expose a zoom prop, so we scale the rendered canvas:
- Keep canvas internal resolution at `GLOBE_SIZE * 2`.
- Render canvas at CSS size `GLOBE_SIZE * zoom`.
- Wrapper stays `GLOBE_SIZE` square with `overflow: hidden`, canvas centered with transform.
- Pass the same `zoom` factor into `projectToScreen` (multiply `radius` by zoom, offset by zoom-adjusted center) so city marker buttons track the visible globe.

### 4. Vertical drag (tilt)
Since auto-spin is gone, extend drag to also update `thetaRef` from vertical pointer movement (clamped to ±π/2 minus a small epsilon) so users can look at different latitudes.

### 5. Drag cursor + hint
Update empty-state hint copy in the right panel to: "Drag to rotate · Scroll to zoom · Click a city".

## Out of scope
No changes to data, layout, right panel content, or other views.
