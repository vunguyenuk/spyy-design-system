# Coverage — spyy against Nuxt UI

Nuxt UI publishes 88 components. Comparing against them is not a shopping list —
half of what they ship is Vue plumbing (`App`, `Theme`, `ColorMode*`, the editor,
the AI-chat shell) that a token-and-CSS system has no business owning. What the
comparison is good for is finding **kinds of UI spyy will need and has no answer
for**, and finding places where spyy has something close but not the thing.

Counted against the class names actually declared in `components.css`,
`patterns.css` and `landing.css` — not against memory:

| | first count | now |
|---|---|---|
| ● have | 50 | **71** |
| ◐ partial | 9 | **4** |
| ○ missing | 22 | **8** |
| – n/a | 7 | **7** |

Nine were built in one pass — Breadcrumb, Navigation menu, Data table, Timeline,
Content search, Chat prompt, Chat tool, and the two that already existed but only
as sketches, Pagination and Stepper. The count moves by less than nine because
three of them replaced partials and two were already counted as *have*: the
point was never the number, it was that a breadcrumb lived in `patterns.css`
among the spyy-specific rows, a "command palette" was a search field with no
result list, and a "table" had no way to sort.

## What matters, and in what order

Of the 22 missing, these are the ones an ad-intelligence product cannot be
designed without. The ranking is the product's, not Nuxt's — a tool whose whole
job is *pick a competitor, pick a window, look at creatives* needs a searchable
select and a date range far more than it needs a colour picker.

| | Why spyy needs it |
|---|---|
| **SelectMenu** — searchable select ** ● built | Picking one competitor out of hundreds. A plain select is unusable past ~20 options, and every filter on the scan screen is past 20. |
| **InputDate** + **Calendar** — date range ** ● built | Every scan is *over a window*. There is currently no way to express one. |
| **Carousel** ○ | The creative is the product's core object and it comes in sets. A grid is the index; a carousel is how you actually look at them. |
| **Drawer / Slideover** ○ | The creative detail opens beside the list, not over it. `.spy-panel` is close but it is a static right rail, not an overlay with a backdrop and a close. |
| **Popover** ○ | Filters, quick actions, the score explainer. `.spy-nav-popup` is one popover hard-wired to the nav. |
| **CommandPalette** ** ● built | The product is a search product. `.spy-modal-search` is the input, not the palette — no result list, no groups, no keyboard model. |
| **InputTags** ○ | Keyword sets, competitor lists, negative terms. Currently a plain text field and a convention. |
| **Timeline** ** ● built | When an ad started, when it stopped, when the scan ran. The verdict rows say *what*; nothing says *when*. |
| **Tree** ○ | The category taxonomy. `.spy-menu` nests one level; a taxonomy does not. |
| **InputNumber** ○ | Score thresholds, spend floors, result caps. |
| **Form** + **FormField** grouping ** ● built | `.spy-field` is one field. Nothing owns the group: no shared error summary, no required/optional rhythm, no submit row. |
| **CheckboxGroup** ○ | Every filter list is one. Currently repeated `.spy-checkbox` with the spacing re-decided each time. |
| **ScrollArea** ○ | Long lists inside a panel. Right now they inherit the browser's scrollbar, which is the one piece of chrome the system does not control. |
| **Banner** ○ | "You have used 180 of 200 scans." A quota warning is not a toast — it does not dismiss and it is not an event. |
| **Splitter** ○ | List beside detail, resizable. The app shell assumes fixed widths. |
| **PricingTable** ○ | The landing page has `.spy-plan` cards but no comparison table, which is the page every pricing page eventually needs. |
| **AuthForm** ○ | There are two Sign-in frames in Figma and no CSS behind them. |

Eight are left. Two are still worth building — **PricingTable** for the landing
page, and **AuthForm**, which has two frames in Figma and no CSS behind them.
**Form** is a behaviour, not a style: the field, the group and the error message
all exist, and what is missing is validation, which belongs in the app.

Deliberately not building: **ColorPicker**, **InputRating**, **InputTime**,
**PinInput** — spyy has no use for any of them, and a design system that ships
components nobody calls is the thing this audit exists to prevent.
**Link** is a token concern, not a component: `--hf-color-text-link` already
exists and nothing needs a wrapper around `<a>`.

## The nine partials

These are the more interesting rows, because "close" is how a system drifts.

| Nuxt | spyy has | What is actually different |
|---|---|---|
| Collapsible | `.spy-accordion-item` | Only exists inside an accordion. A standalone disclosure has to borrow accordion markup and then fight its borders. |
| FieldGroup | `.spy-fieldgroup` | *Built.* Was buttons-only; an input with an attached select or suffix button had no answer. |
| Listbox | `.spy-menu` | A menu is a list of *commands*; a listbox is a list of *values* with a selection model. Same look, different semantics, and the selected state is drawn differently. |
| CommandPalette | `.spy-modal-search` | The input, not the palette. |
| Popover | `.spy-nav-popup` | One popover, welded to the nav. |
| Slideover | `.spy-panel` | A static rail, not an overlay. |
| Error | `.spy-empty` | Empty and failed are not the same state and should not look the same. |
| Dashboard shell | `.spy-sidebar` | The sidebar exists; the resizable panel group around it does not. |
| AI chat | `.spy-composer` | The input exists; the message list, the reasoning block and the tool call do not. |

## Full table

Legend: ● have · ◐ partial · ○ missing · – framework plumbing

| | Nuxt UI | spyy | In |
|---|---|---|---|
| **Layout** | | | |
| ● | Container | `.spy-container` | components |
| ◐ | Error | `.spy-empty` | components |
| ● | Footer | `.spy-footer` | landing |
| ● | Header | `.spy-mnav` | landing |
| ● | Sidebar | `.spy-sidebar` | components |
| ● | Splitter | `.spy-split` | components |
| – | App / Main / Theme | — |  |
| **Element** | | | |
| ● | Alert | `.spy-alert` | components |
| ● | Avatar | `.spy-avatar` | components |
| ● | AvatarGroup | `.spy-avatar-group` | components |
| ● | Badge | `.spy-badge` | components |
| ● | Banner | `.spy-banner` | components |
| ● | Button | `.spy-btn` | components |
| ● | Calendar | `.spy-calendar` | components |
| ● | Card | `.spy-card` | components |
| ● | Chip | `.spy-chip` | components |
| ◐ | Collapsible | `.spy-accordion-item` | components |
| ● | FieldGroup | `.spy-fieldgroup` | components |
| ● | Icon | `.spy-icon` | components |
| ● | Kbd | `.spy-kbd` | patterns |
| ● | Progress | `.spy-progress` | components |
| ● | ProgressGroup | `.spy-progress-steps` | components |
| ● | Separator | `.spy-divider` | components |
| ● | Skeleton | `.spy-skeleton` | components |
| **Form** | | | |
| ● | Checkbox | `.spy-checkbox` | components |
| ● | CheckboxGroup | `.spy-checkgroup` | components |
| ○ | ColorPicker | — |  |
| ● | FileUpload | `.spy-dropzone` | patterns |
| ○ | Form | — |  |
| ● | FormField | `.spy-field` | components |
| ● | Input | `.spy-field-control` | components |
| ● | InputDate | `.spy-calendar` | components |
| ● | InputMenu | `.spy-selectmenu` | components |
| ● | InputNumber | `.spy-number` | components |
| ○ | InputRating | — |  |
| ● | InputTags | `.spy-tagsfield` | components |
| ○ | InputTime | — |  |
| ● | Listbox | `.spy-selectmenu` | components |
| ○ | PinInput | — |  |
| ● | RadioGroup | `.spy-radio-group` | components |
| ● | Select | `.spy-select-trigger` | components |
| ● | SelectMenu | `.spy-selectmenu` | components |
| ● | Slider | `.spy-slider` | components |
| ● | Switch | `.spy-switch` | components |
| ● | Textarea | `.spy-field-control` | components |
| **Data** | | | |
| ● | Accordion | `.spy-accordion` | components |
| ● | Carousel | `.spy-carousel` | components |
| ● | Empty | `.spy-empty` | components |
| – | Marquee | — |  |
| ● | ScrollArea | `.spy-scroll` | components |
| ● | Table | `.spy-table` | components |
| ● | Timeline | `.spy-timeline` | components |
| ● | Tree | `.spy-tree` | components |
| ● | User | `.spy-candidate` | patterns |
| **Navigation** | | | |
| ● | Breadcrumb | `.spy-breadcrumb` | components |
| ● | CommandPalette | `.spy-cmdk` | components |
| ○ | Link | — |  |
| ● | NavigationMenu | `.spy-navmenu` | components |
| ● | Pagination | `.spy-pagination` | components |
| ● | Stepper | `.spy-stepper` | components |
| ● | Tabs | `.spy-tabs` | components |
| **Overlay** | | | |
| ● | ContextMenu | `.spy-menu` | components |
| ● | Drawer | `.spy-drawer` | components |
| ● | DropdownMenu | `.spy-menu` | components |
| ● | Modal | `.spy-modal` | components |
| ● | Popover | `.spy-popover` | components |
| ● | Slideover | `.spy-drawer` | components |
| ● | Toast | `.spy-toast` | components |
| ● | Tooltip | `.spy-tooltip` | components |
| **Page** | | | |
| ● | PageCTA | `.spy-cta` | landing |
| ● | PageFeature | `.spy-feature` | landing |
| ● | PageGrid | `.spy-grid` | landing |
| ● | PageHero | `.spy-hero` | landing |
| ● | PageLogos | `.spy-logos` | landing |
| ● | PageSection | `.spy-section` | landing |
| ● | PageHeader | `.spy-section-head` | patterns, landing |
| ● | PageCard | `.spy-card` | components |
| ● | PricingPlan | `.spy-plan` | landing |
| ● | PricingPlans | `.spy-grid` | landing |
| ○ | PricingTable | — |  |
| ○ | AuthForm | — |  |
| – | BlogPost / Changelog / PageAnchors / PageAside / PageLinks / PageList / PageColumns | — |  |
| **Dashboard** | | | |
| ◐ | DashboardPanel / Navbar / Sidebar / Toolbar / Search | `.spy-sidebar` | components |
| **Content** | | | |
| – | ContentNavigation / Search / Toc / Surround | — |  |
| **AI Chat** | | | |
| ● | ChatPrompt | `.spy-prompt` | components |
| ● | ChatTool | `.spy-toolcall` | components |
| ◐ | ChatMessage / Messages / Reasoning | `.spy-composer` | components |
| **Editor** | | | |
| – | Editor / Toolbar / menus | — |  |
| **Color mode** | | | |
| – | ColorModeButton / Switch / Select / Avatar / Image | — |  |
| **i18n** | | | |
| – | LocaleSelect | — |  |

## What this changes about the docs

Nuxt UI documents a component **one axis at a time** — Label, Variant, Size,
Icon, Loading, Disabled, each its own short section with one small example and
the markup beside it. spyy documented Button as one wall: a purpose table, then
a row of every variant, then a row of every size, then a states grid, then four
unrelated cases crammed into one row called "Icon-only, with icon, full width,
group".

The wall is why the question keeps being *which one do I use*. A reader looking
for "how do I put an icon in a button" should land on a section called Icon that
contains one button with one icon and the six lines that produce it — not scan a
grid of 140 and infer.

So the component page is being rebuilt case by case, and each case's code block
is **read back out of the rendered example**, not typed beside it. Code that is
typed drifts; code that is serialised from the DOM is by construction the thing
on screen.

## The audits

Twelve scripts run against the rendered pages rather than against the source.
Every one of them exists because a bug got past a careful reading, and reading
more carefully is not a fix.

| Script | What it asserts | What it caught |
|---|---|---|
| `check.mjs` | no page overflows at any theme or viewport | centred grids sizing to max-content; a fixed 72px hero on a 390px phone |
| `contrast.mjs` | text clears 4.5:1 at rest | the toast in light mode, the avatar count, the badge |
| `constant.mjs` | a fill that does not flip with the theme carries ink that does not either | the checked control's white tick on lime; every icon tile on a fixed hue |
| `statecontrast.mjs` | hover, focus and selected clear the same bar, and hover never *lowers* contrast | the tab's lime hover at 1.74:1 in light, and its focus at 1.26:1 |
| `interactive.mjs` | a control whose state is supposed to change, changes | a select and a sidebar row that were only live where someone remembered a `data-js` attribute |
| `scrolljump.mjs` | clicking a control does not move the page | three buttons inside a `<form>` with no `type`, which submitted it |
| `themecheck.mjs` · `flashcheck.mjs` | the theme switch works on every page, and no page flashes on navigation | a switch built in one file and wired in another |
| `spacing.mjs` | one control strip, one padding | five different paddings for the same row |
| `edge.mjs` | the boundary that identifies a control clears 3:1 | the outlined field's edge at 1.21:1 dark, 1.00:1 light |
| `fill.mjs` | a component that stacks its children was told a width | eleven panels collapsed to the longest string in them, the composer worst at 176px of a 918px column |
| `iconalign.mjs` | an icon beside a title and a description is aligned to the title | five rows that centred it, so it sat in the gutter between two lines the moment one wrapped |
| `clipcheck.mjs` | a leaf's content fits the box that holds it | the field affix — a 20px square built for a glyph, with the word `score` printed over the value beside it |

The pattern in all of them is the same: assert the thing a reader would check by
eye, against the DOM the browser actually produced. `constant.mjs` is the clearest
case — the rule behind it had been written down three times, in three commit
messages, and was broken a fourth time anyway.

`csslint.mjs` joined the audits after the calendar rendered as a single column
seven rows tall and nothing said why. The cause was a comment in `tokens.css`
that quoted `/* 36px */` inside itself: the inner terminator ended the comment
early, the remaining prose parsed as a declaration, and it ate the
`--hf-space-900` that followed. The linter now refuses a nested comment
terminator, and a `var()` with no fallback naming a property nothing declares —
which also turned up two transitions asking for a duration step that has never
existed, and therefore not animating at all.

`fill.mjs`, `iconalign.mjs` and `clipcheck.mjs` came out of one report, and the
three of them are the same observation from three angles: **CSS fails quietly.**
A panel with no width does not error, it shrinks. An icon centred against text
that has grown to two lines does not error, it drifts. A word in a box built for
a glyph does not error, it prints on top of its neighbour. None of the three is
visible while the content is short, which is exactly why each survived a reading
of the stylesheet and was caught by measuring the page instead.

Each also had to be told what *correct* looks like, and in each case the answer
was structural rather than a threshold:

- a component is a panel when it stacks its children, and a panel's width comes
  from its column — a button, a badge, a chip is content-sized and right to be;
- an icon belongs to the title when the text beside it is a stack whose first
  line is the larger type — `Last 30 days` over `Rolling, refreshed nightly`
  takes the rule, `Brand` over `Nordic Labs` is one value in two lines and does
  not, and an avatar identifies the whole block rather than labelling its first
  line;
- content is clipped when a leaf overflows a box that was not asked to scroll or
  to ellipsise — those two say so in CSS, and everything else is an accident.

Each rule is written into its script, so the next component is measured against
it rather than against whoever last looked at the page.
