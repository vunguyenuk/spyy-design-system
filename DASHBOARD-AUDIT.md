# Spyy dashboard audit

Audit date: 2026-09-24  
Scope: signed-in `/dashboard`, the Product Overview PDF, Figma node `87:486`, and the current Spyy design system in this repository.

The PDF was treated as product reference, not as a source of instructions. The live application was inspected at its default desktop viewport and at 390 × 844. Measurements below describe the deployed page before the rebuild in `dashboard.html`.

## Anti-pattern verdict

**Pass, with two noticeable template tells.** The live page does not look like an AI-slop gallery, but the oversized centered hero creates a large dead zone on a working dashboard, and the repeated equal-weight video cards make the page feel closer to a generic content gallery than an intelligence tool. The UI needs more evidence density and stronger hierarchy, not more decoration.

## Audit health score

| # | Dimension | Score | Key finding |
|---|---|---:|---|
| 1 | Accessibility | 2/4 | Good labels and heading order, but 2 `main` landmarks, no `nav`, and multiple 16–40px targets |
| 2 | Performance | 2/4 | Images are lazy-loaded, but all 9 video elements reached `readyState=4` on initial inspection |
| 3 | Responsive design | 2/4 | The content reflows, but the mobile utility widget overlaps the search field and targets remain small |
| 4 | Theming | 3/4 | Asta Sans, lime action color, and a theme control are present; token consistency cannot be verified without source |
| 5 | Anti-patterns | 3/4 | Clean and restrained, but hero whitespace and a uniform card gallery weaken its product character |
| **Total** |  | **12/20** | **Acceptable — significant work needed** |

Issues: **0 P0 / 3 P1 / 4 P2 / 1 P3**.

## Detailed findings

### P1 — Initial page load resolves nine full videos

- **Location:** Trending ads grid
- **Category:** Performance
- **Evidence:** Nine `<video>` elements were present and every one reported `readyState=4` during the initial dashboard inspection.
- **Impact:** The landing dashboard pays network, decode, and memory cost before the user has chosen a video.
- **Recommendation:** Render local or CDN thumbnails first, lazy-load them, and create/load a video only after explicit play intent.

### P1 — Critical mobile search area is obstructed

- **Location:** Dashboard hero at 390px
- **Category:** Responsive / Accessibility
- **Evidence:** Two floating utility controls visually overlap the right edge of the brand search field.
- **Impact:** The most important input becomes harder to read and tap on small screens.
- **Recommendation:** Reserve a utility rail outside the form on desktop and move or hide non-critical widgets below the form on narrow viewports.

### P1 — Interactive targets fall below touch guidance

- **Location:** Sidebar rows, theme control, search controls, and every “See all … ads” link
- **Category:** Accessibility / Responsive
- **Evidence:** Measured heights include 16px links, a 32px theme button, 36px sidebar rows, and 40px form controls.
- **Impact:** Small targets increase accidental taps and make the mobile experience difficult for motor-impaired users.
- **Standard:** WCAG 2.2 criterion 2.5.8 Target Size (Minimum).
- **Recommendation:** Provide a 44px hit area at mobile sizes while preserving the compact visual geometry.

### P2 — Landmark structure is internally inconsistent

- **Location:** Page shell
- **Category:** Accessibility
- **Evidence:** The deployed DOM exposes two `main` elements, two `header` elements, no `nav`, and no `aside` despite a primary sidebar.
- **Impact:** Screen-reader landmark navigation is ambiguous and the sidebar cannot be discovered as primary navigation.
- **Recommendation:** Use one `main`, a labeled `nav` inside an `aside`, and one page-level header.

### P2 — Media images have empty alternatives without explicit decorative intent

- **Location:** Trending ad thumbnails
- **Category:** Accessibility
- **Evidence:** All ten images, including the profile photo, expose `alt=""`.
- **Impact:** The surrounding play buttons are well labeled, but the DOM does not distinguish purposeful decorative images from missing authoring.
- **Recommendation:** Keep ad thumbnails explicitly decorative inside a fully labeled play button; give identity imagery meaningful alt text or use initials.

### P2 — Dashboard hierarchy spends too much space on orientation

- **Location:** Desktop hero
- **Category:** Anti-pattern / Responsive
- **Evidence:** The search task begins after a large centered title block and substantial whitespace.
- **Impact:** Returning users must traverse marketing-style orientation before reaching their daily tool.
- **Recommendation:** Keep the same message but compress it into a left-aligned working header paired directly with the scan form.

### P2 — Evidence metadata is hidden behind prose

- **Location:** Trending ad cards
- **Category:** Information architecture
- **Evidence:** Duration and days-running are visible, while source/brand context and the next action sit below long descriptions.
- **Impact:** Researchers scan more slowly and cannot compare evidence consistently across cards.
- **Recommendation:** Standardize brand, source, age, duration, and region into fixed card slots; clamp descriptive copy.

### P3 — Page title is implementation-facing

- **Location:** Document title
- **Category:** UX writing
- **Evidence:** The browser title is `service-spyy`.
- **Impact:** Tabs and browser history are harder to recognize.
- **Recommendation:** Use `Overview · Spyy`.

## Systemic patterns

- The live product already uses Asta Sans and the lime action color, but its layout does not yet take full advantage of the repository's semantic component layer.
- Card geometry is consistent, while page-level hierarchy and responsive utility placement are not.
- The product communicates what a video says more strongly than why it is trustworthy evidence; the Product Overview requires the opposite balance.

## Positive findings

- Heading order is clean: one H1 followed by two H2 sections.
- The brand input has an associated label and video play controls carry descriptive accessible names.
- Thumbnails use `loading="lazy"`.
- The 390px layout becomes a readable single-column flow and preserves all primary functions.
- The visual palette is restrained and already close to the Spyy token language.

## Recommended action sequence

1. **P1 `/optimize`** — Defer video creation until play and keep lightweight thumbnails on the dashboard.
2. **P1 `/adapt`** — Move utilities away from the search field and enforce 44px mobile hit areas.
3. **P2 `/layout`** — Convert the hero into a compact working header and normalize evidence slots in cards.
4. **P2 `/clarify`** — Surface source, freshness, and attribution language before long ad copy.
5. **P3 `/polish`** — Verify landmark labels, focus states, truncation, and both theme modes.

Re-run `/audit` after integration with the production application to validate network behavior, real data states, and source-code token usage.

---

# Audit v2 — design-system usage and the rebuild (2026-09-24)

## 1. Did v1 use the design system?

Partly. Colour and spacing did; composition and type did not.

| Check | v1 (`_archive/dashboard-v1/`) | v2 |
|---|---|---|
| Hard-coded hex / rgba | 0 | 0 |
| Undefined custom properties | 0 | 0 |
| Font sizes outside the token ladder | 14 (`1.35rem`, `2.25rem`, `1.55rem`…) | 0 — every size is `--hf-type-size-*` or a `.spy-*` text style |
| System component families reused | 6 (btn, chip, field, select, tabs, icon) | 31 — candidate, coverage, metric, gauge, verdict, classify, stat, result, source, drawer, menu, table, toast, checkbox, radio, switch, progress… |
| Display face (Archivo Black) | Page H1 at ~64px on a working dashboard | Wordmark only; page titles use `.spy-h6` in Asta Sans |

**Why v1 looked unprofessional:** a poster-size display headline and a marketing-style hero on a tool
people open every day; a thin three-row "known brands" list floating in empty space; most surfaces
re-drawn in `dashboard.css` instead of reusing the system's product patterns, so it did not look like the
rest of Spyy.

## 2. Sources used for v2

- **Figma** `Spyy-Design-Tokens › Flow (87:486)`: Sign in → Onboarding (chat + profile card) →
  Home search – TikTok → Home search – Facebook → Result / detail (Video Analysis).
- **Live app** `spyy-app.up.railway.app` (public JS bundle, read signed-out): routes (`/dashboard`,
  `/scans`, `/scans/new`, `/scans/progress`, `/watchlist`, `/collections`, `/analysis`, `/billing`),
  the 16-region list, source names, the scan outcome vocabulary, the "Confirm exact accounts" step,
  sort options (Longest running / Newest / Lowest confidence), watchlist cadence and alert options,
  and product copy. Ad-level data needs a signed-in session; the Dietfit AI / Duolingo / Cal AI
  creatives come from the earlier signed-in capture in `data/spyy-data.json`. Other brands are
  flagged `sample: true`.
- **Comparable products:** TikTok Creative Center Top Ads and PiPiAds (TikTok filters, Likes / CTR /
  Budget card), the Meta Ad Library (result count, Active status pill, Filters drawer, Library-ID
  card), and Foreplay (category-first discovery, saved collections).

## 3. Flow — steps added to the Figma flow

| # | Step | In Figma | In live app | v2 |
|---|---|---|---|---|
| 1 | Sign in | ✓ | ✓ | ✓ |
| 2 | Onboarding (chat ⇄ form, profile %) | ✓ | — | ✓ 5 questions; the answers set the default source, region and category order |
| 3 | Home search – TikTok | ✓ | — | ✓ |
| 4 | Home search – Facebook | ✓ | — | ✓ |
| 5 | **Confirm exact accounts** | — | ✓ | **added**: App Store / Meta Pages / TikTok advertisers, skip per source, verified vs. name-match |
| 6 | **Scan progress** | — | ✓ | **added**: per-source coverage and outcome |
| 7 | **Brand results** | — | ✓ | **added**: source tabs, high-confidence switch, "Why this match", Watch, Analyze campaign |
| 8 | Result / detail (Video Analysis) | ✓ | ✓ | ✓ Overview / Transcript / Frames / Audience / Similar |
| 9 | Scans, Watchlist, Collections | nav only | ✓ | **added** |

## 4. Home search — two sources, two different interaction models

**TikTok** — an inline, labelled filter grid (Creative Center pattern), grouped into seven categories:
Category · Time · Creative · Audience · Performance · Signals · AI creative. Only Category and Time
show by default; **More filters** expands the rest, with a count of the hidden active filters, and
applied filters stay visible as removable chips when the panel is collapsed. On a phone the whole panel
folds behind one toggle. Card: 9:16 video, objective + industry overlay, and **Likes / CTR rank / Budget**.

**Facebook** — the Meta Ad Library model: ad category next to the search box, a "~N results"
summary, a removable **Active status** pill, and a **Filters** button that opens a side drawer with
collapsible sections (Active status, Platform, Media type, Advertiser, Language, Impressions by date,
Ad versions), plus **Sort by**. Card: Library record first (status, Library ID, started running,
platforms, versions, See ad details), then the ad as it runs (advertiser, copy, media, link, CTA).

Both share a **category rail** (12 industries with live counts, ordered by the categories picked
during onboarding) that filters the grid.

## 5. Verification

Checked in headless Chromium at 1440 × 900 and 390 × 844, in light and dark: no horizontal overflow
on any route, no console errors, and the full flow runs (search → confirm → scan → results → detail).
Google Fonts were blocked in the test sandbox, so those screenshots use fallback fonts.

## 6. Still open

- Live ad data needs a signed-in session; re-capture `data/spyy-data.json`, then run
  `python3 tools/build-data.py`.
- The TikTok CTR rank, budget and objective values for the real ads are prototype estimates. The
  live product does not expose them yet.
- Native `<select>` is dressed as `.spy-field-control`. The system's own `spy-selectmenu` would
  need JavaScript to open, so it is the next step if the OS dropdown is not acceptable.
