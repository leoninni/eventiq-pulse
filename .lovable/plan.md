# Make the world view an actual globe

The flat SVG dot-map reads as colored rectangles, not a globe. Replace it with the same cobe 3D globe already used in continent mode, restyled light so it matches the page.

## World mode (default)

- Render a light cobe globe centered at phi≈0, theta≈0.3, zoom≈1, with slow auto-rotate (paused while dragging).
- Light palette: `dark: 0`, `baseColor [0.92, 0.96, 0.93]`, `markerColor [0.18, 0.48, 0.28]`, `glowColor [0.85, 0.92, 0.86]`, `mapBrightness 1.5`. Globe sits on the mint page background with a soft halo, no hard edge.
- Markers on the globe: one big dot per interactive continent (Europe, NA, Asia) at its centroid, plus muted small dots for Africa/SA/Oceania (visual only, not clickable).
- HTML overlay buttons on top of the canvas at each interactive continent's projected position: a label chip ("EUROPE · 247 candidates · 7 cities") + larger clickable dot. Hidden on the back hemisphere (`z2 > 0.05`). Clicking a continent transitions to continent mode.
- Drag to rotate, scroll to zoom (same handlers as continent mode).

## Continent mode (unchanged behavior, smoother transition)

- Same globe instance keeps rendering; on continent select, animate `phi → -lng`, `theta → lat`, `zoom → continent.zoom` via a lerp loop (k=0.08). Auto-rotate stops.
- City markers (HTML overlays + cobe dots) appear for the selected continent only.
- "← Back to world" in the right panel clears selection and animates back to phi=0, theta=0.3, zoom=1; auto-rotate resumes.

## Right panel

No changes — same "Continents" list in world mode, same continent/city detail panels in continent mode.

## Files

- `src/components/eventiq/views/Ecosystem.tsx` — delete the `WorldMap` SVG component and the flat-projection / dot-grid helpers; collapse `ContinentGlobe` back into the main component so a single cobe instance handles both modes with a lerp-driven target; restyle markers (continent vs city) accordingly.

No changes to mock data, routing, or other views.
