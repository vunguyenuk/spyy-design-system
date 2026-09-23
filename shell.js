/* ============================================================================
   Documentation shell — top bar, persistent left rail, content column, footer.
   Rendered by script so the five pages of the system cannot drift apart, and
   so every section of every level is reachable from every page without going
   back up a level first.

   Runs synchronously at the end of <body>, before app.js. Nothing in this file
   is part of the design system; it styles the reference site that displays it.
   ========================================================================= */
(() => {
'use strict';

/* The whole directory, in one place. Each page contributes its sections, so
   the rail is identical on every page and only the active item moves. Keep in
   sync with the data-nav attributes on each page's <section> elements. */
const TREE = [
  ['index.html', 'Overview', 'What this is, how it was built, what it covers',
    [['levels','Levels'], ['product','The product'], ['decisions','Decisions'], ['using','Using it'], ['status','Status']]],
  ['foundations.html', 'Foundations', 'Tokens and the rules that govern them',
    [['color','Color'], ['typography','Type'], ['space','Space'], ['radius','Radius'], ['border','Border'], ['elevation','Elevation'], ['icons','Icons'], ['motion','Motion'], ['layout','Layout']]],
  ['components.html', 'Components', 'Single-purpose primitives, every state',
    [['button','Button'], ['field','Field'], ['select','Select'], ['controls','Controls'], ['chip','Chip'], ['tabs','Tabs'], ['overlay','Overlay'], ['surface','Surface'], ['feedback','Feedback'], ['data','Data'], ['navigation','Navigation'], ['api','States &amp; props']]],
  ['patterns.html', 'Patterns', 'Composed solutions to spyy’s recurring problems',
    [['scoring','Scoring'], ['confidence','Confidence'], ['async','Async scan'], ['attribution','Attribution'], ['pickers','Pickers'], ['results','Results'], ['editor','Editor'], ['account','Account'], ['composer','Composer'], ['states','States &amp; props']]],
  ['templates.html', 'Templates', 'Whole screens, one per step of the flow',
    [['t1','1 · Start'], ['t2','2 · Resolve'], ['t3','3 · Scanning'], ['t4','4 · Creative'], ['coverage','Coverage']]],
];

const here = (location.pathname.split('/').pop() || 'index.html');

/* The current page's sections are read off the page itself rather than trusted
   from the table above. The components page now builds its sections from data,
   so a hand-maintained copy of their names in this file would be wrong the
   first time one was added. Other pages fall back to the table, which is still
   needed for the pages you are not on. */
(() => {
  const live = [...document.querySelectorAll('[data-nav]')]
    .map(el => [el.id, el.getAttribute('data-nav')])
    .filter(([id]) => id);
  if (!live.length) return;
  const row = TREE.find(([href]) => href === here);
  if (row) row[3] = live;
})();

/* ---------------------------------------------------------------- top bar */
const top = document.createElement('header');
top.className = 'doc-topbar';
top.innerHTML = `
  <div class="doc-topbar-inner">
    <a class="doc-brand" href="index.html">
      <span class="spy-nav-wordmark">Spyy</span>
      <span class="spy-badge" data-variant="lime"><span class="spy-badge-surface"><span class="spy-badge-text">DS v1</span></span></span>
    </a>
    <button class="doc-railtoggle spy-btn" data-variant="ghost" data-size="sm" aria-expanded="false" aria-controls="doc-rail">
      <svg class="spy-icon" data-size="sm"><use href="#i-menu"/></svg><span>Contents</span>
    </button>
    <p class="doc-where"><span class="doc-where-sep">/</span><strong>${(TREE.find(t => t[0] === here) || TREE[0])[1]}</strong></p>
    <div class="doc-search spy-field" data-size="sm">
      <div class="spy-field-control" data-size="sm">
        <svg class="spy-icon" data-size="sm"><use href="#i-search"/></svg>
        <input class="spy-field-input" id="doc-filter" type="search" placeholder="Filter the system" aria-label="Filter the system" autocomplete="off">
      </div>
    </div>
    <div class="doc-topbar-actions">
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

/* -------------------------------------------------------------------- rail */
const rail = document.createElement('aside');
rail.className = 'doc-rail';
rail.id = 'doc-rail';
rail.setAttribute('aria-label', 'Design system contents');
rail.innerHTML = `
  <nav class="doc-rail-inner">
    ${TREE.map(([href, label, , secs], i) => `
      <div class="doc-rail-group"${href === here ? ' data-current' : ''}>
        <a class="doc-rail-level" href="${href}"${href === here ? ' aria-current="page"' : ''}>
          <span class="doc-rail-index">${String(i).padStart(2, '0')}</span>${label}
        </a>
        <ul class="doc-rail-list">
          ${secs.map(([id, name]) =>
            `<li><a class="doc-rail-item" href="${href === here ? '' : href}#${id}" data-sec="${id}" data-page="${href}">${name}</a></li>`).join('')}
        </ul>
      </div>`).join('')}
    <div class="doc-rail-group doc-rail-meta">
      <span class="doc-rail-level" aria-hidden="true">Reference</span>
      <ul class="doc-rail-list">
        <li><a class="doc-rail-item" href="README.md">README</a></li>
        <li><a class="doc-rail-item" href="EVIDENCE.md">Evidence</a></li>
        <li><a class="doc-rail-item" href="GAPS.md">Gaps</a></li>
      </ul>
    </div>
    <p class="doc-rail-empty" hidden>No section matches that.</p>
  </nav>`;

/* ------------------------------------------------------ assemble the shell */
const shell = document.createElement('div');
shell.className = 'doc-shell';
const col = document.createElement('div');
col.className = 'doc-col';

const lede = document.querySelector('.doc-lede');
const main = document.querySelector('.doc-main');
document.querySelectorAll('.doc-nav').forEach(n => n.remove());   // replaced by the rail

document.body.insertBefore(top, document.body.firstChild);
document.body.insertBefore(shell, top.nextSibling);
shell.appendChild(rail);
shell.appendChild(col);
if (lede) col.appendChild(lede);
if (main) col.appendChild(main);

/* ------------------------------------------------------------------ footer */
const foot = document.createElement('footer');
foot.className = 'doc-footer';
foot.innerHTML = `
  <div class="doc-footer-inner">
    <p class="spy-caption-l spy-text-secondary">
      Spyy Design System · audited from shipped products, then fitted to the spyy brief.
      <code>tokens.css</code> + <code>components.css</code> + <code>patterns.css</code> are standalone.
      Provenance in <code>EVIDENCE.md</code>, scope in <code>GAPS.md</code>.
    </p>
    <nav class="doc-footer-nav">
      ${TREE.map(([href, label, desc]) =>
        `<a href="${href}"><strong>${label}</strong><span>${desc}</span></a>`).join('')}
    </nav>
  </div>`;
col.appendChild(foot);

/* ------------------------------------------------------------ rail filter */
const filter = document.getElementById('doc-filter');
const empty = rail.querySelector('.doc-rail-empty');
if (filter) {
  filter.addEventListener('input', () => {
    const q = filter.value.trim().toLowerCase();
    let hits = 0;
    rail.querySelectorAll('.doc-rail-group').forEach(g => {
      if (g.classList.contains('doc-rail-meta')) { g.hidden = !!q; return; }
      const level = g.querySelector('.doc-rail-level').textContent.toLowerCase();
      let shown = 0;
      g.querySelectorAll('.doc-rail-item').forEach(a => {
        const hit = !q || a.textContent.toLowerCase().includes(q) || level.includes(q);
        a.parentElement.hidden = !hit;
        if (hit) shown++;
      });
      g.hidden = shown === 0;
      hits += shown;
    });
    empty.hidden = hits > 0;
  });
  // "/" focuses the filter, the way every docs site does it
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); filter.focus();
    }
    if (e.key === 'Escape' && document.activeElement === filter) {
      filter.value = ''; filter.dispatchEvent(new Event('input')); filter.blur();
    }
  });
}

/* ------------------------------------------------- rail drawer on a phone */
const toggle = top.querySelector('.doc-railtoggle');
const closeRail = () => { document.body.removeAttribute('data-rail-open'); toggle.setAttribute('aria-expanded', 'false'); };
toggle.addEventListener('click', () => {
  const open = document.body.toggleAttribute('data-rail-open');
  toggle.setAttribute('aria-expanded', String(open));
});
rail.addEventListener('click', e => { if (e.target.closest('a')) closeRail(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeRail(); });

/* --------------------------------------------------------------- scrollspy */
const items = [...rail.querySelectorAll(`.doc-rail-item[data-page="${here}"]`)];
const secEls = items.map(a => document.getElementById(a.dataset.sec)).filter(Boolean);
if (secEls.length) {
  const mark = id => items.forEach(a => a.toggleAttribute('data-active', a.dataset.sec === id));
  const io = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) mark(visible[0].target.id);
  }, { rootMargin: '-72px 0px -70% 0px', threshold: 0 });
  secEls.forEach(s => io.observe(s));
  mark(secEls[0].id);
}
})();
