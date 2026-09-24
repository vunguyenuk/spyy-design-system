/* iconalign.mjs — an icon beside a title-and-description block belongs to the
   title, not to the block. Centre-aligning the row is right only while the
   text is one line; the moment the description wraps, the icon drifts down to
   sit beside the description it has nothing to do with.
   Flags every row that centres a leading icon against text taller than the
   icon's own first line. */
import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const out = [];
for (const page of ['components', 'patterns', 'index', 'foundations', 'landing']) {
  const pg = await ctx.newPage();
  const url = 'file:///home/claude/ds/' + page + '.html';
  const res = await pg.goto(url, { waitUntil: 'networkidle' }).catch(() => null);
  if (!res) { await pg.close(); continue; }
  await pg.waitForTimeout(500);
  out.push(...await pg.evaluate(p => {
    const hits = [];
    const ICON = /(^|\s)spy-[a-z-]*(icon|avatar|tile|media|spinner|loader|thumb|badge)([a-z-]*)(\s|$)/;
    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.display !== 'flex' && cs.display !== 'inline-flex') return;
      if (cs.flexDirection.startsWith('column')) return;
      if (!/center/.test(cs.alignItems)) return;
      if (cs.flexWrap === 'wrap') return;   // no stable first line to align to
      const kids = [...el.children];
      if (kids.length < 2) return;
      const icon = kids.find(k => ICON.test(k.getAttribute('class') || ''));
      if (!icon) return;
      if (/avatar/.test(icon.getAttribute('class') || '')) return;   // see above
      if (/^doc-/.test(el.getAttribute('class') || '')) return;      // docs chrome
      const ir = icon.getBoundingClientRect();
      if (!ir.height) return;
      // Two ways a row is wrong. It is WRAPPED when the text beside the icon
      // already runs past one line — visible today. It is STACKED when that
      // text is a column of two or more blocks (a title over a description) —
      // not yet visible, because nothing has wrapped, and wrong the first time
      // a longer string or a narrower column arrives. Both are the same bug.
      let worst = null;
      for (const k of kids) {
        if (k === icon) continue;
        const r = k.getBoundingClientRect();
        const ks = getComputedStyle(k);
        const lh = parseFloat(ks.lineHeight) || 16;
        const lines = r.height / lh;
        const stacked =
          (ks.display === 'flex' && ks.flexDirection.startsWith('column')) ||
          ks.display === 'grid';
        const kids2 = [...k.children].filter(c => c.getBoundingClientRect().height);
        // Title over description, or label over value? Only the first is a
        // heading with a subordinate line under it, and only the first wants
        // the icon pulled up to the top. A settings row that reads
        // "Brand / Nordic Labs" is one value in two lines and stays centred,
        // as does an avatar, which identifies the whole block rather than
        // labelling its first line.
        const titleFirst = kids2.length > 1 &&
          parseFloat(getComputedStyle(kids2[0]).fontSize) >=
          parseFloat(getComputedStyle(kids2[1]).fontSize);
        const isStack = stacked && titleFirst;
        // The line count is only meaningful for a run of text. On a container
        // it measures the stack's total height against an inherited
        // line-height and reports "2.6 lines" for a label over a value, which
        // is not wrapping at all. Containers are judged by isStack alone.
        const isLeaf = kids2.length === 0;
        const wrapped = isLeaf && lines > 1.6;
        if ((wrapped || isStack) && (!worst || r.height > worst.h)) {
          worst = { h: r.height, lines, why: wrapped ? 'wrapped' : 'stacked',
                    cls: k.getAttribute('class') || k.tagName };
        }
      }
      if (!worst) return;
      hits.push({
        page: p,
        row: (el.getAttribute('class') || el.tagName).split(' ').slice(0, 2).join('.'),
        icon: (icon.getAttribute('class') || '').split(' ')[0],
        iconH: Math.round(ir.height),
        textH: Math.round(worst.h),
        lines: worst.lines.toFixed(1),
        why: worst.why,
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 42),
      });
    });
    return hits;
  }, page));
  await pg.close();
}
await b.close();
// one line per distinct row class
const seen = new Map();
for (const h of out) {
  const k = h.page + ' ' + h.row;
  if (!seen.has(k)) seen.set(k, { ...h, n: 0 });
  seen.get(k).n++;
}
console.log(`${out.length} centred rows whose text runs past one line, ${seen.size} distinct\n`);
for (const h of seen.values()) {
  console.log(
    (h.page + '  ' + h.row).padEnd(44),
    h.why.padEnd(8), '×' + String(h.n).padEnd(3),
    'icon ' + String(h.iconH).padStart(3) + 'px vs text ' + String(h.textH).padStart(3) + 'px (' + h.lines + ' lines)',
    ' ', h.text
  );
}
