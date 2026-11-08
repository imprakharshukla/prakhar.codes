// Display helpers for the resume page. Reads from the real data source
// (src/data/experience.ts) and only reshapes it for display.
import { experience, type ExperienceItem } from "../data/experience";

export interface Role {
  raw: ExperienceItem;
  name: string; // "Sherpa"
  url?: string; // "https://sherpahq.ai"
  location?: string; // "Munich, Germany"
  title: string; // "Software Engineer"
  titleNote?: string; // "Contract → Full-Time" / "Full-Time"
  tagline?: string; // "E-commerce Platform, now powering svveetpea.com"
  date: string;
  current: boolean;
  type: ExperienceItem["type"];
  thumb?: string; // ascii halftone thumbnail
  bullets: { label: string | null; text: string }[];
}

const thumbs: Record<string, string> = {
  Lumoflo: "/images/projects/ascii/lumoflo.png",
  Andronix: "/images/projects/ascii/andronix.png",
};

export function splitBullet(detail: string) {
  const i = detail.indexOf(":");
  if (i === -1) return { label: null, text: detail };
  return { label: detail.slice(0, i), text: detail.slice(i + 1).trim() };
}

export function parseRole(item: ExperienceItem): Role {
  // "Sherpa (sherpahq.ai) - Munich, Germany" | "CaseCraft (NUS Singapore)" | "Lumoflo (now svveetpea.com)"
  const m = item.company.match(/^(.*?)(?:\s*\((.*?)\))?(?:\s*-\s*(.*))?$/);
  const name = (m?.[1] ?? item.company).trim();
  const paren = m?.[2]?.trim();
  const location = m?.[3]?.trim();
  const domain = paren?.match(/[a-z0-9.-]+\.[a-z]{2,}/i)?.[0];
  const url = domain ? `https://${domain}` : undefined;

  // "Software Engineer (Contract → Full-Time)" | "Founder & Engineer - E-commerce ..."
  const d = item.designation.match(/^(.*?)(?:\s*\((.*?)\))?(?:\s*-\s*(.*))?$/);
  const title = (d?.[1] ?? item.designation).trim();
  const titleNote = d?.[2]?.trim();
  const tagline = d?.[3]?.trim();

  return {
    raw: item,
    name,
    url,
    location: location ?? (paren && !domain ? paren : undefined),
    title,
    titleNote,
    tagline,
    date: item.date,
    current: /present/i.test(item.date),
    type: item.type,
    thumb: thumbs[name],
    bullets: item.details.map(splitBullet),
  };
}

export const roles: Role[] = experience.map(parseRole);

// Content below mirrors what the live page / SkillAccordion hardcode today.
export const education = [
  {
    date: "2021 - 2025",
    institution: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
    location: "Lucknow",
    details: [
      "B.Tech in Computer Science and Engineering (Artificial Intelligence)",
      "Part of various Technical Clubs, core member of Loop, the Coding Club",
    ],
  },
  {
    date: "2019 - 2020",
    institution: "Spring Dale College",
    location: "Lucknow",
    details: [
      "President of the Computer Science and Mathematics Club",
      "Senior Year in PCM + Computer Science",
    ],
  },
];

export const skillGroups: { name: string; items: string[] }[] = [
  {
    name: "AI & LLMs",
    items: ["Mastra", "Vercel AI SDK", "Anthropic Claude", "OpenAI", "RAG", "Agent evals"],
  },
  {
    name: "Languages",
    items: ["TypeScript", "Javascript", "Kotlin", "Python", "Go", "SQL"],
  },
  {
    name: "Frameworks",
    items: ["React", "NextJS", "NestJS", "Fastify", "Express", "Astro", "TailwindCSS", "React Native", "Android"],
  },
  {
    name: "Databases",
    items: ["PostgreSQL", "Drizzle", "pgvector", "Redis", "MongoDB", "MySQL", "SQLite"],
  },
  {
    name: "Tools & Infra",
    items: ["Git", "Docker", "GitHub Actions", "Cloudflare", "Railway", "Turborepo", "Trigger.dev", "Inngest", "Playwright"],
  },
];
