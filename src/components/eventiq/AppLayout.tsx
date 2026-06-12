import { Toaster } from "sonner";
import { StoreProvider, useStore } from "@/lib/eventiq/store";
import { Sidebar } from "./Sidebar";
import { Overview } from "./views/Overview";
import { Events } from "./views/Events";
import { Candidates } from "./views/Candidates";
import { Reports } from "./views/Reports";
import { Recommendations } from "./views/Recommendations";

function Main() {
  const { view } = useStore();
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {view === "overview" && <Overview />}
        {view === "events" && <Events />}
        {view === "candidates" && <Candidates />}
        {view === "reports" && <Reports />}
        {view === "recommendations" && <Recommendations />}
      </main>
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
