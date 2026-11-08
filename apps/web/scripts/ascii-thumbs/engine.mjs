// Halftone-dot ASCII engine, adapted from Prakhar's Andronix brand art (andronix/icon-2.0/ascii/engine.mjs).
// Same grid, dot font, noise and renderer; the palette is passed per render so every project gets its own ink.
// Original work; no third-party code. Needs only sharp.
import sharpLib from 'sharp'

export const sharp = sharpLib
export const DC = 150, DR = 79   // the design grid every scene draws on (1200x630 at 8 px a cell)

const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
export const KIND = {ramp: 0, accent: 1, ink: 2, carve: 3, muted: 4, alt: 5}
export const DOT_SIZES = [0, 0.15, 0.27, 0.38, 0.47]
export const LEVELS = [0.13, 0.3, 0.52, 0.76]

// ---------------------------------------------------------------- noise (seeded)
export const hash = (x, y, s = 0) => {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2147483647)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}
const smooth = t => t * t * (3 - 2 * t)
function noise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), u = smooth(x - xi), v = smooth(y - yi)
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
export const fbm = (x, y, s) => .55 * noise(x, y, s) + .3 * noise(x * 2.1, y * 2.1, s) + .15 * noise(x * 4.3, y * 4.3, s)

// ---------------------------------------------------------------- dot font (5x7), one font pixel = scale x scale cells
const FONT = {
  A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01111 10000 10000 10000 10000 10000 01111', D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01111 10000 10000 10011 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001',
  I: '11111 00100 00100 00100 00100 00100 11111', J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 11001 10101 10011 10001 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110', P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110', V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 10101 01010', X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10011 10101 10101 10101 11001 01110', 1: '00100 01100 00100 00100 00100 00100 01110',
  2: '01110 10001 00001 00010 00100 01000 11111', 3: '11110 00001 00001 01110 00001 00001 11110',
  4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000',
  8: '01110 10001 10001 01110 10001 10001 01110', 9: '01110 10001 10001 01111 00001 00010 01100',
  '.': '0 0 0 0 0 0 1', '-': '000 000 000 111 000 000 000', ':': '0 0 1 0 1 0 0',
  '$': '00100 01111 10100 01110 00101 11110 00100', '~': '00000 00000 01000 10101 00010 00000 00000',
  '{': '00011 00100 00100 01000 00100 00100 00011', '}': '11000 00100 00100 00010 00100 00100 11000',
  '<': '00010 00100 01000 10000 01000 00100 00010', '>': '01000 00100 00010 00001 00010 00100 01000',
  '/': '00001 00010 00010 00100 01000 01000 10000', ' ': '000 000 000 000 000 000 000',
}
const glyph = c => (FONT[c] || FONT[' ']).split(' ')
export const textWidth = (s, scale) => [...s.toUpperCase()].reduce((w, c) => w + (glyph(c)[0].length + 1) * scale, -scale)

// ---------------------------------------------------------------- the grid
// Scenes draw in design coordinates (0..DC, 0..DR); the real grid may be bigger, with the design centred.
export class Field {
  constructor(cols, rows, seed) {
    Object.assign(this, {cols, rows, seed, ox: Math.round((cols - DC) / 2), oy: Math.round((rows - DR) / 2)})
    this.V = new Float32Array(cols * rows); this.K = new Uint8Array(cols * rows)
    this.X0 = -this.ox; this.X1 = cols - 1 - this.ox; this.Y0 = -this.oy; this.Y1 = rows - 1 - this.oy
  }
  rnd(i, j = 0) { return hash(i, j, this.seed * 7919 + 13) }
  idx(x, y) { x = Math.round(x) + this.ox; y = Math.round(y) + this.oy; return x >= 0 && x < this.cols && y >= 0 && y < this.rows ? y * this.cols + x : -1 }
  get(x, y) { const i = this.idx(x, y); return i < 0 ? 0 : this.V[i] }
  set(x, y, v, k = 0) { const i = this.idx(x, y); if (i >= 0) { this.V[i] = v; this.K[i] = k } }
  add(x, y, dv) { const i = this.idx(x, y); if (i >= 0) this.V[i] += dv }
  each(f) {   // every real cell, in design coordinates; f returns a new brightness or undefined
    for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) {
      const i = y * this.cols + x, r = f(x - this.ox, y - this.oy, this.V[i])
      if (r !== undefined) this.V[i] = r
    }
  }
  rect(x0, y0, x1, y1, v, k = 0) { for (let y = Math.round(y0); y <= y1; y++) for (let x = Math.round(x0); x <= x1; x++) this.set(x, y, v, k) }
  frame(x0, y0, x1, y1, v, k = 0, r = 0) {   // outline; r cuts the corners
    for (let x = x0 + r; x <= x1 - r; x++) { this.set(x, y0, v, k); this.set(x, y1, v, k) }
    for (let y = y0 + r; y <= y1 - r; y++) { this.set(x0, y, v, k); this.set(x1, y, v, k) }
    for (let j = 1; j < r; j++) { this.set(x0 + j, y0 + r - j, v, k); this.set(x1 - j, y0 + r - j, v, k); this.set(x0 + j, y1 - r + j, v, k); this.set(x1 - j, y1 - r + j, v, k) }
  }
  box(x0, y0, x1, y1, fill, edge, k = 0, r = 2) {   // a rounded box (carved when fill is 0) with an outline
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++)
      if (Math.min(x - x0, x1 - x) + Math.min(y - y0, y1 - y) >= r) this.set(x, y, fill, fill ? 0 : 3)
    if (edge) this.frame(x0, y0, x1, y1, edge, k, r)
  }
  line(x0, y0, x1, y1, v, k = 0, step = 1) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / step
    for (let j = 0; j <= n; j++) this.set(x0 + (x1 - x0) * j / n, y0 + (y1 - y0) * j / n, v, k)
  }
  disc(cx, cy, r, v, k = 0) { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) this.set(x, y, v, k) }
  ring(cx, cy, r, v, k = 0, sy = 1, from = 0, to = 6.2832) {
    const n = Math.ceil(r * 7)
    for (let j = 0; j <= n; j++) { const a = from + (to - from) * j / n; this.set(cx + Math.cos(a) * r, cy + Math.sin(a) * r * sy, v, k) }
  }
  text(s, x, y, scale, v, k = 2) {
    for (const c of s.toUpperCase()) {
      const g = glyph(c)
      g.forEach((row, gy) => [...row].forEach((on, gx) => {
        if (on === '1') for (let a = 0; a < scale; a++) for (let b = 0; b < scale; b++) this.set(x + gx * scale + b, y + gy * scale + a, v, k)
      }))
      x += (g[0].length + 1) * scale
    }
  }
  label(s, sc = 2, center = false) {   // a short label, bottom left (or centred) of the design
    if (!s) return
    const w = textWidth(s, sc), x = center ? Math.round((DC - w) / 2) : 8
    this.rect(x - 3, DR - 9 - 7 * sc - 3, x + w + 2, DR - 6, 0, 3)
    this.text(s, x, DR - 9 - 7 * sc, sc, .95, 2)
  }
}

// cell size for an output: the design fills the width or the height, whichever fits first
export function grid(W, H) {
  const cell = Math.min(W / DC, H / (DR - 1))
  return {cell, cols: Math.ceil(W / cell), rows: Math.ceil(H / cell)}
}

// ---------------------------------------------------------------- raster (RGB, no alpha)
export function render(F, W, H, cell, palette) {
  const RAMP = palette.ramp.map(rgb)
  const SPECIAL = {1: rgb(palette.accent), 2: rgb(palette.ink), 4: rgb(palette.muted), 5: rgb(palette.alt || palette.accent)}
  const rampColour = v => {
    const p = Math.min(1, Math.max(0, v)) * (RAMP.length - 1), a = Math.floor(p), b = Math.min(a + 1, RAMP.length - 1), f = p - a
    return RAMP[a].map((c, k) => Math.round(c + (RAMP[b][k] - c) * f))
  }
  const px = new Uint8Array(W * H * 3), bg = rgb(palette.background), [L1, L2, L3, L4] = LEVELS
  for (let i = 0; i < W * H; i++) px.set(bg, i * 3)
  for (let y = 0; y < F.rows; y++) for (let x = 0; x < F.cols; x++) {
    const i = y * F.cols + x, k = F.K[i]
    if (k === KIND.carve) continue
    const v = Math.min(1, Math.max(0, F.V[i])), lvl = v < L1 ? 0 : v < L2 ? 1 : v < L3 ? 2 : v < L4 ? 3 : 4
    if (!lvl) continue
    const col = SPECIAL[k] || rampColour(v), r = DOT_SIZES[lvl] * cell
    const cx = x * cell + cell / 2, cy = y * cell + cell / 2
    for (let py = Math.floor(cy - r - 1); py <= cy + r + 1; py++) for (let qx = Math.floor(cx - r - 1); qx <= cx + r + 1; qx++) {
      if (qx < 0 || qx >= W || py < 0 || py >= H) continue
      const a = Math.min(1, Math.max(0, r - Math.hypot(qx + .5 - cx, py + .5 - cy) + .5))
      if (!a) continue
      const o = (py * W + qx) * 3
      for (let c = 0; c < 3; c++) px[o + c] = Math.round(px[o + c] + (col[c] - px[o + c]) * a)
    }
  }
  return px
}
