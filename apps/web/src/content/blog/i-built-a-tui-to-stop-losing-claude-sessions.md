---
title: "I Built a TUI to Stop Losing Claude Sessions"
description: "How I solved the problem of managing 10+ Claude Code sessions across different projects with a simple terminal UI, fuzzy search, and tmux integration."
pubDate: "Feb 01 2026"
heroImage: "/images/blogs/claude-launcher.png"
tags: ["Developer Tools", "CLI", "TypeScript", "Terminal", "Ink", "AI Tools"]
category: "Coding"
publish: true
---

**TL;DR**: I built a terminal launcher that lets me fuzzy-search across all my Claude Code sessions and resume any of them instantly. Works with tmux for session grouping. [GitHub →](https://github.com/imprakharshukla/claude-launcher)

---

## The Problem

I run Claude Code in 10-12 project directories simultaneously. All of them in Ghostty split panes.

Then Ghostty crashes. Or I close the wrong window. Or my Mac restarts.

**Poof.** All sessions gone.

Sure, Claude has `--resume`. But that means I have to:

1. `cd` into each project directory
2. Run `claude --resume` to see the list
3. Scroll through messages to find the right conversation
4. Repeat for 10+ projects

That's not a workflow. That's punishment.

I wanted something simpler: type a few characters, find the conversation I need, hit Enter.

---

## What I Built

![Claude Launcher Demo](/images/blogs/claude-launcher-demo.gif)

**Claude Launcher** is a TUI (terminal UI) that:

- **Fuzzy searches** across all Claude session messages
- **Resumes sessions** in tmux (grouped by project) or plain Ghostty
- **Bookmarks** sessions with custom names
- **Forks conversations** - start fresh but with previous context
- **Shows active indicators** - see which projects have running Claude instances

One command: `c`. Type to filter. Enter to resume.

---

## The Stack

- **Ink 5**: React for the terminal. Yes, really. JSX that renders to CLI.
- **uFuzzy**: Blazing fast fuzzy search (~100k ops/sec)
- **Node.js**: Claude stores sessions as JSON files. Easy to parse.
- **tmux**: Groups sessions by project, survives terminal crashes

### Why Ink?

I'd used Ink before and loved it. You get React's component model and hooks, but instead of rendering to the DOM, it renders to the terminal.

```tsx
<Box flexDirection="column" padding={1}>
  <Text bold color="cyan">Claude Sessions</Text>
  <TextInput
    value={query}
    onChange={setQuery}
    placeholder="type to filter..."
  />
  <SessionList sessions={results} selectedIndex={selectedIndex} />
</Box>
```

State management just works. `useState`, `useEffect`, `useMemo` - all there.

### Why uFuzzy over Fuse.js?

Speed. uFuzzy is specifically designed for search-as-you-type scenarios. It handles partial matches, typos, and out-of-order characters without breaking a sweat.

```typescript
import uFuzzy from '@leeoniya/ufuzzy'

const fuzzy = new uFuzzy({})
const haystack = sessions.map(s => `${s.projectName} ${s.lastMessage}`)

// Search
const [idxs, info, order] = fuzzy.search(haystack, query)
```

Returns matches sorted by relevance. Dead simple.

---

## How Sessions Are Stored

Claude Code stores conversation history at:

```
~/.claude/projects/<hash>/sessions/<session-id>.json
```

Each session file contains:

```json
{
  "id": "abc123...",
  "messages": [
    { "role": "user", "content": "Can you refactor the auth module?" },
    { "role": "assistant", "content": "I'll help with that..." }
  ]
}
```

The launcher reads all sessions, extracts the last user message and project name, then builds a searchable index.

```typescript
const getHistory = (): ClaudeSession[] => {
  const projectsPath = join(homedir(), '.claude', 'projects')
  const projects = readdirSync(projectsPath)

  return projects.flatMap(project => {
    const sessionsPath = join(projectsPath, project, 'sessions')
    if (!existsSync(sessionsPath)) return []

    return readdirSync(sessionsPath)
      .filter(f => f.endsWith('.json'))
      .map(file => parseSession(join(sessionsPath, file), project))
  })
}
```

---

## tmux Integration

Here's where it gets good. Instead of opening 10 separate terminal windows, tmux lets you:

1. Group all Claude sessions under one "project" session
2. Split panes within that session
3. **Survive terminal crashes** - tmux sessions persist

When you resume a session:

```typescript
export const launchResume = (sessionId: string, project: string): void => {
  const command = `claude --dangerously-skip-permissions --resume ${sessionId}`

  if (tmuxExists()) {
    const sessionName = getSessionName(project)

    // Create session if it doesn't exist
    try {
      createSession(sessionName, project, command)
    } catch {
      // Session exists - split a new pane
      splitPane(sessionName, project, command)
    }

    // Attach if not already attached
    if (!isSessionAttached(sessionName)) {
      spawnTerminal(['tmux', 'attach', '-t', sessionName])
    }
  } else {
    // No tmux - open directly in terminal
    spawnTerminalDirect(terminal, project, command)
  }
}
```

Press `Enter` on a session → opens in tmux under the project name.
Press `g` → opens directly in Ghostty (no tmux).

---

## Bookmarks

Some sessions I return to constantly. The bookmark feature lets me save them with custom names:

```
★ email-tracker: Working on CrunchBase scraper
★ portfolio: Blog post about Mastra
  lumoflo: OAuth integration
  andronix: Update billing page
```

Bookmarked sessions (`★`) float to the top. Press `s` to save, `x` to remove.

---

## The Fork Feature

Sometimes I want to start fresh but keep the context. The "fork" feature (Ctrl+F):

1. Extracts the last few messages from the session
2. Writes them to a temp file
3. Launches Claude with `-p "$(cat context.txt)"`

New conversation, old context. Perfect for "let's try a different approach."

---

## Installation

```bash
git clone https://github.com/imprakharshukla/claude-launcher.git
cd claude-launcher
pnpm install
pnpm build
```

Add to your shell:

```bash
alias c="/path/to/claude-launcher/bin/c.js"
```

Requirements:
- Node.js 18+
- Ghostty, WezTerm, Kitty, or Alacritty
- tmux (optional but recommended)

---

## What I Learned

**1. Ink is underrated.** Building terminal UIs with React is genuinely pleasant. No ncurses nightmares. Just components.

**2. File-watching matters.** Sessions update while the launcher is open. I added chokidar to watch for changes:

```typescript
const watcher = chokidar.watch(projectsPath, {
  persistent: true,
  depth: 3,
  ignoreInitial: true
})

watcher.on('all', () => {
  setSessions(getHistory())
})
```

**3. tmux is worth learning.** It's one of those tools that seems like overkill until you need it. Then it's indispensable.

---

## Try It

If you use Claude Code daily like I do, give it a shot:

**GitHub**: [github.com/imprakharshukla/claude-launcher](https://github.com/imprakharshukla/claude-launcher)

Open issues if something breaks. PRs welcome.

---

**Links:**
- [Claude Code](https://docs.anthropic.com/claude/docs/claude-code)
- [Ink](https://github.com/vadimdemedes/ink)
- [uFuzzy](https://github.com/leeoniya/uFuzzy)
