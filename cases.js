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

  const preview = document.createElement('div');
  preview.className = 'doc-case-preview';
  if (c.surface) preview.setAttribute('data-surface', c.surface);
  if (c.stack) preview.setAttribute('data-stack', '');
  preview.innerHTML = c.demo;
  art.appendChild(preview);

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
  art.appendChild(block);
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
