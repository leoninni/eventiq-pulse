import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/eventiq/AppLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EventIQ — Event Intelligence for Technical Talent" },
      { name: "description", content: "Track candidates from hackathons and student events, automate follow-up, and measure which events produce qualified hires." },
      { property: "og:title", content: "EventIQ — Event Intelligence for Technical Talent" },
      { property: "og:description", content: "Recruiter dashboard for hackathon and student-event hiring." },
    ],
  }),
  component: Index,
});

function Index() {
  return <AppLayout />;
}
