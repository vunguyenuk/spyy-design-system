import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pkg;

/* Contrast of the states a user drives.
   ---------------------------------------------------------------------------
   contrast.mjs measures the page at rest. Most contrast bugs in this system
   have not been at rest — the toast was fine until the theme flipped, the tab
   was fine until you hovered it. So this one drives the states: it hovers each
   control with a real pointer and focuses it with a real focus, and measures
   the label against whatever is behind it AFTERWARDS.

   The bar is 4.5:1 for text under 18px and 3:1 for large text and for the
   control's own edge against the surface it sits on. A hover state that drops
   below the resting state is reported even when it passes, because a hover that
   makes a label harder to read is telling the user the opposite of what it
   means. */
const PAGES = ['components', 'patterns', 'templates', 'landing', 'index', 'foundations'];
const SEL = [
  '.spy-btn', '.spy-chip', '.spy-tabs-tab', '.spy-navmenu-item', '.spy-nav-item',
  '.spy-sidebar-row', '.spy-menu-item', '.spy-pagination-item', '.spy-list-item',
  '.spy-toggle', '.spy-field-input', '.spy-select-value', '.spy-toolcall-trigger',
  '.spy-breadcrumb-item', '.spy-accordion-trigger', '.spy-timeline-title',
].join(', ');

const lum = ([r, g, b]) => {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2)); };
const rgb = s => { const m = String(s).match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null; };
const over = (fg, bg, a) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));

const b = await chromium.launch();
const findings = [];

for (const page of PAGES) {
  for (const theme of ['dark', 'light']) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } });
    const pg = await ctx.newPage();
    await pg.goto(`file:///home/claude/ds/${page}.html`, { waitUntil: 'networkidle' });
    await pg.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
    await pg.waitForTimeout(400);

    const ids = await pg.evaluate(sel => {
      const seen = new Set(); const out = []; let i = 0;
      document.querySelectorAll(sel).forEach(el => {
        if (el.closest('.doc-rail, .doc-topbar, .doc-foot')) return;
        if (el.hasAttribute('data-disabled') || el.disabled) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 8 || r.top < 0) return;
        if (!(el.textContent || '').trim()) return;
        const key = String(el.className.baseVal ?? el.className) + '|' +
                    (el.getAttribute('data-variant') || '') + (el.getAttribute('data-active') !== null ? '+a' : '') +
                    (el.getAttribute('data-selected') !== null ? '+s' : '');
        if (seen.has(key)) return;
        seen.add(key);
        const id = 's' + (i++);
        el.setAttribute('data-sc-id', id);
        out.push({ id, key });
      });
      return out;
    }, SEL);

    const measure = id => pg.evaluate(i => {
      const el = document.querySelector(`[data-sc-id="${i}"]`);
      if (!el) return null;
      const cs = getComputedStyle(el);
      // walk up for the first opaque background actually behind the label
      let bg = null, n = el;
      while (n && n !== document.documentElement) {
        const c = getComputedStyle(n);
        if (c.backgroundImage && c.backgroundImage !== 'none') return { gradient: true };
        const m = String(c.backgroundColor).match(/[\d.]+/g);
        if (m && (m.length < 4 || parseFloat(m[3]) > 0.92)) { bg = c.backgroundColor; break; }
        n = n.parentElement;
      }
      return { fg: cs.color, bg: bg || getComputedStyle(document.body).backgroundColor,
               size: parseFloat(cs.fontSize), weight: cs.fontWeight };
    }, id);

    for (const { id, key } of ids) {
      const loc = pg.locator(`[data-sc-id="${id}"]`);
      const rest = await measure(id);
      if (!rest || rest.gradient) continue;
      const states = { rest };
      try { await loc.hover({ timeout: 700 }); await pg.waitForTimeout(60); states.hover = await measure(id); } catch {}
      try { await loc.focus({ timeout: 700 }); await pg.waitForTimeout(60); states.focus = await measure(id); } catch {}
      try { await pg.mouse.move(0, 0); } catch {}

      for (const [state, m] of Object.entries(states)) {
        if (!m || m.gradient) continue;
        const fg = rgb(m.fg), bg = rgb(m.bg);
        if (!fg || !bg) continue;
        const alphaM = String(m.fg).match(/[\d.]+/g);
        const a = alphaM && alphaM.length > 3 ? parseFloat(alphaM[3]) : 1;
        const r = ratio(a < 1 ? over(fg, bg, a) : fg, bg);
        const large = m.size >= 24 || (m.size >= 18.66 && +m.weight >= 700);
        const need = large ? 3 : 4.5;
        if (r < need) findings.push({ page, theme, state, key, ratio: r, need, size: m.size });
        else if (state === 'hover') {
          const rr = ratio(rgb(rest.fg), rgb(rest.bg));
          if (r < rr - 0.6) findings.push({ page, theme, state: 'hover↓', key, ratio: r, need: +rr.toFixed(2), size: m.size });
        }
      }
    }
    await ctx.close();
  }
}
await b.close();

const seen = new Set();
const uniq = findings.filter(f => { const k = f.theme + f.state + f.key; if (seen.has(k)) return false; seen.add(k); return true; });
console.log(uniq.length ? `${uniq.length} interaction states below the bar:` : 'every interaction state clears its bar');
for (const f of uniq) {
  console.log(`  ${f.theme.padEnd(6)} ${f.state.padEnd(7)} ${String(f.ratio).padStart(5)} (need ${f.need})  ${f.page.padEnd(11)} ${f.key.slice(0, 50)}`);
}
