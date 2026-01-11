---
title: "How to Build Products That People Actually Use"
description: "What I learned from building Andronix - 2.5M downloads, $140K revenue, and still running 6 years later."
pubDate: "Jan 10 2026"
heroImage: "/images/blogs/andronix_cloudflare.png"
tags: ["Product", "Startup", "Indie Hacking", "Building", "Advice"]
category: "Advice"
publish: true
---

![PostHog Analytics showing 81.7K visitors, 8m 55s session](/images/blogs/andronix_posthog.png)

This is Andronix - an app I built in high school. 2.5M downloads, $140K revenue, still running 6 years later.

I'm not writing this to flex. I'm writing this because when I started, I thought I needed:

- Perfect tech stack
- Microservices architecture
- Sophisticated monitoring
- A team

I had none of that. Just a $5/month server and way too much free time.

Here's what actually mattered.

---

## 1. Just Build, Don't Overthink

I wanted to run Linux on Android. Every solution sucked. I didn't think "there's already Termux, why build another one?" - I just built it.

Uber exists. Yet Ola, Lyft, and Grab exist too. The market is never "too crowded" if you solve the problem better.

Just build your version. You'll find your users.

---

## 2. Don't Over-Engineer (I'm Serious)

I've rewritten Andronix's backend 3 times. Was it necessary? No. Users never complained about my "messy" database schema. They complained about bugs and slow downloads.

Optimize for what users feel, not what looks good in architecture diagrams.

Don't add Redis until you need it. Don't split into microservices until your monolith can't handle the load.

---

## 3. Start with a Monolith, Seriously

Andronix started as one massive Node.js server. Scaled to 1.86M requests/month just fine. I only split things when mobile and web APIs had different scaling needs.

Unless you're a 300-person org, monoliths work. "Microservices are cool for blog posts. Monoliths are better for shipping."

---

## 4. Analytics and Logging (Or Don't, Just Start)

I didn't add analytics for 6 months. When I did: Cloudflare (free), Firebase (free), console.log for errors. That's it.

Check out [loggingsucks.com](https://loggingsucks.com/) - "Most logging is overkill." They're right. Perfect monitoring won't make your product better. Shipping will.

---

## 5. Users Pay for Solutions, Not Clean Code

![PostHog Analytics showing 81.7K visitors, 8m 55s session duration](/images/blogs/andronix_posthog.png)

This guy [@jackfriks](https://x.com/jackfriks) made $15K MRR without knowing what database indexes are. Users never see your code. They see: "Does it work? Does it solve my problem?"

I've seen beautiful codebases with zero users. Terrible codebases printing money. Code quality matters for maintainability, not revenue. Ship something that works. Refactor when it hurts.

---

## 6. It Probably Won't Work (And That's Okay)

Most products fail. Andronix could've been one of them. A lot was just right place, right time: Android getting popular, Linux enthusiasts existed, no good solution yet.

You can do everything "right" and still fail. But it's a new day tomorrow. A new thing to build. That's the fun.

"The goal isn't to hit a home run on your first try. The goal is to keep swinging."

---

## What Andronix Taught Me

Start simple. Ship fast. Listen to users. Scale when you need to. Don't chase perfect code - chase users who pay. Keep going.

---

## The Stats (Because People Ask)

- 2.5M+ downloads
- $140K+ revenue
- #1 on Google Play for "Linux"
- 1.86M requests/month (last 30 days)
- 81.7K visitors (last 6 months)
- 8m 55s average session duration
- Still running (haven't touched it in a year)

Built in high school. $5/month server. No team. No fancy setup.

You don't need perfect conditions. You just need to start.

---

**Links:**

- Andronix: [andronix.app](https://andronix.app)
- What I'm building now: [prakhar.codes](https://prakhar.codes)
