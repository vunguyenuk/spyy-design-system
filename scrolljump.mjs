import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pkg;

/* Clicking a control should not move the page. Anything that scrolls on click
   is either an anchor the example did not mean to follow, or a focus() landing
   on something the browser then scrolls into view. */
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const pg = await ctx.newPage();
await pg.goto('file:///home/claude/ds/components.html', { waitUntil: 'networkidle' });
await pg.waitForTimeout(500);

const ids = await pg.evaluate(() => {
  const out = []; let i = 0; const seen = new Set();
  document.querySelectorAll('.doc-case-preview button, .doc-case-preview a, .doc-case-preview .spy-checkbox, .doc-case-preview .spy-radio, .doc-case-preview .spy-switch, .doc-case-preview input')
    .forEach(el => {
      const c = el.closest('.doc-case');
      const key = (c?.id || '') + '|' + el.tagName + String(el.className.baseVal ?? el.className).slice(0, 30);
      if (seen.has(key)) return; seen.add(key);
      const id = 'j' + (i++); el.setAttribute('data-jump-id', id);
      out.push({ id, where: c?.id || '', tag: el.tagName,
        cls: String(el.className.baseVal ?? el.className).slice(0, 34) });
    });
  return out;
});

const jumps = [];
for (const t of ids) {
  await pg.evaluate(() => window.scrollTo(0, 0));
  const el = pg.locator(`[data-jump-id="${t.id}"]`);
  try { await el.scrollIntoViewIfNeeded({ timeout: 700 }); } catch { continue; }
  const before = await pg.evaluate(() => window.scrollY);
  try { await el.click({ timeout: 700 }); } catch { continue; }
  await pg.waitForTimeout(160);
  const after = await pg.evaluate(() => window.scrollY);
  if (Math.abs(after - before) > 4) jumps.push({ ...t, delta: after - before });
}
console.log(`clicked ${ids.length} controls · ${jumps.length} moved the page`);
for (const j of jumps) console.log(`  ${String(j.delta).padStart(7)}px  ${j.where.padEnd(24)} ${j.tag.padEnd(7)} ${j.cls}`);
await b.close();
