import { useState } from "react";
import { Menu } from "lucide-react";
import { Toaster } from "sonner";
import { StoreProvider, useStore } from "@/lib/eventiq/store";
import { Sidebar } from "./Sidebar";
import { Overview } from "./views/Overview";
import { Events } from "./views/Events";
import { Candidates } from "./views/Candidates";
import { Ecosystem } from "./views/Ecosystem";
import { Cooperations } from "./views/Cooperations";
import { Reports } from "./views/Reports";
import { Recommendations } from "./views/Recommendations";

function Main() {
  const { view } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center h-12 px-4 border-b border-border bg-background md:hidden shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-display text-base tracking-tight text-foreground">EventIQ</span>
        </header>
        <main className="flex-1 min-w-0">
          {view === "overview" && <Overview />}
          {view === "events" && <Events />}
          {view === "candidates" && <Candidates />}
          {view === "ecosystem" && <Ecosystem />}
          {view === "cooperations" && <Cooperations />}
          {view === "reports" && <Reports />}
          {view === "recommendations" && <Recommendations />}
        </main>
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <StoreProvider>
      <Main />
      <Toaster theme="light" position="top-right" richColors />
    </StoreProvider>
  );
}
