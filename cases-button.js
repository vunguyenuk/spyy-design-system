/* Button — one axis per case. */
(function () {
'use strict';
const ic = (n, s) => `<svg class="spy-icon"${s ? ` data-size="${s}"` : ''}><use href="#i-${n}"/></svg>`;

window.SPY_CASES = window.SPY_CASES || [];
window.SPY_CASES.push({
  id: 'button',
  name: 'Button',
  base: '.spy-btn',
  lede: 'One base component, ten variants — each with one job. Pick by the job, not by the look.',
  purpose: [
    ['brand',             'The one action the screen exists for.', 'More than one per view.'],
    ['secondary',         'An action of equal weight beside the primary — Cancel next to Save.', 'Anything you want people to notice first.'],
    ['tertiary',          'A filled but quiet action; rows of icon buttons.', 'Destructive actions.'],
    ['outline',           'An alternative that needs an edge but no weight — over media, or on a busy surface.', 'Dense toolbars; the border adds noise.'],
    ['ghost',             'The lowest emphasis. Toolbars, icon-only, anything repeated many times.', 'A primary action.'],
    ['danger',            'Destructive, and the loud action on screen — the confirm inside a delete dialog.', 'The trigger that opens that dialog.'],
    ['danger-quiet',      'Destructive, sitting among neutral actions — a delete in a row of icon buttons.', 'A confirmation step.'],
    ['landing-primary',   'The hero CTA on a marketing page.', 'Anywhere inside the product.'],
    ['landing-secondary', 'The second CTA beside it.', 'Inside the product.'],
    ['landing-ghost',     'A quiet marketing CTA, usually over an image.', 'Inside the product.'],
  ],
  notes: [
    '<code>display: inline-grid</code> with <code>grid-auto-flow: column</code> — not flex. A lone label centres optically without line-height correction.',
    'A <strong>2px transparent border is always reserved</strong>, so switching to the outline variant never moves anything.',
    'Press feedback on filled variants is <code>filter: brightness()</code> — 0.8 on hover, 0.6 on press — so a variant needs one colour token, not three.',
  ],
  cases: [
    { id: 'label', name: 'Label',
      when: 'The default. One verb and its object — <em>Run scan</em>, not <em>Click here to run a scan</em>. No size and no variant gives you <code>md</code> and <code>brand</code>.',
      demo: `<button class="spy-btn" data-variant="brand">Run scan</button>` },

    { id: 'variant', name: 'Variant',
      when: 'Seven product variants. The table above says which; this says what they look like side by side, which is the only way to judge whether two are too close.',
      demo:
        `<button class="spy-btn" data-variant="brand">Run scan</button>` +
        `<button class="spy-btn" data-variant="secondary">Save draft</button>` +
        `<button class="spy-btn" data-variant="tertiary">Duplicate</button>` +
        `<button class="spy-btn" data-variant="outline">Compare</button>` +
        `<button class="spy-btn" data-variant="ghost">Cancel</button>` +
        `<button class="spy-btn" data-variant="danger">Delete scan</button>` +
        `<button class="spy-btn" data-variant="danger-quiet">Remove</button>` },

    { id: 'size', name: 'Size',
      when: 'Five steps — 24 / 32 / 40 / 48 / 56. The radius does not change with them: a large button is a larger button, not a rounder one.',
      demo:
        `<button class="spy-btn" data-variant="brand" data-size="xxs">xxs</button>` +
        `<button class="spy-btn" data-variant="brand" data-size="xs">xs</button>` +
        `<button class="spy-btn" data-variant="brand" data-size="sm">sm</button>` +
        `<button class="spy-btn" data-variant="brand" data-size="md">md</button>` +
        `<button class="spy-btn" data-variant="brand" data-size="lg">lg</button>` },

    { id: 'density', name: 'App density',
      when: 'The product shell runs tighter than the marketing ladder: the same five names at 16 / 24 / 32 / 40 / 48, semibold at every step. Opt in with <code>data-scale="app"</code> — it changes height and type, never the variant.',
      demo:
        `<button class="spy-btn" data-scale="app" data-variant="brand" data-size="xxs">xxs</button>` +
        `<button class="spy-btn" data-scale="app" data-variant="brand" data-size="xs">xs</button>` +
        `<button class="spy-btn" data-scale="app" data-variant="brand" data-size="sm">sm</button>` +
        `<button class="spy-btn" data-scale="app" data-variant="brand" data-size="md">md</button>` +
        `<button class="spy-btn" data-scale="app" data-variant="brand" data-size="lg">lg</button>` },

    { id: 'icon', name: 'Icon',
      when: 'An icon goes in as a child, before or after the label. It sizes itself from the button — there is no icon size to set.',
      demo:
        `<button class="spy-btn" data-variant="brand">${ic('sparkle')}Generate</button>` +
        `<button class="spy-btn" data-variant="secondary">Continue${ic('arrow-right')}</button>` },

    { id: 'icon-only', name: 'Icon only',
      when: 'Drop the label and add <code>data-icon-only</code>, which removes the inline padding so the button is square. It still needs an accessible name — the icon is not one.',
      demo:
        `<button class="spy-btn" data-variant="ghost" data-icon-only aria-label="More">${ic('more')}</button>` +
        `<button class="spy-btn" data-variant="tertiary" data-icon-only aria-label="Grid view">${ic('grid')}</button>` +
        `<button class="spy-btn" data-variant="danger-quiet" data-icon-only aria-label="Delete">${ic('trash')}</button>` },

    { id: 'full-width', name: 'Full width',
      when: 'For a button that owns a column — the submit at the end of a form, the CTA at the bottom of a plan card. Anywhere else it reads as a banner.',
      demo: `<button class="spy-btn" data-variant="brand" data-full-width>Start free</button>` },

    { id: 'loading', name: 'Loading',
      when: 'The spinner takes the leading icon slot and the label stays readable — a control that erases its own words while it works tells you nothing about what it is doing. A button with no leading icon does grow by one icon and one gap. <code>aria-busy</code> is what the CSS reads, and what a screen reader reads too.',
      demo:
        `<button class="spy-btn" data-variant="brand" aria-busy="true">Scanning</button>` +
        `<button class="spy-btn" data-variant="outline" aria-busy="true">Scanning</button>` },

    { id: 'disabled', name: 'Disabled',
      when: 'Use the real <code>disabled</code> attribute, not a class — the class only paints it. A disabled button must never be the only explanation for why someone cannot proceed.',
      demo:
        `<button class="spy-btn" data-variant="brand" disabled>Run scan</button>` +
        `<button class="spy-btn" data-variant="outline" disabled>Compare</button>` +
        `<button class="spy-btn" data-variant="ghost" disabled>Cancel</button>` },

    { id: 'states', name: 'States',
      when: 'Hover, press and focus are the component\'s own — there is no markup to write, which is why this case has no code block. Focus is drawn as a 2px page-coloured gap inside a 4px brand ring, plus a transparent outline so it survives forced-colors mode. Danger swaps the ring to the error <em>glow</em>, not the error fill.',
      noCode: true,
      stack: true,
      demo: ['default', 'hover', 'active', 'focus'].map(st =>
        `<div class="doc-state-row" data-force="${st}">` +
        `<span class="doc-state-label">${st}</span>` +
        `<button class="spy-btn" data-variant="brand">Run scan</button>` +
        `<button class="spy-btn" data-variant="outline">Compare</button>` +
        `<button class="spy-btn" data-variant="danger">Delete scan</button>` +
        `</div>`).join('') },

    { id: 'group', name: 'Group',
      when: 'Two or more buttons that act on the same thing. <code>attached</code> joins them into one control; the default spaces them and keeps each its own.',
      stack: true,
      demo:
        `<div class="spy-btn-group" data-variant="attached">` +
        `<button class="spy-btn" data-variant="tertiary" data-size="sm">Day</button>` +
        `<button class="spy-btn" data-variant="tertiary" data-size="sm">Week</button>` +
        `<button class="spy-btn" data-variant="tertiary" data-size="sm">Month</button>` +
        `</div>` +
        `<div class="spy-btn-group">` +
        `<button class="spy-btn" data-variant="brand" data-size="sm">Save</button>` +
        `<button class="spy-btn" data-variant="ghost" data-size="sm">Cancel</button>` +
        `</div>` },

    { id: 'landing', name: 'On a landing page',
      when: 'Three marketing variants, sized <code>lg</code> and used in pairs. They belong to <code>landing.css</code>: a product screen that reaches for one is a product screen that wants to look like an ad.',
      surface: 'landing',
      demo:
        `<button class="spy-btn" data-variant="landing-primary" data-size="lg">Start free</button>` +
        `<button class="spy-btn" data-variant="landing-secondary" data-size="lg">Book a walkthrough</button>` +
        `<button class="spy-btn" data-variant="landing-ghost" data-size="lg">Watch the film</button>` },
  ],
  api: {
    props: [
      ['data-variant', 'brand · secondary · tertiary · outline · ghost · danger · danger-quiet · landing-primary · landing-secondary · landing-ghost', 'brand'],
      ['data-size', 'xxs · xs · sm · md · lg', 'md'],
      ['data-scale', 'app', '—'],
      ['data-icon-only', 'present', '—'],
      ['data-full-width', 'present', '—'],
      ['aria-busy', 'true', '—'],
      ['disabled', 'present', '—'],
    ],
    parts: [
      ['.spy-btn-group', 'Two or more buttons acting on one thing. <code>data-variant="attached"</code> joins them.'],
      ['.spy-icon', 'Any icon child. Sizes itself from the button.'],
    ],
    states: [
      ['hover', '<code>filter: brightness(0.8)</code> on filled variants; a fill change on the quiet ones'],
      ['active', '<code>filter: brightness(0.6)</code>, and the landing primary drops 2px'],
      ['focus-visible', '2px page-coloured gap inside a 4px brand ring, via <code>box-shadow</code>'],
      ['disabled', 'opacity on the primary ladder; a flat fill on <code>data-scale="app"</code>'],
      ['aria-busy', 'spinner in the icon slot, label unchanged'],
    ],
  },
});
})();
