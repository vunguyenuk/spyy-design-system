import fs from 'fs';
const S = JSON.parse(fs.readFileSync('/home/claude/out/land-build.json','utf8'));

// The build spec carries every measured property. Most of them are zero, null,
// or the Figma default, and a frame does not need to be told it has no padding.
// Packing drops those so the script that goes over the wire is the design,
// not the measurement.
const INST = c => {
  if (/\bspy-btn\b/.test(c)) return 'btn';
  if (/\bspy-icon-tile\b/.test(c)) return 'tile';
  if (/\bspy-badge\b/.test(c)) return 'badge';
  if (/\bspy-icon\b/.test(c)) return 'icon';
  return null;
};

function pack(n) {
  const o = {};
  const inst = INST(n.cls);
  if (inst) {
    o.i = inst; o.w = n.w; o.h = n.h;
    o.at = { ...(n.attrs || {}) };
    // a tile's icon lives in its child, so it has to be lifted onto the tile
    if (!o.at.icon) {
      const deepIcon = x => { for (const c of (x.kids || [])) { if (c.attrs && c.attrs.icon) return c.attrs.icon; const r = deepIcon(c); if (r) return r; } return null; };
      const ic = deepIcon(n); if (ic) o.at.icon = ic;
    }
    // an icon or a badge carries its label in a child, not in its own text node
    const label = n.text ? n.text.chars : (function deep(x) {
      for (const c of (x.kids || [])) { if (c.text) return c.text.chars; const r = deep(c); if (r) return r; }
      return null; })(n);
    if (label) o.t = label;
    if (n.radius[0]) o.r = n.radius[0];
    if (n.fillVar) o.fv = n.fillVar;
    return o;
  }
  // A block wrapper that holds one narrower child is centring it with an auto
  // margin — the one flex property a computed style does not hand back.
  if (n.block && n.kids && n.kids.length === 1) {
    const inner = n.w - (n.pad[1] + n.pad[3]);
    if (n.kids[0].w < inner - 1) n.align = 'CENTER';
  }
  if (n.layout) { o.L = n.layout[0]; if (n.gap) o.g = n.gap; if (n.align !== 'MIN') o.a = n.align; if (n.justify !== 'MIN') o.j = n.justify; if (n.wrap) o.wr = 1; }
  const p = n.pad;
  if (p.some(x => x)) o.p = (p[0] === p[2] && p[1] === p[3]) ? (p[0] === p[1] ? [p[0]] : [p[0], p[1]]) : p;
  if (n.radius[0]) o.r = n.radius[0];
  if (n.fillVar) o.fv = n.fillVar;
  if (n.fillOpacity != null && n.fillOpacity < 1) o.fo = n.fillOpacity;
  if (n.gradient) o.grad = 1;
  if (n.stroke) o.s = [n.stroke.w, n.stroke.colorVar, n.stroke.sides];
  if (n.ring) o.ring = [n.ring.w, n.ring.colorVar];
  if (n.opacity) o.o = n.opacity;
  o.w = n.w; o.h = n.h;
  if (n.maxW && n.maxW < 9999) o.mw = n.maxW;
  if (n.text) {
    o.t = n.text.chars;
    o.tf = [n.text.family, n.text.weight, n.text.size, n.text.lh, +n.text.ls.toFixed(2), n.text.upper ? 1 : 0, n.text.align[0]];
    o.tc = n.text.colorVar;
  }
  // a line break or an empty span serialises to a zero-area box; Figma would
  // take it as a real child and open a gap where the markup has none
  const kids = (n.kids || []).filter(k => (k.w > 0 && k.h > 0) || k.text);
  if (kids.length) o.k = kids.map(pack);
  return o;
}

const out = {};
for (const [base, rec] of Object.entries(S)) {
  out[base] = { width: rec.width, variants: rec.variants.map(v => ({ key: v.key, t: pack(v.tree) })) };
}
fs.writeFileSync('/home/claude/out/land-pack.json', JSON.stringify(out));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(20), (JSON.stringify(v).length/1024).toFixed(1)+'KB');
