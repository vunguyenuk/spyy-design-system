/* Divider and Media — the two remaining primitives. */
(function () {
'use strict';
const ic = (n, s) => `<svg class="spy-icon"${s ? ` data-size="${s}"` : ''}><use href="#i-${n}"/></svg>`;
const C = (window.SPY_CASES = window.SPY_CASES || []);

C.push({
  id: 'divider',
  name: 'Divider',
  base: '.spy-divider',
  lede: 'A hairline between groups. It is an <code>&lt;hr&gt;</code>, because that is what it means — a thematic break, not a decoration.',
  notes: [
    'Reach for a divider only when space alone has stopped working. Two dividers next to each other mean the spacing is wrong, not that you need a third.',
  ],
  cases: [
    { id: 'default', name: 'Default',
      when: 'Between sections of a list or a panel.',
      stack: true,
      demo:
        `<span class="spy-caption-l spy-text-secondary">Saved scans</span>` +
        `<hr class="spy-divider">` +
        `<span class="spy-caption-l spy-text-secondary">Shared with you</span>` },
    { id: 'vertical', name: 'Vertical',
      when: 'Between controls in a row — a toolbar, a nav action group.',
      demo:
        `<button class="spy-btn" data-variant="ghost" data-size="sm">Export</button>` +
        `<hr class="spy-divider" data-orientation="vertical">` +
        `<button class="spy-btn" data-variant="ghost" data-size="sm">Share</button>` },
  ],
  api: { props: [['data-orientation', 'vertical', '— (horizontal)']] },
});

C.push({
  id: 'media',
  name: 'Media',
  base: '.spy-media',
  lede: 'A frame for an image or a video, with overlay regions pinned to its edges. The overlays are gradient scrims, and they are <code>pointer-events: none</code> with their children re-enabled — so the media stays clickable in the gaps between the controls.',
  notes: [
    'The aspect ratio is a custom property, <code>--spy-media-ratio</code>, so a grid of mixed ratios never needs a wrapper per ratio.',
  ],
  cases: [
    { id: 'default', name: 'With overlays',
      when: 'A badge pinned top, controls pinned bottom. Both edges are the same component with a different <code>data-place</code>.',
      demo:
        `<div class="spy-media" data-radius style="--spy-media-ratio:16/9;max-width:360px">` +
        `<div class="doc-media-fake"></div>` +
        `<div class="spy-media-overlay" data-place="top">` +
        `<span class="spy-badge" data-variant="pink"><span class="spy-badge-surface"><span class="spy-badge-text">Top</span></span></span>` +
        `</div>` +
        `<div class="spy-media-overlay" data-place="bottom">` +
        `<span class="spy-tag" data-variant="glass">00:08</span>` +
        `<span class="spy-tag" data-variant="glass">Meta</span>` +
        `</div></div>` },
    { id: 'ratio', name: 'Ratio',
      when: 'One property, any ratio. A creative grid is mostly 1:1, 4:5 and 9:16 — the three shapes the networks accept.',
      demo: ['1/1', '4/5', '9/16'].map(r =>
        `<div class="spy-media" data-radius style="--spy-media-ratio:${r};width:110px">` +
        `<div class="doc-media-fake"></div></div>`).join('') },
  ],
  api: {
    props: [
      ['--spy-media-ratio', 'any CSS ratio', '16/9'],
      ['data-radius', 'present', '— (square corners)'],
      ['data-place', 'top · bottom — on an overlay', 'bottom'],
    ],
  },
});
})();
