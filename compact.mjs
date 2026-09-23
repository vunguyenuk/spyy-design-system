import fs from 'fs';
const base = process.argv[2];
const B = JSON.parse(fs.readFileSync('./.tokens-cache/build-' + base + '.json','utf8'));
// strip to what the Figma builder actually consumes
const n = t => {
  const o = {};
  if (t.layout) { o.l = t.layout[0]; o.g = t.gapVar || t.gap || 0; o.a = t.align; o.j = t.justify; }
  if (t.pad.some(v => v)) o.p = t.padVar.map((v,i) => v || t.pad[i]);
  if (t.radius.some(v => v)) o.r = t.radiusVar || t.radius[0];
  if (t.fill) o.f = t.fillVar || t.fill;
  if (t.gradient) o.gr = t.gradient;
  if (t.stroke) o.s = [t.stroke.wVar || t.stroke.w, t.stroke.colorVar || t.stroke.color];
  if (t.transform) o.tf = t.transform;
  o.wh = [Math.round(t.w*10)/10, Math.round(t.h*10)/10];
  if (t.text) o.t = { c: t.text.chars, fam: t.text.family, sz: t.text.sizeVar || t.text.size,
                      lh: t.text.lhVar || t.text.lh, w: t.text.weight, u: t.text.upper || undefined,
                      col: t.text.colorVar || t.text.color, ls: t.text.ls || undefined };
  if (t.kids) o.k = t.kids.map(n);
  return o;
};
const out = { base, variants: B.variants.map(v => ({ k: v.key, t: n(v.tree) })) };
const s = JSON.stringify(out);
fs.writeFileSync('./.tokens-cache/c-' + base + '.json', s);
console.log(base, '| variants', out.variants.length, '| bytes', s.length);
if (process.argv[3]==='-v') console.log(JSON.stringify(out.variants[0], null, 1));
