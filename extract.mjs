// playwright from the project, or from a global install if it isn't local
let pkg;
try { pkg = await import('playwright'); }
catch { pkg = await import(process.env.PLAYWRIGHT_PATH
  || (process.env.HOME + '/.npm-global/lib/node_modules/playwright/index.js')); }
pkg = pkg.default || pkg;
import fs from 'fs';
fs.mkdirSync('./.tokens-cache', { recursive: true });
const { chromium } = pkg;

// names come from the stylesheets on disk; values come from the browser, which
// is the only thing that can resolve var(), color-mix() and the media queries
const css = ['tokens.css','components.css','patterns.css']
  .map(f => fs.readFileSync('./'+f,'utf8')).join('\n');
const NAMES = [...new Set(css.match(/--[a-zA-Z0-9-]+(?=\s*:)/g) || [])].sort();

const b = await chromium.launch();
const WIDTHS = { mobile: 390, tablet: 900, desktop: 1440 };
const out = { names: NAMES.length, themes:{}, type:{} };
for (const [bp, w] of Object.entries(WIDTHS)) {
  for (const theme of ['dark','light']) {
    const ctx = await b.newContext({viewport:{width:w,height:900}});
    const pg = await ctx.newPage();
    await pg.goto('file://' + process.cwd() + '/foundations.html',{waitUntil:'networkidle'});
    await pg.evaluate(t=>document.documentElement.setAttribute('data-theme',t), theme);
    await pg.waitForTimeout(300);
    const vals = await pg.evaluate(names=>{
      const cs = getComputedStyle(document.documentElement);
      const o={}; names.forEach(n=>{const v=cs.getPropertyValue(n).trim(); if(v) o[n]=v;}); return o;
    }, NAMES);
    if (bp==='desktop') out.themes[theme]=vals;
    if (theme==='dark') out.type[bp]=Object.fromEntries(Object.entries(vals).filter(([k])=>/^--hf-type-size-|^--hf-type-line-height-/.test(k)));
    await ctx.close();
  }
}
fs.writeFileSync('./.tokens-cache/resolved.json', JSON.stringify(out,null,1));
const d=out.themes.dark, l=out.themes.light, keys=Object.keys(d);
console.log('names found in css      :', NAMES.length);
console.log('resolved by the browser :', keys.length);
console.log('differ between themes   :', keys.filter(k=>l[k]!==undefined && d[k]!==l[k]).length);
const cat={};
keys.forEach(k=>{const g=k.startsWith('--hf-color')?'colour':k.startsWith('--hf-space')?'spacing':k.startsWith('--hf-radius')?'radius':k.startsWith('--hf-border')?'border':k.startsWith('--hf-icon')?'icon':k.startsWith('--hf-type')?'type':k.startsWith('--text-')?'type scale':k.startsWith('--hf-shadow')?'shadow':k.startsWith('--hf-gradient')?'gradient':k.startsWith('--hf-duration')||k.startsWith('--hf-ease')?'motion':k.startsWith('--q-')?'component slot':k.startsWith('--spy-')?'component slot':k.startsWith('--hf-')?'other hf':'other';cat[g]=(cat[g]||0)+1;});
console.log(JSON.stringify(cat,null,1));
console.log('\nsample type scale across widths:');
['--text-display','--text-h1','--text-body-m'].forEach(k=>console.log(' ',k, out.type.mobile[k],'|',out.type.tablet[k],'|',out.type.desktop[k]));
await b.close();
