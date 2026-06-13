import { universityProfiles, studentCommunities, type StudentCommunity } from "@/lib/eventiq/mockData";

const typeBadgeStyles: Record<StudentCommunity["type"], string> = {
  "AI/ML":            "bg-[#DCEFE2] text-[#1F4A2E]",
  "Robotics":         "bg-[#E2E8F0] text-[#334155]",
  "Entrepreneurship": "bg-[#F5E7CC] text-[#7A5712]",
  "Cloud/DevOps":     "bg-[#E8F0F5] text-[#1A4A6E]",
  "Data":             "bg-[#F0E8F5] text-[#4A1A6E]",
  "Open Source":      "bg-[#F5F0E8] text-[#6E4A1A]",
  "Community":        "bg-secondary text-muted-foreground",
};

export function Ecosystem() {
  const totalCandidates = universityProfiles.reduce((sum, u) => sum + u.candidates, 0);

  return (
    <div className="p-10 max-w-[1400px]">
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tight">Talent Ecosystem</h1>
        <p className="text-sm text-muted-foreground mt-2">
          University talent pools and student communities in your recruiting network.
        </p>
      </div>

      {/* Aggregate stats */}
      <div className="flex gap-4 mb-10">
        {[
          { value: totalCandidates, label: "candidates" },
          { value: universityProfiles.length, label: "universities" },
          { value: studentCommunities.length, label: "communities" },
        ].map(({ value, label }) => (
          <div key={label} className="bg-card border border-border rounded-lg px-5 py-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums">{value}</span>
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* University Talent Pools */}
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          University Talent Pools
        </div>
        <div className="grid grid-cols-4 gap-3">
          {universityProfiles.map((u) => (
            <div key={u.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-1">
                <div className="text-sm font-semibold">{u.shortName}</div>
                <div className="text-[10px] text-muted-foreground">{u.location}</div>
              </div>
              <div className="text-2xl font-bold tabular-nums mt-2">{u.candidates}</div>
              <div className="text-xs text-muted-foreground mb-3">candidates</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {u.topSkills.slice(0, 3).map((s) => (
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

      {/* Student Communities */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Student Communities
        </div>
        <div className="grid grid-cols-3 gap-3">
          {studentCommunities.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-semibold leading-tight">{c.name}</div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${typeBadgeStyles[c.type]}`}>
                  {c.type}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mb-3">{c.university}</div>
              <div className="text-lg font-bold tabular-nums">{c.members.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mb-3">members</div>
              <div className="flex flex-wrap gap-1">
                {c.topSkills.slice(0, 2).map((s) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded border border-primary/30 text-primary">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
