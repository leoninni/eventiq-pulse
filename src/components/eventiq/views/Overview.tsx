import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUp, ArrowDown, UserCheck, FileText, Mail, Calendar, Users } from "lucide-react";
import { events, recentActivity, funnelData, type FunnelStage } from "@/lib/eventiq/mockData";

const chartData = [...events]
  .map((e) => ({ name: e.name.replace(" 2025", "").replace(" 2024", ""), candidates: e.optIns, sponsorship: e.sponsorship, cpl: Math.round(e.sponsorship / e.optIns) }))
  .sort((a, b) => b.candidates - a.candidates);

const iconMap = { "user-check": UserCheck, "file-text": FileText, mail: Mail, calendar: Calendar, users: Users };

function Kpi({ label, value, delta, deltaPositive }: { label: string; value: string; delta?: string; deltaPositive?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-[0_1px_2px_rgba(15,20,16,0.04)]">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="font-display text-4xl tabular-nums leading-none">{value}</div>
        {delta && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${deltaPositive ? "text-mint-ink" : "text-destructive"}`}>
            {deltaPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {delta}
          </div>
        )}
      </div>
    </div>
  );
}

const FUNNEL_BG = ["#E3E8E3", "#B8E0C2", "#B8E0C2", "#6BAE82", "#2F7A47", "#0F1410"];
const FUNNEL_FG = ["#1A1F1A", "#1F4A2E", "#1F4A2E", "#ffffff", "#ffffff", "#ffffff"];

function ConversionFunnel({ data }: { data: FunnelStage[] }) {
  return (
    <div className="space-y-2">
      {data.map((stage, i) => (
        <div key={stage.label} className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground w-[70px] md:w-[90px] shrink-0 text-right tabular-nums">
            {stage.label}
          </span>
          <div className="flex-1 bg-secondary rounded h-7 overflow-hidden">
            <div
              className="h-full rounded flex items-center gap-2 px-3"
              style={{ width: `${stage.widthPct}%`, background: FUNNEL_BG[i] }}
            >
              <span className="text-xs font-semibold tabular-nums" style={{ color: FUNNEL_FG[i] }}>
                {stage.value.toLocaleString()}
              </span>
              {stage.pct && (
                <span className="text-[10px] tabular-nums" style={{ color: FUNNEL_FG[i], opacity: 0.75 }}>
                  {stage.pct}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Overview() {
  const tooltipStyle = { background: "#FFFFFF", border: "1px solid #E3E8E3", borderRadius: 8, fontSize: 12, color: "#1A1F1A" };

  return (
    <div className="p-4 md:p-10 max-w-[1400px]">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-tight max-w-3xl">
          Hiring intelligence for <span className="highlight-marker">technical talent</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-3">A snapshot of every sponsored event, candidate, and follow-up across your pipeline.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi label="Candidates captured" value="247" delta="18% vs last quarter" deltaPositive />
        <Kpi label="Events sponsored" value="5" />
        <Kpi label="In active pipeline" value="35" />
        <Kpi label="Avg cost per lead" value="€312" delta="22% vs last quarter" deltaPositive />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <div className="col-span-1 md:col-span-3 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl">Candidates by event</h3>
            <span className="text-xs text-muted-foreground">Opt-ins per event</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 30, right: 20, top: 8, bottom: 8 }}>
                <XAxis type="number" tick={{ fill: "#5C6660", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#1A1F1A", fontSize: 12 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip
                  cursor={{ fill: "#F4F7F4" }}
                  contentStyle={tooltipStyle}
                  formatter={(value: number, _name, item: { payload?: { sponsorship: number; cpl: number } }) => {
                    const p = item?.payload;
                    return [`${value} candidates · €${p?.sponsorship.toLocaleString()} spent · €${p?.cpl}/lead`, ""];
                  }}
                />
                <Bar dataKey="candidates" fill="#2F7A47" radius={[0, 6, 6, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl">Hiring funnel</h3>
            <span className="text-xs text-muted-foreground">All events · 2025</span>
          </div>
          <ConversionFunnel data={funnelData} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-display text-2xl mb-3">Recent activity</h3>
        <div className="divide-y divide-border">
          {recentActivity.map((a) => {
            const Icon = iconMap[a.icon as keyof typeof iconMap];
            return (
              <div key={a.id} className="flex items-center gap-3 py-2.5">
                <div className="w-7 h-7 rounded-md bg-mint/50 text-mint-ink flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 text-sm">{a.text}</div>
                <div className="text-xs text-muted-foreground">{a.time}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
