import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pkg;

/* Is the space around a control inside a region even?
   For every region that holds controls, measure the gap from the region's
   padding box to its content on all four sides. A region whose sides disagree
   by more than 2px is a region padded by two different decisions. */
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } });
const pg = await ctx.newPage();
await pg.goto('file:///home/claude/ds/components.html', { waitUntil: 'networkidle' });
await pg.waitForTimeout(500);
const rows = await pg.evaluate(() => {
  const SEL = '.spy-card-footer, .spy-card-body, .spy-modal-actions, .spy-table-bar, .spy-prompt-foot, .spy-toolcall-actions, .spy-cmdk-foot, .spy-cmdk-field, .spy-alert, .spy-toast, .spy-empty';
  const out = []; const seen = new Set();
  document.querySelectorAll(SEL).forEach(el => {
    const cls = String(el.className.baseVal ?? el.className).split(' ')[0];
    if (seen.has(cls)) return; seen.add(cls);
    const cs = getComputedStyle(el);
    out.push({ cls,
      t: parseFloat(cs.paddingTop), r: parseFloat(cs.paddingRight),
      b: parseFloat(cs.paddingBottom), l: parseFloat(cs.paddingLeft),
      h: Math.round(el.getBoundingClientRect().height) });
  });
  return out;
});
console.log('region'.padEnd(22), 'top  right bottom left   height   verdict');
for (const r of rows) {
  const v = Math.abs(r.t - r.b) > 1 ? 'vertical sides disagree'
          : Math.abs(r.l - r.r) > 1 ? 'horizontal sides disagree'
          : Math.abs(r.t - r.l) > 1 ? `${r.t} block / ${r.l} inline`
          : 'even';
  console.log(r.cls.padEnd(22), String(r.t).padStart(4), String(r.r).padStart(5), String(r.b).padStart(6), String(r.l).padStart(5), String(r.h).padStart(7), '  ', v);
}
await b.close();
