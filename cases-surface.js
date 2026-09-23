/* Card, Glass, List, Table, Accordion — one axis per case. */
(function () {
'use strict';
const ic = (n, s) => `<svg class="spy-icon"${s ? ` data-size="${s}"` : ''}><use href="#i-${n}"/></svg>`;
const C = (window.SPY_CASES = window.SPY_CASES || []);

C.push({
  id: 'card',
  name: 'Card',
  base: '.spy-card · .spy-glass',
  lede: 'A container for one thing. Three variants that differ only in how much they separate themselves from the page, plus glass, which is the one that sits over media.',
  purpose: [
    ['default',  'The normal card. A filled surface one step up from the page.', 'A grid of twenty — the fills stack into noise.'],
    ['outline',  'A grid of many. A hairline separates without adding weight.',  'A single card that needs to be noticed.'],
    ['raised',   'The one card on a page that is being offered — a plan, a recommendation.', 'More than one per view.'],
    ['glass',    'Over media, and only over media. The rim is what reads as thickness, not the blur.', 'A flat page background — there is nothing to see through.'],
  ],
  cases: [
    { id: 'variant', name: 'Variant',
      when: 'The three page variants side by side. Body and footer are separate regions with the same padding, so a card with no footer has no dead space.',
      demo: ['default', 'outline', 'raised'].map(v =>
        `<div class="spy-card"${v === 'default' ? '' : ` data-variant="${v}"`} style="max-width:260px">` +
        `<div class="spy-card-body">` +
        `<h4 class="spy-card-title">Northwind</h4>` +
        `<p class="spy-card-description">412 creatives, 3 networks. Last seen two hours ago.</p>` +
        `</div>` +
        `<div class="spy-card-footer"><span class="spy-tag">${v}</span>` +
        `<button class="spy-btn" data-variant="ghost" data-size="xs">Open</button></div>` +
        `</div>`).join('') },
    { id: 'glass', name: 'Glass',
      when: '75%-opaque fill, 40px blur, 1.6 saturate, and a two-sided inset rim — light on the top-left, dark on the bottom-right. The rim is the part that reads as thickness.',
      surface: 'landing',
      demo:
        `<div class="spy-glass" style="max-width:280px"><div class="spy-card-body">` +
        `<h4 class="spy-card-title">Creative 4182</h4>` +
        `<p class="spy-card-description">Ran 14 days. Scored 81.</p>` +
        `</div></div>` },
  ],
  api: {
    props: [['data-variant', 'outline · raised', '— (filled)']],
    parts: [
      ['.spy-card-body', 'The content region.'],
      ['.spy-card-footer', 'The action region. Omit it rather than leaving it empty.'],
      ['.spy-card-title / -description', 'Type roles, so a card reads the same wherever it is used.'],
    ],
  },
});

C.push({
  id: 'list',
  name: 'List & Table',
  base: '.spy-list · .spy-table',
  lede: 'Rows of records. A list row is a thing you open; a table row is a thing you compare. Both are 36px with hairline dividers and a 5%-white hover — the same recipe as a sidebar row and a menu item, which is why they sit together without arguing.',
  purpose: [
    ['List item',  'Records you scan and open. Room for a thumbnail and two lines.', 'Anything you need to compare column by column.'],
    ['Table row',  'Records you compare across fields.',                              'A list of three things.'],
  ],
  cases: [
    { id: 'list', name: 'List',
      when: '<code>data-divided</code> puts the hairlines in; <code>data-interactive</code> makes the row respond. A row that does nothing should not have the second one.',
      demo:
        `<ul class="spy-list" data-divided style="max-width:420px">` +
        [['Northwind', '412 creatives · 3 networks', '16:9'], ['Lumen', '98 creatives · 1 network', '4:5']]
          .map(([t, m, tag]) =>
            `<li class="spy-list-item" data-interactive>` +
            `<span class="spy-sidebar-thumb">${ic('image', 'sm')}</span>` +
            `<span class="spy-list-item-text"><span>${t}</span><span class="spy-list-item-meta">${m}</span></span>` +
            `<span class="spy-tag">${tag}</span></li>`).join('') +
        `</ul>` },
    { id: 'table', name: 'Table',
      when: 'Numbers go right and take <code>data-numeric</code>, which turns on tabular figures so columns of digits line up. Status is a chip, not coloured text.',
      demo:
        `<div class="spy-table-wrap"><table class="spy-table">` +
        `<thead><tr><th>Competitor</th><th>Status</th><th data-align="end">Creatives</th><th data-align="end">Score</th></tr></thead>` +
        `<tbody>` +
        [['Northwind', 'success', 'Live', 412, 81], ['Lumen', 'info', 'Scanning', 98, '—'], ['Parcel', 'error', 'Failed', 0, '—']]
          .map(([n, st, l, c, s]) =>
            `<tr><td>${n}</td>` +
            `<td><span class="spy-chip" data-size="xxs" data-variant="${st}" data-selected>${l}</span></td>` +
            `<td data-align="end" data-numeric>${c}</td>` +
            `<td data-align="end" data-numeric>${s}</td></tr>`).join('') +
        `</tbody></table></div>` },
  ],
  api: {
    props: [
      ['data-divided', 'present — on the list', '—'],
      ['data-interactive', 'present — on a row that opens something', '—'],
      ['data-align', 'end — on a cell', '— (start)'],
      ['data-numeric', 'present — on a cell, for tabular figures', '—'],
      ['data-selected', 'present — on a table row', '—'],
    ],
  },
});

C.push({
  id: 'accordion',
  name: 'Accordion',
  base: '.spy-accordion',
  lede: 'Sections that open one at a time, for content most people will not read. If most people need all of it, it is not an accordion — it is a page.',
  cases: [
    { id: 'default', name: 'Default',
      when: 'The trigger is a button and the chevron lives inside it. <code>data-open</code> on the item, not on the panel.',
      demo:
        `<div class="spy-accordion" style="max-width:520px">` +
        `<div class="spy-accordion-item" data-open>` +
        `<button class="spy-accordion-trigger">How often do scans run?${ic('chevron-down')}</button>` +
        `<div class="spy-accordion-panel">Nightly. A scan you start by hand runs immediately and does not count against the nightly one.</div>` +
        `</div>` +
        `<div class="spy-accordion-item">` +
        `<button class="spy-accordion-trigger">What counts as a creative?${ic('chevron-down')}</button>` +
        `<div class="spy-accordion-panel">One image or video with one set of copy. The same image with two headlines is two creatives.</div>` +
        `</div>` +
        `</div>` },
  ],
  api: { props: [['data-open', 'present — on the item', '—']] },
});
})();
