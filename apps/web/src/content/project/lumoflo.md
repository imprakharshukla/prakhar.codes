---
title: "Lumoflo"
description: "Multi-tenant commerce platform I built for Instagram sellers. It no longer takes new stores; the whole stack now runs one live shop, svveetpea.com, with Delhivery shipping, voice-to-listing AI and an MCP agent that runs the store from Claude."
tags: ["E-Commerce", "AI Agents", "MCP", "Next.js"]
pubDate: "Apr 04 2024"
updatedDate: "Nov 08 2026"
link: "https://svveetpea.com"
heroImage: "/images/projects/ascii/lumoflo.png"
status: "In Progress"
publish: true
type: "Commercial"
languages: ["TypeScript"]
frameworks: ["NextJS", "Express", "Drizzle", "Trigger.dev"]
screenshots:
  - "/images/projects/screenshots/lumoflo/lumoflo_ss_selling.png"
  - "/images/projects/screenshots/lumoflo/lumoflo_ss_billing.png"
  - "/images/projects/screenshots/lumoflo/lumoflo_ss_orders.png"
  - "/images/projects/screenshots/lumoflo/lumoflo_ss_product.png"
rank: 2
---

## What happened to Lumoflo?

Lumoflo started in 2023 as Gramflow, a tool for Instagram-first clothing sellers in India, and became Lumoflo in May 2024: a multi-tenant commerce platform with a storefront per store, a merchant dashboard, Razorpay payouts and subscriptions, and an Expo mobile app. I built all of it alone.

It doesn't take new stores anymore. In October 2026 I cut it down to a single tenant, and the whole stack now runs one real shop: **[svveetpea.com](https://svveetpea.com)**, a store selling one-of-a-kind clothing pieces. I removed store onboarding, billing, payouts, the mobile app and the separate search indexer, then rebuilt the shop around pieces that exist exactly once. It went live on October 18, 2026 and gets new work every week (418 commits since October).

## What runs svveetpea.com

### A store agent over MCP
The owner runs the shop from Claude or ChatGPT. They sign into the admin over OAuth, and the agent gets 58 tools: create pieces from dictation and photos, pack orders, book pickups, print labels and pull analytics.

### Voice to listing
Describe a piece by voice or text and AI fills in the whole product form. It flags the fields it wasn't sure about so the owner checks those first.

### Delhivery shipping, end to end
Auto-booking, print-ready 4x6 and A4 labels, pickup booking, a wallet-balance guard, and returns for any delivered parcel by its AWB, even ones booked by hand. Product pages and checkout show a delivery date estimate: Delhivery's transit days plus the store's packing days, skipping Sundays.

### Holds for one-of-one pieces
Every piece is unique, so Buy now holds it with a countdown on the server's clock. The product page flips live when someone else holds it, payment webhooks finalize idempotently, a sold piece drops out of every other bag, and back-in-stock emails go out on restock.

### Live dashboard
Today's sales, the shopper funnel, live holds and who's on the site, with web push to the owner's phone. The admin installs as a PWA, and team roles come with email invites.

### Fast static storefront
Pages are prerendered and refreshed by tag on every backend write, on Next.js 16 with Turbopack. The shop's font payload went from 412KB to about 170KB.

## Tech stack

- **Apps:** Next.js 16 / React 19 storefront and admin in one app, Express backend, Trigger.dev v4 for crons, emails, the Razorpay webhook and DB backups
- **Data:** Postgres with Drizzle (moved from Prisma), Postgres full-text search with AI search tags, ts-rest typed API contract, Turborepo + pnpm
- **Auth:** Better Auth (email codes, passkeys, and an OAuth provider for MCP)
- **Integrations:** Razorpay, Delhivery API, Resend + react-email, web push, self-hosted Umami, MCP SDK
- **AI:** Vercel AI SDK through AI Gateway (Gemini Flash transcribes, Claude Haiku fills the form)
- **Infra:** Railway, Vercel, Cloudflare (DNS, R2, Images, Turnstile), Doppler, Sentry, GitHub Actions, Playwright e2e including 9 checkout scenarios against Razorpay test mode
