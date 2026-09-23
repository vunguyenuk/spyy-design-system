# Spyy Design System → Figma

File: **Spyy Design Tokens** — `https://www.figma.com/design/HxFdyOnSbDlrZ6tNhblWtD`
Team: Design team. Generated 2026-09-23 from `tokens.css`.

The Figma file is a **mirror**, not a second source of truth. `tokens.css` is the
source; `tokens.w3c.json` is the machine-readable export of it; the Figma
variables are built from that export. When a token changes, it changes in
`tokens.css` and the export is regenerated — never the other way round.

---

## 1. What went in, and where

The three-tier architecture the CSS uses survives the trip, because Figma
collections nest the same way variables do.

| Collection | Modes | Count | What it holds |
|---|---|---|---|
| `1. Primitives` | `Value` | **292** | 243 colours (10 hue ramps + grey + shade + neutral + the alpha ladders), 46 floats (space, radius, border, icon, weight), 3 font-family strings |
| `2. Semantic` | `Dark`, `Light` | **115** | Every `--hf-color-*` role: `text/*`, `background/*`, `border/*`, `icon/*`, `state/*`, `divider/*` … |
| `3. Type scale` | `Desktop`, `Tablet`, `Mobile` | **55** | `size/*`, `line-height/*` (the responsive UI ladder) and `scale/*` (the fixed marketing steps) |

**462 variables total.**

### Aliases, not copies

105 of the 115 semantic variables are `VARIABLE_ALIAS` values pointing at a
primitive — the same indirection as `var(--hf-color-grey-550)` in CSS. Change
`color/grey/550` in Figma and every role that reads it moves, exactly as a
palette swap works in the stylesheet. Only ten carry a raw colour, and each has
a reason:

- `glass/dark`, `glass/light`, `background/glass`, `divider/primary`,
  `divider/secondary`, `magenta/alpha` — alpha values that no primitive ramp
  step carries.

### Scopes

Every variable was created with an explicit `scopes` array rather than Figma's
`ALL_SCOPES` default, so the property pickers stay usable: `text/*` offers
itself only for text fills, `border/*` and `divider/*` only for strokes,
`state/*-glow` only for effects and strokes, spacing only for gaps, radius only
for corner radius, weights only for font weight.

### Text styles are named by role, not by step

The variables carry the numeric ladder — `size/100`, `size/200`, `line-height/600`. The **styles do not
repeat it.** A picker listing `UI/050/Regular`, `UI/100/Medium`, `UI/100/SemiBold` … makes a designer learn
the token layer before they can set a piece of text, and it says nothing about whether a step belongs on a
landing page or inside the product.

So the 28 text styles are organised **surface first, then role**:

| | |
|---|---|
| `Landing/Display`, `Landing/H1`–`H6` | marketing headings — Archivo Black on Display and H1–H3 |
| `Landing/Body/*`, `Landing/Caption/*` | marketing copy |
| `App/Page title` | the one title at the top of a screen |
| `App/Title/Large` · `Medium` · `Small` | panel header · section title · card title |
| `App/Body/Large` · `Default` · `Small` | composer copy · alerts and panels · helper text |
| `App/Label/Large` · `Default` · `Small` · `Micro` | control labels, smallest to largest |
| `App/Numeric/XL` · `Large` · `Medium` · `Tabular` | the score, gauge figures, stat figures, number columns |

Those role names are not invented — each was read off where the step is actually used in the stylesheet.
`size/200` carries alert and breadcrumb copy, so it is Body/Default; `size/200` at medium weight carries
button and chip labels, so it is Label/Default; `size/300` at semi-bold carries card and empty-state titles,
so it is Title/Small.

The two groups differ in one way that matters: **`App/*` binds to the Type scale collection and resizes with
the Desktop / Tablet / Mobile mode. `Landing/*` binds to the fixed marketing scale and does not.** That is
the whole reason the third collection exists.

If you need a step that has no role, bind the variable directly. A style exists to name a decision, and an
unnamed step has not had one made about it yet.

---

## 2. What could not be a variable

Figma has no gradient or effect variable type, so two families became **styles**:

| Style prefix | Count | Source |
|---|---|---|
| `elevation/*` | 9 | the `--hf-shadow-*` ladder |
| `gradient/*` | 8 | the `--hf-gradient-*` set |

Two notes on the conversion:

- The elevation ladder is mostly an **inset sheen plus a drop shadow**, so each
  style holds two effects: a Figma `INNER_SHADOW` and a `DROP_SHADOW`. A tool
  that reads only the first effect will miss half of every elevation.
- `glass-sheen` and `glass-sheen-alt` are two-layer CSS backgrounds. CSS paints
  the first layer on top; Figma paints the last in the array on top. The layer
  order is therefore **reversed** in the style, which is correct, not a bug.
- The radial badge gradients use a `gradientTransform` derived from the CSS
  `ellipse <rx> <ry> at <cx> <cy>` values:
  `[[0.5/rx, 0, 0.5 - 0.5·cx/rx], [0, 0.5/ry, 0.5 - 0.5·cy/ry]]`.

**Not carried over at all:** `color-mix()` (`--q-tint-text`), `calc()`
expressions, `backdrop-filter`, the motion tokens (durations and easings), and
the breakpoint tokens. Figma has no representation for any of them. The
responsive type ladder is the one exception — its three breakpoints became the
three modes of collection 3, which is the whole reason that collection exists.

---

## 3. Re-syncing

```
npm i -D playwright                  # or export PLAYWRIGHT_PATH=<global index.js>
node extract.mjs   # resolve every token in a real browser, 3 widths × 2 themes
node prep.mjs      # → .tokens-cache/figma-tokens.json  (aliases kept, rem → px)
node w3c.mjs       # → tokens.w3c.json                  (the committed export)
```

One caveat worth knowing before you trust a diff: `prep.mjs` parses the two
main theme blocks, so the ten roles that live in the `:root` addendum and its
light counterpart — `text/on-tint`, `skeleton`, the three `state/*-glow` keys,
`separator/success` and the glass and alpha fills — are listed explicitly in
the `EXTRA` array at the bottom of `w3c.mjs`. Add a token there and it will be
exported; forget to, and it will be silently missing. That array is the one
hand-maintained thing in the pipeline.

`extract.mjs` reads token **names** from the CSS on disk and their **values**
from `getComputedStyle` in the page, at three viewport widths and both themes.
That matters: a token's value is not what the declaration says, it is what the
cascade resolves it to. Reading the declaration would have missed every
responsive step and every theme override.

Push to Figma with `use_figma`, matching on variable name — the scripts skip a
name that already exists, so a re-run adds what is new and leaves the rest
alone.

---

## 4. What the trip found

Exporting is an audit. Resolving every token in both themes surfaced four
literals that had survived the palette swap because they sat outside the
palette block, where a search for the old brand colours would not look:

| Token | Was | Now |
|---|---|---|
| `--hf-color-separator-success` | `#00c314` | `var(--hf-color-green-500)` |
| `--hf-color-notification-unread` | `#7a58ff` | `var(--hf-color-purple-500)` |
| `--q-tint-compute` | `#35c6a8` | `var(--hf-color-cyan-300)` |
| `--q-tint-text` mix operand | `#000000` | `var(--hf-color-grey-600)` |

Plus one fallback in `components.css` — `var(--hf-color-separator-success, #00c314)`
— where the fallback was the stale colour the variable had just been moved off.

The rule this keeps proving: **a literal colour anywhere outside the palette
block is a colour that will not move when the palette moves.**
