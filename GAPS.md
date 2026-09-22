# Gap audit — spyy against the design system

Reviewed: the product brief (`Product Overview`, kick-off), the vibed Video Analysis screen,
and the current design system. Written before any new component was built.

---

## 1. What the product actually needs

The brief describes a narrower and harder product than the vibed screen suggests. spyy takes a
**brand name** and returns **that brand's video advertising**, later the campaign behind it.
Five things in that sentence generate nearly all the UI:

| # | From the brief | UI consequence |
|---|---|---|
| P1 | "Resolve free text to a set of candidate accounts and app listings, **with a confidence score and a way for the user to confirm**" | A disambiguation step. Candidate list, confidence per candidate, explicit confirm, and a way back when it is wrong. **Everything downstream depends on this being right** — so it cannot be a silent auto-pick. |
| P2 | "One adapter per source… **each adapter declares its coverage and its failure mode**" | Per-source status. The UI must be able to say "Meta: 34 videos · TikTok: partial · App Store: failed" without the whole scan reading as broken. |
| P3 | "Decide brand relevance from **cheap signals** before touching the video… Vision analysis is the last resort" | Attribution needs to be *explainable*. Which signals fired, how confident, and what a human can do about a wrong call. |
| P4 | "**Tier** the work so expensive steps run on few videos" (metadata → frames → transcript → multimodal) | Each video carries a visible analysis depth. Users need to see why one video has a transcript and another does not, and to request a deeper tier. |
| P5 | "A canonical video entity… per-platform observations… **first seen, last seen and where a creative ran**" | One creative, many placements. The UI is not a list of videos — it is a list of *creatives*, each expanding to placements across platforms and time. |
| P6 | "A scan is an **async job**… **report partial results as they land**… must survive one source failing" | Results stream in. There is no single loading state; there is a progressively filling page with per-source progress. |
| P7 | "Instrument **cost per scan** and cost per analyzed video from day one" | Cost is user-facing, not just telemetry. It belongs in the run button and on the results. |

## 2. What the vibed screen covers

The Video Analysis screen is a good, dense read of **one** video. Against the brief it sits at
the very end of the flow — it is step 5 of 5. It covers no part of P1, P2, P3, P4, P6 or P7.

That is not a criticism of the screen; it is a scope observation. The components it needs,
though, are mostly missing from the system:

| In the vibed screen | In the DS? |
|---|---|
| App shell: sidebar nav, top bar, workspace switcher, upgrade card | **Yes** — sidebar, nav, switcher, promo card all exist |
| Tabs (Overview / Transcript / Frames / Audience / Similar) | **Yes** — line variant |
| Video player with overlay metrics | **Partly** — media + overlays exist; the vertical player with a side action rail does not |
| Stat grid (Views / Likes / Saves / Shares / …) | **No** |
| Score card (Hook Strength 91/100 + bar + label + confidence) | **No** |
| Radial score gauge (Adaptability 78/100) | **Partly** — a progress ring exists; the score gauge with verdict does not |
| Verdict groups (Keep / Modify / Remove with counts) | **No** |
| Ranked list with impact badges (Why It Worked) | **No** |
| Classification rows (label → value chips) | **No** |
| Effort summary (Shoot / Edit / Assets / Talent + Low badge) | **No** |
| Split button ("Create similar video" + caret) | **Yes** — attached button group |
| Search with ⌘K | **Partly** — field exists; the kbd chip does not |
| Breadcrumb | **No** |
| Tag row under takeaways | **Yes** — chips |

## 3. Where the vibed screen departs from Higgsfield — and should change

Three of these matter enough to redo. Each is backed by a capture, not by preference.

### 3.1 Six differently-coloured score bars → one colour, one calibration bar

The vibed screen gives each of the six scores its own bar colour: green, blue, purple, amber,
green, red. Higgsfield's own scoring surface (the Virality Predictor, capture #500) does the
opposite: **every metric bar is the same lime**, and the qualitative reading is carried by
a single **red→amber→yellow gradient scale** next to the headline score, labelled LOW / HIGH.

Why theirs is better here, on the product's own terms: with six independently-coloured bars,
colour stops meaning anything — a green "Replicability 87" and a green "Hook 91" sit beside a
red "Brand Safety 38" and the eye reads *severity* where the data means *different dimensions*.
spyy has the same problem, worse: Brand Safety being low is not bad the way Conversion Intent
being low is bad. One neutral bar colour plus one calibrated scale keeps that straight.

### 3.2 Boxed score cards → label / value / bar rows

Higgsfield renders metric sets as **rows in a two-column grid** — label left, value right,
full-width 4px track beneath — not as six bordered cards. At six-plus metrics the row form is
far denser and lines the values up for comparison, which is the entire point of a score set.
Keep the card treatment for the one headline score.

### 3.3 Accent colour

The vibed screen uses an indigo accent. The audited system's brand is lime `#d1fe17`. Rather
than invent a third colour, note that Higgsfield ships a **purple ramp** (`purple-600 #7152f4`)
that is close to the vibed indigo, and that every stateful component in this system reads
`--q-tint`. So spyy can keep an indigo accent and stay Higgsfield-true by re-tinting — the same
mechanism Higgsfield uses for Marketing Studio (magenta) and Supercomputer (teal). This is a
decision for you; the system supports either, and both are shown in Foundations.

## 4. What is missing, and where the pattern comes from

| Needed | Serves | Higgsfield source | Status |
|---|---|---|---|
| Metric bar row | AI Analysis Scores, attribution confidence | #500 Virality Predictor | **build** |
| Headline score + gradient scale | Overall score, viral potential | #500 | **build** |
| Score gauge with verdict badge | Adaptability, quality checks | #125–126 moodboard quality ring | **build** |
| Stat row / stat grid | Video Performance, scan summary | #500 stat row, #533 usage | **build** |
| Verdict group (Keep / Modify / Remove) | Adaptability detail, attribution decisions | #126 Recommended / Avoid panel | **build** |
| Evidence row with thumbnails | Attribution signals (P3) | #126 Recommended / Avoid | **build** |
| Ranked list with impact badges | Why It Worked | composed from list + chip | **build** |
| Classification list (label → chips) | Content Classification | #533 settings rows + chips | **build** |
| Candidate picker with confidence | **P1 brand resolution** | model picker rows (#199) + option-card grid (#8–15) | **build** |
| Option card (icon + label, selectable) | Aspect ratio, source, tier pickers | #199 16:9 / 1:1 / 9:16 selector | **build** |
| Navigator row (label / value / chevron) | Source and tier selection | #199 "Model · Seedance 2.0 ›" | **build** |
| Processing frame (lime outline + status pill) | **P6 scan running** | #501 "Analyzing" state | **build** |
| Source coverage list | **P2 per-source coverage and failure** | status chips + notice row | **build** |
| Source badge | Meta / TikTok / App Store / YouTube | per-model colour tokens (`--color-mcp-model-*`) | **build** |
| Tier indicator | **P4 analysis depth** | credit meta chip + stepper | **build** |
| Placement / timeline row | **P5 first seen, last seen, where it ran** | asset list rows + date meta | **build** |
| Cost in CTA | **P7 cost per scan** | "Generate ✦ 32" (#199), "Create moodboard ✦ 25" (#126) | **build** |
| Upload dropzone | clip input | #199 "Upload media" | **build** |
| Breadcrumb | deep navigation | #500, #126 | **build** |
| Kbd chip | ⌘K search | #533, #500 nav | **build** |
| Vertical video player + action rail | video detail | #66–71 media viewer | **build** |
| Result grid with hover actions | scan output | asset grids throughout | **compose** |
| Filter bar | results filtering | chips + selects | **compose** |
| Page header with actions | every screen | #533, #500 | **build** |

## 5. Structure

The system is currently one page. For a team to use it while building, it needs the
four-level structure you asked for:

- **Foundations** — tokens and the rules that govern them
- **Components** — single-purpose primitives, with every state
- **Patterns** — composed solutions to recurring product problems, each stating which product
  requirement it serves
- **Templates** — whole screens, assembled from the above, one per step of the spyy flow

Patterns is the level the current system lacks entirely, and it is the level this product
needs most: a score row is not a component decision, it is a decision about how spyy talks
about confidence.
