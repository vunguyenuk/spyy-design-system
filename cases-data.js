/* Breadcrumb, Navigation menu, Data table, Timeline, Content search,
   Chat prompt, Chat tool — one axis per case. */
(function () {
'use strict';
const ic = (n, s) => `<svg class="spy-icon"${s ? ` data-size="${s}"` : ''}><use href="#i-${n}"/></svg>`;
const C = (window.SPY_CASES = window.SPY_CASES || []);
const sep = () => `<span class="spy-breadcrumb-sep">${ic('chevron-right')}</span>`;

/* -- Breadcrumb ------------------------------------------------------------ */
C.push({
  id: 'breadcrumb',
  name: 'Breadcrumb',
  base: '.spy-breadcrumb',
  lede: 'Where you are in a hierarchy, and a way back up it. The last item is the page you are on, so it is not a link — a link to where you already are is a link that does nothing.',
  notes: [
    'It answers <em>where am I</em>, not <em>where have I been</em>. A breadcrumb that records the route someone took is a history, and browsers already have one.',
  ],
  cases: [
    { id: 'default', name: 'Default',
      when: 'Two or three levels, the last one current.',
      demo:
        `<nav class="spy-breadcrumb" aria-label="Breadcrumb">` +
        `<a class="spy-breadcrumb-item" href="#breadcrumb">Scans</a>${sep()}` +
        `<a class="spy-breadcrumb-item" href="#breadcrumb">Running shoes — Q3</a>${sep()}` +
        `<span class="spy-breadcrumb-item" aria-current="page">Creative 4182</span>` +
        `</nav>` },
    { id: 'icon', name: 'With an icon',
      when: 'An icon on the root, where the root is a place rather than a name.',
      demo:
        `<nav class="spy-breadcrumb" aria-label="Breadcrumb">` +
        `<a class="spy-breadcrumb-item" href="#breadcrumb">${ic('grid')}All scans</a>${sep()}` +
        `<span class="spy-breadcrumb-item" aria-current="page">Running shoes — Q3</span>` +
        `</nav>` },
    { id: 'collapsed', name: 'Collapsed',
      when: 'Past about four levels the middle stops being useful and starts being wide. Collapse it into a button, never into plain text — the one thing a reader wants from an ellipsis is what it is hiding.',
      demo:
        `<nav class="spy-breadcrumb" aria-label="Breadcrumb">` +
        `<a class="spy-breadcrumb-item" href="#breadcrumb">Scans</a>${sep()}` +
        `<button class="spy-breadcrumb-more" aria-label="Show three more levels">…</button>${sep()}` +
        `<a class="spy-breadcrumb-item" href="#breadcrumb">Placements</a>${sep()}` +
        `<span class="spy-breadcrumb-item" aria-current="page">Creative 4182</span>` +
        `</nav>` },
  ],
  api: {
    parts: [
      ['.spy-breadcrumb-item', 'A link, or a <code>&lt;span&gt;</code> with <code>aria-current="page"</code> for the last one.'],
      ['.spy-breadcrumb-sep', 'The chevron. Decorative — it carries no meaning a screen reader needs.'],
      ['.spy-breadcrumb-more', 'The collapsed middle. A button, and it opens the levels it hides.'],
    ],
  },
});

/* -- Navigation menu ------------------------------------------------------- */
const nmItem = (icon, label, opts) =>
  `<a class="spy-navmenu-item"${opts || ''} href="#navmenu">${ic(icon)}` +
  `<span class="spy-navmenu-item-label">${label}</span></a>`;

C.push({
  id: 'navmenu',
  name: 'Navigation menu',
  base: '.spy-navmenu',
  lede: 'A list of places, in a rail or in a bar. One component for both, because an item is an item either way — only the axis and the shape of the active mark change.',
  purpose: [
    ['vertical',   'The product rail. Room for groups, nesting and a trailing count.', 'Three items — a rail with three rows is a waste of a column.'],
    ['horizontal', 'A section bar under a page header.',                                'Deep hierarchies; a bar cannot nest.'],
  ],
  notes: [
    'The vertical active mark is a filled pill; the horizontal one is a rule that meets the bar\'s own bottom edge. Same idea as the line tab, and the same reason — the mark ties the item to what is under it.',
    'A nested list steps in by exactly one icon plus its gap, so children line up under their parent\'s <em>label</em> and not under its icon.',
  ],
  cases: [
    { id: 'vertical', name: 'Vertical',
      when: 'The default. One item active, one disabled where the plan does not reach.',
      demo:
        `<nav class="spy-navmenu">` +
        nmItem('grid', 'Scans', ' data-active') +
        nmItem('layers', 'Competitors') +
        nmItem('image', 'Creatives') +
        nmItem('lock', 'Team', ' data-disabled') +
        `</nav>` },
    { id: 'groups', name: 'Groups and counts',
      when: 'A label above a run of items, and a count after one. The count is the trailing slot, so it stays right whatever the label length.',
      demo:
        `<nav class="spy-navmenu">` +
        `<span class="spy-navmenu-label">Workspace</span>` +
        nmItem('grid', 'Scans', ' data-active') +
        `<a class="spy-navmenu-item" href="#navmenu">${ic('bell')}` +
        `<span class="spy-navmenu-item-label">Alerts</span>` +
        `<span class="spy-navmenu-item-trailing"><span class="spy-count">12</span></span></a>` +
        `<span class="spy-navmenu-label">Library</span>` +
        nmItem('folder', 'Saved sets') +
        `</nav>` },
    { id: 'nested', name: 'Nested',
      when: 'One level of children under an open parent. Two levels of nesting in a rail means the rail is doing the job of a page.',
      demo:
        `<nav class="spy-navmenu">` +
        `<a class="spy-navmenu-item" data-active href="#navmenu">${ic('layers')}` +
        `<span class="spy-navmenu-item-label">Competitors</span>` +
        `<span class="spy-navmenu-item-trailing">${ic('chevron-down', 'sm')}</span></a>` +
        `<div class="spy-navmenu-children">` +
        nmItem('image', 'Northwind') +
        nmItem('image', 'Lumen') +
        `</div>` +
        `</nav>` },
    { id: 'horizontal', name: 'Horizontal',
      when: 'A section bar. Three to five items, all short.',
      demo:
        `<nav class="spy-navmenu" data-orientation="horizontal">` +
        `<a class="spy-navmenu-item" data-active href="#navmenu"><span class="spy-navmenu-item-label">Overview</span></a>` +
        `<a class="spy-navmenu-item" href="#navmenu"><span class="spy-navmenu-item-label">Creatives</span></a>` +
        `<a class="spy-navmenu-item" href="#navmenu"><span class="spy-navmenu-item-label">Placements</span></a>` +
        `<a class="spy-navmenu-item" href="#navmenu"><span class="spy-navmenu-item-label">Spend</span></a>` +
        `</nav>` },
  ],
  api: {
    props: [
      ['data-orientation', 'horizontal', '— (vertical)'],
      ['data-active', 'present', '—'],
      ['data-disabled', 'present', '—'],
    ],
    parts: [
      ['.spy-navmenu-label', 'A group heading. Not selectable.'],
      ['.spy-navmenu-item-label', 'The text. Truncates rather than wrapping.'],
      ['.spy-navmenu-item-trailing', 'The right slot — a count, a chevron, a badge.'],
      ['.spy-navmenu-children', 'One nested level, indented to the parent\'s label.'],
    ],
  },
});

/* -- Data table ------------------------------------------------------------ */
const ROWS = [
  ['Northwind',  'success', 'Live',     412, 81, true],
  ['Lumen',      'info',    'Scanning',  98, '—', false],
  ['Parcel',     'warning', 'Queued',     0, '—', false],
  ['Bevel',      'error',   'Failed',     0, '—', false],
];
const dataRow = ([name, st, label, n, score, sel]) =>
  `<tr${sel ? ' data-selected' : ''}>` +
  `<td data-select><span class="spy-checkbox"${sel ? ' data-checked' : ''}>` +
  `<span class="spy-control-box"><span class="spy-control-indicator">${ic('check')}</span></span></span></td>` +
  `<td>${name}</td>` +
  `<td><span class="spy-chip" data-size="xxs" data-variant="${st}" data-selected>${label}</span></td>` +
  `<td data-align="end" data-numeric>${n}</td>` +
  `<td data-align="end" data-numeric>${score}</td></tr>`;

C.push({
  id: 'datatable',
  name: 'Data table',
  base: '.spy-table',
  lede: 'Rows you compare field by field. The base table is rows and dividers; this is what it needs once someone works in it — a header you sort by, a column you select in, a head that stays put, and a bar underneath for the count and the pager.',
  notes: [
    'Numbers go right and take <code>data-numeric</code>, which turns on tabular figures so a column of digits lines up. A number that does not line up with the one above it cannot be compared with it, which is the only reason it is in a table.',
    'Status is a chip, not coloured text: colour alone is not a signal, and a chip carries the word as well as the hue.',
  ],
  cases: [
    { id: 'default', name: 'Default',
      when: 'Header, rows, hairlines. This is the table with nothing turned on.',
      demo:
        `<div class="spy-table-wrap"><table class="spy-table">` +
        `<thead><tr><th>Competitor</th><th>Status</th><th data-align="end">Creatives</th></tr></thead>` +
        `<tbody>` + ROWS.slice(0, 3).map(([n, st, l, c]) =>
          `<tr><td>${n}</td><td><span class="spy-chip" data-size="xxs" data-variant="${st}" data-selected>${l}</span></td>` +
          `<td data-align="end" data-numeric>${c}</td></tr>`).join('') +
        `</tbody></table></div>` },

    { id: 'sortable', name: 'Sortable',
      when: '<code>data-sortable</code> on the table, <code>data-sort</code> on the columns that can be sorted. The arrow is invisible at rest, half-visible on hover, and solid on the column actually sorting — so the header does not look like a row of arrows.',
      demo:
        `<div class="spy-table-wrap"><table class="spy-table" data-sortable>` +
        `<thead><tr>` +
        `<th data-sort=""><span>Competitor${ic('chevron-up')}</span></th>` +
        `<th>Status</th>` +
        `<th data-align="end" data-sort="desc"><span>Creatives${ic('chevron-up')}</span></th>` +
        `</tr></thead>` +
        `<tbody>` + ROWS.slice(0, 3).map(([n, st, l, c]) =>
          `<tr><td>${n}</td><td><span class="spy-chip" data-size="xxs" data-variant="${st}" data-selected>${l}</span></td>` +
          `<td data-align="end" data-numeric>${c}</td></tr>`).join('') +
        `</tbody></table></div>` },

    { id: 'selection', name: 'Selection',
      when: 'A checkbox column, and the selected row tinted. The header checkbox is indeterminate when some but not all rows are selected — that is what indeterminate is for.',
      demo:
        `<div class="spy-table-wrap"><table class="spy-table" data-sticky>` +
        `<thead><tr>` +
        `<th data-select><span class="spy-checkbox" data-indeterminate><span class="spy-control-box">` +
        `<span class="spy-control-indicator">${ic('minus')}</span></span></span></th>` +
        `<th>Competitor</th><th>Status</th>` +
        `<th data-align="end">Creatives</th><th data-align="end">Score</th>` +
        `</tr></thead>` +
        `<tbody>` + ROWS.map(dataRow).join('') + `</tbody></table>` +
        `<div class="spy-table-bar"><span>1 of 4 selected</span>` +
        `<nav class="spy-pagination" aria-label="Pages">` +
        `<button class="spy-pagination-item" data-icon-only aria-label="Previous">${ic('chevron-left', 'sm')}</button>` +
        `<button class="spy-pagination-item" data-active aria-current="page">1</button>` +
        `<button class="spy-pagination-item">2</button>` +
        `<button class="spy-pagination-item" data-icon-only aria-label="Next">${ic('chevron-right', 'sm')}</button>` +
        `</nav></div></div>` },

    { id: 'compact', name: 'Compact',
      when: 'The same table with the rows closed up. It does not shrink the type — a smaller row with smaller text is two changes, and only one of them was asked for.',
      demo:
        `<div class="spy-table-wrap"><table class="spy-table" data-density="compact">` +
        `<thead><tr><th>Competitor</th><th data-align="end">Creatives</th><th data-align="end">Score</th></tr></thead>` +
        `<tbody>` + ROWS.map(([n, , , c, s]) =>
          `<tr><td>${n}</td><td data-align="end" data-numeric>${c}</td>` +
          `<td data-align="end" data-numeric>${s}</td></tr>`).join('') +
        `</tbody></table></div>` },

    { id: 'empty', name: 'Empty',
      when: 'Keep the header. A table that loses its columns when it has no rows makes the reader wonder whether they are looking at the right table.',
      demo:
        `<div class="spy-table-wrap"><table class="spy-table">` +
        `<thead><tr><th>Competitor</th><th>Status</th><th data-align="end">Creatives</th></tr></thead>` +
        `<tbody><tr><td colspan="3" class="spy-table-empty">No competitor matches that filter.</td></tr></tbody>` +
        `</table></div>` },
  ],
  api: {
    props: [
      ['data-sortable', 'present — on the table', '—'],
      ['data-sort', '"" · asc · desc — on a <code>&lt;th&gt;</code>', '—'],
      ['data-sticky', 'present — on the table', '—'],
      ['data-density', 'compact', '—'],
      ['data-select', 'present — on the checkbox cell', '—'],
      ['data-align', 'end — on a cell', '— (start)'],
      ['data-numeric', 'present — tabular figures', '—'],
      ['data-selected', 'present — on a row', '—'],
    ],
    parts: [
      ['.spy-table-wrap', 'The panel around it. Owns the radius and clips the sticky head.'],
      ['.spy-table-bar', 'The strip under the rows — the count on the left, the pager on the right.'],
      ['.spy-table-empty', 'A full-width cell for the no-rows message.'],
    ],
  },
});

/* -- Timeline -------------------------------------------------------------- */
C.push({
  id: 'timeline',
  name: 'Timeline',
  base: '.spy-timeline',
  lede: 'What happened, in order. Not a stepper — a stepper is a sequence you are moving through and can still change; a timeline is a record of things that already happened.',
  notes: [
    'The rail is drawn by the items, not by a background on the container, so a timeline can end anywhere without a line running past its last entry.',
    'Times are tabular, because a column of times that does not line up is a column you cannot scan.',
  ],
  cases: [
    { id: 'default', name: 'Default',
      when: 'Marker, title, time, and an optional line of detail.',
      demo:
        `<ol class="spy-timeline">` +
        [['done', 'check', 'Scan started', '02:14', 'Three networks, 90-day window.'],
         ['done', 'check', 'Creatives pulled', '02:31', '412 found, 38 new since the last run.'],
         ['active', 'refresh', 'Scoring', '02:33', 'About four minutes left.'],
         ['', '', 'Report ready', '—', '']]
          .map(([state, icon, title, time, desc]) =>
            `<li class="spy-timeline-item"${state ? ` data-state="${state}"` : ''}>` +
            `<span class="spy-timeline-marker">${icon ? ic(icon) : ''}</span>` +
            `<div class="spy-timeline-body">` +
            `<h4 class="spy-timeline-title">${title}</h4>` +
            `<span class="spy-timeline-time">${time}</span>` +
            (desc ? `<p class="spy-timeline-description">${desc}</p>` : '') +
            `</div></li>`).join('') +
        `</ol>` },
    { id: 'error', name: 'Failed entry',
      when: 'A step that failed keeps its place in the order — it happened. <code>data-status="error"</code> colours the marker without changing the rail.',
      demo:
        `<ol class="spy-timeline">` +
        `<li class="spy-timeline-item" data-state="done"><span class="spy-timeline-marker">${ic('check')}</span>` +
        `<div class="spy-timeline-body"><h4 class="spy-timeline-title">Meta connected</h4>` +
        `<span class="spy-timeline-time">Yesterday, 18:02</span></div></li>` +
        `<li class="spy-timeline-item" data-status="error"><span class="spy-timeline-marker">${ic('error')}</span>` +
        `<div class="spy-timeline-body"><h4 class="spy-timeline-title">TikTok refused the connection</h4>` +
        `<span class="spy-timeline-time">Yesterday, 18:04</span>` +
        `<p class="spy-timeline-description">The token had expired. Nothing was scanned.</p></div></li>` +
        `</ol>` },
  ],
  api: {
    props: [
      ['data-state', 'done · active — on an item', '— (to come)'],
      ['data-status', 'error — on an item', '—'],
    ],
    parts: [
      ['.spy-timeline-marker', 'The dot. Takes an icon when the entry has one.'],
      ['.spy-timeline-time', 'Tabular figures, so a column of times scans.'],
    ],
  },
});

/* -- Content search -------------------------------------------------------- */
C.push({
  id: 'cmdk',
  name: 'Content search',
  base: '.spy-cmdk',
  lede: 'The palette. It is a modal holding a field and a menu, so it brings no new fill, radius or row height — only the arrangement, and a footer that says which keys work.',
  notes: [
    'Results are menu items, which is why a result row is the same 36px as a sidebar row. A palette that invents its own row height makes the product feel like two products.',
    'The footer is not decoration: a palette is a keyboard surface, and the keys have to be written down somewhere.',
  ],
  cases: [
    { id: 'default', name: 'Default',
      when: 'Query, grouped results, one highlighted. The highlight follows the arrow keys, so it is <code>data-selected</code> rather than hover.',
      demo:
        `<div class="spy-modal" data-size="md"><div class="spy-cmdk">` +
        `<div class="spy-cmdk-field">${ic('search')}` +
        `<input class="spy-cmdk-input" value="north" placeholder="Search scans, competitors, creatives">` +
        `<span class="spy-tag">esc</span></div>` +
        `<div class="spy-cmdk-results">` +
        `<span class="spy-menu-group-label">Competitors</span>` +
        `<button class="spy-menu-item" data-selected>` +
        `<span class="spy-menu-item-media">${ic('layers', 'md')}</span>` +
        `<span class="spy-menu-item-label"><span>Northwind</span>` +
        `<span class="spy-menu-item-description">412 creatives, 3 networks</span></span>` +
        `<span class="spy-menu-meta">↵</span></button>` +
        `<span class="spy-menu-group-label">Scans</span>` +
        `<button class="spy-menu-item">` +
        `<span class="spy-menu-item-media">${ic('search', 'md')}</span>` +
        `<span class="spy-menu-item-label">Northwind — Q3</span></button>` +
        `</div>` +
        `<div class="spy-cmdk-foot">` +
        `<span class="spy-cmdk-hint"><span class="spy-tag">↑↓</span>navigate</span>` +
        `<span class="spy-cmdk-hint"><span class="spy-tag">↵</span>open</span>` +
        `<span class="spy-cmdk-hint"><span class="spy-tag">⌘K</span>close</span>` +
        `</div></div></div>` },
    { id: 'empty', name: 'No match',
      when: 'Say what was searched for, and offer the thing a reader would do next. An empty palette that only says "no results" is a dead end.',
      demo:
        `<div class="spy-modal" data-size="md"><div class="spy-cmdk">` +
        `<div class="spy-cmdk-field">${ic('search')}` +
        `<input class="spy-cmdk-input" value="zzz" placeholder="Search"></div>` +
        `<div class="spy-cmdk-results">` +
        `<div class="spy-empty">${ic('search')}` +
        `<h4 class="spy-empty-title">Nothing matches “zzz”</h4>` +
        `<p class="spy-empty-description">Try a domain, or the name you gave a scan.</p></div>` +
        `</div></div></div>` },
  ],
  api: {
    parts: [
      ['.spy-cmdk-field', 'The query row. The leading icon and the escape hint sit in it, not around it.'],
      ['.spy-cmdk-results', 'The scrolling region. Holds menu items and group labels.'],
      ['.spy-cmdk-foot', 'The key legend.'],
    ],
  },
});

/* -- Chat prompt ----------------------------------------------------------- */
C.push({
  id: 'prompt',
  name: 'Chat prompt',
  base: '.spy-prompt',
  lede: 'Where someone types at the product. Three regions — attachments, the input, the controls — so a prompt with no attachments has no empty band above its text.',
  notes: [
    'The whole box takes the focus ring, not the textarea inside it, so the thing that lights up is the thing you are typing in.',
    'Submit is the only filled button in the row. Everything else beside it is ghost, because a prompt with three loud buttons has no primary action.',
  ],
  cases: [
    { id: 'default', name: 'Default',
      when: 'Input and controls. The send button is icon-only and disabled until there is something to send.',
      demo:
        `<form class="spy-prompt">` +
        `<textarea class="spy-prompt-input" rows="2" placeholder="Ask about a competitor, a creative, or a scan"></textarea>` +
        `<div class="spy-prompt-foot">` +
        `<button class="spy-btn" data-variant="ghost" data-size="sm" data-icon-only aria-label="Attach">${ic('plus')}</button>` +
        `<button class="spy-btn" data-variant="ghost" data-size="sm">${ic('layers')}All networks</button>` +
        `<span class="spy-prompt-foot-end">` +
        `<button class="spy-btn" data-variant="brand" data-size="sm" data-icon-only aria-label="Send" disabled>${ic('arrow-up')}</button>` +
        `</span></div></form>` },
    { id: 'attachments', name: 'With attachments',
      when: 'The header region appears only when there is something in it.',
      demo:
        `<form class="spy-prompt">` +
        `<div class="spy-prompt-head">` +
        `<span class="spy-composer-attachment">${ic('image')}` +
        `<button class="spy-composer-attachment-remove" aria-label="Remove">${ic('close', 'xs')}</button></span>` +
        `<span class="spy-composer-attachment">${ic('video')}` +
        `<button class="spy-composer-attachment-remove" aria-label="Remove">${ic('close', 'xs')}</button></span>` +
        `</div>` +
        `<textarea class="spy-prompt-input" rows="2">What are these two doing differently?</textarea>` +
        `<div class="spy-prompt-foot">` +
        `<button class="spy-btn" data-variant="ghost" data-size="sm" data-icon-only aria-label="Attach">${ic('plus')}</button>` +
        `<span class="spy-prompt-foot-end">` +
        `<button class="spy-btn" data-variant="brand" data-size="sm" data-icon-only aria-label="Send">${ic('arrow-up')}</button>` +
        `</span></div></form>` },
    { id: 'sending', name: 'Sending',
      when: 'The send button becomes a stop button. It does not become a spinner: while something is generating, the one thing a person wants is the ability to stop it.',
      demo:
        `<form class="spy-prompt">` +
        `<textarea class="spy-prompt-input" rows="2">Which angle is Northwind testing hardest?</textarea>` +
        `<div class="spy-prompt-foot">` +
        `<button class="spy-btn" data-variant="ghost" data-size="sm" data-icon-only aria-label="Attach">${ic('plus')}</button>` +
        `<span class="spy-prompt-foot-end">` +
        `<button class="spy-btn" data-variant="secondary" data-size="sm" data-icon-only aria-label="Stop">${ic('pause')}</button>` +
        `</span></div></form>` },
  ],
  api: {
    parts: [
      ['.spy-prompt-head', 'Attachments. Omit it when there are none.'],
      ['.spy-prompt-input', 'The textarea. Contributes no chrome of its own.'],
      ['.spy-prompt-foot', 'The control row. <code>.spy-prompt-foot-end</code> pushes the rest right.'],
    ],
  },
});

/* -- Chat tool ------------------------------------------------------------- */
C.push({
  id: 'toolcall',
  name: 'Chat tool',
  base: '.spy-toolcall',
  lede: 'What the agent is doing, and what it got back. The trigger is one row; the output is a disclosure under it; an approval turns the row into a question.',
  purpose: [
    ['inline', 'Inside a message, among the text. The default.',        'A tool whose output someone will read carefully.'],
    ['card',   'A tool call that stands on its own — long output, or one that needs approval.', 'A run of six quick calls; six cards is a wall.'],
  ],
  notes: [
    'Streaming is a sweep across the label, not a spinner beside it. The row already says what is happening; a spinner would say it twice.',
    'A denied call stays on screen with its label struck through. Removing it would leave the reader wondering whether they denied anything.',
  ],
  cases: [
    { id: 'inline', name: 'Inline',
      when: 'Done, collapsed. The suffix is the one number worth seeing without opening it.',
      demo:
        `<div class="spy-toolcall">` +
        `<button class="spy-toolcall-trigger">${ic('search')}` +
        `<span class="spy-toolcall-label">Searched Northwind’s creatives</span>` +
        `<span class="spy-toolcall-suffix">412</span>` +
        `<span class="spy-toolcall-chevron">${ic('chevron-right', 'sm')}</span></button>` +
        `</div>` },
    { id: 'open', name: 'Open',
      when: 'The output is monospace, because it is a machine\'s answer and it is usually a list or a record.',
      demo:
        `<div class="spy-toolcall" data-open>` +
        `<button class="spy-toolcall-trigger">${ic('search')}` +
        `<span class="spy-toolcall-label">Searched Northwind’s creatives</span>` +
        `<span class="spy-toolcall-suffix">412</span>` +
        `<span class="spy-toolcall-chevron">${ic('chevron-right', 'sm')}</span></button>` +
        `<div class="spy-toolcall-output">network: meta\nwindow: 90d\nmatched: 412\nnew since last run: 38</div>` +
        `</div>` },
    { id: 'streaming', name: 'Streaming',
      when: 'Running now. The label sweeps; nothing else moves.',
      demo:
        `<div class="spy-toolcall" data-streaming>` +
        `<button class="spy-toolcall-trigger">${ic('refresh')}` +
        `<span class="spy-toolcall-label">Scoring 412 creatives</span>` +
        `<span class="spy-toolcall-chevron">${ic('chevron-right', 'sm')}</span></button>` +
        `</div>` },
    { id: 'approval', name: 'Approval',
      when: 'The agent wants to do something that leaves a mark. Card variant, because a question that can be scrolled past is a question that will be.',
      demo:
        `<div class="spy-toolcall" data-variant="card" data-state="approval">` +
        `<button class="spy-toolcall-trigger">${ic('upload')}` +
        `<span class="spy-toolcall-label">Export 412 creatives to your Drive</span>` +
        `<span class="spy-toolcall-chevron">${ic('chevron-right', 'sm')}</span></button>` +
        `<div class="spy-toolcall-actions">` +
        `<button class="spy-btn" data-variant="brand" data-size="sm">Allow</button>` +
        `<button class="spy-btn" data-variant="ghost" data-size="sm">Deny</button>` +
        `</div></div>` },
    { id: 'denied', name: 'Denied',
      when: 'It stays. Removing it would leave the reader wondering whether they denied anything.',
      demo:
        `<div class="spy-toolcall" data-state="denied">` +
        `<button class="spy-toolcall-trigger">${ic('close')}` +
        `<span class="spy-toolcall-label">Export 412 creatives to your Drive</span></button>` +
        `</div>` },
  ],
  api: {
    props: [
      ['data-variant', 'card', '— (inline)'],
      ['data-open', 'present', '—'],
      ['data-streaming', 'present', '—'],
      ['data-state', 'approval · denied', '—'],
    ],
    parts: [
      ['.spy-toolcall-suffix', 'The one number worth seeing collapsed.'],
      ['.spy-toolcall-output', 'The disclosure. Monospace, and it scrolls rather than wraps mid-token.'],
      ['.spy-toolcall-actions', 'Allow and deny, for an approval.'],
    ],
  },
});
})();
