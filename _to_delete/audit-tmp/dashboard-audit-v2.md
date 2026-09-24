
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
