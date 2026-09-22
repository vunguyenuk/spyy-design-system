/* ============================================================================
   Documentation page behaviour + token-grid rendering.
   The manifest below is the audit record: token names and the role each plays.
   Foundations render from it, so this page can never drift from the tokens.
   ========================================================================= */
(() => {
'use strict';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, attrs = {}, html = '') => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === true) n.setAttribute(k, '');
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  if (html) n.innerHTML = html;
  return n;
};
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/* ---------------------------------------------------------------- MANIFEST */
const STEPS12 = ['100','200','300','400','500','600','700','800','900','1000','1100','1200'];
const RAMPS = {
  cool:    ['050','100','150','200','250','300','350','400'],
  grey:    ['050','100','150','200','250','300','325','350','400','450','500','550','600'],
  neutral: ['050','100','150','200','250','300','350','400','450','500','550','600'],
  lime: STEPS12, pink: STEPS12, red: STEPS12, green: STEPS12, yellow: STEPS12,
  orange: STEPS12, blue: STEPS12, purple: STEPS12, cyan: STEPS12,
};
const ALPHA = {
  light: ['05','10','15','20','30','40','50','60','70','80','90','100'],
  dark:  ['05','10','12','15','20','25','30','32','40','50','60','70','80','90','100'],
  lime:  ['05','10','15','20','30','40','50','60','70','80','90','100'],
  pink:  ['05','10','15','20','30','40','50','60','70','80','90','100'],
};
const SPACE = ['0','050','100','150','200','250','300','400','500','600','700','800','1000','1200','1400','1600','2000','2400'];
const RADIUS = ['0','050','100','150','200','250','300','400','500','600','full'];
const DURATIONS = ['instant','fast','normal','slow','slower','80','120','130','150','160','180','220','260','350','400','700','800','1000','1200','1300','1400'];
const ICONS = ['close','check','minus','plus','chevron-down','chevron-right','chevron-left','chevron-up','arrow-right','arrow-up','search','sparkle','image','video','audio','play','pause','volume','fullscreen','download','upload','settings','user','folder','layers','grid','list','filter','more','pin','trash','copy','link','info','warning','error','success','sun','moon','bell','crop','wand','refresh','lock'];
const SEMANTIC_GROUPS = [
  { title: 'Background', items: [
    ['--hf-color-background-primary', 'page — the floor everything sits on'],
    ['--hf-color-background-secondary', 'card, panel'],
    ['--hf-color-background-secondary-strong', 'raised panel, neutral fills'],
    ['--hf-color-background-tertiary', 'progress track, inset well'],
    ['--hf-color-background-section', 'alternating section band'],
    ['--hf-color-background-elevated-start', 'gradient start / media fallback'],
    ['--hf-color-background-elevated-end', 'gradient end / sidebar surface'],
    ['--hf-color-background-glass', 'modal, dropdown, toast — 75% + blur'],
    ['--hf-color-background-inverse', 'tooltip, toast action'],
  ]},
  { title: 'Border & divider', items: [
    ['--hf-color-border-subtle', 'hairline ring on glass and cards'],
    ['--hf-color-border-default', 'field, chip, outline button'],
    ['--hf-color-border-strong', 'hover fills, dim overlays'],
    ['--hf-color-border-focus', 'the focus ring — brand, always'],
    ['--hf-color-border-error', 'invalid field ring'],
    ['--hf-color-divider-primary', 'menu separator, table row'],
    ['--hf-color-divider-secondary', 'quieter divider'],
  ]},
  { title: 'Text', items: [
    ['--hf-color-text-primary', 'headings, active nav, values'],
    ['--hf-color-text-secondary', 'body support, descriptions'],
    ['--hf-color-text-tertiary', 'resting tabs and nav — deliberately dim'],
    ['--hf-color-text-inverse', 'on brand and on white'],
    ['--hf-color-text-disabled', 'disabled labels'],
    ['--hf-color-text-brand', 'links, brand emphasis'],
    ['--hf-color-text-on-overlay-secondary', 'placeholder, meta on glass'],
    ['--hf-color-text-on-overlay-tertiary', 'faintest legible on glass'],
  ]},
  { title: 'Icon — a parallel ramp, not shared with text', items: [
    ['--hf-color-icon-primary', 'active and standalone icons'],
    ['--hf-color-icon-secondary', 'icons inside rows and fields'],
    ['--hf-color-icon-tertiary', 'decorative, trailing affordances'],
    ['--hf-color-icon-accent', 'checked controls, selected chips'],
    ['--hf-color-icon-disabled', 'disabled glyphs'],
  ]},
  { title: 'Button', items: [
    ['--hf-color-button-brand', 'the lime key'],
    ['--hf-color-button-primary', 'inverted key — white on dark'],
    ['--hf-color-button-secondary', 'secondary hover fill'],
    ['--hf-color-button-tertiary', 'switch track'],
    ['--hf-color-button-destructive', 'danger key'],
    ['--hf-color-button-disabled', 'flat disabled fill (app ladder)'],
  ]},
  { title: 'Overlay', items: [
    ['--hf-color-overlay-hover', 'the universal hover — 5% white'],
    ['--hf-color-overlay-dim-soft', 'field and composer fill'],
    ['--hf-color-overlay-dim-strong', 'ghost button hover'],
    ['--hf-color-overlay-scrim', 'modal backdrop'],
  ]},
  { title: 'State', items: [
    ['--hf-color-state-error-fg', 'error text and ring'],
    ['--hf-color-state-error-bg', 'error surface'],
    ['--hf-color-state-error-glow', 'error focus ring'],
    ['--hf-color-state-success-fg', 'success text'],
    ['--hf-color-state-success-bg', 'success surface'],
    ['--hf-color-state-warning-fg', 'warning text'],
    ['--hf-color-state-warning-bg', 'warning surface'],
    ['--hf-color-state-info-fg', 'info text'],
    ['--hf-color-state-info-bg', 'info surface'],
  ]},
  { title: 'Brand', items: [
    ['--hf-color-brand-primary', 'lime — the single brand colour'],
    ['--hf-color-brand-pink', 'secondary brand — promos, "TOP"'],
    ['--hf-color-brand-blue', 'tertiary accent — badges'],
    ['--hf-color-notification-unread', 'unread dot'],
  ]},
];
const HEIGHTS = [
  ['Badge', 14, 'skewed marker'],
  ['Button xxs / Chip xs', 24, 'inline actions'],
  ['Chip sm / Nav item', 28, 'top bar'],
  ['Chip md / Button xs', 32, ''],
  ['Nav action', 36, 'icon buttons in the bar'],
  ['Menu item / table row', 36, 'minimum, can grow'],
  ['Sidebar row', 36, ''],
  ['Field / Select / Button sm', 40, 'the workhorse control height'],
  ['Button md / Toggle lg', 48, ''],
  ['Nav bar', 52, 'minimum'],
  ['Button lg', 56, 'inferred'],
  ['Textarea floor', 80, ''],
];
const TYPE_SPECIMEN = [
  ['--text-display', 'Display', 'Turn a prompt into a shot', 900, 'primary'],
  ['--text-h1', 'H1', 'Cinema, generated', 700, 'primary'],
  ['--text-h2', 'H2', 'Every frame on purpose', 700, 'primary'],
  ['--text-h3', 'H3', 'Direct the model', 700, 'primary'],
  ['--text-h4', 'H4', 'Reference, prompt, render', 700, 'primary'],
  ['--text-h5', 'H5', 'Shot list and coverage', 600, 'primary'],
  ['--text-h6', 'H6', 'Generation settings', 600, 'primary'],
  ['--text-body-l', 'Body L', 'The system underneath the product, not one inspired by it.', 400, 'secondary'],
  ['--text-body-m', 'Body M', 'Every value read out of the product rather than chosen.', 400, 'secondary'],
  ['--text-body-s', 'Body S', 'Confirmed where the product answered; labelled where it did not.', 400, 'secondary'],
  ['--text-caption-l', 'Caption L', 'Control labels, table cells, menu items.', 400, 'secondary'],
  ['--text-caption-m', 'Caption M', 'Descriptions, helper text, metadata.', 400, 'secondary'],
  ['--text-caption-s', 'Caption S', 'Tags, credit costs, timestamps.', 400, 'secondary'],
];
const ELEVATION = [
  ['--hf-shadow-sheen', 'the base move — a 2px inset top highlight, nothing else'],
  ['--hf-shadow-raised', 'sheen + soft ambient — cards, panels'],
  ['--hf-shadow-raised-sm', 'the tight one used on inverted buttons'],
  ['--hf-shadow-modal', 'sheen + a very tight shadow — the modal leans on blur, not depth'],
  ['--hf-shadow-overlay', 'sheen + wider ambient — dropdowns, stacked toasts'],
  ['--hf-shadow-inset-tile', 'media thumbnails — the inset highlight reads as a bevel'],
  ['--hf-shadow-thumb-soft', 'switch thumb at rest'],
  ['--hf-shadow-thumb-strong', 'switch thumb when on'],
];
const EASINGS = [
  ['in', 'accelerate away'],
  ['out', 'the default — decelerate in'],
  ['in-out', 'symmetric'],
  ['linear', 'spinners only'],
  ['spring', 'overshoots — radio dot, playful affordances'],
  ['out-expo', 'long tail — popovers, chevrons'],
  ['emphasized', 'nav flyout resizing'],
  ['swift', 'switch thumb — quick, then settles'],
  ['in-out-circ', 'progress fill — accelerates through the middle'],
  ['out-quart', 'toast enter and swipe'],
];

/* ------------------------------------------------------------ COPY ON CLICK */
function copy(text, node) {
  const done = () => {
    const t = el('span', { class: 'doc-copied' }, 'copied');
    const r = node.getBoundingClientRect();
    t.style.left = (r.left + r.width / 2 - 24) + 'px';
    t.style.top = (r.top - 26) + 'px';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 900);
  };
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
  else done();
}

/* ------------------------------------------------------------- RENDER: COLOR */
function swatch(name, role) {
  const val = cssVar(name) || '—';
  const transparent = /^#([0-9a-f]{8}|[0-9a-f]{4})$/i.test(val);
  const b = el('button', { class: 'doc-swatch', type: 'button', title: name });
  b.appendChild(el('span', { class: 'doc-swatch-chip' + (transparent ? ' doc-checker' : ''), style: `background:${val}` }));
  const m = el('div', { class: 'doc-swatch-meta' });
  if (role) m.appendChild(el('div', { class: 'doc-swatch-role' }, role));
  m.appendChild(el('div', { class: 'doc-swatch-name' }, name.replace('--hf-color-', '')));
  m.appendChild(el('div', { class: 'doc-swatch-val' }, val));
  b.appendChild(m);
  b.addEventListener('click', () => copy(`var(${name})`, b));
  return b;
}

function renderColorSemantic() {
  const host = $('#render-color-semantic'); if (!host) return;
  host.innerHTML = '';
  SEMANTIC_GROUPS.forEach(g => {
    const h = el('h3', { class: 'spy-h6 doc-sub' });
    h.append(document.createTextNode(g.title + ' '), el('span', { class: 'doc-ev', 'data-ev': 'c' }, 'Confirmed'));
    host.appendChild(h);
    const grid = el('div', { class: 'doc-swatches' });
    g.items.forEach(([n, role]) => grid.appendChild(swatch(n, role)));
    host.appendChild(grid);
  });
}

function ramp(label, names, steps, checker) {
  const wrap = el('div', { class: 'doc-ramp' });
  wrap.appendChild(el('div', { class: 'doc-ramp-name' }, label));
  const row = el('div', { class: 'doc-ramp-row' + (checker ? ' doc-checker' : '') });
  steps.forEach((s, i) => {
    const name = names(s);
    const v = cssVar(name);
    const cell = el('div', { class: 'doc-ramp-step', style: `background:${v}`, title: `${name} · ${v}` });
    const dark = checker ? '#fff' : (parseInt(s, 10) >= 500 ? '#fff' : '#000');
    cell.appendChild(el('span', { style: `color:${dark}` }, s));
    cell.addEventListener('click', () => copy(`var(${name})`, cell));
    row.appendChild(cell);
  });
  wrap.appendChild(row);
  return wrap;
}

function renderRamps() {
  const host = $('#render-color-palettes'); if (!host) return;
  host.innerHTML = '';
  Object.entries(RAMPS).forEach(([r, steps]) => {
    host.appendChild(ramp(`--hf-color-${r}-*`, s => `--hf-color-${r}-${s}`, steps, false));
  });
}

function renderAlpha() {
  const host = $('#render-color-alpha'); if (!host) return;
  host.innerHTML = '';
  const map = { light: 'transparent-light', dark: 'transparent-dark', lime: 'lime-alpha', pink: 'pink-alpha' };
  Object.entries(ALPHA).forEach(([k, steps]) => {
    host.appendChild(ramp(`--hf-color-${map[k]}-*`, s => `--hf-color-${map[k]}-${s}`, steps, true));
  });
}

/* ------------------------------------------------------ RENDER: FOUNDATIONS */
function renderTypeSpecimen() {
  const host = $('#render-type-specimen'); if (!host) return;
  host.innerHTML = '';
  TYPE_SPECIMEN.forEach(([tok, label, text, weight, fam]) => {
    const size = parseFloat(cssVar(tok));
    const track = size >= 1.75 ? '-2%' : size >= 1 ? '-1%' : '0';
    const row = el('div', { style: 'padding:16px 0;border-bottom:1px solid var(--hf-color-border-subtle)' });
    const meta = el('div', { class: 'spy-row', style: 'gap:12px;margin-bottom:8px' });
    meta.appendChild(el('span', { class: 'doc-state-label' }, label));
    meta.appendChild(el('code', {}, `${cssVar(tok)} / ${cssVar(tok + '--line-height')} · ${weight} · ${track}`));
    row.appendChild(meta);
    row.appendChild(el('div', {
      style: `font-family:var(--hf-type-family-${fam});font-size:var(${tok});line-height:var(${tok}--line-height);font-weight:${weight};letter-spacing:${track};color:var(--hf-color-text-${fam === 'primary' ? 'primary' : 'secondary'})`
    }, text));
    host.appendChild(row);
  });
  const caps = el('div', { style: 'margin-top:28px;display:flex;flex-direction:column;gap:16px' });
  caps.appendChild(el('span', { class: 'doc-state-label' }, 'Space Grotesk · uppercase · -4% tracking'));
  caps.appendChild(el('div', { class: 'spy-grotesk spy-caps', style: 'font-size:var(--hf-type-size-800);line-height:1.1' }, 'Sign up and get your extra discount'));
  caps.appendChild(el('span', { class: 'doc-state-label' }, 'IBM Plex Mono · parameters and seeds'));
  caps.appendChild(el('div', { class: 'spy-mono spy-text-secondary', style: 'font-size:var(--hf-type-size-200)' }, 'seed 44127 · cfg 3.5 · 1920x1080 · 24fps'));
  host.appendChild(caps);
}

function renderSpace() {
  const host = $('#render-space'); if (!host) return;
  const rows = el('div', { class: 'doc-scale-rows' });
  SPACE.forEach(s => {
    const v = cssVar(`--hf-space-${s}`) || '0';
    const px = v.endsWith('rem') ? parseFloat(v) * 16 : parseFloat(v) || 0;
    const r = el('div', { class: 'doc-scale-row' });
    r.appendChild(el('code', {}, `space-${s}`));
    r.appendChild(el('code', {}, `${px}px`));
    const w = el('div');
    w.appendChild(el('div', { class: 'doc-scale-bar', style: `width:${Math.max(px, 1)}px` }));
    r.appendChild(w);
    rows.appendChild(r);
  });
  host.innerHTML = '';
  host.appendChild(rows);
}

function renderHeights() {
  const host = $('#render-heights'); if (!host) return;
  const rows = el('div', { class: 'doc-scale-rows' });
  HEIGHTS.forEach(([label, px, note]) => {
    const r = el('div', { class: 'doc-scale-row' });
    r.appendChild(el('span', { class: 'spy-caption-l' }, label));
    r.appendChild(el('code', {}, `${px}px`));
    const w = el('div', { class: 'spy-row', style: 'gap:10px' });
    w.appendChild(el('div', { style: `width:${px * 2}px;height:${px}px;border-radius:4px;background:var(--hf-color-background-tertiary);box-shadow:inset 0 0 0 1px var(--hf-color-border-strong)` }));
    if (note) w.appendChild(el('span', { class: 'spy-caption-m spy-text-tertiary' }, note));
    r.appendChild(w);
    rows.appendChild(r);
  });
  host.innerHTML = '';
  host.appendChild(rows);
}

function renderRadius() {
  const host = $('#render-radius'); if (!host) return;
  const grid = el('div', { class: 'doc-radius-grid' });
  RADIUS.forEach(s => {
    const name = `--hf-radius-${s}`;
    const v = cssVar(name);
    const cell = el('div', { class: 'doc-radius-cell' });
    cell.appendChild(el('div', { class: 'doc-radius-box', style: `border-radius:var(${name})` }));
    cell.appendChild(el('code', {}, `${s} · ${v.endsWith('rem') ? parseFloat(v) * 16 + 'px' : v}`));
    grid.appendChild(cell);
  });
  host.innerHTML = '';
  host.appendChild(grid);
}

function renderBorder() {
  const host = $('#render-border'); if (!host) return;
  host.innerHTML = '';
  const grid = el('div', { class: 'doc-grid-2' });

  const widths = el('div', { class: 'doc-panel' });
  widths.appendChild(el('span', { class: 'doc-ev', 'data-ev': 'c' }, 'Confirmed'));
  widths.appendChild(el('h3', { class: 'spy-h6 doc-sub' }, 'Widths'));
  const wl = el('div', { class: 'doc-scale-rows' });
  [['none','0px','—'],
   ['hairline','0.5px','sub-pixel rims on media tiles'],
   ['thin','1px','structure: dividers, card rings'],
   ['medium','1.5px','weight: control borders, focus rings'],
   ['thick','2px','reserved on buttons; focus ring offset']].forEach(([n, v, use]) => {
    const r = el('div', { class: 'doc-scale-row' });
    r.appendChild(el('code', {}, n));
    r.appendChild(el('code', {}, v));
    const box = el('div');
    box.appendChild(el('div', { style: `height:28px;border-radius:8px;border:${v} solid var(--hf-color-border-strong);margin-bottom:4px` }));
    box.appendChild(el('span', { class: 'spy-caption-m spy-text-tertiary' }, use));
    r.appendChild(box);
    wl.appendChild(r);
  });
  widths.appendChild(wl);
  grid.appendChild(widths);

  const colors = el('div', { class: 'doc-panel' });
  colors.appendChild(el('span', { class: 'doc-ev', 'data-ev': 'c' }, 'Confirmed'));
  colors.appendChild(el('h3', { class: 'spy-h6 doc-sub' }, 'Colours & dividers'));
  const cg = el('div', { class: 'doc-swatches' });
  ['--hf-color-border-subtle','--hf-color-border-default','--hf-color-border-strong',
   '--hf-color-border-focus','--hf-color-border-error','--hf-color-divider-primary',
   '--hf-color-divider-secondary'].forEach(n => cg.appendChild(swatch(n)));
  colors.appendChild(cg);
  colors.appendChild(el('p', { class: 'spy-caption-m spy-text-secondary doc-note' },
    'All alpha-white. A solid grey border is the clearest single tell that a component did not come from this system.'));
  grid.appendChild(colors);
  host.appendChild(grid);
}

function renderElevation() {
  const host = $('#render-elevation'); if (!host) return;
  const grid = el('div', { class: 'doc-elev-grid' });
  ELEVATION.forEach(([name, note]) => {
    const cell = el('div', { class: 'doc-elev-cell', style: `box-shadow:var(${name})` });
    cell.appendChild(el('div', { class: 'spy-caption-l' }, note));
    cell.appendChild(el('code', { class: 'doc-elev-name' }, name.replace('--hf-shadow-', 'shadow-')));
    grid.appendChild(cell);
  });
  host.innerHTML = '';
  host.appendChild(grid);
}

function renderIconSizes() {
  const host = $('#render-icon-sizes'); if (!host) return;
  const rows = el('div', { class: 'doc-scale-rows' });
  [['xs','12px','inline with 10px text, sidebar pin'],
   ['sm','16px','nav actions, 32px controls'],
   ['md','20px','default — fields, menus, 40px controls'],
   ['lg','24px','48px controls, section headers'],
   ['xl','28px','empty states, hero affordances']].forEach(([k, px, use]) => {
    const r = el('div', { class: 'doc-scale-row' });
    r.appendChild(el('code', {}, `icon-${k}`));
    r.appendChild(el('code', {}, px));
    const w = el('div', { class: 'spy-row', style: 'gap:10px' });
    w.innerHTML = `<svg class="spy-icon" data-size="${k}"><use href="#i-sparkle"/></svg><span class="spy-caption-m spy-text-tertiary">${use}</span>`;
    r.appendChild(w);
    rows.appendChild(r);
  });
  host.innerHTML = '';
  host.appendChild(rows);
}

function renderIconGrid() {
  const host = $('#render-icon-grid'); if (!host) return;
  const grid = el('div', { class: 'doc-icon-grid' });
  ICONS.forEach(n => {
    const cell = el('div', { class: 'doc-icon-cell' });
    cell.innerHTML = `<svg class="spy-icon" data-size="lg"><use href="#i-${n}"/></svg><span>${n}</span>`;
    grid.appendChild(cell);
  });
  host.innerHTML = '';
  host.appendChild(grid);
}

function renderMotion() {
  const host = $('#render-motion'); if (!host) return;
  host.innerHTML = '';
  host.appendChild(el('h3', { class: 'spy-h6 doc-sub' }, 'Durations'));
  const dg = el('div', { class: 'doc-swatches' });
  DURATIONS.forEach(d => {
    const name = `--hf-duration-${d}`;
    const b = el('button', { class: 'doc-swatch', type: 'button', style: 'padding:12px 14px' });
    b.appendChild(el('div', { class: 'doc-swatch-name' }, `duration-${d}`));
    b.appendChild(el('div', { class: 'doc-swatch-val' }, cssVar(name)));
    b.addEventListener('click', () => copy(`var(${name})`, b));
    dg.appendChild(b);
  });
  host.appendChild(dg);

  host.appendChild(el('h3', { class: 'spy-h6 doc-sub' }, 'Easings — click a card to run it'));
  const eg = el('div', { class: 'doc-motion-grid' });
  EASINGS.forEach(([k, note]) => {
    const name = `--hf-ease-${k}`;
    const cell = el('div', { class: 'doc-motion-cell', style: `--doc-ease:var(${name});--doc-dur:700ms` });
    cell.appendChild(el('div', { class: 'spy-caption-l' }, `ease-${k}`));
    const rail = el('div', { class: 'doc-motion-rail' });
    rail.appendChild(el('div', { class: 'doc-motion-dot' }));
    cell.appendChild(rail);
    cell.appendChild(el('div', { class: 'spy-caption-m spy-text-secondary' }, note));
    cell.appendChild(el('code', { class: 'doc-elev-name' }, cssVar(name)));
    cell.addEventListener('click', () => cell.toggleAttribute('data-run'));
    eg.appendChild(cell);
  });
  host.appendChild(eg);
}

function renderLayout() {
  const host = $('#render-layout'); if (!host) return;
  host.innerHTML = '';
  const grid = el('div', { class: 'doc-grid-2' });

  const l = el('div', { class: 'doc-panel' });
  l.appendChild(el('span', { class: 'doc-ev', 'data-ev': 'c' }, 'Confirmed'));
  l.appendChild(el('h3', { class: 'spy-h6 doc-sub' }, 'Container & gutters'));
  l.appendChild(el('ul', { class: 'doc-defs' },
    '<li><strong>1536px max</strong><span>the content container caps here and centres</span></li>' +
    '<li><strong>16px gutter</strong><span>page margin at every width — it does not grow</span></li>' +
    '<li><strong>24px section padding</strong><span>inside cards and sections from 768px up</span></li>' +
    '<li><strong>768 / 1024 / 1280</strong><span>breakpoints; the type scale steps at 768 and 1280</span></li>' +
    '<li><strong>1920 / 2528</strong><span>2xl and 3xl, for the canvas surfaces</span></li>'));
  l.appendChild(el('p', { class: 'spy-caption-m spy-text-secondary doc-note' },
    'Worth noting: the gutter stays at 16px even at 1440px. Content gets wider, but the page never gets more generous margins — that is what keeps the product feeling dense rather than editorial.'));
  grid.appendChild(l);

  const z = el('div', { class: 'doc-panel' });
  z.appendChild(el('span', { class: 'doc-ev', 'data-ev': 'c' }, 'Confirmed'));
  z.appendChild(el('h3', { class: 'spy-h6 doc-sub' }, 'Z-index'));
  const zr = el('div', { class: 'doc-scale-rows' });
  [['base',0],['dropdown',10],['sticky',20],['overlay',30],['modal',40],['popover',50],['toast',60],['tooltip',70]]
    .forEach(([k, v]) => {
      const r = el('div', { class: 'doc-scale-row' });
      r.appendChild(el('code', {}, `z-${k}`));
      r.appendChild(el('code', {}, String(v)));
      const w = el('div');
      w.appendChild(el('div', { class: 'doc-scale-bar', style: `width:${(v + 4) * 2}px` }));
      r.appendChild(w);
      zr.appendChild(r);
    });
  z.appendChild(zr);
  z.appendChild(el('p', { class: 'spy-caption-m spy-text-secondary doc-note' },
    'A tight 0–70 scale rather than 1000-step jumps. Tooltip sits above toast, above modal — so a tooltip inside a modal still works.'));
  grid.appendChild(z);
  host.appendChild(grid);
}

/* -------------------------------------------------- RENDER: STATE MATRICES */
function renderButtonStates() {
  const host = $('#btn-state-grid'); if (!host) return;
  const states = [
    ['Default', ''],
    ['Hover', 'style="filter:brightness(.8)"'],
    ['Active / press', 'style="filter:brightness(.6)"'],
    ['Focus visible', 'style="box-shadow:0 0 0 2px var(--hf-color-background-primary),0 0 0 4px var(--hf-color-border-focus)"'],
    ['Disabled', 'disabled'],
    ['Loading', 'aria-busy="true"'],
  ];
  host.innerHTML = '';
  states.forEach(([label, attr]) => {
    const cell = el('div', { class: 'doc-state-cell' });
    cell.appendChild(el('span', { class: 'doc-state-label' }, label));
    cell.insertAdjacentHTML('beforeend',
      `<button class="spy-btn" data-variant="brand" data-size="sm" ${attr}><span class="spy-btn-label">Generate</span></button>
       <button class="spy-btn" data-variant="outline" data-size="sm" ${attr}><span class="spy-btn-label">Outline</span></button>
       <button class="spy-btn" data-variant="danger" data-size="sm" ${attr}><span class="spy-btn-label">Delete</span></button>`);
    host.appendChild(cell);
  });
}

function renderControlsMatrix() {
  const host = $('#render-controls-matrix'); if (!host) return;
  const cb = (a) => `<span class="spy-checkbox" ${a}><span class="spy-control-box"><span class="spy-control-indicator"><svg class="spy-icon"><use href="#i-${a.includes('indeterminate') ? 'minus' : 'check'}"/></svg></span></span></span>`;
  const rb = (a) => `<span class="spy-radio" ${a}><span class="spy-control-box"><span class="spy-radio-dot"></span></span></span>`;
  const states = [
    ['Unchecked', ''],
    ['Checked', 'data-checked'],
    ['Indeterminate', 'data-indeterminate'],
    ['Focus', 'data-checked style="background:var(--hf-color-background-primary);box-shadow:0 0 0 2px var(--hf-color-transparent-lime-20)"'],
    ['Disabled', 'data-disabled'],
    ['Disabled checked', 'data-disabled data-checked'],
  ];
  host.innerHTML = '';
  const g = el('div', { class: 'doc-state-grid' });
  states.forEach(([label, attrs]) => {
    const cell = el('div', { class: 'doc-state-cell' });
    cell.appendChild(el('span', { class: 'doc-state-label' }, label));
    const row = el('div', { class: 'spy-row', style: 'gap:16px' });
    row.innerHTML = cb(attrs) + (attrs.includes('indeterminate') ? '' : rb(attrs));
    cell.appendChild(row);
    g.appendChild(cell);
  });
  host.appendChild(g);

  const sizes = el('div', { class: 'spy-row', style: 'gap:24px;margin-top:24px;flex-wrap:wrap' });
  sizes.innerHTML =
    `<span class="spy-row" style="gap:8px">${cb('data-checked data-size="sm"')}<span class="spy-caption-m spy-text-secondary">sm 20 / 18</span></span>
     <span class="spy-row" style="gap:8px">${cb('data-checked')}<span class="spy-caption-m spy-text-secondary">md 24 / 20</span></span>
     <span class="spy-row" style="gap:8px">${cb('data-checked data-size="lg"')}<span class="spy-caption-m spy-text-secondary">lg 28 / 24</span></span>
     <span class="spy-row" style="gap:8px">${cb('data-checked data-variant="white"')}<span class="spy-caption-m spy-text-secondary">white</span></span>
     <span class="spy-row" style="gap:8px">${rb('data-checked data-variant="error"')}<span class="spy-caption-m spy-text-secondary">error</span></span>
     <span class="spy-row" style="gap:8px">${rb('data-checked data-variant="success"')}<span class="spy-caption-m spy-text-secondary">success</span></span>`;
  host.appendChild(sizes);
}

function renderSwitches() {
  const host = $('#render-switches'); if (!host) return;
  host.innerHTML = '';
  [['small','28 × 16 · thumb 12'],['medium','40 × 20 · thumb 16'],['default','44 × 24 · thumb 20']].forEach(([s, label]) => {
    const w = el('span', { class: 'spy-row', style: 'gap:10px' });
    w.innerHTML =
      `<span class="spy-switch" data-size="${s}" data-checked data-js="switch"><span class="spy-switch-thumb"></span></span>
       <span class="spy-switch" data-size="${s}" data-js="switch"><span class="spy-switch-thumb"></span></span>
       <span class="spy-caption-m spy-text-secondary">${label}</span>`;
    host.appendChild(w);
  });
  const d = el('span', { class: 'spy-row', style: 'gap:10px' });
  d.innerHTML = `<span class="spy-switch" data-size="default" data-checked data-disabled><span class="spy-switch-thumb"></span></span><span class="spy-caption-m spy-text-secondary">disabled</span>`;
  host.appendChild(d);
}

function renderPickerGrid() {
  const host = $('#render-picker-grid'); if (!host) return;
  host.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const c = el('div', { class: 'doc-picker-cell' });
    if (i < 3) c.setAttribute('data-selected', '');
    c.appendChild(el('div', { class: 'doc-media-fake', style: `filter:hue-rotate(${i * 31}deg)` }));
    c.addEventListener('click', () => c.toggleAttribute('data-selected'));
    host.appendChild(c);
  }
}

function renderNav() {
  const host = $('#doc-nav-links'); if (!host) return;
  host.innerHTML = '';
  const sections = $$('.doc-section[data-nav]');
  sections.forEach(sec => host.appendChild(el('a', { class: 'spy-nav-item', href: '#' + sec.id }, sec.dataset.nav)));
  const links = $$('.doc-nav-inner .spy-nav-item');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.removeAttribute('data-active'));
      const m = links.find(l => l.getAttribute('href') === '#' + e.target.id);
      if (m) m.setAttribute('data-active', '');
    });
  }, { rootMargin: '-120px 0px -70% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* --------------------------------------------------------------- BEHAVIOUR */
function wireTheme() {
  const set = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    $$('#theme-switch [data-theme-set]').forEach(b =>
      b.toggleAttribute('data-active', b.dataset.themeSet === theme));
    renderAll();
  };
  $$('#theme-switch [data-theme-set]').forEach(btn =>
    btn.addEventListener('click', () => {
      set(btn.dataset.themeSet);
      try { localStorage.setItem('spyy-theme', btn.dataset.themeSet); } catch (e) {}
    }));
  let saved = null;
  try { saved = localStorage.getItem('spyy-theme'); } catch (e) {}
  if (saved === 'light' || saved === 'dark') set(saved);
}

function openModal(id) {
  const m = document.getElementById(id); if (!m) return;
  const b = $('[data-modal-backdrop]'); if (b) b.hidden = false;
  m.hidden = false;
  const first = m.querySelector('input, button');
  if (first) first.focus();
}
function closeModal() {
  $$('.spy-modal').forEach(m => { m.hidden = true; });
  const b = $('[data-modal-backdrop]'); if (b) b.hidden = true;
}

const TOASTS = {
  success: { icon: 'success', status: 'success', title: 'Render complete', desc: '', action: 'View' },
  error:   { icon: 'error', status: 'error', title: 'Generation failed', desc: 'The model returned no frames. Your credits were not charged.', action: 'Retry' },
  stacked: { icon: 'sparkle', status: '', title: 'Shot 3 of 4 queued', desc: 'Around 40 seconds remaining.', action: 'Cancel', variant: 'stacked' },
};
function showToast(kind) {
  const cfg = TOASTS[kind] || TOASTS.success;
  const host = $('#toast-host'); if (!host) return;
  const t = el('div', { class: 'spy-toast', 'data-variant': cfg.variant || false, 'data-closed': true });
  t.innerHTML =
    `<span class="spy-toast-icon" data-status="${cfg.status}"><svg class="spy-icon" data-size="md"><use href="#i-${cfg.icon}"/></svg></span>
     <span class="spy-toast-text">
       <span class="spy-toast-title">${cfg.title}</span>
       ${cfg.desc ? `<span class="spy-toast-description">${cfg.desc}</span>` : ''}
     </span>
     <button class="spy-toast-action">${cfg.action}</button>
     <button class="spy-toast-close" aria-label="Dismiss"><svg class="spy-icon" data-size="sm"><use href="#i-close"/></svg></button>`;
  host.appendChild(t);
  requestAnimationFrame(() => t.removeAttribute('data-closed'));
  const kill = () => { t.setAttribute('data-closed', ''); setTimeout(() => t.remove(), 220); };
  const close = $('.spy-toast-close', t);
  if (close) close.addEventListener('click', kill);
  setTimeout(kill, 4500);
}

function wireInteractions() {
  document.addEventListener('click', (ev) => {
    const t = ev.target;
    if (!(t instanceof Element)) return;

    const chip = t.closest('[data-js="chip"]');
    if (chip) chip.toggleAttribute('data-selected');

    const toggle = t.closest('[data-js="toggle"]');
    if (toggle) toggle.toggleAttribute('data-pressed');

    const check = t.closest('[data-js="check"]');
    if (check) check.toggleAttribute('data-checked');

    const sw = t.closest('[data-js="switch"]');
    if (sw) sw.toggleAttribute('data-checked');

    const radio = t.closest('[data-js="radio"]');
    if (radio) {
      const group = radio.getAttribute('data-radio-group');
      $$(`[data-radio-group="${group}"]`).forEach(r => r.removeAttribute('data-checked'));
      radio.setAttribute('data-checked', '');
    }

    const tab = t.closest('.spy-tabs-tab');
    if (tab && tab.closest('[data-js="tabs"]') && !tab.hasAttribute('data-disabled')) {
      $$('.spy-tabs-tab', tab.closest('[data-js="tabs"]')).forEach(x => x.removeAttribute('data-active'));
      tab.setAttribute('data-active', '');
    }

    const tool = t.closest('[data-js="toolbar"] .spy-tool');
    if (tool) {
      $$('.spy-tool', tool.closest('[data-js="toolbar"]')).forEach(x => x.removeAttribute('data-active'));
      tool.setAttribute('data-active', '');
    }

    const psec = t.closest('.spy-panel-section-header');
    if (psec && psec.closest('[data-js="panel-section"]')) {
      psec.closest('[data-js="panel-section"]').toggleAttribute('data-open');
    }

    const sel = t.closest('[data-js="select"]');
    if (sel) sel.toggleAttribute('data-open');

    const accTrigger = t.closest('.spy-accordion-trigger');
    if (accTrigger && accTrigger.closest('[data-js="accordion"]')) {
      accTrigger.closest('[data-js="accordion"]').toggleAttribute('data-open');
    }

    const openM = t.closest('[data-js="open-modal"]');
    if (openM) openModal(openM.getAttribute('data-modal'));

    if (t.closest('[data-js="close-modal"]') || t.matches('[data-modal-backdrop]')) closeModal();

    const toastBtn = t.closest('[data-js="toast"]');
    if (toastBtn) showToast(toastBtn.getAttribute('data-status'));
  });

  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeModal(); });

  $$('[data-js="slider"]').forEach(s => {
    const track = $('.spy-slider-track', s);
    const fill = $('.spy-slider-fill', s);
    const thumb = $('.spy-slider-thumb', s);
    if (!track || !fill || !thumb) return;
    const out = s.parentElement ? s.parentElement.querySelector('.doc-num') : null;
    const max = out && parseFloat(out.textContent) > 1 ? 10 : 1;
    const set = (clientX) => {
      const r = track.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
      fill.style.width = pct + '%';
      thumb.style.left = pct + '%';
      if (out) out.textContent = (pct / 100 * max).toFixed(2);
    };
    let dragging = false;
    track.addEventListener('pointerdown', e => { dragging = true; track.setPointerCapture(e.pointerId); set(e.clientX); });
    track.addEventListener('pointermove', e => { if (dragging) set(e.clientX); });
    track.addEventListener('pointerup', () => { dragging = false; });
    track.addEventListener('pointercancel', () => { dragging = false; });
  });
}


/* --------------------------------------------- RENDER: capture-set sections */
const PRESETS = [
  ['None', null], ['Natural', 140], ['B&W Film', 0], ['Split Tone', 220],
  ['Soft Skin', 20], ['Soft Nature', 95], ['Cinematic', 200], ['16mm Film', 40], ['Old Lens', 330],
];
function presetGrid(host, selectedIndex) {
  if (!host) return;
  host.innerHTML = '';
  PRESETS.forEach(([label, hue], i) => {
    const b = el('button', { class: 'spy-preset', type: 'button' });
    if (i === selectedIndex) b.setAttribute('data-selected', '');
    const thumb = el('span', { class: 'spy-preset-thumb' });
    if (hue === null) {
      thumb.innerHTML = '<svg class="spy-icon" data-size="md"><use href="#i-close"/></svg>';
    } else {
      thumb.appendChild(el('span', {
        style: `position:absolute;inset:0;background:` +
               `radial-gradient(70% 90% at 30% 20%, hsl(${hue} 70% 55% / .75), transparent 70%),` +
               `radial-gradient(70% 80% at 80% 75%, hsl(${(hue + 40) % 360} 60% 45% / .8), transparent 70%),` +
               `linear-gradient(150deg, #2a2d32, #131416)` +
               (hue === 0 ? ';filter:grayscale(1)' : '')
      }));
    }
    b.appendChild(thumb);
    b.appendChild(el('span', { class: 'spy-preset-label' }, label));
    b.addEventListener('click', () => {
      [...host.children].forEach(x => x.removeAttribute('data-selected'));
      b.setAttribute('data-selected', '');
    });
    host.appendChild(b);
  });
}

const USAGE = [
  ['27 credits', '', 'Recast Studio', 'Spent', 'Jun 23, 2026', '8:28 PM'],
  ['+27 credits', 'positive', 'Recast Studio', 'Refunded', 'Jun 23, 2026', '8:00 PM'],
  ['8 credits', '', 'Dubbing', 'Spent', 'Jun 23, 2026', '7:51 PM'],
  ['0.2 credits', '', 'Voiceover', 'Spent', 'Jun 23, 2026', '7:48 PM'],
  ['+36 credits', 'positive', 'Recast Studio', 'Refunded', 'Jun 23, 2026', '7:38 PM'],
  ['22.41 credits', '', 'Vibe Motion', 'Spent', 'Jun 23, 2026', '2:48 PM'],
];
function renderUsageRows() {
  const host = $('#render-usage-rows'); if (!host) return;
  host.innerHTML = '';
  USAGE.forEach(([val, delta, feature, action, date, time]) => {
    const tr = el('tr');
    tr.innerHTML =
      `<td><span class="spy-table-value"${delta ? ' data-delta="positive"' : ''}>${val}</span></td>` +
      `<td>${feature}</td>` +
      `<td>${action}</td>` +
      `<td>${date} <span class="spy-table-time">${time}</span></td>`;
    host.appendChild(tr);
  });
}

const TINTS = [
  ['Core product', 'var(--hf-color-lime-500)', 'lime-500 · #d1fe17', 'var(--hf-color-text-inverse)'],
  ['Marketing Studio', 'var(--hf-color-pink-500)', 'pink-500 · #ff005b', 'var(--hf-color-text-primary)'],
  ['Supercomputer', '#35c6a8', 'teal · approximate', 'var(--hf-color-text-inverse)'],
];
function renderTints() {
  const host = $('#render-tints'); if (!host) return;
  host.innerHTML = '';
  TINTS.forEach(([name, tint, note, fg]) => {
    const p = el('div', { class: 'doc-panel', style: `--q-tint:${tint}` });
    p.appendChild(el('h4', { class: 'spy-caption-l', style: 'margin:0 0 4px' }, name));
    p.appendChild(el('code', { class: 'doc-elev-name', style: 'margin-bottom:16px' }, note));
    const row = el('div', { class: 'spy-row', style: 'gap:12px;margin-bottom:14px' });
    row.innerHTML =
      `<span class="spy-switch" data-size="default" data-variant="tint" data-checked data-js="switch"><span class="spy-switch-thumb"></span></span>` +
      `<button class="spy-toggle" data-size="sm" data-pressed><svg class="spy-icon"><use href="#i-wand"/></svg>Enhance</button>`;
    p.appendChild(row);
    p.appendChild(el('div', { class: 'spy-progress', style: 'margin-bottom:14px' }, '<div class="spy-progress-fill" style="width:62%"></div>'));
    p.appendChild(el('button', {
      class: 'spy-btn', 'data-size': 'sm',
      style: `background-color:${tint};color:${fg};--spy-btn-hover-overlay:transparent`
    }, 'Generate'));
    host.appendChild(p);
  });
}

/* -------------------------------------------------------------------- BOOT */
function renderAll() {
  renderColorSemantic(); renderRamps(); renderAlpha();
  renderTypeSpecimen(); renderSpace(); renderHeights();
  renderRadius(); renderBorder(); renderElevation();
  renderIconSizes(); renderIconGrid(); renderMotion(); renderLayout();
  renderButtonStates(); renderControlsMatrix(); renderSwitches(); renderPickerGrid();
  presetGrid($('#render-presets'), 2); presetGrid($('#render-presets-2'), 4);
  renderUsageRows(); renderTints();
}
renderAll();
wireTheme();
renderNav();
wireInteractions();
})();
