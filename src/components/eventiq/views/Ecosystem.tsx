import { useEffect, useMemo, useRef, useState } from "react";
import createGlobe from "cobe";
import {
  universityProfiles,
  studentCommunities,
  cityMarkers,
  continents,
  type StudentCommunity,
  type ContinentId,
} from "@/lib/eventiq/mockData";

const GLOBE_SIZE = 560;
const ZOOM_MIN = 0.8;
const ZOOM_MAX = 4;
const THETA_LIMIT = Math.PI / 2 - 0.05;

const typeBadgeStyles: Record<StudentCommunity["type"], string> = {
  "AI/ML":            "bg-[#DCEFE2] text-[#1F4A2E]",
  "Robotics":         "bg-[#E2E8F0] text-[#334155]",
  "Entrepreneurship": "bg-[#F5E7CC] text-[#7A5712]",
  "Cloud/DevOps":     "bg-[#E8F0F5] text-[#1A4A6E]",
  "Data":             "bg-[#F0E8F5] text-[#4A1A6E]",
  "Open Source":      "bg-[#F5F0E8] text-[#6E4A1A]",
  "Community":        "bg-secondary text-muted-foreground",
};

// =================================================================
// World map (flat SVG, dot grid)
// =================================================================

const MAP_W = 720;
const MAP_H = 360;

// Equirectangular: lng -180..180 → 0..MAP_W ; lat 90..-90 → 0..MAP_H
function projectFlat(lat: number, lng: number) {
  return {
    x: ((lng + 180) / 360) * MAP_W,
    y: ((90 - lat) / 180) * MAP_H,
  };
}

type Region = { n: number; s: number; w: number; e: number };
type ContKey = ContinentId | "africa" | "south-america" | "oceania";

const continentRegions: Record<ContKey, Region[]> = {
  "europe":         [{ n: 71, s: 36, w: -10, e: 40 }],
  "north-america":  [
    { n: 72, s: 25, w: -168, e: -52 },
    { n: 25, s: 7,  w: -118, e: -78 },
  ],
  "asia":           [
    { n: 78, s: 8,   w: 40,  e: 170 },
    { n: 8,  s: -11, w: 95,  e: 142 },
  ],
  "africa":         [{ n: 37, s: -35, w: -18, e: 52 }],
  "south-america":  [{ n: 13, s: -56, w: -82, e: -34 }],
  "oceania":        [{ n: -10, s: -47, w: 112, e: 154 }],
};

function continentOfDot(lat: number, lng: number): ContKey | null {
  for (const key of Object.keys(continentRegions) as ContKey[]) {
    for (const r of continentRegions[key]) {
      if (lat <= r.n && lat >= r.s && lng >= r.w && lng <= r.e) return key;
    }
  }
  return null;
}

type Dot = { x: number; y: number; cont: ContKey };
function buildDots(): Dot[] {
  const dots: Dot[] = [];
  const step = 3; // degrees
  for (let lat = 78; lat >= -56; lat -= step) {
    for (let lng = -178; lng <= 178; lng += step) {
      const cont = continentOfDot(lat, lng);
      if (!cont) continue;
      const { x, y } = projectFlat(lat, lng);
      dots.push({ x, y, cont });
    }
  }
  return dots;
}

const continentColors: Record<ContKey, { dot: string; active: string }> = {
  "europe":         { dot: "#7BB48E",  active: "#2F7A47" },
  "north-america":  { dot: "#7BB48E",  active: "#2F7A47" },
  "asia":           { dot: "#7BB48E",  active: "#2F7A47" },
  "africa":         { dot: "#CFD9D0",  active: "#CFD9D0" },
  "south-america":  { dot: "#CFD9D0",  active: "#CFD9D0" },
  "oceania":        { dot: "#CFD9D0",  active: "#CFD9D0" },
};

const continentLabelPos: Record<ContinentId, { lat: number; lng: number }> = {
  "europe":         { lat: 54, lng: 18 },
  "north-america":  { lat: 48, lng: -100 },
  "asia":           { lat: 42, lng: 100 },
};

// =================================================================
// Globe projection (for continent zoom view)
// cobe convention: phi = -lng (radians) centers a point horizontally.
//   x1 = x0 cosφ + z0 sinφ
//   z1 = -x0 sinφ + z0 cosφ
// =================================================================
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
  const x0 = Math.cos(latR) * Math.sin(lngR);
  const y0 = Math.sin(latR);
  const z0 = Math.cos(latR) * Math.cos(lngR);
  const cP = Math.cos(phi), sP = Math.sin(phi);
  const x1 =  x0 * cP + z0 * sP;
  const z1 = -x0 * sP + z0 * cP;
  const y1 = y0;
  const cT = Math.cos(theta), sT = Math.sin(theta);
  const y2 = y1 * cT - z1 * sT;
  const z2 = y1 * sT + z1 * cT;
  const radius = size * 0.42 * zoom;
  return {
    x: size / 2 + x1 * radius,
    y: size / 2 - y2 * radius,
    visible: z2 > 0.05,
  };
}

// =================================================================

type OverlayPos = { id: string; x: number; y: number; visible: boolean };

export function Ecosystem() {
  const [selectedContinentId, setSelectedContinentId] = useState<ContinentId | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  const inContinentMode = selectedContinentId !== null;

  const continentCityCount: Record<ContinentId, number> = { "europe": 0, "north-america": 0, "asia": 0 };
  const continentCandidateCount: Record<ContinentId, number> = { "europe": 0, "north-america": 0, "asia": 0 };
  cityMarkers.forEach((c) => { continentCityCount[c.continent]++; });
  universityProfiles.forEach((u) => { continentCandidateCount[u.continent] += u.candidates; });

  const visibleCities = inContinentMode
    ? cityMarkers.filter((c) => c.continent === selectedContinentId)
    : [];

  const selectedCity      = selectedCityId ? cityMarkers.find((c) => c.id === selectedCityId) : null;
  const cityUniversities  = selectedCityId ? universityProfiles.filter((u) => u.city === selectedCityId) : [];
  const cityCommunities   = selectedCityId ? studentCommunities.filter((c) => c.city === selectedCityId) : [];
  const cityTotalCandidates = cityUniversities.reduce((s, u) => s + u.candidates, 0);

  const selectedContinent = selectedContinentId
    ? continents.find((c) => c.id === selectedContinentId)!
    : null;

  function resetView() {
    setSelectedCityId(null);
    setSelectedContinentId(null);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="px-8 py-5 border-b border-border shrink-0">
        <h1 className="font-display text-3xl tracking-tight">Talent Ecosystem</h1>
        <p className="text-xs text-muted-foreground mt-1">
          University talent pools and student communities in your recruiting network.
        </p>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex items-center justify-center bg-background relative overflow-hidden p-6">
          {!inContinentMode && (
            <WorldMap
              candidateCounts={continentCandidateCount}
              cityCounts={continentCityCount}
              onSelectContinent={(id) => setSelectedContinentId(id)}
            />
          )}
          {inContinentMode && (
            <ContinentGlobe
              continentId={selectedContinentId!}
              visibleCities={visibleCities}
              selectedCityId={selectedCityId}
              onSelectCity={(id) => setSelectedCityId(id)}
            />
          )}

          <div className="absolute bottom-4 left-4 text-[10px] text-muted-foreground">
            {inContinentMode
              ? "Drag to rotate · Scroll to zoom · Click a city marker"
              : "Click a highlighted continent to explore its cities"}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[400px] shrink-0 border-l border-border overflow-y-auto bg-card">
          {!inContinentMode && (
            <div className="p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Continents
              </div>
              <div className="space-y-2">
                {continents.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContinentId(c.id)}
                    className="w-full text-left bg-card border border-border rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all"
                  >
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="text-sm font-semibold">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {continentCityCount[c.id]} {continentCityCount[c.id] === 1 ? "city" : "cities"}
                      </div>
                    </div>
                    <div className="text-2xl font-bold tabular-nums">
                      {continentCandidateCount[c.id]}
                    </div>
                    <div className="text-xs text-muted-foreground">candidates</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {inContinentMode && !selectedCity && (
            <div className="p-6">
              <button
                onClick={resetView}
                className="text-xs text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1"
              >← Back to world</button>
              <h2 className="text-xl font-bold mb-1">{selectedContinent!.name}</h2>
              <div className="text-xs text-muted-foreground mb-5">
                {continentCandidateCount[selectedContinent!.id]} candidates ·{" "}
                {continentCityCount[selectedContinent!.id]}{" "}
                {continentCityCount[selectedContinent!.id] === 1 ? "city" : "cities"}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Cities
              </div>
              <div className="space-y-1.5">
                {visibleCities.map((c) => {
                  const cands = universityProfiles
                    .filter((u) => u.city === c.id)
                    .reduce((s, u) => s + u.candidates, 0);
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCityId(c.id)}
                      className="w-full text-left bg-card border border-border rounded-md px-3 py-2 hover:border-primary transition-colors flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{c.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{cands}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {inContinentMode && selectedCity && (
            <div className="p-6">
              <button
                onClick={() => setSelectedCityId(null)}
                className="text-xs text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1"
              >← Back to {selectedContinent!.name}</button>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold">{selectedCity.name}</h2>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {cityTotalCandidates} candidates · {cityUniversities.length}{" "}
                    {cityUniversities.length === 1 ? "university" : "universities"}
                  </div>
                </div>
              </div>

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
        </div>
      </div>
    </div>
  );
}

// =================================================================
// Flat SVG world map (world mode)
// =================================================================

function WorldMap({
  candidateCounts,
  cityCounts,
  onSelectContinent,
}: {
  candidateCounts: Record<ContinentId, number>;
  cityCounts: Record<ContinentId, number>;
  onSelectContinent: (id: ContinentId) => void;
}) {
  const dots = useMemo(() => buildDots(), []);
  const [hovered, setHovered] = useState<ContinentId | null>(null);

  // Group dots by continent for rendering
  const dotsByCont: Record<ContKey, Dot[]> = {
    europe: [], "north-america": [], asia: [],
    africa: [], "south-america": [], oceania: [],
  };
  dots.forEach((d) => dotsByCont[d.cont].push(d));

  const interactive: ContinentId[] = ["europe", "north-america", "asia"];

  return (
    <div className="relative w-full h-full max-w-[900px] max-h-[480px] flex items-center justify-center">
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="w-full h-full"
        style={{ overflow: "visible" }}
      >
        {/* faint global grid behind */}
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#E3E8E3" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={MAP_W} height={MAP_H} fill="url(#grid)" opacity="0.4" />

        {/* Non-interactive continents */}
        {(["africa", "south-america", "oceania"] as ContKey[]).map((k) => (
          <g key={k}>
            {dotsByCont[k].map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={1.4} fill={continentColors[k].dot} />
            ))}
          </g>
        ))}

        {/* Interactive continents */}
        {interactive.map((k) => {
          const isHover = hovered === k;
          const color = isHover ? continentColors[k].active : continentColors[k].dot;
          return (
            <g
              key={k}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(k)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectContinent(k)}
            >
              {/* Invisible hit-area: enlarge each dot */}
              {dotsByCont[k].map((d, i) => (
                <circle key={`hit-${i}`} cx={d.x} cy={d.y} r={4} fill="transparent" />
              ))}
              {dotsByCont[k].map((d, i) => (
                <circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r={isHover ? 2 : 1.6}
                  fill={color}
                  style={{ transition: "fill 200ms, r 200ms" }}
                />
              ))}
            </g>
          );
        })}

        {/* Continent labels */}
        {interactive.map((k) => {
          const pos = projectFlat(continentLabelPos[k].lat, continentLabelPos[k].lng);
          const c = continents.find((x) => x.id === k)!;
          const isHover = hovered === k;
          return (
            <g
              key={`lbl-${k}`}
              style={{ cursor: "pointer", pointerEvents: "none" }}
              transform={`translate(${pos.x}, ${pos.y})`}
            >
              <rect
                x={-44}
                y={-12}
                width={88}
                height={24}
                rx={4}
                fill={isHover ? "#1A1F1A" : "#FFFFFF"}
                stroke={isHover ? "#2F7A47" : "#E3E8E3"}
                strokeWidth={1}
                style={{ transition: "fill 200ms" }}
              />
              <text
                x={0}
                y={-1}
                textAnchor="middle"
                fontSize={9}
                fontWeight={700}
                fill={isHover ? "#FFFFFF" : "#1A1F1A"}
                style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                {c.name}
              </text>
              <text
                x={0}
                y={9}
                textAnchor="middle"
                fontSize={8}
                fill={isHover ? "#B8E0C2" : "#5C6660"}
              >
                {candidateCounts[k]} candidates · {cityCounts[k]}{cityCounts[k] === 1 ? " city" : " cities"}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// =================================================================
// Continent globe (continent mode) — light themed
// =================================================================

function ContinentGlobe({
  continentId,
  visibleCities,
  selectedCityId,
  onSelectCity,
}: {
  continentId: ContinentId;
  visibleCities: typeof cityMarkers;
  selectedCityId: string | null;
  onSelectCity: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const continent = continents.find((c) => c.id === continentId)!;

  // Initialize phi/theta from continent
  const initPhi   = -(continent.lng * Math.PI) / 180;
  const initTheta = (continent.lat * Math.PI) / 180;
  const initZoom  = continent.zoom;

  const phiRef   = useRef(initPhi);
  const thetaRef = useRef(initTheta);
  const zoomRef  = useRef(initZoom);

  const isDragging   = useRef(false);
  const pointerStart = useRef<{ x: number; y: number; phi: number; theta: number } | null>(null);

  const [overlays, setOverlays] = useState<OverlayPos[]>([]);
  const [zoom, setZoom] = useState(initZoom);

  // Recreate globe when continent changes
  useEffect(() => {
    phiRef.current   = initPhi;
    thetaRef.current = initTheta;
    zoomRef.current  = initZoom;
    setZoom(initZoom);

    if (!canvasRef.current) return;
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width:  GLOBE_SIZE * 2,
      height: GLOBE_SIZE * 2,
      phi:   phiRef.current,
      theta: thetaRef.current,
      dark: 0,
      diffuse: 1.0,
      mapSamples: 18000,
      mapBrightness: 1.5,
      baseColor:   [0.92, 0.96, 0.93], // very light mint
      markerColor: [0.18, 0.48, 0.28], // forest green
      glowColor:   [0.85, 0.92, 0.86], // pale glow → fades into bg
      markers: visibleCities.map((c) => ({
        location: [c.lat, c.lng] as [number, number],
        size: 0.05,
      })),
    });

    let rafId: number;
    function frame() {
      globe.update({ phi: phiRef.current, theta: thetaRef.current });
      setOverlays(
        visibleCities.map((c) => ({
          id: c.id,
          ...projectGlobe(c.lat, c.lng, phiRef.current, thetaRef.current, GLOBE_SIZE, zoomRef.current),
        }))
      );
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continentId]);

  function onPointerDown(e: React.PointerEvent) {
    isDragging.current = true;
    pointerStart.current = {
      x: e.clientX, y: e.clientY,
      phi: phiRef.current, theta: thetaRef.current,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current || !pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    const scale = GLOBE_SIZE * zoomRef.current;
    // Drag right → globe rotates west (phi increases, since phi = -lng)
    phiRef.current   = pointerStart.current.phi   - (dx / scale) * Math.PI * 2;
    thetaRef.current = Math.max(
      -THETA_LIMIT,
      Math.min(THETA_LIMIT, pointerStart.current.theta + (dy / scale) * Math.PI * 2)
    );
  }
  function onPointerUp() {
    isDragging.current = false;
    pointerStart.current = null;
  }

  function applyZoom(factor: number) {
    const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomRef.current * factor));
    zoomRef.current = next;
    setZoom(next);
  }

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      applyZoom(e.deltaY < 0 ? 1.1 : 0.9);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const canvasCssSize = GLOBE_SIZE * zoom;

  return (
    <>
      <div
        className="relative"
        style={{ width: GLOBE_SIZE, height: GLOBE_SIZE, overflow: "hidden" }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: canvasCssSize,
            height: canvasCssSize,
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
          width={GLOBE_SIZE * 2}
          height={GLOBE_SIZE * 2}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="cursor-grab active:cursor-grabbing select-none touch-none"
        />

        {overlays.map((pos) => {
          const city = visibleCities.find((c) => c.id === pos.id)!;
          const isSelected = selectedCityId === pos.id;
          return (
            <button
              key={pos.id}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -100%)",
                pointerEvents: pos.visible ? "auto" : "none",
              }}
              className={`group flex flex-col items-center gap-0.5 transition-opacity ${
                pos.visible ? "opacity-100" : "opacity-0"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectCity(pos.id);
              }}
            >
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap leading-none transition-all shadow-sm ${
                  isSelected
                    ? "text-white bg-[#1A1F1A] opacity-100"
                    : "text-[#1A1F1A] bg-white border border-[#2F7A47]/40 opacity-90 group-hover:opacity-100 group-hover:bg-[#1A1F1A] group-hover:text-white"
                }`}
              >
                {city.name}
              </span>
              <div
                className={`rounded-full transition-all duration-150 shadow ${
                  isSelected
                    ? "w-3 h-3 bg-[#2F7A47] ring-2 ring-white scale-125"
                    : "w-2.5 h-2.5 bg-[#2F7A47] ring-2 ring-white group-hover:scale-125"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
        <button
          onClick={() => applyZoom(1.2)}
          className="w-9 h-9 rounded-md bg-white border border-border text-foreground hover:bg-muted text-lg leading-none flex items-center justify-center shadow-sm"
          aria-label="Zoom in"
        >+</button>
        <button
          onClick={() => applyZoom(1 / 1.2)}
          className="w-9 h-9 rounded-md bg-white border border-border text-foreground hover:bg-muted text-lg leading-none flex items-center justify-center shadow-sm"
          aria-label="Zoom out"
        >−</button>
      </div>
    </>
  );
}
