/* Popover, Drawer, Carousel, Tree, Banner, Scroll area, Splitter. */
(function () {
'use strict';
const ic = (n, s) => `<svg class="spy-icon"${s ? ` data-size="${s}"` : ''}><use href="#i-${n}"/></svg>`;
const C = (window.SPY_CASES = window.SPY_CASES || []);
const cb = a => `<span class="spy-checkbox"${a}><span class="spy-control-box"><span class="spy-control-indicator">${ic('check')}</span></span></span>`;
const labelled = (c, t) => `<label class="spy-control-label">${c}<span class="spy-control-label-text">${t}</span></label>`;

C.push({
  id: 'popover',
  name: 'Popover',
  base: '.spy-popover',
  lede: 'A panel anchored to what opened it — a filter, a quick edit, a score explainer. It is the menu\'s surface without the menu\'s row model, which is the whole difference from a dropdown: anything can go in it.',
  purpose: [
    ['Popover', 'Content and controls attached to a trigger. It can be dismissed and nothing is lost.', 'A decision that must be answered.'],
    ['Modal',   'A question that stops everything until it is answered.',                                'A filter.'],
    ['Tooltip', 'A label for a control with no room for one. It holds no controls of its own.',          'Anything a pointer has to travel into.'],
  ],
  cases: [
    { id: 'filter', name: 'A filter',
      when: 'The most common one: a few controls and an apply. It has a footer because a filter has a moment where you are done with it.',
      demo:
        `<div class="spy-popover">` +
        `<h4 class="spy-popover-title">Networks</h4>` +
        `<div class="spy-checkgroup">` +
        labelled(cb(' data-checked'), 'Meta') +
        labelled(cb(' data-checked'), 'TikTok') +
        labelled(cb(''), 'YouTube') +
        `</div>` +
        `<div class="spy-popover-foot">` +
        `<button type="button" class="spy-btn" data-variant="ghost" data-size="sm">Reset</button>` +
        `<button type="button" class="spy-btn" data-variant="brand" data-size="sm">Apply</button>` +
        `</div></div>` },
    { id: 'explainer', name: 'An explainer',
      when: 'Text and nothing else. No footer — there is nothing to be done with it, so an apply button would be a button that only closes things.',
      demo:
        `<div class="spy-popover">` +
        `<h4 class="spy-popover-title">How the score works</h4>` +
        `<p class="spy-body-s spy-text-secondary" style="margin:0">Each creative is compared with what is already running in the category, on spend, run length and how often it is refreshed.</p>` +
        `</div>` },
  ],
});

C.push({
  id: 'drawer',
  name: 'Drawer',
  base: '.spy-drawer',
  lede: 'The detail beside the list, not over it. It has its own scroll, so the list behind it keeps its position — which is the reason to use one instead of a modal.',
  notes: [
    'The bottom sheet is this component with <code>data-side="bottom"</code>, not a separate thing: on a phone the side panel <em>is</em> the sheet.',
    'A drawer does not take the screen hostage. If the answer cannot be postponed, the component is a modal.',
  ],
  cases: [
    { id: 'side', name: 'Side',
      when: 'Head, a scrolling body, and a foot that stays put. The foot is where the action lives, so it does not scroll away.',
      noCode: true,
      demo:
        `<div style="position:relative;height:260px;width:100%;overflow:hidden;border-radius:var(--hf-radius-300)">` +
        `<div class="spy-drawer" data-side="end" style="position:absolute;width:300px">` +
        `<div class="spy-drawer-head">` +
        `<h3 class="spy-drawer-title">Creative 4182</h3>` +
        `<button type="button" class="spy-btn" data-variant="ghost" data-size="xs" data-icon-only aria-label="Close">${ic('close')}</button>` +
        `</div>` +
        `<div class="spy-drawer-body spy-scroll">` +
        `<p class="spy-body-s spy-text-secondary" style="margin:0 0 12px">Ran 14 days across Meta and TikTok. Scored 81 — the second highest in its set.</p>` +
        `<p class="spy-body-s spy-text-secondary" style="margin:0">Refreshed twice, both times on the headline rather than the image.</p>` +
        `</div>` +
        `<div class="spy-drawer-foot">` +
        `<button type="button" class="spy-btn" data-variant="ghost" data-size="sm">Export</button>` +
        `<button type="button" class="spy-btn" data-variant="brand" data-size="sm">Save to set</button>` +
        `</div></div></div>` },
    { id: 'bottom', name: 'Bottom sheet',
      when: 'The same component on a phone. The grip is the one part a sheet has and a side panel does not.',
      noCode: true,
      demo:
        `<div style="position:relative;height:200px;width:100%;max-width:360px;overflow:hidden;border-radius:var(--hf-radius-300)">` +
        `<div class="spy-drawer" data-side="bottom" style="position:absolute">` +
        `<span class="spy-drawer-grip"></span>` +
        `<div class="spy-drawer-body spy-scroll" style="padding-top:0">` +
        `<h3 class="spy-drawer-title" style="margin-bottom:8px">Filters</h3>` +
        `<div class="spy-checkgroup">` +
        labelled(cb(' data-checked'), 'Meta') + labelled(cb(''), 'TikTok') +
        `</div></div></div></div>` },
  ],
  api: { props: [['data-side', 'start · end · bottom', 'end']] },
});

C.push({
  id: 'carousel',
  name: 'Carousel',
  base: '.spy-carousel',
  lede: 'A set of creatives you look through. A grid is the index; this is how you actually look at them. Scroll snap does the work, so it keeps working with a trackpad, a touch screen and the keyboard without any of them being a special case.',
  cases: [
    { id: 'default', name: 'Default',
      when: 'The item width is one custom property, so a row of 4:5 creatives and a row of 16:9 ones do not need two components.',
      demo:
        `<div class="spy-carousel" style="--spy-carousel-item:160px">` +
        `<div class="spy-carousel-track spy-scroll">` +
        ['1/1', '4/5', '9/16', '1/1', '4/5'].map(r =>
          `<div class="spy-carousel-item"><div class="spy-media" data-radius style="--spy-media-ratio:${r}">` +
          `<div class="doc-media-fake"></div></div></div>`).join('') +
        `</div>` +
        `<div class="spy-carousel-controls">` +
        `<div class="spy-carousel-dots">` +
        [1, 0, 0, 0].map(a => `<button type="button" class="spy-carousel-dot"${a ? ' data-active' : ''} aria-label="Go to slide"></button>`).join('') +
        `</div>` +
        `<div class="spy-row" style="gap:8px">` +
        `<button type="button" class="spy-btn" data-variant="ghost" data-size="sm" data-icon-only aria-label="Previous">${ic('chevron-left')}</button>` +
        `<button type="button" class="spy-btn" data-variant="ghost" data-size="sm" data-icon-only aria-label="Next">${ic('chevron-right')}</button>` +
        `</div></div></div>` },
  ],
  api: {
    props: [['--spy-carousel-item', 'any width', '14rem']],
    parts: [['.spy-carousel-dot', 'The active one widens rather than changing only colour, so it survives a colour-blind reading.']],
  },
});

C.push({
  id: 'tree',
  name: 'Tree',
  base: '.spy-tree',
  lede: 'The category taxonomy. A menu nests one level; a taxonomy does not. The guide line is drawn by the branch, so a collapsed branch has none.',
  cases: [
    { id: 'default', name: 'Default',
      when: 'Caret, icon, label, count. The count is the branch\'s total, which is what people open a branch to find out.',
      demo:
        `<div class="spy-tree">` +
        `<div class="spy-tree-item" data-open>` +
        `<button type="button" class="spy-tree-row" data-active>` +
        `<span class="spy-tree-caret">${ic('chevron-right', 'sm')}</span>${ic('folder')}` +
        `<span class="spy-tree-label">Footwear</span><span class="spy-tree-count">412</span></button>` +
        `<div class="spy-tree-children">` +
        `<div class="spy-tree-item" data-open>` +
        `<button type="button" class="spy-tree-row">` +
        `<span class="spy-tree-caret">${ic('chevron-right', 'sm')}</span>${ic('folder')}` +
        `<span class="spy-tree-label">Running</span><span class="spy-tree-count">208</span></button>` +
        `<div class="spy-tree-children">` +
        `<button type="button" class="spy-tree-row">${ic('image')}` +
        `<span class="spy-tree-label">Trail</span><span class="spy-tree-count">74</span></button>` +
        `<button type="button" class="spy-tree-row">${ic('image')}` +
        `<span class="spy-tree-label">Road</span><span class="spy-tree-count">134</span></button>` +
        `</div></div>` +
        `<div class="spy-tree-item">` +
        `<button type="button" class="spy-tree-row">` +
        `<span class="spy-tree-caret">${ic('chevron-right', 'sm')}</span>${ic('folder')}` +
        `<span class="spy-tree-label">Court</span><span class="spy-tree-count">96</span></button>` +
        `<div class="spy-tree-children"></div></div>` +
        `</div></div></div>` },
  ],
  api: { props: [['data-open', 'present — on an item', '—'], ['data-active', 'present — on a row', '—']] },
});

C.push({
  id: 'banner',
  name: 'Banner',
  base: '.spy-banner',
  lede: '“You have used 180 of 200 scans.” A quota warning is not a toast: it does not dismiss itself and it is not an event. It spans the app, above everything, and it is the one component allowed to.',
  purpose: [
    ['Banner', 'A condition of the account or the app, which stays true until something changes.', 'The result of an action.'],
    ['Alert',  'A condition of the page you are on.',                                              'Something that affects every page.'],
    ['Toast',  'The result of an action you just took.',                                           'Anything that must be acted on.'],
  ],
  cases: [
    { id: 'status', name: 'Status',
      when: 'Four tones, and they mean what they mean everywhere else. Brand is for an offer, not for an error.',
      stack: true,
      demo: [
        ['', 'info', 'Scans run nightly. The next one starts at 02:00.'],
        ['warning', 'warning', 'You have used 180 of 200 scans this month.'],
        ['error', 'error', 'Billing failed. Scans pause in three days.'],
        ['brand', 'sparkle', 'Ten competitors on Pro, instead of one.'],
      ].map(([st, icon, text]) =>
        `<div class="spy-banner"${st ? ` data-status="${st}"` : ''}>${ic(icon)}` +
        `<span class="spy-banner-text">${text}</span>` +
        `<button type="button" class="spy-btn" data-variant="ghost" data-size="xs">Manage</button></div>`).join('') },
  ],
  api: { props: [['data-status', 'warning · error · brand', '— (neutral)']] },
});

C.push({
  id: 'scroll',
  name: 'Scroll area & Splitter',
  base: '.spy-scroll · .spy-split',
  lede: 'Two pieces of app shell. The scrollbar was the one piece of chrome the system did not control; the splitter is what a list-beside-detail layout needs to stop assuming fixed widths.',
  cases: [
    { id: 'scroll', name: 'Scroll area',
      when: 'Put it on anything that scrolls inside a panel. It also contains overscroll, so reaching the end of a list does not start scrolling the page behind it.',
      demo:
        `<div class="spy-scroll" style="height:148px;max-width:420px;padding:8px;border-radius:var(--hf-radius-300);background:var(--hf-color-background-secondary)">` +
        ['Northwind', 'Lumen', 'Parcel', 'Bevel', 'Corestack', 'Halyard', 'Merrow'].map(n =>
          `<div class="spy-list-item"><span class="spy-list-item-text"><span>${n}</span></span></div>`).join('') +
        `</div>` },
    { id: 'split', name: 'Splitter',
      when: 'The handle is one pixel of line in a twelve-pixel hit target, because a divider you can grab and a divider you can see are two different sizes.',
      demo:
        `<div class="spy-split" style="height:120px;background:var(--hf-color-background-secondary);border-radius:var(--hf-radius-300);overflow:hidden">` +
        `<div style="flex:0 0 40%;padding:12px" class="spy-caption-l spy-text-secondary">List</div>` +
        `<button type="button" class="spy-split-handle" aria-label="Resize"></button>` +
        `<div style="flex:1 1 auto;padding:12px" class="spy-caption-l spy-text-secondary">Detail</div>` +
        `</div>` },
  ],
  api: { props: [['data-orientation', 'vertical — on the splitter', '— (horizontal)']] },
});
})();
