/* fill.mjs — a panel with no width collapses to its content.
   A button, a badge, a chip is sized by its label and is right at content
   width. A panel is not: a menu, a list, a table, a split, a composer all
   lay children out in rows, and a row's width comes from the column it sits
   in, never from the longest string in it. Given none, they shrink — the menu
   in the report is 209px of "Windows / Last 30 days" floating in 878px of
   preview, and every item in it is as narrow as the words someone happened
   to type.

   So the test is structural: does this thing stack its children? If it does
   and nothing set its width, that is the bug. */
import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const pg = await ctx.newPage();
await pg.goto('file:///home/claude/ds/components.html', { waitUntil: 'networkidle' });
await pg.waitForTimeout(600);
const rows = await pg.evaluate(() => {
  const out = [];
  document.querySelectorAll('.doc-case-preview').forEach(p => {
    const id = p.closest('.doc-case')?.id || '?';
    const cs = getComputedStyle(p);
    const avail = Math.round(p.clientWidth
      - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    [...p.children].forEach(c => {
      const s = getComputedStyle(c);
      const kids = [...c.children].filter(k => k.getBoundingClientRect().height);
      // Does it stack? A column flex/grid with more than one child, a table,
      // or a block whose children are themselves full-width rows.
      const column =
        (s.display.includes('flex') && s.flexDirection.startsWith('column')) ||
        s.display === 'grid' ||
        /table/.test(s.display) ||
        c.tagName === 'UL' || c.tagName === 'OL' || c.tagName === 'TABLE';
      const stacks = column && kids.length > 1;
      if (!stacks) return;
      // Did anything give it a width? An author width, a max-width, or a
      // parent that sized it.
      const declared = s.width !== 'auto' && !/%$/.test(s.width);
      const capped = s.maxWidth !== 'none';
      const w = Math.round(c.getBoundingClientRect().width);
      out.push({
        id, cls: (c.getAttribute('class') || c.tagName).split(' ')[0],
        w, avail, capped, share: w / avail,
        told: capped || c.getAttribute('style')?.includes('width'),
      });
    });
  });
  return out;
});
await b.close();
/* Three are content-sized on purpose and stay that way: a CALENDAR is a
   seven-column grid whose width is seven days wide, a NAV LIST is a row of
   items rather than a stack of them, and a MODAL carries its own width
   because it is not in a column at all — it is over one. */
const OK = new Set(['spy-calendar', 'spy-nav-list', 'spy-modal']);
const bad = rows.filter(r => !r.told && !OK.has(r.cls) && r.share < 0.75)
                .sort((a, b) => a.share - b.share);
console.log(`${rows.length} stacking components in the docs, ${bad.length} were never told a width\n`);
const byCls = new Map();
for (const r of bad) {
  if (!byCls.has(r.cls)) byCls.set(r.cls, []);
  byCls.get(r.cls).push(r);
}
for (const [cls, rs] of [...byCls].sort((a, b) => b[1].length - a[1].length)) {
  console.log(cls.padEnd(22), '×' + String(rs.length).padEnd(3),
    'widest ' + String(Math.max(...rs.map(r => r.w))).padStart(4) + ' of ' + rs[0].avail,
    '  ', rs.map(r => r.id).slice(0, 4).join(' '));
}
