import { Home, Calendar, Users, BarChart3, Sparkles, Network, Handshake, X } from "lucide-react";
import { useStore, type View } from "@/lib/eventiq/store";

const items: { id: View; label: string; icon: typeof Home }[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "events", label: "Events", icon: Calendar },
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "ecosystem", label: "Ecosystem", icon: Network },
  { id: "cooperations", label: "Cooperations", icon: Handshake },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "recommendations", label: "Recommendations", icon: Sparkles },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const { view, setView } = useStore();
  return (
    <aside
      className={`w-[220px] shrink-0 bg-sidebar border-r border-border flex-col h-screen fixed inset-y-0 left-0 z-50 md:relative md:z-auto md:sticky md:top-0 ${open ? "flex" : "hidden md:flex"}`}
    >
      <div className="px-5 py-5 flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-[#1A1F1A] flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-[#B8E0C2]" />
        </div>
        <span className="font-display text-xl tracking-tight text-foreground">EventIQ</span>
        <span className="ml-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-mint text-mint-ink font-medium">
          beta
        </span>
        <button
          onClick={onClose}
          className="ml-auto md:hidden text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <nav className="flex-1 px-2 mt-2 space-y-0.5">
        {items.map((it) => {
          const active = view === it.id;
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              onClick={() => {
                setView(it.id);
                onClose?.();
              }}
              className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-mint/40 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-mint-ink" />
              )}
              <Icon className="w-4 h-4" />
              {it.label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#1A1F1A] text-[#B8E0C2] flex items-center justify-center text-xs font-semibold">
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
