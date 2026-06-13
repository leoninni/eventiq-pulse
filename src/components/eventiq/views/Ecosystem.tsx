import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import {
  universityProfiles,
  studentCommunities,
  cityMarkers,
  type StudentCommunity,
} from "@/lib/eventiq/mockData";

const GLOBE_SIZE = 580;
const ZOOM_MIN = 0.6;
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

function projectToScreen(
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

  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const x1 =  x0 * cosPhi + z0 * sinPhi;
  const y1 =  y0;
  const z1 = -x0 * sinPhi + z0 * cosPhi;

  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const x2 =  x1;
  const y2 =  y1 * cosTheta - z1 * sinTheta;
  const z2 =  y1 * sinTheta + z1 * cosTheta;

  const radius = size * 0.42 * zoom;
  return {
    x: size / 2 + x2 * radius,
    y: size / 2 - y2 * radius,
    visible: z2 > 0.05,
  };
}

type OverlayPos = { id: string; x: number; y: number; visible: boolean };

export function Ecosystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef    = useRef(0.25);
  const thetaRef  = useRef(0.25);
  const zoomRef   = useRef(1);
  const isDragging   = useRef(false);
  const pointerStart = useRef<{ x: number; y: number; phi: number; theta: number } | null>(null);
  const [overlayPositions, setOverlayPositions] = useState<OverlayPos[]>([]);
  const [zoom, setZoom] = useState(1);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

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
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor:   [0.93, 0.96, 0.93],
      markerColor: [0.18, 0.47, 0.28],
      glowColor:   [0.93, 0.96, 0.93],
      markers: cityMarkers.map((c) => ({
        location: [c.lat, c.lng] as [number, number],
        size: 0.04,
      })),
    });

    let rafId: number;
    function frame() {
      globe.update({ phi: phiRef.current, theta: thetaRef.current });
      setOverlayPositions(
        cityMarkers.map((c) => ({
          id: c.id,
          ...projectToScreen(c.lat, c.lng, phiRef.current, thetaRef.current, GLOBE_SIZE, zoomRef.current),
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
    phiRef.current = pointerStart.current.phi + (dx / scale) * Math.PI * 2;
    thetaRef.current = Math.max(
      -THETA_LIMIT,
      Math.min(THETA_LIMIT, pointerStart.current.theta - (dy / scale) * Math.PI * 2)
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

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    applyZoom(e.deltaY < 0 ? 1.1 : 0.9);
  }

  // Non-passive wheel listener so preventDefault works in Chrome
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

  const selectedCity      = selectedCityId ? cityMarkers.find((c) => c.id === selectedCityId) : null;
  const cityUniversities  = selectedCityId ? universityProfiles.filter((u) => u.city === selectedCityId) : [];
  const cityCommunities   = selectedCityId ? studentCommunities.filter((c) => c.city === selectedCityId) : [];
  const cityTotalCandidates = cityUniversities.reduce((s, u) => s + u.candidates, 0);
  const totalCandidates     = universityProfiles.reduce((s, u) => s + u.candidates, 0);

  const canvasCssSize = GLOBE_SIZE * zoom;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-border shrink-0">
        <h1 className="font-display text-3xl tracking-tight">Talent Ecosystem</h1>
        <p className="text-xs text-muted-foreground mt-1">
          University talent pools and student communities in your recruiting network.
        </p>
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1 min-h-0">

        {/* Left: Globe */}
        <div className="flex-1 flex items-center justify-center bg-background relative overflow-hidden">
          <div
            className="relative"
            style={{ width: GLOBE_SIZE, height: GLOBE_SIZE, overflow: "hidden" }}
            onWheel={onWheel}
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
            {overlayPositions.map((pos) => {
              const city = cityMarkers.find((c) => c.id === pos.id)!;
              const isSelected = selectedCityId === pos.id;
              return (
                <button
                  key={pos.id}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    transform: "translate(-50%, -50%)",
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
                  <div
                    className={`rounded-full transition-all duration-150 ${
                      isSelected
                        ? "w-3 h-3 bg-[#1A1F1A] ring-2 ring-[#2F7A47] ring-offset-1 ring-offset-background scale-150"
                        : "w-2.5 h-2.5 bg-[#2F7A47] group-hover:bg-[#1F4A2E] group-hover:scale-125"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-medium px-1 py-0.5 rounded whitespace-nowrap leading-none transition-opacity border ${
                      isSelected
                        ? "text-[#1A1F1A] bg-white/90 border-border opacity-100"
                        : "text-[#1A1F1A] opacity-0 group-hover:opacity-100 bg-white/80 border-border"
                    }`}
                  >
                    {city.name}
                  </span>
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
            >
              +
            </button>
            <button
              onClick={() => applyZoom(1 / 1.2)}
              className="w-9 h-9 rounded-md bg-white border border-border text-foreground hover:bg-muted text-lg leading-none flex items-center justify-center shadow-sm"
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              onClick={() => {
                phiRef.current = 0.25;
                thetaRef.current = 0.25;
                zoomRef.current = 1;
                setZoom(1);
              }}
              className="w-9 h-9 rounded-md bg-white border border-border text-foreground hover:bg-muted text-[12px] leading-none flex items-center justify-center shadow-sm"
              aria-label="Reset view"
            >
              ⟳
            </button>
          </div>

          <div className="absolute bottom-4 left-4 text-[10px] text-muted-foreground">
            Drag to rotate · Scroll to zoom · Click a city
          </div>
        </div>

        {/* Right: Detail panel */}
        <div className="w-[400px] shrink-0 border-l border-border overflow-y-auto">
          {!selectedCity ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 p-8">
              <div className="text-5xl mb-2">🌍</div>
              <div className="text-sm font-semibold">Click a city on the globe</div>
              <div className="text-xs text-muted-foreground">
                Drag to rotate · Scroll to zoom · Click a city
              </div>
              <div className="mt-6 flex gap-6">
                {[
                  { value: totalCandidates, label: "candidates" },
                  { value: universityProfiles.length, label: "universities" },
                  { value: studentCommunities.length, label: "communities" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-bold tabular-nums">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold">{selectedCity.name}</h2>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {cityTotalCandidates} candidates ·{" "}
                    {cityUniversities.length}{" "}
                    {cityUniversities.length === 1 ? "university" : "universities"}
                    {cityCommunities.length > 0 &&
                      ` · ${cityCommunities.length} ${
                        cityCommunities.length === 1 ? "community" : "communities"
                      }`}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCityId(null)}
                  className="text-muted-foreground hover:text-foreground text-xl leading-none mt-0.5 px-1"
                >
                  ×
                </button>
              </div>

              {/* Universities */}
              <div className="mb-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Universities
                </div>
                <div className="space-y-2">
                  {cityUniversities.map((u) => (
                    <div key={u.id} className="bg-card border border-border rounded-lg p-3">
                      <div className="flex items-baseline justify-between mb-1">
                        <div className="text-sm font-semibold">{u.shortName}</div>
                        <div className="text-[10px] text-muted-foreground">{u.name}</div>
                      </div>
                      <div className="text-xl font-bold tabular-nums">{u.candidates.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground mb-2">candidates</div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {u.topSkills.map((s) => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded border border-primary/30 text-primary">
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
              </div>

              {/* Communities */}
              {cityCommunities.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Communities
                  </div>
                  <div className="space-y-2">
                    {cityCommunities.map((c) => (
                      <div key={c.id} className="bg-card border border-border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div className="text-sm font-semibold leading-tight">{c.name}</div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${typeBadgeStyles[c.type]}`}>
                            {c.type}
                          </span>
                        </div>
                        <div className="text-lg font-bold tabular-nums">{c.members.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mb-2">members</div>
                        <div className="flex flex-wrap gap-1">
                          {c.topSkills.map((s) => (
                            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded border border-primary/30 text-primary">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cityCommunities.length === 0 && (
                <div className="text-xs text-muted-foreground italic">
                  No communities tracked in this city yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
