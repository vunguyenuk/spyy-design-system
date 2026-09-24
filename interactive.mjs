import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pkg;

/* Looks interactive, is not.
   ---------------------------------------------------------------------------
   The honest test is not "does it have a click handler" — it is "does clicking
   it change anything". So: snapshot every attribute in the document, click the
   element, snapshot again, and compare. An element that presents as a control —
   a <button>, a link, a role=tab, a pointer cursor — and moves nothing is a
   control the product is only pretending to have. */
const PAGES = process.argv.slice(2).length ? process.argv.slice(2)
  : ['components', 'patterns', 'templates', 'index', 'foundations', 'landing'];
const b = await chromium.launch();
const dead = [];
let tested = 0;

for (const page of PAGES) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } });
  const pg = await ctx.newPage();
  await pg.goto(`file:///home/claude/ds/${page}.html`, { waitUntil: 'networkidle' });
  await pg.waitForTimeout(500);

  const targets = await pg.evaluate(() => {
    /* Scoped to controls whose STATE is supposed to change. A demo button that
       does nothing is an example of a button, not a bug; a tab that does
       nothing is not an example of a tab. So: the families the system defines a
       state attribute for, minus the ones already in that state (clicking an
       already-selected item correctly changes nothing), minus the reference
       site's own chrome. */
    const FAMILIES = [
      ['.spy-tabs-tab', 'data-active'],
      ['.spy-navmenu-item', 'data-active'],
      ['.spy-nav-item', 'data-active'],
      ['.spy-sidebar-row', 'data-active'],
      ['.spy-pagination-item', 'data-active'],
      ['.spy-menu-item', 'data-selected'],
      ['button.spy-chip', 'data-selected'],
      ['.spy-toggle', 'data-pressed'],
      ['.spy-switch', 'data-checked'],
      ['.spy-checkbox', 'data-checked'],
      ['.spy-radio', 'data-checked'],
      ['.spy-accordion-trigger', 'data-open'],
      ['.spy-select-trigger', 'data-open'],
      ['.spy-toolcall-trigger', 'data-open'],
      ['.spy-panel-section-header', 'data-open'],
      ['.spy-field-clear', ''],
      ['.spy-toast-close', ''],
      ['[data-js]', ''],
    ];
    const out = [];
    const seen = new Set();
    let i = 0;
    for (const [sel, stateAttr] of FAMILIES) {
      document.querySelectorAll(sel).forEach(el => {
        if (el.closest('.doc-rail, .doc-topbar, .doc-foot')) return;
        if (el.classList.contains('doc-case-copy')) return;
        if (el.hasAttribute('data-disabled') || el.disabled) return;
        // already on: clicking it is correctly a no-op
        if (stateAttr && el.hasAttribute(stateAttr)) return;
        if (stateAttr && el.closest('[' + stateAttr + ']') === el.parentElement) { /* fallthrough */ }
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') return;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) return;
        const key = sel + '|' + (el.closest('.doc-case')?.id || el.closest('section[id]')?.id || '');
        if (seen.has(key)) return;
        seen.add(key);
        const id = 'a' + (i++);
        el.setAttribute('data-audit-id', id);
        out.push({ id, key, family: sel,
          where: el.closest('.doc-case')?.id || el.closest('section[id]')?.id || '',
          label: (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 26) });
      });
    }
    return out;
  });

  const snap = () => pg.evaluate(() => {
    let s = '';
    document.querySelectorAll('*').forEach(el => {
      for (const a of el.attributes) if (a.name !== 'data-audit-id') s += a.name + '=' + a.value + ';';
    });
    return s.length + ':' + s.slice(0, 200000).split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
  });

  for (const t of targets) {
    tested++;
    const before = await snap();
    try {
      await pg.locator(`[data-audit-id="${t.id}"]`).click({ timeout: 900, force: true });
    } catch { /* not clickable at all is itself a finding, recorded below */ }
    await pg.waitForTimeout(90);
    const after = await snap();
    if (before === after) dead.push({ page, ...t });
  }
  await ctx.close();
}
await b.close();

console.log(`clicked ${tested} distinct controls · ${dead.length} changed nothing`);
for (const d of dead) {
  console.log(`  ${d.page.padEnd(12)} ${(d.where || '—').padEnd(24)} ${d.label.padEnd(28)} ${d.family}`);
}
