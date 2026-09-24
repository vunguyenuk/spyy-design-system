# Spyy Design System

A design system audited out of shipped products, then fitted to the **spyy** product brief. Open `index.html` — no build step.

## Structure

Four levels. Each answers a different question, and the answer at one level binds the next.

| | | |
|---|---|---|
| **Foundations** | `foundations.html` | What are the raw decisions? Colour, type, space, radius, border, elevation, icons, motion, layout. |
| **Components** | `components.html` | What is the smallest usable piece? 44 primitives with every state, plus a property reference extracted from the CSS itself. |
| **Patterns** | `patterns.html` | How does spyy say this? Scoring, confidence, async scans, attribution, pickers, results, editor, account, composer — and a states & properties matrix for all of them. |
| **Templates** | `templates.html` | What does the screen look like? Four screens, one per step of the flow. |

If a template needs something that is not in Patterns, that is a gap in Patterns — not a licence to
improvise on the screen.

## Files

| File | What it is |
|---|---|
| `tokens.css` | Tier 1 primitives → Tier 2 semantics (dark + derived light) → text styles. Standalone. |
| `components.css` | 44 components. Reads Tier-2 semantics only, so themes and tints flow through. Standalone. |
| `patterns.css` | 18 composed product patterns for the **app**. Introduces no new colour, radius, duration or type size. |
| `landing.css` | 13 marketing components for the **landing page** — section, hero, feature, grid, plan, quote, logos, CTA, nav, footer. Introduces no new colour or type size. |
| `docs.css`, `shell.js`, `app.js`, `icons.js` | This reference site only. **Not** part of the system. |
| `GAPS.md` | The audit of spyy's needs against the system, written before anything new was built. |
| `EVIDENCE.md` | Provenance for every value — confirmed, inferred, approximate, and how each was established. |
| `_audit/sheets/` | Twelve contact sheets indexing all 557 captures by screen number. |

## Using it

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components.css">
<link rel="stylesheet" href="patterns.css">   <!-- app screens -->
<link rel="stylesheet" href="landing.css">    <!-- marketing pages -->

<html data-theme="dark">   <!-- or "light" -->
```

`patterns.css` and `landing.css` are the two surfaces, and a page loads one of them, not
both. An app screen never needs a hero; a marketing page never needs a metric row.

One class plus `data-*` properties — no modifier soup:

```html
<button class="spy-btn" data-variant="brand" data-size="sm">Run scan</button>
<div class="spy-metric" data-pending>…</div>
<div class="spy-gauge" data-verdict="fair" data-value="62">…</div>
```

Two variables re-skin everything: `data-theme` swaps the semantic layer, and `--q-tint` drives
switches, progress, toggles, tabs, gauges, option cards, tier pips and processing frames. Set the
tint on any subtree to recolour that region — the mechanism the reference system uses to re-skin a whole surface in one line.

Fonts: exactly two faces and no third. **Archivo Black** for display headers (h1–h3 and badges),
**Asta Sans** for everything else. Both on Google Fonts. Archivo Black ships one weight, so anything
in the display face is set at 400. There is no monospace — the mono role resolves to Asta Sans with
tabular figures, so token names and hex values still line up. See `EVIDENCE.md` §17.4.

## How it was built

Two passes. First, the reference system's shipped stylesheet read directly — 3.79 MB, 10,656 custom-property
declarations, 25,922 rules — which is where the tokens and component geometry come from. Second, a
557-screen capture set of the signed-in product, reviewed as contact sheets and then sampled pixel by
pixel, which is where the editor, account and tint findings come from. Then the spyy brief was mapped
against the result (`GAPS.md`) and the Patterns and Templates levels were built to close the gap.

## Three things worth knowing

1. **Lime acts, green states.** Sampling the shipped editor returned `#01c317` on a checked switch —
   the success green, not the brand lime. The reference system reserves lime for actions you can take and green
   for state that is on. Nothing on the public site shows this.
2. **Score bars are one colour.** The current spyy mockup gives each of six scores its own bar colour.
   The reference system's scoring surface makes every bar the same and puts the qualitative reading on one
   calibrated gradient scale. With six axes, per-bar colour makes the eye read severity where the data
   means difference. Argued in full in `GAPS.md` §3.1.
3. **The grey ramp leans blue, borders are alpha-white, elevation is an inset sheen.** Swap any of the
   three and the look goes, however correct the rest is.

## Where the values come from

Geometry — spacing, radius, border, elevation, motion, layout, the responsive type ladder — is
transcribed from one shipped product. Colour and type family are transcribed from another. The
brand green is the one colour kept from the first, because nothing in the second replaces it.

That split was possible because a component never reads a raw value: it reads a semantic token, and
the semantic token reads the palette. Swapping an entire palette was about 200 lines of
`tokens.css` and nothing below it. `EVIDENCE.md` §17 records what the swap broke anyway — status
colours calibrated for the old ramp, and four backdrops with hexes hardcoded outside the token
layer.

## Browsing it

One rail lists every section of every level — 44 entries, identical on all five pages — so the
Templates page can send you to the pattern it used and the pattern to the component it is built
from, without going up a level first. The filter in the top bar covers the whole system; `/` focuses
it. On a phone the rail becomes a drawer.

Prose has a fixed measure and specimens get the full column, so a line of body text does not get
longer because the window did.

## Product-flow prototype

Open `dashboard.html` for the complete Figma-led flow: sign in, conversational onboarding,
brand identity confirmation, asynchronous scan, source-aware results, watchlist, and video
analysis. It composes the existing token, component, and app-pattern layers; `dashboard.css`
adds product layout and responsive adaptations, while `dashboard.js` provides hash routing,
persistent state, filtering, sorting, saved ads, simulated media controls, and a local data
service backed by `data/spyy-data.js` (generated from `data/spyy-data.json` by `tools/build-data.py`,
so the page also opens from `file://`). The TikTok and Facebook home searches use different filter
models on purpose; see the v2 section of `DASHBOARD-AUDIT.md`. The previous build is kept in
`_archive/dashboard-v1/`.

## Two things about the light theme

It is derived, not transcribed, and deriving it surfaced a real bug in the dark build: ink tokens
that flip with the theme were being used on **tint fills, which don't flip**. A lime button asked
for `--hf-color-text-inverse` and got white-on-lime at 1.17:1 the moment the theme changed. Two
theme-constant tokens now carry that ink (`--hf-color-text-on-tint`, `--hf-color-text-on-tint-inverse`),
and a third (`--q-tint-text`) carries the tint when it is used to set type rather than to paint.
`EVIDENCE.md` §14 has the full account, including the cascade-order trap that let the Mobbin
addendum silently override the entire light theme.

The other thing: the reference system's own `text-tertiary` (`#626262`) measures 2.4–2.8:1 on the product's
dark surfaces, below WCAG AA, and it carries most of the captions and metadata in the product. It
was **left alone** — it is a transcribed value and the brief puts accuracy above interpretation. The
light theme's tertiary is derived, so it was allowed to land at a readable `#7f7f7f`. Decide on the
dark one deliberately rather than inheriting it by accident.

## Known gaps

The light theme is derived, not confirmed — the capture set contains no light-mode product chrome.
Icon glyphs are original drawings to a confirmed spec rather than the reference system's own set. Campaign
reconstruction (the brief's "output, later") has no pattern yet and is out of PoC scope. Boards,
Saved and Pattern Library appear in the mockup's navigation but not in the brief; folder cards exist,
the screens do not. `GAPS.md` §4 and `EVIDENCE.md` §8–9 have the full list.

## A note on scope

This reproduces a visual *system* — tokens, geometry, state behaviour — for design work. It
deliberately does not reproduce the reference system's logomark, wordmark, icon set, imagery or copy.

## Brand colour change (24/09/2026)

The brand lime is now **`#CBF130`** (was the audited `#d1fe17`). The whole lime ramp and its alpha
steps were re-based on it in `tokens.css` and `tokens.w3c.json`: every step keeps its old lightness and
takes the new hue and chroma. Success states use the same lime (one green on screen), light-theme text
in the tint uses the darker steps for legibility. `EVIDENCE.md` still records the audited value as history.
