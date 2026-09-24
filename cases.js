/* ---------------------------------------------------------------------------
   The component page, generated from cases.

   The old page documented a component as one wall — every variant, then every
   size, then a states grid — and the question it kept producing was "which one
   do I use". A reader looking for *how do I put an icon in a button* should land
   on a section called Icon holding one button with one icon and the two lines
   that make it, not a grid of a hundred and forty.

   So a component is a list of cases, one axis each, and every case carries its
   own markup. The markup is not typed beside the example: it is serialised back
   out of the example after the browser has rendered it. Code that is typed
   drifts from what it documents; code read out of the DOM cannot.
--------------------------------------------------------------------------- */
(function () {
'use strict';

const ic = (n, size) => `<svg class="spy-icon"${size ? ` data-size="${size}"` : ''}><use href="#i-${n}"/></svg>`;

/* -- the serialiser --------------------------------------------------------- */

const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr','use','path','circle','rect','line','polyline','polygon']);

function flat(node) {
  if (node.nodeType === 3) return node.textContent.replace(/\s+/g, ' ').trim();
  if (node.nodeType !== 1) return '';
  const tag = node.tagName.toLowerCase();
  const attrs = [...node.attributes]
    .map(a => (a.value === '' ? ` ${a.name}` : ` ${a.name}="${a.value}"`)).join('');
  if (VOID.has(tag)) return `<${tag}${attrs}/>`;
  const inner = [...node.childNodes].map(flat).filter(Boolean).join('');
  return `<${tag}${attrs}>${inner}</${tag}>`;
}

// Standard pretty-printer shape: try the whole subtree on one line, and only
// break it open when it does not fit. An icon is <svg><use/></svg> — three
// lines of it in every example would bury the one attribute that matters.
const WIDTH = 78;

function serialize(node, depth) {
  const pad = '  '.repeat(depth);
  if (node.nodeType === 3) {
    const t = node.textContent.replace(/\s+/g, ' ').trim();
    return t ? pad + t : '';
  }
  if (node.nodeType !== 1) return '';
  const one = flat(node);
  // A leaf — an element whose only content is text — never breaks. Wrapping a
  // <button>Month</button> because it landed one character past the margin puts
  // three of a row of five on three lines and makes the row look inconsistent.
  if (node.children.length === 0 || pad.length + one.length <= WIDTH) return pad + one;

  const tag = node.tagName.toLowerCase();
  const attrs = [...node.attributes]
    .map(a => (a.value === '' ? ` ${a.name}` : ` ${a.name}="${a.value}"`)).join('');
  if (VOID.has(tag)) return `${pad}<${tag}${attrs}/>`;
  const kids = [...node.childNodes].map(c => serialize(c, depth + 1)).filter(Boolean);
  if (!kids.length) return `${pad}<${tag}${attrs}></${tag}>`;
  return `${pad}<${tag}${attrs}>\n${kids.join('\n')}\n${pad}</${tag}>`;
}

const codeOf = host => [...host.children].map(n => serialize(n, 0)).join('\n');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* The code block is coloured by one pass over the escaped string. Four roles,
   not eight: the tag, the attribute name, the attribute value, and the text
   that is actually the content. A highlighter with a colour per token type
   turns a six-line example into a rainbow and buries the one word that
   differs between two cases — which, on a page built entirely out of pairs of
   nearly-identical examples, is the only thing worth seeing. */
function highlight(escaped) {
  return escaped.replace(/&lt;(\/?)([a-z0-9-]+)((?:[^&]|&(?!gt;))*)(\/?)&gt;/gi,
    (m, close, tag, attrs, selfClose) => {
      const painted = attrs.replace(/([a-z-]+[a-z0-9-]*)(=&quot;[^&]*&quot;|="[^"]*")?/gi,
        (am, name, val) => {
          if (!name.trim()) return am;
          const n = '<span class="tok-attr">' + name + '</span>';
          if (!val) return n;
          return n + '=<span class="tok-val">' + val.slice(1) + '</span>';
        });
      return '<span class="tok-punc">&lt;' + close + '</span>' +
             '<span class="tok-tag">' + tag + '</span>' + painted +
             '<span class="tok-punc">' + selfClose + '&gt;</span>';
    });
}

/* -- the renderer ----------------------------------------------------------- */

function renderCase(c, componentId) {
  const art = document.createElement('article');
  art.className = 'doc-case';
  art.id = componentId + '-' + c.id;

  const head = document.createElement('div');
  head.className = 'doc-case-head';
  head.innerHTML =
    `<h3 class="doc-case-title spy-h6">${c.name}</h3>` +
    (c.when ? `<p class="doc-case-when spy-body-s spy-text-secondary">${c.when}</p>` : '');
  art.appendChild(head);

  // The example and the code it produced are one object, so they are one box.
  // They used to be two siblings of the case's grid, which put its row gap
  // between them — two cards drifting apart, when what is meant is one card
  // split by a hairline.
  const body = document.createElement('div');
  body.className = 'doc-case-body';
  art.appendChild(body);

  const preview = document.createElement('div');
  preview.className = 'doc-case-preview';
  if (c.surface) preview.setAttribute('data-surface', c.surface);
  if (c.stack) preview.setAttribute('data-stack', '');
  preview.innerHTML = c.demo;
  body.appendChild(preview);

  if (c.noCode) { return art; }

  const code = codeOf(preview);
  const block = document.createElement('div');
  block.className = 'doc-case-code';
  block.innerHTML =
    `<button class="doc-case-copy spy-btn" data-variant="ghost" data-size="xxs" type="button">Copy</button>` +
    `<pre><code>${highlight(esc(code))}</code></pre>`;
  block.querySelector('.doc-case-copy').addEventListener('click', function () {
    navigator.clipboard.writeText(code).then(() => {
      this.textContent = 'Copied';
      setTimeout(() => { this.textContent = 'Copy'; }, 1400);
    }, () => { this.textContent = 'Press ⌘C'; });
  });
  body.appendChild(block);
  return art;
}

function table(caption, head, rows) {
  if (!rows || !rows.length) return null;
  const wrap = document.createElement('div');
  wrap.className = 'doc-api-block';
  wrap.innerHTML =
    `<h4 class="doc-api-title spy-caption-l">${caption}</h4>` +
    `<table class="doc-purpose-table spy-caption-l">` +
    `<thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead>` +
    `<tbody>${rows.map(r => `<tr>${r.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>` +
    `</table>`;
  return wrap;
}

function renderComponent(spec) {
  const sec = document.createElement('section');
  sec.className = 'doc-section';
  sec.id = spec.id;
  sec.setAttribute('data-nav', spec.name);

  const head = document.createElement('header');
  head.className = 'doc-section-head';
  head.innerHTML =
    `<h2 class="spy-h5">${spec.name}</h2>` +
    `<p class="spy-body-s spy-text-secondary">${spec.lede}</p>` +
    (spec.base ? `<p class="doc-base spy-caption-l spy-text-tertiary"><code>${spec.base}</code></p>` : '');
  sec.appendChild(head);

  if (spec.purpose) {
    const t = table('Pick by the job', ['Variant', 'Use it for', 'Not for'],
      spec.purpose.map(([v, a, b]) => [`<code>${v}</code>`, a, b]));
    t.classList.add('doc-api-purpose');
    sec.appendChild(t);
  }
  if (spec.notes && spec.notes.length) {
    const ul = document.createElement('ul');
    ul.className = 'doc-bullets spy-caption-l spy-text-secondary';
    ul.innerHTML = spec.notes.map(n => `<li>${n}</li>`).join('');
    sec.appendChild(ul);
  }

  const cases = document.createElement('div');
  cases.className = 'doc-cases';
  spec.cases.forEach(c => cases.appendChild(renderCase(c, spec.id)));
  sec.appendChild(cases);

  if (spec.api) {
    const api = document.createElement('div');
    api.className = 'doc-api';
    api.innerHTML = `<h3 class="doc-api-head spy-h6">API</h3>`;
    const p = table('Properties', ['Attribute', 'Values', 'Default'],
      (spec.api.props || []).map(([n, v, d]) => [`<code>${n}</code>`, v, d ? `<code>${d}</code>` : '<span class="spy-text-tertiary">—</span>']));
    const parts = table('Parts', ['Class', 'What it is'],
      (spec.api.parts || []).map(([n, w]) => [`<code>${n}</code>`, w]));
    const st = table('States', ['State', 'How it is expressed'],
      (spec.api.states || []).map(([n, w]) => [`<code>${n}</code>`, w]));
    [p, parts, st].forEach(t => t && api.appendChild(t));
    sec.appendChild(api);
  }
  return sec;
}

/* -- mount ------------------------------------------------------------------ */

window.SPY_CASES = window.SPY_CASES || [];
window.SPY_RENDER_CASES = function (hostSelector) {
  const host = document.querySelector(hostSelector);
  if (!host) return;
  window.SPY_CASES.forEach(spec => host.appendChild(renderComponent(spec)));
};
window.SPY_ICON = ic;
})();

/* ---------------------------------------------------------------------------
   Behaviour

   The examples have to work. A tab you cannot click is not an example of a tab,
   and the page had 101 of them doing nothing — the interaction layer lives in
   app.js, which this page has no other reason to load. The same split that
   killed the theme switch.

   It is driven by STRUCTURE, not by a data-js attribute the markup has to
   remember: a tab is a [role="tab"] inside a [role="tablist"], and that is
   already enough to know it selects. Which matters twice over here, because the
   code block is serialised from this markup — an attribute added to make the
   demo work would be an attribute in everything anyone copies.
--------------------------------------------------------------------------- */
(function () {
'use strict';
const inPreview = el => el && el.closest('.doc-case-preview');
const within = (el, sel, scope) => [...(scope || document).querySelectorAll(sel)].filter(x => x !== el);

function exclusive(el, itemSel, containerSel, attr) {
  const box = el.closest(containerSel);
  if (!box) return false;
  box.querySelectorAll(itemSel).forEach(x => x.removeAttribute(attr));
  el.setAttribute(attr, '');
  return true;
}

document.addEventListener('click', ev => {
  const t = ev.target;
  if (!(t instanceof Element) || !inPreview(t)) return;

  // tabs, and everything else that is one-of-a-set
  const tab = t.closest('[role="tab"], .spy-tabs-tab');
  if (tab && !tab.hasAttribute('data-disabled')) {
    if (exclusive(tab, '.spy-tabs-tab', '.spy-tabs-list', 'data-active')) {
      tab.closest('.spy-tabs-list').querySelectorAll('[role="tab"]')
        .forEach(x => x.setAttribute('aria-selected', String(x === tab)));
      return;
    }
  }
  for (const [sel, box] of [
    ['.spy-navmenu-item', '.spy-navmenu'],
    ['.spy-nav-item', '.spy-nav-list'],
    ['.spy-sidebar-row', '.doc-case-preview'],
    ['.spy-pagination-item', '.spy-pagination'],
    ['.spy-menu-item', '.spy-menu, .spy-cmdk-results'],
  ]) {
    const el = t.closest(sel);
    if (el && !el.hasAttribute('data-disabled')) {
      const attr = sel === '.spy-menu-item' ? 'data-selected' : 'data-active';
      // prev and next are not pages — they move to the one beside the current
      if (el.matches('[data-icon-only]') && sel === '.spy-pagination-item') {
        const nav = el.closest('.spy-pagination');
        const pages = [...nav.querySelectorAll('.spy-pagination-item:not([data-icon-only])')];
        const at = pages.findIndex(x => x.hasAttribute('data-active'));
        const next = pages[at + (nav.querySelector('[data-icon-only]') === el ? -1 : 1)];
        if (next) { pages.forEach(x => { x.removeAttribute('data-active'); x.removeAttribute('aria-current'); });
                    next.setAttribute('data-active', ''); next.setAttribute('aria-current', 'page'); }
        ev.preventDefault(); return;
      }
      if (exclusive(el, sel, box, attr)) { ev.preventDefault(); return; }
    }
  }

  // things that toggle
  const toggles = [
    ['button.spy-chip', 'data-selected', el => el],
    ['.spy-toggle', 'data-pressed', el => el],
    ['.spy-switch', 'data-checked', el => el],
    ['.spy-accordion-trigger', 'data-open', el => el.closest('.spy-accordion-item')],
    ['.spy-select-trigger', 'data-open', el => el],
    ['.spy-toolcall-trigger', 'data-open', el => el.closest('.spy-toolcall')],
    ['.spy-panel-section-header', 'data-open', el => el.closest('.spy-panel-section')],
  ];
  for (const [sel, attr, owner] of toggles) {
    const el = t.closest(sel);
    if (el && !el.hasAttribute('data-disabled')) {
      const node = owner(el);
      if (!node) continue;
      const on = node.toggleAttribute(attr);
      if (attr === 'data-pressed') el.setAttribute('aria-pressed', String(on));
      ev.preventDefault();
      return;
    }
  }

  // a checkbox in a table selects its row; everywhere else it selects itself
  const box = t.closest('.spy-checkbox, .spy-radio');
  if (box && !box.hasAttribute('data-disabled')) {
    ev.preventDefault();
    if (box.matches('.spy-radio')) {
      exclusive(box, '.spy-radio', '.doc-case-preview', 'data-checked');
      return;
    }
    const row = box.closest('tr');
    const head = box.closest('thead');
    if (head) {
      // the header box drives every row, and lands on indeterminate only when
      // the rows disagree — which they cannot, right after it has set them all
      const table = box.closest('table');
      const on = !box.hasAttribute('data-checked');
      box.removeAttribute('data-indeterminate');
      box.toggleAttribute('data-checked', on);
      table.querySelectorAll('tbody tr').forEach(r => {
        r.toggleAttribute('data-selected', on);
        const b = r.querySelector('.spy-checkbox');
        if (b) b.toggleAttribute('data-checked', on);
      });
      return;
    }
    const on = box.toggleAttribute('data-checked');
    if (row) row.toggleAttribute('data-selected', on);
    if (row) {
      const table = row.closest('table');
      const all = [...table.querySelectorAll('tbody .spy-checkbox')];
      const n = all.filter(b => b.hasAttribute('data-checked')).length;
      const head2 = table.querySelector('thead .spy-checkbox');
      if (head2) {
        head2.toggleAttribute('data-checked', n === all.length);
        head2.toggleAttribute('data-indeterminate', n > 0 && n < all.length);
      }
    }
    return;
  }

  // the clear button clears
  const clear = t.closest('.spy-field-clear');
  if (clear) {
    const input = clear.closest('.spy-field-control').querySelector('.spy-field-input');
    if (input) { input.value = ''; input.focus(); }
    ev.preventDefault();
    return;
  }

  const close = t.closest('.spy-toast-close');
  if (close) { close.closest('.spy-toast').remove(); return; }

  // a link inside an example goes nowhere — it is an example of a link
  const link = t.closest('a[href^="#"]');
  if (link) ev.preventDefault();
});

// the slider is a drag, not a click
document.addEventListener('pointerdown', ev => {
  const track = ev.target instanceof Element && ev.target.closest('.doc-case-preview .spy-slider-track');
  if (!track) return;
  const slider = track.closest('.spy-slider');
  if (slider.hasAttribute('data-disabled')) return;
  const set = x => {
    const r = track.getBoundingClientRect();
    slider.style.setProperty('--spy-slider-value',
      Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)) + '%');
  };
  set(ev.clientX);
  track.setPointerCapture(ev.pointerId);
  const move = e => set(e.clientX);
  const up = () => { track.removeEventListener('pointermove', move); track.removeEventListener('pointerup', up); };
  track.addEventListener('pointermove', move);
  track.addEventListener('pointerup', up);
});
})();
