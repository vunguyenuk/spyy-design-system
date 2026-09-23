import fs from 'fs';
import { findColor, findNum, normColor } from './bind.mjs';
const DOM = JSON.parse(fs.readFileSync('/home/claude/out/landdom.json','utf8'));

const px = v => v == null ? null : (String(v).endsWith('rem') ? parseFloat(v)*16 : parseFloat(v));
const num = v => { const n = px(v); return Number.isFinite(n) ? +n.toFixed(2) : 0; };
const ALIGN = { 'flex-start':'MIN','start':'MIN','center':'CENTER','flex-end':'MAX','end':'MAX','baseline':'BASELINE','stretch':'MIN','normal':'MIN' };
const JUST  = { 'flex-start':'MIN','start':'MIN','center':'CENTER','flex-end':'MAX','end':'MAX','space-between':'SPACE_BETWEEN','normal':'MIN' };

// gap computes to "row column" or a single value that means both
const gaps = g => {
  if (!g || g === 'normal') return { row: 0, col: 0 };
  const parts = String(g).trim().split(/\s+/).map(num);
  return parts.length === 1 ? { row: parts[0], col: parts[0] } : { row: parts[0], col: parts[1] };
};

// Figma has no grid. A grid with one track is a column of rows; a grid with
// several tracks is a row of columns. Everything else about a landing layout —
// the gap, the alignment, the padding — carries across unchanged.
function layoutOf(s) {
  const d = s.display;
  const g = gaps(s.gap);
  if (/flex/.test(d)) {
    const vertical = /column/.test(s['flex-direction']);
    return { dir: vertical ? 'VERTICAL' : 'HORIZONTAL', gap: vertical ? g.row : g.col,
             counter: ALIGN[s['align-items']] ?? 'MIN', primary: JUST[s['justify-content']] ?? 'MIN',
             wrap: s['flex-wrap'] === 'wrap' };
  }
  if (/grid/.test(d)) {
    const tracks = String(s['grid-template-columns'] || '').trim();
    const n = tracks && tracks !== 'none' ? tracks.split(/\s+(?![^(]*\))/).length : 1;
    const vertical = n <= 1;
    return { dir: vertical ? 'VERTICAL' : 'HORIZONTAL', gap: vertical ? g.row : g.col,
             counter: ALIGN[s['justify-items']] ?? 'MIN', primary: 'MIN', wrap: false, grid: true, tracks: n };
  }
  // A block box with children stacks them vertically with no gap, which is
  // exactly what a VERTICAL auto-layout does. Leaving it as a plain frame would
  // pin the children at absolute offsets and lose the stack.
  return { dir: 'VERTICAL', gap: 0, counter: 'MIN', primary: 'MIN', wrap: false, block: true };
}

const pair = (d, l, k) => [d.style[k], l.style[k]];
const cvar = h => (h && typeof h === 'object') ? h.name : h;

function node(d, l, path) {
  const s = d.style, out = { name: path, cls: d.cls, attrs: d.attrs, kids: [] };
  const L = layoutOf(s);
  if (L) Object.assign(out, { layout: L.dir, gap: L.gap, align: L.counter, justify: L.primary,
                              wrap: L.wrap, grid: !!L.grid, tracks: L.tracks, block: !!L.block });
  out.gapVar = findNum((gaps(s.gap)[L && L.dir === 'HORIZONTAL' ? 'col' : 'row'] || 0) + 'px', '--hf-space');
  out.pad    = ['top','right','bottom','left'].map(k => num(s['padding-'+k]));
  out.padVar = ['top','right','bottom','left'].map(k => findNum(s['padding-'+k], '--hf-space'));
  out.radius = ['top-left','top-right','bottom-left','bottom-right'].map(k => num(s['border-'+k+'-radius']));
  out.radiusVar = findNum(s['border-top-left-radius'], '--hf-radius');

  const [bd, bl] = pair(d, l, 'background-color');
  if (s['background-image'] && s['background-image'] !== 'none') out.gradient = '__gradient__';
  else if (!/,\s*0\s*\)$/.test(normColor(bd) || '') && normColor(bd) !== 'transparent') {
    const hit = findColor(bd, bl, 'frameFill');
    out.fill = bd;
    if (hit && typeof hit === 'object') { out.fillVar = hit.name; out.fillOpacity = hit.opacity; }
    else out.fillVar = hit;
  }

  const bw = num(s['border-top-width']);
  const [sd, sl] = pair(d, l, 'border-top-color');
  const invisible = /,\s*0\s*\)$/.test(normColor(sd) || '');
  if (bw > 0 && !invisible) out.stroke = { w: bw, color: sd, colorVar: cvar(findColor(sd, sl, 'stroke')),
    // a single-side border is a rule, not a box: Figma needs the four weights
    sides: ['top','right','bottom','left'].map(k => num(s['border-' + k + '-width'])) };
  else if (bw > 0) out.inset = bw;

  // A `<colour> 0 0 0 Npx inset` shadow is a ring drawn inside the box — the
  // landing layer uses it so a highlighted card does not grow by two pixels.
  // Figma draws the same thing as an INSIDE stroke, so it is read back out of
  // the shadow rather than lost.
  const RING = /(rgba?\([^)]*\)|#[0-9a-f]{3,8})\s+0px 0px 0px (\d+(?:\.\d+)?)px inset/i;
  const rd = RING.exec(s['box-shadow'] || '');
  if (rd) {
    const rl = RING.exec(l.style['box-shadow'] || '');
    out.ring = { w: +rd[2], color: rd[1], colorVar: cvar(findColor(rd[1], rl ? rl[1] : rd[1], 'stroke')) };
  }

  out.w = +d.box.w.toFixed(1); out.h = +d.box.h.toFixed(1);
  if (num(s['max-width'])) out.maxW = num(s['max-width']);
  const op = parseFloat(s.opacity); if (Number.isFinite(op) && op < 1) out.opacity = +op.toFixed(2);

  if (d.text) {
    const [cd, cl] = pair(d, l, 'color');
    out.text = {
      chars: d.text.replace(/\s+/g, ' ').trim(),
      family: (s['font-family'] || '').split(',')[0].replace(/["']/g,'').trim(),
      size: num(s['font-size']), sizeVar: findNum(s['font-size'], '--hf-type-size'),
      lh: num(s['line-height']), weight: s['font-weight'],
      upper: s['text-transform'] === 'uppercase',
      ls: num(s['letter-spacing']) || 0,
      align: ({ start:'LEFT', left:'LEFT', center:'CENTER', right:'RIGHT', end:'RIGHT' })[s['text-align']] || 'LEFT',
      color: cd, colorVar: cvar(findColor(cd, cl, 'textFill')),
    };
  }
  const dk = d.kids || [], lk = l.kids || [];
  for (let i = 0; i < dk.length; i++) if (lk[i]) out.kids.push(node(dk[i], lk[i], path + '/' + i));
  if (!out.kids.length) delete out.kids;
  return out;
}

const only = process.argv[2];
const spec = {};
let bound = 0, hard = 0;
for (const [base, rec] of Object.entries(DOM)) {
  if (only && base !== only) continue;
  spec[base] = { width: rec.dark.width, variants: rec.dark.variants.map((v, i) => ({
    key: v.key, tree: node(v.tree, rec.light.variants[i].tree, 'root') })) };
}
const walk = n => {
  if (n.fill) { n.fillVar ? bound++ : hard++; }
  if (n.stroke) { n.stroke.colorVar ? bound++ : hard++; }
  if (n.text) { n.text.colorVar ? bound++ : hard++; }
  (n.kids || []).forEach(walk);
};
Object.values(spec).forEach(b => b.variants.forEach(v => walk(v.tree)));
fs.writeFileSync('/home/claude/out/land-build.json', JSON.stringify(spec));
console.log('bases', Object.keys(spec).length,
            '| variants', Object.values(spec).reduce((a,b)=>a+b.variants.length,0),
            '| bound', bound, '| hardcoded', hard);
