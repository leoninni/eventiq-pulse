import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowUp, ArrowDown, UserCheck, FileText, Mail, Calendar, Users } from "lucide-react";
import { events, recentActivity, type Status } from "@/lib/eventiq/mockData";
import { useStore } from "@/lib/eventiq/store";

const chartData = [...events]
  .map((e) => ({ name: e.name.replace(" 2025", "").replace(" 2024", ""), candidates: e.optIns, sponsorship: e.sponsorship, cpl: Math.round(e.sponsorship / e.optIns) }))
  .sort((a, b) => b.candidates - a.candidates);

const iconMap = { "user-check": UserCheck, "file-text": FileText, mail: Mail, calendar: Calendar, users: Users };

const donutPalette: Record<Status, string> = {
  "Interested": "#6BAE82",
  "In Review": "#C99A3E",
  "Interviewed": "#64748B",
  "Offer Extended": "#2F7A47",
  "Rejected": "#B07A5A",
};

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

export function Overview() {
  const { candidates } = useStore();

  const statusCounts = candidates.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  const total = candidates.length;
  const order: Status[] = ["Interested", "In Review", "Interviewed", "Offer Extended", "Rejected"];
  const fixedPct: Record<Status, number> = { "Interested": 38, "In Review": 25, "Interviewed": 18, "Offer Extended": 6, "Rejected": 13 };
  const donutData = order.map((s) => ({ name: s, value: fixedPct[s], live: statusCounts[s] || 0, color: donutPalette[s] }));

  const tooltipStyle = { background: "#FFFFFF", border: "1px solid #E3E8E3", borderRadius: 8, fontSize: 12, color: "#1A1F1A" };

  return (
    <div className="p-10 max-w-[1400px]">
      <div className="mb-8">
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight max-w-3xl">
          Hiring intelligence for <span className="highlight-marker">technical talent</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-3">A snapshot of every sponsored event, candidate, and follow-up across your pipeline.</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Kpi label="Candidates captured" value="247" delta="18% vs last quarter" deltaPositive />
        <Kpi label="Events sponsored" value="5" />
        <Kpi label="In active pipeline" value={String(total + 22)} />
        <Kpi label="Avg cost per lead" value="€312" delta="22% vs last quarter" deltaPositive />
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className="col-span-3 bg-card border border-border rounded-xl p-6">
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

        <div className="col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl">Pipeline status</h3>
            <span className="text-xs text-muted-foreground">{total} active</span>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2} stroke="none">
                  {donutData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1.5">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-foreground">{d.name}</span>
                </div>
                <span className="text-muted-foreground tabular-nums">{d.value}%</span>
              </div>
            ))}
          </div>
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
