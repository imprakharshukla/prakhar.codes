#!/bin/bash
# granola-gather — auto start/stop Granola recording around Gather conversations (macOS).
#
#   bash granola-gather.sh            # run now (foreground)
#   bash granola-gather.sh install    # also run at every login (per-user agent)
#   bash granola-gather.sh uninstall  # remove the login agent
#
# Requires: GatherV2.app + Granola.app installed, and `bun` or `node >= 21` on PATH.
# Self-contained: the watcher JS is embedded below and extracted to a cache dir at run.

set -u
GATHER_PORT=9222
GRANOLA_PORT=9223
SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)/$(basename "${BASH_SOURCE[0]}")"
CACHE="${HOME}/.cache/granola-gather"
DAEMON="${CACHE}/daemon.mjs"
LOG="${CACHE}/daemon.log"
LABEL="com.${USER}.granola-gather"
PLIST="${HOME}/Library/LaunchAgents/${LABEL}.plist"
mkdir -p "$CACHE"

# ---------------------------------------------------------------- install / uninstall
if [ "${1:-run}" = "uninstall" ]; then
  launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || launchctl unload "$PLIST" 2>/dev/null || true
  rm -f "$PLIST"
  echo "Removed login agent ${LABEL}. (Apps stay open.)"
  exit 0
fi
if [ "${1:-run}" = "install" ]; then
  mkdir -p "${HOME}/Library/LaunchAgents"
  cat > "$PLIST" <<PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array><string>/bin/bash</string><string>${SELF}</string><string>run</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>${LOG}</string>
  <key>StandardErrorPath</key><string>${LOG}</string>
</dict>
</plist>
PLISTEOF
  launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
  launchctl bootstrap "gui/$(id -u)" "$PLIST" 2>/dev/null || launchctl load "$PLIST"
  echo "Installed login agent ${LABEL}. Running now and at every login. Logs: ${LOG}"
  echo "Uninstall: bash ${SELF} uninstall"
  exit 0
fi

# ---------------------------------------------------------------- runtime
RUNTIME=""
if command -v bun >/dev/null 2>&1; then
  RUNTIME="$(command -v bun)"
elif command -v node >/dev/null 2>&1; then
  maj="$(node -e 'console.log(process.versions.node.split(".")[0])' 2>/dev/null || echo 0)"
  [ "${maj:-0}" -ge 21 ] 2>/dev/null && RUNTIME="$(command -v node)"
fi
[ -z "$RUNTIME" ] && { echo "[run] Need 'bun' or 'node >= 21' on PATH. https://bun.sh"; exit 1; }

# ---------------------------------------------------------------- ensure apps on debug ports
find_app() {
  local n="$1"
  [ -d "/Applications/${n}.app" ] && { echo "/Applications/${n}.app"; return; }
  mdfind "kMDItemKind=='Application'" 2>/dev/null | grep -i "/${n}.app$" | head -1
}
ensure_app() {
  local name="$1" port="$2"
  curl -s --max-time 2 "localhost:${port}/json/version" >/dev/null 2>&1 && { echo "[run] ${name} on :${port}"; return; }
  local path; path="$(find_app "$name")"
  [ -z "$path" ] && { echo "[run] ${name}.app not found — is it installed?"; return; }
  echo "[run] launching ${name} with CDP :${port}"
  pkill -9 -i "$name" 2>/dev/null; sleep 2
  open "$path" --args --remote-debugging-port="$port"
  for _ in $(seq 1 20); do sleep 1; curl -s --max-time 2 "localhost:${port}/json/version" >/dev/null 2>&1 && break; done
}
ensure_app "GatherV2" "$GATHER_PORT"
ensure_app "Granola"  "$GRANOLA_PORT"

# ---------------------------------------------------------------- extract embedded watcher
cat > "$DAEMON" <<'DAEMONEOF'
import { exec } from "node:child_process";
import { appendFileSync } from "node:fs";

const GATHER_PORT  = Number(process.env.GATHER_PORT  ?? 9222);
const GRANOLA_PORT = Number(process.env.GRANOLA_PORT ?? 9223);
const CREATION_SOURCE = "gather";
const START_DELAY_MS = 1500;
const STOP_DELAY_MS  = 12000;
const LOGFILE = `${process.env.HOME}/granola-gather/debug.log`;

const ts = () => new Date().toLocaleTimeString();
const log = (...a) => {
  const line = `[${ts()}] ${a.join(" ")}`;
  console.log(line);
  try { appendFileSync(LOGFILE, line + "\n"); } catch (e) {}
};
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const sh = (cmd) => new Promise((res) => exec(cmd, () => res()));

// Signal = "I have a live OUTBOUND mic track" = I actually joined a conversation.
// (Gather provisions muted *receiver* tracks for everyone nearby, so incoming
//  audio is NOT a reliable signal — it fires for other people's meetings too.
//  Your own mic is only attached to connections you actually joined. We ignore
//  the track's `enabled` flag so muting yourself mid-call doesn't stop recording.)
const HOOK = `(() => {
  if (window.__ggHook) return 'already';
  window.__ggHook = true;
  const pcs = new Set();
  const Native = window.RTCPeerConnection;
  if (!Native) return 'no-rtc';
  window.RTCPeerConnection = function (...a) {
    const pc = new Native(...a); pcs.add(pc);
    pc.addEventListener('connectionstatechange', () => {
      if (['closed', 'failed'].includes(pc.connectionState)) pcs.delete(pc);
    });
    return pc;
  };
  window.RTCPeerConnection.prototype = Native.prototype;
  const haveMyMic = () => {
    for (const pc of pcs) {
      if (['closed', 'failed'].includes(pc.connectionState)) continue;
      let senders = []; try { senders = pc.getSenders(); } catch (e) { continue; }
      for (const s of senders) {
        const t = s.track;
        if (t && t.kind === 'audio' && t.readyState === 'live') return true;
      }
    }
    return false;
  };
  let last = null;
  setInterval(() => {
    const inCall = haveMyMic();
    if (inCall !== last) { last = inCall; try { window.__ggSignal(JSON.stringify({ inCall })); } catch (e) {} }
  }, 1000);
  return 'installed';
})()`;

function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0; const pending = new Map(); const listeners = [];
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
    else if (m.method) listeners.forEach((fn) => fn(m));
  });
  const ready = new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", rej); });
  return {
    ready, ws,
    send: (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); }),
    onEvent: (fn) => listeners.push(fn),
    onClose: (fn) => ws.addEventListener("close", fn),
    close: () => ws.close(),
  };
}

async function findPage(port, match) {
  const list = await (await fetch(`http://localhost:${port}/json`)).json();
  return list.find((p) => p.type === "page" && p.url && match(p.url));
}

async function startRecording() {
  await sh(`open -g "granola://new-document?creation_source=${CREATION_SOURCE}"`);
  log("▶ START — opened a new Granola note (recording)");
}
async function stopRecording() {
  try {
    const page = await findPage(GRANOLA_PORT, (u) => u.includes("/meeting/"));
    if (!page) { log("■ STOP — no active Granola recording (already stopped?)"); return; }
    const c = cdp(page.webSocketDebuggerUrl);
    await c.ready;
    await c.send("Runtime.enable");
    await c.send("Runtime.evaluate", { expression: `document.querySelector('[data-testid=stop-transcript-button]')?.click()` });
    await delay(800); c.close();
    log("■ STOP — clicked Granola stop");
  } catch (e) { log("■ STOP error:", e.message); }
}

let recording = false, pendingTarget = null, pendingTimer = null;
function onCallState(inCall) {
  if (inCall === recording) { clearTimeout(pendingTimer); pendingTimer = null; pendingTarget = null; return; }
  if (pendingTarget === inCall) return;
  pendingTarget = inCall;
  clearTimeout(pendingTimer);
  pendingTimer = setTimeout(async () => {
    recording = inCall; pendingTimer = null; pendingTarget = null;
    if (inCall) await startRecording(); else await stopRecording();
  }, inCall ? START_DELAY_MS : STOP_DELAY_MS);
  log(inCall ? "· someone connected — arming start…" : "· audio dropped — arming stop…");
}

async function gatherLoop() {
  for (;;) {
    try {
      const page = await findPage(GATHER_PORT, (u) => u.includes("app.v2.gather.town"));
      if (!page) { log("waiting for Gather page on :" + GATHER_PORT + "…"); await delay(5000); continue; }
      const c = cdp(page.webSocketDebuggerUrl);
      await c.ready;
      await c.send("Runtime.enable");
      await c.send("Page.enable");
      await c.send("Runtime.addBinding", { name: "__ggSignal" });
      await c.send("Page.addScriptToEvaluateOnNewDocument", { source: HOOK });
      c.onEvent((m) => { if (m.method === "Runtime.bindingCalled" && m.params.name === "__ggSignal") onCallState(JSON.parse(m.params.payload).inCall); });
      await c.send("Runtime.evaluate", { expression: HOOK });
      await c.send("Page.reload", {});
      log("attached to Gather — watching for conversations.");
      await new Promise((res) => c.onClose(res));
      log("Gather connection closed — reattaching…");
    } catch (e) { log("Gather attach error:", e.message); }
    await delay(4000);
  }
}

log(`granola-gather up. Gather :${GATHER_PORT} → Granola :${GRANOLA_PORT}`);
gatherLoop();
DAEMONEOF

export GATHER_PORT GRANOLA_PORT
exec "$RUNTIME" "$DAEMON"
