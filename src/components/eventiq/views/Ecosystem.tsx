import { useEffect, useRef, useState } from "react";
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

const DEFAULT_PHI = 0;
const DEFAULT_THETA = 0.3;
const DEFAULT_ZOOM = 1;

const typeBadgeStyles: Record<StudentCommunity["type"], string> = {
  "AI/ML":            "bg-[#DCEFE2] text-[#1F4A2E]",
  "Robotics":         "bg-[#E2E8F0] text-[#334155]",
  "Entrepreneurship": "bg-[#F5E7CC] text-[#7A5712]",
  "Cloud/DevOps":     "bg-[#E8F0F5] text-[#1A4A6E]",
  "Data":             "bg-[#F0E8F5] text-[#4A1A6E]",
  "Open Source":      "bg-[#F5F0E8] text-[#6E4A1A]",
  "Community":        "bg-secondary text-muted-foreground",
};

// cobe convention: the front-center longitude equals phi (in radians).
// Rotate world point by -phi about Y axis: effective_lng = lng - phi.
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
  const x1 = x0 * cP - z0 * sP;
  const z1 = x0 * sP + z0 * cP;
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

type OverlayPos = { id: string; x: number; y: number; visible: boolean };

export function Ecosystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef    = useRef(DEFAULT_PHI);
  const thetaRef  = useRef(DEFAULT_THETA);
  const zoomRef   = useRef(DEFAULT_ZOOM);

  const targetRef = useRef<{ phi: number; theta: number; zoom: number } | null>(null);
  const autoRotateRef = useRef(true);

  const isDragging   = useRef(false);
  const pointerStart = useRef<{ x: number; y: number; phi: number; theta: number } | null>(null);

  const [continentOverlays, setContinentOverlays] = useState<OverlayPos[]>([]);
  const [cityOverlays, setCityOverlays]           = useState<OverlayPos[]>([]);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [selectedContinentId, setSelectedContinentId] = useState<ContinentId | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  const inContinentMode = selectedContinentId !== null;

  // Aggregate counts
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

  // Animate on selection change
  useEffect(() => {
    if (selectedContinentId === null) {
      targetRef.current = { phi: DEFAULT_PHI, theta: DEFAULT_THETA, zoom: DEFAULT_ZOOM };
      autoRotateRef.current = false;
    } else {
      const c = continents.find((x) => x.id === selectedContinentId)!;
      targetRef.current = {
        phi:   (c.lng * Math.PI) / 180,
        theta: (c.lat * Math.PI) / 180,
        zoom:  c.zoom,
      };
      autoRotateRef.current = false;
    }
  }, [selectedContinentId]);

  // Setup globe once. Markers update via dependency on visibleCities via re-creation isn't ideal,
  // but cobe's markers prop is fixed at init — we just include ALL city markers (small) and ALL continent markers (large).
  useEffect(() => {
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
      baseColor:   [0.92, 0.96, 0.93],
      markerColor: [0.18, 0.48, 0.28],
      glowColor:   [0.85, 0.92, 0.86],
      markers: [
        ...continents.map((c) => ({ location: [c.lat, c.lng] as [number, number], size: 0.08 })),
        ...cityMarkers.map((c) => ({ location: [c.lat, c.lng] as [number, number], size: 0.04 })),
      ],
    });

    let rafId: number;
    function frame() {
      if (targetRef.current) {
        const t = targetRef.current;
        const k = 0.08;
        phiRef.current   += (t.phi   - phiRef.current)   * k;
        thetaRef.current += (t.theta - thetaRef.current) * k;
        zoomRef.current  += (t.zoom  - zoomRef.current)  * k;
        if (
          Math.abs(t.phi   - phiRef.current)   < 0.001 &&
          Math.abs(t.theta - thetaRef.current) < 0.001 &&
          Math.abs(t.zoom  - zoomRef.current)  < 0.005
        ) {
          phiRef.current   = t.phi;
          thetaRef.current = t.theta;
          zoomRef.current  = t.zoom;
          targetRef.current = null;
        }
        setZoom(zoomRef.current);
      } else if (autoRotateRef.current && !isDragging.current) {
        phiRef.current += 0.0015;
      }

      globe.update({ phi: phiRef.current, theta: thetaRef.current });

      setContinentOverlays(
        continents.map((c) => ({
          id: c.id,
          ...projectGlobe(c.lat, c.lng, phiRef.current, thetaRef.current, GLOBE_SIZE, zoomRef.current),
        }))
      );
      setCityOverlays(
        cityMarkers.map((c) => ({
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
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    isDragging.current = true;
    targetRef.current = null;
    autoRotateRef.current = false;
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
    phiRef.current   = pointerStart.current.phi   - (dx / scale) * Math.PI * 2;
    thetaRef.current = Math.max(
      -THETA_LIMIT,
      Math.min(THETA_LIMIT, pointerStart.current.theta + (dy / scale) * Math.PI * 2)
    );
  }
  function onPointerUp() {
    isDragging.current = false;
    pointerStart.current = null;
    // Resume auto-rotate only in world mode
    if (selectedContinentId === null) autoRotateRef.current = true;
  }

  function applyZoom(factor: number) {
    targetRef.current = null;
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

  function resetView() {
    setSelectedCityId(null);
    setSelectedContinentId(null);
  }

  const canvasCssSize = GLOBE_SIZE * zoom;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="px-8 py-5 border-b border-border shrink-0">
        <h1 className="font-display text-3xl tracking-tight">Talent Ecosystem</h1>
        <p className="text-xs text-muted-foreground mt-1">
          University talent pools and student communities in your recruiting network.
        </p>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Globe */}
        <div className="flex-1 flex items-center justify-center bg-background relative overflow-hidden">
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

            {/* World mode: continent overlays */}
            {!inContinentMode && continentOverlays.map((pos) => {
              const c = continents.find((x) => x.id === pos.id)!;
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
                  className={`group flex flex-col items-center gap-1 transition-opacity ${
                    pos.visible ? "opacity-100" : "opacity-0"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedContinentId(c.id);
                  }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded whitespace-nowrap leading-none bg-white border border-[#2F7A47]/40 text-[#1A1F1A] shadow-sm group-hover:bg-[#1A1F1A] group-hover:text-white transition-colors">
                    {c.name}
                    <span className="ml-1 font-normal opacity-70 normal-case tracking-normal">
                      · {continentCandidateCount[c.id]}
                    </span>
                  </span>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#2F7A47] ring-2 ring-white shadow group-hover:scale-125 transition-transform" />
                </button>
              );
            })}

            {/* Continent mode: city overlays */}
            {inContinentMode && cityOverlays
              .filter((pos) => visibleCities.some((c) => c.id === pos.id))
              .map((pos) => {
                const city = cityMarkers.find((c) => c.id === pos.id)!;
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
                      setSelectedCityId(isSelected ? null : pos.id);
                    }}
                  >
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap leading-none transition-all shadow-sm ${
                        isSelected
                          ? "text-white bg-[#1A1F1A]"
                          : "text-[#1A1F1A] bg-white border border-[#2F7A47]/40 group-hover:bg-[#1A1F1A] group-hover:text-white"
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

          {/* Zoom controls */}
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
            <button
              onClick={resetView}
              className="w-9 h-9 rounded-md bg-white border border-border text-foreground hover:bg-muted text-[12px] leading-none flex items-center justify-center shadow-sm"
              aria-label="Reset view"
            >⟳</button>
          </div>

          <div className="absolute bottom-4 left-4 text-[10px] text-muted-foreground">
            {inContinentMode
              ? "Drag to rotate · Scroll to zoom · Click a city marker"
              : "Click a continent to explore its cities · Drag to spin"}
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
