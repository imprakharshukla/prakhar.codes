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
      "AI Agent Platform: Built Sherpa's AI agent on Mastra and the Vercel AI SDK. One runtime serves web, Slack and Microsoft Teams, with shared multi-person chats, resumable turns, per-user memory and proactive nudges. Merged 1,139 PRs in 7 months, about 46% of all PRs in the repo.",
      "Labour-Law Compliance Engine: Built a deterministic rule engine with 594 rules across 8 jurisdiction packs (Germany, UK, US federal and 5 US states), backed by 426 test cases. Added an LLM compiler that turns plain-English company policy into rules about 3x faster (29s to 10.5s), plus a review workflow for outside law firms.",
      "Legal Knowledge Graph and RAG: Built a corpus of 722 laws and legal sources across the UK, Germany, US, Spain and EU: 331K chunks and 1.03M graph edges from 36 source types. Hybrid pgvector + BM25 search, and re-crawls keep old versions so answers cite only current law.",
      "Real-Time AI Document Canvas: Rewrote intake as one shared state streamed over SSE, with typed commands and edit-preserving merges so a person and the AI can edit the same document at once. Extended it into versioned documents with comments and 10 agent editing tools.",
      "Public MCP Server and Agent Identity: Shipped a public MCP server so customers' own AI agents can work in Sherpa, on our own OAuth server with per-area read, change and delete grants and a human confirmation before every write. Agents get their own WorkOS Agent Auth identity, scoped per org.",
      "Multi-Tenant Security: Moved the production database to Postgres Row Level Security with zero downtime, using per-request transactions and separate DB roles. Put a permission key on every org API route (416 keyed, 29 human-only routes kept away from AI agents).",
    ],
  },
  {
    date: "May 2025 - Dec 2025",
    company: "Yobr (yobr.io) - Oslo, Norway",
    designation: "Founding Engineer (Full-Time)",
    type: "Full-time",
    details: [
      "Tech Stack Migration: Led comprehensive migration to modern architecture using Next.js, Fastify, and Trigger.dev for async job orchestration. Implemented end-to-end type safety with tRPC for shared RPC contracts between frontend and backend.",
      "AI Agent Development: Architected and deployed sophisticated AI agents with 100+ tools using Vercel AI SDK and Mastra.ai, significantly enhancing the job posting workflow and user experience.",
      "Async Task Orchestration: Designed complex asynchronous workflows using Trigger.dev to manage multi-party job interactions, automating communication workflows between employers, candidates, and recruiters.",
      "DevOps & Database Architecture: Executed production database migration to PostgreSQL. Engineered custom application-layer Row Level Security (RLS) alternative, improving performance and maintainability by moving away from native PostgreSQL RLS.",
      "Product Design Contribution: Collaborated on UX/UI design and wireframing, contributing to the overall product vision and user experience strategy.",
    ],
  },
  {
    date: "April 2025 - May 2025",
    company: "Yobr (yobr.io) - Oslo, Norway",
    designation: "Software Engineering Intern",
    type: "Internship",
    details: [
      "Flagship Job Planner: Designed flagship Job Planner with nested AI-powered steps and streaming capabilities, enhancing workflow efficiency.",
      "Design System Overhaul: Overhauled design system, creating unified component library that improved development velocity and UX consistency.",
      "Platform Rework: Led comprehensive rework of company and student platforms, modernizing architecture and UI for enhanced performance.",
      "Organizations & Team Management: Architected organizations and team management system with Row Level Security for secure multi-tenant access.",
    ],
  },
  {
    date: "July 2024 - Oct 2024",
    company: "CaseCraft (NUS Singapore)",
    designation:
      "Software Engineering Intern - Full-Stack Development & AI Integration",
    type: "Internship",
    details: [
      "Frontend Development: Engineered the entire frontend using React with Tanstack Router, styled with TailwindCSS, resulting in a responsive and intuitive user interface. Significantly enhanced the design and user experience for educators and students.",
      "Backend Architecture: Developed a comprehensive backend using TypeScript and Ts-Rest, implementing robust authentication and achieving end-to-end type safety. Migrated the entire application to PostgreSQL, utilizing auto-generated Zod schemas for complete type safety.",
      "Codebase Optimization: Led the migration from JavaScript to TypeScript, resulting in a 24% reduction in application failure and error rates, significantly improving overall system reliability.",
      "AI Integration: Designed and implemented AI pipelines leveraging OpenAI, enhancing the application's capabilities and user engagement.",
    ],
  },
  {
    date: "April 2024 - Present",
    company: "Lumoflo (now svveetpea.com)",
    designation:
      "Founder & Sole Engineer - Multi-Tenant E-commerce Platform, now running svveetpea.com",
    type: "Personal Project",
    details: [
      "Platform: Built a multi-tenant commerce platform for Instagram-first clothing sellers as sole engineer: storefront per store, merchant dashboard, Razorpay payouts and an Expo mobile app, on an Express + ts-rest backend and Next.js frontend in a Turborepo monorepo. Cut build times by 56% (15 min to 6.6 min).",
      "Single-Store Cutover: In Oct 2026 I stopped onboarding new stores and cut the platform down to one live store, svveetpea.com: removed onboarding, billing, payouts and the mobile app, and rebuilt the shop around one-of-a-kind pieces. 418 commits since October.",
      "Store Agent over MCP: The owner runs the shop from Claude or ChatGPT. An MCP server behind Better Auth OAuth exposes 58 tools to list pieces from dictation and photos, pack orders, book pickups, print labels and pull analytics. Voice-to-listing AI fills the whole product form and flags fields it wasn't sure about.",
      "Shipping and Checkout: End-to-end Delhivery integration (auto-booking, 4x6 and A4 labels, pickups, wallet guard, returns by AWB) and delivery-date estimates. Buy now holds a one-of-one piece on a server-clock countdown, with idempotent payment webhooks and live sold-out state across every bag.",
      "Tech Stack: Next.js 16, React 19, Express, ts-rest, Postgres + Drizzle, Trigger.dev, Better Auth, Razorpay, Vercel AI SDK, Railway, Vercel, Cloudflare R2/Images, Playwright.",
    ],
  },
  {
    date: "April 2019 - June 2024",
    company: "Andronix",
    designation:
      'Lead Developer - Ranks No. 1 on Google Play Store for "Linux" keyword, Over 2.4M+ downloads',
    type: "Personal Project",
    details: [
      "Android App: Developed the entire Android App using Kotlin with MVVM architecture. Implemented Retrofit & OkHttp for Rest API calls & caching, LiveData & Coroutines for async operations.",
      "Backend Development: Developed scalable backend architecture:",
      "TypeScript Migration: Refactored codebase to TypeScript, increasing test coverage to over 80%",
      "Testing Infrastructure: Implemented Firebase emulators, boosting integration test coverage from 0% to 78%",
      "Microservices Architecture: Modularized into Internal, Commerce, and Product APIs, significantly reducing maintenance overhead",
      "Frontend Development: Built website using NuxtJS and VueJS, styled with TailwindCSS. Implemented comprehensive end-to-end testing using CypressJS.",
    ],
  },
];
