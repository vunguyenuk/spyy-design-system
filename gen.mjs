import fs from 'fs';
import { findColor, findNum, normColor } from './bind.mjs';
const DOM = JSON.parse(fs.readFileSync('./.tokens-cache/dom.json','utf8'));

const px = v => v == null ? null : (String(v).endsWith('rem') ? parseFloat(v)*16 : parseFloat(v));
const num = v => { const n = px(v); return Number.isFinite(n) ? +n.toFixed(2) : 0; };
const GRAD = {
  'badge-blue': 'gradient/badge-blue', 'badge-pink': 'gradient/badge-pink',
  'badge-purple': 'gradient/badge-purple', 'glass-sheen': 'gradient/glass-sheen',
};
const gradName = bi => {
  if (!bi || bi === 'none') return null;
  if (/radial/.test(bi)) {
    if (/79, 201|4fc9dc/.test(bi)) return GRAD['badge-blue'];
    if (/238, 69, 150/.test(bi) && /237, 21, 114/.test(bi)) return GRAD['badge-pink'];
    if (/238, 69, 150/.test(bi)) return GRAD['badge-purple'];
  }
  return '__gradient__';
};

// walk the dark tree and the light tree in lockstep; a property is bindable only
// when both themes agree on which variable explains it
const pair = (d, l, key) => [d.style[key], l.style[key]];

function node(d, l, path) {
  const s = d.style, out = { name: path, kids: [] };
  const isFlex = /flex|inline-flex/.test(s.display);
  out.layout = isFlex ? (/column/.test(s['flex-direction']) ? 'VERTICAL' : 'HORIZONTAL') : null;
  if (isFlex) {
    out.gap = num(s.gap);
    out.gapVar = findNum(s.gap, '--hf-space');
    out.align = ({ 'flex-start':'MIN','center':'CENTER','flex-end':'MAX','baseline':'BASELINE','stretch':'MIN' })[s['align-items']] || 'CENTER';
    out.justify = ({ 'flex-start':'MIN','center':'CENTER','flex-end':'MAX','space-between':'SPACE_BETWEEN' })[s['justify-content']] || 'MIN';
  }
  out.pad = ['top','right','bottom','left'].map(k => num(s['padding-'+k]));
  out.padVar = ['top','right','bottom','left'].map(k => findNum(s['padding-'+k], '--hf-space'));
  out.radius = ['top-left','top-right','bottom-left','bottom-right'].map(k => num(s['border-'+k+'-radius']));
  out.radiusVar = findNum(s['border-top-left-radius'], '--hf-radius');

  const [bd, bl] = pair(d, l, 'background-color');
  const g = gradName(s['background-image']);
  if (g) out.gradient = g;
  else if (normColor(bd) !== 'rgba(0, 0, 0, 0)') {
    out.fill = bd; out.fillVar = findColor(bd, bl, 'frameFill');
  }

  const bw = num(s['border-top-width']);
  const [sd, sl] = pair(d, l, 'border-top-color');
  // A width with a transparent colour is not a border — it is a reserved gutter
  // so the box does not resize when a real border appears on hover or focus.
  // Carrying it into Figma as a stroke would draw an edge the product never has.
  const invisible = /rgba\([^)]*,\s*0\s*\)/.test(sd || '');
  if (bw > 0 && !invisible) {
    out.stroke = { w: bw, wVar: findNum(s['border-top-width'], '--hf-border'),
                   color: sd, colorVar: findColor(sd, sl, 'stroke') };
  } else if (bw > 0) {
    out.inset = bw;   // keep the space, drop the line
  }
  out.w = +d.box.w.toFixed(1); out.h = +d.box.h.toFixed(1);
  const tf = s.transform;
  if (tf && tf !== 'none' && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(tf)) out.transform = tf;

  if (d.text) {
    const [cd, cl] = pair(d, l, 'color');
    out.text = {
      chars: d.text,
      family: (s['font-family'] || '').split(',')[0].replace(/["']/g, '').trim(),
      size: num(s['font-size']), sizeVar: findNum(s['font-size'], '--hf-type-size'),
      lh: num(s['line-height']), lhVar: findNum(s['line-height'], '--hf-type-line-height'),
      weight: s['font-weight'], upper: s['text-transform'] === 'uppercase',
      ls: num(s['letter-spacing']) || 0,
      color: cd, colorVar: findColor(cd, cl, 'textFill'),
    };
  }
  const dk = d.kids || [], lk = l.kids || [];
  for (let i = 0; i < dk.length; i++) if (lk[i]) out.kids.push(node(dk[i], lk[i], path + '/' + i));
  if (!out.kids.length) delete out.kids;
  return out;
}

const base = process.argv[2];
const rec = DOM[base];
if (!rec) { console.error('no such base', base); process.exit(1); }
const variants = rec.dark.variants.map((v, i) => ({
  key: v.key, tree: node(v.tree, rec.light.variants[i].tree, 'root')
}));
const outFile = './.tokens-cache/build-' + base + '.json';
fs.writeFileSync(outFile, JSON.stringify({ base, foundOn: rec.foundOn, variants }));

// report how much of it is bound vs hardcoded
let bound = 0, hard = 0, grads = 0;
const walk = n => {
  if (n.fill) { n.fillVar ? bound++ : hard++; }
  if (n.gradient) grads++;
  if (n.stroke) { n.stroke.colorVar ? bound++ : hard++; }
  if (n.text) { n.text.colorVar ? bound++ : hard++; n.text.sizeVar ? bound++ : hard++; }
  (n.kids || []).forEach(walk);
};
variants.forEach(v => walk(v.tree));
console.log(base, '| variants', variants.length, '| bound', bound, '| hardcoded', hard, '| gradients', grads);
if (process.argv[3] === '-v') console.log(JSON.stringify(variants[1], null, 1).slice(0, 1600));
