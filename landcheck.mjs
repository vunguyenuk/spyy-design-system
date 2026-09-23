import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const b = await chromium.launch();
let bad = 0;
for (const theme of ['dark','light'])
  for (const w of [390, 768, 1440]) {
    const ctx = await b.newContext({viewport:{width:w,height:900}});
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(String(e)));
    await pg.goto('file:///home/claude/ds/landing.html',{waitUntil:'networkidle'});
    await pg.evaluate(t=>document.documentElement.setAttribute('data-theme',t), theme);
    await pg.waitForTimeout(400);
    const ox = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (ox > 0 || errs.length) { console.log('FAIL', theme, w, 'overflow', ox, errs); bad++; }
    await ctx.close();
  }
await b.close();
console.log(bad ? bad + ' failures' : 'landing clean at 6 theme/width combinations');
