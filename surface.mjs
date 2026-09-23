import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
import fs from 'fs';
const { chromium } = pkg;
const A = JSON.parse(fs.readFileSync('/home/claude/out/attrs.json','utf8'));
const bases = Object.keys(A);
const PAGES = { 'index':'landing', 'templates':'app', 'patterns':'app',
                'components':'docs', 'foundations':'docs' };
const b = await chromium.launch();
const count = {};
for (const [p, kind] of Object.entries(PAGES)) {
  const ctx = await b.newContext({viewport:{width:1440,height:900}});
  const pg = await ctx.newPage();
  await pg.goto('file:///home/claude/ds/'+p+'.html',{waitUntil:'networkidle'});
  await pg.waitForTimeout(600);
  const res = await pg.evaluate(bs => Object.fromEntries(
    bs.map(x => [x, document.querySelectorAll('.'+x).length])), bases);
  for (const [x, n] of Object.entries(res)) {
    if (!n) continue;
    (count[x] ||= { app:0, landing:0, docs:0 })[kind] += n;
  }
  await ctx.close();
}
await b.close();
const rows = bases.map(x => {
  const c = count[x] || { app:0, landing:0, docs:0 };
  const kind = c.app && c.landing ? 'BOTH' : c.app ? 'app' : c.landing ? 'landing'
             : c.docs ? 'docs-only' : 'NOWHERE';
  return [kind, x, c.app, c.landing, c.docs];
});
const ord = { BOTH:0, app:1, landing:2, 'docs-only':3, NOWHERE:4 };
rows.sort((r,s) => ord[r[0]]-ord[s[0]] || (s[2]+s[3])-(r[2]+r[3]));
let cur = null;
for (const [k,x,a,l,d] of rows) {
  if (k !== cur) { console.log('\n### ' + k); cur = k; }
  console.log(`  ${x.padEnd(22)} app=${String(a).padEnd(5)} landing=${String(l).padEnd(5)} docs=${d}`);
}
