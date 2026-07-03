// All portfolio content, ported from the Dark Fantasy design concept.

export interface SectionMeta {
  key: string;
  n: string;
  label: string;
  desc: string;
}

export interface Job {
  years: string;
  role: string;
  org: string;
  note: string;
}

export interface Project {
  tag: string;
  emoji: string;
  name: string;
  note: string;
  href?: string;
}

export interface Giving {
  emoji: string;
  kind: string;
  title: string;
  note: string;
  href?: string;
}

export interface Win {
  date: string;
  emoji: string;
  title: string;
  note: string;
}

export interface Accolade {
  emoji: string;
  kind: string;
  title: string;
  year: string;
}

export interface Fact {
  label: string;
  value: string;
  sub: string;
}

export interface Channel {
  name: string;
  handle: string;
  href: string;
  tag: string;
  glyph: string; // plain text glyph, or 'discord' to render the SVG
  markColor: string;
  mono?: boolean;
}

export interface SanctumCard {
  key: string;
  emoji: string;
  title: string;
  desc: string;
  meta: string;
  roll?: boolean;
  ph: [string, string, string];
}

export const sectionMeta: SectionMeta[] = [
  { key: "about", n: "I", label: "Origin", desc: "who I am" },
  { key: "path", n: "II", label: "Path", desc: "the journey" },
  { key: "work", n: "III", label: "Workshop", desc: "projects" },
  { key: "give", n: "IV", label: "Order", desc: "talks · OSS" },
  { key: "wins", n: "V", label: "Chronicle", desc: "milestones" },
  { key: "corner", n: "VI", label: "Sanctum", desc: "my world" },
  { key: "contact", n: "VII", label: "Hearth", desc: "say hi" },
];

export const timeline: Job[] = [
  {
    years: "2025 — now",
    role: "Technical Leader",
    org: "N-iX",
    note: "Lead 5 engineers across marketplace storefronts, drove an AI-native IDE shift that sped delivery ~20–30%, and ran the front-end migration of a component carrying 70% of the client's revenue.",
  },
  {
    years: "2024 — 2025",
    role: "Senior Software Engineer",
    org: "N-iX",
    note: "Architected internal B2B retail tools from scratch — led the SvelteKit→React migration, set up monorepo + CI/CD, and maintained GraphQL subgraphs under Apollo Federation.",
  },
  {
    years: "2022 — 2024",
    role: "Software Engineer",
    org: "Openbet",
    note: "Built features in a high-load trading platform, cut memory and CPU usage 28%, led the Webpack 4→5 migration, and trimmed CI time 20% on Jenkins.",
  },
  {
    years: "2022",
    role: "Front-end Developer",
    org: "RedDuck",
    note: "Led the front-end of a crypto price-protection platform and an NFT marketplace — custom UI library, MVP architecture, pixel-perfect pages, and onboarding new teammates.",
  },
  {
    years: "2021 — 2022",
    role: "Full-Stack Engineer",
    org: "IONKID",
    note: "Where the path began. Shipped a responsive landing with SEO, visualized spreadsheet data, and built a Python email-scheduling API on Firebase.",
  },
];

export const ventures: Job[] = [
  {
    years: "2024 — now",
    role: "Co-Founder",
    org: "Ivy",
    note: "A freelance, commission & community platform for every form of art — all the tools clients and artists need to work together, in one place. Closed beta ran this spring; open beta lands this summer.",
  },
  {
    years: "2021",
    role: "Two-time accelerator winner",
    org: "Creative Spark · SIA Ukraine",
    note: "Won two startup acceleration programs back to back — my first real taste of turning an idea into a venture.",
  },
];

export const projects: Project[] = [
  {
    tag: "desktop app",
    emoji: "⛏️",
    name: "WardSculks Launcher",
    note: "Electron launcher for a Ukrainian modded Minecraft project — multi-server support, a built-in anti-cheat, and Discord Rich Presence.",
    href: "https://github.com/Wordllban/wardsculks-launcher",
  },
];

export const giving: Giving[] = [
  {
    emoji: "🎤",
    kind: "TALK",
    title: "Cursor 101 workshops",
    note: "Ran internal Cursor 101 workshops and talks at N-iX, getting teams fluent in AI-native development.",
  },
  {
    emoji: "🧑‍🏫",
    kind: "TEACHING",
    title: "Mentoring CS students",
    note: "Ran web-dev workshops for second-years and assessed their lab work across web, databases & algorithms.",
  },
  {
    emoji: "🤝",
    kind: "CHARITY",
    title: "Code for community gardens",
    note: "Built free booking software for three local community gardens. Pro bono, joyfully.",
  },
  {
    emoji: "📚",
    kind: "OPEN SOURCE",
    title: "TanStack Virtual docs",
    note: "Contributed documentation to TanStack Virtual so the next dev finds their footing faster.",
    href: "https://github.com/TanStack/virtual/commit/907ae66568658f6d2603a90adfc70acc50a8c71b",
  },
  {
    emoji: "🐛",
    kind: "OPEN SOURCE",
    title: "Houdini Svelte fix",
    note: "Reported a load-fn error in the Houdini Svelte library and proposed the fix.",
    href: "https://github.com/Wordllban/houdini-svelte-load-fn-error",
  },
];

export const wins: Win[] = [
  {
    date: "MAY 2026",
    emoji: "🚀",
    title: "Ivy wrapped its closed beta",
    note: "First artists and clients side by side. I cried a little — open beta is next.",
  },
  {
    date: "MAR 2026",
    emoji: "🎤",
    title: "Gave my first keynote",
    note: "Stage fright is real and survivable — you can do it too.",
  },
];

export const education = {
  degree: "Bachelor of Science",
  field: "Computer Science — Internet of Things",
  school: "Lviv Polytechnic National University",
  grade: "86 / 100",
  courses: [
    "Algorithms & Data Structures",
    "Relational & Non-Relational DBs",
    "Computer Networks",
    "Operating Systems",
    "Cloud Technologies",
    "Microcontrollers & Robotics",
  ],
};

export const accolades: Accolade[] = [
  {
    emoji: "🏆",
    kind: "Startup accelerator · Winner",
    title: "Creative Spark Big Idea Challenge",
    year: "2021",
  },
  {
    emoji: "🏆",
    kind: "Startup accelerator · Winner",
    title: "SIA Ukraine",
    year: "2021",
  },
];

export const course = {
  kind: "Course · Google Cloud",
  title: "Grow Your Business with Google Cloud: The Era of AI Agents",
  note: "Built a RAG onboarding/HR assistant (Python · Pinecone) and a confidence-scored AI agent for social-media content (TypeScript).",
};

export const facts: Fact[] = [
  { label: "Based in", value: "Lviv, UA", sub: "Ukraine · EET" },
  { label: "Experience", value: "6 years", sub: "product · outstaff" },
  { label: "Currently", value: "Co-Founder", sub: "building Ivy" },
  { label: "Stack", value: "Fullstack", sub: "+ AI, end to end" },
  { label: "Speaks", value: "EN · UA", sub: "JP · PL (learning)" },
];

export const channels: Channel[] = [
  {
    name: "Email",
    handle: "mininkov1337@gmail.com",
    href: "mailto:mininkov1337@gmail.com",
    tag: "raven",
    glyph: "@",
    markColor: "var(--gold)",
  },
  {
    name: "LinkedIn",
    handle: "/in/kostiantyn-mininkov",
    href: "https://www.linkedin.com/in/kostiantyn-mininkov/",
    tag: "network",
    glyph: "in",
    markColor: "var(--accent)",
  },
  {
    name: "GitHub",
    handle: "@Wordllban",
    href: "https://github.com/Wordllban",
    tag: "code",
    glyph: "</>",
    markColor: "var(--leaf)",
    mono: true,
  },
  {
    name: "Discord",
    handle: "spalaxxx",
    href: "https://discord.com/users/247757319037779968",
    tag: "chat",
    glyph: "discord",
    markColor: "var(--leaf-2)",
  },
];

export const sanctum: SanctumCard[] = [
  {
    key: "garden",
    emoji: "🪴",
    title: "The garden",
    desc: "Ivy, a stubborn juniper bonsai, and a shelf of succulents that have survived me this long.",
    meta: "// 11 plants & counting",
    ph: ["ivy wall", "juniper bonsai", "succulent shelf"],
  },
  {
    key: "arcade",
    emoji: "🎮",
    title: "Games & anime",
    desc: "Cozy sims and deep RPGs taught me systems thinking first; anime taught me stories unafraid to be gentle — both fed by a love of Japan.",
    meta: "// wabi-sabi > perfection",
    ph: ["current playthrough", "anime still", "kyoto trip"],
  },
  {
    key: "table",
    emoji: "🎲",
    title: "The table & D&D",
    desc: "The crunchier the better — deck builders, meaty wargames, and rolling dice with friends in worlds like Baldur's Gate.",
    meta: "// 🎲 roll a d20",
    roll: true,
    ph: ["game shelf", "game night", "dice set"],
  },
];

// Vine geometry — irregular bumps (one per leaf row).
export const vineCx = 26;
export const vineAmps = [-14, 10, -19, 11, -16, 9, -18];

export function buildVinePath(): string {
  const cx = vineCx;
  const r = (v: number) => Math.round(v * 10) / 10;
  const edge = -46;
  const pts: [number, number][] = [[edge, -34]];
  vineAmps.forEach((a, i) => pts.push([cx + a, (i + 1) * 125]));
  pts.push([edge, 1034]);
  let d = "M" + r(pts[0][0]) + "," + r(pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || pts[i + 1];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d +=
      " C" +
      r(c1x) +
      "," +
      r(c1y) +
      " " +
      r(c2x) +
      "," +
      r(c2y) +
      " " +
      r(p2[0]) +
      "," +
      r(p2[1]);
  }
  return d;
}
