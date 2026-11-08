export interface ExperienceItem {
  date: string;
  company: string;
  designation: string;
  type: "Full-time" | "Contract" | "Internship" | "Personal Project";
  details: string[];
}

export const experience: ExperienceItem[] = [
  {
    date: "April 2026 - Present",
    company: "Sherpa (sherpahq.ai) - Munich, Germany",
    designation: "Software Engineer (Contract → Full-Time)",
    type: "Full-time",
    details: [
      "AI Agent Platform: Built Sherpa's AI agent on Mastra and the Vercel AI SDK. One runtime serves web, Slack and Microsoft Teams, with shared multi-person chats, resumable turns, per-user memory and proactive nudges.",
      "Employment Law Compliance Engine: Built a deterministic rule engine that checks employment-law compliance across several countries and US states, backed by a full test suite. Added an LLM compiler that turns a company's plain-English policies into rules the engine can run, plus a review workflow for outside law firms.",
      "Legal Knowledge Graph and RAG: Built a legal knowledge graph of laws and legal sources across the UK, Germany, US, Spain and EU. Hybrid pgvector and BM25 search; versioned re-crawls so answers cite only current law.",
      "Real-Time AI Document Canvas: Rewrote intake as one shared state streamed over SSE, with typed commands and edit-preserving merges so a person and the AI can edit the same document at once. Extended it into versioned documents with comments and a set of typed editing tools for the agent.",
      "Public MCP Server and Agent Identity: Shipped a public MCP server so customers' own AI agents can work in Sherpa, behind an in-house OAuth server with per-area read, change and delete grants and a human confirmation before every write. Agents get their own WorkOS Agent Auth identity, scoped per org.",
      "Multi-Tenant Security: Moved the production database to Postgres Row Level Security with zero downtime, using per-request transactions and separate DB roles. Added a permission key to every org API route and marked sensitive routes human-only so AI agents cannot call them.",
    ],
  },
  {
    date: "May 2025 - Dec 2025",
    company: "Yobr (yobr.io) - Oslo, Norway",
    designation: "Founding Engineer (Full-Time)",
    type: "Full-time",
    details: [
      "Tech Stack Migration: Led the migration to Next.js, Fastify and Trigger.dev, with end-to-end type safety via tRPC contracts shared between frontend and backend.",
      "AI Agent Development: Built and deployed tool-heavy AI agents on the Vercel AI SDK and Mastra.ai, automating the job posting workflow end to end.",
      "Async Task Orchestration: Designed Trigger.dev workflows that automate communication between employers, candidates and recruiters across a job's lifecycle.",
      "Database Architecture: Ran the production migration to PostgreSQL and built an application-layer row-level security system for multi-tenant access.",
      "Product Design: Wireframed and designed UX alongside the founders.",
    ],
  },
  {
    date: "March 2025 - May 2025",
    company: "Yobr (yobr.io) - Oslo, Norway",
    designation: "Software Engineering Intern",
    type: "Internship",
    details: [
      "Job Planner: Designed and built the Job Planner, a streaming, multi-step AI flow that made job creation much faster.",
      "Design System: Rebuilt the design system as a single shared component library.",
      "Platform Rework: Reworked the architecture and UI of the company and student platforms.",
      "Organizations and Teams: Built the organizations and team management system with row-level security for multi-tenant access.",
    ],
  },
  {
    date: "July 2024 - Nov 2024",
    company: "CaseCraft (NUS Singapore)",
    designation:
      "Software Engineering Intern - Full-Stack Development & AI Integration",
    type: "Internship",
    details: [
      "Frontend: Built the frontend in React with TanStack Router and Tailwind CSS, redesigning the experience for educators and students.",
      "Backend: Built the backend in TypeScript and ts-rest with authentication and end-to-end type safety. Migrated the application to PostgreSQL with generated Zod schemas.",
      "TypeScript Migration: Led the JavaScript to TypeScript migration, which cut production errors.",
      "AI Integration: Designed and built the product's OpenAI pipelines.",
    ],
  },
  {
    date: "April 2024 - Present",
    company: "Lumoflo (now svveetpea.com)",
    designation:
      "Founder & Engineer - E-commerce Platform, now powering svveetpea.com",
    type: "Personal Project",
    details: [
      "Platform: Built a multi-tenant commerce platform for Instagram-first clothing sellers as sole engineer: storefront per store, merchant dashboard, Razorpay payouts and an Expo mobile app, on an Express + ts-rest backend and Next.js frontend in a Turborepo monorepo.",
      "Single-Store Focus: Refocused the platform on one live store, svveetpea.com (Oct 2026): removed multi-tenant onboarding, billing, payouts and the mobile app, and rebuilt the shop around one-of-a-kind pieces.",
      "Store Agent over MCP: The owner runs the shop from Claude or ChatGPT. An MCP server behind Better Auth OAuth exposes tools to list pieces from dictation and photos, pack orders, book pickups, print labels and pull analytics. Voice-to-listing AI fills the whole product form and flags fields it is unsure about.",
      "Shipping and Checkout: End-to-end Delhivery integration (auto-booking, 4x6 and A4 labels, pickups, returns, prepaid-balance checks) and delivery-date estimates. Buy Now reserves a one-of-one piece on a server-side countdown, with idempotent payment webhooks and live sold-out state across every open cart.",
      "Tech Stack: Next.js 16, React 19, Express, ts-rest, Postgres + Drizzle, Trigger.dev, Better Auth, Razorpay, Vercel AI SDK, Railway, Vercel, Cloudflare R2/Images, Playwright.",
    ],
  },
  {
    date: "April 2019 - Present",
    company: "Andronix",
    designation:
      'Founder & Engineer - Linux-on-Android app, 2M+ downloads, $140K+ revenue; No. 1 on Google Play for "Linux"',
    type: "Personal Project",
    details: [
      "Andronix 2.0 (2026): Rebuilt the app, installer and services: Modded OS desktop editions, Termux:X11 desktops, server-confirmed Play Billing 8 purchases, eight languages, and staged Play rollouts gated on crash rates.",
      "Android App: Kotlin, single-activity architecture, coroutines and Flow, Hilt, Firebase and Sentry and a full unit test suite on every release build.",
      "Backend: TypeScript and Express services (Products, Commerce and Internal APIs) on Railway, with Firebase and Postgres, downloads on Cloudflare R2, and a revenue ledger fed by Play real-time notifications.",
      "Website and Support: andronix.app on Astro and Cloudflare Workers, docs on Next.js, and a support desk where AI-drafted replies are fact-checked before sending.",
    ],
  },
];
