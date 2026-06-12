import { useState } from "react";
import { events, eventCandidateMap } from "@/lib/eventiq/mockData";
import { useStore } from "@/lib/eventiq/store";
import { SlidePanel } from "../SlidePanel";
import { StatusBadge } from "../StatusBadge";
import { FileText, ExternalLink } from "lucide-react";

export function Events() {
  const { candidates, setView, setEventFilter } = useStore();
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const openEvent = events.find((e) => e.id === openEventId) || null;
  const openCandidates = openEvent ? eventCandidateMap[openEvent.id].map((id) => candidates.find((c) => c.id === id)!).filter(Boolean) : [];

  return (
    <div className="p-10 max-w-[1400px]">
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground mt-2">5 events sponsored · Q4 2024 – Q2 2025</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Event</th>
              <th className="text-left font-medium px-4 py-2.5">Date</th>
              <th className="text-left font-medium px-4 py-2.5">Location</th>
              <th className="text-right font-medium px-4 py-2.5">Attendees</th>
              <th className="text-right font-medium px-4 py-2.5">Opt-ins</th>
              <th className="text-right font-medium px-4 py-2.5">Pipeline</th>
              <th className="text-right font-medium px-4 py-2.5">Sponsorship</th>
              <th className="text-right font-medium px-4 py-2.5">Cost/Lead</th>
              <th className="text-right font-medium px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => {
              const best = e.id === "codeberlin";
              return (
                <tr key={e.id} className={`border-t border-border hover:bg-secondary/30 transition-colors ${best ? "bg-cyan/[0.03]" : ""}`}>
                  <td className="px-4 py-3 font-medium relative">
                    {best && <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded bg-cyan" />}
                    {e.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.shortDate}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.location}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.attendees}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.optIns}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.pipeline}</td>
                  <td className="px-4 py-3 text-right tabular-nums">€{e.sponsorship.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${best ? "text-cyan font-medium" : ""}`}>€{e.costPerLead}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => setOpenEventId(e.id)}
                        className="px-2.5 py-1 text-xs rounded-md border border-border hover:bg-secondary transition-colors"
                      >
                        View
                      </button>
                      <button className="px-2.5 py-1 text-xs rounded-md border border-border hover:bg-secondary transition-colors inline-flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Report
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SlidePanel open={!!openEvent} onClose={() => setOpenEventId(null)} width={500}>
        {openEvent && (
          <div className="p-6">
            <div className="h-24 -mx-6 -mt-6 mb-6 bg-gradient-to-br from-primary/30 via-card to-cyan/20 border-b border-border" />
            <div className="text-xs text-muted-foreground">{openEvent.date} · {openEvent.location}</div>
            <h2 className="text-xl font-semibold mt-1">{openEvent.name}</h2>
            <div className="grid grid-cols-4 gap-2 mt-5">
              {[
                { l: "Attendees", v: openEvent.attendees },
                { l: "Opt-ins", v: openEvent.optIns },
                { l: "Pipeline", v: openEvent.pipeline },
                { l: "Spent", v: `€${(openEvent.sponsorship / 1000).toFixed(1)}k` },
              ].map((s) => (
                <div key={s.l} className="bg-secondary/40 border border-border rounded-md p-2.5">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.l}</div>
                  <div className="text-base font-semibold tabular-nums mt-0.5">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Candidates from this event</div>
              <div className="space-y-1.5">
                {openCandidates.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-md border border-border bg-secondary/20">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-[11px] font-semibold">
                      {c.name.split(" ").map((s) => s[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="flex gap-1 mt-0.5">
                        {c.skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded border border-primary/30 text-primary">{s}</span>
                        ))}
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setEventFilter(openEvent.id);
                  setOpenEventId(null);
                  setView("candidates");
                }}
                className="flex-1 px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                View all candidates <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button className="px-3 py-2 text-sm rounded-md border border-border hover:bg-secondary transition-colors inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Generate Report
              </button>
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
