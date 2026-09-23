/* Checkbox, Radio, Switch, Toggle, Slider — one axis per case. */
(function () {
'use strict';
const ic = (n, s) => `<svg class="spy-icon"${s ? ` data-size="${s}"` : ''}><use href="#i-${n}"/></svg>`;
const C = (window.SPY_CASES = window.SPY_CASES || []);

const cb = a => `<span class="spy-checkbox"${a}><span class="spy-control-box"><span class="spy-control-indicator">${ic(a.includes('indeterminate') ? 'minus' : 'check')}</span></span></span>`;
const rb = a => `<span class="spy-radio"${a}><span class="spy-control-box"><span class="spy-radio-dot"></span></span></span>`;
const sw = a => `<span class="spy-switch"${a}><span class="spy-switch-thumb"></span></span>`;
const labelled = (control, text) =>
  `<label class="spy-control-label">${control}<span class="spy-control-label-text">${text}</span></label>`;

C.push({
  id: 'controls',
  name: 'Selection controls',
  base: '.spy-checkbox · .spy-radio · .spy-switch',
  lede: 'Three controls, three jobs, and the job is what picks one — not the look. None of them carries a status colour, because a control you <em>act with</em> never reports state; the components that report are Chip, Alert, Toast and Badge.',
  purpose: [
    ['checkbox', 'Any number of a set, including none. Also a single yes/no inside a form you submit.',  'A setting that takes effect the moment you touch it.'],
    ['radio',    'Exactly one of a set you can see all of, two to five options.',                         'More than about five — that is a select.'],
    ['switch',   'A setting that takes effect immediately, with no save step.',                           'Anything inside a form with a submit button.'],
  ],
  notes: [
    'One variant besides the default: <code>on-media</code>, for a control sitting on an image or a video still. The prefix names the <em>surface</em>, not the look — there is no <code>white</code> variant because white is what it looks like, not what it is for.',
    'The indeterminate checkbox is a parent whose children disagree. It is never a third user-chosen value.',
  ],
  cases: [
    { id: 'checkbox', name: 'Checkbox',
      when: 'Unchecked, checked, and indeterminate. The box is a 6px-radius marker; the tick is an icon, not a glyph.',
      demo: cb('') + cb(' data-checked') + cb(' data-indeterminate') },

    { id: 'checkbox-group', name: 'Checkbox with a label',
      when: 'Wrap both in <code>.spy-control-label</code> so the text is a hit target too. Most misses on a checkbox are people clicking the word.',
      stack: true,
      demo:
        labelled(cb(' data-checked'), 'Meta') +
        labelled(cb(' data-checked'), 'TikTok') +
        labelled(cb(''), 'YouTube') +
        labelled(cb(' data-disabled'), 'LinkedIn — Pro only') },

    { id: 'radio', name: 'Radio',
      when: 'One of a set. Always render every option: the point of a radio is that you can see what you are not choosing.',
      stack: true,
      demo:
        labelled(rb(' data-checked'), 'Last 30 days') +
        labelled(rb(''), 'Last 90 days') +
        labelled(rb(''), 'Since the account started') },

    { id: 'switch', name: 'Switch',
      when: 'Immediate. If the screen has a Save button, the control you want is a checkbox.',
      stack: true,
      demo:
        labelled(sw(' data-checked'), 'Alert me when a competitor ships a new creative') +
        labelled(sw(''), 'Include paused campaigns') },

    { id: 'size', name: 'Size',
      when: 'Checkbox and radio take <code>sm</code> and <code>lg</code>; the switch takes <code>default</code> and <code>medium</code>. Use the small step inside a table row or a dense filter list, nowhere else.',
      demo:
        cb(' data-checked data-size="sm"') + cb(' data-checked') + cb(' data-checked data-size="lg"') +
        rb(' data-checked data-size="sm"') + rb(' data-checked') + rb(' data-checked data-size="lg"') +
        sw(' data-checked data-size="default"') + sw(' data-checked data-size="medium"') },

    { id: 'tint', name: 'Switch, tinted',
      when: 'The switch is the one control that follows the workspace tint, so a tinted product area does not have a lime switch sitting in it.',
      demo: sw(' data-checked') + sw(' data-checked data-variant="tint"') },

    { id: 'on-media', name: 'On media',
      when: 'A control sitting on an image or a video still, where the page background is not behind it. Named for the surface it is on.',
      surface: 'landing',
      demo:
        cb(' data-checked data-variant="on-media"') +
        cb(' data-variant="on-media"') +
        rb(' data-checked data-variant="on-media"') +
        rb(' data-variant="on-media"') },

    { id: 'disabled', name: 'Disabled',
      when: 'Half opacity and no pointer. As with every disabled control, something nearby has to say what would turn it on.',
      demo:
        cb(' data-disabled') + cb(' data-checked data-disabled') +
        rb(' data-disabled') + rb(' data-checked data-disabled') +
        sw(' data-disabled') + sw(' data-checked data-disabled') },

    { id: 'toggle', name: 'Toggle',
      when: 'A button that stays pressed. Not a switch — a switch is a setting, a toggle is a mode you are working in. <code>aria-pressed</code> is the real API; <code>data-pressed</code> only paints it.',
      demo:
        `<button class="spy-toggle" data-pressed aria-pressed="true">${ic('grid')}Grid</button>` +
        `<button class="spy-toggle" aria-pressed="false">${ic('list')}List</button>` +
        `<button class="spy-toggle" data-size="sm" aria-pressed="false">${ic('filter')}Filters</button>` },

    { id: 'slider', name: 'Slider',
      when: 'A value on a range where the exact number matters less than where it sits. If the number is what matters, use a field.',
      stack: true,
      demo:
        `<div class="spy-slider" style="--spy-slider-value:62%"><div class="spy-slider-track">` +
        `<div class="spy-slider-fill"></div><button class="spy-slider-thumb" aria-label="Minimum score"></button>` +
        `</div></div>` +
        `<div class="spy-slider" data-disabled style="--spy-slider-value:30%"><div class="spy-slider-track">` +
        `<div class="spy-slider-fill"></div><button class="spy-slider-thumb" aria-label="Locked"></button>` +
        `</div></div>` },
  ],
  api: {
    props: [
      ['data-checked', 'present', '—'],
      ['data-indeterminate', 'present — checkbox only', '—'],
      ['data-size', 'sm · lg — checkbox and radio; default · medium — switch', 'md'],
      ['data-variant', 'on-media — checkbox and radio; tint — switch', '—'],
      ['data-disabled', 'present', '—'],
      ['data-pressed', 'present — toggle only, paired with <code>aria-pressed</code>', '—'],
    ],
    parts: [
      ['.spy-control-box', 'The square or circle. Owns the fill, the border and the ring.'],
      ['.spy-control-indicator', 'The tick or the dash inside a checkbox.'],
      ['.spy-radio-dot', 'The filled centre of a checked radio.'],
      ['.spy-switch-thumb', 'The travelling knob.'],
      ['.spy-control-label', 'Wraps control and text so both are the hit target.'],
      ['.spy-slider-track / -fill / -thumb', 'Read the position from <code>--spy-slider-value</code>.'],
    ],
  },
});
})();
