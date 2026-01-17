---
title: "Post Sonar"
description: "AI-powered social media research assistant that monitors your domain overnight, surfaces relevant content, and crafts personalized posts matching your voice. Built with Next.js 16, Convex, and multi-agent AI orchestration."
tags: ["AI", "Next.js", "Convex", "Mastra"]
pubDate: "Jan 17 2026"
link: "https://postsonar.com"
# github: "https://github.com/imprakharshukla/social-agent"
heroImage: "/images/projects/postsonar_banner.png"
status: "In Progress"
publish: true
type: "Commercial"
languages: ["TypeScript", "Javascript"]
frameworks: ["NextJS", "React", "Convex", "Mastra", "Trigger.dev"]
rank: 2
---

PostSonar is an AI-powered research assistant that automates content discovery for thought leaders and content creators. It monitors multiple sources in your domain of expertise, intelligently filters for relevance, and generates personalized post ideas matching your unique writing voice.

## The Problem

Content creators and thought leaders spend hours each day researching trends, scanning news feeds, and looking for interesting topics to post about. This research grind is repetitive, time-consuming, and often yields few quality ideas worth sharing.

## The Solution

PostSonar automates the entire research workflow. It monitors your specified domains overnight and delivers curated, actionable content ideas by morning—complete with dual-angle perspectives and supporting research.

## Key Features

### Multi-Source Content Discovery

PostSonar monitors content across multiple sources in parallel:

- **HackerNews** - Trending tech discussions with engagement scoring
- **RSS Feeds** - User-curated feeds from trusted sources
- **Reddit** - Hot posts from relevant subreddits
- **Exa Search** - Neural/semantic web search for niche topics

### Intelligent Filtering Pipeline

A sophisticated 5-step AI pipeline processes all discovered content:

1. **Content Discovery** - Parallel fetching and normalization from all sources
2. **Novelty Check** - Vector embeddings filter out duplicate topics using cosine similarity
3. **Smart Filter** - Claude Opus 4.5 with extended thinking evaluates all articles in a single batch for relevance and platform fit
4. **Outline Generation** - Generates dual for/against angles with hooks and supporting links
5. **Stats Finalization** - Token usage and cost tracking across all AI calls

### Voice Matching

Users provide writing samples for Twitter, LinkedIn, and blog content. The AI analyzes these samples and generates hooks and outlines that match your unique writing style, ensuring authenticity in every post.

### Two-Angle Content Ideas

Each generated idea includes both "for" and "against" perspectives, allowing you to choose which angle resonates with your audience. Each angle includes:

- Attention-grabbing hook
- Key insights and takeaways
- Supporting research links via Exa
- Relevance, popularity, and platform fit scores

### Chat-Based Draft Editing

An AI-powered editor (Claude Opus 4.5) helps refine drafts through conversation:

- Persistent memory for conversation continuity
- Platform-specific guidelines (280 char Twitter limit, LinkedIn long-form)
- Integrated web search for supporting data
- Image generation via fal.ai

## Architecture

### AI Agents (Mastra Framework)

| Agent             | Purpose                                             | Model           |
| ----------------- | --------------------------------------------------- | --------------- |
| Smart Filter      | Batch evaluates articles for relevance/platform fit | Claude Opus 4.5 |
| Hook Generator    | Creates platform-specific compelling angles         | Claude Opus 4.5 |
| Outline Generator | Generates for/against angles with outlines          | GPT-4o-mini     |
| Draft Editor      | Refines posts via chat with memory                  | Claude Opus 4.5 |
| Novelty Checker   | Verifies uniqueness via vector similarity           | Embeddings      |

### Real-Time Backend (Convex)

- Serverless functions with real-time subscriptions
- Native vector index for similarity search (1536 dimensions)
- Instant UI updates without polling

### Scheduled Research (Trigger.dev)

- Runs during user's nighttime based on timezone preference
- Automatic credit deduction and validation
- Wide event logging via Axiom for observability

## Tech Stack

**Frontend:**

- Next.js 16 with Turbopack
- React 19 with Server Components
- TypeScript
- Tailwind CSS 4
- Framer Motion animations
- shadcn/ui with custom brutalist dark theme
- nuqs for URL state management

**Backend:**

- Convex (serverless real-time database)
- Mastra AI framework for agent orchestration
- Trigger.dev for scheduled background jobs
- LibSQL/Turso for Mastra chat memory

**AI/ML:**

- Claude Opus 4.5 via OpenRouter (filtering, draft editing)
- GPT-4o-mini (outline generation)
- Vector embeddings for novelty detection
- Exa Search API for research

**Auth & Billing:**

- Clerk for authentication
- Polar for payments and subscriptions

**Observability:**

- Axiom for distributed tracing and wide events

## Pricing Model

- **Free Tier:** 3 research runs/month
- **Pro Tier:** 30 research runs/month ($15/month)
- Credit packs available for additional runs

## Technical Highlights

- **Single Smart Filter:** Replaced 3 separate LLM scoring calls with one batch evaluation using Claude's extended thinking, improving both quality and cost
- **Vector Novelty Detection:** Cosine similarity with 0.85 threshold prevents repetitive content ideas
- **Cost Tracking:** Per-step token usage tracked with model-specific pricing
- **Timezone-Aware Scheduling:** Research runs during user's sleep hours for morning delivery
