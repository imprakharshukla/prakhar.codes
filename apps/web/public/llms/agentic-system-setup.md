# Agentic system setup guide (for coding agents)

> This file is meant to be handed to a coding agent (Claude Code, Codex, or similar) together with the article "The Agentic System of an Applied AI Engineer". It describes the architecture in enough detail to rebuild it for a different person. Everything here is generic: replace every `<placeholder>` with the user's own values, which you get by asking.

You are setting up a multi-machine coding-agent system for the user. Work through the phases in order. Each phase ends with a **Done when** check; do not start the next phase until it passes. Ask before anything that costs money, creates accounts, changes system or security settings, or touches credentials. The user signs in and pastes secrets themselves; you never type or print a secret.

---

## 1. Architecture

Four components, used by every agent on every machine:

| Component | Role | Implementation in the reference setup |
|---|---|---|
| Cockpit | Where the human talks to agents. One app, many machines. Threads get their own git worktree. | T3 Code: a server on each machine, one desktop/web/mobile client |
| Model gateway | One API endpoint in front of several model subscriptions. Routes sessions across accounts. | CLIProxyAPI, self-hosted |
| Tool gateway | One MCP server in front of every third-party service. Holds all credentials. | Executor, self-hosted |
| Skills repo | The user's own agent skills, global and per project, synced across machines. | Private git repo + a Claude Code SessionStart/SessionEnd hook |

Data flows:

```
human ──▶ cockpit app ──▶ T3 server (machine A) ◀── linked ──▶ T3 server (machine B)
                              │                                    │
                     agents on each machine use:
                              ├── model gateway  (ANTHROPIC_BASE_URL + apiKeyHelper)
                              ├── tool gateway   (one MCP server; token chosen by folder)
                              └── skills repo    (linked into ~/.claude/skills, ~/.agents/skills, and per repo)

tool gateway ──▶ T3 server MCP (one connection; reaches every linked machine)
```

Design principles to preserve while adapting:

1. **The folder decides the identity.** Which account an agent uses (for models and for tools) follows the directory it runs in, never a manual switch.
2. **Agents only use tools they can see by name.** Service names must appear in the agent's context from the first message.
3. **One path per capability.** If the tool gateway provides chat or email, disable other plugins/connectors for the same service.
4. **Secrets live in one place per machine** (a local secrets file or password manager) and are read by helpers at runtime. Never write a secret into a config file, repo, transcript, or chat.
5. **Shared repos stay clean.** Personal tooling inside a team repository is hidden with `.git/info/exclude`, never `.gitignore`.

---

## 2. Interview: ask these before you start

Ask in small batches. Record the answers in a local, untracked notes file (for example `~/agent-setup-notes.md`) so later phases can read them. Do not store secrets in it.

**Machines**
- How many machines will run agents? OS of each (macOS, Linux)? Which one is the primary?
- Are they on one private network already (Tailscale, another VPN, LAN only)? Will any machine be reached from outside that network (a phone on cellular, a cloud service)?
- Is any machine a work-managed device with policies about what may run on it or connect to it?

**Agents and models**
- Which agent CLIs do they use: Claude Code, Codex, others? Which do they want inside the cockpit?
- How many model subscriptions or accounts do they have, and which are work vs personal?
- Policy question: may personal-project traffic use work accounts, and vice versa? (If not, plan two pools; see 4.6.)
- Do they rely on claude.ai connectors in Claude Code today? Pointing Claude Code at a gateway with key auth turns those off.

**Hosting**
- Where should the two gateways run: a container host they already use, a small VPS, or one of their own machines? It needs a persistent volume and HTTPS.
- Do they have a domain for the gateways, or will they use the host's default domain?
- Do they have a password manager the agent may reference for storing the gateway secrets?

**Services for the tool gateway**
- Which services should agents reach (chat, email, calendar, issue tracker, docs, hosting/DNS, error tracking, search)? For each: work, personal, or both?
- Are there employer rules about work data passing through personal infrastructure? If yes, stop and agree on a design (for example a separate work-owned gateway) before connecting any work account.
- Which actions should require approval (sending messages, creating events, deploys)?

**Skills**
- Where do their own skills live today? Which are global, which belong to a single repo?
- Which repos are shared with other people (so personal skills must stay hidden there)?
- Which skills came from installers or team repos (these stay where they are)?

**Done when** every question has an answer or an explicit "not applicable", and the user has confirmed the plan in one short summary you wrote back.

---

## 3. Phase A: the cockpit (T3 Code)

### Steps
1. Install T3 Code on each machine (desktop app or CLI per its install docs).
2. Run the server as a background service on every machine that hosts agents: `t3 service install`. Check with `t3 service status`.
3. Choose how clients reach each machine:
   - **T3 Connect** (account-based, works from anywhere, required for mobile push notifications), or
   - **private network pairing**: create a one-time pairing link from the host and open it on the client. With Tailscale, expose the server over Tailscale HTTPS so it has a stable `https://<machine>.<tailnet>.ts.net` address. Agents only complete OAuth sign-in over HTTPS or localhost, so plain-HTTP tailnet addresses are not enough for the later MCP steps.
4. In the client, add every machine. Set project grouping to group by repository, so a repo checked out on several machines appears once.
5. Turn on **Settings → Labs → Linked environments** on every machine, then link them from **Settings → Environments → Linked environments → Link**. Pick the access level deliberately: below full access, a remote agent can only touch threads it started. Links expire after 30 days; note the renewal date for the user.
6. Optional: **Settings → Environments → Load balancing** (appears with 2+ machines). Per-machine preference: Normal, Prefer, Less often, Manual only.
7. Recommended defaults to review with the user:
   - Worktree cleanup: delete worktrees of settled threads after N days (the reference uses 1), delete merged worktrees immediately, delete inactive worktrees after ~10 days. A worktree per thread fills disks quickly.
   - Idle compaction for Claude threads: compact before the prompt cache expires.
   - Mobile notifications (needs T3 Connect).

### Done when
- Every machine shows as connected in the client.
- From an agent thread on machine A, asking it to delegate a trivial task to machine B creates a thread on B and returns its result.

---

## 4. Phase B: the model gateway (CLIProxyAPI)

### 4.1 Deploy
- Deploy CLIProxyAPI on the chosen host with a persistent volume for its auth files and config, behind HTTPS.
- Generate two secrets and have the user store them in their password manager:
  - a **client API key** (what agents present), and
  - a **management key** (for the management API).
- Put both in a local secrets file on each machine, readable only by the user, for example `~/.config/cliproxy/secrets.env` with `CLIPROXY_API_KEY=` and `CLIPROXY_MGMT_KEY=`. The user pastes the values; you set permissions to `600`.

### 4.2 Add accounts
- Add each model account through the proxy's OAuth login flow. The user completes each sign-in in their browser.
- Routing: **fill-first with session affinity** (a session sticks to one account; new sessions go to the next account with room). Set account priorities if some accounts should be drained first.

### 4.3 Point Claude Code at it (every machine)
Create a key helper script, mode `700`:

```sh
#!/bin/sh
# Prints the gateway API key for Claude Code's apiKeyHelper.
set -a; . "$HOME/.config/cliproxy/secrets.env"; set +a
printf '%s\n' "$CLIPROXY_API_KEY"
```

Add to `~/.claude/settings.json` (merge, don't overwrite; back up first):

```json
{
  "env": { "ANTHROPIC_BASE_URL": "https://<your-model-gateway>" },
  "apiKeyHelper": "~/.config/cliproxy/claude-key.sh"
}
```

In T3 Code, give the Claude provider instance the same two values as environment variables (`ANTHROPIC_BASE_URL`, and the key as a sensitive variable).

Tell the user: with key auth, Claude Code disables claude.ai connectors. That is expected in this design, because tools come from the tool gateway.

### 4.4 Visibility
- **Status line:** a script set as `statusLine` (command, `refreshInterval` 60) that calls `GET /v0/management/auth-files` with the management key, caches the response for ~60 s, and prints: the most recently used enabled account with its 5-hour and 7-day utilization, then every other enabled account's 7-day utilization, colored at 70% and 90%. Utilization lives in each account's observed rate-limit signals (`...-5h-Utilization`, `...-7d-Utilization`, with matching `-Reset` timestamps; treat a passed reset as 0%). If the user already has a status line, wrap both in one script instead of replacing theirs.
- **Menu bar (optional, macOS):** a small SwiftUI `MenuBarExtra` app polling the same endpoint. Store the management key in a user-only file rather than the Keychain if the app will be rebuilt often (each unsigned rebuild re-prompts for Keychain access). Prefer stock system styling.
- If the user's terminal multiplexer or IDE has its own Claude usage meter, hide it: it reads the local login, not the gateway.

### 4.5 Rotating accounts
- Disable an exhausted account: `PATCH /v0/management/auth-files/status` with `{"name": "<auth-file-name>", "disabled": true}`. Re-enable after its reset.
- Keep the management key out of command lines that get logged; load it from the secrets file in the same shell.

### 4.6 Work vs personal
If the interview said work and personal traffic must not mix, do not pool them in one proxy. Options: two proxy instances with separate keys, chosen per folder the same way the tool gateway token is (see 5.3), or keep only one category of account in the pool. Confirm with the user.

### Done when
- `claude auth status` on each machine reports `apiKeyHelper` as the auth source.
- A test prompt succeeds and the gateway's request count increases.
- The status line shows live account usage.

---

## 5. Phase C: the tool gateway (Executor)

### 5.1 Deploy
- Deploy the Executor self-host image **pinned to an exact version tag**, never `latest`; major versions can change storage and key handling.
- Attach a persistent volume for its data. Schedule backups of that volume: it holds every connection.
- Its encryption secret and auth secret go in the password manager. **Rule:** rotating the encryption key is only complete after the process restarts and every stored credential is re-encrypted or reconnected. Never rotate it on the host without planning that restart, or the next restart makes all stored credentials unreadable.
- Serve it over HTTPS on the user's domain or the host default.

### 5.2 Accounts and connections
- Create one Executor user per identity the agents should act as (for example, work and personal), each with its own access token.
- Connect each service under the right user. Notes:
  - Some MCP services have no dynamic client registration; create an OAuth app by hand with Executor's OAuth callback as the redirect URL.
  - Google APIs: an OAuth app in "Testing" status issues tokens that expire every 7 days and needs every account listed as a test user; an "Internal" app in a Workspace org does not expire. Tell the user which applies.
  - Several accounts for one service (several inboxes) are separate connections on the same integration.
- Add an approval policy for write actions the user named in the interview.

### 5.3 Map folders to identities
Claude Code reads MCP servers from the user-level config and from project-local entries keyed by absolute path.

- User-level (`claude mcp add --scope user ...`): the **default identity** (usually personal), with its token in an `Authorization: Bearer` header.
- Project-local entries for each work repository path, **same URL, work token**.

Executor URL, for both: `https://<your-executor>/mcp?search_tools=true&artifacts=false`.

Caveat to raise with the user: path-keyed entries do not follow new clones or worktrees. If the cockpit creates a worktree per thread, decide how work worktrees get the work entry (for example, a SessionStart hook that matches the repo's git remote, like the skills hook in Phase E, and adds the project-local entry). Verify which identity a fresh worktree actually gets before relying on it.

### 5.4 Make the tools visible
- **Use the default (code) mode with `search_tools=true`**: every connected service appears as its own `search_<service>` tool, and the inventory is in the `execute` tool's description. Do not use `mode=passthrough` for this design: it exposes only generic integrations/search/invoke tools and agents stop noticing services.
- Add a short block to the user-level `CLAUDE.md` and to Codex's global `AGENTS.md`: name every connected service, state that messages, email and calendar always go through the tool gateway, and point to its guide (`skills({ name: "execute" })` in Executor).
- Disable other plugins or connectors that duplicate a gateway service.

### 5.5 Reaching the user's machines from the gateway
Only needed when the gateway runs in the cloud and must reach services on the user's machines (the cockpit's MCP in Phase D).

- If the host's containers have no network device, run Tailscale in userspace as a **sidecar service**: `TS_USERSPACE=true`, `TS_OUTBOUND_HTTP_PROXY_LISTEN=[::]:1055`, a persistent `TS_STATE_DIR`, a tagged auth key (for example `tag:<gateway-tag>`), `TS_ACCEPT_DNS=true`.
- On the gateway: `HTTPS_PROXY` and `HTTP_PROXY` pointing at the sidecar, and `NO_PROXY` for localhost and the host's private domain.
- Executor's outbound guard blocks private ranges, including Tailscale's `100.64.0.0/10`. Allowing them (`EXECUTOR_ALLOW_LOCAL_NETWORK=true`) lets the gateway reach the whole tailnet and the host's private network, so add a tailnet ACL first: the gateway's tag may reach only the cockpit machines on port 443.
- If plain HTTP through the tunnel works but TLS handshakes hang, lower the sidecar's MTU (`TS_DEBUG_MTU`, for example 1100).

### Done when
- In a fresh session in a default-identity folder, the agent lists `search_<service>` tools for exactly the default identity's services.
- In a fresh session in a work repo, it sees exactly the work services.
- A read action on one service succeeds; a write action pauses for approval if a policy covers it.

---

## 6. Phase D: the loop (cockpit MCP inside the tool gateway)

### Steps
1. On one cockpit machine, copy its MCP URL: **Settings → Environments → (machine) → Copy MCP URL**. It must be HTTPS (Tailscale HTTPS or T3 Connect) for the OAuth sign-in to complete.
2. Add it to Executor as an MCP integration under the identity that should control the fleet. Executor registers itself through the server's OAuth (dynamic client registration). Grant `orchestration:read` and `orchestration:operate` only if the user wants agents to start and message threads; read-only is a valid choice.
3. With Linked environments on, this one connection reaches every linked machine: T3 tools accept an `environmentId` to act on a specific machine.
4. Read tools should run without approval; launching, sending, interrupting or configuring threads should require approval. Confirm the policy in Executor.

### Done when
- From any Claude session, a request like "list the threads running on <machine B>" returns that machine's threads.
- A request to message a thread pauses for approval in Executor.

---

## 7. Phase E: the skills repo

### 7.1 Inventory first
Classify every existing skill before moving anything:
- **Team skills** (committed in a team repo): leave them. Check tracking with `git ls-files --error-unmatch <path>/SKILL.md` on the real path, not through a symlinked directory, because a symlinked `.claude/skills` can make a tracked file look untracked.
- **Installed packs** (from an installer with its own lock file or update command): leave them.
- **The user's own skills**: these move. Ask which are global and which belong to one repo.

### 7.2 Layout
Create a private repo cloned to the same path on every machine (for example `~/agent-skills`):

```
agent-skills/
  global/<skill>/SKILL.md      linked for every project
  <folder>/<skill>/SKILL.md    linked only into matching repos
  projects.json                { "<folder>": ["owner/repo", "owner/*"] }
  bin/skills-hook.py
```

### 7.3 The hook
Write `bin/skills-hook.py` to this spec (the reference implementation is about 150 lines of Python with no dependencies):

- Find the repo root from the script's own path, so the repo can live anywhere.
- `start`:
  1. For each skill in `global/`, symlink it into `~/.claude/skills/<name>` and `~/.agents/skills/<name>`. Never replace a real file or folder; only create or update links. Remove links that point into the repo but whose target no longer exists.
  2. Read `cwd` from the hook's JSON on stdin. Find the git top level. Read `origin`, extract `owner/repo`, and match it case-insensitively against `projects.json` patterns (glob).
  3. For each matched folder, link each skill into `<repo>/.claude/skills/<name>` and `<repo>/.agents/skills/<name>`. If `.claude/skills` is itself a symlink to `.agents/skills`, the second link is a no-op.
  4. Append `/.claude/skills/<name>` and `/.agents/skills/<name>` to `$(git rev-parse --git-common-dir)/info/exclude` (shared by all worktrees). Never edit `.gitignore`.
  5. If any project link was newly created, print a SessionStart JSON with `hookSpecificOutput.additionalContext` naming each new skill and its `SKILL.md` path. Claude Code reads its skill list before the hook runs, so this note is how the first session in a fresh checkout learns about them.
  6. Start `git pull --ff-only -q` in the background, detached, and exit immediately.
- `end`: in the background, `git add -A`, commit if anything changed (message naming the host), `git push -q`.
- Wrap everything so any error prints to stderr and exits 0. A broken hook must never block a session.

Register both hooks in `~/.claude/settings.json` on every machine:

```json
"hooks": {
  "SessionStart": [{ "hooks": [{ "type": "command", "command": "python3 ~/agent-skills/bin/skills-hook.py start" }] }],
  "SessionEnd":   [{ "hooks": [{ "type": "command", "command": "python3 ~/agent-skills/bin/skills-hook.py end" }] }]
}
```

### 7.4 Migrate
1. Copy the user's own skills into the repo. Check each for secrets before the first commit.
2. Move the originals to a backup folder outside the skill directories (not deleted).
3. Run the hook once by hand in the home directory and in one repo of each mapped folder; confirm links and a clean `git status`.
4. Create the private remote and push. Clone it on every other machine and add the hooks there.

### Done when
- A fresh session in a mapped repo lists its project skills; a session in an unmapped repo does not.
- `git status` in a shared repo shows nothing from the links.
- An edit made on one machine appears on the other after its next session start.

---

## 8. Security checklist

Go through this with the user before calling the setup finished:

- [ ] Gateways pinned to exact versions; volume backups scheduled; encryption and auth secrets in the password manager.
- [ ] No secret in any config file, repo, transcript, or the notes file.
- [ ] Tailnet ACL limits the gateway's tag to the cockpit machines and port it needs.
- [ ] Machine links use the lowest access level that works, with a renewal date noted.
- [ ] Approval required for sending messages, creating events, and starting or messaging threads from outside the cockpit.
- [ ] Work data handling agreed with the employer's policy; work and personal model accounts separated if required.
- [ ] A fallback exists if the model gateway is down (for example a shell alias that runs the agent with its own login and without the gateway settings).

## 9. Final verification

Run these from a fresh session on each machine and report results to the user in one table:

| Check | Expected |
|---|---|
| `claude auth status` | auth source is the key helper |
| Status line | shows the gateway's active account and usage |
| Tools in a personal folder | only personal `search_<service>` tools |
| Tools in a work repo | only work `search_<service>` tools |
| Skills in a mapped repo | project skills present; absent elsewhere |
| Cross-machine | listing threads on the other machine through the tool gateway works |
| Approvals | a write action pauses for approval |
