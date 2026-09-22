# Evidence record

Audit of **higgsfield.ai**, 22 September 2026. This file is the provenance trail for
every decision in `tokens.css` and `components.css`.

Legend:

| | meaning |
|---|---|
| **C** | **Confirmed** — read directly out of Higgsfield's shipped stylesheet or measured from a live computed style |
| **I** | **Inferred** — derived from a pattern repeated across multiple confirmed components |
| **A** | **Approximate** — the product did not answer; documented as a guess, not presented as fact |

---

## 1. Method

The audit did not rely on reading screenshots. Higgsfield ships its design system as CSS
custom properties in a public bundle, so the primary method was to read the system itself:

1. Opened `higgsfield.ai` at 1440×900 in a real browser.
2. Enumerated the 13 stylesheets loaded from `assets.higgsfield.ai`. The main bundle is
   3.79 MB and declares **10,656 custom-property assignments**.
3. Extracted every `:root` / `:where(:root)` declaration block and de-duplicated to
   **1,622 distinct design tokens**.
4. Parsed the bundle into **25,922 rules** and pulled the component layer by class prefix.
5. Separately, tallied computed styles across all 1,511 visible elements on the homepage to
   check which token values actually reach the screen, and in what proportion.

Step 5 matters: it is what distinguishes a token that exists from a token that is *used*.
`--hf-radius-300` (12px) appeared on 576 elements; `--hf-radius-500` (20px) on 3.

**Second pass — the capture set.** Mobbin blocks automated browsers (403), so the requested
Mobbin review initially did not happen. Vu then supplied the set directly: **557 screens at
1920×1325**, covering onboarding, pricing, the community feed, the image and video editors,
the canvas, the voice studio, Marketing Studio, Supercomputer, project workspaces, sharing,
and the full account area. These were reviewed as twelve contact sheets (in `_audit/sheets/`,
indexed by screen number) and then examined individually at native resolution, with colour
values taken by **sampling pixels** rather than by eye.

This second pass mattered more than expected. The stylesheet tells you what the system
*declares*; the capture set tells you what the product *does* with it — and on one point the
two disagreed in a way that only pixels could settle (§11.5).

### What this means for accuracy

Most of this system is not reverse-engineered in the usual sense — it is transcribed. Colour
values, control heights, radii, easings, shadow recipes, state behaviour and the responsive
type scale are the product's own, byte for byte. The inference work was confined to naming,
to the components Higgsfield does not ship on public surfaces, and to the light theme.

---

## 2. What Higgsfield's system actually looks like

Three tiers, which this system mirrors:

```
--hf-space-200, --hf-color-lime-500          Tier 1  primitives
        ↓
--hf-color-background-secondary              Tier 2  semantics (theme-scoped)
        ↓
--q-chip-selected-bg, --q-switch-track-bg    Tier 3  component slots
```

Two generations of component CSS ship side by side:

- **`.button-*` / `.checkbox-*` / `.menu-*`** — the older app layer, Tailwind-compiled,
  heights 16→64, disabled as a flat `#292b2c` fill.
- **`.q-*`** — the current system (`q-button`, `q-field`, `q-tabs`, `q-chip`, `q-badge`,
  `q-menu`, `q-modal`, `q-sonner`, `q-sidebar`, `q-nav`, `q-switch`, `q-checkbox`,
  `q-radio`, `q-select`, `q-tooltip`, `q-card`, `q-glass`, `q-progress`, `q-loader`,
  `q-media`, `q-dial`, `q-divider`, `q-toggle`, `q-avatar`, `q-accordion`, `q-command`,
  `q-autocomplete`, `q-vault`, `q-liquid`), reading `--hf-*` tokens directly, with
  `data-*` state attributes and `--q-tint` as a re-skinning hook.

Both are reproduced here. The `q-*` generation is the default; the app ladder is opt-in via
`data-scale="app"` because it reaches densities (16px, 24px) the current ladder does not.

---

## 3. Confirmed — colour

| Finding | Evidence |
|---|---|
| Brand is a single acid lime `#d1fe17` | `--hf-color-lime-500`; also the cookie-consent theme's `--prefButtonColor`, and `rgb(209,254,23)` on 10 live elements |
| Secondary brand is magenta `#ff005b` | `--hf-color-pink-500`, `--hf-color-brand-pink`, `--hf-color-font-brand-secondary` |
| Page background `#131416` | `--hf-color-cool-400` → `--hf-color-background-primary`. Live `<html>` computed `rgb(15,17,19)` on the marketing route (`--color-surface-tertiary`), `#131416` on the app route |
| **The UI grey ramp is blue-leaning, not neutral** | `cool-050…400`: `#5c626a #484e56 #383e46 #2a2d32 #23262a #1c1e21 #18191c #131416`. A separate true-neutral `grey-*` ramp exists and is used for *text*, not surfaces |
| Dominant card surface `#1c1e20`–`#1c1e21` | 171 live elements |
| **Borders are always alpha-white** | `border-subtle` 5%, `border-default` 10%, `border-strong` 20%. Live border colours: `rgba(255,255,255,0.1)`, `oklab(…/0.05)`, `srgb(1 1 1/0.16)`. No solid grey border found anywhere |
| Text ramp: `#ffffff` → `#828282` → `#626262` | `grey-050 / 300 / 325`. Live: 59 white, 63 at `#898a8b`, 16 at `#a8a8a8` |
| **Icons get their own colour ramp** | `--hf-color-icon-primary/secondary/tertiary` exist in parallel to the text tokens and are not aliases of them |
| Focus is always brand lime | `--hf-color-border-focus: lime-500`. Focus rings on status controls switch to the state *glow* colour (`red-glow #ff1f2e`, `green-glow #00e62e`, `yellow-glow #fff05a`) |
| Glass = `#23262a` at 75% | `--hf-color-glass-dark: #23262abf` |
| Disabled fill (app ladder) `#292b2c` | `--color-button-disabled` |
| 12 palettes × 12 steps + 4 alpha ladders | lime, pink, red, green, yellow, orange, blue, purple, cyan, cool, grey, neutral |

## 4. Confirmed — typography

| Finding | Evidence |
|---|---|
| Inter Display (primary), Inter (secondary), Space Grotesk, IBM Plex Mono | `--hf-type-family-*`; preloaded `inter-latin-100-900.woff2`, `space-grotesk-latin-300-700.woff2`. Live font-family tallies: Inter 1386, Space Grotesk 69, Space Mono 56 |
| Weights 400 / 500 / 600 / 700 / 900 | `--hf-type-weight-*`; live tallies 400:972, 600:242, 500:223, 700:49, 900:25 |
| **The type scale steps twice — at 768px and 1280px** | Three sets of `--hf-type-size-*` / `--hf-type-line-height-*`, in `@media (min-width:768px)` and `@media (min-width:1280px)`. E.g. index 1400: 3.5rem → 4rem → 4.5rem |
| Size and line-height share one index | `--hf-type-line-height-600` is `1.25rem` in the same tier where `--hf-type-size-400` is `1rem` |
| **Tracking is a function of size** | ≤14px → `0%`; 16–20px → `-1%`; 28–64px → `-2%`; caps → `-4%`. Verified across all 188 `--text-*` tokens |
| Menu and nav labels carry `+0.1px` | `--hf-type-letter-spacing-loose: .00625rem`, applied by `.q-menu-item`, `.q-nav-item`, `.q-sidebar-row`; live `letter-spacing: 0.1px` on 43 elements |
| 44 uppercase elements on the homepage, all `-4%` | live tally; `--text-brand-*-caps-*` tokens are all `-4%` |
| Live font-size tally: 16px (1075), 14px (249), 12px (75), 10px (38) | UI is overwhelmingly 14 and 16 |

## 5. Confirmed — geometry

| Finding | Evidence |
|---|---|
| 4px spacing base, 2px granularity, 18 steps | `--hf-space-0 … 2400`; live gap tally 4px(118) 8px(108) 12px(70) 6px(46) 10px(46) |
| 11 radius steps, `9999px` for pill | `--hf-radius-0 … full` |
| **Radius plateaus rather than scaling** | Button ladder 6/8/10/12/14 across heights 24/32/40/48/56; containers jump to 16 and 24 |
| 12px is the most-used radius in the product | live tally: 12px(576) 8px(252) 16px(204) pill(144) 10px(72) 6px(63) |
| 5 border widths incl. `0.5px` hairline and `1.5px` medium | `--hf-border-width-*`; live tally 2px(20) 1px(18) |
| Icons 12/16/20/24/28, default 20 | `--hf-icon-xs…xl`; live icon boxes 20×20(24) 14×14(10) 16×16(8) |
| **All icons are 24×24 viewBox with 1.5 stroke** | every audited `<svg>`: `viewBox="0 0 24 24"`, `stroke-width="1.5"`, `fill="none"`, `stroke="currentColor"`, paths on `.25` offsets (`m6.25 6.25 11.5 11.5`) |
| Container 1536px, gutter 16px, section padding 24px | `.container max-w-8xl` computed `max-width: 1536px`, `padding-inline: 16px`; sections `px-4 md:px-6` |
| Breakpoints 768 / 1024 / 1280 / 1920 / 2528 | media queries + `--breakpoint-2xl: 120rem`, `--breakpoint-3xl: 158rem` |
| Z-index 0/10/20/30/40/50/60/70 | `--hf-z-index-base … tooltip` |
| Modal widths 349 / 469 / 640 / 708 / 946 / 1392 | `--q-modal-width-xs … 2xl` |

## 6. Confirmed — elevation, motion, state behaviour

| Finding | Evidence |
|---|---|
| **Elevation is a 2px inset top sheen, not a shadow ladder** | every raised token begins `inset 0 2px 3px rgba(255,255,255,0.05)`: `--hf-shadow-sheen`, `-raised`, `-modal`, `-overlay` |
| Glass carries a two-sided inset rim | `--q-glass`: `inset 1px 1px 0 light-20, inset -1px -1px 0 dark-15` — light top-left, dark bottom-right |
| Glass blur is 40px with `saturate(1.6)` | `--q-glass-blur: --hf-space-1000`, `--q-glass-saturate: 1.6`; live `backdrop-filter: blur(8px)` on 24 marketing elements and `blur(40px)` on overlays |
| **Hero CTA is a skeuomorphic key** | `.q-button-marketing-primary`: lime fill + `--hf-gradient-special-gloss-lime` + `inset 0 -3px 0 #829b19` + `0 6px 4px rgba(0,0,0,.25)` + `0 32px 24px rgba(0,0,0,.15)`. Confirmed again in a live computed style |
| Toast shadow `0 24px 48px -12px black/40` | `.q-sonner-inline` |
| 21 durations, 10 easings | `--hf-duration-*`, `--hf-ease-*` |
| **Enter and exit are asymmetric** | dropdown/tooltip enter `180ms ease-out-expo`, exit `130ms ease-in` |
| Progress fill `350ms in-out-circ` | `.q-progress-fill` |
| Switch: track 200ms, thumb 260ms `ease-swift`, press scale 1.14 | `--q-switch-duration-track/-thumb`, `--q-switch-press-scale` |
| **Hover on a filled control is `brightness(.8)`, press `.6`** | `.button-brand:hover`, `.button-secondary-reverted:active`, `.hfnav-action:hover/:active` |
| Hover on a transparent control is a 5%-white `::after` overlay | `.q-button:hover::after`, `.q-field-control:hover::after` |
| Focus ring = 2px page-coloured gap + 4px brand ring | `.q-button:focus-visible`: `0 0 0 2px var(--hf-color-background-primary), 0 0 0 4px var(--hf-color-border-focus)` |
| Focus inside a field is an **inset** 1.5px ring | `.q-field-control:focus-within` |
| Disabled (`q-*`) = `pointer-events:none; opacity:.5` | `.q-button:disabled` |
| Disabled (app ladder) = flat `#292b2c` + `--color-font-disabled` | `.button-brand[disabled]` |
| Loading = `aria-busy="true"`, `cursor: wait` | `.button:where([aria-busy=true])` |
| Invalid = inset 1.5px `red-600`, persists through focus | `.q-field-control-invalid` |
| Scrollbars are drawn, never OS default | the product hides/skins them; reproduced in `components.css` |

## 7. Confirmed — component geometry

Measured heights, paddings and radii, per component:

| Component | Geometry |
|---|---|
| Button (current) | h 24/32/40/48 · radius 6/8/10/12 · px 12/12/16/16 · gap 6 · icon 12/16/20/24 · text 12/14/14/16 · weight 500/500/500/600 |
| Button (app ladder) | h 16/24/32/40/48/56/64 · radius 2/8/8/10/12/14/14 · px 4/6-8/8/10/12/14/16 · icon 8/14/16/18/20/24/24 · weight 600 |
| Button base | `inline-grid` · `grid-auto-flow: column` · `place-content: center` · 2px transparent border reserved |
| Field | h 40 (sm 32, lg 48) · radius 12 · px 12 · gap 6 · bg white/5 · **no border** · input 14/16 · placeholder white/50 |
| Textarea | min-height 80 · padding-block 8 · top-aligned |
| Select trigger | sm 32/px 8/12px · md 40/14px · lg 48/px 16/16px · chevron rotates 180° in 180ms expo |
| Menu / dropdown | surface radius 12 · padding 8 · gap 2 · ring 1px subtle · glass + 40px blur |
| Menu item | min-height 36 · padding 8 · radius 8 · gap 8 · 14/20 medium · tracking +0.1px |
| Chip | h 20/24/28/32 · **border 1.5px** · pill radius · px 8/10/12/16 · icon 12/16/16/20 |
| **Badge** | h 14 · min-width 32 · radius 2 · padding 0 6 0 4 · Space Grotesk **Bold** · 12px · uppercase · **skewX(-10.89deg)** with the text counter-skewed |
| Tabs | tab padding 10/16 · segment trough radius 10 · indicator radius 8 · resting `#626262` · hover → brand |
| Modal | radius 24 · **padding 8** · gap 8 · glass + 40px blur · backdrop black/50 · title 16/20 semibold at padding 8 |
| Tooltip | radius 8 · padding 4/6 · 12/16 medium · **white surface, dark text** · max-width 288 · arrow 8×8 |
| Toast (inline) | min-h 40 · radius 12 · padding 10 · bg `#1a1a1a` · title 12/16 medium |
| Toast (stacked) | radius 16 · padding 12/16 · row gap 12 · glass · border 1px subtle |
| Checkbox / radio | target 20/24/28 · box 18/20/24 · **box border 1.5px** · box radius 6 (checkbox) / full (radio) · indicator at 70% · radio dot at 60% with a spring ease |
| Switch | 28×16/12 · 40×20/16 · 44×24/20 · padding 2 |
| Slider | 12px hit track · 4px visual rail · 12px white thumb |
| Card | radius 16 · every region padding 20 · footer divided by a 1px hairline |
| Nav | bar min-h 52 · padding 8/16 · item h 28, padding 4/8, radius 8 · action 36×36 radius 10 with `inset 0 1.5px 3px white/5` |
| Sidebar | radius 16 · surface `#18191c` · 1px **inset** ring · header 52 · row 36, padding 6, radius 8 · width animates 220ms |
| Media overlay | 16px padding · `linear-gradient(black/50 → transparent)` · `pointer-events:none` with children re-enabled |
| Dial | h 40 · radius 10 · 1px subtle border |
| Progress | track `background-tertiary` · pill radius · fill `--q-tint` · indeterminate 40% width, 1.3s |
| Avatar | 24 default, 18 in collaborator stacks, −2px overlap |

---

## 8. Inferred

| Decision | Basis |
|---|---|
| Button `lg` (56 / radius 14 / 18px / icon 24) | `.q-button-lg` ships only its icon rule. Height and radius continue the ladder and are cross-confirmed by the app ladder's `xl` step at the same height |
| ~~Table~~ | **Now confirmed** — see §12. |
| List, pagination | Still inferred; pagination assembled from the confirmed 32px icon-button geometry |
| Empty / error state | Built from `.q-media-fallback`: `background-elevated-start`, centred column, 16px padding, tertiary text |
| Alert / banner | Built from the confirmed `state-*-bg` / `state-*-fg` pairs, which ship but have no shipped container |
| Tag | Derived from `.q-dropdown-meta-chip`: 10px, wide tracking, 4px radius, 5%-white fill |
| Prompt composer | Composition only. Corroborated by the capture set, which shows the same parts in the same order, but the exact paddings were not measured |
| Stepper | The multi-step studios (Fashion Factory, product ads) use a vertical numbered rail; geometry derived from the confirmed dot and divider sizes |
| Progress bar height, dot size, ring size | The token *slots* ship (`--q-progress-h`, `--q-progress-dot`, `--q-progress-ring`) but are set per call site. 4px bar chosen to match the slider rail |
| Accordion | No shipped rule captured; built from the confirmed divider + chevron-rotation pattern |
| Drawn scrollbars | The product suppresses OS scrollbars; the exact skin was not captured, so a token-built one is used |

## 9. Approximate

| Decision | Why, and what would settle it |
|---|---|
| **Light theme** | Higgsfield ships light-mode *hooks* — `[data-theme=light]` variant utilities and a `supercomputer-light` body theme — but not a full light semantic block. Anchors that are real: background `#ffffff` / `#f4f4f4`, glass `#f4f4f4bf`, borders `black/5` and `black/10`, text `#1a1a1a`, and `#dedede` on the Supercomputer surface; these are marked `[C]` inline in `tokens.css`. Everything else in the light block is inverted from the confirmed dark roles. **Settled by:** auditing app.higgsfield.ai's Supercomputer surface in light mode while signed in |
| **Icon glyphs** | The *spec* is confirmed (24×24, 1.5 stroke, `.25` grid, round/square caps). The 44 glyphs shipped here are original drawings to that spec. Higgsfield's own icon set is not reproduced, and neither is its logomark. **Settled by:** deciding whether to license a matching set (a 1.5-stroke, 24-grid outline set) or commission one |
| Supercomputer tint | The teal used across the Supercomputer surface is eyeballed from captures at `#35c6a8`; it is not declared in the public bundle. **Settled by:** a signed-in audit of that surface |
| `--q-tint` default outside brand contexts | The hook is confirmed; which subtrees re-tint it is not |

---

## 10. Class-name map

If you need to cross-check a component against the product, these are the originals:

| This system | Higgsfield |
|---|---|
| `.spy-btn` | `.q-button` (+ `.button` for the app ladder) |
| `.spy-field-control` / `-input` | `.q-field-control` / `.q-field-input` |
| `.spy-select-trigger` | `.q-select-trigger` |
| `.spy-menu` / `.spy-menu-item` | `.q-dropdown-content` / `.q-menu-item` |
| `.spy-checkbox` / `.spy-radio` / `.spy-switch` | `.q-checkbox` / `.q-radio` / `.q-switch` |
| `.spy-toggle` | `.q-toggle` |
| `.spy-chip` | `.q-chip` |
| `.spy-badge` | `.q-badge` |
| `.spy-tabs` | `.q-tabs` |
| `.spy-modal` | `.q-modal` |
| `.spy-toast` | `.q-sonner` / `.q-sonner-inline` |
| `.spy-tooltip` | `.q-tooltip` |
| `.spy-card` / `.spy-glass` | `.q-card` / `.q-glass` |
| `.spy-nav` / `.spy-sidebar` | `.q-nav` / `.hfnav-*` / `.q-sidebar` |
| `.spy-progress` / `.spy-loader` | `.q-progress` / `.q-loader` |
| `.spy-media` | `.q-media` |
| `.spy-dial` | `.q-dial` |

---

## 11. Corrections made during validation

First-pass mistakes, caught by comparing against the product and fixed:

1. **Badge drawn as a plain rounded pill.** The product skews the surface `-10.89deg` and
   counter-skews the text. This single detail carries a lot of the brand's attitude.
2. **True-neutral grey used for surfaces.** The product's UI ramp is blue-leaning at every
   step. Replaced with the `cool` ramp.
3. **Focus ring drawn as one outline.** The product draws a 2px page-coloured gap *then* a
   4px brand ring, so the ring floats clear of the control.
4. **A 1px border put on the field.** The product uses no border at all — depth is a 5% fill,
   and focus is an inset ring so nothing reflows.

---

## 12. Confirmed from the capture set

Values here were measured from pixels in the 557-screen set, not read from CSS. Screen
numbers refer to `_audit/sheets/` and to the source filenames.

### 12.1 The surfaces the product is actually built on

Sampling flat regions across a dozen screens returned the same four values every time:

| Sampled | Token | Used for |
|---|---|---|
| `#0f1112` | `--color-surface-tertiary` | settings, library, account page floor |
| `#131517` | `--color-page-primary` | **floating panels and editor rails** |
| `#1c1e1f` | `--color-surface-primary` | cards, tool bars, active rows |
| `#23262a` | `--hf-color-cool-250` | secondary buttons, count badges |

The third row is the surprise. A floating parameter panel sits on `#131517` — **one step
darker** than the `#1c1e1f` cards it floats over. Most systems lighten a floating surface;
this one darkens it and lets blur and the inset rim do the separating.

### 12.2 The switch correction

| Screen | Finding |
|---|---|
| #153 (Color Grading panel) | Checked switch track sampled **`#01c317`** → `--color-separator-success: #00c314`. **Not** the brand lime. Unchecked track sampled `#5e636f` → `--hf-color-cool-050 #5c626a`, confirming `--q-switch-track-bg: button-tertiary` |

The rule this implies, consistent across every screen in the set: **lime marks an action you
can take; green marks state that is on.** Nothing on the public marketing site exposes this,
so a stylesheet-only audit gets it wrong.

### 12.3 The gloss is not marketing-only

| Screen | Finding |
|---|---|
| #153 | The editor's primary ("Apply edits") sampled `#eefd17` at its top edge against `#d1fe17` at its base — the `--hf-gradient-special-gloss-lime` (`#ffff14`) overlay. Confirmed again on #533's "Set-up & Enable", which sampled `#d1fe17` flat |

So the gloss is a property of emphasis, not of surface: hero CTAs and the editor's commit
action both carry it; a routine lime button does not.

### 12.4 Parameter panel (screens #145–#168)

| Part | Measurement |
|---|---|
| Panel | radius ~20px, surface `#131517`, 1px hairline rim, floats with a gap from the viewport edge |
| Header | icon + 18px semibold title + close button, 16px padding |
| Section | nested container at 5% white, radius 12px, uppercase 11–12px label with a rotating chevron |
| Preset grid | 3 columns, 4:3 thumbnails at ~10px radius, 12px caption centred below |
| Preset selected | **2px lime ring *and* a lime circular check centred on the thumbnail** — both, not either |
| Preset "none" | dark tile with a slashed-circle glyph |
| Parameter row | ~56px, chevron + label + info icon + control, divided by 8%-white hairlines |
| Footer | three controls at 48px: secondary, square icon button, and a growing primary |

### 12.5 Tool bar (screens #145–#168, bottom of canvas)

Pill container on `#1c1e1f` holding 48px full-radius tools with icon + label. Active tool is
10% white. Badges ride inside the tool. Scrolls horizontally rather than wrapping.

### 12.6 Table (screen #533, usage history) — upgrades §8 to confirmed

| Part | Measurement |
|---|---|
| Row height | **64px** — considerably more generous than a typical data table |
| Divider | sampled `#242627` over a `#1c1e1f` card = 8% white = `--hf-color-divider-primary` |
| Header | 13px secondary; filterable columns are buttons carrying a chevron ("All features ⌄") |
| Value cell | tabular figures, semibold, **dotted underline** where a tooltip is attached |
| Positive delta | green (`+27 credits`) |
| Date cell | two-tone in one cell — date primary, time secondary |
| Footer | page-size select · centred "Page 1 of 10" · prev/next icon buttons |
| Section header | title + a neutral count pill sampled `#212528` |

### 12.7 Settings navigation (screen #533)

Rows carry **28px coloured icon tiles at an 8px radius** — one hue per destination (orange,
magenta, purple, neutral) — rather than plain glyphs. The active row's background sampled
`#1c1e1f`: an explicit surface, not a white overlay.

### 12.8 Notice row (screen #533)

Icon tile + title + description + trailing action, on a 5%-white fill at a 12px radius. This
is a distinct object from the status alert: it is neutral, it always has an action, and it
nests inside a card rather than standing alone.

### 12.9 The tint system, confirmed

The same components ship under three tints, changed by one variable:

| Surface | Tint | Screens |
|---|---|---|
| Core product | lime `#d1fe17` | most of the set |
| Marketing Studio | magenta `#ff005b` | #353–#369 — pink CTAs, pink background wash, identical geometry |
| Supercomputer | teal-green ~`#35c6a8` | #272–#343 — teal avatars, green CTAs, pastel skill cards |

This is why `--q-tint` exists, and why every stateful component in this system reads it.

### 12.10 Components seen but not built

Present in the product, deliberately left out because they are one-offs rather than system
parts, or because a single capture is not enough to specify them: the infinite-canvas
toolbar with presence cursors and comment pins (#440–#495), the node/flow editor (#495–#496),
audio waveform and voice-picker cards (#260–#271), the metric scorecard (#499–#502), and the
game-marketplace cards (#307–#311). Each is noted here so the omission is a decision rather
than an oversight.

---

## 13. Product fit — spyy

A third pass, after the two audit passes above: the system was mapped against the spyy product brief
and extended where the product needed something the audit had not produced. The full gap table is in
`GAPS.md`; this section records only the new evidence that pass generated.

### 13.1 Higgsfield's own scoring surface (captures #500–#502)

The Virality Predictor is the closest analogue to spyy in Higgsfield's product — drop a clip, run an
async analysis, read a set of scores. Measured:

| Part | Finding |
|---|---|
| Headline score | Label above, then a display-size white number with the denominator in grey. **The number is never coloured by value.** |
| Calibration | A ~6px gradient track — red → amber → yellow — filled to the score, with LOW / HIGH labelled at the ends in 12px uppercase |
| Metric set | Two-column grid of rows: label left, value right, 4px track beneath. **Every bar is the same lime**, whatever the value |
| Stat row | Three stats, label above value, centred |
| Processing state | A 2px lime outline around the working region with a lime status pill notched into the top-left corner, radius matched to the frame |
| Pending metric | Label and value present, track empty |
| Commit action | Full-width primary at 56px with a leading glyph |

The single-colour bar rule is the load-bearing finding. It is what makes a six-dimension score set
readable, and it is the opposite of the intuitive choice.

### 13.2 Verdict-driven gauges (captures #125–126)

| Part | Finding |
|---|---|
| Ring | Thick stroke, arc colour set by verdict — lime "Perfect", red "Bad" — not by brand |
| Glow | The good state carries a coloured drop-shadow; the bad state does not |
| Centre | Value at display size with the unit as a grey suffix, verdict pill beneath |
| Guidance | A two-half panel split by a hairline: status mark + claim + thumbnails, with the negative side outlining its thumbnails in the error colour |

### 13.3 Selection controls (capture #199)

| Part | Finding |
|---|---|
| Option card | Boxed choice, glyph above label, ~80px tall. Selected takes a tint border **and** a tint label |
| Navigator row | Quiet label above, current value below, chevron at the end — opens a full picker surface |
| Dropzone | Rounded well at 5% white, icon + title + hint, two lines |
| Asset picker tabs | Pill segmented control whose active pill is **white with dark text** — the `border-inverse` indicator |
| Cost in CTA | "Generate ✦ 32" — the price lives inside the button that spends it |

### 13.4 Patterns built new, and why

These have no single Higgsfield source because Higgsfield does not have the problem. Each is
assembled from confirmed parts and introduces no new token:

| Pattern | Serves | Built from |
|---|---|---|
| Source coverage list | P2 — "each adapter declares its coverage and its failure mode" | status chips + notice row + source badge |
| Source badge | P2 | Higgsfield's per-model colour tokens (`--color-mcp-model-*`), which solve the identical problem for generation models |
| Tier indicator | P4 — four analysis tiers | four pips filled to depth; derived from the credit meta chip |
| Candidate picker | P1 — resolve with confidence and confirm | model-picker row + a right-aligned confidence figure |
| Placement row | P5 — one creative, many observations | asset list row + date meta + a live dot |
| Evidence panel | P3 — explain a tiered attribution decision | the Recommended / Avoid panel, relabelled |

### 13.5 Where the brief and Higgsfield disagree

One place, worth recording. Higgsfield's galleries treat every asset as equal and let the grid carry
the meaning. spyy's results are **not** equal: an attributed creative and an uncertain one need to be
distinguishable at a glance in the same grid. The result card therefore carries a status chip that
Higgsfield's asset cards do not have. It uses the confirmed chip component at its smallest size, so
the addition is to the *composition*, not to the visual language.

---

## 14. The light theme, and what it cost

The dark theme is transcribed. The light theme is **derived** — Higgsfield ships no light build of
the product chrome, only light marketing pages — so everything in this section is `[I]` unless it
says otherwise. It was validated by compositing every text node against its real painted background
across all five pages at 1440px and re-measuring the contrast ratio.

### 14.1 The bug the audit found: ink that flipped when its surface did not

`--hf-color-text-inverse` flips with the theme (near-black on dark, white on light) because the
surface it normally sits on flips too. But a **tint fill does not flip** — lime-500 is lime-500 in
both themes. Every component that painted a lime fill and then asked for `text-inverse` came out
white-on-lime in the light theme: **1.17:1**. That hit the brand button, the marketing-primary
button, the lime badge, the selected chip, the brand icon tile, the completed step dot, the
"Confident" gauge verdict and the scanning badge.

Fix — two theme-constant ink tokens, deliberately **not** redefined under `[data-theme="light"]`:

| Token | Value | For |
|---|---|---|
| `--hf-color-text-on-tint` | `grey-550` `#1a1a1a` | lime, teal, green, amber fills |
| `--hf-color-text-on-tint-inverse` | `grey-050` `#ffffff` | pink, blue fills |

The semantic status fills needed no such token: `--hf-color-state-*-fg` already darkens in the light
theme (green-500 → green-700, yellow-500 → yellow-800), so `text-inverse` tracks it correctly.

### 14.2 Tint as type is not tint as paint

A second class of failure: the tint used to **set type**, not to fill. Eyebrows, active nav items,
the pressed toggle label, the selected option label and caption, section-head icons, the level index
and problem id on the docs chrome — all lime-on-white at 1.07–1.17:1.

Added `--q-tint-text`, which is the tint itself on dark and a darkened mix on light:

```css
:root              { --q-tint-text: var(--q-tint); }
[data-theme=light] { --q-tint-text: color-mix(in oklab, var(--q-tint) 62%, #000000); }
```

The mix keeps this tint-agnostic, so the Marketing pink and the Supercomputer teal darken the same
way when `--q-tint` is switched. This follows a rule the DS already had: `--hf-color-border-focus`
is lime-500 on dark and **lime-700** on light, for exactly this reason. Components that *paint* with
the tint still use `--q-tint`; only ones that set type in it use `--q-tint-text`.

### 14.3 Cascade order — the addendum outranked the light block

`:root` and `[data-theme="light"]` carry identical specificity (0,1,0), so the later one wins. The
Mobbin addendum at the end of `tokens.css` is a `:root` block, which meant it silently overrode the
light theme for every token it declared. The four product surfaces stayed `#0f1113`–`#23262a` in
light mode, so the template screens rendered dark chrome with light-theme ink. The light values for
those surfaces now live in a `[data-theme="light"]` block **after** the addendum, with a comment
saying why it has to be there.

### 14.4 Derived light values

| Token | Dark | Light | Why |
|---|---|---|---|
| `--hf-surface-app` | `#0f1113` `[C]` | `#ffffff` | the dark ramp mirrored at the same relative steps |
| `--hf-surface-panel` | `#131517` `[C]` | `#fafafa` | " |
| `--hf-surface-card` | `#1c1e20` `[C]` | `#f4f4f4` | " |
| `--hf-surface-control` | `#23262a` `[C]` | `#eaeaea` | " |
| `--hf-color-skeleton` | `#202227` `[C]` | `#e4e4e4` | promoted from a literal in `components.css` to a token |
| `--hf-color-text-disabled` | `#484e56` `[C]` | `grey-250` `#7f7f7f` | grey-150 was 1.24:1 on white — unreadable even for a disabled control |
| `--hf-color-state-warning-fg-soft` | `yellow-500` `[C]` | `yellow-900` | yellow-800 was 2.87:1 on white |

Two elements keep theme-constant ink because they sit on something that never flips: the result
card's duration chip (a 60% black scrim over media) and the processing badge in its `done` state
(a green fill).

### 14.5 What was left alone on purpose

Higgsfield's confirmed `--hf-color-text-tertiary` is `#626262`, which measures **2.4–2.8:1** on the
product's own dark surfaces — below WCAG AA for body text. It carries captions, metadata, helper
text and placeholder text throughout the product.

It was not changed. The brief is explicit that accuracy beats interpretation, and this is a
transcribed value, not a derived one. It is recorded here as a property of the source system so the
team can decide deliberately. The light theme's tertiary is a *derived* value, so it was allowed to
land at a readable `#7f7f7f`.

Disabled text and 50%-opacity controls also sit below 3:1 in both themes. That is intended — they
are exempt under WCAG 1.4.3 and it matches the source.

### 14.6 Method

`contrast.mjs` walks every element with a text child, composites the full background stack
(including alpha layers) down to the root, applies inherited opacity, and reports anything under
3:1. Run per theme, per page. Current state: **0 findings on all five pages in the light theme**
apart from intentionally-dim disabled controls and two gradient-backed elements the compositor
cannot read.

---

## 15. The component API table

`components.html#api` lists every `data-*` property each base component accepts and every state it
responds to. It is **extracted from `components.css`**, not written by hand: a script parses each
selector, collects the attribute matchers and pseudo-classes attached to a given base class, and
emits the rows. So a variant listed there is a variant that has a selector; the docs cannot claim a
property the CSS does not implement.

If `components.css` changes, re-run the extraction rather than editing `COMPONENT_API` in `app.js`.

Two conventions the table makes visible, both taken from Higgsfield rather than chosen:

- **The browser owns hover, active and focus; the app owns selected, checked, open and disabled.**
  Higgsfield never mirrors a pointer state into an attribute — there is no `data-hovered`. States
  that outlive the pointer are attributes; states that do not are pseudo-classes.
- **Loading is `aria-busy`, error is `data-invalid` on the control.** The first is already standard
  and Higgsfield uses it; the second means the label and the message both read the flag from one
  place instead of each being set independently.

Components with no `data-*` property and no interactive state (`.spy-card-title`, `.spy-panel-body`,
the type-scale helpers) are not listed — they take content, not configuration.

---

## 16. The reference site's own layout

Nothing in this section is part of the design system. It records how the site that *displays* the
system is laid out, because the first version of it did not hold up.

### 16.1 What was wrong

Navigation was two horizontal strips — five level tabs in the masthead, then a scrolling row of
section links under it. That meant: you could only see the sections of the page you were already on;
jumping from a component to the pattern that uses it took two clicks and a scroll; on a phone both
strips became side-scrollers, which hide their own contents; and the content column ran the full
window width, so prose lines reached 140 characters on a wide screen.

### 16.2 What it is now

The structure reference documentation sites converge on, for reasons that apply here too:

| | |
|---|---|
| **Top bar** | brand, current level, a filter over the whole system (`/` focuses it), theme switch |
| **Left rail** | every section of every level, always. 44 entries, 6 groups, identical on all five pages — only the active marker moves |
| **Content column** | one measure for prose (`--doc-measure`, 68ch), full column for specimens |

The rail is built from a single manifest in `shell.js`, so the five pages cannot disagree about what
exists. A scroll-spy marks the section in view. Below 64rem the rail becomes a drawer over a scrim,
because a 44-item list cannot share a phone screen with content.

Three consequences worth stating, since they are the point:

- **Any section is one click from any other.** The Templates page can send you to the pattern it
  used and the pattern can send you to the component it is built from, without going up a level.
- **Prose has a fixed measure.** The section head, the lede and the callouts are capped; only
  specimen grids use the full column. A line of body text does not get longer because the window did.
- **The section title steps up the ladder.** It was one step above its own subsections and read
  flat; it now takes `--text-h4`, so the page has three legible levels of heading instead of two.

### 16.3 The bug the restyle exposed: white fills on a white surface

Higgsfield paints its quiet surfaces — the tint under a chip, a code block, a progress track, a
count badge, an icon tile — with **white alpha**, because the product is dark. Components were
reading those primitives directly (`--hf-color-transparent-light-05/10/20`), which violates the
system's own rule that a component reads only the semantic layer. In the dark theme it is invisible
as a mistake. In the light theme, white-on-white made 37 of those surfaces disappear.

Added a semantic fill ladder, flipped in the light block:

| Token | Dark `[C]` | Light `[I]` |
|---|---|---|
| `--hf-color-fill-subtle` | white 5% | black 5% |
| `--hf-color-fill-default` | white 10% | black 10% |
| `--hf-color-fill-strong` | white 20% | black 20% |

37 declarations across `components.css`, `patterns.css` and `docs.css` were moved onto it. Two
groups deliberately keep the raw white-alpha primitive, and a detector script checks that only these
remain: the **alpha-ladder specimens** on the Foundations page, which exist to show the primitive
itself, and anything painted **over generated media** (the scrubber, the result-card overlays),
because media is dark in both themes.

The method: render each page in the light theme and report every element whose computed background
is `rgba(255,255,255,α)` with `0 < α < 1`. Text-contrast checking would never have caught this — the
text was perfectly readable, it was the surface underneath it that had vanished.

---

## 17. The re-skin, and what it broke

Colour and type family were replaced with ManyChat's (see `MANYCHAT-AUDIT.md`); geometry, spacing,
components, patterns and templates were not touched. That is what the three-tier architecture is
for — a component never reads tier 1 — and the swap was 200 lines of `tokens.css`. What follows is
what the swap broke, because a palette swap is never only a palette swap.

### 17.1 One colour was kept

The brand green stays. Nothing in the new palette replaces a highlight yellow-green, and it is the
product's signature — the new palette's own `lime-500` is an olive (`#5a7a03`), not a highlight.
So `lime-*` is the one ramp still carrying the old values, and everything around it is new.

### 17.2 The semantic layer was calibrated for the old ramps

The old hue ramps put a bright mid tone at `-500`; the new ones are built for white, where `-500`
is already dark. Every status role kept pointing at the same step number and went unreadable on the
dark ground — error at 2.89:1, warning at 1.85:1. Retuned by measurement, not by eye:

| Role, dark theme | Was | Now | Was measuring |
|---|---|---|---|
| `state-error-fg` | red-600 | red-300 | 2.89:1 |
| `state-success-fg` | green-500 | green-300 | 2.75:1 |
| `state-warning-fg` | yellow-700 | yellow-300 | 1.85:1 |
| `state-info-fg` | blue-500 | blue-300 | — |
| `text-danger` | red-600 | red-300 | 2.37:1 |
| `text-disabled` | shade-100 | grey-325 | 1.39:1 |
| `text-tertiary` | grey-325 | grey-250 | 2.55:1 |

`text-tertiary` in the light theme moved the other way, grey-250 → grey-325, for the same reason:
`#878787` on white is 2.95:1. Both replacements are steps off the transcribed neutral ramp, so the
fix stayed inside the source palette.

`--hf-color-button-destructive` is the one fill that does not flip with the theme — every red step
at `-500` and below is dark — so its label is pinned to constant white rather than `text-inverse`.

### 17.3 Colours hardcoded outside the token layer survived the swap

Four backdrops in `docs.css` — the fake-media wash, the glass stage, the media fallback — were
mixed from literal hexes of the *old* brand pink, old brand blue and the old blue-leaning grey
ramp. Nothing in `tokens.css` could reach them, so they kept painting in a palette that no longer
existed anywhere else on the page. All four now read tokens. The lesson is the ordinary one: a
literal hex outside the token layer is a colour that will not be there when you change the palette.

### 17.4 Type is two faces now, not four

`primary`, `secondary`, `grotesk` and `mono` became **display**, **text** and **mono**, with the old
four names aliased onto them so no component had to be rewritten.

- **display** — `.spy-display`, `.spy-h1`, `.spy-h2`, `.spy-h3` only.
- **text** — `.spy-h4` and below, and all body copy. A heading is not automatically a header; h4 sits
  inside running text and belongs with it, or the page reads like a poster.
- **mono** — code, tokens, measurements.

`[A]` on the display face. It is meant to match the header face of the marketing site, which sits
behind a bot check that neither browser could clear and that this work does not try to defeat.
Space Grotesk stands in at roughly the right weight and width. Identifying the real one changes
exactly one token, `--hf-type-family-display-base`.

### 17.5 Geometry bugs found while looking

Four, all caught by a detector rather than by eye, and all the same class of defect — a literal
where a token belongs:

| | |
|---|---|
| `.spy-btn[data-size="lg"]` | `0.875rem` (14px) — the only radius on the site off the scale |
| app ladder `xl` / `xxl` | the same 14px, twice more |
| `.spy-tier-pips` | `gap: 3px`, off the spacing scale |
| `.spy-tier-pip`, `.doc-screen-bar > span` | `1px` and `50%` where `radius-full` was meant |

The visible symptom was a row of buttons whose corners stepped 2 → 8 → 10 → 12 → 14px, which reads
as five unrelated components rather than one at five sizes.

Two hit-area fixes came out of the same sweep: `.spy-table-filter` is a sort control that looks like
a label and was 16px tall with no focus ring, and `.spy-composer-attachment-remove` was a 16px
target. Both keep their mark and gain a 24px box around it.

### 17.6 The segmented control was wearing a panel's elevation

The theme switch carried `--hf-shadow-sheen`, the inset top highlight that makes a large surface
look raised. On a control 32px tall the same inset reads as a vertical gradient down the track, so
the two halves of the switch were different tones. It now takes a flat fill and one hairline.

### 17.7 Naming

The shipped pages, stylesheets and scripts no longer name the source products. The provenance files
— this one, `MANYCHAT-AUDIT.md`, `GAPS.md` and `_audit/` — still do, because a provenance record
that will not say where a value came from is worth nothing. They are not linked from the site's
navigation. Decide separately whether they ship.
