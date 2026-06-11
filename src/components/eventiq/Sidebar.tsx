import { Home, Calendar, Users, BarChart3, Sparkles } from "lucide-react";
import { useStore, type View } from "@/lib/eventiq/store";

const items: { id: View; label: string; icon: typeof Home }[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "events", label: "Events", icon: Calendar },
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "recommendations", label: "Recommendations", icon: Sparkles },
];

export function Sidebar() {
  const { view, setView } = useStore();
  return (
    <aside className="w-[220px] shrink-0 bg-sidebar border-r border-border flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-cyan flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight">EventIQ</span>
        <span className="ml-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary font-medium">beta</span>
      </div>
      <nav className="flex-1 px-2 mt-2 space-y-0.5">
        {items.map((it) => {
          const active = view === it.id;
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-primary" />}
              <Icon className="w-4 h-4" />
              {it.label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-xs font-semibold">
          SE
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">Syntara Engineering</div>
          <div className="text-[11px] text-muted-foreground truncate">Munich · 400</div>
        </div>
      </div>
    </aside>
  );
}
