# Job Application Answers

## Basic Information
**First name:** Prakhar
**Last name:** Shukla
**Email:** imprakharshukla@gmail.com
**LinkedIn:** https://www.linkedin.com/in/iamprakharshukla/
**Website:** https://prakhar.codes

---

## Hourly Rate
**Answer:** $90/hr (or adjust based on your preference - this matches their budget)

---

## Timezone Requirement
**Do you meet the timezone requirement?**

**Answer:** Yes (if you can work EST/PST hours from India)

**OR if you can't overlap fully:**

**Answer:** I'm based in India (IST) and can overlap 9am-1pm EST reliably. I've successfully worked remotely with international teams at Yobr (Norway) and am flexible with schedule adjustments for important meetings and collaboration hours.

---

## When are you available to start?
**Answer:** Immediately / Within 1 week

---

## Booking Calendar URL
**Answer:** https://cal.com/imprakharshukla (or your actual Cal.com link from your website)

---

## Work Authorization
**Are you legally authorized to work in the country where the job is located?**

**If US-based:** No, I'm based in India. I have extensive remote work experience and am open to relocation with visa sponsorship if required.

**If remote-friendly:** Yes, I'm based in India and experienced working remotely with international teams.

---

## Visa Sponsorship
**Will you now or in the future require visa sponsorship?**

**Answer:** Yes, I would require visa sponsorship for US relocation. However, I'm experienced working remotely (worked with Yobr in Norway from India) and can start immediately as a remote contractor while we explore sponsorship options.

---

## Question 1: Tell us about a complex product or workflow you've built end-to-end

```
At Yobr (Norway), I built an AI agent orchestration system from scratch that coordinated multi-party hiring workflows between companies, students, and the platform.

The complexity:
• Designed 100+ custom tools that AI agents could invoke across different services (job boards, applicant tracking systems, communication platforms)
• Built async workflow orchestration using Trigger.dev to manage long-running, multi-step processes where actions from one party triggered automated responses to others
• Architected the entire data flow: job postings → candidate matching → automated outreach → interview scheduling → feedback loops
• Implemented end-to-end type safety using tRPC for shared contracts between Next.js frontend and Fastify backend

Technical challenges:
• State management across async workflows - ensuring consistency when workflows could run for days
• Error handling and retry logic when external APIs failed mid-workflow
• Building a flexible tool system that allowed adding new integrations without rewriting core logic
• Production database migration to PostgreSQL with custom Row Level Security for multi-tenant access

Result: Took the product from early MVP to production-ready platform handling real hiring workflows autonomously.

This required understanding the entire stack - from UI/UX for recruiters to backend orchestration to AI agent reliability - and owning each piece end-to-end.
```

---

## Question 2: Describe a situation where you used AI coding tools (e.g., Cursor, Claude Code, etc) to accelerate development

```
I use Cursor daily and it's become essential to how I work. Here's a specific example:

At Yobr, I needed to migrate our entire codebase from a REST API to tRPC for end-to-end type safety. This involved:
• Converting 50+ API endpoints
• Updating all client-side calls
• Refactoring error handling patterns

Instead of manually rewriting each endpoint, I used Cursor to:
1. Define the pattern once - showed it one example of the migration (old REST endpoint → new tRPC procedure)
2. Used Cursor's "Apply to All" to suggest migrations for similar endpoints
3. Let it handle boilerplate while I focused on edge cases and business logic

What would have taken 2-3 weeks took 4 days. The AI caught patterns I would have missed (like inconsistent error handling) and suggested better type definitions.

I also use Claude Code for:
• Generating comprehensive tests after writing features
• Refactoring complex functions while maintaining behavior
• Exploring unfamiliar codebases quickly (like when I joined Yobr and needed to understand their existing architecture)

The key: AI tools are best when you understand what you're building. I use them to handle repetitive work and explore faster, but I always review, test, and understand the generated code. They accelerate execution, not thinking.
```

---

## Question 3: What's an example of a feature where you had to coordinate data across multiple systems or services?

```
At Lumoflo, I built payment orchestration that coordinated data across 5 different systems:

The feature: Automated order fulfillment workflow
Systems involved:
1. Stripe/Razorpay (payment processing)
2. PostgreSQL (order state management)
3. Shipping provider APIs (label generation, tracking)
4. Inventory management system (stock updates)
5. Customer notification service (email/SMS)

Data flow challenge:
• Payment webhook arrives from Stripe → validate and record payment
• Trigger inventory deduction across potentially multiple warehouses
• Generate shipping labels via provider API
• Update order status in database
• Send confirmation email with tracking info
• Handle failures at any step without double-charging or losing inventory

Technical approach:
• Used bull-mq (Redis-backed job queue) for reliable async processing
• Implemented idempotency keys to handle duplicate webhooks
• Built state machine for order status transitions with rollback logic
• Saga pattern for distributed transactions - if shipping label generation failed, refund payment and restore inventory
• Comprehensive error handling with retry policies for each external service

Hardest part: Ensuring data consistency when external APIs failed mid-workflow. For example, if payment succeeded but inventory update failed, we needed to either retry inventory update or initiate refund - couldn't leave the system in inconsistent state.

Result: Processed ₹1.5M+ in transactions with 99.9% success rate and automated recovery for edge cases.

This taught me that coordinating multiple systems isn't just about API calls - it's about designing for failure, maintaining consistency, and building observable systems where you can trace data flow across services.
```

---

## Question 4: Is there anything about this role or product space that particularly excites you?

**FOR BRAINTRUST:**

```
Two things really excite me about Braintrust:

1. I've literally built this before - from the other side
At Yobr (Norway), I built AI-powered hiring workflows that connected companies with talent. I architected the orchestration system for multi-party interactions (employers ↔ candidates ↔ platform), designed async workflows for job matching and automated outreach, and saw firsthand how broken traditional hiring tech is.

What excites me about Braintrust: You're tackling hiring workflows with AI-native thinking, not just digitizing broken processes. The focus on "modern, AI-enabled workforce technologies" resonates because I've experienced the gap between what current hiring platforms do (keyword matching, manual screening) versus what they should do (intelligent orchestration, automated qualification, seamless coordination).

I understand both the technical complexity (multi-step workflows, state management across async processes) and the product challenge (balancing automation with human judgment). Building this at Braintrust means solving problems I've already encountered, but at enterprise scale with better tooling.

2. The technical challenge of AI + workflow orchestration
The intersection of AI agents and complex workflows is exactly where I thrive. At Yobr, I built 100+ custom tools that AI agents could invoke across different systems - essentially teaching agents to orchestrate hiring workflows autonomously.

What's hard about this:
• Designing workflows flexible enough for AI to execute but structured enough to ensure consistency
• Managing state across long-running, multi-party processes
• Building observability into AI-driven systems so you can debug when things go wrong
• Scaling beyond single-user workflows to enterprise multi-tenant architectures

Braintrust is building this at a scale I haven't worked at before, with enterprise clients and compliance requirements. That's the technical growth I'm looking for - same problem domain, bigger challenges.

What particularly resonates: The "AI-native development mindset" requirement. I use Cursor daily and believe AI tools should multiply impact, not replace thinking. At Yobr, I used AI coding tools to accelerate our tRPC migration from weeks to days. I'm energized by teams that embrace AI tooling strategically, not fearfully.

Also, the tech stack (TypeScript/Node.js, Next.js, PostgreSQL, workflow automation) matches exactly what I've been shipping with. This feels like a natural continuation of the work I started at Yobr, but with more resources, bigger scale, and a proven product-market fit.
```

---

## ADDITIONAL QUESTIONS

### What is the most complex project in React.js you worked on? Mention the relevant companies & duration as well.

```
Yobr (Norway) - Founding Engineer (May-Dec 2025, 8 months)

Built the entire frontend for an AI-powered hiring platform using Next.js 14 with React Server Components. This was the most technically complex React project I've worked on.

Complexity highlights:

1. Real-time AI streaming UI
• Built streaming interfaces for AI agent responses using Vercel AI SDK
• Managed complex state for multi-step AI workflows where each step could branch based on AI decisions
• Implemented optimistic updates and rollback handling when AI actions failed
• Designed loading states and error boundaries for unpredictable AI response times

2. Complex workflow orchestration UI
• Built a visual job planner with nested, AI-powered steps that users could configure
• Real-time collaboration features where multiple team members could edit workflows simultaneously
• State management across deeply nested components (used React Context + custom hooks)
• Drag-and-drop interface for workflow building with real-time validation

3. Multi-tenant architecture
• Row Level Security implementation on the frontend (filtering data based on user org/team)
• Complex permission system - different UI states based on role (admin/recruiter/viewer)
• Shared component library across different tenant views with theming support

4. Performance optimization
• Server Components for initial page loads, Client Components for interactive parts
• Implemented streaming SSR for faster perceived performance
• Code splitting and lazy loading for large workflow visualization components
• Optimized re-renders using React.memo and useMemo for expensive computations

5. End-to-end type safety
• Used tRPC for shared type contracts between Next.js frontend and Fastify backend
• Full TypeScript coverage with strict mode
• Zod schemas for runtime validation of AI responses and user inputs

Technical stack: Next.js 14, React 18, TypeScript, tRPC, Tailwind CSS, Vercel AI SDK, Trigger.dev (for async workflows)

The hardest part: Designing UI for AI-driven workflows where you can't predict exactly what will happen. Had to build flexible components that could handle various AI outputs while maintaining a consistent user experience. Also challenging was managing state across long-running async workflows that could take minutes or hours to complete.

Result: Shipped a production-ready platform that handled real hiring workflows autonomously, from job posting to candidate outreach to interview scheduling.
```

---

### Why did you leave your last company? Also, explain the reasons for frequent switches, if any.

```
Yobr (Norway) shut down in December 2025. The company decided to pivot/wind down operations, which is common for early-stage startups. This was outside my control, but I'm grateful for the experience - I learned a ton about building AI systems at scale and working as a founding engineer.

Regarding the pattern of moves:

I graduated 5 months ago (mid-2025), so all my prior roles were internships or part-time work during college:

1. Casecraft (Jul-Oct 2024) - 5-month internship
   • This was a planned internship that ended as scheduled. I was still in my final year of college.
   • Built the full frontend and led JS→TypeScript migration
   • Completed all objectives and received a strong reference

2. Yobr internship → Founding Engineer (Mar-May 2025 intern, May-Dec 2025 full-time)
   • Started as intern, promoted to founding engineer after 1 month due to performance
   • This was my first full-time role after graduation
   • Company shut down after 8 months

3. Andronix & Lumoflo (2019-present)
   • These are my own products that I continue to maintain and build
   • Andronix: $140K revenue, 2.5M+ downloads - still generating revenue
   • Lumoflo: Active development, continuing to build features

What I'm looking for now:
After experiencing startup life (both my own companies and Yobr), I've learned I thrive in early-stage, high-ownership environments. I'm not looking to job-hop - I want to find the right team where I can grow long-term and have significant impact.

The "frequent switches" were actually:
• Natural end of internships (while in college)
• Company shutdown (outside my control)
• Continuous work on my own products (5+ years on Andronix)

I'm looking for a multi-year commitment to the right opportunity, not another short stint. I want to build something meaningful with a team I believe in.
```

---

## INSTRUCTIONS:

1. **Fill in basic info** (name, email, etc.)
2. **Adjust hourly rate** if you want different from $90/hr
3. **Timezone answer** - be honest about your availability
4. **Question 4** - CUSTOMIZE based on what the company actually does. Read their website/job description and make it specific.
5. **Attach resume** - use your latest one
6. **Cover letter** (optional) - probably skip unless they specifically want one

---

## PRO TIPS:

- Keep answers **specific and concrete** - examples > generic statements
- Show you **understand their problem** in Question 4
- Demonstrate **end-to-end thinking** (not just coding)
- Emphasize **remote work success** (Yobr experience)
- Be honest about visa/timezone - better to know upfront than waste time

Good luck! 🚀
