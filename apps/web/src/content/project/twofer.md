---
title: "Twofer"
description: "Multi-agent design debate CLI. Give it a prompt, and multiple AI agents debate the architecture in parallel, then converge on a battle-tested spec — all streamed live to a real-time web UI. Zero API costs using your existing Claude Pro or ChatGPT Plus subscription."
tags: ["AI", "CLI", "Multi-Agent", "Architecture"]
pubDate: "Feb 23 2026"
link: "https://github.com/imprakharshukla/twofer"
github: "https://github.com/imprakharshukla/twofer"
heroImage: "/images/projects/twofer_banner.png"
video: "https://github.com/user-attachments/assets/8dfe0463-fd38-4b6a-a1c5-5d8f6e232458"
status: "Completed"
publish: true
type: "Open Source"
languages: ["TypeScript"]
frameworks: ["NextJS", "React", "OpenCode SDK", "WebSockets"]
rank: 6
---

## What is Twofer?

Give it a prompt, and multiple AI agents will debate the architecture, then converge on a battle-tested spec. Agents explore your actual codebase before designing, run in parallel, cross-review each other section-by-section, and only stop when they reach unanimous consensus for 2 consecutive rounds.

## How it works

1. **Codebase Scanning** — Before the debate begins, agents automatically scan your project (up to 30KB of context). They read config files, build directory trees, and identify key source files like entry points, schemas, routes, and models. Agents design around your existing patterns, not in a vacuum.

2. **Parallel Debate** — All agents run simultaneously via `Promise.allSettled`, each creating an isolated OpenCode session with read-only codebase tools (read, glob, grep, codesearch). Each agent produces a full 9-section spec covering Architecture, Data Model, API Design, Auth, Frontend, State Management, Deployment, Security, and Testing.

3. **Cross-Review & Convergence** — In subsequent rounds, each agent receives all OTHER agents' full proposals. They critique each section with explicit verdicts: approve, reject, or suggest changes. The debate ends when ALL agents approve unanimously for 2 consecutive rounds, or the max round limit is reached.

4. **Live Web UI** — Everything streams in real-time to a Next.js dashboard via WebSocket. Per-agent panels show live state transitions (THINKING → EXPLORING → RESPONDING) with a KB counter as responses stream in. Round-by-round navigation, consensus view for agreed sections, and diff view for disputed ones.

## Key Features

- **Zero API Cost** — Uses your existing Claude Pro/Max or ChatGPT Plus/Pro subscription via OpenCode SDK. No per-token billing. Credentials cached locally after first OAuth.
- **Provider Agnostic** — Works with Anthropic, OpenAI, Google, and OpenRouter (200+ models). Auto-detects available models from all connected providers.
- **SOTA Mode** — `--sota` flag picks the top 4 models and runs them simultaneously for maximum debate quality.
- **Codebase-Aware** — Agents actively use read-only tools to explore your code before making proposals. They respect your existing tech stack, patterns, and conventions.
- **Structured Output** — Every response is Zod-validated JSON with sections, verdicts, reasoning, and change requests. Built-in normalization handles varied LLM response formats and coerces verdict strings automatically.
- **Headless Mode** — `--no-ui -o spec.md` for CI/scripts. Auto-exports and exits when debate completes.
- **Export** — Consensus markdown with agreed sections consolidated, disputed sections showing all agent perspectives side-by-side, and full debate history with per-round verdicts.

## CLI Usage

```bash
twofer "build a real-time chat app"                          # basic
twofer "analytics dashboard" --stack "Next.js, Postgres"     # with stack
twofer "collaborative editor" --sota                         # 4 top models
twofer prompt -a anthropic/claude-opus-4-6 -a openai/gpt-5   # custom agents
twofer prompt --no-ui -o spec.md                             # headless CI
```
