/* ============================================================================
   Documentation shell — masthead, level nav, in-page nav, footer.
   Rendered by script so the five pages of the system cannot drift apart.
   Runs synchronously at the end of <body>, before app.js.
   ========================================================================= */
(() => {
'use strict';
const LEVELS = [
  ['index.html',        'Overview',    'What this is, how it was built, what it covers'],
  ['foundations.html',  'Foundations', 'Tokens and the rules that govern them'],
  ['components.html',   'Components',  'Single-purpose primitives, every state'],
  ['patterns.html',     'Patterns',    'Composed solutions to spyy’s recurring problems'],
  ['templates.html',    'Templates',   'Whole screens, one per step of the flow'],
];
const here = (location.pathname.split('/').pop() || 'index.html');

const masthead = document.createElement('header');
masthead.className = 'doc-masthead';
masthead.innerHTML = `
  <div class="spy-container doc-masthead-inner">
    <a class="doc-brand" href="index.html">
      <span class="spy-nav-wordmark">Spyy</span>
      <span class="spy-badge" data-variant="lime"><span class="spy-badge-surface"><span class="spy-badge-text">DS v1</span></span></span>
    </a>
    <nav class="doc-levels" aria-label="Design system sections">
      ${LEVELS.map(([href, label]) =>
        `<a class="doc-level" href="${href}"${href === here ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
    </nav>
    <div class="doc-masthead-actions">
      <div class="spy-tabs" data-variant="segment" style="width:auto">
        <div class="spy-tabs-list" role="tablist" id="theme-switch">
          <button class="spy-tabs-tab" data-theme-set="dark" data-active role="tab" aria-label="Dark theme">
            <span class="spy-tabs-tab-content"><svg class="spy-icon" data-size="sm"><use href="#i-moon"/></svg>Dark</span>
          </button>
          <button class="spy-tabs-tab" data-theme-set="light" role="tab" aria-label="Light theme">
            <span class="spy-tabs-tab-content"><svg class="spy-icon" data-size="sm"><use href="#i-sun"/></svg>Light</span>
          </button>
        </div>
      </div>
    </div>
  </div>`;
document.body.insertBefore(masthead, document.body.firstChild.nextSibling);

const foot = document.createElement('footer');
foot.className = 'doc-footer';
foot.innerHTML = `
  <div class="spy-container doc-footer-inner">
    <p class="spy-caption-l spy-text-secondary">
      Spyy Design System · reverse-engineered from higgsfield.ai, then fitted to the spyy brief.
      <code>tokens.css</code> + <code>components.css</code> + <code>patterns.css</code> are standalone.
      Provenance in <code>EVIDENCE.md</code>, scope in <code>GAPS.md</code>.
    </p>
    <nav class="doc-footer-nav">
      ${LEVELS.map(([href, label, desc]) =>
        `<a href="${href}"><strong>${label}</strong><span>${desc}</span></a>`).join('')}
    </nav>
  </div>`;
document.body.appendChild(foot);
})();
