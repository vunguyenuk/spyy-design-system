import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const pg = await ctx.newPage();

// set light and remember it
await pg.goto('file:///home/claude/ds/index.html', { waitUntil: 'networkidle' });
await pg.click('#theme-switch [data-theme-set="light"]');
await pg.waitForTimeout(200);

// then navigate the way someone clicks a component in the rail, and sample the
// attribute at the earliest moment a script can run on the new document
const samples = [];
for (const page of ['components', 'foundations', 'patterns', 'templates', 'index']) {
  const p2 = await ctx.newPage();
  await p2.addInitScript(() => {
    document.addEventListener('readystatechange', () => {
      window.__first = window.__first || document.documentElement.getAttribute('data-theme');
    }, { once: true });
  });
  await p2.goto(`file:///home/claude/ds/${page}.html`, { waitUntil: 'domcontentloaded' });
  const early = await p2.evaluate(() => window.__first);
  const final = await p2.getAttribute('html', 'data-theme');
  samples.push({ page, atFirstPaint: early, final, flash: early !== final });
  await p2.close();
}
console.table(samples);
await b.close();
