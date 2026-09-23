/* Alert, Toast, Progress, Skeleton, Empty, Tooltip, Modal — one axis per case. */
(function () {
'use strict';
const ic = (n, s) => `<svg class="spy-icon"${s ? ` data-size="${s}"` : ''}><use href="#i-${n}"/></svg>`;
const C = (window.SPY_CASES = window.SPY_CASES || []);

C.push({
  id: 'feedback',
  name: 'Alert & Toast',
  base: '.spy-alert · .spy-toast',
  lede: 'Two ways to say something happened, and the difference is whether it stays. An alert is part of the page and is still there when you come back; a toast is an event and is gone in six seconds.',
  purpose: [
    ['Alert',  'A condition of the page — a plan limit, a setting that changes what you are looking at.', 'Confirming something you just did.'],
    ['Toast',  'The result of an action you just took.',                                                  'Anything the user must act on — it will disappear.'],
  ],
  notes: [
    'The toast surface does <strong>not</strong> flip with the theme, so its ink cannot either. Pointing toast text at a theme-flipping token is how it became white-on-white in light mode; the ink is pinned to the constant palette instead.',
    'Four statuses, and they mean the same thing on both components: info is state, success is done, warning needs attention, error stopped.',
  ],
  cases: [
    { id: 'alert', name: 'Alert',
      when: 'Inline, above the thing it is about. The icon is part of the markup because the status colour alone is not an accessible signal.',
      stack: true,
      demo: [
        ['info', 'info', 'Scans run nightly. Results appear the next morning.'],
        ['success', 'success', 'Four competitors connected.'],
        ['warning', 'warning', 'You have used 180 of 200 scans this month.'],
        ['error', 'error', 'Meta rejected the connection. Reconnect the account.'],
      ].map(([st, icon, text]) => `<div class="spy-alert" data-status="${st}">${ic(icon)}<span>${text}</span></div>`).join('') },

    { id: 'toast', name: 'Toast',
      when: 'One line, one optional action, one dismiss. If it needs two lines of explanation it is not a toast.',
      stack: true,
      demo:
        `<div class="spy-toast">` +
        `<span class="spy-toast-icon" data-status="success">${ic('success', 'md')}</span>` +
        `<span class="spy-toast-text"><span class="spy-toast-title">Scan finished</span></span>` +
        `<button class="spy-toast-action">View</button>` +
        `<button class="spy-toast-close" aria-label="Dismiss">${ic('close', 'sm')}</button>` +
        `</div>` },

    { id: 'toast-description', name: 'Toast with a description',
      when: 'A second line, for a failure that needs one sentence of why. Still not a place for a paragraph.',
      demo:
        `<div class="spy-toast">` +
        `<span class="spy-toast-icon" data-status="error">${ic('error', 'md')}</span>` +
        `<span class="spy-toast-text"><span class="spy-toast-title">Scan failed</span>` +
        `<span class="spy-toast-description">The network timed out. Nothing was charged.</span></span>` +
        `<button class="spy-toast-action">Retry</button>` +
        `<button class="spy-toast-close" aria-label="Dismiss">${ic('close', 'sm')}</button>` +
        `</div>` },

    { id: 'toast-stacked', name: 'Toast, glass',
      when: 'The stacked variant sits over media, so it is glass rather than solid — and it re-points its own ink, because the surface under it is no longer constant.',
      surface: 'landing',
      demo:
        `<div class="spy-toast" data-variant="stacked">` +
        `<span class="spy-toast-icon" data-status="success">${ic('success', 'md')}</span>` +
        `<span class="spy-toast-text"><span class="spy-toast-title">Creative saved</span></span>` +
        `<button class="spy-toast-close" aria-label="Dismiss">${ic('close', 'sm')}</button>` +
        `</div>` },
  ],
  api: {
    props: [
      ['data-status', 'info · success · warning · error', 'info'],
      ['data-variant', 'stacked — toast only', '—'],
    ],
    parts: [
      ['.spy-toast-icon', 'Takes the status. The rest of the toast does not.'],
      ['.spy-toast-action', 'One verb. Optional.'],
      ['.spy-toast-close', 'Always present — a toast you cannot dismiss is an alert.'],
    ],
  },
});

C.push({
  id: 'progress',
  name: 'Progress & Skeleton',
  base: '.spy-progress · .spy-skeleton · .spy-loader',
  lede: 'Three ways to say "not yet", and the right one depends on whether you know how long. Progress knows; a loader does not; a skeleton knows the <em>shape</em> of what is coming.',
  purpose: [
    ['Progress',  'You know the fraction — 68% of a scan, 4 of 9 networks.',           'An unknown wait.'],
    ['Skeleton',  'You know the layout that is about to appear.',                       'A wait shorter than about 300ms — it will only flash.'],
    ['Loader',    'You know nothing except that it is working.',                        'Anything that takes longer than a few seconds with no other feedback.'],
  ],
  cases: [
    { id: 'progress', name: 'Progress',
      when: 'A determinate bar. The fill width is the value; there is no label built in, so put the number beside it.',
      stack: true,
      demo: `<div class="spy-progress"><div class="spy-progress-fill" style="width:68%"></div></div>` },
    { id: 'indeterminate', name: 'Indeterminate',
      when: 'Working, fraction unknown. It is the same bar — do not swap in a spinner halfway through.',
      demo: `<div class="spy-progress" data-indeterminate><div class="spy-progress-fill"></div></div>` },
    { id: 'segments', name: 'Segments',
      when: 'A known number of discrete steps — nine networks, four creatives. Each segment fills independently.',
      demo:
        `<div class="spy-progress-steps">` +
        [100, 100, 40, 0].map(w => `<div class="spy-progress-segment"><div class="spy-progress-fill" style="width:${w}%"></div></div>`).join('') +
        `</div>` },
    { id: 'skeleton', name: 'Skeleton',
      when: 'The shape of the thing that is loading. Three shapes: a block, a line of text, and a circle for an avatar.',
      stack: true,
      demo:
        `<div class="spy-skeleton" data-shape="circle" style="width:32px;height:32px"></div>` +
        `<div class="spy-skeleton" data-shape="text" style="width:60%"></div>` +
        `<div class="spy-skeleton" data-shape="text" style="width:40%"></div>` +
        `<div class="spy-skeleton" style="width:100%;height:96px"></div>` },
    { id: 'loader', name: 'Loader',
      when: 'For a wait with no shape and no fraction — inside a button, a menu, a panel that has not decided what it contains.',
      demo:
        `<span class="spy-loader"><svg class="spy-loader-spinner" viewBox="0 0 32 32" fill="none">` +
        `<circle cx="16" cy="16" r="13" stroke="currentColor" stroke-opacity=".2" stroke-width="3"/>` +
        `<path d="M29 16A13 13 0 0 0 16 3" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>` +
        `</svg></span>` +
        `<span class="spy-loader-dots"><span class="spy-loader-dot"></span><span class="spy-loader-dot"></span><span class="spy-loader-dot"></span></span>` },
  ],
  api: {
    props: [
      ['data-indeterminate', 'present — progress only', '—'],
      ['data-shape', 'text · circle — skeleton only', '— (block)'],
    ],
  },
});

C.push({
  id: 'empty',
  name: 'Empty',
  base: '.spy-empty',
  lede: 'Nothing here yet, or nothing came back. Those are two different states and they should not look the same — an empty list is an invitation, a failed one is a problem.',
  cases: [
    { id: 'empty', name: 'Empty',
      when: 'Nothing yet. Say what will appear here, and give the one action that starts it.',
      demo:
        `<div class="spy-empty">${ic('folder')}` +
        `<h4 class="spy-empty-title">No scans yet</h4>` +
        `<p class="spy-empty-description">Connect a network and pick a competitor. The first results land overnight.</p>` +
        `<button class="spy-btn" data-variant="brand" data-size="sm">Connect a network</button>` +
        `</div>` },
    { id: 'error', name: 'Failed',
      when: 'Something went wrong. Say what, say whether anything was lost, and offer the retry.',
      demo:
        `<div class="spy-empty" data-status="error">${ic('warning')}` +
        `<h4 class="spy-empty-title">Couldn’t load your scans</h4>` +
        `<p class="spy-empty-description">The request timed out. Nothing was lost — try again in a moment.</p>` +
        `<button class="spy-btn" data-variant="outline" data-size="sm">${ic('refresh')}Retry</button>` +
        `</div>` },
  ],
  api: { props: [['data-status', 'error', '—']] },
});

C.push({
  id: 'overlay',
  name: 'Tooltip & Modal',
  base: '.spy-tooltip · .spy-modal',
  lede: 'Two overlays with opposite manners. A tooltip explains without being asked and takes nothing; a modal stops everything and demands an answer.',
  notes: [
    'A modal is the only component that takes the whole screen’s attention. If the answer can be undone, it does not need one.',
    'Both are panels — 16px radius. The modal used to be 24px, which made it the single roundest thing in the product for no reason anyone could state.',
  ],
  cases: [
    { id: 'tooltip', name: 'Tooltip',
      when: 'A short label for a control that has no room for one. Never put an action in it, and never put anything in it that is only available there.',
      demo:
        `<span class="doc-tip-wrap">` +
        `<button class="spy-btn" data-variant="ghost" data-icon-only aria-label="Export">${ic('download')}</button>` +
        `<span class="spy-tooltip">Export as CSV<span class="spy-tooltip-arrow" data-side="top"></span></span>` +
        `</span>` },
    { id: 'modal', name: 'Modal',
      when: 'A header with a close, one paragraph, and the actions last with the destructive one on the right. Three sizes; <code>sm</code> is a confirmation and is the one you will use most.',
      demo:
        `<div class="spy-modal" data-size="sm">` +
        `<div class="spy-modal-header">` +
        `<h3 class="spy-modal-title">Delete this scan?</h3>` +
        `<div class="spy-modal-actions">` +
        `<button class="spy-btn" data-variant="ghost" data-size="xs" data-icon-only aria-label="Close">${ic('close')}</button>` +
        `</div></div>` +
        `<p class="spy-modal-description">Its results and every saved creative go with it. This cannot be undone.</p>` +
        `<div class="spy-modal-actions" data-full>` +
        `<button class="spy-btn" data-variant="ghost" data-size="sm">Cancel</button>` +
        `<button class="spy-btn" data-variant="danger" data-size="sm">Delete scan</button>` +
        `</div></div>` },
  ],
  api: {
    props: [
      ['data-size', 'sm · md · lg — modal', 'md'],
      ['data-side', 'top · bottom · left · right — tooltip arrow', 'top'],
    ],
    parts: [
      ['.spy-modal-backdrop', 'The scrim. A sibling of the modal, not a parent.'],
      ['.spy-modal-actions', 'The button row. <code>data-full</code> spans it across the footer.'],
      ['.spy-tooltip-arrow', 'Points back at the trigger. Takes <code>data-side</code>.'],
    ],
  },
});
})();
