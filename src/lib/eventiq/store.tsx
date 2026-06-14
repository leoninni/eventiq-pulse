import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  candidates as initialCandidates,
  initialActiveCooperations,
  type Candidate,
  type Status,
  type ActiveCooperation,
} from "./mockData";

type View =
  | "overview"
  | "events"
  | "candidates"
  | "ecosystem"
  | "reports"
  | "recommendations"
  | "cooperations";

interface StoreCtx {
  view: View;
  setView: (v: View) => void;
  candidates: Candidate[];
  setStatus: (id: string, status: Status) => void;
  eventFilter: string;
  setEventFilter: (id: string) => void;
  shortlist: Set<string>;
  toggleShortlist: (id: string) => void;
  atsSync: Record<string, string>;
  syncToAts: (candidateId: string, atsName: string) => void;
  activeCooperations: ActiveCooperation[];
  addCooperation: (c: ActiveCooperation) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("overview");
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());
  const [atsSync, setAtsSync] = useState<Record<string, string>>({});
  const [activeCooperations, setActiveCooperations] =
    useState<ActiveCooperation[]>(initialActiveCooperations);

  const value = useMemo<StoreCtx>(
    () => ({
      view,
      setView,
      candidates,
      setStatus: (id, status) =>
        setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c))),
      eventFilter,
      setEventFilter,
      shortlist,
      toggleShortlist: (id) =>
        setShortlist((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
      atsSync,
      syncToAts: (id, atsName) => setAtsSync((prev) => ({ ...prev, [id]: atsName })),
      activeCooperations,
      addCooperation: (c: ActiveCooperation) => setActiveCooperations((prev) => [...prev, c]),
    }),
    [view, candidates, eventFilter, shortlist, atsSync, activeCooperations],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("StoreProvider missing");
  return v;
}

export type { View };
