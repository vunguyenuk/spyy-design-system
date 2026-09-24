import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pkg;

/* Non-text contrast: the boundary of a control against what is behind it.
   WCAG 1.4.11 wants 3:1 for the part that tells you the control is there. A
   filled control's boundary is its fill; an OUTLINED control's boundary is its
   one-pixel edge, and that edge has to carry the whole job on its own. */
const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2)); };
const rgba = s => { const m = String(s).match(/[\d.]+/g); if (!m) return null; return { c: m.slice(0, 3).map(Number), a: m.length > 3 ? parseFloat(m[3]) : 1 }; };
const over = (fg, bg, a) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));

const b = await chromium.launch();
const rows = [];
for (const theme of ['dark', 'light']) {
  const pg = await (await b.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
  await pg.goto('file:///home/claude/ds/components.html', { waitUntil: 'networkidle' });
  await pg.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
  await pg.waitForTimeout(400);
  const out = await pg.evaluate(() => {
    /* Only what 1.4.11 covers: the boundary that tells you a CONTROL is there.
       A card's hairline and a tab trough separate regions — nothing depends on
       seeing them, and holding decoration to 3:1 would put a hard line around
       every box on the page. */
    const pick = ['.spy-field-control:not([data-variant="soft"])',
                  '.spy-btn[data-variant="outline"]',
                  '.spy-chip:not([data-selected])',
                  '.spy-fieldgroup > .spy-btn',
                  '.spy-select-trigger',
                  '.spy-checkbox:not([data-checked]):not([data-indeterminate]) .spy-control-box',
                  '.spy-radio:not([data-checked]) .spy-control-box',
                  '.spy-switch'];
    const res = [];
    for (const sel of pick) {
      const el = document.querySelector(sel + ':not([data-invalid]):not([data-disabled])');
      if (!el) continue;
      const cs = getComputedStyle(el);
      // the edge is either a border or the first inset ring in the box-shadow
      let edge = cs.borderTopColor, w = parseFloat(cs.borderTopWidth);
      // a transparent border is the reserved gutter this system keeps so a
      // control does not move when a real border appears — it is not an edge
      const bt = String(edge).match(/[\d.]+/g);
      if (!w || cs.borderTopStyle === 'none' || (bt && bt.length > 3 && parseFloat(bt[3]) === 0)) { edge = null; w = 0; }
      const sh = cs.boxShadow || '';
      const m = /(rgba?\([^)]*\))\s+0px 0px 0px ([\d.]+)px inset/.exec(sh);
      if (m && !w) { edge = m[1]; w = parseFloat(m[2]); }
      if (!edge || !w) {
        // no edge at all: the fill is the boundary
        const own = String(cs.backgroundColor).match(/[\d.]+/g);
        if (own && (own.length < 4 || parseFloat(own[3]) > 0.05)) { edge = cs.backgroundColor; w = 'fill'; }
        else continue;
      }
      let n = el.parentElement, bg = null;
      while (n && n !== document.documentElement) {
        const c = getComputedStyle(n), mm = String(c.backgroundColor).match(/[\d.]+/g);
        if (mm && (mm.length < 4 || parseFloat(mm[3]) > 0.9)) { bg = c.backgroundColor; break; }
        n = n.parentElement;
      }
      res.push({ sel, edge, w, bg: bg || 'rgb(0,0,0)' });
    }
    return res;
  });
  for (const r of out) {
    const e = rgba(r.edge), g = rgba(r.bg);
    if (!e || !g || !r.w) continue;
    rows.push({ theme, sel: r.sel, w: r.w, ratio: ratio(e.a < 1 ? over(e.c, g.c, e.a) : e.c, g.c) });
  }
  await pg.close();
}
await b.close();
console.log('theme  edge  ratio  need 3.0  component');
for (const r of rows) {
  console.log(`${r.theme.padEnd(6)} ${String(r.w + 'px').padEnd(5)} ${String(r.ratio).padStart(5)}  ${r.ratio < 3 ? '  ✗ FAIL' : '  ok    '}  ${r.sel}`);
}
