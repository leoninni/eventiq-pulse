import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowUp, ArrowDown, UserCheck, FileText, Mail, Calendar, Users } from "lucide-react";
import { events, recentActivity, statusColors, type Status } from "@/lib/eventiq/mockData";
import { useStore } from "@/lib/eventiq/store";

const chartData = [...events]
  .map((e) => ({ name: e.name.replace(" 2025", "").replace(" 2024", ""), candidates: e.optIns, sponsorship: e.sponsorship, cpl: Math.round(e.sponsorship / e.optIns) }))
  .sort((a, b) => b.candidates - a.candidates);

const iconMap = { "user-check": UserCheck, "file-text": FileText, mail: Mail, calendar: Calendar, users: Users };

function Kpi({ label, value, delta, deltaPositive }: { label: string; value: string; delta?: string; deltaPositive?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
        {delta && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${deltaPositive ? "text-success" : "text-danger"}`}>
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
  const donutData = order.map((s) => ({ name: s, value: fixedPct[s], live: statusCounts[s] || 0, color: statusColors[s].dot }));

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Hiring intelligence across all sponsored events</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Kpi label="Total Candidates Captured" value="247" delta="18% vs last quarter" deltaPositive />
        <Kpi label="Events Sponsored" value="5" />
        <Kpi label="In Active Pipeline" value={String(total + 22)} />
        <Kpi label="Avg Cost per Qualified Lead" value="€312" delta="22% vs last quarter" deltaPositive />
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className="col-span-3 bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Candidates Captured by Event</h3>
            <span className="text-xs text-muted-foreground">Opt-ins per event</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 30, right: 20, top: 8, bottom: 8 }}>
                <XAxis type="number" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#F8FAFC", fontSize: 12 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip
                  cursor={{ fill: "#1E1E2E" }}
                  contentStyle={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number, name, item: { payload?: { sponsorship: number; cpl: number } }) => {
                    const p = item?.payload;
                    return [`${value} candidates · €${p?.sponsorship.toLocaleString()} spent · €${p?.cpl}/lead`, ""];
                  }}
                />
                <Bar dataKey="candidates" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-2 bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Pipeline Status</h3>
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
                <Tooltip
                  contentStyle={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
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

      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
        <div className="divide-y divide-border">
          {recentActivity.map((a) => {
            const Icon = iconMap[a.icon as keyof typeof iconMap];
            return (
              <div key={a.id} className="flex items-center gap-3 py-2.5">
                <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-muted-foreground">
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
