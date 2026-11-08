---
title: "Runa"
description: "Bookmark manager that saves links, notes and files from anywhere, enriches them with AI, and makes them searchable by meaning, with a REST API and an MCP server for agents."
tags: ["AI", "Bookmarks", "Search", "MCP"]
pubDate: "Mar 24 2026"
link: "https://onruna.com"
heroImage: "/images/projects/ascii/runa.png"
status: "Completed"
publish: true
type: "Personal"
languages: ["TypeScript"]
frameworks: ["NextJS", "Convex", "Elysia", "Meilisearch", "Mastra"]
rank: 4
---

## What is Runa?

Runa is a place to throw everything you want to keep: links, notes, files, tweets, videos. You save from the web app, a Chrome extension, an iOS Shortcut, email, X bookmark sync or a REST API. Runa works out what each thing is, enriches it, and lets you find it later by what it means, not just the words in it.

## Features

- **Save from anywhere:** web app, Chrome MV3 extension, iOS Shortcut, email attachments, X bookmark sync, imports from Chrome and Arc, and a public REST API with API keys.
- **Enrichment per link type:** articles, tweets, YouTube, Reddit and Instagram reels each get their own enricher. Reels are transcribed with Whisper, so you can search what was said in them.
- **Search by meaning:** Meilisearch combines keyword and embedding search, and an AI chat answers questions over your library.
- **Built for agents:** an MCP server and an OpenClaw skill let your AI agents save to and search your library.
- **Watchlist:** movies and shows mentioned in saved items land in a watchlist via TMDB.

## Under the hood

- Turborepo on Bun: Next.js + Convex web app, an Elysia API on Railway (a Docker image with yt-dlp and ffmpeg), the Chrome extension, and shared MCP and enricher packages
- Uploads on Cloudflare R2, Upstash rate limiting, Polar credit packs with credits reserved before every AI request
- Enrichment failures are tracked and reported, so broken link types get fixed fast
