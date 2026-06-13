import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { candidates as initialCandidates, type Candidate, type Status } from "./mockData";

type View = "overview" | "events" | "candidates" | "ecosystem" | "reports" | "recommendations";

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
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("overview");
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());
  const [atsSync, setAtsSync] = useState<Record<string, string>>({});

  const value = useMemo<StoreCtx>(() => ({
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
  }), [view, candidates, eventFilter, shortlist, atsSync]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("StoreProvider missing");
  return v;
}

export type { View };
