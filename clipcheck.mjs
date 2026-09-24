/* clipcheck.mjs — content wider than the box that holds it.
   The affix was a 20px square built for a glyph; a word in it printed straight
   over the value beside it and nothing said so, because overflow is silent.
   This asks every leaf in the system whether its content fits, and skips the
   boxes whose job is to scroll or to ellipsise. */
import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const pg = await ctx.newPage();
const hits = [];
for (const p of ['index','foundations','components','patterns','templates','landing']) {
  const r = await pg.goto('file:///home/claude/ds/' + p + '.html', { waitUntil: 'networkidle' }).catch(()=>null);
  if (!r) continue;
  await pg.waitForTimeout(500);
  hits.push(...await pg.evaluate(page => {
    const out = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length) return;                 // leaves only
      if (!el.textContent.trim()) return;
      const s = getComputedStyle(el);
      if (s.overflowX !== 'visible') return;          // it scrolls or clips on purpose
      if (s.textOverflow === 'ellipsis') return;      // it truncates on purpose
      if (/^(PRE|CODE|TEXTAREA|INPUT)$/.test(el.tagName)) return;
      const over = el.scrollWidth - el.clientWidth;
      if (over > 1) out.push({ page, cls: (el.getAttribute('class')||el.tagName).split(' ')[0],
                               over, box: el.clientWidth,
                               text: el.textContent.trim().slice(0, 30) });
    });
    return out;
  }, p));
}
await b.close();
const seen = new Map();
for (const h of hits) { const k = h.page + h.cls; if (!seen.has(k)) seen.set(k, h); }
console.log(seen.size ? [...seen.values()].map(h =>
  `${h.page.padEnd(12)} ${h.cls.padEnd(24)} ${h.over}px past a ${h.box}px box   "${h.text}"`).join('\n')
  : 'nothing prints outside the box that holds it');
