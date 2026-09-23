/* Tabs, Nav, Sidebar, Pagination, Breadcrumb, Stepper — one axis per case. */
(function () {
'use strict';
const ic = (n, s) => `<svg class="spy-icon"${s ? ` data-size="${s}"` : ''}><use href="#i-${n}"/></svg>`;
const C = (window.SPY_CASES = window.SPY_CASES || []);
const tab = (t, a) => `<button class="spy-tabs-tab"${a || ''} role="tab"><span class="spy-tabs-tab-content">${t}</span></button>`;

C.push({
  id: 'tabs',
  name: 'Tabs',
  base: '.spy-tabs · .spy-tabs-list · .spy-tabs-tab',
  lede: 'One component, two variants, and they are not interchangeable. The <strong>line</strong> variant moves between views of the same thing; the <strong>segment</strong> variant switches a mode in place.',
  purpose: [
    ['line',    'Views of one thing — the rule under the tab ties it to the content below.', 'Switching a setting.'],
    ['segment', 'A mode, changed in place — grid or list, day or week.',                      'Page-level navigation.'],
  ],
  notes: [
    'The segment indicator’s radius is one step tighter than its trough — 8px inside 10px. That is the detail that stops a segmented control looking like a button sitting in a box.',
    'A resting tab is dim, and hover goes to <strong>brand</strong> rather than to white, so the active tab stays the brightest thing in the row.',
  ],
  cases: [
    { id: 'line', name: 'Line',
      when: 'The default for navigating content. One tab is active; a tab can be disabled when the view has nothing in it yet.',
      demo: `<div class="spy-tabs" data-variant="line"><div class="spy-tabs-list" role="tablist">` +
        tab('Creatives', ' data-active') + tab('Placements') + tab('Spend') + tab('History', ' data-disabled') +
        `</div></div>` },
    { id: 'segment', name: 'Segment',
      when: 'A mode switch. Two to four options, all visible, all short.',
      demo: `<div class="spy-tabs" data-variant="segment"><div class="spy-tabs-list" role="tablist">` +
        tab(`${ic('grid', 'sm')}Grid`, ' data-active') + tab(`${ic('list', 'sm')}List`) + tab('Table') +
        `</div></div>` },
    { id: 'fill', name: 'Fill',
      when: '<code>data-fill</code> makes every tab share the width equally. Use it when the group owns a column — a panel header, a mobile bar — not in a toolbar.',
      demo: `<div class="spy-tabs" data-variant="segment"><div class="spy-tabs-list" data-fill role="tablist">` +
        tab('All networks', ' data-active') + tab('Meta') + tab('TikTok') +
        `</div></div>` },
  ],
  api: {
    props: [
      ['data-variant', 'line · segment', 'line'],
      ['data-fill', 'present — on the list', '—'],
      ['data-active', 'present — on one tab', '—'],
      ['data-disabled', 'present — on a tab', '—'],
    ],
    parts: [['.spy-tabs-tab-content', 'Holds the icon and the label so the indicator can size to the text.']],
  },
});

C.push({
  id: 'nav',
  name: 'Navigation',
  base: '.spy-nav-item · .spy-sidebar-row · .spy-pagination-item · .spy-stepper',
  lede: 'Three navigation rows for three scopes. The hierarchy is carried by <em>colour</em>, not by weight or a pill: dim at rest, white when active, and brand plus a glow for the one promoted item.',
  purpose: [
    ['Nav item',        'Top-bar navigation. A nav item goes somewhere.',              'An action.'],
    ['Sidebar row',     'Navigating a list of things in a persistent rail.',           'A list of records — that is List item.'],
    ['Pagination item', 'Moving through pages of one result set.',                     'Moving between different views.'],
  ],
  cases: [
    { id: 'nav-item', name: 'Nav item',
      when: '28px tall and deliberately dim. One item may be promoted with <code>data-accent</code> — one, not three.',
      demo:
        `<ul class="spy-nav-list">` +
        `<li><a class="spy-nav-item" data-active href="#nav">Scans</a></li>` +
        `<li><a class="spy-nav-item" href="#nav">Competitors</a></li>` +
        `<li><a class="spy-nav-item" href="#nav">Creatives</a></li>` +
        `<li><a class="spy-nav-item" data-accent href="#nav">Alerts</a></li>` +
        `<li><a class="spy-nav-item" data-disabled href="#nav">Team</a></li>` +
        `</ul>` },
    { id: 'nav-action', name: 'Nav action',
      when: 'The icon buttons at the end of the bar. The dot is a child of the button, not a separate element beside it.',
      demo:
        `<div class="spy-nav-actions-group">` +
        `<button class="spy-nav-action" data-icon-only aria-label="Alerts">${ic('bell')}<span class="spy-nav-dot"></span></button>` +
        `<button class="spy-nav-action" data-icon-only aria-label="Settings">${ic('settings')}</button>` +
        `</div>` },
    { id: 'sidebar-row', name: 'Sidebar row',
      when: 'A thumbnail, a truncating label, and an optional pin. The label truncates — the row never wraps to two lines.',
      stack: true,
      demo:
        `<a class="spy-sidebar-row" data-active href="#nav">` +
        `<span class="spy-sidebar-thumb">${ic('search', 'sm')}</span>` +
        `<span class="spy-sidebar-truncate">Running shoes — Q3</span>` +
        `</a>` +
        `<a class="spy-sidebar-row" href="#nav">` +
        `<span class="spy-sidebar-thumb">${ic('layers', 'sm')}</span>` +
        `<span class="spy-sidebar-truncate">Every competitor, last 90 days</span>` +
        `<button class="spy-sidebar-pin" aria-label="Pin">${ic('pin', 'sm')}</button>` +
        `</a>` },
    { id: 'pagination', name: 'Pagination',
      when: 'Pages of one result set. The ellipsis is its own element, not a disabled item.',
      demo:
        `<nav class="spy-pagination" aria-label="Pages">` +
        `<button class="spy-pagination-item" data-icon-only aria-label="Previous">${ic('chevron-left', 'sm')}</button>` +
        `<button class="spy-pagination-item" data-active aria-current="page">1</button>` +
        `<button class="spy-pagination-item">2</button>` +
        `<button class="spy-pagination-item">3</button>` +
        `<span class="spy-pagination-ellipsis">…</span>` +
        `<button class="spy-pagination-item">24</button>` +
        `<button class="spy-pagination-item" data-icon-only aria-label="Next">${ic('chevron-right', 'sm')}</button>` +
        `</nav>` },
    { id: 'stepper', name: 'Stepper',
      when: 'A sequence with a position. Done, current and to-do are the only three states; there is no error step — a step that failed is still the current one.',
      demo:
        `<ol class="spy-stepper">` +
        `<li class="spy-step" data-state="done"><span class="spy-step-dot"></span>` +
        `<span class="spy-step-text"><span class="spy-step-title">Connect a network</span></span></li>` +
        `<li class="spy-step" data-state="active"><span class="spy-step-dot"></span>` +
        `<span class="spy-step-text"><span class="spy-step-title">Pick competitors</span>` +
        `<span class="spy-step-description">Up to ten on your plan</span></span></li>` +
        `<li class="spy-step" data-state="todo"><span class="spy-step-dot"></span>` +
        `<span class="spy-step-text"><span class="spy-step-title">Run the first scan</span></span></li>` +
        `</ol>` },
  ],
  api: {
    props: [
      ['data-active', 'present', '—'],
      ['data-accent', 'present — one promoted nav item', '—'],
      ['data-disabled', 'present', '—'],
      ['data-state', 'done · active · todo — on a step', 'todo'],
    ],
    parts: [
      ['.spy-nav-dot', 'The unread mark. A child of the action it belongs to.'],
      ['.spy-sidebar-thumb', 'A 20px square — an icon, or a real thumbnail.'],
      ['.spy-sidebar-truncate', 'The label. Truncates rather than wrapping.'],
      ['.spy-pagination-ellipsis', 'The gap. Not a button, not disabled — not focusable at all.'],
    ],
  },
});
})();
