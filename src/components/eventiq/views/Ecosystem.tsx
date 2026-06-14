import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import {
  universityProfiles,
  studentCommunities,
  cityMarkers,
  continents,
  events,
  clubPartnerships,
  type StudentCommunity,
  type ContinentId,
} from "@/lib/eventiq/mockData";
import { useStore } from "@/lib/eventiq/store";

const GLOBE_SIZE = 560;
const ZOOM_MIN = 0.8;
const ZOOM_MAX = 4;
const THETA_LIMIT = Math.PI / 2 - 0.05;

// phi = -π/2 - lng*π/180 centers that longitude at the globe front.
// Default centers on ~10°E so DACH cities are visible on load.
const DEFAULT_PHI = -Math.PI / 2 - (10 * Math.PI) / 180;
const DEFAULT_THETA = 0.35;
const DEFAULT_ZOOM = 1;

const typeBadgeStyles: Record<StudentCommunity["type"], string> = {
  "AI/ML": "bg-[#DCEFE2] text-[#1F4A2E]",
  Robotics: "bg-[#E2E8F0] text-[#334155]",
  Entrepreneurship: "bg-[#F5E7CC] text-[#7A5712]",
  "Cloud/DevOps": "bg-[#E8F0F5] text-[#1A4A6E]",
  Data: "bg-[#F0E8F5] text-[#4A1A6E]",
  "Open Source": "bg-[#F5F0E8] text-[#6E4A1A]",
  Community: "bg-secondary text-muted-foreground",
};

// Thresholds adjusted from spec (≤600/≤1000) to fit actual data range (€1600–€4000/hire).
// HackTUM/START Hack → green, CODE Berlin/ETH → amber, KIT → gray.
function eventRoiColor(e: (typeof events)[0]): string {
  const cph = Math.round(e.sponsorship / e.hires);
  if (cph < 1700) return "#2F7A47"; // green — top performer
  if (cph <= 2500) return "#D97706"; // amber — mid
  return "#9CA3AF"; // gray — lower
}

// Projects a geographic point onto the globe canvas using cobe's exact
// coordinate system (derived from cobe's U() and O() functions).
function projectGlobe(
  lat: number,
  lng: number,
  phi: number,
  theta: number,
  size: number,
  zoom: number,
): { x: number; y: number; visible: boolean } {
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;

  // cobe's U([lat, lng]) coordinate system
  const x0 = Math.cos(latR) * Math.cos(lngR);
  const y0 = Math.sin(latR);
  const z0 = -Math.cos(latR) * Math.sin(lngR);

  const cP = Math.cos(phi),
    sP = Math.sin(phi);
  const cT = Math.cos(theta),
    sT = Math.sin(theta);

  // cobe's O([x, y, z]) projection
  const c = cP * x0 + sP * z0;
  const s = sP * sT * x0 + cT * y0 - cP * sT * z0;
  const dep = -sP * cT * x0 + sT * y0 + cP * cT * z0;

  const half = size / 2;
  return {
    x: half + c * half * zoom,
    y: half - s * half * zoom,
    visible: dep > 0.05,
  };
}

type OverlayPos = { id: string; x: number; y: number; visible: boolean };

export function Ecosystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(DEFAULT_PHI);
  const thetaRef = useRef(DEFAULT_THETA);
  const zoomRef = useRef(DEFAULT_ZOOM);

  const targetRef = useRef<{ phi: number; theta: number; zoom: number } | null>(null);
  const autoRotateRef = useRef(true);

  const isDragging = useRef(false);
  const pointerStart = useRef<{ x: number; y: number; phi: number; theta: number } | null>(null);

  const [continentOverlays, setContinentOverlays] = useState<OverlayPos[]>([]);
  const [cityOverlays, setCityOverlays] = useState<OverlayPos[]>([]);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [selectedContinentId, setSelectedContinentId] = useState<ContinentId | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  const { setView, setEventFilter, candidates } = useStore();

  const inContinentMode = selectedContinentId !== null;

  // Aggregate counts
  const continentCityCount: Record<ContinentId, number> = {
    europe: 0,
    "north-america": 0,
    asia: 0,
  };
  const continentCandidateCount: Record<ContinentId, number> = {
    europe: 0,
    "north-america": 0,
    asia: 0,
  };
  cityMarkers.forEach((c) => {
    continentCityCount[c.continent]++;
  });
  universityProfiles.forEach((u) => {
    continentCandidateCount[u.continent] += u.candidates;
  });

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

  // Helper: city marker dot size in px
  function cityDotSize(cityId: string): number {
    const count = cityCandidateCount[cityId] ?? 0;
    return 6 + Math.sqrt(count / maxCandidates) * 8;
  }

  const visibleCities = inContinentMode
    ? cityMarkers.filter((c) => c.continent === selectedContinentId)
    : [];

  const selectedCity = selectedCityId ? cityMarkers.find((c) => c.id === selectedCityId) : null;
  const cityUniversities = selectedCityId
    ? universityProfiles.filter((u) => u.city === selectedCityId)
    : [];
  const cityCommunities = selectedCityId
    ? studentCommunities.filter((c) => c.city === selectedCityId)
    : [];
  const cityTotalCandidates = cityUniversities.reduce((s, u) => s + u.candidates, 0);

  const selectedContinent = selectedContinentId
    ? continents.find((c) => c.id === selectedContinentId)!
    : null;

  // Animate on selection change
  useEffect(() => {
    if (selectedContinentId === null) {
      targetRef.current = { phi: DEFAULT_PHI, theta: DEFAULT_THETA, zoom: DEFAULT_ZOOM };
      autoRotateRef.current = true;
    } else {
      const c = continents.find((x) => x.id === selectedContinentId)!;
      targetRef.current = {
        phi: -Math.PI / 2 - (c.lng * Math.PI) / 180,
        theta: (c.lat / 90) * (Math.PI / 2 - 0.1),
        zoom: c.zoom,
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
      width: GLOBE_SIZE * 2,
      height: GLOBE_SIZE * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: 0,
      diffuse: 1.0,
      mapSamples: 18000,
      mapBrightness: 1.5,
      baseColor: [0.92, 0.96, 0.93],
      markerColor: [0.18, 0.48, 0.28],
      glowColor: [0.85, 0.92, 0.86],
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
        phiRef.current += (t.phi - phiRef.current) * k;
        thetaRef.current += (t.theta - thetaRef.current) * k;
        zoomRef.current += (t.zoom - zoomRef.current) * k;
        if (
          Math.abs(t.phi - phiRef.current) < 0.001 &&
          Math.abs(t.theta - thetaRef.current) < 0.001 &&
          Math.abs(t.zoom - zoomRef.current) < 0.005
        ) {
          phiRef.current = t.phi;
          thetaRef.current = t.theta;
          zoomRef.current = t.zoom;
          targetRef.current = null;
        }
        setZoom(zoomRef.current);
      } else if (autoRotateRef.current && !isDragging.current) {
        phiRef.current += 0.0008;
      }

      globe.update({ phi: phiRef.current, theta: thetaRef.current, scale: zoomRef.current });

      setContinentOverlays(
        continents.map((c) => ({
          id: c.id,
          ...projectGlobe(
            c.lat,
            c.lng,
            phiRef.current,
            thetaRef.current,
            GLOBE_SIZE,
            zoomRef.current,
          ),
        })),
      );
      setCityOverlays(
        cityMarkers.map((c) => ({
          id: c.id,
          ...projectGlobe(
            c.lat,
            c.lng,
            phiRef.current,
            thetaRef.current,
            GLOBE_SIZE,
            zoomRef.current,
          ),
        })),
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
      x: e.clientX,
      y: e.clientY,
      phi: phiRef.current,
      theta: thetaRef.current,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current || !pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    const scale = GLOBE_SIZE * zoomRef.current;
    phiRef.current = pointerStart.current.phi - (dx / scale) * Math.PI * 2;
    thetaRef.current = Math.max(
      -THETA_LIMIT,
      Math.min(THETA_LIMIT, pointerStart.current.theta + (dy / scale) * Math.PI * 2),
    );
  }
  function onPointerUp() {
    isDragging.current = false;
    pointerStart.current = null;
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
    <div className="flex flex-col md:h-screen md:overflow-hidden">
      <div className="px-4 py-4 md:px-8 md:py-5 border-b border-border shrink-0">
        <h1 className="font-display text-3xl tracking-tight">Talent Ecosystem</h1>
        <p className="text-xs text-muted-foreground mt-1">
          University talent pools and student communities in your recruiting network.
        </p>
      </div>

      <div className="flex flex-col md:flex-row flex-1 md:min-h-0">
        {/* Globe */}
        <div className="flex-1 h-[320px] md:h-auto flex items-center justify-center bg-background relative overflow-hidden">
          <div className="relative" style={{ width: GLOBE_SIZE, height: GLOBE_SIZE }}>
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
            {!inContinentMode &&
              continentOverlays.map((pos) => {
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

            {/* City circles — visible in both views, clickable only in continent mode */}
            {cityOverlays
              .filter((pos) =>
                inContinentMode ? visibleCities.some((c) => c.id === pos.id) : true,
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
                    cityEvts.length === 1
                      ? cityEvts[0].name
                      : cityEvts.length > 1
                        ? `${cityEvts.length} events`
                        : null,
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
                        style={{
                          position: "absolute",
                          bottom: "calc(100% + 6px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 30,
                        }}
                        className="bg-white border border-border rounded-md px-2 py-1 shadow-md pointer-events-none whitespace-nowrap"
                      >
                        {tooltipLines.map((line, i) => (
                          <div
                            key={i}
                            className={
                              i === 0
                                ? "text-[11px] font-semibold text-foreground"
                                : "text-[10px] text-muted-foreground"
                            }
                          >
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
            {inContinentMode &&
              events
                .filter((ev) => visibleCities.some((c) => c.id === ev.cityId))
                .map((ev) => {
                  const cityPos = cityOverlays.find((p) => p.id === ev.cityId);
                  if (!cityPos || !cityPos.visible) return null;
                  const isHovered = hoveredMarkerId === `event-${ev.id}`;
                  const color = eventRoiColor(ev);
                  const evCandidates = candidates.filter((c) => c.eventId === ev.id);
                  return (
                    <div
                      key={ev.id}
                      style={{
                        position: "absolute",
                        left: cityPos.x,
                        top: cityPos.y - 12,
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "auto",
                        zIndex: 15,
                        padding: 5,
                      }}
                      onMouseEnter={() => setHoveredMarkerId(`event-${ev.id}`)}
                      onMouseLeave={() => setHoveredMarkerId(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCityId(ev.cityId);
                        setTimeout(
                          () =>
                            eventsRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            }),
                          50,
                        );
                      }}
                    >
                      {/* Tooltip */}
                      {isHovered && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "calc(100% + 6px)",
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 30,
                          }}
                          className="bg-white border border-border rounded-md px-2 py-1 shadow-md pointer-events-none whitespace-nowrap"
                        >
                          <div className="text-[11px] font-semibold text-foreground">{ev.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {ev.hires} {ev.hires === 1 ? "hire" : "hires"} · €
                            {Math.round(ev.sponsorship / ev.hires).toLocaleString()}/hire
                            {evCandidates.length > 0 ? ` · ${evCandidates.length} in pipeline` : ""}
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
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4">
            <button
              onClick={resetView}
              className="w-9 h-9 rounded-md bg-white border border-border text-foreground hover:bg-muted text-[16px] leading-none flex items-center justify-center shadow-sm"
              aria-label="Reset view"
            >
              ⟳
            </button>
          </div>

          <div className="absolute bottom-4 left-4 text-[10px] text-muted-foreground">
            {inContinentMode
              ? "Click a city or event marker · Drag to rotate · Scroll to zoom"
              : "Drag to spin · Click a continent to explore"}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full md:w-[400px] md:shrink-0 border-t md:border-t-0 md:border-l border-border overflow-y-auto bg-card">
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
                        {continentCityCount[c.id]}{" "}
                        {continentCityCount[c.id] === 1 ? "city" : "cities"}
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
              >
                ← Back to world
              </button>
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
              {/* Breadcrumb */}
              <button
                onClick={() => setSelectedCityId(null)}
                className="text-xs text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1"
              >
                ← {selectedContinent!.name}
              </button>

              {/* City header */}
              <div className="mb-5">
                <h2 className="text-xl font-bold">{selectedCity.name}</h2>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {[
                    cityTotalCandidates > 0 ? `${cityTotalCandidates} candidates` : null,
                    cityUniversities.length > 0
                      ? `${cityUniversities.length} ${cityUniversities.length === 1 ? "university" : "universities"}`
                      : null,
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
                  <div
                    ref={eventsRef}
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
                  >
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
                              <div className="text-sm font-semibold tabular-nums">
                                €{costPerHire.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground">Pipeline</span>
                              <div className="text-sm font-semibold tabular-nums">
                                {ev.pipeline}
                              </div>
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
                              View {evCandidates.length}{" "}
                              {evCandidates.length === 1 ? "candidate" : "candidates"} →
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
                          <div className="text-xs tabular-nums text-muted-foreground">
                            {u.candidates}
                          </div>
                        </div>
                        <div className="text-[11px] text-muted-foreground mb-2">{u.name}</div>
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {u.topSkills.slice(0, 3).map((s) => (
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
                          <div className="text-xs tabular-nums text-muted-foreground">
                            {c.members}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeBadgeStyles[c.type]}`}
                            >
                              {c.type}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {c.university}
                            </span>
                          </div>
                          {clubPartnerships.some((p) => p.clubId === c.id) && (
                            <button
                              onClick={() => setView("cooperations")}
                              className="text-[10px] text-primary hover:underline font-medium shrink-0"
                            >
                              Partner →
                            </button>
                          )}
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
