#!/usr/bin/env node
// Project thumbnails in the halftone-dot ASCII style (inspired by ascii.rest, engine from the Andronix brand art).
// Each project gets its own palette and a small procedural scene, with its name in dot letters.
//
//   node scripts/ascii-thumbs/thumbs.mjs              # all projects + blog covers (public/images/{projects,blogs}/ascii/<slug>.png)
//   node scripts/ascii-thumbs/thumbs.mjs runa zeni    # just these
import {mkdirSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {DC, DR, Field, fbm, grid, render, sharp, textWidth} from './engine.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '../../public/images/projects/ascii')
const W = 1280, H = 720

// ---------------------------------------------------------------- shared pieces
function sky(F, {sx = .68, sy = .7, glow = 1, haze = .3, stars = true, base = .05} = {}) {
  const cx = DC * sx, cy = DR * sy, G = DR * .55
  F.each((x, y) => {
    const yy = Math.max(0, y / DR), d2 = (x - cx) ** 2 + ((y - cy) * 1.3) ** 2
    let v = base + .16 * yy * yy + glow * .62 * Math.exp(-d2 / (2 * G * G))
    v += (fbm(x * .03, y * .1, F.seed) - .5) * haze * Math.min(1, yy)
    if (stars && yy < .45 && v < .15 && F.rnd(x, y) > .985) v = .22
    return v
  })
}
function sun(F, cx, cy, r, horizon = Infinity) {
  for (let y = Math.floor(cy - r); y <= Math.min(horizon - 1, cy + r); y++)
    for (let x = Math.floor(cx - r); x <= cx + r; x++)
      if ((x - cx) ** 2 + ((y - cy) * 1.15) ** 2 < r * r) F.set(x, y, .96 - .4 * Math.max(0, Math.sin(y * 1.6 + F.seed) - .6))
}
function water(F, horizon) {
  const bottom = F.Y1
  for (let y = horizon; y <= bottom; y++) {
    const depth = (y - horizon) / Math.max(1, bottom + 1 - horizon)
    for (let x = F.X0; x <= F.X1; x++) {
      const wob = Math.sin(y * 1.7 + F.seed + Math.sin(x * .09) * 2) * (1 + depth * 2.5)
      const mx = Math.min(F.X1, Math.max(F.X0, Math.round(x + wob))), my = Math.max(F.Y0, 2 * horizon - y - 1)
      F.set(x, y, F.get(mx, my) * (.6 - depth * .25))
    }
  }
}
function glitter(F, sx, horizon, R) {
  for (let y = horizon; y <= F.Y1; y++) {
    const w = R * (1.1 - .6 * (y - horizon) / Math.max(1, F.Y1 + 1 - horizon))
    for (let x = Math.floor(sx - w); x < sx + w; x++) if (F.rnd(x, y + 99) > .72) F.add(x, y, .35)
  }
}
// dot-letter title on a carved band; picks the biggest scale that fits `max` cells
function title(F, lines, {y = 8, x = 'center', max = 128, k = 2} = {}) {
  lines = [].concat(lines)
  let sc = 4
  while (sc > 1 && Math.max(...lines.map(l => textWidth(l, sc))) > max) sc--
  const lh = 7 * sc + Math.max(3, sc * 2)
  lines.forEach((s, j) => {
    const w = textWidth(s, sc), x0 = x === 'center' ? Math.round((DC - w) / 2) : x, yy = y + j * lh
    F.rect(x0 - 4, yy - 3, x0 + w + 3, yy + 7 * sc + 2, 0, 3)
    F.text(s, x0, yy, sc, .97, k)
  })
  return y + lines.length * lh
}
const bezier = (F, x0, y0, x1, y1, v, k, bend = .5) => {
  for (let t = 0; t <= 1; t += .008) {
    const mx = x0 + (x1 - x0) * bend, a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t * t, d = t ** 3
    F.set(a * x0 + b * mx + c * mx + d * x1, a * y0 + b * y0 + c * y1 + d * y1, v, k)
  }
}

// ---------------------------------------------------------------- palettes (ramp: 11 stops, dark -> light)
const P = {
  andronix: {background: '#19120E', ramp: ['#2A1F18', '#3A2D24', '#4E3423', '#6E3408', '#954611', '#C25F14', '#E8791E', '#F59A4E', '#FFB689', '#FFD9BF', '#FFF3EA'], accent: '#E8791E', ink: '#FFF3EA', muted: '#8C7A6E'},
  sweetpea: {background: '#170D12', ramp: ['#24141C', '#331B27', '#4A2236', '#6B2A4A', '#93345F', '#BC4877', '#E0668F', '#F08AAB', '#F8B3C8', '#FCD7E3', '#FFF1F5'], accent: '#F2789F', ink: '#FFF1F5', muted: '#8E6E7B', alt: '#B9E3A0'},
  sonar: {background: '#0C0D0E', ramp: ['#16181A', '#1E2124', '#2A2E32', '#3A3F44', '#4F555B', '#6A7178', '#8A9198', '#A9B0B6', '#C6CBD0', '#E1E4E7', '#F7F8F9'], accent: '#9EF0C2', ink: '#F7F8F9', muted: '#6A7178'},
  weave: {background: '#03120D', ramp: ['#0A1F17', '#0F2B20', '#123A2B', '#0F5139', '#0F6B4A', '#10875C', '#1BA672', '#34D399', '#6EE7B7', '#A7F3D0', '#ECFDF5'], accent: '#34D399', ink: '#ECFDF5', muted: '#5C8574'},
  brawl: {background: '#140A0A', ramp: ['#211212', '#2E1716', '#421C1A', '#5E211D', '#80261F', '#A52F24', '#CC3D2E', '#EF5A45', '#F8897A', '#FCBFB6', '#FFF0EC'], accent: '#FFC94A', ink: '#FFF0EC', muted: '#8A6A66', alt: '#EF5A45'},
  rapid: {background: '#0F0E08', ramp: ['#1A1810', '#242114', '#332D16', '#4A3F14', '#665612', '#8A720F', '#B3920C', '#DDB20B', '#F5CF3A', '#FBE68F', '#FFFBE8'], accent: '#FACC15', ink: '#FFFBE8', muted: '#86806A'},
  twofer: {background: '#0D0B16', ramp: ['#16132A', '#1D1938', '#272150', '#322A69', '#3F3484', '#5143A3', '#6656C2', '#816FDB', '#A493EC', '#C9BEF6', '#F1EEFF'], accent: '#60A5FA', ink: '#F1EEFF', muted: '#77718F', alt: '#FB923C'},
  runa: {background: '#061215', ramp: ['#0B1C20', '#0F262B', '#13333A', '#15444D', '#155964', '#14707D', '#138B98', '#22AFC0', '#5CCFDC', '#A3E8EF', '#ECFCFE'], accent: '#FDE68A', ink: '#ECFCFE', muted: '#5F7F85'},
  zeni: {background: '#070B1A', ramp: ['#0D1430', '#111B42', '#152358', '#182E74', '#1A3A94', '#1447E6', '#3B6CF0', '#6290F6', '#8EC5FF', '#C2DEFF', '#EFF6FF'], accent: '#8EC5FF', ink: '#EFF6FF', muted: '#5F6B8C', alt: '#7CE3A8'},
}

// ---------------------------------------------------------------- one scene per project
const PROJECTS = {
  andronix: {palette: P.andronix, seed: 3, draw(F) {
    const Hz = Math.round(DR * .7)
    sky(F, {sx: .5, sy: (Hz + 2) / DR, glow: 1.2, base: .09})
    sun(F, DC * .5, Hz + 2, DR * .3, Hz); water(F, Hz); glitter(F, DC * .5, Hz, DR * .3)
    title(F, 'ANDRONIX', {y: Math.round(DR * .16)})
    F.label('LINUX ON ANDROID', 1, true)
  }},

  lumoflo: {palette: P.sweetpea, seed: 11, draw(F) {
    // a shopfront at dusk: striped awning, a lit window of shelves, parcels stacked by the door
    sky(F, {sx: .5, sy: .55, glow: .9, base: .06})
    const g = 66
    F.each((x, y, v) => y >= g ? .07 + .05 * F.rnd(x, y) : v)
    const x0 = 34, x1 = 116, top = 30
    F.rect(x0, top, x1, g - 1, .16)
    for (let x = x0 - 3; x <= x1 + 3; x++) for (let y = top - 6; y <= top; y++) {
      const stripe = Math.floor((x - x0 + 3) / 5) % 2
      F.set(x, y, stripe ? .92 : .45, stripe ? 2 : 1)
    }
    for (let x = x0 - 3; x <= x1 + 3; x += 5) F.disc(x + 2, top + 1.5, 1.4, .9, 1)
    F.rect(x0 + 6, top + 7, x0 + 50, g - 8, 0, 3); F.frame(x0 + 6, top + 7, x0 + 50, g - 8, .6, 4)
    for (const sy of [top + 15, top + 23]) {
      for (let x = x0 + 8; x <= x0 + 48; x++) F.set(x, sy, .55, 4)
      for (let j = 0; j < 6; j++) { const bx = x0 + 10 + j * 6.5, h = 2 + Math.floor(F.rnd(j, sy) * 3); F.rect(bx, sy - h, bx + 3, sy - 1, .7 + .25 * F.rnd(j, sy + 1), j % 2 ? 1 : 0) }
    }
    F.rect(x1 - 24, top + 9, x1 - 8, g - 1, .1); F.frame(x1 - 24, top + 9, x1 - 8, g - 1, .6, 4); F.disc(x1 - 11, (top + g) / 2 + 4, .8, .95, 1)
    const box = (bx, by, w, h) => { F.rect(bx, by, bx + w, by + h, .5); F.frame(bx, by, bx + w, by + h, .85, 2); F.line(bx + w / 2, by, bx + w / 2, by + h, .95, 1) }
    box(x1 + 6, g - 8, 10, 7); box(x1 + 8, g - 15, 7, 6); box(x1 + 18, g - 6, 7, 5)
    title(F, 'LUMOFLO', {y: 6, max: 90})
    F.label('NOW POWERS SVVEETPEA.COM', 1, true)
  }},

  postsonar: {palette: P.sonar, seed: 5, draw(F) {
    F.each((x, y) => .04 + .03 * F.rnd(x, y))
    const cx = DC * .66, cy = DR * .54, R = DR * .44
    for (const r of [R * .25, R * .5, R * .75, R]) F.ring(cx, cy, r, .42, 4)
    F.line(cx - R, cy, cx + R, cy, .3, 4); F.line(cx, cy - R, cx, cy + R, .3, 4)
    // sweep: a fading wedge behind the beam
    const a0 = -.75
    for (let y = Math.floor(cy - R); y <= cy + R; y++) for (let x = Math.floor(cx - R); x <= cx + R; x++) {
      const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy)
      if (d > R || d < 1) continue
      let da = a0 - Math.atan2(dy, dx); while (da < 0) da += 6.2832
      if (da < 1.3) F.add(x, y, .7 * (1 - da / 1.3) ** 1.6)
    }
    F.line(cx, cy, cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, .97, 1)
    for (const [r, a] of [[.6, -1.1], [.82, -.95], [.38, -1.5], [.7, .9], [.5, 2.4], [.9, 3.6]])
      F.disc(cx + Math.cos(a) * R * r, cy + Math.sin(a) * R * r, 1.3, .97, a > -1.6 && a < -.7 ? 1 : 2)
    title(F, ['POST', 'SONAR'], {y: 12, x: 10, max: 60})
    F.label('POSTS IN YOUR VOICE', 1)
  }},

  svgweave: {palette: P.weave, seed: 8, draw(F) {
    // a woven field of sine threads behind a small node graph
    F.each((x, y) => {
      const a = Math.sin(x * .16 + Math.sin(y * .35) * 1.6), b = Math.sin(y * .5 + x * .04)
      return .06 + .2 * Math.max(0, a * b) + .05 * F.rnd(x, y)
    })
    const node = (x, y, w, h, hot) => { F.box(x, y, x + w, y + h, 0, hot ? .95 : .6, hot ? 1 : 4, 2); for (let j = 2; j < w - 2; j++) F.set(x + j, y + 2, .5, 4); F.disc(x, y + h / 2, 1, .95, 1); F.disc(x + w, y + h / 2, 1, .95, 1) }
    const N = [[14, 40, 20, 12], [14, 58, 20, 12], [62, 46, 22, 14], [110, 34, 24, 14, 1], [110, 56, 24, 14]]
    bezier(F, 34, 46, 62, 53, .85, 2); bezier(F, 34, 64, 62, 53, .85, 2)
    bezier(F, 84, 53, 110, 41, .95, 1); bezier(F, 84, 53, 110, 63, .85, 2)
    N.forEach(([x, y, w, h, hot]) => node(x, y, w, h, hot))
    // the render: a little animated star inside the hot node's preview
    const sx = 122, sy = 41
    for (let a = 0; a < 6.2832; a += .9) F.line(sx, sy, sx + Math.cos(a) * 4, sy + Math.sin(a) * 4 * .9, .95, 2)
    title(F, 'SVG WEAVE', {y: 8})
  }},

  'domain-brawl': {palette: P.brawl, seed: 4, draw(F) {
    // two names squaring up in a ring of candidate domains
    sky(F, {sx: .5, sy: .62, glow: 1.1, stars: false, base: .06})
    const g = 62
    F.each((x, y, v) => y >= g ? .12 + .08 * Math.max(0, Math.sin(x * .9)) * (y % 2) : v)
    for (const yy of [40, 46, 52]) for (let x = 14; x <= 136; x++) F.set(x, yy, .35, 4)
    for (const px of [14, 136]) F.rect(px - 1, 36, px + 1, g, .6, 4)
    ;['.COM', '.AI', '.DEV'].forEach((t, j) => F.text(t, 20 + (j % 2) * 6, 34 + j * 9, 1, .85, j % 2 ? 5 : 2))
    ;['.APP', '.IO', '.SH'].forEach((t, j) => F.text(t, 130 - textWidth(t, 1) - (j % 2) * 6, 34 + j * 9, 1, .85, j % 2 ? 1 : 2))
    const vw = textWidth('VS', 3); F.rect(DC / 2 - vw / 2 - 3, 40, DC / 2 + vw / 2 + 2, 40 + 23, 0, 3); F.text('VS', Math.round(DC / 2 - vw / 2), 42, 3, .97, 1)
    title(F, ['DOMAIN', 'BRAWL'], {y: 4, max: 90})
  }},

  rapid: {palette: P.rapid, seed: 9, draw(F) {
    // speed streaks rushing past a stack of monorepo packages
    F.each((x, y) => {
      const lane = F.rnd(0, y), len = 20 + lane * 60, off = (lane * 900) % 150
      const t = ((x - off) % 150 + 150) % 150
      return .04 + (t < len ? .55 * (t / len) ** 2 : 0) * (lane > .45 ? 1 : .35)
    })
    const bx = 92, labels = ['WEB', 'API', 'DB']
    labels.forEach((l, j) => {
      const y = 24 + j * 11
      F.box(bx, y, bx + 40, y + 8, 0, j === 0 ? .95 : .6, j === 0 ? 1 : 4, 2)
      F.text(l, bx + 4, y + 1, 1, .95, 2)
      for (let x = bx + 4 + textWidth(l, 1) + 4; x < bx + 36; x += 2) F.set(x, y + 4, .5)
    })
    title(F, 'RAPID', {y: 12, x: 10, max: 75})
    F.label('TYPESAFE SAAS STARTER', 1)
  }},

  twofer: {palette: P.twofer, seed: 6, draw(F) {
    // two agents arguing: their waves meet in the middle and resolve into one line
    F.each((x, y) => .05 + .04 * F.rnd(x, y))
    const cy = DR * .6
    for (let x = 6; x <= DC - 6; x++) {
      const t = x / DC, mix = Math.min(1, Math.max(0, (t - .62) / .14))
      const a = Math.sin(x * .32) * 11 * (1 - mix), b = Math.sin(x * .23 + 2) * 11 * (1 - mix)
      if (t < .76) { F.disc(x, cy + a, .9, .9, 1); F.disc(x, cy + b, .9, .9, 5) }
      else F.disc(x, cy, 1, .97, 2)
    }
    const bubble = (x, y, w, h, k) => { F.box(x, y, x + w, y + h, 0, .9, k, 2); F.line(x + 4, y + h, x + 2, y + h + 3, .9, k); for (let j = 0; j < 3; j++) F.disc(x + 6 + j * 5, y + h / 2, 1, .9, k) }
    bubble(14, 64, 22, 9, 1); bubble(42, 64, 22, 9, 5)
    F.text('SPEC', 124, Math.round(cy) - 10, 1, .97, 2)
    title(F, 'TWOFER', {y: 8})
  }},

  runa: {palette: P.runa, seed: 12, draw(F) {
    // saved things as stars; search draws a constellation between the ones that mean the same
    sky(F, {sx: .7, sy: .2, glow: .6, base: .05, haze: .25})
    const pts = []
    for (let j = 0; j < 46; j++) pts.push([8 + F.rnd(j, 1) * 134, 34 + F.rnd(j, 2) * 42])
    pts.forEach(([x, y]) => F.disc(x, y, .8, .55, 4))
    const hit = [3, 11, 17, 25, 30, 38].map(i => pts[i])
    for (let j = 1; j < hit.length; j++) F.line(hit[j - 1][0], hit[j - 1][1], hit[j][0], hit[j][1], .7, 2, 1.6)
    hit.forEach(([x, y]) => F.disc(x, y, 1.6, .97, 1))
    // a bookmark ribbon
    const rx = 120, ry = 6
    F.rect(rx, ry, rx + 12, ry + 22, .9, 2)
    for (let y = ry + 16; y <= ry + 22; y++) { const h = y - (ry + 16); for (let x = rx + 6 - h; x <= rx + 6 + h; x++) F.set(x, y, 0, 3) }
    title(F, 'RUNA', {y: 8, x: 10, max: 90})
    F.label('FIND IT BY MEANING', 1)
  }},

  zeni: {palette: P.zeni, seed: 7, draw(F) {
    // savings bars climbing toward a dotted goal line
    F.each((x, y) => .05 + .1 * (y / DR) ** 2 + .03 * F.rnd(x, y))
    const base = 58, goal = 22
    for (let x = 66; x <= DC - 8; x += 2) F.set(x, goal, .9, 5)
    F.text('GOAL', DC - 8 - textWidth('GOAL', 1), goal - 9, 1, .9, 5)
    const n = 12
    for (let j = 0; j < n; j++) {
      const x = 40 + j * 8.5, h = 4 + (j / (n - 1)) ** 1.4 * 32 + F.rnd(j, 3) * 3
      for (let y = base - h; y <= base; y++) for (let xx = x; xx <= x + 5; xx++) F.set(xx, y, .35 + .6 * (1 - (y - (base - h)) / h) * (j / n), j === n - 1 ? 1 : 0)
    }
    for (let x = 8; x <= DC - 8; x++) F.set(x, base + 1, .6, 4)
    title(F, 'ZENI', {y: 8, x: 10, max: 60})
    F.label('PERSONAL FINANCE AGENT', 1)
  }},
}


// ---------------------------------------------------------------- blog covers -> public/images/blogs/ascii/<slug>.png
const P2 = {
  lime: {background: '#0C1108', ramp: ['#141C0E', '#1B2612', '#243317', '#30461B', '#3E5D1F', '#507A22', '#669A27', '#84BC34', '#A7D85C', '#CDEB9E', '#F4FBE8'], accent: '#F2B84B', ink: '#F4FBE8', muted: '#6B7A5C'},
  amber: {background: '#120D06', ramp: ['#1E160B', '#2A1E0E', '#3A2911', '#523813', '#6F4B14', '#915F14', '#B87716', '#DE9420', '#F2B451', '#F9D697', '#FFF7E8'], accent: '#7DD3FC', ink: '#FFF7E8', muted: '#857560'},
}
const box = (F, x, y, w, h, label, hot) => {
  F.box(x, y, x + w, y + h, 0, hot ? .95 : .6, hot ? 1 : 4, 2)
  if (label) F.text(label, Math.round(x + (w - textWidth(label, 1)) / 2), Math.round(y + (h - 7) / 2) + 1, 1, .95, 2)
}
const arrow = (F, x0, y, x1, k = 2) => { for (let x = x0; x <= x1; x += 2) F.set(x, y, .85, k); F.set(x1 - 1, y - 1, .9, k); F.set(x1 - 1, y + 1, .9, k) }
const dust = F => F.each((x, y) => .04 + .05 * (y / DR) ** 2 + .03 * F.rnd(x, y))
function termWindow(F, x0, y0, x1, y1, rows, prompt = '$') {
  F.box(x0, y0, x1, y1, 0, .6, 4, 2)
  for (const [j, k] of [[0, 1], [1, 2], [2, 4]]) F.disc(x0 + 4 + j * 4, y0 + 3, 1, .85, k)
  for (let x = x0 + 1; x < x1; x++) F.set(x, y0 + 6, .35, 4)
  for (let r = 0, y = y0 + 9; r < rows && y + 7 < y1; r++, y += 9) {
    F.text(prompt, x0 + 4, y, 1, .95, 1)
    const len = 6 + Math.floor(F.rnd(r, 50) * (x1 - x0 - 22))
    for (let c = 0; c < len; c++) if (F.rnd(c, r + 60) > .15) F.set(x0 + 12 + c, y + 3, .55 + .35 * F.rnd(c, r))
  }
}

const COVERS = {
  'auto-record-gather-meetings-in-granola': {palette: P2.lime, seed: 31, draw(F) {
    dust(F)
    const cx = 112, cy = 50
    for (const r of [6, 11, 16, 21]) F.ring(cx, cy, r, .35 + (21 - r) * .02, 4)
    F.disc(cx, cy, 4.5, .97, 1)
    for (let x = 8; x < 86; x++) { const h = Math.abs(Math.sin(x * .5) * Math.sin(x * .13)) * 9; for (let y = -h; y <= h; y += 1.5) F.set(x, 46 + y, .5 + .4 * (h / 9), x % 9 ? 0 : 2) }
    title(F, 'GRANOLA', {y: 8, x: 8, max: 100})
    F.label('AUTO-RECORD GATHER', 1)
  }},
  'automate-resume-deployment-github-actions-latex': {palette: P.rapid, seed: 32, draw(F) {
    dust(F)
    box(F, 8, 40, 30, 12, 'TEX', 0); arrow(F, 40, 46, 54)
    box(F, 56, 40, 34, 12, 'CI', 1); arrow(F, 92, 46, 106)
    box(F, 108, 40, 34, 12, 'PDF', 0)
    for (let x = 108; x <= 142; x += 2) F.set(x, 60, .5, 4)
    F.text('R2', 120, 63, 1, .9, 1)
    title(F, 'RESUME CI', {y: 8})
  }},
  'build-complete-rag-agent-mastra-ai-sdk': {palette: P.weave, seed: 33, draw(F) {
    dust(F)
    for (let j = 0; j < 4; j++) { const x = 12 + j * 3, y = 36 + j * 3; F.rect(x, y, x + 22, y + 26, 0, 3); F.frame(x, y, x + 22, y + 26, .65, 4); for (let r = 4; r < 24; r += 3) for (let c = 3; c < 16 + (r % 5); c++) F.set(x + c, y + r, .45) }
    arrow(F, 46, 52, 62)
    const g = [[72, 44], [86, 36], [100, 50], [88, 60], [114, 40], [126, 56], [138, 44]]
    ;[[0, 1], [1, 2], [0, 3], [2, 3], [2, 4], [4, 6], [2, 5], [5, 6]].forEach(([a, b]) => F.line(g[a][0], g[a][1], g[b][0], g[b][1], .5, 4, 1.5))
    g.forEach(([x, y], j) => F.disc(x, y, j === 2 ? 2.4 : 1.6, .95, j === 2 ? 1 : 2))
    title(F, 'RAG AGENT', {y: 8})
  }},
  'complete-typesafe-rest-api-with-ts-rest': {palette: P.zeni, seed: 34, draw(F) {
    dust(F)
    box(F, 6, 48, 46, 18, 'CLIENT', 0); box(F, 98, 48, 46, 18, 'SERVER', 0)
    box(F, 58, 32, 34, 10, 'TYPES', 1)
    arrow(F, 54, 54, 96); for (let x = 96; x >= 54; x -= 2) F.set(x, 60, .85, 5); F.set(55, 59, .9, 5); F.set(55, 61, .9, 5)
    F.line(75, 42, 75, 53, .8, 1, 2)
    title(F, 'TS-REST', {y: 4, max: 130})
  }},
  'how-ai-agents-work-under-the-hood': {palette: P.twofer, seed: 35, draw(F) {
    dust(F)
    const cx = DC / 2, cy = 52, R = 18
    for (let a = 0; a < 6.2832; a += .05) F.set(cx + Math.cos(a) * R * 2.2, cy + Math.sin(a) * R, .45, 4)
    ;[['THINK', -1.57], ['TOOL', .52], ['OBSERVE', 2.62]].forEach(([l, a], j) => { const x = cx + Math.cos(a) * R * 2.2, y = cy + Math.sin(a) * R, w = textWidth(l, 1) + 8; box(F, Math.round(x - w / 2), Math.round(y - 5), w, 10, l, j === 1) })
    title(F, 'AGENT LOOP', {y: 4, max: 140})
  }},
  'how-i-set-up-an-openclawd-that-remembers-things': {palette: P.runa, seed: 36, draw(F) {
    const Hz = Math.round(DR * .72)
    sky(F, {sx: .7, sy: (Hz + 2) / DR, glow: 1.1, base: .07})
    sun(F, DC * .7, Hz + 2, DR * .2, Hz); water(F, Hz)
    for (let t = 0; t <= 1; t += .012) { const x = 10 + t * 90, y = 58 - Math.sin(t * Math.PI) * 26; if ((t * 100 | 0) % 3) F.set(x, y, .9, 1) }
    F.disc(100, 58, 1.8, .97, 2)
    title(F, 'AUTOPILOT', {y: 6})
  }},
  'how-to-build-products-people-use': {palette: P.andronix, seed: 37, draw(F) {
    const Hz = Math.round(DR * .7)
    sky(F, {sx: .5, sy: (Hz + 2) / DR, glow: 1.2, base: .09})
    sun(F, DC * .5, Hz + 2, DR * .3, Hz); water(F, Hz); glitter(F, DC * .5, Hz, DR * .3)
    title(F, ['BUILD WHAT', 'PEOPLE USE'], {y: 4})
  }},
  'i-built-a-tui-to-stop-losing-claude-sessions': {palette: P.sonar, seed: 38, draw(F) {
    dust(F)
    termWindow(F, 12, 30, 138, 76, 4, '>')
    F.rect(18, 39 + 9, 132, 39 + 15, .18); F.text('>', 16, 48, 1, .97, 1)
    title(F, 'SESSIONS', {y: 4})
  }},
  'stop-spending-weeks-finding-domains': {palette: P.brawl, seed: 39, draw(F) {
    dust(F)
    const tl = ['.COM', '.DEV', '.AI', '.IO', '.APP', '.SH', '.CO', '.SO', '.XYZ']
    tl.forEach((t, j) => { const x = 8 + (j % 3) * 50 + F.rnd(j, 2) * 10, y = 34 + Math.floor(j / 3) * 14; F.text(t, Math.round(x), Math.round(y), 1, j === 4 ? .97 : .7, j === 4 ? 1 : j % 2 ? 2 : 5) })
    title(F, 'DOMAINS', {y: 6})
  }},
  'the-agentic-system-of-an-applied-ai-engineer': {palette: P2.amber, seed: 40, draw(F) {
    dust(F)
    for (let j = 0; j < 6; j++) { const x = 8 + (j % 3) * 47, y = 30 + Math.floor(j / 3) * 25; termWindow(F, x, y, x + 42, y + 21, 1, j === 1 ? '>' : '$') }
    title(F, 'AGENTS', {y: 4})
  }},
  'try-catch-is-a-lie': {palette: P.brawl, seed: 41, draw(F) {
    dust(F)
    F.box(40, 32, 110, 56, 0, .85, 2, 2)
    F.text('TRY', 47, 36, 1, .95, 2); F.text('CATCH', 47, 46, 1, .95, 2)
    for (let j = 0; j < 46; j++) { const x = 44 + F.rnd(j, 1) * 62, y = 58 + F.rnd(j, 2) * 22; F.disc(x, y, .8, .7 + .3 * F.rnd(j, 3), j % 4 ? 0 : 1) }
    for (let x = 60; x < 70; x++) F.set(x, 56, 0, 3)
    title(F, 'TRY CATCH', {y: 4})
  }},
  'turning-code-into-data-demystifying-asts': {palette: P.weave, seed: 42, draw(F) {
    dust(F)
    const n = [[75, 34, 'PROG'], [45, 50, 'FN'], [105, 50, 'VAR'], [30, 66, 'ID'], [60, 66, 'BODY'], [105, 66, 'LIT']]
    ;[[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]].forEach(([a, b]) => F.line(n[a][0], n[a][1] + 5, n[b][0], n[b][1] - 5, .6, 4, 1.2))
    n.forEach(([x, y, l], j) => { const w = textWidth(l, 1) + 8; box(F, Math.round(x - w / 2), y - 5, w, 10, l, j === 0) })
    title(F, 'AST', {y: 4, max: 60})
  }},
  'why-i-love-mastra': {palette: P.sonar, seed: 43, draw(F) {
    dust(F)
    const N = [[6, 48, 'INPUT'], [55, 36, 'AGENT'], [55, 60, 'MEMORY'], [104, 48, 'TOOLS']]
    bezier(F, 46, 53, 55, 41, .8, 2); bezier(F, 46, 53, 55, 65, .8, 2)
    bezier(F, 95, 41, 104, 53, .9, 1); bezier(F, 95, 65, 104, 53, .8, 2)
    N.forEach(([x, y, l], j) => box(F, x, y, 40, 10, l, j === 1))
    title(F, 'MASTRA', {y: 6})
  }},
}
for (const [slug, c] of Object.entries(COVERS)) c.out = `../../blogs/ascii/${slug}.png`
const ALL = {...PROJECTS, ...COVERS}

async function make(slug) {
  const p = ALL[slug], {cell, cols, rows} = grid(W, H)
  const F = new Field(cols, rows, p.seed)
  p.draw(F)
  const px = Buffer.from(render(F, W, H, cell, p.palette))
  const out = join(OUT, p.out || `${slug}.png`)
  mkdirSync(dirname(out), {recursive: true})
  await sharp(px, {raw: {width: W, height: H, channels: 3}}).png({palette: true, colours: 96, effort: 10, compressionLevel: 9}).toFile(out)
  console.log(out)
}

mkdirSync(OUT, {recursive: true})
const want = process.argv.slice(2)
for (const slug of want.length ? want : Object.keys(ALL)) await make(slug)
