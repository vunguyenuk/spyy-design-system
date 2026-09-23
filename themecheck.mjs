import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const b = await chromium.launch();
for (const page of ['index', 'foundations', 'components', 'patterns', 'templates']) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 90)));
  await pg.goto(`file:///home/claude/ds/${page}.html`, { waitUntil: 'networkidle' });
  await pg.waitForTimeout(400);
  const before = await pg.getAttribute('html', 'data-theme');
  const btn = await pg.$('#theme-switch [data-theme-set="light"]');
  let after = null, activeOk = null;
  if (btn) {
    await btn.click();
    await pg.waitForTimeout(250);
    after = await pg.getAttribute('html', 'data-theme');
    activeOk = await pg.evaluate(() =>
      document.querySelector('#theme-switch [data-theme-set="light"]').hasAttribute('data-active'));
  }
  console.log(page.padEnd(12), 'switch:', btn ? 'found' : 'MISSING',
    '| before', before, '→ after', after, '| active mark', activeOk,
    errs.length ? '| ERR ' + errs.join(' ') : '');
  await ctx.close();
}
await b.close();
