import { useState } from "react";
import { toast } from "sonner";
import {
  studentCommunities,
  clubPartnerships,
  coopFormats,
  type StudentCommunity,
  type ClubPartnership,
  type CooperationFormat,
} from "@/lib/eventiq/mockData";
import { useStore } from "@/lib/eventiq/store";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const typeBadgeStyles: Record<StudentCommunity["type"], string> = {
  "AI/ML":            "bg-[#DCEFE2] text-[#1F4A2E]",
  "Robotics":         "bg-[#E2E8F0] text-[#334155]",
  "Entrepreneurship": "bg-[#F5E7CC] text-[#7A5712]",
  "Cloud/DevOps":     "bg-[#E8F0F5] text-[#1A4A6E]",
  "Data":             "bg-[#F0E8F5] text-[#4A1A6E]",
  "Open Source":      "bg-[#F5F0E8] text-[#6E4A1A]",
  "Community":        "bg-secondary text-muted-foreground",
};

function slotPill(p: ClubPartnership): { label: string; cls: string } {
  const remaining = p.totalSlots - p.takenSlots;
  if (remaining === 0) return { label: "Waitlist only", cls: "bg-muted text-muted-foreground" };
  if (remaining === 1) return { label: "1 slot left", cls: "bg-amber-100 text-amber-800" };
  return { label: `${remaining} slots available`, cls: "bg-[#DCEFE2] text-[#1F4A2E]" };
}

const statusBadge: Record<string, string> = {
  Confirmed: "bg-[#DCEFE2] text-[#1F4A2E]",
  Pending:   "bg-amber-100 text-amber-800",
  Completed: "bg-muted text-muted-foreground",
};

const TYPE_FILTERS = ["All", "AI/ML", "Robotics", "Entrepreneurship", "Cloud/DevOps", "Data", "Open Source"] as const;
const CITY_OPTIONS = [
  "All Cities",
  "Munich", "Zürich", "Karlsruhe", "Aachen", "Stuttgart", "Darmstadt",
  "Lausanne", "Delft", "Paris", "Vienna", "Stockholm", "Poznań", "Milan",
] as const;

const CITY_ID_MAP: Record<string, string> = {
  "Munich": "munich",     "Zürich": "zurich",       "Karlsruhe": "karlsruhe",
  "Aachen": "aachen",     "Stuttgart": "stuttgart",  "Darmstadt": "darmstadt",
  "Lausanne": "lausanne", "Delft": "delft",          "Paris": "paris",
  "Vienna": "vienna",     "Stockholm": "stockholm",  "Poznań": "poznan",
  "Milan": "milan",
};

export function Cooperations() {
  const { setView, setEventFilter, activeCooperations, addCooperation } = useStore();

  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [cityFilter, setCityFilter] = useState<string>("All Cities");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedFormatId, setSelectedFormatId] = useState<CooperationFormat["id"] | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("Sep");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [challengeTopic, setChallengeTopic] = useState("");

  const partnerableClubs = studentCommunities.filter((c) =>
    clubPartnerships.some((p) => p.clubId === c.id)
  );

  const filteredClubs = partnerableClubs.filter((c) => {
    if (typeFilter !== "All" && c.type !== typeFilter) return false;
    if (cityFilter !== "All Cities" && c.city !== CITY_ID_MAP[cityFilter]) return false;
    return true;
  });

  const selectedClub = selectedClubId ? studentCommunities.find((c) => c.id === selectedClubId) ?? null : null;
  const selectedPartnership = selectedClubId ? clubPartnerships.find((p) => p.clubId === selectedClubId) ?? null : null;
  const selectedFormat = selectedFormatId ? coopFormats.find((f) => f.id === selectedFormatId) ?? null : null;

  const studentsEngaged = selectedClub && selectedFormat
    ? Math.round(selectedClub.members * selectedFormat.engagementRate)
    : 0;
  const pipelineCandidates = Math.round(studentsEngaged * 0.6);

  function handleSelectClub(clubId: string) {
    setSelectedClubId(clubId);
    setSelectedFormatId(null);
    setChallengeTopic("");
  }

  function handleSubmit() {
    if (!selectedClubId || !selectedFormatId || !selectedClub) return;
    const id = String(Date.now());
    const date = `${selectedMonth} 15, ${selectedYear}`;
    addCooperation({
      id,
      clubId: selectedClubId,
      format: selectedFormatId,
      status: "Pending",
      date,
      challengeTopic: challengeTopic.trim() || undefined,
      projectedCandidates: pipelineCandidates,
    });
    toast.success(`Partnership reserved with ${selectedClub.name}`);
    setSelectedClubId(null);
    setSelectedFormatId(null);
    setChallengeTopic("");
  }

  const getClubName = (clubId: string) => studentCommunities.find((c) => c.id === clubId)?.name ?? clubId;
  const getFormatName = (formatId: string) => coopFormats.find((f) => f.id === formatId)?.name ?? formatId;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-border shrink-0">
        <h1 className="font-display text-3xl tracking-tight">Club Cooperations</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Find exclusive talent partnerships with Europe's top student organizations.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-[#2F7A47] text-white"
                  : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="ml-2 bg-card border border-border rounded-md px-3 py-1 text-xs focus:outline-none focus:border-primary"
          >
            {CITY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Club browser + configurator */}
        <div className={`grid gap-4 ${selectedClubId ? "grid-cols-[1fr_400px]" : "grid-cols-2"}`}>
          {/* Club cards */}
          <div className="grid grid-cols-1 gap-3 content-start">
            {filteredClubs.map((club) => {
              const partnership = clubPartnerships.find((p) => p.clubId === club.id)!;
              const pill = slotPill(partnership);
              const full = partnership.takenSlots === partnership.totalSlots;
              const isSelected = selectedClubId === club.id;
              return (
                <div
                  key={club.id}
                  className={`bg-card border rounded-lg p-4 transition-all ${
                    isSelected ? "border-primary shadow-sm" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-sm">{club.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{club.university}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${typeBadgeStyles[club.type]}`}>
                      {club.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-muted-foreground">{club.members} members</span>
                    <span className="text-muted-foreground">·</span>
                    <div className="flex gap-1">
                      {club.topSkills.slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded border border-primary/30 text-primary">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pill.cls}`}>
                      {pill.label}
                    </span>
                    <div className="relative group">
                      <button
                        disabled={full}
                        onClick={() => !full && handleSelectClub(club.id)}
                        className={`text-xs px-3 py-1 rounded-md transition-colors ${
                          full
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-primary text-white hover:bg-primary/90"
                        }`}
                      >
                        {isSelected ? "Configuring…" : "Configure Partnership →"}
                      </button>
                      {full && (
                        <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 bg-foreground text-background text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          All slots filled for this semester.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredClubs.length === 0 && (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No clubs match these filters.
              </div>
            )}
          </div>

          {/* Configurator panel */}
          {selectedClub && selectedPartnership && (
            <div className="border border-border rounded-lg p-5 bg-card h-fit sticky top-0">
              <div className="mb-4">
                <div className="font-semibold">{selectedClub.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {selectedClub.university} · {selectedClub.members} members
                </div>
              </div>

              {/* Format selector */}
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Format</div>
              <div className="space-y-2 mb-4">
                {coopFormats
                  .filter((f) => selectedPartnership.availableFormats.includes(f.id))
                  .map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFormatId(f.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedFormatId === f.id
                          ? "border-[#2F7A47] bg-[#DCEFE2]/30"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-baseline justify-between">
                        <div className="font-medium text-sm">{f.name}</div>
                        <div className="text-xs text-muted-foreground">{f.duration}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{f.description}</div>
                      <div className="text-xs font-medium text-[#2F7A47] mt-1">{f.priceRange}</div>
                    </button>
                  ))}
              </div>

              {/* Date picker */}
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Date</div>
              <div className="flex gap-2 mb-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-primary"
                >
                  {MONTHS.map((m) => <option key={m}>{m}</option>)}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-background border border-border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-primary"
                >
                  <option>2026</option>
                  <option>2027</option>
                </select>
              </div>

              {/* Challenge topic */}
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Challenge Topic <span className="font-normal normal-case">(optional)</span>
              </div>
              <input
                type="text"
                value={challengeTopic}
                onChange={(e) => setChallengeTopic(e.target.value)}
                placeholder="e.g. Build an LLM evaluation harness"
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm mb-4 focus:outline-none focus:border-primary placeholder:text-muted-foreground"
              />

              {/* Yield projection */}
              {selectedFormat && (
                <div className="bg-[#F0F7F2] border border-[#B8E0C2] rounded-lg p-3 mb-4">
                  <div className="text-xs font-semibold text-[#1F4A2E] mb-1">Projected Talent Yield</div>
                  <div className="text-sm font-medium text-[#2F7A47]">
                    ~{studentsEngaged} students engaged → ~{pipelineCandidates} pipeline candidates
                  </div>
                  <div className="text-[10px] text-[#2F7A47]/80 mt-0.5">{selectedFormat.priceRange}</div>
                </div>
              )}

              {/* Submit */}
              <button
                disabled={!selectedFormatId}
                onClick={handleSubmit}
                className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFormatId
                    ? "bg-[#2F7A47] text-white hover:bg-[#1F5C35]"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Reserve Partnership Slot
              </button>
            </div>
          )}
        </div>

        {/* Active Cooperations */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Active Cooperations
          </div>
          {activeCooperations.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No active cooperations yet. Configure a partnership above.
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Club</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Format</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Projected</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeCooperations.map((coop) => (
                    <tr key={coop.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{getClubName(coop.clubId)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{getFormatName(coop.format)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge[coop.status] ?? "bg-muted text-muted-foreground"}`}>
                          {coop.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{coop.date}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{coop.projectedCandidates}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setEventFilter("coop-" + coop.id);
                            setView("candidates");
                          }}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          View Candidates →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
