export type Status = "Interested" | "In Review" | "Interviewed" | "Offer Extended" | "Rejected";

export interface EventItem {
  id: string;
  name: string;
  date: string;
  shortDate: string;
  location: string;
  attendees: number;
  optIns: number;
  pipeline: number;
  sponsorship: number;
  costPerLead: number;
}

export interface Candidate {
  id: string;
  name: string;
  university: string;
  skills: string[];
  projectTitle: string;
  projectDescription: string;
  status: Status;
  eventId: string;
  skillProofs?: { skill: string; source: string }[];
  communityRoles?: string[];
}

export const events: EventItem[] = [
  { id: "hacktum", name: "HackTUM 2025", date: "Apr 12, 2025", shortDate: "Apr 12", location: "Munich", attendees: 600, optIns: 89, pipeline: 12, sponsorship: 8000, costPerLead: 667 },
  { id: "starthack", name: "START Hack 2025", date: "Mar 1, 2025", shortDate: "Mar 1", location: "St. Gallen", attendees: 450, optIns: 61, pipeline: 8, sponsorship: 5000, costPerLead: 625 },
  { id: "codeberlin", name: "CODE Berlin Hackathon", date: "Feb 14, 2025", shortDate: "Feb 14", location: "Berlin", attendees: 280, optIns: 48, pipeline: 7, sponsorship: 3500, costPerLead: 500 },
  { id: "ethbuild", name: "ETH Build Night", date: "Jan 18, 2025", shortDate: "Jan 18", location: "Zürich", attendees: 190, optIns: 17, pipeline: 4, sponsorship: 2500, costPerLead: 625 },
  { id: "kithack", name: "KIT Innovation Hack", date: "Nov 22, 2024", shortDate: "Nov 22", location: "Karlsruhe", attendees: 240, optIns: 32, pipeline: 3, sponsorship: 4000, costPerLead: 1333 },
];

export const candidates: Candidate[] = [
  {
    id: "c1", name: "Felix M.", university: "TU Munich",
    skills: ["Python", "ML", "LLMs"],
    projectTitle: "Real-time RAG pipeline for enterprise docs",
    projectDescription: "An end-to-end retrieval pipeline that indexes internal documentation and serves grounded answers with sub-second latency. Built with hybrid search and a fine-tuned reranker.",
    status: "Interviewed", eventId: "hacktum",
    skillProofs: [
      { skill: "Python", source: "1st place · HackTUM 2025" },
      { skill: "ML",     source: "HackTUM best AI project award" },
    ],
    communityRoles: ["TUM AI Society"],
  },
  {
    id: "c2", name: "Anika S.", university: "ETH Zürich",
    skills: ["C++", "Systems", "CUDA"],
    projectTitle: "GPU-accelerated graph traversal",
    projectDescription: "A CUDA implementation of frontier-based BFS that outperforms standard CPU baselines on billion-edge graphs. Submitted to a systems track at ETH Build Night.",
    status: "Interested", eventId: "hacktum",
    skillProofs: [
      { skill: "C++",    source: "ETH Build Night systems track winner" },
      { skill: "CUDA",   source: "ETH HPC Seminar — top project" },
    ],
    communityRoles: ["ETH Robotics Society", "ETH Women in Tech"],
  },
  {
    id: "c3", name: "Jonas W.", university: "TU Berlin",
    skills: ["React", "TypeScript", "Node"],
    projectTitle: "Collaborative whiteboard with CRDT sync",
    projectDescription: "A multiplayer whiteboard built on Yjs with offline-first sync. Designed for low-bandwidth classrooms with conflict-free merges across devices.",
    status: "Interested", eventId: "starthack",
  },
  {
    id: "c4", name: "Lena K.", university: "KIT",
    skills: ["Python", "Data Engineering", "Spark"],
    projectTitle: "Stream processing pipeline for IoT sensors",
    projectDescription: "A Spark-streaming pipeline ingesting telemetry from 10k sensors with windowed aggregation and anomaly detection. Production-grade backpressure handling.",
    status: "In Review", eventId: "kithack",
    skillProofs: [
      { skill: "Python", source: "KIT Innovation Hack finalist" },
      { skill: "Spark",  source: "KIT Data Engineering seminar — top project" },
    ],
    communityRoles: ["KIT Data Science Club"],
  },
  {
    id: "c5", name: "Markus B.", university: "LMU Munich",
    skills: ["Rust", "WebAssembly", "Systems"],
    projectTitle: "WASM-based in-browser SQL engine",
    projectDescription: "A SQLite-compatible query engine compiled to WebAssembly, enabling rich analytics without a backend. Won the systems track at START Hack.",
    status: "Interviewed", eventId: "starthack",
    skillProofs: [
      { skill: "Rust",          source: "START Hack systems track winner" },
      { skill: "WebAssembly",   source: "Mozilla Hacks open-source contributor" },
    ],
    communityRoles: ["LMU Open Source Lab"],
  },
  {
    id: "c6", name: "Priya N.", university: "TU Munich",
    skills: ["ML", "PyTorch", "Computer Vision"],
    projectTitle: "Real-time defect detection for manufacturing",
    projectDescription: "A lightweight vision model running at 60fps on edge hardware, trained with synthetic data augmentation. Already piloted at a Bavarian auto supplier.",
    status: "Offer Extended", eventId: "hacktum",
    skillProofs: [
      { skill: "ML",             source: "HackTUM computer vision track — 1st place" },
      { skill: "PyTorch",        source: "NeurIPS 2024 student workshop paper" },
    ],
    communityRoles: ["TUM ML Society", "Women in AI Munich"],
  },
  {
    id: "c7", name: "Tim R.", university: "Uni Stuttgart",
    skills: ["Go", "Kubernetes", "DevOps"],
    projectTitle: "Self-healing k8s cluster management tool",
    projectDescription: "An operator that detects failing nodes via custom probes and automatically reschedules workloads with zero downtime. Tested on a 200-node cluster.",
    status: "In Review", eventId: "starthack",
    skillProofs: [
      { skill: "Go",          source: "START Hack infrastructure track winner" },
      { skill: "Kubernetes",  source: "CNCF Student Contributor — open-source" },
    ],
    communityRoles: ["Uni Stuttgart Cloud Native Club"],
  },
  {
    id: "c8", name: "Clara V.", university: "RWTH Aachen",
    skills: ["Python", "NLP", "APIs"],
    projectTitle: "Multilingual intent classifier for B2B chatbots",
    projectDescription: "Fine-tuned multilingual transformer reaching 94% F1 on a custom enterprise intent dataset across 6 languages.",
    status: "Rejected", eventId: "codeberlin",
  },
  {
    id: "c9", name: "Daniel H.", university: "TU Munich",
    skills: ["Java", "Spring", "Microservices"],
    projectTitle: "Event-driven inventory sync system",
    projectDescription: "A Kafka-backed inventory service synchronizing stock across 50 warehouses with exactly-once delivery semantics.",
    status: "In Review", eventId: "hacktum",
    skillProofs: [
      { skill: "Java",          source: "TUM Software Engineering Excellence Award" },
      { skill: "Microservices", source: "HackTUM enterprise track — finalist" },
    ],
    communityRoles: ["TUM Enterprise Software Group"],
  },
  {
    id: "c10", name: "Sophie A.", university: "ETH Zürich",
    skills: ["Python", "Reinforcement Learning"],
    projectTitle: "RL agent for dynamic pricing optimization",
    projectDescription: "A PPO agent that learns dynamic pricing strategies in simulated marketplaces, outperforming rule-based baselines by 18% revenue.",
    status: "Interested", eventId: "hacktum",
  },
  {
    id: "c11", name: "Lukas F.", university: "TU Darmstadt",
    skills: ["C++", "Embedded", "RTOS"],
    projectTitle: "Low-latency sensor fusion for robotics",
    projectDescription: "A real-time sensor fusion stack on FreeRTOS combining LIDAR and IMU at sub-millisecond latency for autonomous robotics.",
    status: "Interested", eventId: "codeberlin",
    skillProofs: [
      { skill: "C++",      source: "CODE Berlin embedded track — 1st place" },
      { skill: "Embedded", source: "TU Darmstadt Robotics team technical lead" },
    ],
    communityRoles: ["TU Darmstadt Robotics Club Lead", "FIRST Robotics Germany"],
  },
  {
    id: "c12", name: "Mia T.", university: "Uni Hamburg",
    skills: ["TypeScript", "GraphQL", "React"],
    projectTitle: "Real-time collaborative code editor",
    projectDescription: "A browser-based code editor with sub-100ms multiplayer sync, Monaco integration, and language-server protocol support.",
    status: "Rejected", eventId: "codeberlin",
  },
];

export const eventCandidateMap: Record<string, string[]> = {
  hacktum: ["c1", "c2", "c6", "c9", "c10"],
  starthack: ["c3", "c5", "c7"],
  codeberlin: ["c8", "c12", "c11"],
  ethbuild: ["c10", "c2"],
  kithack: ["c4", "c7"],
};

export const recentActivity = [
  { id: 1, text: "Priya N. moved to Offer Extended", time: "2h ago", icon: "user-check" },
  { id: 2, text: "HackTUM 2025 ROI report generated", time: "1d ago", icon: "file-text" },
  { id: 3, text: "Follow-up sequence sent to 12 HackTUM candidates", time: "2d ago", icon: "mail" },
  { id: 4, text: "Felix M. interview scheduled", time: "3d ago", icon: "calendar" },
  { id: 5, text: "89 new candidates imported from HackTUM 2025", time: "5d ago", icon: "users" },
];

export const recommendations = [
  {
    id: "r1",
    event: "HackTUM 2025 (Repeat)",
    date: "October 2025 (estimated)",
    location: "Munich",
    optIns: "80–100",
    pipeline: "10–14",
    cost: "€8,000–9,000",
    matchScore: 94,
    why: "Your highest-volume event by opt-ins and second-best cost per pipeline entry. Strong Python/ML talent base aligns with 3 of your 4 current open roles.",
    topPick: true,
  },
  {
    id: "r2",
    event: "START Summit 2025",
    date: "September 2025",
    location: "St. Gallen",
    optIns: "55–75",
    pipeline: "8–12",
    cost: "€6,000–7,500",
    matchScore: 81,
    why: "High concentration of product-minded engineers and founding-team alumni. Strong fit for your senior IC roles. Warm organizer relationship already established.",
    topPick: false,
  },
  {
    id: "r3",
    event: "TUM Venture Labs Hack",
    date: "November 2025",
    location: "Munich",
    optIns: "30–45",
    pipeline: "5–8",
    cost: "€3,000–4,500",
    matchScore: 76,
    why: "Smaller event with high technical depth — previous editions produced strong systems and embedded candidates. Lower volume but higher signal-to-noise ratio.",
    topPick: false,
  },
];

export const statusColors: Record<Status, { bg: string; text: string; dot: string }> = {
  "Interested": { bg: "bg-[#DCEFE2]", text: "text-[#1F4A2E]", dot: "#6BAE82" },
  "In Review": { bg: "bg-[#F5E7CC]", text: "text-[#7A5712]", dot: "#C99A3E" },
  "Interviewed": { bg: "bg-[#E2E8F0]", text: "text-[#334155]", dot: "#64748B" },
  "Offer Extended": { bg: "bg-[#B8E0C2]", text: "text-[#1F4A2E]", dot: "#2F7A47" },
  "Rejected": { bg: "bg-[#EFE3DC]", text: "text-[#7A3B1F]", dot: "#B07A5A" },
};

export interface OpenRole {
  id: string;
  title: string;
  skills: string[];
}

export const openRoles: OpenRole[] = [
  { id: "role-ml", title: "ML/AI Working Student", skills: ["Python", "ML", "PyTorch", "LLMs"] },
  { id: "role-backend", title: "Backend Engineering Intern", skills: ["Go", "Java", "Node", "Microservices", "Spark"] },
  { id: "role-systems", title: "Systems Engineering Intern", skills: ["C++", "CUDA", "Rust", "Embedded", "RTOS"] },
  { id: "role-frontend", title: "Frontend Working Student", skills: ["React", "TypeScript", "GraphQL"] },
];

export interface FunnelStage {
  label: string;
  value: number;
  pct?: string;
  widthPct: number;
}

export const funnelData: FunnelStage[] = [
  { label: "Attendees",   value: 1760, widthPct: 100 },
  { label: "Opt-ins",     value: 247,  pct: "14%", widthPct: 70 },
  { label: "Contacted",   value: 178,  pct: "72%", widthPct: 50 },
  { label: "In Pipeline", value: 34,   pct: "19%", widthPct: 20 },
  { label: "Interviewed", value: 12,   pct: "35%", widthPct: 10 },
  { label: "Offers",      value: 3,    pct: "25%", widthPct: 5  },
];
