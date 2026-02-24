---
title: "SVG Weave"
description: "AI-powered SVG animation studio with a node-based graph editor for non-linear creative workflows. Upload any SVG, describe the motion you want, and chain renders in a visual node graph. Branch, fork, and explore multiple animation directions — then inspect every keyframe in a timeline editor."
tags: ["AI", "SVG", "Animation", "Node Graph", "Design Tool"]
pubDate: "Feb 23 2026"
link: "https://svgweave.com/"
heroImage: "/images/projects/svgweave_banner.png"
video: "https://www.youtube.com/watch?v=-oQ03YIvrDg"
status: "Completed"
publish: true
type: "Personal"
languages: ["TypeScript"]
frameworks: ["NextJS", "React", "React Flow", "Zustand", "Convex"]
rank: 4
---

## What is SVG Weave?

SVG Weave is an AI-powered SVG animation studio built around a **node-based graph editor**. Unlike linear animation tools, the visual graph workflow lets you branch, fork, and explore multiple animation directions at once — then chain renders together for iterative refinement. AI generates production-ready CSS @keyframes animations, streamed in real-time.

## Node-Based Graph Editor

The core of SVG Weave is a visual workflow system built with React Flow. Three node types connect together to form animation pipelines:

- **SVG Input Node** — Upload .svg files via drag-and-drop, paste SVG code directly, or generate new SVGs from a text prompt
- **Prompt Node** — Describe animation changes in natural language. Takes two optional inputs: a primary SVG and a target SVG for state transitions
- **Render Node** — Executes the animation via AI, streaming SVG output in real-time with live status tracking

Nodes connect in a directed graph: SVG Input → Prompt → Render → (loop back to Prompt for iteration). One SVG can feed multiple prompts for **parallel exploration**, and one render can chain into multiple prompts for **animation layering** — add a blink, then a speech bubble, then expressions, each building on the last.

## State Transition Animations

Provide an initial and final SVG, and the AI generates smooth animated transitions between the two states. It morphs shapes, colors, positions, and sizes automatically using CSS animations with transform, opacity, clip-path, and stroke-dashoffset.

## Timeline Editor

A full animation timeline parses all CSS @keyframes and SMIL animations from generated SVGs:

- **Visual animation tracks** for every animated element, showing element IDs, animation names, durations, delays, and iteration counts
- **Playhead scrubbing** to preview animations at any point in time
- **Playback controls** — play, pause, restart, speed control (0.25x to 2x)
- **Track-level element selection** with highlighting on the canvas

## Element-Level Editing

Click any element on the canvas to select it with a visual highlight. The AI can then target your selection precisely — change colors, timing, or motion on individual paths and groups without affecting the rest of the SVG.

## AI Generation

Powered by Gemini via OpenRouter with two generation modes:

- **Style-only injection** — When modifying an existing SVG, outputs only a `<style>` block with @keyframes and animation rules targeting existing element IDs. Lighter weight, preserves SVG structure.
- **Full SVG generation** — For new animations or structural changes. Complete valid SVG with CSS animations, streamed progressively with real-time preview.

## Export

Multiple export formats: SVG, PNG, GIF, MP4, Lottie JSON, and React component code. Animations are saved to user accounts with shareable links.
