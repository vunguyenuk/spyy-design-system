import fs from 'fs';
const T = JSON.parse(fs.readFileSync('./.tokens-cache/figma-tokens.json','utf8'));

const hex = c => {
  if (typeof c === 'string') return c;
  const [r,g,b,a] = c;
  const h = v => Math.round(v*255).toString(16).padStart(2,'0');
  return '#'+h(r)+h(g)+h(b)+(a < 1 ? h(a) : '');
};
const collisions = [];
// A token whose name is a PREFIX of another token's name cannot be a plain leaf
// in a nested tree. The W3C group convention is to demote it to a "DEFAULT"
// child, which is what every importer expects.
const put = (root, path, val) => {
  const parts = path.split('/');
  let n = root;
  for (const p of parts.slice(0,-1)) {
    if (n[p] && n[p].$type) { n[p] = { DEFAULT: n[p] }; collisions.push(p); }
    n = (n[p] ||= {});
  }
  const leaf = parts.at(-1);
  if (n[leaf] && !n[leaf].$type) { n[leaf].DEFAULT = val; collisions.push(leaf); }
  else n[leaf] = val;
};

const out = {
  $description: 'Spyy Design System tokens. Generated from tokens.css by w3c.mjs — do not hand-edit.',
  primitive: {}, semantic: {}, type: {},
};

for (const [name, v] of T.prim.color) put(out.primitive, 'color/' + name, { $type:'color', $value: hex(v) });
for (const [name, v] of T.prim.float)  put(out.primitive, name, { $type:'dimension', $value: v + 'px' });
for (const [name, v] of T.prim.string) put(out.primitive, name, { $type:'fontFamily', $value: v });

// Primitive colours live under primitive.color.*, mirroring the Figma
// variable names (color/<hue>/<step>), so a reference has to carry that prefix.
const ref = s => (s && s.alias)
  ? '{primitive.color.' + s.alias.split('/').join('.') + '}'
  : hex(s && s.value !== undefined ? s.value : s);

for (const [name, d, l] of T.sem) {
  put(out.semantic, name, { $type:'color', $value: ref(d),
    $extensions: { 'com.spyy.modes': { dark: ref(d), light: ref(l) } } });
}

// The ten semantic tokens that live in the addendum blocks, added by hand to
// match what was pushed to Figma.
const EXTRA = [
  ['glass/dark',           '#212121bf',            '#212121bf'],
  ['glass/light',          '#f5f5f5bf',            '#f5f5f5bf'],
  ['magenta/alpha',        '#ab3ec166',            '#ab3ec166'],
  ['separator/success',    '{primitive.color.green.500}',  '{primitive.color.green.500}'],
  ['skeleton',             '{primitive.color.shade.250}',  '{primitive.color.grey.125}'],
  ['state/error-glow',     '{primitive.color.red.glow}',   '{primitive.color.red.glow}'],
  ['state/success-glow',   '{primitive.color.green.glow}', '{primitive.color.green.glow}'],
  ['state/warning-glow',   '{primitive.color.yellow.glow}','{primitive.color.yellow.glow}'],
  ['text/on-tint',         '{primitive.color.grey.550}',   '{primitive.color.grey.550}'],
  ['text/on-tint-inverse', '{primitive.color.grey.050}',   '{primitive.color.grey.050}'],
];
for (const [name, d, l] of EXTRA)
  put(out.semantic, name, { $type:'color', $value: d, $extensions:{ 'com.spyy.modes': { dark:d, light:l } } });

for (const [name, m, t, d] of T.typ)
  put(out.type, name, { $type:'dimension', $value: d + 'px',
    $extensions: { 'com.spyy.modes': { desktop: d+'px', tablet: t+'px', mobile: m+'px' } } });

out.$extensions = {
  'com.spyy.figma': {
    fileKey: 'HxFdyOnSbDlrZ6tNhblWtD',
    collections: { primitive: '1. Primitives', semantic: '2. Semantic', type: '3. Type scale' },
    modes: { primitive: ['Value'], semantic: ['Dark','Light'], type: ['Desktop','Tablet','Mobile'] },
    styles: { effects: 'elevation/*', gradients: 'gradient/*' },
    note: 'Gradients and shadows are Figma STYLES, not variables: Figma has no gradient or effect variable type.',
  },
};

fs.writeFileSync('./tokens.w3c.json', JSON.stringify(out, null, 2) + '\n');
const cnt = o => { let n=0; (function w(x){ for (const k in x) { if (k[0]==='$') continue; const v=x[k];
  if (v && v.$type) n++; else if (v && typeof v==='object') w(v); } })(o); return n; };
console.log('primitive', cnt(out.primitive), 'semantic', cnt(out.semantic), 'type', cnt(out.type));
console.log('demoted to DEFAULT:', [...new Set(collisions)].join(', '));
