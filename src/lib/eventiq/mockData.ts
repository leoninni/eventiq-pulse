export type Status = "Interested" | "In Review" | "Interviewed" | "Offer Extended" | "Rejected";

export interface EventItem {
  id: string;
  name: string;
  date: string;
  shortDate: string;
  location: string;
  lat: number;
  lng: number;
  cityId: string;
  attendees: number;
  optIns: number;
  pipeline: number;
  sponsorship: number;
  costPerLead: number;
  hires: number;
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
  { id: "hacktum",    name: "HackTUM 2025",         date: "Apr 12, 2025", shortDate: "Apr 12", location: "Munich",     lat: 48.14, lng:  11.58, cityId: "munich",     attendees: 600, optIns: 89, pipeline: 12, sponsorship: 8000, costPerLead: 667,  hires: 5 },
  { id: "starthack",  name: "START Hack 2025",       date: "Mar 1, 2025",  shortDate: "Mar 1",  location: "St. Gallen", lat: 47.42, lng:   9.37, cityId: "st-gallen",  attendees: 450, optIns: 61, pipeline: 8,  sponsorship: 5000, costPerLead: 625,  hires: 3 },
  { id: "codeberlin", name: "CODE Berlin Hackathon", date: "Feb 14, 2025", shortDate: "Feb 14", location: "Berlin",     lat: 52.52, lng:  13.41, cityId: "berlin",     attendees: 280, optIns: 48, pipeline: 7,  sponsorship: 3500, costPerLead: 500,  hires: 2 },
  { id: "ethbuild",   name: "ETH Build Night",       date: "Jan 18, 2025", shortDate: "Jan 18", location: "Zürich",     lat: 47.38, lng:   8.54, cityId: "zurich",     attendees: 190, optIns: 17, pipeline: 4,  sponsorship: 2500, costPerLead: 625,  hires: 1 },
  { id: "kithack",    name: "KIT Innovation Hack",   date: "Nov 22, 2024", shortDate: "Nov 22", location: "Karlsruhe",  lat: 49.01, lng:   8.40, cityId: "karlsruhe",  attendees: 240, optIns: 32, pipeline: 3,  sponsorship: 4000, costPerLead: 1333, hires: 1 },
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
  {
    id: "c-excl-1",
    name: "Lena F.",
    university: "TU Munich",
    skills: ["Python", "LLMs", "Evaluation"],
    projectTitle: "LLM benchmark suite for enterprise RAG",
    projectDescription: "Built a modular evaluation harness for enterprise RAG pipelines that tracks faithfulness, relevance, and latency across 12 retrieval strategies.",
    status: "Interested",
    eventId: "hacktum",
    communityRoles: ["tum-ai"],
    skillProofs: [
      { skill: "LLMs", source: "TUM AI Society — LLM evaluation project lead" },
    ],
  },
  {
    id: "c-excl-2",
    name: "Tobias K.",
    university: "TU Munich",
    skills: ["Python", "PyTorch", "MLOps"],
    projectTitle: "Distributed training monitor for large language models",
    projectDescription: "Instrumented a distributed PyTorch training loop with real-time loss tracking and automatic checkpoint selection. Reduced wasted GPU hours by 40%.",
    status: "In Review",
    eventId: "hacktum",
    communityRoles: ["tum-ai"],
  },
  {
    id: "c-excl-3",
    name: "Sara M.",
    university: "TU Munich",
    skills: ["TypeScript", "React", "Data Viz"],
    projectTitle: "Interactive eval leaderboard for foundation models",
    projectDescription: "A live dashboard that ingests benchmark results from HuggingFace and renders interactive comparison charts, making model selection decisions visual.",
    status: "Interested",
    eventId: "hacktum",
    communityRoles: ["tum-ai"],
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

export type ContinentId = "europe" | "north-america" | "asia";

export interface Continent {
  id: ContinentId;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}

export const continents: Continent[] = [
  { id: "europe",        name: "Europe",        lat: 48, lng:  10, zoom: 2.8 },
  { id: "north-america", name: "North America", lat: 40, lng: -95, zoom: 2.4 },
  { id: "asia",          name: "Asia",          lat: 20, lng: 100, zoom: 2.2 },
];

export interface UniversityProfile {
  id: string;
  name: string;
  shortName: string;
  location: string;
  city: string;
  continent: ContinentId;
  lat: number;
  lng: number;
  candidates: number;
  topSkills: string[];
  roleAffinity: string;
}

export interface StudentCommunity {
  id: string;
  name: string;
  type: "AI/ML" | "Robotics" | "Entrepreneurship" | "Cloud/DevOps" | "Data" | "Open Source" | "Community";
  university: string;
  city: string;
  continent: ContinentId;
  members: number;
  topSkills: string[];
}

export const universityProfiles: UniversityProfile[] = [
  // Europe
  { id: "tum",          name: "TU Munich",     shortName: "TUM",          location: "Munich",    city: "munich",    continent: "europe",        lat: 48.14, lng:  11.58, candidates: 67, topSkills: ["ML", "Python", "Robotics"],      roleAffinity: "ML/AI · Systems" },
  { id: "eth",          name: "ETH Zürich",    shortName: "ETH",          location: "Zürich",    city: "zurich",    continent: "europe",        lat: 47.38, lng:   8.54, candidates: 48, topSkills: ["C++", "CUDA", "Rust"],           roleAffinity: "Systems · Research" },
  { id: "tuberlin",     name: "TU Berlin",     shortName: "TU Berlin",    location: "Berlin",    city: "berlin",    continent: "europe",        lat: 52.52, lng:  13.41, candidates: 31, topSkills: ["React", "TypeScript", "Go"],     roleAffinity: "Frontend · Backend" },
  { id: "kit",          name: "KIT",           shortName: "KIT",          location: "Karlsruhe", city: "karlsruhe", continent: "europe",        lat: 49.01, lng:   8.40, candidates: 29, topSkills: ["Python", "Spark", "Embedded"],   roleAffinity: "Data · Embedded" },
  { id: "rwth",         name: "RWTH Aachen",   shortName: "RWTH",         location: "Aachen",    city: "aachen",    continent: "europe",        lat: 50.78, lng:   6.08, candidates: 24, topSkills: ["Java", "NLP", "Systems"],        roleAffinity: "Backend" },
  { id: "unistuttgart", name: "Uni Stuttgart", shortName: "Stuttgart",    location: "Stuttgart", city: "stuttgart", continent: "europe",        lat: 48.78, lng:   9.18, candidates: 18, topSkills: ["Go", "Kubernetes", "DevOps"],    roleAffinity: "Backend · Infra" },
  { id: "tudarmstadt",  name: "TU Darmstadt",  shortName: "TU Darmstadt", location: "Darmstadt", city: "darmstadt", continent: "europe",        lat: 49.88, lng:   8.66, candidates: 16, topSkills: ["C++", "Embedded", "RTOS"],       roleAffinity: "Systems" },
  { id: "lmu",          name: "LMU Munich",            shortName: "LMU",      location: "Munich",    city: "munich",    continent: "europe", lat: 48.14, lng:  11.58, candidates: 14, topSkills: ["Rust", "WebAssembly", "Systems"], roleAffinity: "Systems" },
  { id: "epfl",         name: "EPFL",                  shortName: "EPFL",     location: "Lausanne",  city: "lausanne",  continent: "europe", lat: 46.52, lng:   6.63, candidates: 55, topSkills: ["Python", "Robotics", "ROS"],      roleAffinity: "Robotics · ML/AI" },
  { id: "tudelft",      name: "TU Delft",              shortName: "TU Delft", location: "Delft",     city: "delft",     continent: "europe", lat: 52.01, lng:   4.36, candidates: 45, topSkills: ["C++", "ROS", "Computer Vision"],  roleAffinity: "Robotics · Systems" },
  { id: "ecole-poly",   name: "École Polytechnique",   shortName: "X",        location: "Paris",     city: "paris",     continent: "europe", lat: 48.71, lng:   2.21, candidates: 40, topSkills: ["Python", "ML", "Robotics"],        roleAffinity: "ML/AI · Robotics" },
  { id: "tuwien",       name: "TU Wien",               shortName: "TU Wien",  location: "Vienna",    city: "vienna",    continent: "europe", lat: 48.20, lng:  16.36, candidates: 30, topSkills: ["C++", "Embedded", "Robotics"],    roleAffinity: "Robotics · Embedded" },
  { id: "kth",          name: "KTH Royal Institute of Technology", shortName: "KTH", location: "Stockholm", city: "stockholm", continent: "europe", lat: 59.35, lng: 18.07, candidates: 35, topSkills: ["C++", "ROS", "Python"], roleAffinity: "Robotics · Systems" },
  { id: "put",          name: "Poznań University of Technology", shortName: "PUT", location: "Poznań", city: "poznan",    continent: "europe", lat: 52.41, lng:  16.93, candidates: 25, topSkills: ["Python", "Embedded", "C++"],   roleAffinity: "Robotics" },
  { id: "polimi",       name: "Politecnico di Milano",  shortName: "PoliMi",  location: "Milan",     city: "milan",     continent: "europe", lat: 45.48, lng:   9.23, candidates: 40, topSkills: ["Python", "C++", "Automation"],   roleAffinity: "Robotics · Automation" },
  // North America
  { id: "mit",          name: "MIT",                  shortName: "MIT",       location: "Boston",    city: "boston",    continent: "north-america", lat: 42.36, lng:  -71.09, candidates: 42, topSkills: ["ML", "Systems", "Research"],    roleAffinity: "ML/AI · Research" },
  { id: "harvard",      name: "Harvard",              shortName: "Harvard",   location: "Boston",    city: "boston",    continent: "north-america", lat: 42.37, lng:  -71.12, candidates: 18, topSkills: ["CS Theory", "Python"],          roleAffinity: "Research" },
  { id: "stanford",     name: "Stanford",             shortName: "Stanford",  location: "SF Bay",    city: "sf-bay",    continent: "north-america", lat: 37.43, lng: -122.17, candidates: 51, topSkills: ["ML", "LLMs", "TypeScript"],     roleAffinity: "ML/AI · Frontend" },
  { id: "berkeley",     name: "UC Berkeley",          shortName: "Berkeley",  location: "SF Bay",    city: "sf-bay",    continent: "north-america", lat: 37.87, lng: -122.26, candidates: 33, topSkills: ["Systems", "Rust", "ML"],        roleAffinity: "Systems · ML/AI" },
  { id: "columbia",     name: "Columbia",             shortName: "Columbia",  location: "New York",  city: "nyc",       continent: "north-america", lat: 40.81, lng:  -73.96, candidates: 26, topSkills: ["TypeScript", "Python", "Data"], roleAffinity: "Frontend · Data" },
  { id: "nyu",          name: "NYU",                  shortName: "NYU",       location: "New York",  city: "nyc",       continent: "north-america", lat: 40.73, lng:  -73.99, candidates: 21, topSkills: ["React", "Node", "ML"],          roleAffinity: "Frontend · Backend" },
  { id: "uoft",         name: "Univ. of Toronto",     shortName: "UofT",      location: "Toronto",   city: "toronto",   continent: "north-america", lat: 43.66, lng:  -79.40, candidates: 24, topSkills: ["ML", "Python", "PyTorch"],      roleAffinity: "ML/AI" },
  { id: "uwaterloo",    name: "Univ. of Waterloo",    shortName: "Waterloo",  location: "Waterloo",  city: "waterloo",  continent: "north-america", lat: 43.47, lng:  -80.54, candidates: 29, topSkills: ["Go", "Systems", "DevOps"],      roleAffinity: "Backend · Systems" },
  { id: "utaustin",     name: "UT Austin",            shortName: "UT Austin", location: "Austin",    city: "austin",    continent: "north-america", lat: 30.29, lng:  -97.74, candidates: 19, topSkills: ["C++", "Embedded", "Systems"],   roleAffinity: "Systems · Embedded" },
  { id: "uw",           name: "Univ. of Washington",  shortName: "UW",        location: "Seattle",   city: "seattle",   continent: "north-america", lat: 47.66, lng: -122.31, candidates: 22, topSkills: ["Cloud", "Go", "ML"],            roleAffinity: "Backend · ML/AI" },
  // Asia
  { id: "nus",          name: "NUS",                  shortName: "NUS",       location: "Singapore", city: "singapore", continent: "asia", lat:  1.30, lng: 103.77, candidates: 22, topSkills: ["Python", "ML", "Cloud"],        roleAffinity: "ML/AI · Backend" },
  { id: "ntu",          name: "NTU Singapore",        shortName: "NTU",       location: "Singapore", city: "singapore", continent: "asia", lat:  1.35, lng: 103.68, candidates: 15, topSkills: ["AI", "Robotics", "C++"],        roleAffinity: "Robotics · AI" },
  { id: "utokyo",       name: "Univ. of Tokyo",       shortName: "UTokyo",    location: "Tokyo",     city: "tokyo",     continent: "asia", lat: 35.71, lng: 139.76, candidates: 27, topSkills: ["Robotics", "C++", "ML"],        roleAffinity: "Robotics · Systems" },
  { id: "tokyotech",    name: "Tokyo Tech",           shortName: "TokyoTech", location: "Tokyo",     city: "tokyo",     continent: "asia", lat: 35.61, lng: 139.68, candidates: 16, topSkills: ["Systems", "C++", "Embedded"],   roleAffinity: "Systems" },
  { id: "kaist",        name: "KAIST",                shortName: "KAIST",     location: "Seoul",     city: "seoul",     continent: "asia", lat: 37.46, lng: 126.95, candidates: 24, topSkills: ["ML", "AI", "Python"],           roleAffinity: "ML/AI" },
  { id: "snu",          name: "Seoul National Univ.", shortName: "SNU",       location: "Seoul",     city: "seoul",     continent: "asia", lat: 37.46, lng: 126.95, candidates: 18, topSkills: ["Data", "Python", "ML"],         roleAffinity: "Data · ML/AI" },
  { id: "iisc",         name: "IISc Bangalore",       shortName: "IISc",      location: "Bangalore", city: "bangalore", continent: "asia", lat: 13.02, lng:  77.57, candidates: 30, topSkills: ["ML", "Python", "Systems"],     roleAffinity: "ML/AI · Backend" },
  { id: "iitb",         name: "IIT Bombay",           shortName: "IITB",      location: "Bangalore", city: "bangalore", continent: "asia", lat: 13.02, lng:  77.57, candidates: 21, topSkills: ["C++", "Algorithms", "Python"], roleAffinity: "Systems · Backend" },
  { id: "tsinghua",     name: "Tsinghua University",  shortName: "Tsinghua",  location: "Beijing",   city: "beijing",   continent: "asia", lat: 40.00, lng: 116.33, candidates: 26, topSkills: ["ML", "Systems", "C++"],        roleAffinity: "ML/AI · Systems" },
  { id: "sjtu",         name: "Shanghai Jiao Tong",   shortName: "SJTU",      location: "Shanghai",  city: "shanghai",  continent: "asia", lat: 31.03, lng: 121.43, candidates: 19, topSkills: ["Systems", "Cloud", "Go"],      roleAffinity: "Backend · Cloud" },
];

export const studentCommunities: StudentCommunity[] = [
  // ── Europe — Germany ────────────────────────────────────────────────────────
  { id: "tum-ai",          name: "TUM.ai",                             type: "AI/ML",            university: "TU Munich",                    city: "munich",    continent: "europe", members: 300, topSkills: ["Python", "LLMs"] },
  { id: "tum-hackatum",    name: "Hack@TUM",                           type: "Entrepreneurship", university: "TU Munich",                    city: "munich",    continent: "europe", members: 180, topSkills: ["Full-Stack", "Python"] },
  { id: "tum-robotics",    name: "RoboTUM",                            type: "Robotics",         university: "TU Munich",                    city: "munich",    continent: "europe", members: 150, topSkills: ["C++", "ROS"] },         // ESRA member
  { id: "lmu-start",       name: "START Munich",                       type: "Entrepreneurship", university: "LMU Munich",                   city: "munich",    continent: "europe", members: 250, topSkills: ["Python", "Product"] },
  { id: "rwth-robotics",   name: "Robotics Collective Aachen",         type: "Robotics",         university: "RWTH Aachen",                  city: "aachen",    continent: "europe", members: 120, topSkills: ["C++", "ROS"] },         // ESRA member
  { id: "kit-kaira",       name: "KAIRA",                              type: "Robotics",         university: "KIT",                          city: "karlsruhe", continent: "europe", members:  85, topSkills: ["C++", "Python"] },
  { id: "tud-robotics",    name: "DARE ROBOTICS",                      type: "Robotics",         university: "TU Darmstadt",                 city: "darmstadt", continent: "europe", members:  90, topSkills: ["C++", "Embedded"] },
  { id: "stuttgart-ksat",  name: "KSat e.V.",                          type: "Robotics",         university: "Uni Stuttgart",                city: "stuttgart", continent: "europe", members:  80, topSkills: ["Python", "Embedded"] },
  // ── Europe — Switzerland ────────────────────────────────────────────────────
  { id: "eth-robotics",    name: "ETH Robotics Club",                  type: "Robotics",         university: "ETH Zürich",                   city: "zurich",    continent: "europe", members: 120, topSkills: ["C++", "CUDA"] },        // ESRA member
  { id: "eth-csnow",       name: "CSNOW",                              type: "Community",        university: "ETH Zürich",                   city: "zurich",    continent: "europe", members: 180, topSkills: ["Python", "ML"] },
  { id: "eth-entre",       name: "ETH Entrepreneur Club",              type: "Entrepreneurship", university: "ETH Zürich",                   city: "zurich",    continent: "europe", members: 200, topSkills: ["React", "TypeScript"] },
  { id: "epfl-ai",         name: "EPFL AI Team",                       type: "Robotics",         university: "EPFL",                         city: "lausanne",  continent: "europe", members: 170, topSkills: ["Python", "ROS", "ML"] }, // ESRA member
  // ── Europe — Netherlands ───────────────────────────────────────────────────
  { id: "delft-polar",     name: "Team Polar",                         type: "Robotics",         university: "TU Delft",                     city: "delft",     continent: "europe", members: 140, topSkills: ["C++", "ROS"] },         // ESRA member
  { id: "delft-rsa",       name: "Delft Robotics Student Association", type: "Robotics",         university: "TU Delft",                     city: "delft",     continent: "europe", members: 110, topSkills: ["Python", "Embedded"] }, // ESRA member
  // ── Europe — Austria ───────────────────────────────────────────────────────
  { id: "wien-robotics",   name: "TU Wien Robotics Club",              type: "Robotics",         university: "TU Wien",                      city: "vienna",    continent: "europe", members: 130, topSkills: ["C++", "ROS"] },         // ESRA member
  // ── Europe — France ────────────────────────────────────────────────────────
  { id: "paris-unaite",    name: "Unaite",                             type: "Robotics",         university: "Grandes Écoles Paris",         city: "paris",     continent: "europe", members: 200, topSkills: ["Python", "ML", "Robotics"] }, // ESRA member
  // ── Europe — Sweden ────────────────────────────────────────────────────────
  { id: "kth-robotics",    name: "KTH Robotics",                       type: "Robotics",         university: "KTH",                          city: "stockholm", continent: "europe", members: 160, topSkills: ["C++", "ROS"] },         // ESRA member
  // ── Europe — Poland ────────────────────────────────────────────────────────
  { id: "put-cybair",      name: "KN CybAiR",                          type: "Robotics",         university: "Poznań University of Technology", city: "poznan", continent: "europe", members:  95, topSkills: ["Python", "Embedded", "C++"] }, // ESRA member
  // ── Europe — Italy ─────────────────────────────────────────────────────────
  { id: "polimi-aea",      name: "AEA Polimi",                         type: "Robotics",         university: "Politecnico di Milano",        city: "milan",     continent: "europe", members: 150, topSkills: ["Python", "C++", "Automation"] }, // ESRA member
  // ── North America ──────────────────────────────────────────────────────────
  { id: "mit-ai",          name: "MIT AI Club",                        type: "AI/ML",            university: "MIT",                          city: "boston",    continent: "north-america", members: 220, topSkills: ["ML", "PyTorch"] },
  { id: "harvard-hcs",     name: "Harvard Computer Society",           type: "Community",        university: "Harvard",                      city: "boston",    continent: "north-america", members: 300, topSkills: ["Python", "C"] },
  { id: "stanford-ml",     name: "Stanford AI",                        type: "AI/ML",            university: "Stanford",                     city: "sf-bay",    continent: "north-america", members: 310, topSkills: ["LLMs", "Python"] },
  { id: "berkeley-ml",     name: "ML@Berkeley",                        type: "AI/ML",            university: "UC Berkeley",                  city: "sf-bay",    continent: "north-america", members: 180, topSkills: ["ML", "Python"] },
  { id: "columbia-data",   name: "Columbia Data Science Society",      type: "Data",             university: "Columbia",                     city: "nyc",       continent: "north-america", members: 160, topSkills: ["Python", "SQL"] },
  { id: "uoft-utmist",     name: "UTMIST",                             type: "AI/ML",            university: "Univ. of Toronto",             city: "toronto",   continent: "north-america", members: 2200, topSkills: ["PyTorch", "ML"] },
  { id: "waterloo-hack",   name: "Hack the North",                     type: "Entrepreneurship", university: "Univ. of Waterloo",            city: "waterloo",  continent: "north-america", members: 410, topSkills: ["Full-Stack", "Go"] },
  { id: "uw-robotics",     name: "UW Robotics",                        type: "Robotics",         university: "Univ. of Washington",          city: "seattle",   continent: "north-america", members:  90, topSkills: ["C++", "ROS"] },
  // ── Asia ───────────────────────────────────────────────────────────────────
  { id: "nus-hackers",     name: "NUS Hackers",                        type: "Open Source",      university: "NUS",                          city: "singapore", continent: "asia", members: 180, topSkills: ["Python", "Cloud"] },
  { id: "utokyo-robo",     name: "UTokyo Robotics Lab",                type: "Robotics",         university: "Univ. of Tokyo",               city: "tokyo",     continent: "asia", members: 130, topSkills: ["C++", "ROS"] },
  { id: "kaist-ai",        name: "KAIST AI Society",                   type: "AI/ML",            university: "KAIST",                        city: "seoul",     continent: "asia", members: 200, topSkills: ["ML", "Python"] },
  { id: "iisc-ml",         name: "IISc Machine Learning Group",        type: "AI/ML",            university: "IISc Bangalore",               city: "bangalore", continent: "asia", members: 250, topSkills: ["ML", "Python"] },
  { id: "tsinghua-sys",    name: "Tsinghua Systems Group",             type: "Open Source",      university: "Tsinghua University",          city: "beijing",   continent: "asia", members: 170, topSkills: ["Systems", "C++"] },
];

export interface CityMarker {
  id: string;
  name: string;
  continent: ContinentId;
  lat: number;
  lng: number;
}

export const cityMarkers: CityMarker[] = [
  // Europe
  { id: "munich",     name: "Munich",     continent: "europe",        lat: 48.14, lng:  11.58 },
  { id: "zurich",     name: "Zürich",     continent: "europe",        lat: 47.38, lng:   8.54 },
  { id: "berlin",     name: "Berlin",     continent: "europe",        lat: 52.52, lng:  13.41 },
  { id: "karlsruhe",  name: "Karlsruhe",  continent: "europe",        lat: 49.01, lng:   8.40 },
  { id: "aachen",     name: "Aachen",     continent: "europe",        lat: 50.78, lng:   6.08 },
  { id: "stuttgart",  name: "Stuttgart",  continent: "europe",        lat: 48.78, lng:   9.18 },
  { id: "darmstadt",  name: "Darmstadt",  continent: "europe",        lat: 49.88, lng:   8.66 },
  { id: "st-gallen",  name: "St. Gallen", continent: "europe",        lat: 47.42, lng:   9.37 },
  { id: "lausanne",   name: "Lausanne",   continent: "europe",        lat: 46.52, lng:   6.63 },
  { id: "delft",      name: "Delft",      continent: "europe",        lat: 52.01, lng:   4.36 },
  { id: "paris",      name: "Paris",      continent: "europe",        lat: 48.85, lng:   2.35 },
  { id: "vienna",     name: "Vienna",     continent: "europe",        lat: 48.21, lng:  16.37 },
  { id: "stockholm",  name: "Stockholm",  continent: "europe",        lat: 59.33, lng:  18.07 },
  { id: "poznan",     name: "Poznań",     continent: "europe",        lat: 52.41, lng:  16.93 },
  { id: "milan",      name: "Milan",      continent: "europe",        lat: 45.46, lng:   9.19 },
  // North America
  { id: "boston",    name: "Boston",    continent: "north-america", lat: 42.36, lng:  -71.09 },
  { id: "sf-bay",    name: "SF Bay",    continent: "north-america", lat: 37.77, lng: -122.42 },
  { id: "nyc",       name: "New York",  continent: "north-america", lat: 40.73, lng:  -73.99 },
  { id: "toronto",   name: "Toronto",   continent: "north-america", lat: 43.66, lng:  -79.40 },
  { id: "waterloo",  name: "Waterloo",  continent: "north-america", lat: 43.47, lng:  -80.54 },
  { id: "austin",    name: "Austin",    continent: "north-america", lat: 30.29, lng:  -97.74 },
  { id: "seattle",   name: "Seattle",   continent: "north-america", lat: 47.66, lng: -122.31 },
  // Asia
  { id: "singapore", name: "Singapore", continent: "asia",          lat:  1.30, lng: 103.77 },
  { id: "tokyo",     name: "Tokyo",     continent: "asia",          lat: 35.68, lng: 139.76 },
  { id: "seoul",     name: "Seoul",     continent: "asia",          lat: 37.55, lng: 126.99 },
  { id: "bangalore", name: "Bangalore", continent: "asia",          lat: 12.97, lng:  77.59 },
  { id: "beijing",   name: "Beijing",   continent: "asia",          lat: 39.90, lng: 116.40 },
  { id: "shanghai",  name: "Shanghai",  continent: "asia",          lat: 31.23, lng: 121.47 },
];

// ── Club Cooperations ────────────────────────────────────────────────────────

export interface CooperationFormat {
  id: "workshop" | "challenge-sprint" | "private-hackathon";
  name: string;
  description: string;
  duration: string;
  engagementRate: number;
  priceRange: string;
}

export interface ClubPartnership {
  clubId: string;
  totalSlots: number;
  takenSlots: number;
  availableFormats: CooperationFormat["id"][];
}

export interface ActiveCooperation {
  id: string;
  clubId: string;
  format: CooperationFormat["id"];
  status: "Confirmed" | "Pending" | "Completed";
  date: string;
  challengeTopic?: string;
  projectedCandidates: number;
}

export const coopFormats: CooperationFormat[] = [
  {
    id: "workshop",
    name: "Workshop Night",
    description: "Company engineers run a 3-hour hands-on session",
    duration: "3 hours",
    engagementRate: 0.15,
    priceRange: "€1,500 – €3,000",
  },
  {
    id: "challenge-sprint",
    name: "Challenge Sprint",
    description: "Company problem, students hack for half a day",
    duration: "6 hours",
    engagementRate: 0.25,
    priceRange: "€3,000 – €6,000",
  },
  {
    id: "private-hackathon",
    name: "Private Hackathon",
    description: "Full-day exclusive event, company-designed tracks",
    duration: "full day",
    engagementRate: 0.40,
    priceRange: "€5,000 – €10,000",
  },
];

export const clubPartnerships: ClubPartnership[] = [
  // Germany
  { clubId: "tum-robotics",  totalSlots: 3, takenSlots: 2, availableFormats: ["workshop", "challenge-sprint", "private-hackathon"] }, // RoboTUM — ESRA
  { clubId: "tum-ai",        totalSlots: 4, takenSlots: 1, availableFormats: ["workshop", "challenge-sprint", "private-hackathon"] }, // TUM.ai
  { clubId: "rwth-robotics", totalSlots: 3, takenSlots: 1, availableFormats: ["workshop", "challenge-sprint", "private-hackathon"] }, // Robotics Collective Aachen — ESRA
  { clubId: "kit-kaira",     totalSlots: 2, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint"] },                      // KAIRA
  { clubId: "tud-robotics",  totalSlots: 2, takenSlots: 1, availableFormats: ["workshop", "private-hackathon"] },                    // DARE ROBOTICS
  { clubId: "stuttgart-ksat",totalSlots: 2, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint"] },                     // KSat e.V.
  // Switzerland
  { clubId: "eth-robotics",  totalSlots: 2, takenSlots: 1, availableFormats: ["workshop", "private-hackathon"] },                    // ETH Robotics Club — ESRA
  { clubId: "eth-entre",     totalSlots: 3, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint", "private-hackathon"] }, // ETH Entrepreneur Club
  { clubId: "epfl-ai",       totalSlots: 3, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint", "private-hackathon"] }, // EPFL AI Team — ESRA
  // Netherlands
  { clubId: "delft-polar",   totalSlots: 2, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint", "private-hackathon"] }, // Team Polar — ESRA
  { clubId: "delft-rsa",     totalSlots: 2, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint"] },                     // Delft RSA — ESRA
  // Austria
  { clubId: "wien-robotics", totalSlots: 2, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint", "private-hackathon"] }, // TU Wien Robotics Club — ESRA
  // France
  { clubId: "paris-unaite",  totalSlots: 3, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint", "private-hackathon"] }, // Unaite — ESRA
  // Sweden
  { clubId: "kth-robotics",  totalSlots: 2, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint", "private-hackathon"] }, // KTH Robotics — ESRA
  // Poland
  { clubId: "put-cybair",    totalSlots: 2, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint"] },                     // KN CybAiR — ESRA
  // Italy
  { clubId: "polimi-aea",    totalSlots: 2, takenSlots: 0, availableFormats: ["workshop", "challenge-sprint", "private-hackathon"] }, // AEA Polimi — ESRA
];

export const initialActiveCooperations: ActiveCooperation[] = [
  {
    id: "1",
    clubId: "tum-ai",
    format: "challenge-sprint",
    status: "Confirmed",
    date: "Sep 15, 2026",
    challengeTopic: "Build an LLM evaluation harness",
    projectedCandidates: 52,
  },
];

