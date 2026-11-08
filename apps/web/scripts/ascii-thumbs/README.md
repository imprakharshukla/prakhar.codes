# ASCII halftone thumbnails

Generates every project thumbnail and blog cover on the site in one style: a grid of halftone dots, a dot-matrix title, one palette per image. The look is inspired by ascii.rest; the engine is adapted from the Andronix brand art (`andronix/icon-2.0/ascii/engine.mjs`). No third-party code, only `sharp`.

## Run

```sh
cd apps/web
pnpm thumbs                         # every project + blog cover
pnpm thumbs runa why-i-love-mastra  # only these slugs
```

Output (1280x720 PNG, 16:9, also used as the OG image):

- projects: `public/images/projects/ascii/<slug>.png` -> set `heroImage` in `src/content/project/<slug>.md`
- blog posts: `public/images/blogs/ascii/<slug>.png` -> set `heroImage` in `src/content/blog/<slug>.md(x)`

## Files

- `engine.mjs`: the grid (`Field`), noise (`fbm`, `hash`), the 5x7 dot font (`text`, `textWidth`), shapes (`rect`, `frame`, `box`, `line`, `disc`, `ring`, `label`) and the renderer. Palette is passed per render.
- `thumbs.mjs`: shared scene pieces (`sky`, `sun`, `water`, `glitter`, `title`, `bezier`, `box`, `arrow`, `termWindow`, `dust`), palettes (`P`, `P2`), then one entry per image in `PROJECTS` and `COVERS`.

## Add an image

1. Add an entry to `PROJECTS` (keyed by project slug) or `COVERS` (keyed by blog slug) in `thumbs.mjs`: `{palette, seed, draw(F) { ... }}`.
2. Draw on the 150x79 design grid (bigger outputs extend the margins). Brightness 0..1; kinds: `0` ramp colour, `1` accent, `2` ink, `3` carve (background), `4` muted, `5` alt.
3. Use `title(F, 'NAME' | ['TWO', 'LINES'], {y, x, max})` for the dot title; it picks the largest scale that fits `max` cells. Optional `F.label('SHORT TAGLINE', 1, centered)` along the bottom.
4. Run `pnpm thumbs <slug>`, look at the PNG, fix overlaps, then point the post's `heroImage` at it.

Rules: no logos or third-party marks (the halftoned Andronix penguin was tried and dropped); keep titles short (the font is uppercase A-Z, 0-9 and `. - : $ ~ { } < > /`); keep text away from the bottom label.
