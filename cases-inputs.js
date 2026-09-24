/* Select menu, Number, Tags, Checkbox group, Calendar — one axis per case. */
(function () {
'use strict';
const ic = (n, s) => `<svg class="spy-icon"${s ? ` data-size="${s}"` : ''}><use href="#i-${n}"/></svg>`;
const C = (window.SPY_CASES = window.SPY_CASES || []);
const cb = a => `<span class="spy-checkbox"${a}><span class="spy-control-box"><span class="spy-control-indicator">${ic('check')}</span></span></span>`;
const labelled = (c, t) => `<label class="spy-control-label">${c}<span class="spy-control-label-text">${t}</span></label>`;

C.push({
  id: 'selectmenu',
  name: 'Select menu',
  base: '.spy-selectmenu',
  lede: 'A select you can search. Past about twenty options a plain select stops being usable, and every filter on a scan screen is past twenty — so this is the one you will reach for most.',
  notes: [
    'It is the select trigger with the palette\'s search row dropped into the top of its menu. Nothing new: the row is a menu item, the search is a field, the surface is a menu.',
    'When it takes several values, show them in the trigger as chips rather than as a count. A count tells you <em>how many</em> you picked; the chips tell you <em>which</em>.',
  ],
  cases: [
    { id: 'single', name: 'Single',
      when: 'Query at the top, results under it, one selected. The selected row keeps its mark while you filter, so you can always see what you are about to replace.',
      demo:
        `<div class="spy-menu" style="max-width:320px"><div class="spy-selectmenu">` +
        `<div class="spy-selectmenu-search">${ic('search', 'sm')}` +
        `<input class="spy-selectmenu-input" value="north" placeholder="Search competitors"></div>` +
        `<div class="spy-selectmenu-list">` +
        `<button class="spy-menu-item" data-selected>` +
        `<span class="spy-menu-item-label">Northwind</span>` +
        `<span class="spy-menu-meta">${ic('check', 'sm')}</span></button>` +
        `<button class="spy-menu-item"><span class="spy-menu-item-label">Northbeam</span></button>` +
        `<button class="spy-menu-item"><span class="spy-menu-item-label">North Peak</span></button>` +
        `</div></div></div>` },
    { id: 'multiple', name: 'Multiple',
      when: 'The trigger holds the chosen values. Each chip removes itself; the field keeps its height until they wrap.',
      demo:
        `<button class="spy-field-control spy-select-trigger" style="height:auto;min-height:var(--hf-space-1000);padding-block:var(--hf-space-150)">` +
        `<span class="spy-selectmenu-tokens">` +
        `<span class="spy-chip" data-size="xxs" data-selected>Northwind</span>` +
        `<span class="spy-chip" data-size="xxs" data-selected>Lumen</span>` +
        `<span class="spy-chip" data-size="xxs" data-selected>Parcel</span>` +
        `</span>` +
        `<span class="spy-select-icon">${ic('chevron-down', 'sm')}</span></button>` },
  ],
  api: {
    parts: [
      ['.spy-selectmenu-search', 'The query row inside the menu.'],
      ['.spy-selectmenu-list', 'The scrolling results. Menu items, so a row is the same 36px as everywhere else.'],
      ['.spy-selectmenu-tokens', 'The chosen values, inside the trigger.'],
    ],
  },
});

C.push({
  id: 'number',
  name: 'Number',
  base: '.spy-number',
  lede: 'A number you nudge. Score thresholds, spend floors, result caps. The steppers sit <em>inside</em> the field\'s edge, so the control is one box rather than a box beside two buttons.',
  notes: [
    'The value is right-aligned with tabular figures, so a column of these lines up — which is the only reason to put numbers in a column.',
    'If the value has no sensible step, it is a field with a numeric input, not this.',
  ],
  cases: [
    { id: 'default', name: 'Default',
      when: 'With a unit, as an affix. The unit is not part of the value, so it does not scroll with it.',
      demo:
        `<div class="spy-field-control spy-number" style="max-width:240px">` +
        `<input class="spy-field-input" value="60" inputmode="numeric">` +
        `<span class="spy-field-affix">score</span>` +
        `<span class="spy-number-steppers">` +
        `<button type="button" class="spy-number-step" aria-label="Increase">${ic('chevron-up')}</button>` +
        `<button type="button" class="spy-number-step" aria-label="Decrease">${ic('chevron-down')}</button>` +
        `</span></div>` },
  ],
  api: { parts: [['.spy-number-steppers', 'The pair. They live inside the field, not beside it.']] },
});

C.push({
  id: 'tags',
  name: 'Tag input',
  base: '.spy-tagsfield',
  lede: 'Keyword sets, competitor lists, negative terms. The tags live inside the field, so it grows downward as they wrap instead of scrolling sideways past what you already typed.',
  cases: [
    { id: 'default', name: 'Default',
      when: 'Enter commits a tag; backspace on an empty input takes the last one back.',
      demo:
        `<div class="spy-field-control spy-tagsfield" style="max-width:480px">` +
        [['running shoes'], ['trail'], ['marathon']].map(([t]) =>
          `<span class="spy-chip" data-size="xxs" data-selected>${t}${ic('close', 'xs')}</span>`).join('') +
        `<input class="spy-field-input" placeholder="Add a keyword">` +
        `</div>` },
  ],
});

C.push({
  id: 'checkgroup',
  name: 'Checkbox group',
  base: '.spy-checkgroup',
  lede: 'Every filter list is one, and each had been re-deciding its own spacing. The group owns the rhythm so the list does not have to.',
  cases: [
    { id: 'vertical', name: 'Vertical',
      when: 'The default. A label above, then the options.',
      demo:
        `<div class="spy-checkgroup">` +
        `<span class="spy-checkgroup-label">Networks</span>` +
        labelled(cb(' data-checked'), 'Meta') +
        labelled(cb(' data-checked'), 'TikTok') +
        labelled(cb(''), 'YouTube') +
        `</div>` },
    { id: 'horizontal', name: 'Horizontal',
      when: 'For three or four short options in a filter bar. Past that it wraps into an unreadable block and wants the vertical form.',
      demo:
        `<div class="spy-checkgroup" data-orientation="horizontal">` +
        labelled(cb(' data-checked'), 'Image') +
        labelled(cb(''), 'Video') +
        labelled(cb(''), 'Carousel') +
        `</div>` },
  ],
  api: { props: [['data-orientation', 'horizontal', '— (vertical)']] },
});

const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const day = (n, a) => `<button type="button" class="spy-calendar-day"${a || ''}>${n}</button>`;
C.push({
  id: 'calendar',
  name: 'Calendar',
  base: '.spy-calendar',
  lede: 'Every scan is over a <em>window</em>, and until now there was no way to express one. The range is painted on the cells between its ends rather than on a bar behind them, so a range that wraps a week boundary still reads as one range.',
  notes: [
    'Today is marked with an edge, not a fill — a fill would compete with the selection, and the two mean different things.',
    'The day numbers are tabular, so the columns are columns.',
  ],
  cases: [
    { id: 'range', name: 'Range',
      when: 'The common case. Two ends and everything between them.',
      demo:
        `<div class="spy-calendar">` +
        `<div class="spy-calendar-head">` +
        `<button type="button" class="spy-btn" data-variant="ghost" data-size="xs" data-icon-only aria-label="Previous month">${ic('chevron-left')}</button>` +
        `<span class="spy-calendar-month">September 2026</span>` +
        `<button type="button" class="spy-btn" data-variant="ghost" data-size="xs" data-icon-only aria-label="Next month">${ic('chevron-right')}</button>` +
        `</div>` +
        `<div class="spy-calendar-grid">` +
        DOW.map(d => `<span class="spy-calendar-dow">${d}</span>`).join('') +
        [31].map(n => day(n, ' data-outside')).join('') +
        Array.from({ length: 27 }, (_, i) => i + 1).map(n => {
          if (n === 8) return day(n, ' data-selected data-range-start');
          if (n === 18) return day(n, ' data-selected data-range-end');
          if (n > 8 && n < 18) return day(n, ' data-in-range');
          if (n === 24) return day(n, ' data-today');
          return day(n);
        }).join('') +
        `</div></div>` },
    { id: 'single', name: 'Single date',
      when: 'One day. The same grid with one cell selected and nothing in range.',
      demo:
        `<div class="spy-calendar">` +
        `<div class="spy-calendar-head">` +
        `<button type="button" class="spy-btn" data-variant="ghost" data-size="xs" data-icon-only aria-label="Previous month">${ic('chevron-left')}</button>` +
        `<span class="spy-calendar-month">September 2026</span>` +
        `<button type="button" class="spy-btn" data-variant="ghost" data-size="xs" data-icon-only aria-label="Next month">${ic('chevron-right')}</button>` +
        `</div>` +
        `<div class="spy-calendar-grid">` +
        DOW.map(d => `<span class="spy-calendar-dow">${d}</span>`).join('') +
        [31].map(n => day(n, ' data-outside')).join('') +
        Array.from({ length: 20 }, (_, i) => i + 1).map(n =>
          n === 11 ? day(n, ' data-selected') : n === 24 ? day(n, ' data-today') :
          n < 3 ? day(n, ' data-disabled') : day(n)).join('') +
        `</div></div>` },
  ],
  api: {
    props: [
      ['data-selected', 'present — an end of the range, or the one day', '—'],
      ['data-in-range', 'present — a day between the ends', '—'],
      ['data-range-start / -end', 'present — rounds the outer corner', '—'],
      ['data-today', 'present — an edge, never a fill', '—'],
      ['data-outside', 'present — a day from the neighbouring month', '—'],
      ['data-disabled', 'present', '—'],
    ],
  },
});
})();
