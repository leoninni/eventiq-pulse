import { recommendations } from "@/lib/eventiq/mockData";
import { useStore } from "@/lib/eventiq/store";
import { Sparkles, Check, TrendingUp, Brain, RefreshCw } from "lucide-react";

export function Recommendations() {
  const { shortlist, toggleShortlist } = useStore();
  return (
    <div className="p-10 max-w-[1200px]">
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tight">Recommendations</h1>
        <p className="text-sm text-muted-foreground mt-2">AI-powered event suggestions based on your hiring history.</p>
      </div>

      <div className="bg-mint/40 border border-mint rounded-xl p-4 mb-6 flex gap-3 items-start">
        <div className="w-8 h-8 rounded-md bg-mint text-mint-ink flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-sm">
          Based on <span className="font-semibold">5 sponsored events</span>, <span className="font-semibold">247 candidates</span>, and your current pipeline data, here are the top events we recommend for <span className="font-semibold text-mint-ink">Q3 2025</span>.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {recommendations.map((r) => {
          const isShort = shortlist.has(r.id);
          return (
            <div
              key={r.id}
              className={`relative bg-card border rounded-lg p-5 ${r.topPick ? "border-primary/50" : "border-border"}`}
            >
              {r.topPick && (
                <div className="absolute -top-2.5 left-5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-primary-foreground font-semibold">
                  Top Pick
                </div>
              )}
              <div className="flex items-start gap-5">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h3 className="text-base font-semibold">{r.event}</h3>
                    <span className="text-xs text-muted-foreground">{r.date} · {r.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{r.why}</p>
                  <div className="grid grid-cols-3 gap-3 mt-4 max-w-xl">
                    <Mini label="Predicted opt-ins" value={r.optIns} />
                    <Mini label="Predicted pipeline" value={r.pipeline} />
                    <Mini label="Estimated cost" value={r.cost} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Match Score</div>
                    <div className="text-2xl font-semibold tabular-nums text-cyan">{r.matchScore}<span className="text-muted-foreground text-sm">/100</span></div>
                  </div>
                  <button
                    onClick={() => toggleShortlist(r.id)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors inline-flex items-center gap-1.5 ${
                      isShort
                        ? "bg-success/15 text-success border border-success/40"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isShort ? <><Check className="w-3 h-3" /> Shortlisted</> : "Add to Shortlist"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">How this works</div>
        <div className="grid grid-cols-3 gap-3">
          <Tile icon={TrendingUp} text="Event yield model trained on your 5-event history and cross-company patterns across the EventIQ network" />
          <Tile icon={Brain} text="Candidate quality scored from opt-in signals: skills, project complexity, university, and engagement" />
          <Tile icon={RefreshCw} text="Recommendations update automatically after each new event report is generated" />
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary/40 border border-border rounded-md px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}

function Tile({ icon: Icon, text }: { icon: typeof TrendingUp; text: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="w-7 h-7 rounded-md bg-secondary text-muted-foreground flex items-center justify-center mb-2">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
