/* Field group — controls joined into one object. */
(function () {
'use strict';
const ic = (n, s) => `<svg class="spy-icon"${s ? ` data-size="${s}"` : ''}><use href="#i-${n}"/></svg>`;
const C = (window.SPY_CASES = window.SPY_CASES || []);

C.push({
  id: 'fieldgroup',
  name: 'Field group',
  base: '.spy-fieldgroup',
  lede: 'Two or more controls that act on one value, joined into a single object — a token with a copy button, an amount with a currency, a search with a scope. If each control stands on its own, they take a gap, not a seam.',
  notes: [
    'Joining is three rules: the seam collapses the facing corners, the shared edge is drawn once rather than twice, and whichever segment has focus rises above its neighbours so its ring is not clipped by them.',
    'A button in a group wears the field\'s edge instead of its own fill, so the two halves read as one control rather than as a control with a button stuck to it.',
    '<code>.spy-btn-group</code> is the same idea for buttons alone. Use this one the moment a field is involved.',
  ],
  cases: [
    { id: 'action', name: 'Field and action',
      when: 'The common case: a value you read and one thing you do with it.',
      demo:
        `<div class="spy-fieldgroup">` +
        `<div class="spy-field-control"><input class="spy-field-input" placeholder="Enter token"></div>` +
        `<button class="spy-btn" data-icon-only aria-label="Copy">${ic('copy')}</button>` +
        `</div>` },
    { id: 'prefix', name: 'Select and field',
      when: 'A scope in front of the value. The select is first because you choose the scope before you type.',
      demo:
        `<div class="spy-fieldgroup">` +
        `<button class="spy-field-control spy-select-trigger" style="width:auto;flex:none">` +
        `<span class="spy-select-value">Domain</span>` +
        `<span class="spy-select-icon">${ic('chevron-down', 'sm')}</span></button>` +
        `<div class="spy-field-control"><input class="spy-field-input" placeholder="northwind.com"></div>` +
        `</div>` },
    { id: 'suffix', name: 'Field and unit',
      when: 'A unit after the number. It is a select because the unit is a choice; when it is not, it is a <code>.spy-field-affix</code> inside the field instead.',
      demo:
        `<div class="spy-fieldgroup">` +
        `<div class="spy-field-control"><input class="spy-field-input" value="500"></div>` +
        `<button class="spy-field-control spy-select-trigger" style="width:auto;flex:none">` +
        `<span class="spy-select-value">USD</span>` +
        `<span class="spy-select-icon">${ic('chevron-down', 'sm')}</span></button>` +
        `</div>` },
    { id: 'size', name: 'Size',
      when: 'The group sets the height once, so the segments cannot disagree about it.',
      stack: true,
      demo: ['sm', '', 'lg'].map(sz =>
        `<div class="spy-fieldgroup"${sz ? ` data-size="${sz}"` : ''}>` +
        `<div class="spy-field-control"${sz ? ` data-size="${sz}"` : ''}><input class="spy-field-input" placeholder="${sz || 'md'}"></div>` +
        `<button class="spy-btn"${sz ? ` data-size="${sz}"` : ''} data-icon-only aria-label="Search">${ic('search')}</button>` +
        `</div>`).join('') },
  ],
  api: {
    props: [['data-size', 'sm · lg — sets the height for every segment', '— (md)']],
    parts: [
      ['.spy-field-control', 'Any number of them. They flex; the buttons do not.'],
      ['.spy-btn', 'Takes the field\'s edge and fill inside a group.'],
      ['.spy-btn-group', 'The buttons-only version, when no field is involved.'],
    ],
  },
});
})();
