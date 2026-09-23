import fs from 'fs';
fs.mkdirSync('./.tokens-cache', { recursive: true });
const css = fs.readFileSync('./tokens.css','utf8');
const resolved = JSON.parse(fs.readFileSync('./.tokens-cache/resolved.json','utf8'));

// --- pull the declarations of a specific block so aliases survive ------------
function blockDecls(startRe) {
  const i = css.search(startRe); if (i < 0) return {};
  let depth = 0, j = css.indexOf('{', i), k = j;
  for (; k < css.length; k++) { if (css[k]==='{') depth++; else if (css[k]==='}') { depth--; if (!depth) break; } }
  const body = css.slice(j+1, k);
  const o = {};
  for (const m of body.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)) o[m[1]] = m[2].trim();
  return o;
}
const darkDecls  = blockDecls(/TIER 2 — SEMANTICS|--hf-color-background-primary: var\(--hf-color-shade-400\)/);
const lightDecls = blockDecls(/\[data-theme="light"\]\s*\{/);

const hexToRgba = h => {
  h = h.replace('#','');
  if (h.length===3) h = h.split('').map(c=>c+c).join('');
  if (h.length===6) h += 'ff';
  const n = p => parseInt(h.slice(p,p+2),16)/255;
  return [+n(0).toFixed(4), +n(2).toFixed(4), +n(4).toFixed(4), +n(6).toFixed(4)];
};
const isHex = v => /^#[0-9a-fA-F]{3,8}$/.test(v);
const remPx = v => v.endsWith('rem') ? parseFloat(v)*16 : v.endsWith('px') ? parseFloat(v) : v==='0'?0:null;

const R = resolved.themes.dark, L = resolved.themes.light;

// 1. PRIMITIVES ---------------------------------------------------------------
const RAMP = /^--hf-color-(blue|purple|magenta|pink|cyan|green|lime|yellow|orange|red|grey|shade|neutral)-(\d+|alpha-\d+)$/;
const ALPHA = /^--hf-color-transparent-(light|dark)-\d+$/;
const prim = { color: [], float: [], string: [] };
for (const [k,v] of Object.entries(R)) {
  if (RAMP.test(k) || ALPHA.test(k) || /^--hf-color-(red|green|yellow)-glow$/.test(k)) {
    if (isHex(v)) prim.color.push([k.replace('--hf-color-','').replace(/-/g,'/'), hexToRgba(v)]);
  }
}
for (const [pfx, grp] of [['--hf-space-','space'],['--hf-radius-','radius'],['--hf-border-width-','border'],['--hf-icon-','icon']]) {
  for (const [k,v] of Object.entries(R)) {
    if (!k.startsWith(pfx)) continue;
    const px = remPx(v); if (px===null) continue;
    prim.float.push([grp+'/'+k.slice(pfx.length), px]);
  }
}
for (const [k,v] of Object.entries(R)) if (/^--hf-type-weight-/.test(k)) prim.float.push(['weight/'+k.replace('--hf-type-weight-',''), parseFloat(v)]);
for (const [k,v] of Object.entries(R)) if (/^--hf-type-family-(display|text|mono)$/.test(k)) prim.string.push(['font/'+k.replace('--hf-type-family-',''), v.split(',')[0].replace(/["']/g,'').trim()]);

// 2. SEMANTICS (2 modes, aliased where the css aliases) ------------------------
const semNames = new Set([...Object.keys(darkDecls), ...Object.keys(lightDecls)]
  .filter(k => /^--hf-color-/.test(k) && !RAMP.test(k) && !ALPHA.test(k) && !/glow$/.test(k)));
const sem = [];
for (const name of [...semNames].sort()) {
  const mk = (decls, res) => {
    const d = decls[name];
    if (d && /^var\(\s*(--[a-zA-Z0-9-]+)\s*\)$/.test(d)) {
      const t = d.match(/^var\(\s*(--[a-zA-Z0-9-]+)\s*\)$/)[1];
      if (RAMP.test(t) || ALPHA.test(t)) return { alias: t.replace('--hf-color-','').replace(/-/g,'/') };
    }
    return isHex(res) ? { value: hexToRgba(res) } : null;
  };
  const dk = mk(darkDecls, R[name]), lt = mk(lightDecls[name]?lightDecls:darkDecls, L[name]);
  if (!dk || !lt) continue;
  sem.push([name.replace('--hf-color-','').replace(/-/g,'/'), dk, lt]);
}

// 3. TYPE SCALE (3 modes) ------------------------------------------------------
const T = resolved.type, typ = [];
for (const k of Object.keys(T.desktop).sort()) {
  const g = k.startsWith('--hf-type-size-') ? 'size/'+k.slice(15) : 'line-height/'+k.slice(22);
  typ.push([g, remPx(T.mobile[k]), remPx(T.tablet[k]), remPx(T.desktop[k])]);
}
for (const [k,v] of Object.entries(R)) if (/^--text-/.test(k)) {
  const px = remPx(v); if (px===null) continue;
  const n = k.slice(7).replace('--line-height','/line-height');
  typ.push(['scale/'+n, px, px, px]);
}

// 4. what cannot be a variable --------------------------------------------------
const effects = Object.entries(R).filter(([k])=>/^--hf-shadow-/.test(k)).map(([k,v])=>[k.slice(12), v]);
const grads   = Object.entries(R).filter(([k])=>/^--hf-gradient-/.test(k)).map(([k,v])=>[k.slice(14), v]);

fs.writeFileSync('./.tokens-cache/figma-tokens.json', JSON.stringify({prim, sem, typ, effects, grads},null,1));
console.log('primitives  colour:', prim.color.length, ' float:', prim.float.length, ' string:', prim.string.length);
console.log('semantics   :', sem.length, '(aliased:', sem.filter(s=>s[1].alias).length+')');
console.log('type scale  :', typ.length);
console.log('effects     :', effects.length, ' gradients:', grads.length);
console.log('\nsample semantic:', JSON.stringify(sem.slice(0,3)));
console.log('sample type   :', JSON.stringify(typ.slice(0,2)));
