import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const { chromium: _ } = pkg;

/* A surface that does not flip with the theme cannot carry ink that does.
   This has now been the cause of four separate bugs — the toast, the avatar
   count, the badge and the checked control — so it is a detector rather than a
   thing to remember: render every page in both themes, and flag any element
   whose BACKGROUND is identical across the two while its FOREGROUND is not. */
const PAGES = ['index', 'foundations', 'components', 'patterns', 'templates', 'landing'];
const b = await chromium.launch();
const findings = [];

for (const page of PAGES) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto(`file:///home/claude/ds/${page}.html`, { waitUntil: 'networkidle' });
  await pg.waitForTimeout(500);

  const read = async theme => {
    await pg.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
    await pg.waitForTimeout(250);
    return pg.evaluate(() => {
      const out = [];
      document.querySelectorAll('*').forEach((el, i) => {
        const cls = String(el.className.baseVal ?? el.className);
        // documentation chrome is not the system; swatches deliberately print
        // every colour on a constant fill and are the point of that page
        if (/\bdoc-/.test(cls)) return;
        const cs = getComputedStyle(el);
        const bg = cs.backgroundColor;
        if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') return;
        // a translucent fill composites over the page, so its contrast is
        // SUPPOSED to change with the theme — only opaque fills are constant
        if (/rgba|oklch\(.*\//.test(bg)) return;
        const r = el.getBoundingClientRect();
        if (r.width < 6 || r.height < 6) return;
        // the element has to actually show ink: its own text, or an icon that
        // paints from currentColor. A bare dot or bar inherits a colour it
        // never draws with.
        const ownText = [...el.childNodes].filter(n => n.nodeType === 3)
          .map(n => n.textContent.trim()).join('').trim();
        const paintsIcon = !!el.querySelector(':scope > svg, :scope > * > svg');
        if (!ownText && !paintsIcon) return;
        out.push({ i, bg, fg: cs.color, cls: cls.slice(0, 48),
                   txt: (ownText || '(icon)').slice(0, 22) });
      });
      return out;
    });
  };

  const dark = await read('dark');
  const light = await read('light');
  const byIndex = new Map(light.map(x => [x.i, x]));
  for (const d of dark) {
    const l = byIndex.get(d.i);
    if (!l) continue;
    if (d.bg === l.bg && d.fg !== l.fg) {
      findings.push({ page, cls: d.cls, txt: d.txt, bg: d.bg, darkFg: d.fg, lightFg: l.fg });
    }
  }
  await ctx.close();
}
await b.close();

// one row per distinct class + fill, not one per instance
const seen = new Set();
const uniq = findings.filter(f => {
  const k = f.page + '|' + f.cls + '|' + f.bg;
  if (seen.has(k)) return false; seen.add(k); return true;
});
console.log('constant surface, flipping ink:', uniq.length, 'distinct');
for (const f of uniq) console.log(` ${f.page.padEnd(12)} ${f.cls.padEnd(30)} bg ${f.bg.padEnd(22)} ${f.darkFg} -> ${f.lightFg}   "${f.txt}"`);
