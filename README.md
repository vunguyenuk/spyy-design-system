# Spyy Design System

A design system reverse-engineered from [higgsfield.ai](https://higgsfield.ai), audited
22 September 2026. The goal was accuracy, not interpretation: every value is either read
out of the product or labelled as an inference.

## Files

| File | What it is |
|---|---|
| `index.html` | The reference page — foundations, every component, every state, plus a validation log. Open it directly; no build step. |
| `tokens.css` | The token layer. Tier 1 primitives → Tier 2 semantics (dark + light) → text styles. Standalone. |
| `components.css` | The component layer. Reads Tier-2 semantics only, so flipping `data-theme` re-themes everything. Standalone. |
| `docs.css` | Chrome for the reference page only. **Not** part of the system. |
| `app.js` | Reference-page behaviour and token-grid rendering. Not part of the system. |
| `EVIDENCE.md` | Provenance for every decision — what was confirmed, inferred, approximated, and how. Read this before changing a value. |

## Using it

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components.css">
```

Set the theme on the root element:

```html
<html data-theme="dark">   <!-- or "light" -->
```

Components are one class plus `data-*` properties:

```html
<button class="spy-btn" data-variant="brand" data-size="sm">Generate</button>
<button class="spy-btn" data-variant="outline" data-size="md" data-icon-only aria-label="Settings">
  <svg class="spy-icon"><use href="#i-settings"/></svg>
</button>
```

Fonts: Inter, Space Grotesk and IBM Plex Mono, all on Google Fonts. Higgsfield uses
*Inter Display* for headings, which is not freely available — `tokens.css` falls back to
Inter, so headings will read very slightly wider than the original.

## Architecture

```
--hf-space-200, --hf-color-lime-500          Tier 1  primitives
        ↓
--hf-color-background-secondary              Tier 2  semantics, theme-scoped
        ↓
--spy-chip-selected-bg, --spy-switch-track-bg   Tier 3  component slots
```

Components never read a primitive. Two consequences worth knowing:

- **Re-theming is one attribute.** `data-theme="light"` swaps Tier 2; nothing else changes.
- **Re-tinting is one variable.** `--q-tint` drives the switch, progress fill, toggle,
  loader and tabs accent. Set it on any subtree to recolour that whole region.

## Five things to not change

These are the details the look actually rests on. Each is confirmed; each is easy to
"improve" and thereby lose.

1. **The grey ramp is blue-leaning.** `#131416 #18191c #1c1e21 #23262a #2a2d32`. True grey
   reads instantly wrong.
2. **Borders are alpha-white, never a solid grey step.** 5% / 10% / 20%.
3. **Elevation is an inset 2px top sheen**, not a drop shadow. Remove the sheen and the
   surfaces flatten no matter how much shadow you add.
4. **The badge is skewed `-10.89deg`**, Space Grotesk Bold, uppercase, 2px radius.
5. **Hover on a filled control is `brightness(.8)`, press `.6`** — a filter, not a second
   colour token.

## Sources

Two passes. First, the shipped stylesheet — 3.79 MB, 10,656 custom-property declarations,
25,922 rules — read directly, which is where the tokens and component geometry come from.
Second, a 557-screen capture set of the signed-in product, reviewed as contact sheets
(`_audit/sheets/`) and then sampled pixel by pixel, which is where the editor, account and
tint findings come from — and which caught one thing the stylesheet got me wrong about
(see below).

## Known gaps

The light theme is derived, not confirmed — the capture set contains no light-mode product
chrome. The icon glyphs are original drawings to a confirmed spec rather than Higgsfield's
own set. List, pagination, alert, stepper and the prompt composer are assembled from
confirmed primitives. `EVIDENCE.md` §8–9 has the full list and what would settle each one;
§12 records everything the capture set confirmed.

## The thing I got wrong

I built the switch with a lime checked track. Lime is the brand colour and every CTA uses
it, so it looked right. Sampling the shipped editor returned `#01c317` — the success green.
Higgsfield uses **lime for actions you can take and green for state that is on**, and that
distinction appears nowhere on the public site. If you are checking this system against the
product, that is the kind of thing to look for.

## A note on scope

This reproduces a visual *system* — tokens, geometry, state behaviour — for design work.
It deliberately does not reproduce Higgsfield's logomark, wordmark, icon set, imagery or
copy, none of which are ours to ship.
