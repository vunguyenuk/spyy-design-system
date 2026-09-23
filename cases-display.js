/* Chip, Badge, Tag, Icon, Icon tile, Avatar — one axis per case. */
(function () {
'use strict';
const ic = (n, s) => `<svg class="spy-icon"${s ? ` data-size="${s}"` : ''}><use href="#i-${n}"/></svg>`;
const C = (window.SPY_CASES = window.SPY_CASES || []);
const badge = (v, t) => `<span class="spy-badge" data-variant="${v}"><span class="spy-badge-surface"><span class="spy-badge-text">${t}</span></span></span>`;

C.push({
  id: 'chip',
  name: 'Chip',
  base: '.spy-chip',
  lede: 'A pill you can select. It is the one small component that <em>does</em> carry status colour, because a chip reports — it says what something is, or what a filter is set to.',
  purpose: [
    ['default',  'A filter you can turn on and off. Selected floods with the accent.', 'Anything that is not toggleable.'],
    ['neutral',  'A value with no judgement attached — a label, a count, a category.', 'A result you want read as good or bad.'],
    ['success',  'It worked, it finished, it is live.', 'A neutral count that happens to be high.'],
    ['warning',  'It needs attention but nothing is broken — queued, throttled, near a limit.', 'An error.'],
    ['error',    'It failed, it is blocked, it is over a hard limit.', 'A warning you want people to notice slightly less.'],
    ['info',     'It is in progress, or it is a note about state.', 'A success.'],
  ],
  notes: [
    'Hover moves the <em>border</em> to a very dark lime rather than lightening the fill, which keeps hover quiet in a row of twenty.',
    'A chip is fully round. That is the pill tier, and it is what separates it from a tag, which is a marker.',
  ],
  cases: [
    { id: 'filter', name: 'As a filter',
      when: 'A row of them, one selected. This is the chip doing its main job.',
      demo:
        `<button class="spy-chip" data-selected>All</button>` +
        `<button class="spy-chip">${ic('image')}Image</button>` +
        `<button class="spy-chip">${ic('video')}Video</button>` +
        `<button class="spy-chip">${ic('audio')}Audio</button>` },
    { id: 'status', name: 'As a status',
      when: 'Not a button — a <code>&lt;span&gt;</code>, marked selected so the colour floods. A status chip is read, not clicked.',
      demo:
        `<span class="spy-chip" data-variant="success" data-selected>Live</span>` +
        `<span class="spy-chip" data-variant="info" data-selected>Scanning</span>` +
        `<span class="spy-chip" data-variant="warning" data-selected>Queued</span>` +
        `<span class="spy-chip" data-variant="error" data-selected>Failed</span>` +
        `<span class="spy-chip" data-variant="neutral" data-selected>Paused</span>` },
    { id: 'size', name: 'Size',
      when: 'Four steps. <code>xxs</code> is for inside a table cell, where a chip is a label rather than a control.',
      demo: ['xxs', 'xs', 'sm', 'md'].map(s => `<button class="spy-chip" data-size="${s}">${s}</button>`).join('') },
    { id: 'disabled', name: 'Disabled',
      when: 'A filter that cannot be applied to the current result set.',
      demo: `<button class="spy-chip" data-disabled>LinkedIn</button><button class="spy-chip" data-selected data-disabled>Meta</button>` },
  ],
  api: {
    props: [
      ['data-variant', 'neutral · success · warning · error · info', '— (accent)'],
      ['data-size', 'xxs · xs · sm · md', 'sm'],
      ['data-selected', 'present', '—'],
      ['data-disabled', 'present', '—'],
    ],
  },
});

C.push({
  id: 'badge',
  name: 'Badge',
  base: '.spy-badge',
  lede: 'A skewed sticker, three nested elements deep so the skew can be undone on the text. It is the loudest small thing in the system and it should be rare — one per screen, usually zero.',
  notes: [
    'The skew is on the surface and reversed on the text, which is why the markup is three levels. Flattening it flattens the letters too.',
    '2px radius — the sticker tier, and the only component that uses it.',
  ],
  cases: [
    { id: 'variant', name: 'Variant',
      when: 'Five fills. Lime is the product marker, the gradients are promotional, and lime-subtle is the quiet one for a busy surface.',
      demo: badge('lime', 'New') + badge('lime-subtle', 'Beta') + badge('pink', 'Top') + badge('blue', 'Pro') + badge('purple', 'AI') },
    { id: 'shape', name: 'Shape',
      when: 'Square removes the skew, for a badge that sits inside something already tilted — or beside type that makes the skew read as a mistake.',
      demo: badge('lime', 'Skewed') + `<span class="spy-badge" data-variant="lime" data-shape="square"><span class="spy-badge-surface"><span class="spy-badge-text">Square</span></span></span>` },
    { id: 'inline', name: 'Beside a label',
      when: 'The badge sits after the thing it marks, never before it. It is an annotation, not a prefix.',
      demo: `<span class="spy-body-s">API ${badge('lime', 'New')}</span>` },
  ],
  api: {
    props: [
      ['data-variant', 'lime · lime-subtle · pink · blue · purple', 'lime'],
      ['data-shape', 'square', '— (skewed)'],
    ],
    parts: [
      ['.spy-badge-surface', 'Carries the skew and the fill.'],
      ['.spy-badge-text', 'Reverses the skew so the letters stand up.'],
    ],
  },
});

C.push({
  id: 'tag',
  name: 'Tag',
  base: '.spy-tag',
  lede: 'A marker on a piece of content — a dimension, a duration, a shortcut. It is not selectable and not a status: nothing happens when you click a tag.',
  cases: [
    { id: 'default', name: 'Default',
      when: 'Facts about the thing it sits on.',
      demo: `<span class="spy-tag">1080 × 1350</span><span class="spy-tag">${ic('video')}00:08</span><span class="spy-tag">Meta</span>` },
    { id: 'glass', name: 'Glass',
      when: 'For a tag over media, where a solid fill would fight the image underneath.',
      surface: 'landing',
      demo: `<span class="spy-tag" data-variant="glass">⌘K</span><span class="spy-tag" data-variant="glass">4:5</span>` },
  ],
  api: { props: [['data-variant', 'glass', '—']] },
});

C.push({
  id: 'icon',
  name: 'Icon',
  base: '.spy-icon · .spy-icon-tile',
  lede: 'One sprite, referenced by <code>&lt;use&gt;</code>. An icon takes its size from the component it sits in, so in almost every case you write no size at all.',
  notes: [
    'Setting <code>data-size</code> on an icon that already sits in a sized component is how icon sizes drift. Only set it when the icon is standing on its own.',
  ],
  cases: [
    { id: 'size', name: 'Size',
      when: 'Five steps, for a standalone icon. Inside a button, a chip or a menu row the component has already decided.',
      demo: ['xs', 'sm', 'md', 'lg', 'xl'].map(s => ic('search', s)).join('') },
    { id: 'tile', name: 'Icon tile',
      when: 'An icon on its own tinted square, for a feature row or an empty state. The tone names a hue, not a status — a blue tile does not mean information.',
      demo: ['neutral', 'brand', 'blue', 'purple', 'pink', 'orange', 'success']
        .map(t => `<span class="spy-icon-tile" data-tone="${t}">${ic('sparkle')}</span>`).join('') },
    { id: 'tile-size', name: 'Icon tile size',
      when: 'Two steps: 28px in a dense list, 40px when the tile is the thing you look at first.',
      demo: `<span class="spy-icon-tile" data-tone="blue">${ic('search')}</span><span class="spy-icon-tile" data-tone="blue" data-size="lg">${ic('search')}</span>` },
  ],
  api: {
    props: [
      ['data-size', 'xs 12 · sm 16 · md 20 · lg 24 · xl 32 — on <code>.spy-icon</code>', 'inherited'],
      ['data-tone', 'neutral · brand · blue · purple · pink · orange · success — on the tile', 'neutral'],
      ['data-size', 'lg — on the tile', 'md'],
    ],
  },
});

C.push({
  id: 'avatar',
  name: 'Avatar',
  base: '.spy-avatar · .spy-avatar-group',
  lede: 'A person or a brand, round, with initials as the fallback. The overflow count is a sibling of the avatars, not one of them.',
  cases: [
    { id: 'default', name: 'Default',
      when: 'Initials when there is no image. Two letters, never three.',
      demo: `<span class="spy-avatar">MR</span><span class="spy-avatar">JL</span><span class="spy-avatar">TK</span>` },
    { id: 'group', name: 'Group',
      when: 'Overlapping, with the count last. The count is not an avatar — it reads as text on the page surface, which is why it does not flip colour with the stack.',
      demo:
        `<div class="spy-avatar-group">` +
        `<span class="spy-avatar">MR</span><span class="spy-avatar">JL</span><span class="spy-avatar">TK</span>` +
        `<span class="spy-avatar-count">+12</span>` +
        `</div>` },
  ],
});
})();
