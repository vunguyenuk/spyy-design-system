/* Field, Select, and the selection controls — one axis per case. */
(function () {
'use strict';
const ic = (n, s) => `<svg class="spy-icon"${s ? ` data-size="${s}"` : ''}><use href="#i-${n}"/></svg>`;
const C = (window.SPY_CASES = window.SPY_CASES || []);

/* -- Field ------------------------------------------------------------------ */
C.push({
  id: 'field',
  name: 'Field',
  base: '.spy-field · .spy-field-control · .spy-field-input',
  lede: 'The text-entry control, and the label, description and error that travel with it. It is <strong>outlined</strong>, not filled — the edge says you can put something in this; a fill says this is a surface things sit on. Focus is an <em>inset</em> ring, so the control never grows.',
  notes: [
    'It used to be the other way round — no border, and a 5%-white fill for depth. That is exactly how this system draws a <em>disabled</em> control, so an empty field read as one you could not type in. The fill also had nothing left to say once the field sat on a card, which is itself a fill one step up.',
    'One radius for every size — <code>8px</code>, the control step. A tall field is not a rounder field.',
    'Hover moves the edge rather than adding a fill. In a form of nine fields, nine fills lighting up in turn is a lot of movement for “the pointer is here”.',
    'Focus and invalid are both inset rings, so neither changes the layout. Invalid survives focus: a field you are typing in still tells you it is wrong.',
    'The placeholder is white at 50% <em>alpha</em>, not dimmed grey text, so it stays legible on every fill the field sits on.',
  ],
  cases: [
    { id: 'label', name: 'Label and control',
      when: 'The whole field is three parts and you almost always want all three. The label is a real <code>&lt;label&gt;</code>; the control is the box; the description sits under it.',
      demo:
        `<div class="spy-field">` +
        `<label class="spy-field-label">Competitor</label>` +
        `<div class="spy-field-control"><input class="spy-field-input" placeholder="northwind.com"></div>` +
        `<span class="spy-field-description">One domain. Subdomains are scanned with it.</span>` +
        `</div>` },

    { id: 'size', name: 'Size',
      when: 'Three heights — 32 / 40 / 48. Use <code>sm</code> inside a toolbar or a table row, <code>md</code> everywhere else, <code>lg</code> only where the field is the single thing on screen.',
      stack: true,
      demo: ['sm', 'md', 'lg'].map(s =>
        `<div class="spy-field-control" data-size="${s}"><input class="spy-field-input" placeholder="${s}"></div>`).join('') },

    { id: 'affix', name: 'Prefix and suffix',
      when: 'An icon before the input or a control after it. Both sit in 20px square boxes so adding one never shifts the text.',
      stack: true,
      demo:
        `<div class="spy-field-control">` +
        `<span class="spy-field-affix">${ic('search')}</span>` +
        `<input class="spy-field-input" value="running shoes" placeholder="Search creatives">` +
        `<button class="spy-field-clear" aria-label="Clear">${ic('close', 'sm')}</button>` +
        `</div>` +
        `<div class="spy-field-control">` +
        `<input class="spy-field-input" value="500" placeholder="Minimum spend">` +
        `<span class="spy-field-affix">USD</span>` +
        `</div>` },

    { id: 'multiline', name: 'Multiline',
      when: 'Same control, a textarea inside it. It does not grow on its own — give it rows, or wire auto-grow yourself.',
      demo:
        `<div class="spy-field-control" data-multiline>` +
        `<textarea class="spy-field-input" rows="3" placeholder="Terms to exclude, one per line"></textarea>` +
        `</div>` },

    { id: 'invalid', name: 'Invalid',
      when: 'Put <code>data-invalid</code> on the control <em>and</em> the label, and say what is wrong under it. The message replaces the description; do not show both.',
      demo:
        `<div class="spy-field">` +
        `<label class="spy-field-label" data-invalid>Competitor <span class="spy-field-required">*</span></label>` +
        `<div class="spy-field-control" data-invalid><input class="spy-field-input" value="not a domain"></div>` +
        `<span class="spy-field-error">Enter a domain, like northwind.com.</span>` +
        `</div>` },

    { id: 'disabled', name: 'Disabled',
      when: 'Mark the control and disable the real input. A disabled field should always have something nearby explaining what would enable it.',
      demo:
        `<div class="spy-field">` +
        `<label class="spy-field-label">Scan window</label>` +
        `<div class="spy-field-control" data-disabled><input class="spy-field-input" value="Last 30 days" disabled></div>` +
        `<span class="spy-field-description">Fixed on the free tier.</span>` +
        `</div>` },

    { id: 'labelrow', name: 'Label row',
      when: 'A hint on the right of the label — usually the word <em>Optional</em>. Mark the optional ones when most are required, and the required ones when most are optional. Marking every field says nothing.',
      stack: true,
      demo:
        `<div class="spy-field">` +
        `<div class="spy-field-labelrow">` +
        `<label class="spy-field-label">Competitor <span class="spy-field-required">*</span></label>` +
        `</div>` +
        `<div class="spy-field-control"><input class="spy-field-input" placeholder="northwind.com"></div>` +
        `</div>` +
        `<div class="spy-field">` +
        `<div class="spy-field-labelrow">` +
        `<label class="spy-field-label">Label this scan</label>` +
        `<span class="spy-field-hint">Optional</span>` +
        `</div>` +
        `<div class="spy-field-control"><input class="spy-field-input" placeholder="Q3 — running shoes"></div>` +
        `</div>` },

    { id: 'horizontal', name: 'Label beside the control',
      when: 'For a settings screen, where the labels are short and one row per setting is the point. The label column is <code>--hf-field-label-width</code>, so a column of them lines up without each field being told how wide to be.',
      stack: true,
      demo:
        `<div class="spy-field" data-orientation="horizontal">` +
        `<label class="spy-field-label">Scan window</label>` +
        `<div class="spy-field-control"><input class="spy-field-input" value="Last 30 days"></div>` +
        `</div>` +
        `<div class="spy-field" data-orientation="horizontal">` +
        `<label class="spy-field-label">Minimum score</label>` +
        `<div class="spy-field-control"><input class="spy-field-input" value="60"></div>` +
        `</div>` },

    { id: 'soft', name: 'Soft, over media',
      when: 'The filled field, for the one case an outline cannot serve: a control over an image, where there is nothing stable for an edge to sit against.',
      surface: 'landing',
      demo: `<div class="spy-field-control" data-variant="soft"><input class="spy-field-input" placeholder="Search this creative"></div>` },

    { id: 'states', name: 'States',
      when: 'Rest, hover, focus and invalid, side by side. Every one of them is drawn inside the box — the field is the same size in all four.',
      noCode: true,
      stack: true,
      demo:
        `<div class="doc-state-row"><span class="doc-state-label">rest</span>` +
        `<div class="spy-field-control"><input class="spy-field-input" value="northwind.com"></div></div>` +
        `<div class="doc-state-row" data-force="hover"><span class="doc-state-label">hover</span>` +
        `<div class="spy-field-control"><input class="spy-field-input" value="northwind.com"></div></div>` +
        `<div class="doc-state-row" data-force="field-focus"><span class="doc-state-label">focus</span>` +
        `<div class="spy-field-control"><input class="spy-field-input" value="northwind.com"></div></div>` +
        `<div class="doc-state-row"><span class="doc-state-label">invalid</span>` +
        `<div class="spy-field-control" data-invalid><input class="spy-field-input" value="northwind"></div></div>` },
  ],
  api: {
    props: [
      ['data-size', 'sm · md · lg', 'md'],
      ['data-variant', 'soft — filled, for over media', '— (outlined)'],
      ['data-orientation', 'horizontal — on <code>.spy-field</code>', '— (stacked)'],
      ['data-invalid', 'present — on the control and the label', '—'],
      ['data-disabled', 'present', '—'],
      ['data-multiline', 'present', '—'],
    ],
    parts: [
      ['.spy-field', 'The wrapper that stacks label, control and message.'],
      ['.spy-field-label', 'Takes <code>data-invalid</code> to turn red with the control.'],
      ['.spy-field-control', 'The box. Owns the fill, the radius and every ring.'],
      ['.spy-field-input', 'The <code>&lt;input&gt;</code> or <code>&lt;textarea&gt;</code>. Contributes no chrome of its own.'],
      ['.spy-field-affix', 'A 20px square before or after the input — an icon, a unit, a currency.'],
      ['.spy-field-clear', 'The clear button. Only render it when there is something to clear.'],
      ['.spy-field-description', 'Help text. Replaced by the error, never shown beside it.'],
      ['.spy-field-error', 'What is wrong and what to do about it.'],
      ['.spy-field-required', 'The asterisk. Marks required, never optional.'],
      ['.spy-field-labelrow', 'Label on the left, hint on the right.'],
      ['.spy-field-hint', 'The hint. Tertiary ink, and it is never the error.'],
    ],
    states: [
      ['hover', 'the edge steps from <code>border/default</code> to <code>border/strong</code>'],
      ['focus-within', 'inset 1.5px ring in <code>border/focus</code> — no growth'],
      ['invalid', 'inset 1.5px ring in the error colour, and it outranks focus'],
      ['disabled', 'opacity 0.5, <code>cursor: not-allowed</code>, hover suppressed'],
    ],
  },
});

/* -- Select ----------------------------------------------------------------- */
C.push({
  id: 'select',
  name: 'Select',
  base: '.spy-select-trigger · .spy-menu',
  lede: 'A trigger that reuses the field control, and a menu of values. The chevron rotates on open over 180ms with an expo-out ease — a long tail that makes the menu feel attached to the trigger rather than dropped on top of it.',
  notes: [
    'The trigger <em>is</em> a field control, so it inherits the fill, the radius, the ring and the sizes. It is not a second box that happens to look similar.',
    'A menu of <strong>values</strong> shows a selected item; a menu of <strong>commands</strong> does not. Same markup, and the difference is which states you use.',
  ],
  cases: [
    { id: 'trigger', name: 'Trigger',
      when: 'Closed, with a value. When there is no value, put the placeholder in the value slot with <code>.spy-text-tertiary</code> — not in a separate element.',
      stack: true,
      demo:
        `<button class="spy-field-control spy-select-trigger">` +
        `<span class="spy-select-value">Last 30 days</span>` +
        `<span class="spy-select-icon">${ic('chevron-down', 'sm')}</span>` +
        `</button>` +
        `<button class="spy-field-control spy-select-trigger">` +
        `<span class="spy-select-value spy-text-tertiary">Pick a network</span>` +
        `<span class="spy-select-icon">${ic('chevron-down', 'sm')}</span>` +
        `</button>` },

    { id: 'open', name: 'Open',
      when: '<code>data-open</code> turns the chevron and holds the focus ring while the menu is up.',
      demo:
        `<button class="spy-field-control spy-select-trigger" data-open>` +
        `<span class="spy-select-value">Last 30 days</span>` +
        `<span class="spy-select-icon">${ic('chevron-down', 'sm')}</span>` +
        `</button>` },

    { id: 'menu', name: 'Menu of values',
      when: 'A group label, rows with media and a meta column, and one row marked selected. This is the shape a select drops.',
      demo:
        `<div class="spy-menu">` +
        `<span class="spy-menu-group-label">Windows</span>` +
        `<button class="spy-menu-item" data-selected>` +
        `<span class="spy-menu-item-media">${ic('refresh', 'md')}</span>` +
        `<span class="spy-menu-item-label"><span>Last 30 days</span>` +
        `<span class="spy-menu-item-description">Rolling, refreshed nightly</span></span>` +
        `<span class="spy-menu-meta">default</span>` +
        `</button>` +
        `<button class="spy-menu-item">` +
        `<span class="spy-menu-item-media">${ic('layers', 'md')}</span>` +
        `<span class="spy-menu-item-label"><span>Last 90 days</span>` +
        `<span class="spy-menu-item-description">Slower, catches seasonal runs</span></span>` +
        `</button>` +
        `</div>` },

    { id: 'menu-commands', name: 'Menu of commands',
      when: 'The same markup doing a different job: a separator between groups, one disabled row with a reason in the meta column, and the destructive row last and marked.',
      demo:
        `<div class="spy-menu">` +
        `<button class="spy-menu-item"><span class="spy-menu-item-icon">${ic('copy', 'md')}</span>` +
        `<span class="spy-menu-item-label">Duplicate scan</span></button>` +
        `<button class="spy-menu-item"><span class="spy-menu-item-icon">${ic('download', 'md')}</span>` +
        `<span class="spy-menu-item-label">Export results</span></button>` +
        `<hr class="spy-menu-separator">` +
        `<button class="spy-menu-item" data-disabled><span class="spy-menu-item-icon">${ic('lock', 'md')}</span>` +
        `<span class="spy-menu-item-label">Share with team</span><span class="spy-menu-meta">Pro</span></button>` +
        `<button class="spy-menu-item" data-danger><span class="spy-menu-item-icon">${ic('trash', 'md')}</span>` +
        `<span class="spy-menu-item-label">Delete scan</span></button>` +
        `</div>` },

    { id: 'invalid', name: 'Invalid',
      when: 'Same attribute as the field, on the trigger and the label.',
      demo:
        `<div class="spy-field">` +
        `<label class="spy-field-label" data-invalid>Network</label>` +
        `<button class="spy-field-control spy-select-trigger" data-invalid>` +
        `<span class="spy-select-value spy-text-tertiary">Pick a network</span>` +
        `<span class="spy-select-icon">${ic('chevron-down', 'sm')}</span>` +
        `</button>` +
        `<span class="spy-field-error">Pick at least one network to scan.</span>` +
        `</div>` },
  ],
  api: {
    props: [
      ['data-open', 'present — on the trigger', '—'],
      ['data-invalid', 'present', '—'],
      ['data-selected', 'present — on one menu item', '—'],
      ['data-disabled', 'present — on a menu item', '—'],
      ['data-danger', 'present — on a menu item', '—'],
    ],
    parts: [
      ['.spy-select-trigger', 'Applied <em>alongside</em> <code>.spy-field-control</code>, never instead of it.'],
      ['.spy-select-value', 'The chosen value, or the placeholder in tertiary ink.'],
      ['.spy-select-icon', 'The chevron. Rotates from <code>data-open</code>.'],
      ['.spy-menu', 'The floating list. 16px radius — it is a panel.'],
      ['.spy-menu-group-label', 'A heading inside the list. Not selectable.'],
      ['.spy-menu-item-media', 'A 24px slot for a thumbnail or a large icon.'],
      ['.spy-menu-item-icon', 'A plain leading icon, for command rows.'],
      ['.spy-menu-item-description', 'A second line under the label.'],
      ['.spy-menu-meta', 'The right column — a shortcut, a price, a reason it is locked.'],
      ['.spy-menu-separator', 'An <code>&lt;hr&gt;</code> between groups.'],
    ],
  },
});
})();
