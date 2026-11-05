---
title: "The Agentic System of an Applied AI Engineer"
description: "A guide to running coding agents across several machines with one model gateway, one tool gateway and one skills repo."
pubDate: "Nov 05 2026"
heroImage: "/images/blogs/agentic-system/thumb-option-1-conductor.jpg"
tags: ["AI Agents", "T3 Code", "Claude Code", "MCP", "Developer Tools"]
category: "AI"
publish: true
---
I work with coding agents all day, on work and on personal projects, across two machines. This is how my setup works, so you can build something similar. The goal is simple: an agent on any machine picks up the right account, the right tools and the right skills for the folder it's in, and I can steer all of it from one place.

![The whole system: the T3 Code app, two linked machines, and the three gateways every agent uses](/images/blogs/agentic-system/post-01-system.jpg)

> Want your own agent to build this for you? Give it [this setup guide](/llms/agentic-system-setup.md) along with this post.

There are four pieces: a cockpit, a model gateway, a tool gateway and a skills repo.

## The cockpit: T3 Code on every machine

Before T3 Code I lived in herdr, a terminal multiplexer built for coding agents. I was a heavy user, with a pile of custom plugins and often 50 to 60 agents open at once. [T3 Code](https://github.com/pingdotgg/t3code) is where I talk to agents now.

What I like most is that it's organized by default. It ships good defaults, and every one of them can be changed. I have strong feelings about good defaults: they're the difference between a tool that's ready on a new machine and one that needs an afternoon of config first. Each thread gets its own worktree, so several agents can work in the same repo without stepping on each other.

The attention to detail is the other reason: the diffs, the sidebars, a built-in browser that can import cookies from your own browser, a mobile app that's actually good. Everything feels thought through. A lot of that is down to Julius, who builds it. The app is almost perfect, and I don't say that about much software.

### Set up

1. **Run a T3 server on each machine.** `t3 service install` registers it as a background service, so it keeps running with no terminal open. Agents, terminals and files stay on the machine they belong to.
2. **Connect the app to all of them.** T3 Connect does this through an account. On a private network you pair each device with a one-time link instead. I use Tailscale HTTPS, which T3 supports directly, so every machine has a stable address. A machine can have several routes (LAN, Tailscale, a VPN), and T3 picks up new LAN addresses on its own.
3. **Use the web app when you're away from the desktop.** The same server is available in a browser, and the mobile app sends a push notification when an agent finishes, fails or needs approval.

Projects are grouped by repository, not by machine. A repo checked out on both machines shows up once in the sidebar, with threads from both underneath.

### Link the machines

Turn on **Settings → Labs → Linked environments** on both machines, then choose **Link** under **Settings → Environments → Linked environments**. Now an agent on one machine can launch, message, wait on and stop threads on the other, answer their questions, and manage their queues and scheduled tasks.

In practice I type "delegate this to my other machine" into a thread, and the work runs there as an ordinary thread. The original thread wakes up when it's done. Each link has an access level that caps what the remote agent may do; below full access, it can only touch threads it started. Links last 30 days.

### Balance the load

With two or more machines connected, **Settings → Environments → Load balancing** lets T3 pick where each new thread runs, based on free CPU and memory. Each machine gets a preference: Normal, Prefer, Less often or Manual only. Existing threads stay where they started.

### Features worth turning on

- **Worktree cleanup.** Threads settle when their PR merges or after a few idle days, and T3 can delete their worktrees a set number of days later. With a worktree per thread, this keeps the disk from filling up.
- **Idle compaction.** An idle Claude thread gets compacted just before its prompt cache expires, so coming back hours later doesn't cost a full reload.
- **Portable handoffs.** A thread can switch to another provider, and T3 carries a budgeted slice of the conversation across.
- **Guest links.** Someone can follow one thread in their browser and suggest messages, which you approve before they run.
- **Devices.** A side panel streams an iOS Simulator or Android Emulator next to the thread, and both you and the agent can tap it.
- **Its own MCP server.** Every T3 server has an MCP endpoint, so agents T3 didn't start can drive it. This becomes important below.

## The model gateway: many Claude accounts, one endpoint

Each Claude subscription has a 5-hour limit and a weekly limit. With several accounts, switching logins by hand on each machine doesn't scale. Instead, all my Claude traffic goes through [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI), which I host myself. It holds the logins for every account and exposes one Anthropic-compatible API.

Routing is fill-first with session affinity: a session sticks to one account, and new sessions go to the next account with room. When an account is nearly drained, one call to the management API disables it, and another turns it back on after the reset.

### Set up

Point Claude Code at the proxy with two settings in the user-level config:

```json
{
  "env": { "ANTHROPIC_BASE_URL": "https://<your-proxy>" },
  "apiKeyHelper": "~/.config/cliproxy/claude-key.sh"
}
```

The helper script reads the proxy key from a local secrets file, so the key never sits in a config file or a repo. Give T3's Claude provider the same two values as environment variables. Every Claude session on every machine, in a terminal or in T3, now draws from the same pool.

One thing to know: when Claude Code authenticates with a key instead of a claude.ai login, it turns off the claude.ai connectors. That's fine here, because every tool goes through the tool gateway.

### See the limits

A pooled gateway hides which account you're using, so I made it visible in two places. Claude Code's status line runs a small script that reads the proxy's management API: the account currently filling, its 5-hour and weekly usage, and every other account's weekly usage. A native macOS menu bar app, built with stock SwiftUI by an agent in a T3 thread, shows one Battery-style cell per account in use, with the 5-hour bar on top and the weekly bar below.

## The tool gateway: one MCP server for every service

One MCP server per service, configured on every machine and in every agent, each with its own credentials, stops scaling after a handful. I run one instead: [Executor](https://executor.sh), self-hosted. Chat, email, calendar, issue tracking, docs, DNS and hosting, error tracking, web search, library docs and code search all sit behind it. Executor stores the credentials and attaches them inside its own process, so the agent never sees a token. Write actions can require approval.

### Let the folder pick the account

![Work repos carry a work token, everything else falls back to the personal token, and both reach the same Executor](/images/blogs/agentic-system/post-02-folder-picks-account.jpg)

I have work and personal accounts for several of the same services. Agents shouldn't have to choose, and shouldn't be able to choose wrong, so the account follows the folder:

- Work repositories, their worktrees and review checkouts get a project-level MCP entry with the work token. Claude Code keeps it in its own config, keyed by folder, so nothing is committed to the repo.
- Everything else uses the user-level config with the personal token.
- Both point at the same Executor URL. Executor answers with the connections that token can see.

The only secret an agent's config holds is this Executor token, which picks the account. The credentials for the services themselves never leave Executor.

An agent in a work repo asked to "send the team an update" can only reach work chat. An agent in a personal project asked for "my latest email" only sees personal inboxes. There's no switch to forget.

### Make the tools visible

Agents only use tools they can see by name. A model won't go looking for a calendar inside a tool called `search`. Two settings fix this:

1. **Connect with per-service tools.** In its default mode, Executor can list every connected service as its own tool (`search_gmail`, `search_calendar` and so on) and include the live inventory in its main tool's description. The service names are in the agent's context from the first message. Avoid passthrough mode for this: it shows only generic search and invoke tools.
2. **Say it once, globally.** A short block in the user-level `CLAUDE.md` and `AGENTS.md` lists the services and states the rule: messages, email and calendar always go through Executor. Turn off any other plugin for the same service, so there's exactly one path.

### Reach your machines

Executor runs in the cloud, but T3 runs on my machines. Executor reaches them over Tailscale: the hosting platform's containers have no network device, so Tailscale runs in userspace as a sidecar container, and Executor sends its outbound traffic through the sidecar's HTTP proxy.

## The loop: T3 inside Executor, Executor inside T3

This is the part I like most.

![The loop: any Claude session reaches Executor, which reaches every machine's threads through T3's MCP, while T3's agents use Executor as their MCP](/images/blogs/agentic-system/post-03-loop.jpg)

**Add T3 to Executor.** Every T3 server has an OAuth-protected MCP endpoint with read and operate scopes; **Settings → Environments → Copy MCP URL** gives you the address. Add it to Executor as an integration. With Linked environments on, that one connection lists and drives threads on every linked machine.

**Use Executor in T3.** Executor is the MCP server for every agent T3 runs. So a thread can check on another thread, read what it did, or start one on another machine, through the same gateway it uses for email.

Together, this means any Claude session anywhere can manage the whole fleet, including Claude Code's voice mode. I can ask out loud "what's running on my work machine?", "what did the thread fixing the login bug end up doing?" or "tell the review thread to rebase". The request goes from Claude Code to Executor to T3 to the right machine. Reads run immediately; launching, messaging or stopping a thread waits for my approval in Executor. It also gives agents memory across threads: one agent can read another thread's full history before it starts.

## Skills: one private repo, linked per project

Skills come from three places. Team skills live in the team's repository and get reviewed like code. Installed packs come from installers that track their own updates. Keep both where they are. Your own skills are the ones to organize: some are for every project, some for one repo only, and some of those repos are shared with people who shouldn't see your personal tooling.

### Set up

Put your own skills in one private repo:

![The skills repo and the session hook that links global and per-project skills into every clone and worktree](/images/blogs/agentic-system/post-04-skills.jpg)

```
agent-skills/
  global/              linked for every project
  <project>/           linked only into that project
  projects.json        { "<project>": ["owner/repo", "owner/*"] }
  bin/skills-hook.py
```

Then add two Claude Code hooks to `~/.claude/settings.json`:

```json
"hooks": {
  "SessionStart": [{ "hooks": [{ "type": "command", "command": "python3 ~/agent-skills/bin/skills-hook.py start" }] }],
  "SessionEnd":   [{ "hooks": [{ "type": "command", "command": "python3 ~/agent-skills/bin/skills-hook.py end" }] }]
}
```

On session start, the hook links `global/` into the user-level skill folders for Claude Code and Codex. It asks git for the current repo's remote, matches it against `projects.json`, and links that project's skills into the repo's `.claude/skills` and `.agents/skills`. The links are hidden with `.git/info/exclude`, never `.gitignore`, so nothing shows up in a teammate's diff. Then it pulls the repo in the background. On session end, it commits and pushes any skill edits.

### Why it works well

- **Any clone, any worktree.** Matching on the git remote instead of a folder path means every checkout of a repo gets its skills, which matters when T3 makes a fresh worktree for nearly every thread.
- **One real copy.** The links point back into the skills repo, so editing a skill from inside any project edits the original, and the next session on the other machine pulls it.
- **Private in shared repos.** Teammates never see your personal skills.

One detail: Claude Code reads its skill list before the start hook runs. In a brand-new checkout, the hook gives the first session a short note naming each new skill and its `SKILL.md` path. From the next session on, they're ordinary skills.

## What this gets you

- **The folder decides the account,** for both models and tools, so agents can't act as the wrong identity.
- **Agents know what they can reach,** because every service shows up by name.
- **Skills follow the repo** to every clone, worktree and machine.
- **One place to steer everything:** the T3 app, the phone, or any Claude session, including a spoken one.

None of the pieces is new on its own: a model proxy, an MCP gateway, a skills folder, an agent app that works over the network. The value is in wiring them together.
