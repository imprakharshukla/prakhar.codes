---
title: "Andronix"
description: "Linux on Android without root. 2M+ Google Play downloads and $140K+ lifetime revenue. Andronix 2.0 adds Modded OS desktops, Termux:X11 and a rebuilt backend, support desk and release pipeline."
tags: ["Android", "Kotlin", "Linux", "ExpressJS", "Astro", "Next.js"]
pubDate: "Apr 04 2019"
updatedDate: "Nov 08 2026"
link: "https://andronix.app"
github: "https://andronix.app/git"
heroImage: "/images/projects/ascii/andronix.png"
status: "In Progress"
publish: true
type: "Commercial"
languages: ["Kotlin", "TypeScript", "C", "Bash"]
frameworks: ["Android SDK", "ExpressJS", "Astro", "Next.js", "Firebase", "TailwindCSS"]
screenshotLayout: "phone"
screenshots:
  - "/images/projects/screenshots/andronix/app10-home.webp"
  - "/images/projects/screenshots/andronix/app10-distro-list.webp"
  - "/images/projects/screenshots/andronix/app10-desktop-picker.webp"
  - "/images/projects/screenshots/andronix/termux-x11-desktop.webp"
  - "/images/projects/screenshots/andronix/app10-modded-editions-owned.webp"
rank: 1
---
## What is Andronix?

Andronix installs full Linux distributions such as Ubuntu, Debian, Arch, Fedora, Manjaro and Kali on Android phones, tablets and Chromebooks, with no root. You pick a distro and a desktop in the app, run one command in Termux, and get a Linux terminal or a full desktop on your device.

The free distros cover most users. Modded OS editions and Andronix Premium are paid tiers, and they fund the project.

## How it works

Andronix runs Linux with **PRoot**, a user-space implementation of `chroot`, `mount --bind` and `binfmt_misc`. PRoot lets an ordinary app process treat a directory as the root file system, so a complete Linux userland runs inside Termux without special privileges.

- The app handles choosing a distro and desktop, purchases, accounts and help.
- **Termux** provides the terminal and the Android-side packages.
- The `andronix` installer command downloads the root file system, sets up the user and desktop, and writes the start scripts.
- Desktops display through **Termux:X11**, with VNC as a fallback.

## What's new in 2.0

Andronix 2.0 (app 10.x) is a rebuild of the app, the installer and the services behind them.

- **New app design.** A new icon and brand, a Home screen built around free distros and Modded OS, and outline icons throughout.
- **Modded OS editions.** Ready-made desktops, styled and set up by Andronix, on Ubuntu, Debian, KDE Plasma, Manjaro and Kali bases.
- **Termux:X11 desktops.** Native X11 display instead of VNC by default, which is faster and works better with touch, keyboard and mouse.
- **A new installer.** It works on more devices, gives clearer errors, and includes `andronix report`, which uploads a problem report and returns a short ID to send to support.
- **In-app tools.** Reset a forgotten Linux password from the distro menu, check purchases on the Owned screen, and read the in-app What's new.
- **Eight languages.** English, German, Spanish, French, Brazilian Portuguese, Turkish, Indonesian and Russian, in both the app and the release notes.
- **Play Billing 8.** Purchases are confirmed on the server and restored on reinstall, with seasonal offers that switch on and off on schedule.

## How I build and run it

### Android app

- Kotlin, single-activity architecture, ViewModels with coroutines and Flow, and Dagger/Hilt for dependency injection.
- Google Play Billing 8, Firebase (Auth, Firestore, Realtime Database, Remote Config, Messaging) and Sentry for error reports.
- Native code (C) for the parts that run Linux processes and audio.
- More than 1,000 unit tests (JUnit and Robolectric) run on every release build.
- Release builds refuse to build when a required key is missing or the version has no changelog entry.

### Backend

- TypeScript and Express services, each with one job:
  - Products API: catalog, entitlements, install tokens and problem reports.
  - Commerce API: purchases and server-side purchase confirmation.
  - Internal API: tooling.
- Hosted on Railway, with Firebase and Postgres for data.
- Distro images and downloads are served from Cloudflare R2 behind Cloudflare.
- Revenue is tracked from Google Play's real-time notifications into a ledger that removes duplicate orders.
- Product analytics run on a self-hosted OpenPanel and ClickHouse stack.

### Website and docs

- [andronix.app](https://andronix.app) is built with Astro and Tailwind and deployed on Cloudflare Workers.
- The site's changelog file also feeds the app's What's new screen.
- [docs.andronix.app](https://docs.andronix.app) is a Next.js site with guides, troubleshooting and recorded terminal demos of the real installer.

### Release and QA

- Every build is tested on real phones first. AWS Device Farm runs release checks across phones I don't own.
- Production releases go out as Play staged rollouts, widened step by step (for example 20%, then 50%, then 100%) based on crash rates.
- Scripts that call the Google Play Developer API upload builds, widen rollouts and keep release notes in every language.

### Support and operations

- A support desk built with Next.js and Postgres collects email tickets and installer reports in one place.
- AI drafts replies, and each draft is fact-checked against the code and docs before it is sent.
- Hourly checks cover new tickets, failed purchases and new crashes in Sentry, so problems surface within the hour.
- I run much of the day-to-day work (triage, release steps, monitoring) with AI coding agents. I review their work, and releases and payments need my approval.

## Numbers

- **2M+** downloads on Google Play.
- **$140K+** lifetime revenue since 2019.
- **#1** result on Google Play for "Linux".
- **8** app languages.
- Full unit test suite on every release build.
- In active development since April 2019.
