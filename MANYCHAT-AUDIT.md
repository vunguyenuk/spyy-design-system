# ManyChat — colour, type and illustration audit

First-party evidence, gathered 22 Sep 2026. Same method as the Higgsfield audit: the shipped
stylesheet read directly, plus the asset files themselves. Classified `[C]` confirmed (read from the
product) / `[I]` inferred / `[A]` approximate.

## 0. How it was read, and what blocked

`manychat.com` sits behind a Cloudflare bot check that neither browser could clear, and completing a
bot check is not something I do. It turned out not to matter: **`app.manychat.com` is not gated**, and
its sign-in page loads the product's whole stylesheet —
`https://mccdn.me/1073/assets/css/bundle.css`, 1,048,488 bytes, **573 custom properties, 228 of them
colour**. No login was needed for any of this, so the login you were going to do is off the list.

The marketing page's image manifest and section structure came through a text fetch that Cloudflare
did not challenge, and every asset lives on the same open CDN, so the illustrations were read at
source.

## 1. There are two palettes, not one `[C]`

This is the finding that needs a decision. **The marketing site and the product do not share a brand
colour.**

| | Marketing (`manychat.com`) | Product (`app.manychat.com`) |
|---|---|---|
| Primary | orange `#FF4B00` | blue `#006be2` (`blue-500`) |
| Secondary | purple (chat bubbles) | purple `#7f53e0` (`purple-500`) |
| Ground | black, behind photography | `#f5f5f5` grey, white surfaces |
| Imagery | photography + flat orange spot art | almost none |

Your boss linked the marketing page. The orange is what he will have seen. The blue is what the
product actually is.

## 2. Palette `[C]`

Eleven hue ramps of ten steps each, plus a thirteen-step neutral ramp and four alpha steps.

```
neutral   0 #fff · 50 #f5f5f5 · 75 #e5e5e5 · 100 #d6d6d6 · 200 #bdbdbd · 300 #a8a8a8
        400 #878787 · 500 #707070 · 600 #595959 · 700 #414141 · 800 #292929 · 900 #151515 · 1000 #000
          alpha: 1000A8 #00000014 · 1000A12 #0000001f · 0A8 #ffffff14 · 0A12 #ffffff1f

blue        50 #eff6ff · 400 #2e86fd · 500 #006be2 · 600 #0059be · 700 #00418f · 900 #00163a
purple      50 #f5f3ff · 400 #966efa · 500 #7f53e0 · 600 #6e30d4 · 700 #5400af · 900 #1e0047
magenta     50 #fcf0ff · 400 #c55dda · 500 #ab3ec1 · 600 #9909b1 · 700 #720085 · 900 #2b0033
light-blue  50 #e5f9ff · 400 #3f94a8 · 500 #167a8f · 600 #006679 · 700 #004c5a · 900 #001c23
cyan        50 #d9fff3 · 400 #399a82 · 500 #037e67 · 600 #006b57 · 700 #004f40 · 900 #001e17
green       50 #deffe6 · 400 #369d5c · 500 #0c8143 · 600 #006d36 · 700 #005127 · 900 #001f0b
lime        50 #e9ffc8 · 400 #749631 · 500 #5a7a03 · 600 #4b6700 · 700 #374c00 · 900 #121c00
yellow      50 #fff2e0 · 400 #c77d16 · 500 #a35f00 · 600 #794700 · 700 #5a3500 · 900 #221400
orange      50 #fff2ec · 400 #d66a2f · 500 #bb4f00 · 600 #9c4100 · 700 #742e00 · 900 #2d0d00
red         50 #fff2ef · 400 #f14d33 · 500 #d52b0d · 600 #b41c00 · 700 #861200 · 900 #340300
```

Note that the product's `orange-500` is `#bb4f00`, a brown — it is **not** the marketing `#FF4B00`.
The marketing orange exists nowhere in the product token set.

## 3. Semantic layer `[C]`

110 aliases over the palette, in five families — `text-*`, `icon-*`, `border-*`, `background-*`,
`shadow-*`. The shape is the same three-tier architecture we already have, which is why this
re-skins cleanly. A representative slice:

```
text-default        neutral-800      background-surface-default  neutral-0
text-subtle         neutral-500      background-surface-raised   neutral-50
text-disabled       neutral-400      background-neutral-level-1  neutral-50
text-brand          blue-500         background-neutral-level-2  neutral-100
text-brand-secondary purple-500      background-brand-default    blue-500
border-default      neutral-100      background-brand-hovered    blue-600
border-focused      blue-400         background-brand-pressed    blue-700
border-selected     blue-500         background-selected         blue-50
```

Three conventions worth copying regardless of which palette wins:

- **Body text is `neutral-800` `#292929`, never black.** Black is reserved for the `border-bold`
  token.
- **Every interactive role has `default / hovered / pressed / disabled`** as separate tokens, so a
  component never computes a hover state.
- **Semantic `-50` for a tinted background, `-500` for the bold fill, `-100` for the quiet border.**
  One rule across success, warning, danger, information and all five accents.

## 4. Type `[C]`

```
--font-stack: "InterVariable", "Helvetica", "Arial", sans-serif
mono:         "JetBrains Mono", "Courier New", Courier, monospace
weights:      300 light · 400 regular · 500 medium · 700 bold · 900 black
```

Both families are free and openly licensed, so unlike Higgsfield's *Inter Display* there is no
approximation to document.

Six size roles, each paired with one line-height. **Fixed pixels — there is no fluid or responsive
step anywhere in the ladder.**

| Role | Size | Line-height |
|---|---|---|
| display-large | 44px | 56px |
| display-medium | 32px | 40px |
| display-small | 28px | 36px |
| heading-default | 24px | 36px |
| heading-small | 20px | 32px |
| subheading-default | 16px | 20px |
| subheading-small | 14px | 20px |
| body-large | 16px | 24px |
| body-default | 14px | 20px |
| body-small | 12px | 16px |

## 5. Illustration `[C]`

Three distinct registers, used for three different jobs:

1. **Hero — photography.** `home-hero-bg-desktop.jpg` is a 3024×2160 lifestyle photograph of a
   creator in a home studio, warm gradient knitwear against a grey wall, shot on black. Not
   illustration at all.
2. **Section icons — flat orange spot art.** 80×80 viewBox, `fill="none"` root, **no strokes
   anywhere** — every form is a filled path in `#FF4B00`, with black used only for cut-out detail
   (eyes, a mouth, a dollar sign). Deliberately hand-drawn: edges wobble, forms are asymmetric,
   motion is drawn as detached shards and sparkles flung off the subject. Subjects are cartoon
   objects with personality — a pair of eyeballs, a rocket, a starburst, a dollar in a speech
   bubble, a face with a tongue out.
3. **Product mockups — purple chat bubbles.** Outgoing bubbles in purple with white text and a
   lighter purple pill button inside; incoming bubbles grey with a round avatar. ~12px radius.

## 6. What ManyChat does not have `[C]`

- **No dark theme.** Zero `prefers-color-scheme: dark`, no `[data-theme]` selector, no dark class in
  1MB of CSS. The product is light-only.
- No fluid type.
- No elevation ladder comparable to ours — shadows are three alpha steps of one colour
  (`.08 / .12 / .16`).

## 7. What this means for the spyy system

The two systems are architecturally the same shape, which is the good news: primitives → semantics →
component slots, and **an identical spacing-scale convention** (`--spacing-100: .25rem`,
`200: .5rem`, `400: 1rem` … the same numbering we already use). A colour and type swap is a
tier-two edit; components never read primitives, so nothing below the semantic layer has to move.

Radius is the one geometry value that differs sharply and is worth knowing: `--border-radius-sm: 4px`,
`--border-radius: 13px`, `--border-radius-lg: 10px`, and **`--button-border-radius: 20px`** — buttons
are near-pill, where ours are not.

Two things cannot be transcribed and will be built original, matched on style properties only: the
flat spot illustrations (their artwork, characters and mascots are theirs) and the logo/wordmark.
