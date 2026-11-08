---
title: "Zeni"
description: "Personal finance agent: syncs bank accounts over open banking, categorizes transactions, tracks budgets and savings goals, and plans each payday's transfers. Chat with it on the web or Discord."
tags: ["AI Agents", "Finance", "Open Banking"]
pubDate: "Oct 03 2026"
heroImage: "/images/projects/ascii/zeni.png"
status: "In Progress"
publish: true
type: "Personal"
languages: ["TypeScript"]
frameworks: ["NextJS", "Drizzle", "Turso", "AI SDK", "Playwright"]
rank: 6
---

## What is Zeni?

Zeni is a finance agent I built for myself. It pulls transactions from my European bank accounts every day over open banking, sorts them into categories, keeps the budget and savings goals up to date, and tells me what to move where on payday. I can ask it things in a Next.js dashboard or on Discord, and it sends a short daily and weekly check-in.

## How it works

- **Daily sync:** transactions come in through the Enable Banking API, get de-duplicated, and internal transfers between my own accounts are detected and ignored.
- **Categorization that learns:** known merchants match fixed rules; the rest go to a model. Anything under 0.7 confidence lands in a review queue, and every manual fix becomes a new rule.
- **Goal planner:** a month-by-month planner spreads income across goals with deadlines and priorities, keeps an emergency-fund floor, explains its trade-offs, runs what-if scenarios and builds a payday transfer checklist.
- **One agent, many surfaces:** about 60 agent tools, with approval prompts for anything that changes data, on the web and on Discord.

## Engineering

- pnpm monorepo of small packages (banking, categorize, budget, sync, db, core); a boundary check forces every read and write through one core package
- A `verify` gate before every deploy: typecheck, invariant tests ("reads never write", "money is never created or lost", undoable ticks), parity tests that run the same scenario through server actions, agent tools and Discord and expect an identical database, then Playwright e2e on a separate test database
- Money stored as integer cents, masked account numbers, passkey login, and a rate-limit guard on unattended bank calls
