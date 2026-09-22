# Spyy Design System

A design system reverse-engineered from [higgsfield.ai](https://higgsfield.ai), then fitted to the
**spyy** product brief. Open `index.html` — no build step.

## Structure

Four levels. Each answers a different question, and the answer at one level binds the next.

| | | |
|---|---|---|
| **Foundations** | `foundations.html` | What are the raw decisions? Colour, type, space, radius, border, elevation, icons, motion, layout. |
| **Components** | `components.html` | What is the smallest usable piece? Primitives with every state. |
| **Patterns** | `patterns.html` | How does spyy say this? Scoring, confidence, async scans, attribution, pickers, results. |
| **Templates** | `templates.html` | What does the screen look like? Four screens, one per step of the flow. |

If a template needs something that is not in Patterns, that is a gap in Patterns — not a licence to
improvise on the screen.

## Files

| File | What it is |
|---|---|
| `tokens.css` | Tier 1 primitives → Tier 2 semantics (dark + derived light) → text styles. Standalone. |
| `components.css` | 44 components. Reads Tier-2 semantics only, so themes and tints flow through. Standalone. |
| `patterns.css` | 18 composed product patterns. Introduces no new colour, radius, duration or type size. |
| `docs.css`, `shell.js`, `app.js`, `icons.js` | This reference site only. **Not** part of the system. |
| `GAPS.md` | The audit of spyy's needs against the system, written before anything new was built. |
| `EVIDENCE.md` | Provenance for every value — confirmed, inferred, approximate, and how each was established. |
| `_audit/sheets/` | Twelve contact sheets indexing all 557 captures by screen number. |

## Using it

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components.css">
<link rel="stylesheet" href="patterns.css">

<html data-theme="dark">   <!-- or "light" -->
```

One class plus `data-*` properties — no modifier soup:

```html
<button class="spy-btn" data-variant="brand" data-size="sm">Run scan</button>
<div class="spy-metric" data-pending>…</div>
<div class="spy-gauge" data-verdict="fair" data-value="62">…</div>
```

Two variables re-skin everything: `data-theme` swaps the semantic layer, and `--q-tint` drives
switches, progress, toggles, tabs, gauges, option cards, tier pips and processing frames. Set the
tint on any subtree to recolour that region — the mechanism Higgsfield uses for Marketing Studio
(magenta) and Supercomputer (teal).

Fonts: Inter, Space Grotesk and IBM Plex Mono, all on Google Fonts. Higgsfield uses *Inter Display*
for headings, which is not freely available; `tokens.css` falls back to Inter, so headings read very
slightly wider than the original.

## How it was built

Two passes. First, Higgsfield's shipped stylesheet read directly — 3.79 MB, 10,656 custom-property
declarations, 25,922 rules — which is where the tokens and component geometry come from. Second, a
557-screen capture set of the signed-in product, reviewed as contact sheets and then sampled pixel by
pixel, which is where the editor, account and tint findings come from. Then the spyy brief was mapped
against the result (`GAPS.md`) and the Patterns and Templates levels were built to close the gap.

## Three things worth knowing

1. **Lime acts, green states.** Sampling the shipped editor returned `#01c317` on a checked switch —
   the success green, not the brand lime. Higgsfield reserves lime for actions you can take and green
   for state that is on. Nothing on the public site shows this.
2. **Score bars are one colour.** The current spyy mockup gives each of six scores its own bar colour.
   Higgsfield's scoring surface makes every bar the same and puts the qualitative reading on one
   calibrated gradient scale. With six axes, per-bar colour makes the eye read severity where the data
   means difference. Argued in full in `GAPS.md` §3.1.
3. **The grey ramp leans blue, borders are alpha-white, elevation is an inset sheen.** Swap any of the
   three and the look goes, however correct the rest is.

## Known gaps

The light theme is derived, not confirmed — the capture set contains no light-mode product chrome.
Icon glyphs are original drawings to a confirmed spec rather than Higgsfield's own set. Campaign
reconstruction (the brief's "output, later") has no pattern yet and is out of PoC scope. Boards,
Saved and Pattern Library appear in the mockup's navigation but not in the brief; folder cards exist,
the screens do not. `GAPS.md` §4 and `EVIDENCE.md` §8–9 have the full list.

## A note on scope

This reproduces a visual *system* — tokens, geometry, state behaviour — for design work. It
deliberately does not reproduce Higgsfield's logomark, wordmark, icon set, imagery or copy.
