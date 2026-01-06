export interface ExperienceItem {
  date: string;
  company: string;
  designation: string;
  type: "Full-time" | "Internship" | "Personal Project";
  details: string[];
}

export const experience: ExperienceItem[] = [
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
    company: "Lumoflo",
    designation:
      "Lead Developer - Full-Stack & Mobile Multi-Tenant E-commerce Platform",
    type: "Personal Project",
    details: [
      "Backend Architecture: Engineered robust backend using Express.js and ts-rest, implementing end-to-end type safety. Designed sophisticated monorepo structure, reducing build times by 56% (15 min to 6.6 min).",
      "Advanced Features: Developed complex account synchronization for carts and queues. Implemented high-performance job queuing system using bull-mq, Redis and Trigger.dev for efficient task processing.",
      "Mobile Development: Developing a React Native application for merchants that utilizes the common backend contracts and the aforementioned APIs.",
      "Frontend Development: Led frontend development with Next.js, creating a centralized design library of reusable components. Optimized dev environment, reducing server startup times from 5.12 minutes to under 10 seconds.",
      "Automated Testing: Wrote over 40 end-to-end tests for core modules, automating API endpoint testing using Docker, Superagent, Prisma, and Jest, significantly enhancing code reliability.",
      "Tech Stack: Backend: Express.js, TypeScript, Postgres, Redis, Ts-Rest, Agenda, Jest, Jupa | Frontend: Next.js 14, React Server Components, TailwindCSS | Infrastructure: Docker containers, Fly.io, Cloudflare Images, Vercel Platform",
    ],
  },
  {
    date: "April 2019 - Present",
    company: "Andronix",
    designation:
      'Lead Developer - Ranks No. 1 on Google Play Store for "Linux" keyword, Over 1.7M+ downloads',
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
