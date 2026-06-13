import { useMemo, useState } from "react";
import { events, openRoles, type Status, type Candidate } from "@/lib/eventiq/mockData";
import { useStore } from "@/lib/eventiq/store";
import { StatusBadge } from "../StatusBadge";
import { SlidePanel } from "../SlidePanel";
import { Search, Mail, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { matchScore } from "@/lib/utils";

const statuses: Status[] = ["Interested", "In Review", "Interviewed", "Offer Extended", "Rejected"];

export function Candidates() {
  const { candidates, setStatus, eventFilter, setEventFilter } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [emailFor, setEmailFor] = useState<Candidate | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const open = candidates.find((c) => c.id === openId) || null;
  const openEvent = open ? events.find((e) => e.id === open.eventId) : null;

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (eventFilter !== "all" && c.eventId !== eventFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = (c.name + " " + c.skills.join(" ") + " " + c.university).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [candidates, eventFilter, statusFilter, query]);

  return (
    <div className="p-10 max-w-[1400px]">
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tight">Candidates</h1>
        <p className="text-sm text-muted-foreground mt-2">247 total · 34 in active pipeline</p>
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="bg-card border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">All Events</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-card border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or skill"
            className="w-full bg-card border border-border rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-primary placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((c) => {
          const ev = events.find((e) => e.id === c.eventId);
          return (
            <div key={c.id} className="bg-card border border-border rounded-lg p-3.5 flex items-center gap-4 hover:bg-card/70 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-xs font-semibold shrink-0">
                {c.name.split(" ").map((s) => s[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <div className="font-semibold text-sm">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.university}</div>
                </div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {c.skills.map((s) => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 rounded border border-primary/30 text-primary">{s}</span>
                  ))}
                </div>
                <div className="text-xs italic text-muted-foreground mt-1 truncate">{c.projectTitle}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {(() => {
                  const best = matchScore(c, openRoles)[0];
                  return best && best.score >= 40 ? (
                    <div className="flex items-center gap-1.5 bg-[#DCEFE2] border border-[#B8E0C2] rounded px-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2F7A47] shrink-0" />
                      <span className="text-[11px] font-semibold text-[#1F4A2E] tabular-nums">{best.score}%</span>
                      <span className="text-[10px] text-[#2F7A47]">{best.roleTitle}</span>
                    </div>
                  ) : null;
                })()}
                <StatusBadge status={c.status} />
                <div className="text-[10px] text-muted-foreground">{ev?.name}</div>
                <button
                  onClick={() => setOpenId(c.id)}
                  className="px-2.5 py-1 text-xs rounded-md border border-border hover:bg-secondary transition-colors"
                >
                  View Profile
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">No candidates match these filters.</div>
        )}
      </div>

      <SlidePanel open={!!open} onClose={() => setOpenId(null)} width={520}>
        {open && openEvent && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4 mt-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-sm font-semibold">
                {open.name.split(" ").map((s) => s[0]).join("")}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{open.name}</h2>
                <div className="text-xs text-muted-foreground">{open.university} · {openEvent.name}</div>
              </div>
            </div>

            <div className="flex gap-1 flex-wrap mb-5">
              {open.skills.map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded border border-primary/30 text-primary">{s}</span>
              ))}
            </div>

            <div className="mb-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Role Match</div>
              <div className="space-y-1.5">
                {matchScore(open, openRoles).map((m, i) => (
                  <div
                    key={m.roleId}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-md border ${
                      i === 0
                        ? "bg-[#DCEFE2] border-[#B8E0C2]"
                        : "bg-secondary/40 border-border"
                    }`}
                  >
                    <span className={`text-xs ${i === 0 ? "font-medium text-[#1F4A2E]" : "text-muted-foreground"}`}>
                      {m.roleTitle}
                    </span>
                    <span className={`text-sm font-semibold tabular-nums ${i === 0 ? "text-[#2F7A47]" : "text-muted-foreground"}`}>
                      {m.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Project</div>
              <div className="text-sm font-medium">{open.projectTitle}</div>
              <p className="text-sm text-muted-foreground mt-1">{open.projectDescription}</p>
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block">Status</label>
              <select
                value={open.status}
                onChange={(e) => setStatus(open.id, e.target.value as Status)}
                className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block">Recruiter Notes</label>
              <textarea
                value={notes[open.id] || ""}
                onChange={(e) => setNotes((n) => ({ ...n, [open.id]: e.target.value }))}
                placeholder="Add recruiter notes..."
                rows={3}
                className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setEmailFor(open)}
                className="flex-1 px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" /> Send Follow-up Email
              </button>
              <button
                onClick={() => toast.info("ATS integration coming soon")}
                className="px-3 py-2 text-sm rounded-md border border-border hover:bg-secondary transition-colors inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add to ATS
              </button>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Activity</div>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2 text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5" />
                  Opted in at {openEvent.name} · {openEvent.date}
                </div>
                <div className="flex gap-2 text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5" />
                  Current status: {open.status}
                </div>
              </div>
            </div>
          </div>
        )}
      </SlidePanel>

      {/* Email Modal */}
      {emailFor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div onClick={() => setEmailFor(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-lg w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-semibold mb-4">Send Follow-up Email</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">To</label>
                <input readOnly value={`${emailFor.name.toLowerCase().replace(/[^a-z]/g, "")}@${emailFor.university.toLowerCase().replace(/[^a-z]/g, "")}.edu`} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Subject</label>
                <input
                  readOnly
                  value={`Following up from ${events.find((e) => e.id === emailFor.eventId)?.name} — Syntara Engineering`}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Body</label>
                <textarea
                  readOnly
                  rows={6}
                  value={`Hi ${emailFor.name.split(" ")[0]},\n\nIt was great to see your work on "${emailFor.projectTitle}" at ${events.find((e) => e.id === emailFor.eventId)?.name}. We'd love to learn more about your background and tell you about what we're building at Syntara.\n\nWould you be open to a 30-minute call this week?\n\nBest,\nSyntara Engineering`}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm mt-1 resize-none"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEmailFor(null)} className="px-3 py-2 text-sm rounded-md border border-border hover:bg-secondary transition-colors">Cancel</button>
              <button
                onClick={() => {
                  const name = emailFor.name;
                  toast.success(`Follow-up sent to ${name}`);
                  setEmailFor(null);
                }}
                className="px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
