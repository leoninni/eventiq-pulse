import { useState } from "react";
import { events, eventCandidateMap, statusColors, type EventItem, type Status } from "@/lib/eventiq/mockData";
import { useStore } from "@/lib/eventiq/store";
import { ArrowLeft, FileText, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const generatedDays: Record<string, number> = { hacktum: 3, starthack: 18, codeberlin: 30, ethbuild: 60, kithack: 100 };

export function Reports() {
  const { candidates } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const ev = events.find((e) => e.id === openId) || null;

  if (ev) {
    const eventCandidates = eventCandidateMap[ev.id].map((id) => candidates.find((c) => c.id === id)!).filter(Boolean);
    const statusCounts: Record<Status, number> = { "Interested": 0, "In Review": 0, "Interviewed": 0, "Offer Extended": 0, "Rejected": 0 };
    eventCandidates.forEach((c) => { statusCounts[c.status]++; });
    // For HackTUM, pad to spec numbers
    const padded = ev.id === "hacktum"
      ? [{ name: "Interested", v: 5 }, { name: "In Review", v: 1 }, { name: "Interviewed", v: 2 }, { name: "Offer Extended", v: 1 }, { name: "Rejected", v: 3 }]
      : (Object.entries(statusCounts) as [Status, number][]).map(([name, v]) => ({ name, v }));

    return (
      <div className="p-4 md:p-8 max-w-[1100px]">
        <button onClick={() => setOpenId(null)} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Reports
        </button>

        <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">{ev.name.toUpperCase()} — Sponsor ROI Report</div>
        <div className="text-sm text-muted-foreground mb-6">Syntara Engineering · Generated May 2025</div>

        <div className="border-l-2 border-primary bg-primary/5 rounded-r-md p-4 mb-8">
          <p className="text-sm">
            <span className="font-semibold">{ev.name}</span> delivered <span className="font-semibold text-foreground">{ev.optIns} opt-in candidates</span> for Syntara, of which <span className="font-semibold text-foreground">{ev.pipeline} entered active pipeline</span>. At €{ev.sponsorship.toLocaleString()} sponsorship, your cost per qualified pipeline entry was <span className="font-semibold text-cyan">€{ev.costPerLead}</span> — <span className="text-success font-semibold">24% below</span> your 5-event average.
          </p>
        </div>

        <Section title="1. Event Summary">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {[
                ["Total attendees", String(ev.attendees)],
                ["Booth interactions (est.)", "140"],
                ["Opt-in candidates", String(ev.optIns)],
                ["Opt-in rate", "63% of interactions"],
                ["Skills represented", "Python, ML, Systems, Web, DevOps"],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td className="py-2 text-muted-foreground">{k}</td>
                  <td className="py-2 text-right font-medium tabular-nums">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Section>

        <Section title="2. Pipeline Breakdown">
          <div className="h-[200px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={padded} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
                <XAxis dataKey="name" tick={{ fill: "#5C6660", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5C6660", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#F4F7F4" }} contentStyle={{ background: "#FFFFFF", border: "1px solid #E3E8E3", borderRadius: 8, fontSize: 12, color: "#1A1F1A" }} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                  {padded.map((d) => <Cell key={d.name} fill={statusColors[d.name as Status].dot} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left font-medium py-2">Name</th>
                <th className="text-left font-medium py-2">University</th>
                <th className="text-left font-medium py-2">Skills</th>
                <th className="text-left font-medium py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {eventCandidates.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 font-medium">{c.name}</td>
                  <td className="py-2 text-muted-foreground">{c.university}</td>
                  <td className="py-2 text-muted-foreground text-xs">{c.skills.join(", ")}</td>
                  <td className="py-2 text-xs">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Section>

        <Section title="3. Cost Analysis">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {[
                ["Sponsorship", `€${ev.sponsorship.toLocaleString()}`],
                ["Cost per opt-in", `€${Math.round(ev.sponsorship / ev.optIns).toLocaleString()}`],
                ["Cost per pipeline entry", `€${ev.costPerLead}`],
                ["Cost per hire", ev.hires > 0 ? `€${Math.round(ev.sponsorship / ev.hires).toLocaleString()}` : "—"],
                ["Benchmark (your 5-event avg)", "€876 per pipeline entry"],
              ].map(([k, v]) => (
                <tr key={k}><td className="py-2 text-muted-foreground">{k}</td><td className="py-2 text-right font-medium tabular-nums">{v}</td></tr>
              ))}
              <tr><td className="py-2 text-muted-foreground">Performance vs benchmark</td><td className="py-2 text-right text-success font-semibold">24% better ✓</td></tr>
            </tbody>
          </table>
        </Section>

        <Section title="4. Recruiter Notes">
          <textarea rows={4} placeholder="Add notes for internal use or to share with your team..." className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none placeholder:text-muted-foreground" />
        </Section>

        <div className="bg-card border border-border rounded-lg p-4 mt-6 text-sm">
          <span className="font-semibold">Recommendation:</span> <span className="text-muted-foreground">Based on candidate quality and cost efficiency, we recommend sponsoring HackTUM again in 2026. See AI Recommendations for the full Q3 event shortlist.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1100px]">
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-2">Auto-generated ROI reports for each sponsored event.</p>
      </div>
      <EventROIComparison evs={events} />
      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 hover:border-primary/30 transition-colors">
            <div className="w-9 h-9 rounded-md bg-primary/15 text-primary flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{e.name}</div>
              <div className="text-xs text-muted-foreground">{e.date} · Generated {generatedDays[e.id]} days ago</div>
            </div>
            <div className="grid grid-cols-2 md:flex md:gap-6 text-xs gap-3">
              <Stat label="Opt-ins" value={e.optIns} />
              <Stat label="Pipeline" value={e.pipeline} />
              <Stat label="Hires" value={e.hires} />
              <Stat label="Cost/Lead" value={`€${e.costPerLead}`} />
            </div>
            <button onClick={() => setOpenId(e.id)} className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors self-start md:self-auto">
              View Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function EventROIComparison({ evs }: { evs: EventItem[] }) {
  const withCost = evs.map((e) => ({
    ...e,
    costPerHire: e.hires > 0 ? Math.round(e.sponsorship / e.hires) : null,
  }));
  const validCosts = withCost.map((e) => e.costPerHire).filter((c): c is number => c !== null);
  const minCPH = validCosts.length > 0 ? Math.min(...validCosts) : 0;
  const maxCPH = validCosts.length > 0 ? Math.max(...validCosts) : 0;

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Event ROI Comparison
      </h2>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left font-medium text-xs text-muted-foreground px-4 py-2.5">Event</th>
              <th className="text-right font-medium text-xs text-muted-foreground px-4 py-2.5">Opt-ins</th>
              <th className="text-right font-medium text-xs text-muted-foreground px-4 py-2.5">Pipeline</th>
              <th className="text-right font-medium text-xs text-muted-foreground px-4 py-2.5">Hires</th>
              <th className="text-right font-medium text-xs text-muted-foreground px-4 py-2.5">Cost/Hire</th>
              <th className="text-left font-medium text-xs text-muted-foreground px-4 py-2.5 w-36">Performance</th>
            </tr>
          </thead>
          <tbody>
            {withCost.map((e) => {
              const isBest  = e.costPerHire !== null && e.costPerHire === minCPH && minCPH !== maxCPH;
              const isWorst = e.costPerHire !== null && e.costPerHire === maxCPH && minCPH !== maxCPH;
              const barWidth = e.costPerHire !== null && e.costPerHire > 0 ? Math.round((minCPH / e.costPerHire) * 100) : 0;
              const barColor = isBest ? "bg-[#2F7A47]" : isWorst ? "bg-[#C99A3E]" : "bg-[#6BAE82]";
              const borderColor = isBest ? "border-l-[#2F7A47]" : isWorst ? "border-l-[#C99A3E]" : "border-l-transparent";
              return (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className={`px-4 py-3 font-medium border-l-2 ${borderColor}`}>{e.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{e.optIns}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{e.pipeline}</td>
                  <td className={`px-4 py-3 text-right tabular-nums font-semibold ${isBest ? "text-[#2F7A47]" : "text-foreground"}`}>
                    {e.hires}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums font-semibold ${isBest ? "text-[#2F7A47]" : isWorst ? "text-[#C99A3E]" : "text-foreground"}`}>
                    {e.costPerHire !== null ? `€${e.costPerHire.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32 bg-secondary rounded-full h-1.5">
                      <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${barWidth}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
        <Check className="w-3.5 h-3.5 text-primary" /> {title}
      </h2>
      <div className="bg-card border border-border rounded-lg p-4">{children}</div>
    </div>
  );
}
