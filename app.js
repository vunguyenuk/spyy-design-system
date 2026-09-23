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
  ['Button xxs / Chip xs', 24, 'inside a table cell'],
  ['Button xs / Chip sm / Nav item', 28, 'top bar, filter row'],
  ['Button sm / Chip md / Field sm', 32, 'toolbars'],
  ['Nav action', 36, 'icon buttons in the bar'],
  ['Menu item / table row', 36, 'minimum, can grow'],
  ['Sidebar row', 36, ''],
  ['Button md / Field md / Select', 40, 'the default, and the workhorse height'],
  ['Button lg / Field lg / Toggle lg', 48, 'the one action on a page'],
  ['Nav bar', 52, 'minimum'],
  ['Textarea floor', 80, ''],
];
// Family and weight per step. display carries one weight because the display
// face ships one; every text step carries a weight the text face actually has.
const TYPE_SPECIMEN = [
  ['--text-display', 'Display', 'Turn a prompt into a shot', 400, 'display'],
  ['--text-h1', 'H1', 'Cinema, generated', 400, 'display'],
  ['--text-h2', 'H2', 'Every frame on purpose', 400, 'display'],
  ['--text-h3', 'H3', 'Direct the model', 400, 'display'],
  ['--text-h4', 'H4', 'Reference, prompt, render', 700, 'text'],
  ['--text-h5', 'H5', 'Shot list and coverage', 600, 'text'],
  ['--text-h6', 'H6', 'Generation settings', 600, 'text'],
  ['--text-body-l', 'Body L', 'The system underneath the product, not one inspired by it.', 400, 'text'],
  ['--text-body-m', 'Body M', 'Every value read out of the product rather than chosen.', 400, 'text'],
  ['--text-body-s', 'Body S', 'Confirmed where the product answered; labelled where it did not.', 400, 'text'],
  ['--text-caption-l', 'Caption L', 'Control labels, table cells, menu items.', 400, 'text'],
  ['--text-caption-m', 'Caption M', 'Descriptions, helper text, metadata.', 400, 'text'],
  ['--text-caption-s', 'Caption S', 'Tags, credit costs, timestamps.', 400, 'text'],
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
  // The face name is read back off the rendered element rather than written
  // out by hand, so the label cannot drift from what is actually painted.
  const faceOf = node => (getComputedStyle(node).fontFamily.split(',')[0] || '').replace(/["']/g, '').trim();
  TYPE_SPECIMEN.forEach(([tok, label, text, weight, fam]) => {
    const size = parseFloat(cssVar(tok));
    const track = size >= 1.75 ? '-2%' : size >= 1 ? '-1%' : '0';
    const row = el('div', { style: 'padding:16px 0;border-bottom:1px solid var(--hf-color-border-subtle)' });
    const meta = el('div', { class: 'spy-row', style: 'gap:12px;margin-bottom:8px' });
    meta.appendChild(el('span', { class: 'doc-state-label' }, label));
    const faceChip = el('span', { class: 'spy-badge', 'data-variant': 'lime-subtle', 'data-shape': 'square' },
      '<span class="spy-badge-surface"><span class="spy-badge-text">face</span></span>');
    meta.appendChild(faceChip);
    meta.appendChild(el('code', {}, `${cssVar(tok)} / ${cssVar(tok + '--line-height')} · ${weight} · ${track}`));
    row.appendChild(meta);
    const sample = el('div', {
      style: `font-family:var(--hf-type-family-${fam});font-size:var(${tok});line-height:var(${tok}--line-height);font-weight:${weight};letter-spacing:${track};color:var(--hf-color-text-${fam === 'display' ? 'primary' : 'secondary'})`
    }, text);
    row.appendChild(sample);
    host.appendChild(row);
    faceChip.querySelector('.spy-badge-text').textContent = faceOf(sample);
  });
  const caps = el('div', { style: 'margin-top:28px;display:flex;flex-direction:column;gap:16px' });
  const capsLabel = el('span', { class: 'doc-state-label' }, 'uppercase · -4% tracking');
  const capsSample = el('div', { class: 'spy-grotesk spy-caps', style: 'font-size:var(--hf-type-size-800);line-height:1.1' }, 'Sign up and get your extra discount');
  const monoLabel = el('span', { class: 'doc-state-label' }, 'the mono role · tabular figures');
  const monoSample = el('div', { class: 'spy-mono spy-text-secondary', style: 'font-size:var(--hf-type-size-200)' }, 'seed 44127 · cfg 3.5 · 1920x1080 · 24fps');
  caps.append(capsLabel, capsSample, monoLabel, monoSample);
  host.appendChild(caps);
  capsLabel.textContent = faceOf(capsSample) + ' · uppercase · -4% tracking';
  monoLabel.textContent = faceOf(monoSample) + ' · the mono role, with tabular figures';
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
      `<button class="spy-btn" data-variant="brand" data-size="sm" ${attr}>Generate</button>
       <button class="spy-btn" data-variant="outline" data-size="sm" ${attr}>Outline</button>
       <button class="spy-btn" data-variant="danger" data-size="sm" ${attr}>Delete</button>`);
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
      s.style.setProperty('--spy-slider-value', pct + '%');
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

// The ink is a theme-constant token, not text-inverse: a tint is the same
// colour in both themes, so the label on top of it must not flip.
const TINTS = [
  ['Core product', 'var(--hf-color-lime-500)', 'lime-500 · #d1fe17', 'var(--hf-color-text-on-tint)'],
  ['a second surface', 'var(--hf-color-pink-500)', 'pink-500 · #ff005b', 'var(--hf-color-text-on-tint-inverse)'],
  ['a third surface', '#35c6a8', 'teal · approximate', 'var(--hf-color-text-on-tint)'],
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


/* ===========================================================================
   PRODUCT DATA — spyy
   Sample content for the pattern and template pages. Realistic on purpose:
   a pattern demoed with lorem hides the cases that break it.
   ======================================================================== */
const METRICS = [
  ['Account ownership', 96, '', 'high'],
  ['Ad Library provenance', 88, '', 'high'],
  ['Landing domain match', 74, '', 'medium'],
  ['Caption & hashtags', 61, '', 'medium'],
  ['Paid-partnership disclosure', 24, 'warning', 'high'],
  ['App Store link', 0, '', 'low'],
];
const T4_METRICS = [
  ['Hook strength', 91, '', 'high'],
  ['Audience fit', 72, '', 'medium'],
  ['Product relevance', 84, '', 'high'],
  ['Conversion intent', 42, '', 'medium'],
  ['Replicability', 87, '', 'high'],
  ['Brand safety', 38, 'warning', 'high'],
];
const GAUGES = [
  [94, 'good', 'Resolved', '/100', 'Confident'],
  [62, 'fair', 'Resolved', '/100', 'Check it'],
  [28, 'bad', 'Resolved', '/100', 'Too weak'],
];
const TIERS = [
  [1, 'Metadata only', 'no media downloaded'],
  [2, 'Thumbnail + first frames', 'cheap image pass'],
  [3, 'Transcript', 'audio to text'],
  [4, 'Multimodal', 'campaign-defining only'],
];
const COVERAGE = [
  ['meta', 'Meta Ad Library', '134 creatives', 'done', 'Complete'],
  ['tiktok', 'TikTok', '84 creatives', 'running', 'Running'],
  ['appstore', 'App Store', 'No listing resolved', 'skipped', 'Skipped'],
  ['youtube', 'YouTube', '0 creatives', 'failed', 'Rate limited'],
];
const RANKED = [
  ['Official account', 'Served from the verified Meta page nordic-labs.', 'high'],
  ['Ad Library provenance', 'Present in the Ad Library with a paid placement record.', 'high'],
  ['Landing domain', 'Click-through resolves to nordiclabs.com.', 'high'],
  ['Caption signals', 'Brand handle and product name both appear in the caption.', 'medium'],
  ['App Store link', 'No store link on this placement.', 'low'],
];
const T4_RANKED = [
  ['Specific stakes', '“10 lbs before October” creates immediate tension.', 'high'],
  ['Extreme framing', 'Asking for the “most insane ways” triggers curiosity.', 'high'],
  ['Community participation', 'Invites comments, which lifts distribution.', 'high'],
  ['Personal vulnerability', 'Reads as authentic rather than produced.', 'medium'],
  ['Native format', 'Direct talking head is native to short-form.', 'medium'],
];
const PLACEMENTS = [
  ['meta', 'Meta · Feed', 'Sep 18 2024', 'Nov 2 2026', true],
  ['meta', 'Meta · Reels', 'Sep 18 2024', 'Aug 14 2026', false],
  ['tiktok', 'TikTok · In-feed', 'Oct 2 2024', 'Nov 4 2026', true],
  ['tiktok', 'TikTok · Spark Ads', 'Jan 9 2026', 'Mar 30 2026', false],
];
const CANDIDATES = [
  ['NL', 'Nordic Labs', '@nordiclabs · 412K followers · nordiclabs.com', 'meta', 'Meta page', 94, ''],
  ['NL', 'Nordic Labs Sverige', '@nordiclabs.se · 38K followers · nordiclabs.se', 'tiktok', 'TikTok', 62, 'low'],
  ['NR', 'Nordic Recovery Co.', 'App Store · Health & Fitness · 4.6★', 'appstore', 'App listing', 41, 'low'],
];
const SOURCES_OPT = [
  ['meta', 'Meta', 'i-grid', true],
  ['tiktok', 'TikTok', 'i-video', true],
  ['appstore', 'App Store', 'i-download', false],
  ['youtube', 'YouTube', 'i-play', false],
];
const TIER_OPT = [
  ['Metadata', 'i-list', '✦ 4', false],
  ['Frames', 'i-image', '✦ 8', false],
  ['Transcript', 'i-audio', '✦ 12', true],
  ['Multimodal', 'i-sparkle', '✦ 40', false],
];
const RESULTS = [
  ['Need to lose 10 lbs before October…', 'meta', 4, '0:08', true],
  ['POV: your morning routine after…', 'tiktok', 3, '0:14', true],
  ['We tested it for 30 days. Here’s…', 'meta', 2, '0:22', false],
  ['Three things nobody tells you…', 'tiktok', 4, '0:11', true],
  ['The before and after that broke…', 'meta', 1, '0:09', false],
  ['Reply to @jess — yes it works', 'tiktok', 3, '0:17', true],
];
const LEVELS_DOC = [
  ['01', 'Foundations', 'foundations.html', 'What are the raw decisions?',
   ['Colour', 'Type', 'Space', 'Radius', 'Border', 'Elevation', 'Icons', 'Motion', 'Layout']],
  ['02', 'Components', 'components.html', 'What is the smallest usable piece?',
   ['Button', 'Field', 'Select', 'Controls', 'Chip', 'Tabs', 'Overlay', 'Surface', 'Feedback', 'Data', 'Nav', 'States & props']],
  ['03', 'Patterns', 'patterns.html', 'How does spyy say this?',
   ['Scoring', 'Confidence', 'Async scan', 'Attribution', 'Pickers', 'Results', 'Editor', 'Account', 'Composer', 'States & props']],
  ['04', 'Templates', 'templates.html', 'What does the screen look like?',
   ['Start', 'Resolve', 'Scanning', 'Creative']],
];
const PROBLEMS = [
  ['P1', 'Brand name → platform identity', 'Free text resolves to candidate accounts and listings, each with a confidence score and an explicit confirm. Everything downstream depends on it.', [['Candidate picker','patterns.html#pickers'],['T2 Resolve','templates.html#t2']]],
  ['P2', 'Video discovery per source', 'One adapter per source, each declaring its coverage and its failure mode. A failed source must not read as a failed scan.', [['Source coverage','patterns.html#async'],['T3 Scanning','templates.html#t3']]],
  ['P3', 'Attribution signal', 'Brand relevance decided from cheap signals first, vision last. A tiered decision has to show its working.', [['Evidence panel','patterns.html#attribution'],['Scoring','patterns.html#scoring']]],
  ['P4', 'Cost-efficient analysis pipeline', 'Four tiers, expensive steps on few videos. Each result carries the depth that actually ran.', [['Tier indicator','patterns.html#confidence'],['Option cards','patterns.html#pickers']]],
  ['P5', 'Storage and dedup model', 'One canonical creative, many platform observations — first seen, last seen, where it ran.', [['Placements','patterns.html#attribution']]],
  ['P6', 'Scan orchestration', 'Async job reporting partial results as they land, surviving one source failing.', [['Processing frame','patterns.html#async'],['T3 Scanning','templates.html#t3']]],
  ['P7', 'Unit economics', 'Cost per scan instrumented from day one — which makes it a product surface, not a dashboard.', [['Cost in CTA','patterns.html#async'],['Stats','patterns.html#scoring']]],
];
const COVERAGE_MATRIX = [
  ['P1 · Brand → identity', 'Candidate picker, confidence gauge, T2', 'done', 'Covered'],
  ['P2 · Per-source coverage', 'Coverage list, source badge, processing frame', 'done', 'Covered'],
  ['P3 · Attribution signal', 'Evidence panel, ranked reasons, metric rows', 'done', 'Covered'],
  ['P4 · Tiered analysis', 'Tier indicator, option cards, navigator row', 'done', 'Covered'],
  ['P5 · Storage & dedup', 'Placement rows, result card', 'partial', 'No dedup-conflict UI'],
  ['P6 · Scan orchestration', 'Processing frame, segmented progress, skeletons', 'done', 'Covered'],
  ['P7 · Unit economics', 'Cost in CTA, stat grid, usage table', 'done', 'Covered'],
  ['Later · Campaign reconstruction', '—', 'todo', 'Out of PoC scope'],
];


/* --------------------------------------------- RENDER: spyy product patterns */
const icon = (n, size) => `<svg class="spy-icon"${size ? ` data-size="${size}"` : ''}><use href="#i-${n}"/></svg>`;

function metricRows(host, rows) {
  if (!host) return;
  host.innerHTML = '';
  rows.forEach(([label, value, tone, conf]) => {
    const m = el('div', { class: 'spy-metric' });
    if (value === 0) m.setAttribute('data-pending', '');
    m.innerHTML =
      `<div class="spy-metric-head">
         <span class="spy-metric-label">${label}</span>
         <span class="spy-metric-value"${tone ? ` data-tone="${tone}"` : ''}>${value === 0 ? '—' : value}</span>
       </div>
       <div class="spy-metric-track"><div class="spy-metric-fill" style="width:${value}%"></div></div>
       <div class="spy-metric-meta">${icon(conf === 'high' ? 'success' : conf === 'low' ? 'info' : 'list', 'xs')}${conf} confidence</div>`;
    host.appendChild(m);
  });
}

/* Any .spy-gauge[data-value] draws itself — templates can drop one in inline. */
function paintGauges(root = document) {
  root.querySelectorAll('.spy-gauge[data-value]').forEach(g => {
    if (g.dataset.painted) return;
    const v = Math.max(0, Math.min(100, parseFloat(g.dataset.value) || 0));
    const suffix = g.dataset.suffix || '';
    const verdictText = g.dataset.verdictLabel || '';
    const stroke = parseFloat(getComputedStyle(g).getPropertyValue('--spy-gauge-stroke')) || 14;
    const R = 50 - stroke / 2;
    const C = 2 * Math.PI * R;
    g.innerHTML =
      `<svg viewBox="0 0 100 100" aria-hidden="true">
         <circle class="spy-gauge-track" cx="50" cy="50" r="${R}"></circle>
         <circle class="spy-gauge-arc" cx="50" cy="50" r="${R}"
                 stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - v / 100)).toFixed(2)}"></circle>
       </svg>
       <span class="spy-gauge-center">
         <span class="spy-gauge-number">${v}${suffix ? `<small>${suffix}</small>` : ''}</span>
         ${verdictText ? `<span class="spy-gauge-verdict">${verdictText}</span>` : ''}
       </span>`;
    g.dataset.painted = '1';
  });
}

function renderGauges() {
  const host = $('#render-gauges'); if (!host) return;
  host.innerHTML = '';
  GAUGES.forEach(([v, verdict, label, suffix, vtext]) => {
    const cell = el('div', { class: 'doc-gauge-cell' });
    cell.innerHTML =
      `<div class="spy-gauge" data-verdict="${verdict}" data-value="${v}" data-suffix="${suffix}" data-verdict-label="${vtext}"></div>
       <span class="doc-state-label">${label} · ${verdict}</span>`;
    host.appendChild(cell);
  });
  paintGauges(host);
}

function renderTiers() {
  const host = $('#render-tiers'); if (!host) return;
  host.innerHTML = '';
  TIERS.forEach(([depth, name, note]) => {
    const w = el('div', { class: 'doc-state-cell', style: 'gap:8px' });
    const pips = [1, 2, 3, 4].map(i => `<span class="spy-tier-pip"${i <= depth ? ' data-on' : ''}></span>`).join('');
    w.innerHTML =
      `<span class="spy-tier"><span class="spy-tier-pips">${pips}</span><span class="spy-tier-label">${name}</span></span>
       <span class="spy-caption-m spy-text-tertiary">${note}</span>`;
    host.appendChild(w);
  });
}

function coverageRows(host) {
  if (!host) return;
  host.innerHTML = '';
  COVERAGE.forEach(([src, name, count, state, statusText]) => {
    const r = el('div', { class: 'spy-coverage-row' });
    const ico = state === 'done' ? 'check' : state === 'running' ? 'refresh' : state === 'failed' ? 'warning' : 'minus';
    r.innerHTML =
      `<span class="spy-coverage-name"><span class="spy-source" data-source="${src}"><span class="spy-source-dot"></span><span>${name}</span></span></span>
       <span class="spy-coverage-count">${count}</span>
       <span class="spy-coverage-status" data-state="${state}">${icon(ico, 'xs')}${statusText}</span>`;
    host.appendChild(r);
  });
}

function rankedRows(host, rows) {
  if (!host) return;
  host.innerHTML = '';
  rows.forEach(([title, detail, level], i) => {
    const r = el('div', { class: 'spy-ranked-item' });
    r.innerHTML =
      `<span class="spy-ranked-index">${i + 1}</span>
       <span class="spy-ranked-title">${title}</span>
       <span class="spy-ranked-detail">${detail}</span>
       <span class="spy-impact" data-level="${level}">${level === 'high' ? 'High impact' : level === 'medium' ? 'Medium' : 'Low'}</span>`;
    host.appendChild(r);
  });
}

function placementRows(host) {
  if (!host) return;
  host.innerHTML = '';
  PLACEMENTS.forEach(([src, where, first, last, live]) => {
    const r = el('div', { class: 'spy-placement' });
    r.innerHTML =
      `<span class="spy-placement-where">
         <span class="spy-source" data-source="${src}"><span class="spy-source-dot"></span>${where}</span>
         ${live ? '<span class="spy-live-dot" title="Still running"></span>' : ''}
       </span>
       <span class="spy-placement-span">${first} ${icon('arrow-right', 'xs')} ${last}</span>`;
    host.appendChild(r);
  });
}

function candidateRows(host) {
  if (!host) return;
  host.innerHTML = '';
  CANDIDATES.forEach(([initials, name, handle, src, srcLabel, conf, low], i) => {
    const b = el('button', { class: 'spy-candidate', type: 'button' });
    if (i === 0) b.setAttribute('data-selected', '');
    if (low) b.setAttribute('data-confidence', 'low');
    b.innerHTML =
      `<span class="spy-candidate-avatar">${initials}</span>
       <span class="spy-candidate-text">
         <span class="spy-candidate-name">${name}</span>
         <span class="spy-candidate-handle">${handle}</span>
         <span class="spy-candidate-meta"><span class="spy-source" data-source="${src}"><span class="spy-source-dot"></span>${srcLabel}</span></span>
       </span>
       <span class="spy-candidate-confidence">
         <span class="spy-candidate-confidence-value">${conf}</span>
         <span class="spy-candidate-confidence-label">confidence</span>
       </span>`;
    b.addEventListener('click', () => {
      [...host.children].forEach(x => x.removeAttribute('data-selected'));
      b.setAttribute('data-selected', '');
    });
    host.appendChild(b);
  });
}

function optionCards(host, items, kind) {
  if (!host) return;
  host.innerHTML = '';
  items.forEach(([a, b, c, sel]) => {
    const label = kind === 'tier' ? a : b;
    const ico = kind === 'tier' ? b : c;
    const cap = kind === 'tier' ? c : '';
    const btn = el('button', { class: 'spy-option', type: 'button' });
    if (sel) btn.setAttribute('data-selected', '');
    btn.innerHTML = `${icon(ico.replace('i-', ''))}<span>${label}</span>${cap ? `<span class="spy-option-caption">${cap}</span>` : ''}`;
    btn.addEventListener('click', () => {
      if (kind === 'tier') [...host.children].forEach(x => x.removeAttribute('data-selected'));
      btn.toggleAttribute('data-selected');
      if (kind === 'tier') btn.setAttribute('data-selected', '');
    });
    host.appendChild(btn);
  });
}

function resultCards(host, n) {
  if (!host) return;
  host.innerHTML = '';
  RESULTS.slice(0, n || RESULTS.length).forEach(([title, src, tier, dur, attributed], i) => {
    const c = el('div', { class: 'spy-result' });
    const pips = [1, 2, 3, 4].map(k => `<span class="spy-tier-pip"${k <= tier ? ' data-on' : ''}></span>`).join('');
    c.innerHTML =
      `<div class="spy-result-media">
         <span class="doc-media-fake" style="filter:hue-rotate(${i * 47}deg)"></span>
         <div class="spy-result-top">
           ${attributed ? '' : '<span class="spy-chip" data-size="xxs" data-variant="warning" data-selected>Uncertain</span>'}
           <span class="spy-result-duration" style="margin-inline-start:auto">${dur}</span>
         </div>
         <div class="spy-result-actions">
           <button class="spy-btn" data-variant="tertiary" data-size="xs" data-icon-only aria-label="Open">${icon('fullscreen')}</button>
           <button class="spy-btn" data-variant="tertiary" data-size="xs" data-icon-only aria-label="Save">${icon('download')}</button>
           <button class="spy-btn" data-variant="tertiary" data-size="xs" data-icon-only aria-label="Source">${icon('link')}</button>
         </div>
       </div>
       <div class="spy-result-foot">
         <span class="spy-result-title">${title}</span>
         <span class="spy-result-meta">
           <span class="spy-source" data-source="${src}"><span class="spy-source-dot"></span>${src === 'meta' ? 'Meta' : 'TikTok'}</span>
           <span class="spy-tier"><span class="spy-tier-pips">${pips}</span></span>
         </span>
       </div>`;
    host.appendChild(c);
  });
}


/* ------------------------------------------- RENDER: overview + templates */
function renderLevelCards() {
  const host = $('#render-levelcards'); if (!host) return;
  host.innerHTML = '';
  LEVELS_DOC.forEach(([idx, title, href, q, items]) => {
    const a = el('a', { class: 'doc-levelcard', href });
    a.innerHTML =
      `<span class="doc-levelcard-index">${idx}</span>
       <span class="doc-levelcard-title">${title}</span>
       <span class="doc-levelcard-q">${q}</span>
       <ul class="doc-levelcard-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    host.appendChild(a);
  });
}

function renderProblems() {
  const host = $('#render-problems'); if (!host) return;
  host.innerHTML = '';
  PROBLEMS.forEach(([id, title, desc, links]) => {
    const d = el('div', { class: 'doc-problem' });
    d.innerHTML =
      `<span class="doc-problem-id">${id}</span>
       <span class="doc-problem-text">
         <span class="doc-problem-title">${title}</span>
         <span class="doc-problem-desc">${desc}</span>
         <span class="doc-problem-links">${links.map(([l, h]) => `<a href="${h}">${l}</a>`).join('')}</span>
       </span>`;
    host.appendChild(d);
  });
}

function renderTintSwitch() {
  const host = $('#render-tintswitch'); if (!host) return;
  const tints = [['Lime — audited brand', 'var(--hf-color-lime-500)'],
                 ['Purple — closest to the mockup', 'var(--hf-color-purple-600)'],
                 ['Magenta — a second surface', 'var(--hf-color-pink-500)']];
  host.innerHTML = '';
  tints.forEach(([label, v], i) => {
    const b = el('button', { type: 'button', title: label, style: `background:${v}` });
    if (i === 0) b.setAttribute('data-active', '');
    b.addEventListener('click', () => {
      [...host.children].forEach(x => x.removeAttribute('data-active'));
      b.setAttribute('data-active', '');
      document.documentElement.style.setProperty('--q-tint', v);
    });
    host.appendChild(b);
  });
}

function renderCoverageMatrix() {
  const host = $('#render-coverage-matrix'); if (!host) return;
  host.innerHTML = '';
  COVERAGE_MATRIX.forEach(([req, by, state, note]) => {
    const variant = state === 'done' ? 'success' : state === 'partial' ? 'warning' : 'neutral';
    const label = state === 'done' ? 'Covered' : state === 'partial' ? 'Partial' : 'Not started';
    const tr = el('tr');
    tr.innerHTML =
      `<td>${req}</td><td class="spy-text-secondary">${by}</td>
       <td><span class="spy-chip" data-size="xxs" data-variant="${variant}" data-selected>${label}</span>
       <span class="spy-caption-m spy-text-tertiary" style="margin-inline-start:8px">${note !== label ? note : ''}</span></td>`;
    host.appendChild(tr);
  });
}

function renderRail(id, activeIndex) {
  const host = document.getElementById(id); if (!host) return;
  const items = [
    ['Home', 'i-grid'], ['Scans', 'i-search'], ['Saved', 'i-download'],
    ['Boards', 'i-folder'], ['Creatives', 'i-video'], ['Brands', 'i-user'],
  ];
  host.className = 'spy-sidebar doc-app-rail';
  host.innerHTML =
    `<div class="spy-sidebar-header">
       <button class="spy-sidebar-switcher">
         <span class="spy-sidebar-thumb">${icon('layers', 'sm')}</span>
         <span class="spy-sidebar-truncate">Nordic Labs</span>
         ${icon('chevron-down', 'sm')}
       </button>
     </div>
     <div class="spy-sidebar-section">
       ${items.map(([l, i], k) =>
         `<a class="spy-sidebar-row"${k === activeIndex ? ' data-active' : ''} href="#">${icon(i.replace('i-', ''))}<span class="spy-sidebar-truncate">${l}</span></a>`).join('')}
     </div>
     <div class="spy-sidebar-footer">
       <div class="spy-notice" style="padding:10px">
         <span class="spy-icon-tile">${icon('sparkle', 'sm')}</span>
         <span class="spy-notice-text"><span class="spy-caption-m">148 credits left</span></span>
       </div>
     </div>`;
}

function renderRecentScans() {
  const host = $('#t1-recent'); if (!host) return;
  const rows = [
    ['Aurora Skincare', 'meta', '312 creatives', '2 hours ago'],
    ['Peak Supply Co.', 'tiktok', '96 creatives', 'Yesterday'],
    ['Lumen Fitness', 'meta', '41 creatives', '3 days ago'],
  ];
  host.innerHTML = '';
  rows.forEach(([name, src, count, when]) => {
    const li = el('li', { class: 'spy-list-item', 'data-interactive': true });
    li.innerHTML =
      `<span class="spy-sidebar-thumb">${icon('search', 'sm')}</span>
       <span class="spy-list-item-text"><span>${name}</span><span class="spy-list-item-meta">${count} · ${when}</span></span>
       <span class="spy-source" data-source="${src}"><span class="spy-source-dot"></span>${src === 'meta' ? 'Meta' : 'TikTok'}</span>`;
    host.appendChild(li);
  });
}

function renderProduct() {
  metricRows($('#render-metrics'), METRICS);
  metricRows($('#t4-metrics'), T4_METRICS);
  renderGauges();
  renderTiers();
  coverageRows($('#render-coverage'));
  coverageRows($('#t3-coverage'));
  rankedRows($('#render-ranked'), RANKED);
  rankedRows($('#t4-ranked'), T4_RANKED);
  placementRows($('#render-placements'));
  placementRows($('#t4-placements'));
  candidateRows($('#render-candidates'));
  candidateRows($('#t2-candidates'));
  optionCards($('#render-options-sources'), SOURCES_OPT, 'source');
  optionCards($('#t1-sources'), SOURCES_OPT, 'source');
  optionCards($('#render-options-tier'), TIER_OPT, 'tier');
  resultCards($('#render-results'));
  resultCards($('#t3-results'), 4);
  renderLevelCards();
  renderProblems();
  renderTintSwitch();
  renderCoverageMatrix();
  renderRail('t3-rail', 1);
  renderRail('t4-rail', 4);
  renderRecentScans();
  renderPropsTable();
  renderPatternStates();
  paintGauges();
}


/* ------------------------------------------- RENDER: component API table */
/* Extracted from components.css with a script, not written by hand: every row
   below corresponds to a selector that exists. If the CSS changes, re-run the
   extraction rather than editing this list, or the docs start lying.        */
/* The per-component API table that used to live here is gone. Every component
   now carries its own Properties / Parts / States tables, generated from the
   same data that renders its examples — so a property cannot be listed in one
   place and missing from the other. See cases.js.                          */

const PROP_TABLE = [
  ['Metric row', 'label · value 0–100 · tone · confidence · pending',
   'default · pending · zero (—)', 'P3 P4'],
  ['Headline score', 'label · value · denominator · scale fill',
   'default · pending', 'P3'],
  ['Score gauge', 'value 0–100 · verdict · size md/sm · suffix · verdictLabel',
   'good · fair · bad · empty', 'P1 P3'],
  ['Stat', 'value · label · delta up/down · align',
   'default · with delta', 'P7'],
  ['Verdict row', 'verdict keep/modify/remove · label · reasons[] · count',
   'default · hover · focus · expanded', 'P3'],
  ['Evidence panel', 'tone for/against · title · claim · list[] · thumbs[]',
   'default', 'P3'],
  ['Ranked item', 'index · title · detail · impact high/medium/low',
   'default', 'P3'],
  ['Classification row', 'icon · label · values[] · tone tint',
   'default', 'P3'],
  ['Candidate', 'avatar · name · handle · source · confidence · confidence low',
   'default · hover · selected · focus · low-confidence', 'P1'],
  ['Option card', 'icon · label · caption · selected · disabled',
   'default · hover · selected · focus · disabled', 'P4'],
  ['Navigator row', 'label · value · trailing slot',
   'default · hover · focus', 'P4'],
  ['Source badge', 'source meta/tiktok/appstore/youtube/landing · label',
   'default', 'P2'],
  ['Coverage row', 'source · name · count · state',
   'done · running · partial · failed · skipped', 'P2'],
  ['Tier indicator', 'depth 1–4 · label',
   'default', 'P4'],
  ['Processing frame', 'state · badge label',
   'running · done · failed', 'P6'],
  ['Placement row', 'source · where · first seen · last seen · live',
   'default · live', 'P5'],
  ['Result card', 'media · duration · source · tier · attributed',
   'default · hover (actions) · focus-within · uncertain', 'P2 P4 P5'],
  ['Dropzone', 'icon · title · hint',
   'default · hover · drag-over', '—'],
];

function renderPropsTable() {
  const host = $('#render-props-table'); if (!host) return;
  host.innerHTML = '';
  PROP_TABLE.forEach(([name, props, states, serves]) => {
    const tr = el('tr');
    tr.innerHTML =
      `<td>${name}</td>
       <td class="spy-text-secondary"><code>${props.replace(/ · /g, '</code> <code>')}</code></td>
       <td class="spy-text-secondary">${states}</td>
       <td>${serves === '—' ? '<span class="spy-text-tertiary">—</span>' : serves.split(' ').map(s => `<span class="doc-serves">${s}</span>`).join(' ')}</td>`;
    host.appendChild(tr);
  });
}

function renderPatternStates() {
  const host = $('#render-pattern-states'); if (!host) return;
  host.innerHTML = '';
  const cell = (label, html) => {
    const c = el('div', { class: 'doc-state-cell' });
    c.appendChild(el('span', { class: 'doc-state-label' }, label));
    const w = el('div', { style: 'display:flex;flex-direction:column;gap:10px' });
    w.innerHTML = html;
    c.appendChild(w);
    return c;
  };
  const opt = (attrs, label) =>
    `<div class="spy-options"><button class="spy-option" ${attrs}>${icon('video')}<span>${label}</span></button></div>`;
  const cov = (state, text, ico) =>
    `<span class="spy-coverage-status" data-state="${state}">${icon(ico, 'xs')}${text}</span>`;

  host.appendChild(cell('Option — default', opt('', 'TikTok')));
  host.appendChild(cell('Option — selected', opt('data-selected', 'TikTok')));
  // the specimen paints the real :focus-visible recipe (2px page colour, then
  // 4px tint) rather than an approximation — it must match .spy-option exactly.
  host.appendChild(cell('Option — focus', opt('style="box-shadow:0 0 0 2px var(--hf-color-background-primary),0 0 0 4px var(--hf-color-border-focus)"', 'TikTok')));
  host.appendChild(cell('Option — disabled', opt('data-disabled', 'TikTok')));

  host.appendChild(cell('Coverage states',
    cov('done', 'Complete', 'check') + cov('running', 'Running', 'refresh') +
    cov('partial', 'Partial', 'minus') + cov('failed', 'Rate limited', 'warning') +
    cov('skipped', 'Skipped', 'minus')));

  host.appendChild(cell('Metric — default',
    `<div class="spy-metric"><div class="spy-metric-head"><span class="spy-metric-label">Hook strength</span><span class="spy-metric-value">91</span></div><div class="spy-metric-track"><div class="spy-metric-fill" style="width:91%"></div></div></div>`));
  host.appendChild(cell('Metric — warning value',
    `<div class="spy-metric"><div class="spy-metric-head"><span class="spy-metric-label">Brand safety</span><span class="spy-metric-value" data-tone="warning">38</span></div><div class="spy-metric-track"><div class="spy-metric-fill" style="width:38%"></div></div></div>`));
  host.appendChild(cell('Metric — pending',
    `<div class="spy-metric" data-pending><div class="spy-metric-head"><span class="spy-metric-label">App Store link</span><span class="spy-metric-value">—</span></div><div class="spy-metric-track"></div></div>`));

  host.appendChild(cell('Tier 1 → 4',
    [1,2,3,4].map(d =>
      `<span class="spy-tier"><span class="spy-tier-pips">${[1,2,3,4].map(i => `<span class="spy-tier-pip"${i<=d?' data-on':''}></span>`).join('')}</span></span>`).join('')));

  host.appendChild(cell('Placement — live / ended',
    `<div class="spy-placement" style="border:none;padding:0"><span class="spy-placement-where"><span class="spy-source" data-source="meta"><span class="spy-source-dot"></span><span>Meta · Feed</span></span><span class="spy-live-dot"></span></span></div>
     <div class="spy-placement" style="border:none;padding:0"><span class="spy-placement-where"><span class="spy-source" data-source="tiktok"><span class="spy-source-dot"></span><span>TikTok</span></span></span></div>`));

  host.appendChild(cell('Impact levels',
    `<span class="spy-impact" data-level="high">High impact</span>
     <span class="spy-impact" data-level="medium">Medium</span>
     <span class="spy-impact" data-level="low">Low</span>`));

  host.appendChild(cell('Gauge verdicts',
    `<div style="display:flex;gap:12px">
       <div class="spy-gauge" data-size="sm" data-verdict="good" data-value="94"></div>
       <div class="spy-gauge" data-size="sm" data-verdict="fair" data-value="62"></div>
       <div class="spy-gauge" data-size="sm" data-verdict="bad" data-value="28"></div>
     </div>`));
  paintGauges(host);
}

/* -------------------------------------------------------------------- BOOT */
function renderAll() {
  renderColorSemantic(); renderRamps(); renderAlpha();
  renderTypeSpecimen(); renderSpace(); renderHeights();
  renderRadius(); renderBorder(); renderElevation();
  renderIconSizes(); renderIconGrid(); renderMotion(); renderLayout();
  renderButtonStates(); renderControlsMatrix(); renderSwitches(); renderPickerGrid();
  renderProduct();
  presetGrid($('#render-presets'), 2); presetGrid($('#render-presets-2'), 4);
  renderUsageRows(); renderTints();
}
renderAll();
wireTheme();
wireInteractions();
})();
