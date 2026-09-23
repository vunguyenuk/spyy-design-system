import pkg from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
import fs from 'fs';
const { chromium } = pkg;

// The landing layer is laid out with grid, not flex. The app serialiser only
// captured flex properties, so a grid container came back as a plain box with
// children stacked at absolute positions. Figma has no grid; it has auto-layout.
// So the capture records the grid properties too, and the generator decides
// which auto-layout direction each grid stands for.
const ATTRS = {
  'spy-section':      { tone: ['tinted','inverse'], density: ['compact'] },
  'spy-section-head': { align: ['center'] },
  'spy-hero':         { align: ['center'] },
  'spy-feature':      { highlighted: ['__bool__'] },
  'spy-plan':         { featured: ['__bool__'] },
  'spy-quote':        {},
  'spy-logos':        {},
  'spy-cta':          { tone: ['brand'] },
  'spy-mnav':         {},
  'spy-footer':       {},
};

// A card is never the width of the page. Measuring one on a 1200px stage would
// report the section's width as the card's, so each base is staged at the width
// it actually occupies in the layout it was built for.
const WIDTH = {
  'spy-section': 1200, 'spy-section-head': 1200, 'spy-hero': 1200,
  'spy-logos': 1200, 'spy-cta': 1200, 'spy-mnav': 1200, 'spy-footer': 1200,
  'spy-feature': 373, 'spy-plan': 373, 'spy-quote': 580,
};

const enumAxes = a => Object.fromEntries(Object.entries(a)
  .filter(([,v]) => !(v.length===1 && v[0]==='__bool__'))
  .map(([k,v]) => [k, [null, ...v]]));
const boolAxes = a => Object.fromEntries(Object.entries(a)
  .filter(([,v]) => v.length===1 && v[0]==='__bool__')
  .map(([k]) => [k, [null, '']]));
const cross = o => Object.keys(o).reduce((acc,k)=>acc.flatMap(c=>o[k].map(v=>({...c,[k]:v}))), [{}]);

const b = await chromium.launch();
const out = {};

for (const theme of ['dark','light']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto('file:///home/claude/ds/landing.html', { waitUntil: 'networkidle' });
  await pg.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
  await pg.waitForTimeout(400);

  const plan = {};
  for (const base of Object.keys(ATTRS)) plan[base] = cross({ ...enumAxes(ATTRS[base]), ...boolAxes(ATTRS[base]) });

  const res = await pg.evaluate(({ plan, WIDTH }) => {
    const PROPS = ['display','flex-direction','align-items','justify-content','gap','flex-wrap',
      'grid-template-columns','grid-auto-flow','justify-items','align-content',
      'padding-top','padding-right','padding-bottom','padding-left',
      'width','height','min-width','min-height','max-width',
      'background-color','background-image','color','opacity','overflow',
      'border-top-width','border-right-width','border-bottom-width','border-left-width',
      'border-top-color','border-top-style',
      'border-top-left-radius','border-top-right-radius','border-bottom-left-radius','border-bottom-right-radius',
      'font-family','font-size','line-height','font-weight','letter-spacing','text-transform',
      'text-align','white-space','box-shadow','position','transform'];
    const ser = (el, depth) => {
      if (depth > 5) return null;
      const cs = getComputedStyle(el);
      if (cs.display === 'none') return null;
      const s = {}; for (const p of PROPS) s[p] = cs.getPropertyValue(p);
      const kids = [...el.children].map(c => ser(c, depth+1)).filter(Boolean);
      const own = [...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();
      const r = el.getBoundingClientRect();
      // A landing block composes core components. Which Button it holds is in
      // the markup, not in the pixels, so the attributes come across too —
      // otherwise the Figma build has to guess the variant back from the fill.
      const attrs = {};
      for (const a of el.attributes) if (a.name.startsWith('data-')) attrs[a.name.slice(5)] = a.value;
      // which icon is in the sprite reference, not in any attribute
      const use = el.tagName.toLowerCase() === 'svg' ? el.querySelector('use') : null;
      if (use) attrs.icon = (use.getAttribute('href') || '').replace('#i-', '');
      return { tag: el.tagName.toLowerCase(),
               cls: String(el.className.baseVal ?? el.className),
               attrs: Object.keys(attrs).length ? attrs : undefined,
               text: own || undefined, box: { w: r.width, h: r.height },
               style: s, kids: kids.length ? kids : undefined };
    };
    const found = {};
    // The stage is the real page width, not a shrink-wrapped box: a landing
    // section IS its width, and measuring one at auto width would report the
    // width of its longest line instead of the column it actually occupies.
    const stage = document.createElement('div');
    stage.style.cssText = 'position:absolute;left:0;top:0;opacity:0;pointer-events:none;z-index:-1';
    document.body.appendChild(stage);
    for (const base of Object.keys(plan)) {
      const cands = [...document.querySelectorAll('.' + base)].filter(el => {
        const r = el.getBoundingClientRect();
        return getComputedStyle(el).display !== 'none' && r.width > 0 && r.height > 0;
      });
      const extra = el => String(el.className.baseVal ?? el.className).split(/\s+/)
        .filter(c => c && c !== base).length;
      cands.sort((a, b) => extra(a) - extra(b));
      const seed = cands[0];
      if (!seed) continue;
      stage.style.width = (WIDTH[base] || 1200) + 'px';
      found[base] = { seedHTML: seed.outerHTML.slice(0, 3000), width: WIDTH[base] || 1200, variants: [] };
      for (const combo of plan[base]) {
        const el = seed.cloneNode(true);
        for (const k of Object.keys(combo)) el.removeAttribute('data-' + k);
        for (const [k, v] of Object.entries(combo)) if (v !== null) el.setAttribute('data-' + k, v);
        stage.appendChild(el);
        found[base].variants.push({ key: combo, tree: ser(el, 0) });
        stage.removeChild(el);
      }
    }
    stage.remove();
    return found;
  }, { plan, WIDTH });

  for (const [base, data] of Object.entries(res)) (out[base] ||= {})[theme] = data;
  await ctx.close();
}
await b.close();
fs.writeFileSync('/home/claude/out/landdom.json', JSON.stringify(out));
const have = Object.keys(out).filter(k => out[k].dark && out[k].light);
console.log('landing bases captured:', have.length, '/', Object.keys(ATTRS).length);
console.log('missing:', Object.keys(ATTRS).filter(k => !out[k]?.dark).join(', ') || '(none)');
for (const k of have) console.log(' ', k, '->', out[k].dark.variants.length, 'variants');
