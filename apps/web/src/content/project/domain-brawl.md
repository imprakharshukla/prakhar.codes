---
title: "Domain Brawl"
description: "Describe your startup idea and instantly get creative, available domain names with pricing. AI brainstorms names in real-time, streams results as they're generated, checks availability via Vercel Registrar API, and lets you buy from your preferred registrar — all in a single conversational flow."
tags: ["AI", "Domains", "Mastra", "Next.js"]
pubDate: "Feb 23 2026"
link: "https://domains.prakhar.codes/"
heroImage: "/images/projects/domain_brawl_banner.png"
video: "https://youtu.be/zs4Pqp_EhFA"
status: "Completed"
publish: true
type: "Personal"
languages: ["TypeScript"]
frameworks: ["NextJS", "React", "Mastra", "Vercel AI SDK"]
rank: 5
---

## What is Domain Brawl?

Describe your idea and get available domains in seconds. Domain Brawl uses a dual-model AI architecture — Claude Sonnet for orchestration and Minimax M2.5 for creative brainstorming — to generate domain names in real-time. Names stream to the UI as they're brainstormed (before availability checks even complete), giving a live, responsive feel.

## How it works

1. Enter a project description — "a fitness app for dog owners"
2. The AI agent brainstorms 30+ creative domain names using techniques like portmanteaus, vowel removal, TLD hacks (deli.sh, crea.te), and clever prefixes/suffixes
3. Names stream to the UI in real-time via Server-Sent Events as they're generated
4. Bulk availability checking runs in parallel via Vercel Registrar API (up to 50 at a time)
5. Available domains appear with a green status dot — prices fetched on-demand when you click
6. Refine with follow-up prompts: "try .ai domains", "shorter names", "more playful"

## Key Features

### Streaming Real-Time UX
Domains appear on screen as the AI brainstorms them, before availability checks complete. A cross-process SSE architecture (Upstash Redis in production, local pub/sub in dev) broadcasts domains-in-flight from the Mastra tool to the UI with animated entrance transitions.

### Multi-Turn Refinement
Each round appends to existing results. Natural language steering lets you guide the AI — "more with .io", "shorter names", "something techy". Results are grouped by round with visual separators.

### TLD Filtering
Horizontally scrollable filter chips with live counts. Toggle multiple TLDs on/off (.com, .dev, .io, .ai, .sh, .app, and 40+ more). Client-side filtering, no re-fetch needed.

### Social Handle Checking
Click the @ icon on any domain card to check username availability across 7 platforms — GitHub, Twitter, Instagram, YouTube, TikTok, Reddit, and LinkedIn. Powered by a custom Sherlock API microservice (Hono + Docker).

### Buy Flow
One-click links to register domains through Namecheap, Cloudflare, Vercel Domains, or Porkbun — each opens with the domain pre-filled.

### Save & Bookmark
Heart toggle on each card persists to localStorage. A sticky bar at the bottom shows all saved domains with quick re-buy access.

## Architecture

- **Orchestration Agent**: Claude Sonnet 4.6 via Mastra framework — manages conversation, calls tools, filters results
- **Creative Brainstorming**: Minimax M2.5 Nitro for domain name generation (cost-optimized for creative tasks)
- **Availability**: Vercel Registrar API with parallel bulk checking
- **Memory**: Mastra Memory with LibSQL/Turso for multi-turn conversation persistence
- **Rate Limiting**: Upstash Redis — 20 chat sessions/hr, 200 price checks/hr, 40 handle checks/hr
- **Real-time**: SSE with Redis pub/sub for cross-process domain state broadcasting
