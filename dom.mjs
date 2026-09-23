let pkg;
try { pkg = await import('playwright'); }
catch { pkg = await import(process.env.PLAYWRIGHT_PATH || (process.env.HOME + '/.npm-global/lib/node_modules/playwright/index.js')); }
pkg = pkg.default || pkg;
import fs from 'fs';
const { chromium } = pkg;
const ATTRS = JSON.parse(fs.readFileSync('./.tokens-cache/attrs.json','utf8'));

const enumAxes = a => Object.fromEntries(Object.entries(a)
  .filter(([,v]) => !(v.length===1 && v[0]==='__bool__'))
  .map(([k,v]) => [k, [null, ...v.filter(x=>x!=='__bool__')]]));
const cross = o => Object.keys(o).reduce((acc,k)=>acc.flatMap(c=>o[k].map(v=>({...c,[k]:v}))), [{}]);

const PAGES = ['components','patterns','templates','index','foundations'];
const b = await chromium.launch();
const out = {};

for (const theme of ['dark','light']) {
  for (const p of PAGES) {
    const ctx = await b.newContext({viewport:{width:1440,height:900}});
    const pg = await ctx.newPage();
    await pg.goto('file://' + process.cwd() + '/'+p+'.html',{waitUntil:'networkidle'});
    await pg.evaluate(t=>document.documentElement.setAttribute('data-theme',t), theme);
    await pg.waitForTimeout(500);

    const bases = Object.keys(ATTRS).filter(base => !(out[base]?.[theme]));
    if (!bases.length) { await ctx.close(); continue; }

    const plan = {};
    for (const base of bases) plan[base] = cross(enumAxes(ATTRS[base]));

    const res = await pg.evaluate(({plan}) => {
      const PROPS = ['display','flex-direction','align-items','justify-content','gap','flex-wrap',
        'padding-top','padding-right','padding-bottom','padding-left',
        'width','height','min-width','min-height','max-width',
        'background-color','background-image','color','opacity','overflow',
        'border-top-width','border-right-width','border-bottom-width','border-left-width',
        'border-top-color','border-top-style',
        'border-top-left-radius','border-top-right-radius','border-bottom-left-radius','border-bottom-right-radius',
        'font-family','font-size','line-height','font-weight','letter-spacing','text-transform',
        'text-align','white-space','box-shadow','position','inset','transform','transform-origin'];
      const ser = (el, depth) => {
        if (depth > 4) return null;
        const cs = getComputedStyle(el);
        if (cs.display === 'none') return null;
        const s = {}; for (const p of PROPS) s[p] = cs.getPropertyValue(p);
        const kids = [...el.children].map(c => ser(c, depth+1)).filter(Boolean);
        const own = [...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();
        return { tag: el.tagName.toLowerCase(), cls: el.className && el.className.baseVal === undefined ? el.className : String(el.className.baseVal||''),
                 text: own || undefined, box: { w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height },
                 style: s, kids: kids.length ? kids : undefined };
      };
      const found = {};
      const stage = document.createElement('div');
      stage.style.cssText = 'position:fixed;left:0;top:0;opacity:0;pointer-events:none;z-index:-1';
      document.body.appendChild(stage);
      for (const base of Object.keys(plan)) {
        const seed = document.querySelector('.' + base);
        if (!seed) continue;
        found[base] = { seedHTML: seed.outerHTML.slice(0, 4000), variants: [] };
        for (const combo of plan[base]) {
          const el = seed.cloneNode(true);
          for (const k of Object.keys(combo)) el.removeAttribute('data-' + k);
          for (const [k,v] of Object.entries(combo)) if (v !== null) el.setAttribute('data-'+k, v);
          stage.appendChild(el);
          found[base].variants.push({ key: combo, tree: ser(el, 0) });
          stage.removeChild(el);
        }
      }
      stage.remove();
      return found;
    }, {plan});

    for (const [base, data] of Object.entries(res)) {
      (out[base] ||= {})[theme] = data;
      out[base].foundOn = p;
    }
    await ctx.close();
  }
}
await b.close();
fs.writeFileSync('./.tokens-cache/dom.json', JSON.stringify(out));
const have = Object.keys(out).filter(k => out[k].dark && out[k].light);
const missing = Object.keys(ATTRS).filter(k => !out[k]?.dark);
console.log('bases with real markup:', have.length, '/', Object.keys(ATTRS).length);
console.log('no instance anywhere:', missing.join(', ') || '(none)');
console.log('size', (fs.statSync('./.tokens-cache/dom.json').size/1024/1024).toFixed(1), 'MB');
