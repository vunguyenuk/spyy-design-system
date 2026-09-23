import fs from 'fs';
const R = JSON.parse(fs.readFileSync('./.tokens-cache/resolved.json','utf8'));
const CS = JSON.parse(fs.readFileSync('./.tokens-cache/codesyntax.json','utf8')); // figmaName -> cssVar
const cssToFigma = Object.fromEntries(Object.entries(CS).map(([f,c]) => [c, f]));

// --- normalise everything to one comparable form ---------------------------
const hexToRgb = h => {
  h = h.replace('#','');
  if (h.length === 3) h = h.split('').map(c=>c+c).join('');
  const n = i => parseInt(h.slice(i,i+2),16);
  const a = h.length > 6 ? n(6)/255 : 1;
  return a >= 1 ? `rgb(${n(0)}, ${n(2)}, ${n(4)})`
                : `rgba(${n(0)}, ${n(2)}, ${n(4)}, ${+a.toFixed(2)})`;
};
export const normColor = v => {
  if (!v) return null;
  v = v.trim();
  if (v.startsWith('#')) return hexToRgb(v);
  const m = v.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    const a = p.length > 3 ? p[3] : 1;
    return a >= 1 ? `rgb(${p[0]}, ${p[1]}, ${p[2]})`
                  : `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${+a.toFixed(2)})`;
  }
  return v;
};
const toPx = v => {
  if (v == null) return null;
  const s = String(v).trim();
  if (s.endsWith('rem')) return +(parseFloat(s) * 16).toFixed(4);
  if (s.endsWith('px'))  return +parseFloat(s).toFixed(4);
  if (/^-?[\d.]+$/.test(s)) return +parseFloat(s).toFixed(4);
  return null;
};

// --- index: a variable is identified by the PAIR of its two theme values ----
// Matching both themes at once is what makes the guess safe: dozens of tokens
// share a dark value, far fewer share both.
const D = R.themes.dark, L = R.themes.light;
const colorPair = new Map(), numExact = new Map();
const rank = name => {
  const f = cssToFigma[name];
  if (!f) return -1;
  if (f.startsWith('color/')) return 1;      // primitive — last resort
  if (/^(size|line-height|scale)\//.test(f)) return 2;
  if (/^(space|radius|border|icon|weight|font)\//.test(f)) return 2;
  return 3;                                   // semantic — always preferred
};
for (const name of Object.keys(D)) {
  if (!cssToFigma[name]) continue;
  const dv = D[name], lv = L[name];
  if (typeof dv !== 'string') continue;
  if (/^(#|rgb)/.test(dv.trim())) {
    const k = normColor(dv) + '|' + normColor(lv);
    (colorPair.get(k) || colorPair.set(k, []).get(k)).push(name);
  }
  const px = toPx(dv);
  if (px !== null && toPx(lv) === px) {
    (numExact.get(px) || numExact.set(px, []).get(px)).push(name);
  }
}
// Several roles can share a value pair — background/primary and text/inverse are
// the same two colours, one per theme. The pair alone cannot separate them; what
// the value is being used FOR can. So the caller says the role and that decides.
const ROLE_PREF = {
  frameFill: ['background/', 'surface/', 'button/', 'state/', 'skeleton', 'glass/', 'separator/'],
  textFill:  ['text/', 'icon/', 'state/'],
  stroke:    ['border/', 'divider/', 'state/'],
  effect:    ['shadow/', 'state/'],
};
const best = (list, role) => {
  if (!list || !list.length) return null;
  const pref = ROLE_PREF[role] || [];
  const score = n => {
    const f = cssToFigma[n]; if (!f) return -99;
    const i = pref.findIndex(p => f.startsWith(p));
    return (i >= 0 ? 100 - i : 0) + rank(n);
  };
  return cssToFigma[list.slice().sort((a, b) => score(b) - score(a) || a.length - b.length)[0]];
};

export const findColor = (darkVal, lightVal, role) => {
  const k = normColor(darkVal) + '|' + normColor(lightVal);
  return best(colorPair.get(k), role);
};
export const findNum = (v, family) => {
  const px = toPx(v);
  if (px === null) return null;
  const list = (numExact.get(px) || []).filter(n => !family || n.startsWith(family));
  return best(list);
};

if (process.argv[2] === '--selftest') {
  const t = [
    ['rgb(21, 21, 21)', 'rgb(255, 255, 255)', 'frameFill', 'bg primary'],
    ['rgb(21, 21, 21)', 'rgb(255, 255, 255)', 'textFill',  'ink on light'],
    ['rgb(255, 255, 255)', 'rgb(21, 21, 21)', 'textFill',  'text primary'],
    ['rgb(255, 255, 255)', 'rgb(21, 21, 21)', 'frameFill', 'inverse surface'],
    ['rgb(209, 254, 23)', 'rgb(209, 254, 23)', 'frameFill', 'brand lime fill'],
    ['rgb(0, 107, 226)', 'rgb(0, 107, 226)', 'frameFill', 'badge blue fill'],
  ];
  for (const [d,l,role,label] of t) console.log(label.padEnd(16), role.padEnd(10), '->', findColor(d,l,role));
  for (const [v,f,label] of [['16px','--hf-space','space 16'],['12px','--hf-radius','radius 12'],
                             ['0.75rem','--hf-type-size','font 12'],['1px','--hf-border','border 1']])
    console.log(label.padEnd(14), '->', findNum(v,f));
  console.log('colour pairs indexed:', colorPair.size, ' numeric values:', numExact.size);
}
