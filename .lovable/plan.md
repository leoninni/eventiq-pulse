# Globe: Fix Drag Direction + Light Theme

Two small adjustments to `src/components/eventiq/views/Ecosystem.tsx`. I'm **not** swapping in the pasted `globe.tsx` snippet — its body is empty (just keyframes, no actual sphere or markers), so it would regress the working interactive globe. Instead, restyle the existing cobe globe to match the rest of the page and invert the drag.

## Changes

### 1. Invert drag direction
Currently dragging right rotates the globe the wrong way (and vertical drag tilts the wrong way too). In `onPointerMove`, flip the signs:

- `phi = start.phi + (dx / scale) * 2π` (was `−`)
- `theta = start.theta − (dy / scale) * 2π` (was `+`)

So dragging right spins the globe rightward (content under the cursor follows the cursor), and dragging down tilts the north pole away from the viewer — standard map/globe behavior.

### 2. Light background that blends with the page
Today the globe panel is `bg-[#0A0D0A]` (near-black). Restyle it to match the app's mint/cream surface so the globe sits on the page instead of inside a dark box.

- Globe panel background: `bg-background` (the app's `#EEF3EE` mint).
- Drop the `dark: 1` cobe option (use light render).
- Recolor cobe:
  - `baseColor:   [0.93, 0.96, 0.93]` — pale mint to match `--background`
  - `markerColor: [0.18, 0.47, 0.28]` — `#2F7A47` accent green, visible on light base
  - `glowColor:   [0.93, 0.96, 0.93]` — same as base so the halo blends into the page (no dark vignette)
  - `mapBrightness: 1.2`, `diffuse: 1.0` — softer shading for a light surface
- City marker dots: switch from white-on-dark to charcoal/green on light:
  - Default: `bg-[#2F7A47]`, hover `bg-[#1F4A2E]`
  - Selected: `bg-[#1A1F1A] ring-2 ring-[#2F7A47] ring-offset-1 ring-offset-background`
- City label chip: `text-[#1A1F1A] bg-white/80 border border-border` (replaces `text-white bg-black/70`).
- Zoom +/−/reset buttons: light surface — `bg-white border border-border text-foreground hover:bg-muted`.
- Hint text bottom-left: `text-muted-foreground`.

No layout, data, interaction-model, or other-view changes. Drag/zoom/click behavior stays as-is apart from the inverted drag signs.

## Files
- `src/components/eventiq/views/Ecosystem.tsx` — drag math + theme/colors only.
