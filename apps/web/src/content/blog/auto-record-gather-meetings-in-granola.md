---
title: "I Taught Granola to Auto-Record My Gather Meetings"
description: "Gather keeps your mic open all day, so Granola never realizes you're in a meeting. Here's the little macOS watcher I built to start and stop recording automatically, using WebRTC, a deep link, and the Chrome DevTools Protocol."
pubDate: "Jun 11 2026"
heroImage: "/images/blogs/granola-gather.png"
tags: ["Automation", "Granola", "Gather", "Remote Work", "macOS", "WebRTC", "Electron"]
category: "Automation"
publish: true
---

**TL;DR**: My team lives in Gather, but Granola never auto-records our meetings because Gather holds the mic open all day. I built a tiny macOS watcher that notices when someone actually connects to you in Gather and starts a Granola recording, then stops it when they leave. No screen reading, no bots. Full script at the bottom. ↓

---

## The Problem

My team works out of [Gather](https://gather.town). It's our virtual office — you walk your little avatar around, bump into someone at their desk, and start talking. Half our meetings aren't on a calendar. They just *happen*.

[Granola](https://granola.ai) is supposed to record meetings automatically. It does, for Zoom and Meet, because it triggers off your calendar or off detecting that your mic just went live.

Neither works for Gather.

There's no calendar invite for "Prakhar wandered over to Tristan's desk." And the mic trick? Gather grabs your microphone the *second* you load the space and never lets go. It just mutes the track when you're not talking. So from the OS's point of view, your mic is "in use" all day, every day. There's no clean on/off edge for Granola to notice.

The result: I'd finish a 25-minute conversation and realize nothing got recorded. Again.

I wanted Granola to follow me around Gather. Walk up to someone → recording starts. Walk away → recording stops. No buttons.

---

## Why the Obvious Fixes Don't Work

Before building anything, I killed the easy ideas.

Watching the microphone is dead on arrival. Gather holds it open continuously, so "mic in use" is always true with no edge to detect.

AppleScript doesn't work either. Granola is Electron, Electron apps don't ship AppleScript dictionaries, and the GUI-scripting fallback needs an Accessibility permission and breaks the moment the layout changes.

Replaying Granola's network calls just makes an empty note. Your script isn't the one tapping the mic, so there's no audio to capture.

So I needed two things: a reliable signal from *inside* Gather, and a reliable way to drive Granola without touching its UI.

---

## The Signal: WebRTC, Not the Microphone

Whether you walk up to someone or join a meeting room, Gather does the same thing under the hood: it opens a WebRTC connection and starts sending you their audio. When you're alone, nothing. When the last person leaves, the connection closes.

So the question "am I in a conversation?" becomes "do I have any live remote audio tracks?" — which has a clean on/off edge even though the mic never does.

Gather is also an Electron app, which means it's Chromium under the hood. Launch it with a debug port:

```bash
open "/Applications/GatherV2.app" --args --remote-debugging-port=9222
```

…and you can attach to its page over the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) and inject JavaScript. No screen reading, no fragile accessibility tree. You're talking to the actual web engine.

I inject a hook that wraps `RTCPeerConnection` and counts live remote audio tracks:

```js
const remote = new Set();
const Native = window.RTCPeerConnection;

window.RTCPeerConnection = function (...args) {
  const pc = new Native(...args);
  const mine = new Set();

  pc.addEventListener("track", (e) => {
    if (e.track.kind !== "audio") return;
    remote.add(e.track.id);
    report();
    // someone's audio ended → they left
    e.track.addEventListener("ended", () => {
      remote.delete(e.track.id);
      report();
    });
    // NOTE: do NOT drop on 'mute' — that just means they muted their mic.
  });

  pc.addEventListener("connectionstatechange", () => {
    if (["closed", "failed", "disconnected"].includes(pc.connectionState)) {
      mine.forEach((id) => remote.delete(id));
      report();
    }
  });

  return pc;
};
window.RTCPeerConnection.prototype = Native.prototype;
```

`report()` fires a callback whenever the count crosses zero. `remote.size > 0` means "I'm in a conversation." That was the detector I shipped first — and it worked, right up until it started quietly recording meetings I wasn't even in. (Hold that thought; it's the most interesting part of this whole thing, and it's a few sections down.)

---

## Driving Granola: Deep Link to Start, DevTools to Stop

Granola has no public "start recording" API. But it *does* register a URL scheme, and one verb starts a fresh note **and** the recording in one shot. I found it by digging through the app's bundle:

```bash
open "granola://new-document?creation_source=gather"
```

That's the entire start mechanism. One line. It tells the real Granola app to spin up its real local capture pipeline — which is exactly the thing that has to run.

Stopping is the annoying half. There's no `granola://stop`, and Granola's own "auto-stop after 15 minutes of silence" never triggers — because Gather is still feeding it a live (muted) mic, so as far as Granola knows, audio never stops.

So I do the same Electron trick on Granola itself. Launch it with a debug port (`--remote-debugging-port=9223`), attach over CDP, and click the stop button by calling its DOM handler directly:

```js
// in Granola's renderer, via CDP
document.querySelector("[data-testid=stop-transcript-button]")?.click();
```

This is *not* a synthetic mouse click at screen coordinates. It calls the button's handler inside Granola's web engine, so it works even if Granola is minimized, unfocused, or parked on another monitor. That's why I ditched AppleScript. The accessibility approach needs the window visible; CDP doesn't care.

---

## Putting It Together

The watcher is one process that:

1. Attaches to Gather (`:9222`) and installs the audio-track hook.
2. On the **0 → 1** edge, opens `granola://new-document`.
3. On the **1 → 0** edge, attaches to Granola (`:9223`) and clicks stop.

With one bit of polish: **asymmetric debounce**. Start ~1.5s after a connection (confirm it's real), but wait ~12s after audio drops before stopping. Otherwise a network blip or a quick walk-past would split one meeting into five notes.

```js
let recording = false, pendingTimer = null, pendingTarget = null;

function onCallState(inCall) {
  if (inCall === recording) {               // settled back — cancel pending flip
    clearTimeout(pendingTimer); pendingTimer = pendingTarget = null;
    return;
  }
  if (pendingTarget === inCall) return;
  pendingTarget = inCall;
  clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    recording = inCall;
    inCall ? startRecording() : stopRecording();
  }, inCall ? 1500 : 12000);
}
```

The note titles itself. Granola's AI names it from the transcript afterward, and it's usually better than anything I'd type mid-meeting. And every note it creates carries `creation_source=gather`, so they're easy to find later.

---

## The Bug: "Receiving Audio" Isn't "Being in a Meeting"

I ran the remote-audio detector for a day, and then it betrayed me: a teammate would huddle with someone across the map, and my Granola would quietly spin up a recording of a meeting I had nothing to do with.

So I instrumented everything — a verbose logger dumping every `RTCPeerConnection` and track event, plus a 2-second WebRTC stats poll, to a file I could diff later. The logs were blunt about what was happening:

- When **someone else** met up nearby, my client had **three or four incoming audio tracks, all muted** (`muted: true`). Gather pre-provisions a muted receiver track for basically everyone around you, for spatial audio. My "do I have remote tracks?" check was true almost constantly.
- When **I** was actually in a conversation, I had a live **outbound** mic track, and I was *sending* packets — `TX` packet counts climbing every poll, my mic audio level spiking when I spoke.

Incoming audio is provisioned for the whole room. Your own outgoing mic is only attached to a connection you actually joined. So the gate isn't "am I receiving audio," it's "am I sending any":

```js
const haveMyMic = () => {
  for (const pc of peerConnections) {
    if (["closed", "failed"].includes(pc.connectionState)) continue;
    for (const sender of pc.getSenders()) {
      const t = sender.track;
      if (t && t.kind === "audio" && t.readyState === "live") return true;
    }
  }
  return false;
};
```

I deliberately ignore the track's `enabled` flag. Muting yourself mid-meeting shouldn't stop the recording; leaving should. And I caught the fix in the act: sitting in a real meeting it read `out=1` with packets flowing, while across three separate "meetings I wasn't in" it stayed flat at `out=0`. Clean separation, zero false starts since.

The lesson generalizes: "I'm receiving audio" is *almost* the right signal, and almost is what bites you. "I'm sending audio" is the one that actually means *you* showed up.

---

## What I Learned

**1. Electron apps are wide open if you launch them right.** `--remote-debugging-port` turns any Electron app into something you can script over CDP — read its state, inject hooks, call DOM handlers. Both halves of this project lean on it.

**2. A deep link can beat an API.** Granola has no start-recording API, but `granola://new-document` does the real thing because it drives the actual app. I almost went down a reverse-engineering rabbit hole before checking the URL scheme.

**3. Pick the signal that has an edge — and make sure it's *yours*.** The mic-in-use bit was always on (no edge). Incoming WebRTC audio had a clean edge but it wasn't mine — Gather provisions it for everyone nearby, so it fired for other people's meetings. My *outbound* mic was the one signal that flips exactly when I join and leave. Finding the signal that means *you specifically* was most of the work.

**4. CDP beats UI scripting.** Calling a button's DOM handler is invisible, focus-independent, and survives the window being hidden. AppleScript GUI scripting is none of those.

**5. "Launched with a flag" is a fragile contract.** The whole thing dies silently the moment Gather or Granola restart *without* their debug port — an overnight reboot did exactly that and I woke up to a watcher looping "unable to connect." The durable fix is a login agent that always relaunches them with the flag, plus a health check that re-launches an app the instant its port disappears. Automation isn't done when it works once; it's done when it survives a reboot.

---

## Try It

It's a single bash script. Download it, run it, and it handles the rest:

```bash
curl -O https://prakhar.codes/scripts/granola-gather.sh
bash granola-gather.sh            # run now
bash granola-gather.sh install    # also run at every login
bash granola-gather.sh uninstall  # remove it
```

Or [download granola-gather.sh](https://prakhar.codes/scripts/granola-gather.sh) directly.

Requirements: macOS, GatherV2.app + Granola.app, and `bun` or `node >= 21`. If your team lives in Gather like mine does, this might save you a few "wait, was that recorded?" moments.

---

**Links:**
- [Gather](https://gather.town)
- [Granola](https://granola.ai)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
