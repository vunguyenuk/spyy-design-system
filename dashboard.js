/* Spyy — product prototype (v2)
   Flow follows Figma "Spyy-Design-Tokens" › Flow (87:486):
   Sign in → Onboarding → Home search (TikTok | Facebook) → Result / detail.
   Steps the live product has but the Figma flow skips are added:
   confirm exact accounts → scan progress → brand results, plus Scans, Watchlist, Collections.
   Every visual comes from tokens.css / components.css / patterns.css; dashboard.css only lays them out. */
(() => {
  'use strict';

  const D = window.SPYY;
  const app = document.getElementById('app');
  const toasts = document.getElementById('toasts');

  /* ------------------------------------------------------------------ helpers */
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (n, size) => `<svg class="spy-icon"${size ? ` data-size="${size}"` : ''} aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const initials = (name) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const brandOf = (id) => D.brands.find((b) => b.id === id);
  const adOf = (id) => D.ads.find((a) => a.id === id);
  const videoSrc = (a) => a.video || `assets/videos/${a.id}.mp4`;
  const fmtDur = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtDate = (iso) => { const d = new Date(iso + 'T00:00:00Z'); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`; };
  const parseCount = (s) => { const m = String(s).match(/([\d.]+)\s*([KM]?)/i); if (!m) return 0; return parseFloat(m[1]) * (m[2].toUpperCase() === 'M' ? 1e6 : m[2].toUpperCase() === 'K' ? 1e3 : 1); };
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  /* Real lists lifted from the live bundle (scan-format chunk). */
  const REGIONS = [['ALL', 'All regions'], ['US', 'United States'], ['GB', 'United Kingdom'], ['DE', 'Germany'], ['FR', 'France'], ['ES', 'Spain'], ['IT', 'Italy'], ['NL', 'Netherlands'], ['PL', 'Poland'], ['SE', 'Sweden'], ['CA', 'Canada'], ['AU', 'Australia'], ['BR', 'Brazil'], ['IN', 'India'], ['JP', 'Japan'], ['VN', 'Vietnam']];
  const SOURCE = { tiktok: { long: 'TikTok', short: 'TikTok' }, meta: { long: 'Meta Ad Library', short: 'Meta' }, appstore: { long: 'App Store', short: 'App Store' } };
  const INDUSTRIES = ['Health & fitness', 'Education', 'Beauty & wellness', 'Fashion', 'Home & living', 'Travel', 'Finance', 'Arts & entertainment', 'Food & drink', 'Games', 'Apps & software', 'E-commerce'];

  /* TikTok filter model — grouped the way TikTok Creative Center / PiPiAds group them.
     Only the first two groups show until the panel is expanded. */
  const TK = {
    objective: ['Any objective', 'App installs', 'Product sales', 'Lead generation', 'Traffic', 'Community interaction', 'Video views', 'Reach'],
    period: [['all', 'All time'], ['1', 'Yesterday'], ['7', '7 days'], ['30', '30 days'], ['180', '6 months'], ['365', '1 year']],
    language: ['Any language', 'English', 'Spanish', 'Vietnamese', 'German', 'French', 'Japanese'],
    cta: ['Any CTA', 'Download', 'Install now', 'Shop now', 'Learn more', 'Sign up', 'Book now', 'Order now'],
    landing: ['Any landing page', 'App Store / Google Play', 'Website', 'TikTok Shop', 'Instant form'],
    duration: ['Any length', 'Under 15s', '15–30s', '30–60s', 'Over 60s'],
    audience: ['Any age', '13–24', '18–24', '18–34', '25–44', '45+'],
    likes: ['Any likes', '10K+', '50K+', '100K+', '250K+'],
    ctr: ['Any CTR rank', 'Top 10%', 'Top 20%', 'Top 30%'],
    budget: ['Any budget', 'Low', 'Medium', 'High'],
    conversion: ['Any rating', 'High', 'Medium', 'Low'],
  };
  /* Facebook filter model — the Meta Ad Library vocabulary, verbatim. */
  const FB = {
    category: [['all', 'All ads'], ['issues', 'Issues, elections or politics'], ['housing', 'Properties'], ['employment', 'Employment'], ['financial', 'Financial products and services']],
    status: [['active', 'Active ads'], ['inactive', 'Inactive ads'], ['all', 'Active and inactive']],
    platforms: [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['messenger', 'Messenger'], ['audience_network', 'Audience Network'], ['threads', 'Threads']],
    media: ['All media types', 'Video', 'Image', 'Meme', 'Image and meme', 'No image or video'],
    language: ['All languages', 'English', 'Spanish', 'Vietnamese', 'German', 'French'],
    sort: [['relevant', 'Most relevant'], ['newest', 'Newest'], ['longest', 'Longest running'], ['versions', 'Most versions'], ['impressions', 'Most impressions']],
  };
  const PLATFORM_LABEL = Object.fromEntries(FB.platforms);

  /* ------------------------------------------------------------------ state */
  const KEY = 'spyy-proto-v2';
  const defaults = () => ({
    signedIn: false, onboarded: false,
    profile: { role: null, research: [], sources: [], regions: [], industries: [] },
    region: 'US', source: 'tiktok', query: '', category: 'all',
    tk: { industry: 'all', objective: TK.objective[0], period: 'all', firstSeen: '', lastSeen: '', language: TK.language[0], cta: TK.cta[0], landing: TK.landing[0], duration: TK.duration[0], audience: TK.audience[0], likes: TK.likes[0], ctr: TK.ctr[0], budget: TK.budget[0], conversion: TK.conversion[0], newAds: false, firstTime: false, repeated: false, realPeople: false, ai: 'all', sort: 'likes' },
    tkOpen: false,
    fb: { adCategory: 'all', status: 'active', platforms: [], media: FB.media[0], language: FB.language[0], versions: false, from: '', to: '', advertiser: '', sort: 'relevant' },
    saved: ['cal-ai-track', 'duolingo-green'],
    collections: [{ id: 'q4', name: 'Q4 offer angles', items: ['cal-ai-track', 'duolingo-green'] }],
    watch: [
      { brandId: 'cal-ai', cadence: 'weekly', alerts: 'default', last: '2026-09-21', newSince: 3 },
      { brandId: 'duolingo', cadence: 'monthly', alerts: 'weekly_digest', last: '2026-09-02', newSince: 0 },
    ],
    scans: [
      { brandId: 'cal-ai', videos: 2, sources: ['meta', 'tiktok'], from: 'watchlist', at: '2026-09-21T09:12:00Z' },
      { brandId: 'dietfit-ai', videos: 3, sources: ['meta', 'tiktok', 'appstore'], from: 'search', at: '2026-09-18T14:40:00Z' },
      { brandId: 'duolingo', videos: 3, sources: ['meta', 'tiktok', 'appstore'], from: 'search', at: '2026-09-02T08:05:00Z' },
    ],
    scansUsed: 12, scansLimit: 50,
    detailTab: 'overview', brandTab: 'all', brandSort: 'longest', highOnly: false,
  });
  let S;
  try { S = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = defaults(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode */ } };
  const ui = { fbSecs: {}, fbDrawer: false, menu: null, onboardStep: 0, formMode: false, draftAccounts: null, scanTimer: null };

  /* ------------------------------------------------------------------ router */
  const route = () => {
    const [path, qs] = (location.hash.replace(/^#/, '') || '/overview').split('?');
    const parts = path.split('/').filter(Boolean);
    return { name: parts[0] || 'overview', id: parts[1] ? decodeURIComponent(parts[1]) : null, q: new URLSearchParams(qs || '') };
  };
  const go = (h) => { if (location.hash === h) render(); else location.hash = h; };

  /* ------------------------------------------------------------------ toast */
  function toast(title, body, tone) {
    const t = document.createElement('div');
    t.className = 'spy-toast app-toast';
    if (tone) t.dataset.tone = tone;
    t.innerHTML = `<span class="app-toast-mark">${ic(tone === 'warning' ? 'warning' : 'success', 'sm')}</span><span class="app-toast-text"><strong>${esc(title)}</strong>${body ? `<span>${esc(body)}</span>` : ''}</span>`;
    toasts.appendChild(t);
    setTimeout(() => { t.dataset.leaving = ''; setTimeout(() => t.remove(), 260); }, 3200);
  }

  /* ------------------------------------------------------------------ primitives */
  /* Dropdown built from the system's field control (trigger) and menu (list).
     The list opens BELOW the field — it never covers the value — and is
     positioned fixed after render so a scrolling table or drawer cannot clip it. */
  const select = (name, options, value, label, attrs = '') => {
    const opts = options.map((o) => (Array.isArray(o) ? o : [o, o]));
    const cur = opts.find(([v]) => String(v) === String(value)) || opts[0];
    const open = ui.menu === `dd:${name}`;
    const id = `dd-${name.replace(/\W/g, '-')}`;
    return `
    <div class="app-dd" ${attrs}>
      <button type="button" class="spy-field-control app-select" data-size="sm" data-action="menu" data-menu="dd:${esc(name)}" data-dd-trigger="${esc(name)}"
        aria-haspopup="listbox" aria-expanded="${open}" ${open ? `aria-controls="${id}"` : ''} ${label ? `aria-label="${esc(label)}: ${esc(cur[1])}"` : ''}${open ? ' data-open' : ''}>
        ${label ? `<span class="app-select-label">${esc(label)}</span>` : ''}
        <span class="app-select-value">${esc(cur[1])}</span>
        <span class="app-select-chevron">${ic(open ? 'chevron-up' : 'chevron-down', 'sm')}</span>
      </button>
      ${open ? `<div class="spy-menu app-dd-menu" role="listbox" id="${id}" data-dd-menu>
        ${opts.map(([v, t]) => { const sel = String(v) === String(cur[0]); return `<button type="button" class="spy-menu-item" role="option" aria-selected="${sel}"${sel ? ' data-selected' : ''} data-action="dd-pick" data-bind="${esc(name)}" data-value="${esc(v)}"><span class="spy-menu-item-label">${esc(t)}</span>${sel ? `<span class="app-dd-check">${ic('check', 'sm')}</span>` : ''}</button>`; }).join('')}
      </div>` : ''}
    </div>`;
  };
  const chip = (label, selected, attrs = '', size = 'sm') => `<button type="button" class="spy-chip" data-size="${size}" ${selected ? 'data-selected aria-pressed="true"' : 'aria-pressed="false"'} ${attrs}>${label}</button>`;
  const checkbox = (name, label, checked, hint) => `
    <label class="spy-control-label app-check">
      <input type="checkbox" class="app-sr" data-bind="${name}" ${checked ? 'checked' : ''}>
      <span class="spy-checkbox"${checked ? ' data-checked' : ''}><span class="spy-control-box"><span class="spy-control-indicator">${ic('check')}</span></span></span>
      <span class="spy-control-label-text"><span>${esc(label)}</span>${hint ? `<span class="spy-caption-m spy-text-tertiary">${esc(hint)}</span>` : ''}</span>
    </label>`;
  const radio = (group, value, label, checked) => `
    <label class="spy-control-label app-check">
      <input type="radio" class="app-sr" name="${group}" value="${esc(value)}" data-bind="${group}" ${checked ? 'checked' : ''}>
      <span class="spy-radio"${checked ? ' data-checked' : ''}><span class="spy-control-box"><span class="spy-radio-dot"></span></span></span>
      <span class="spy-control-label-text">${esc(label)}</span>
    </label>`;
  const source = (s) => `<span class="spy-source" data-source="${s}"><span class="spy-source-dot"></span>${esc(SOURCE[s]?.short || s)}</span>`;
  const avatar = (brand, size) => `<span class="spy-avatar app-brand-avatar"${size ? ` data-size="${size}"` : ''} aria-hidden="true">${esc(initials(brand.name))}</span>`;
  const tabs = (items, active, bind, variant = 'line') => `
    <div class="spy-tabs" data-variant="${variant}"><div class="spy-tabs-list" role="tablist">
      ${items.map(([v, t]) => `<button class="spy-tabs-tab" role="tab" data-tab="${bind}" data-value="${esc(v)}" aria-selected="${v === active}"${v === active ? ' data-active' : ''}><span class="spy-tabs-tab-content">${t}</span></button>`).join('')}
    </div></div>`;

  /* ------------------------------------------------------------------ shell */
  function shell(active, body, opts = {}) {
    const me = D.currentUser;
    const nav = [['overview', 'Overview'], ['scans', 'Scans'], ['watchlist', 'Watchlist'], ['collections', 'Collections']];
    return `
    <header class="app-top">
      <a class="app-wordmark" href="#/overview" aria-label="Spyy overview">Spyy</a>
      <nav class="app-nav" aria-label="Primary">
        ${nav.map(([k, t]) => `<a class="app-nav-link" href="#/${k}"${active === k ? ' aria-current="page"' : ''}>${t}</a>`).join('')}
      </nav>
      <div class="app-top-end">
        <a class="app-usage" href="#/overview" title="Scans used this month">
          <span class="spy-caption-m spy-text-secondary"><strong>${S.scansUsed}</strong> of ${S.scansLimit} scans</span>
          <span class="spy-progress" aria-hidden="true"><span class="spy-progress-fill" style="width:${(S.scansUsed / S.scansLimit) * 100}%"></span></span>
        </a>
        <button class="spy-btn" data-variant="ghost" data-size="sm" data-icon-only data-action="theme" aria-label="Switch to ${document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'} theme">${ic(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon')}</button>
        <div class="app-menu-anchor">
          <button class="app-me" data-action="menu" data-menu="me" aria-haspopup="menu" aria-expanded="${ui.menu === 'me'}"><span class="spy-avatar">${esc(initials(me.name))}</span><span class="app-me-text"><span>${esc(me.workspace)}</span><span class="spy-caption-m spy-text-tertiary">${esc(me.plan)}</span></span>${ic('chevron-down', 'sm')}</button>
          ${ui.menu === 'me' ? `<div class="spy-menu app-menu" role="menu">
            <div class="spy-menu-group-label">${esc(me.email)}</div>
            <a class="spy-menu-item" role="menuitem" href="index.html"><span class="spy-menu-item-icon">${ic('layers')}</span><span class="spy-menu-item-label">Design system</span></a>
            <button class="spy-menu-item" role="menuitem" data-action="restart-onboarding"><span class="spy-menu-item-icon">${ic('sparkle')}</span><span class="spy-menu-item-label">Redo onboarding</span></button>
            <button class="spy-menu-item" role="menuitem" data-action="toast" data-title="Settings" data-body="Workspace settings open in the live product."><span class="spy-menu-item-icon">${ic('settings')}</span><span class="spy-menu-item-label">Settings</span></button>
            <button class="spy-menu-item" role="menuitem" data-action="toast" data-title="Billing" data-body="Plans and invoices are managed on Stripe."><span class="spy-menu-item-icon">${ic('layers')}</span><span class="spy-menu-item-label">Billing</span></button>
            <div class="spy-menu-separator"></div>
            <button class="spy-menu-item" role="menuitem" data-action="signout" data-danger><span class="spy-menu-item-icon">${ic('arrow-right')}</span><span class="spy-menu-item-label">Sign out</span></button>
          </div>` : ''}
        </div>
      </div>
    </header>
    ${opts.strip || ''}
    <main id="main" class="app-main${opts.wide ? ' app-main--wide' : ''}" tabindex="-1">${body}</main>`;
  }

  /* ================================================================== SIGN IN */
  function viewLogin() {
    /* Three columns of creatives drifting in alternate directions — the
       "every ad, in one sheet" idea as motion. Each track holds its set twice
       so a -50% translate loops seamlessly. */
    const cols = [[1, 4, 6], [2, 5, 3], [3, 6, 1]].map((set, i) => {
      const imgs = set.map((n) => `<img src="assets/figma/signin/tile-${n}.webp" alt="">`).join('');
      return `<div class="auth-col" data-dir="${i % 2 ? 'down' : 'up'}"><div class="auth-track">${imgs}${imgs}</div></div>`;
    }).join('');
    const tiles = cols;
    return `
    <div class="auth">
      <section class="auth-form" aria-labelledby="auth-title">
        <a class="app-wordmark" href="#/login">Spyy</a>
        <div class="auth-body">
          <h1 id="auth-title" class="spy-h5">Sign in</h1>
          <p class="spy-body-s spy-text-secondary">Google, or a link to your inbox. There is no password to remember, so none to reset.</p>
          <button class="spy-btn" data-variant="outline" data-size="lg" data-full-width data-action="signin"><img src="assets/figma/signin/google.svg" alt="" width="18" height="18">Continue with Google</button>
          <div class="auth-or"><span class="spy-caps spy-caption-m spy-text-tertiary">or by email</span></div>
          <form class="spy-stack auth-email" data-form="email">
            <div class="spy-field">
              <label class="spy-field-label" for="auth-email">Work email</label>
              <div class="spy-field-control" data-size="lg"><input id="auth-email" class="spy-field-input" type="email" autocomplete="email" placeholder="you@company.com" required></div>
            </div>
            <button class="spy-btn" data-variant="brand" data-size="lg" data-full-width type="submit">Email me a sign-in link</button>
          </form>
          <p class="spy-caption-m spy-text-tertiary">By continuing you accept the <a href="#/login">Terms</a> and <a href="#/login">Privacy notice</a>. Scans read public ad libraries only.</p>
        </div>
      </section>
      <aside class="auth-art" aria-hidden="true">
        <div class="auth-tiles">${tiles}</div>
        <div class="auth-art-copy">
          <span class="spy-caps spy-caption-m">Competitive creative intelligence</span>
          <p class="spy-h6"><span class="auth-line">Every active video ad a brand runs</span><span class="auth-line">on TikTok, Meta and the App Store in one sheet.</span></p>
        </div>
      </aside>
    </div>`;
  }

  /* ================================================================== ONBOARDING (conversational, Figma 47:14) */
  const ONBOARD = [
    { key: 'role', single: true, ask: 'To start — what best describes your work?', options: ['Growth marketer', 'Creative strategist', 'Performance buyer', 'Agency or consultant', 'Founder'] },
    { key: 'research', ask: 'Whose ads will you research first?', note: 'You can add more later.', options: ['My own brand', 'Direct competitors', 'Category leaders', 'Client brands'] },
    { key: 'sources', ask: 'Where do those brands advertise?', note: 'Spyy scans each source separately, so you only pay for the ones you pick.', options: [['tiktok', 'TikTok'], ['meta', 'Facebook & Instagram'], ['appstore', 'App Store']] },
    { key: 'regions', ask: 'Which markets matter to you?', options: REGIONS.slice(1, 11) },
    { key: 'industries', ask: 'And which categories should Overview lead with?', note: 'Trending ads are grouped by these.', options: INDUSTRIES.slice(0, 8) },
  ];
  const optLabel = (o) => (Array.isArray(o) ? o[1] : o);
  const optVal = (o) => (Array.isArray(o) ? o[0] : o);

  function viewOnboarding() {
    const p = S.profile;
    /* Resume at the first unanswered question instead of re-asking from the top. */
    if (!ui.onboardResumed) {
      ui.onboardResumed = true;
      const first = ONBOARD.findIndex((q) => (q.single ? !p[q.key] : !p[q.key].length));
      ui.onboardStep = first === -1 ? ONBOARD.length : first;
    }
    const answered = ONBOARD.filter((q) => (q.single ? p[q.key] : p[q.key].length));
    const pct = Math.round((answered.length / ONBOARD.length) * 100);
    const step = Math.min(ui.onboardStep, ONBOARD.length);
    const first = D.currentUser.name.split(' ')[0];

    let convo = `<div class="chat-msg" data-from="spyy"><p>I’ll ask five quick questions so Overview opens on the ads you care about. You can also paste a competitor’s website or App Store link and I’ll pull the brand in.</p></div>`;
    ONBOARD.forEach((q, i) => {
      if (i > step) return;
      convo += `<div class="chat-msg" data-from="spyy"><p>${esc(q.ask)}</p>${q.note ? `<p class="spy-caption-l spy-text-tertiary">${esc(q.note)}</p>` : ''}</div>`;
      if (i < step) {
        const v = q.single ? [p[q.key]] : p[q.key];
        const labels = q.options.filter((o) => v.includes(optVal(o))).map(optLabel);
        convo += `<div class="chat-msg" data-from="me"><p>${esc(labels.join(', ') || 'Skip')}</p></div>`;
      } else {
        const v = q.single ? [p[q.key]] : p[q.key];
        convo += `<div class="chat-replies" role="group" aria-label="${esc(q.ask)}">
          ${q.options.map((o) => chip(`${v.includes(optVal(o)) ? ic('check', 'sm') : ic('plus', 'sm')}${esc(optLabel(o))}`, v.includes(optVal(o)), `data-action="onboard-pick" data-key="${q.key}" data-value="${esc(optVal(o))}"`, 'md')).join('')}
          <div class="chat-replies-actions">
            ${!q.single ? `<button class="spy-btn" data-variant="ghost" data-size="sm" data-action="onboard-next" data-skip>Skip</button>` : ''}
            <button class="spy-btn" data-variant="brand" data-size="sm" data-action="onboard-next" ${v.filter(Boolean).length ? '' : 'disabled'}>Continue</button>
          </div>
        </div>`;
      }
    });
    if (step >= ONBOARD.length) {
      convo += `<div class="chat-msg" data-from="spyy"><p>That’s everything. Overview now opens on <strong>${esc(SOURCE[S.source].short)}</strong> in <strong>${esc((REGIONS.find((r) => r[0] === S.region) || [])[1] || 'All regions')}</strong>, grouped by the categories you picked.</p></div>
        <div class="chat-replies"><div class="chat-replies-actions"><button class="spy-btn" data-variant="brand" data-size="md" data-action="onboard-finish">Open Overview ${ic('arrow-right', 'sm')}</button></div></div>`;
    }

    const facts = [
      ['Role', p.role || '—'],
      ['Researching', p.research.join(', ') || '—'],
      ['Sources', p.sources.map((s) => SOURCE[s].short).join(', ') || '—'],
      ['Markets', p.regions.join(', ') || '—'],
      ['Categories', p.industries.join(', ') || '—'],
    ];

    const form = `<form class="onboard-form" data-form="onboard">
      ${ONBOARD.map((q) => `<fieldset class="onboard-fieldset"><legend class="spy-h6 onboard-legend">${esc(q.ask)}</legend><div class="chat-replies">
        ${q.options.map((o) => { const v = q.single ? [p[q.key]] : p[q.key]; return chip(esc(optLabel(o)), v.includes(optVal(o)), `data-action="onboard-pick" data-key="${q.key}" data-value="${esc(optVal(o))}"`, 'md'); }).join('')}
      </div></fieldset>`).join('')}
      <div class="chat-replies-actions"><button type="button" class="spy-btn" data-variant="brand" data-size="md" data-action="onboard-finish">Save and open Overview</button></div>
    </form>`;

    return `
    <div class="onboard">
      <header class="onboard-top"><a class="app-wordmark" href="#/onboarding">Spyy</a><button class="spy-btn" data-variant="ghost" data-size="sm" data-action="onboard-finish">Skip for now</button></header>
      <div class="onboard-grid">
        <section class="onboard-chat" aria-labelledby="onboard-title">
          <h1 id="onboard-title" class="spy-h5">Welcome, ${esc(first)}!</h1>
          ${ui.formMode ? form : `<div class="chat-log" aria-live="polite">${convo}</div>
          <form class="spy-field-control chat-composer" data-size="lg" data-form="composer">
            <button type="button" class="spy-btn" data-variant="ghost" data-size="xs" data-icon-only aria-label="Attach a file" data-action="toast" data-title="Attach" data-body="Upload a brand brief or media kit — Spyy reads it for context.">${ic('plus')}</button>
            <input class="spy-field-input" name="reply" placeholder="Reply, or paste a website / App Store link…" aria-label="Reply">
            <button class="spy-btn" data-variant="brand" data-size="xs" data-icon-only aria-label="Send" type="submit">${ic('arrow-up')}</button>
          </form>
          <p class="spy-caption-m spy-text-tertiary onboard-disclaimer">AI can make mistakes. Verify brand matches before a scan starts.</p>`}
        </section>
        <aside class="onboard-side">
          <div class="spy-section-card onboard-profile">
            <div class="spy-section-head"><span class="spy-section-title">${esc(D.currentUser.workspace)}’s profile</span><span class="spy-caption-m spy-text-secondary">${pct}%</span></div>
            <div class="spy-progress"><span class="spy-progress-fill" style="width:${pct}%"></span></div>
            <dl class="onboard-facts">${facts.map(([k, v]) => `<div><dt class="spy-caption-m spy-text-tertiary">${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          </div>
          <button class="app-textlink" data-action="onboard-mode">${ui.formMode ? 'Switch to the conversation' : 'Switch to a form'} ${ic('chevron-right', 'sm')}</button>
        </aside>
      </div>
    </div>`;
  }

  /* ================================================================== OVERVIEW / HOME SEARCH */
  const within = (ad, days) => ad.daysRunning <= Number(days) || false;
  function tkResults() {
    const f = S.tk;
    let list = D.ads.filter((a) => (a.channels || [a.source]).includes('tiktok') && a.tiktok);
    list = list.filter((a) => {
      const t = a.tiktok;
      if (f.industry !== 'all' && a.industry !== f.industry) return false;
      if (f.objective !== TK.objective[0] && t.objective !== f.objective) return false;
      if (f.period !== 'all' && !within(a, f.period)) return false;
      if (f.language !== TK.language[0] && t.language !== f.language) return false;
      if (f.cta !== TK.cta[0] && t.cta !== f.cta) return false;
      if (f.audience !== TK.audience[0] && t.audience !== f.audience) return false;
      if (f.budget !== TK.budget[0] && t.budget !== f.budget) return false;
      if (f.ctr !== TK.ctr[0] && t.ctrTop < 100 - parseInt(f.ctr.replace(/\D/g, ''), 10)) return false;
      if (f.likes !== TK.likes[0] && parseCount(a.metrics.likes) < parseCount(f.likes)) return false;
      if (f.duration !== TK.duration[0]) {
        const d = a.duration; const r = f.duration;
        if (r === 'Under 15s' && d >= 15) return false; if (r === '15–30s' && (d < 15 || d > 30)) return false;
        if (r === '30–60s' && (d < 30 || d > 60)) return false; if (r === 'Over 60s' && d <= 60) return false;
      }
      if (f.newAds && a.daysRunning > 30) return false;
      if (f.firstTime && !t.firstTime) return false;
      if (f.repeated && t.firstTime) return false;
      if (f.realPeople && !t.realPeople) return false;
      if (f.ai === 'ai' && !t.aiGenerated) return false;
      if (f.ai === 'human' && t.aiGenerated) return false;
      if (S.query && !matchQuery(a)) return false;
      return true;
    });
    const by = { likes: (a, b) => parseCount(b.metrics.likes) - parseCount(a.metrics.likes), ctr: (a, b) => b.tiktok.ctrTop - a.tiktok.ctrTop, newest: (a, b) => a.daysRunning - b.daysRunning, longest: (a, b) => b.daysRunning - a.daysRunning };
    return list.sort(by[f.sort] || by.likes);
  }
  function fbResults() {
    const f = S.fb;
    let list = D.ads.filter((a) => (a.channels || [a.source]).includes('meta') && a.meta);
    list = list.filter((a) => {
      const m = a.meta;
      if (f.status === 'active' && !a.active) return false;
      if (f.status === 'inactive' && a.active) return false;
      if (f.platforms.length && !f.platforms.some((p) => m.platforms.includes(p))) return false;
      if (f.media !== FB.media[0] && m.mediaType !== f.media && !(f.media === 'Image and meme' && ['Image', 'Meme'].includes(m.mediaType))) return false;
      if (f.language !== FB.language[0] && m.language !== f.language) return false;
      if (f.versions && m.versions < 2) return false;
      if (f.advertiser && !brandOf(a.brandId).name.toLowerCase().includes(f.advertiser.toLowerCase())) return false;
      if (f.adCategory === 'financial' && a.industry !== 'Finance') return false;
      if (['issues', 'housing', 'employment'].includes(f.adCategory)) return false;
      if (S.query && !matchQuery(a)) return false;
      return true;
    });
    const by = { relevant: () => 0, newest: (a, b) => a.daysRunning - b.daysRunning, longest: (a, b) => b.daysRunning - a.daysRunning, versions: (a, b) => b.meta.versions - a.meta.versions, impressions: (a, b) => parseCount(b.metrics.views) - parseCount(a.metrics.views) };
    return list.sort(by[f.sort]);
  }
  function matchQuery(a) {
    const q = S.query.toLowerCase().replace(/^https?:\/\//, '');
    const b = brandOf(a.brandId);
    return [b.name, b.domain, a.title, a.description, a.industry].join(' ').toLowerCase().includes(q.split('/')[0]);
  }

  function tkActiveFilters() {
    const f = S.tk; const out = [];
    if (f.industry !== 'all') out.push(['industry', f.industry]);
    if (f.objective !== TK.objective[0]) out.push(['objective', f.objective]);
    if (f.period !== 'all') out.push(['period', TK.period.find((p) => p[0] === f.period)[1]]);
    if (f.firstSeen || f.lastSeen) out.push(['firstSeen', `Seen ${f.firstSeen || '…'} – ${f.lastSeen || '…'}`]);
    ['language', 'cta', 'landing', 'duration', 'audience', 'likes', 'ctr', 'budget', 'conversion'].forEach((k) => { if (f[k] !== TK[k][0]) out.push([k, f[k]]); });
    [['newAds', 'New ads'], ['firstTime', 'First-time ads'], ['repeated', 'Repeated ads'], ['realPeople', 'Real people']].forEach(([k, t]) => { if (f[k]) out.push([k, t]); });
    if (f.ai !== 'all') out.push(['ai', f.ai === 'ai' ? 'AI-generated' : 'Not AI']);
    return out;
  }
  function fbActiveFilters() {
    const f = S.fb; const out = [];
    out.push(['status', `Active status: ${FB.status.find((s) => s[0] === f.status)[1]}`]);
    if (f.platforms.length) out.push(['platforms', `Platforms: ${f.platforms.map((p) => PLATFORM_LABEL[p]).join(', ')}`]);
    if (f.media !== FB.media[0]) out.push(['media', `Media: ${f.media}`]);
    if (f.language !== FB.language[0]) out.push(['language', `Language: ${f.language}`]);
    if (f.versions) out.push(['versions', 'Multiple versions']);
    if (f.advertiser) out.push(['advertiser', `Advertiser: ${f.advertiser}`]);
    return out;
  }

  function searchStrip(resultsRow = '') {
    const isTk = S.source === 'tiktok';
    return `
    <div class="app-strip">
      <form class="search-bar" data-form="search" role="search" aria-label="Find ads">
        ${select('region', REGIONS, S.region, null, 'data-w="region" title="Region"')}
        <div class="search-source" role="radiogroup" aria-label="Ad source">
          ${[['tiktok', 'TikTok'], ['meta', 'Facebook']].map(([k, t]) => `<button type="button" role="radio" class="search-source-opt" data-action="source" data-value="${k}" aria-checked="${S.source === k}">${source(k === 'meta' ? 'meta' : 'tiktok').replace(/>(TikTok|Meta)</, `>${t}<`)}</button>`).join('')}
        </div>
        ${!isTk ? select('fb.adCategory', FB.category, S.fb.adCategory, null, 'data-w="cat" title="Ad category"') : ''}
        <div class="spy-field-control search-input" data-size="sm">
          ${ic('search', 'sm')}
          <input class="spy-field-input" name="q" value="${esc(S.query)}" placeholder="${isTk ? 'Brand, app, or keyword on TikTok' : 'Advertiser or keyword in the Meta Ad Library'}" aria-label="Search">
          ${S.query ? `<button type="button" class="spy-field-clear" data-action="clear-query" aria-label="Clear search">${ic('close', 'sm')}</button>` : ''}
        </div>
        <button class="spy-btn" data-variant="outline" data-size="sm" type="submit">Search</button>
        <button class="spy-btn" data-variant="brand" data-size="sm" type="button" data-action="scan-brand" title="Resolve the exact brand and scan every source">${ic('sparkle', 'sm')}Scan a brand</button>
      </form>
      ${isTk ? tkPanel() : fbBar()}
      ${resultsRow}
    </div>`;
  }

  /* ---- TikTok: inline, grouped, expandable filter grid (Creative Center pattern) */
  function tkPanel() {
    const f = S.tk; const active = tkActiveFilters(); const open = S.tkOpen;
    const hidden = active.filter(([k]) => !['industry', 'objective', 'period', 'firstSeen', 'lastSeen'].includes(k)).length;
    const row = (label, content) => `<div class="tk-row"><span class="tk-row-label spy-caption-l">${label}</span><div class="tk-row-body">${content}</div></div>`;
    return `
    <section class="tk-panel" aria-label="TikTok filters" data-open="${open}">
      <div class="tk-bar">
        ${select('tk.industry', [['all', 'All industries'], ...INDUSTRIES.map((i) => [i, i])], f.industry, 'Industry')}
        ${select('tk.objective', TK.objective, f.objective, 'Objective')}
        <div class="tk-period" role="group" aria-label="Time">${TK.period.map(([v, t]) => chip(t, f.period === v, `data-action="tk-set" data-key="period" data-value="${v}"`, 'xs')).join('')}</div>
        <div class="spy-field-control app-range" data-size="sm">
          <span class="app-select-label">Seen</span>
          <input type="date" data-bind="tk.firstSeen" value="${esc(f.firstSeen)}" aria-label="First seen">
          <span class="spy-text-tertiary" aria-hidden="true">–</span>
          <input type="date" data-bind="tk.lastSeen" value="${esc(f.lastSeen)}" aria-label="Last seen">
        </div>
        <button class="spy-btn tk-toggle" data-variant="outline" data-size="sm" data-action="tk-toggle" aria-expanded="${open}" aria-controls="tk-more">
          ${ic('filter', 'sm')}<span>${open ? 'Hide filters' : 'More filters'}</span>${hidden ? `<span class="app-count">${hidden}</span>` : ''}
        </button>
      </div>
      <div class="tk-more" id="tk-more" ${open ? '' : 'hidden'}>
        ${row('Creative', `
          ${select('tk.duration', TK.duration, f.duration, 'Length')}
          ${select('tk.cta', TK.cta, f.cta, 'CTA')}
          ${select('tk.landing', TK.landing, f.landing, 'Landing page')}
          ${select('tk.language', TK.language, f.language, 'Language')}`)}
        ${row('Audience', select('tk.audience', TK.audience, f.audience, 'Age'))}
        ${row('Performance', `
          ${select('tk.likes', TK.likes, f.likes, 'Likes')}
          ${select('tk.ctr', TK.ctr, f.ctr, 'CTR')}
          ${select('tk.budget', TK.budget, f.budget, 'Budget')}
          ${select('tk.conversion', TK.conversion, f.conversion, 'Conversion')}`)}
        ${row('Signals', `<div class="tk-checks">
          ${checkbox('tk.newAds', 'New ads', f.newAds)}
          ${checkbox('tk.firstTime', 'First-time advertiser', f.firstTime)}
          ${checkbox('tk.repeated', 'Repeated ads', f.repeated)}
          ${checkbox('tk.realPeople', 'Real people on camera', f.realPeople)}</div>`)}
        ${row('AI creative', `<div class="tk-period">${[['all', 'All'], ['ai', 'AI-generated'], ['human', 'Not AI']].map(([v, t]) => chip(t, f.ai === v, `data-action="tk-set" data-key="ai" data-value="${v}"`, 'xs')).join('')}</div>`)}
      </div>
      ${active.length ? `<div class="tk-applied">
        <span class="spy-caption-m spy-text-tertiary">Applied</span>
        ${active.map(([k, t]) => `<span class="spy-chip" data-size="xxs" data-selected>${esc(t)}<button class="app-chip-x" data-action="tk-clear" data-key="${k}" aria-label="Remove ${esc(t)}">${ic('close', 'xs')}</button></span>`).join('')}
        <button class="spy-btn" data-variant="ghost" data-size="xxs" data-action="tk-reset">Reset all</button>
      </div>` : ''}
    </section>`;
  }

  /* ---- Facebook: result summary + removable pills + drawer (Meta Ad Library pattern) */
  function fbBar() {
    const n = fbResults().length; const active = fbActiveFilters(); const extra = active.length - 1;
    return `
    <div class="fb-bar">
      <div class="fb-summary">
        <strong>~${n.toLocaleString()} result${n === 1 ? '' : 's'}</strong>
        <span class="spy-text-secondary">${S.query ? `These results include ads that match your keyword search <strong>${esc(S.query)}</strong>.` : 'Ads running across Meta technologies in the selected region.'}</span>
      </div>
      <div class="fb-actions">
        <div class="fb-pills">${active.map(([k, t]) => `<span class="fb-pill">${esc(t)}<button data-action="fb-clear" data-key="${k}" aria-label="Remove ${esc(t)}">${ic('close', 'sm')}</button></span>`).join('')}</div>
        <button class="spy-btn" data-variant="outline" data-size="sm" data-action="fb-drawer" aria-haspopup="dialog">${ic('filter', 'sm')}Filters${extra > 0 ? `<span class="app-count">${extra}</span>` : ''}</button>
        ${select('fb.sort', FB.sort, S.fb.sort, 'Sort by')}
      </div>
    </div>`;
  }

  function fbDrawer() {
    if (!ui.fbDrawer) return '';
    const f = S.fb;
    const sec = (id, title, body, open = true) => `<details class="fb-sec" data-sec="${id}" ${(ui.fbSecs[id] ?? open) ? 'open' : ''}><summary><span>${title}</span>${ic('chevron-down', 'sm')}</summary><div class="fb-sec-body">${body}</div></details>`;
    return `
    <div class="app-scrim" data-action="fb-drawer-close"${ui.fbAnim ? ' data-enter' : ''}></div>
    <div class="spy-drawer fb-drawer" data-side="end"${ui.fbAnim ? ' data-enter' : ''} role="dialog" aria-modal="true" aria-labelledby="fb-drawer-title">
      <div class="spy-drawer-head"><span class="spy-drawer-title" id="fb-drawer-title">Filters</span><button class="spy-btn" data-variant="ghost" data-size="sm" data-icon-only data-action="fb-drawer-close" aria-label="Close filters">${ic('close')}</button></div>
      <div class="spy-drawer-body">
        ${sec('status', 'Active status', `<div class="spy-radio-group">${FB.status.map(([v, t]) => radio('fb.status', v, t, f.status === v)).join('')}</div>`)}
        ${sec('platform', 'Platform', `<div class="spy-radio-group">${FB.platforms.map(([v, t]) => checkbox(`fb.platform.${v}`, t, f.platforms.includes(v))).join('')}</div>`)}
        ${sec('media', 'Media type', `<div class="spy-radio-group">${FB.media.map((t) => radio('fb.media', t, t, f.media === t)).join('')}</div>`, false)}
        ${sec('advertiser', 'Advertiser', `<div class="spy-field-control" data-size="sm">${ic('search', 'sm')}<input class="spy-field-input" data-bind="fb.advertiser" value="${esc(f.advertiser)}" placeholder="Page name" aria-label="Advertiser"></div>`, false)}
        ${sec('language', 'Language', select('fb.language', FB.language, f.language, null), false)}
        ${sec('dates', 'Impressions by date', `<div class="fb-dates"><label class="spy-field-control app-date" data-size="sm"><span class="app-select-label">From</span><input type="date" data-bind="fb.from" value="${esc(f.from)}"></label><label class="spy-field-control app-date" data-size="sm"><span class="app-select-label">To</span><input type="date" data-bind="fb.to" value="${esc(f.to)}"></label></div>`, false)}
        ${sec('versions', 'Ad versions', checkbox('fb.versions', 'Only ads with multiple versions', f.versions, 'Brands test variants of the ads they scale.'), false)}
      </div>
      <div class="spy-drawer-foot"><button class="spy-btn" data-variant="ghost" data-size="sm" data-action="fb-reset">Clear all</button><button class="spy-btn" data-variant="brand" data-size="sm" data-action="fb-drawer-close">Show ${fbResults().length} results</button></div>
    </div>`;
  }

  /* ---- Cards: one shape per source, because each source reports different evidence */
  function tkCard(a) {
    const b = brandOf(a.brandId); const t = a.tiktok; const saved = S.saved.includes(a.id);
    return `
    <article class="tk-card">
      <a class="tk-media" href="#/ad/${a.id}" aria-label="Open analysis: ${esc(a.title)}" data-preview data-muted data-dur="${a.duration}" data-src="${videoSrc(a)}" data-autoplay-id="${a.id}">
        <img src="${a.image}" alt="" loading="lazy"><video muted playsinline loop preload="none" aria-hidden="true"></video>
        <span class="m-progress" aria-hidden="true"><span class="m-fill"></span></span>
        <span class="tk-media-top"><span class="spy-result-duration">${fmtDur(a.duration)}</span>${t.firstTime ? '<span class="spy-chip" data-size="xxs" data-variant="info" data-selected>New advertiser</span>' : ''}</span>
        <span class="tk-play">${ic('play')}</span>
        <span class="tk-media-foot"><strong>${esc(t.objective)}</strong><span>${esc(a.industry)}</span></span>
      </a>
      <div class="tk-body">
        <div class="tk-brand">
          ${avatar(b, 'sm')}<span class="tk-brand-name">${esc(b.name)}</span>
          <button class="spy-btn" data-variant="ghost" data-size="xxs" data-icon-only data-action="save" data-id="${a.id}" aria-pressed="${saved}" aria-label="${saved ? 'Saved' : 'Save to collection'}">${ic(saved ? 'check' : 'plus', 'sm')}</button>
        </div>
        <dl class="tk-stats">
          <div><dt>Likes</dt><dd>${esc(a.metrics.likes)}</dd></div>
          <div><dt>Top CTR</dt><dd>${100 - t.ctrTop}%</dd></div>
          <div><dt>Budget</dt><dd data-level="${t.budget.toLowerCase()}">${esc(t.budget)}</dd></div>
        </dl>
      </div>
    </article>`;
  }
  /* Facebook card: the ad as it runs first (media, advertiser, copy, link),
     then the Ad Library record underneath as supporting evidence. */
  function fbCard(a) {
    const b = brandOf(a.brandId); const m = a.meta; const saved = S.saved.includes(a.id);
    return `
    <article class="fb-card">
      <a class="fb-card-media" href="#/ad/${a.id}" aria-label="Open analysis: ${esc(a.title)}" data-preview data-muted data-dur="${a.duration}" data-src="${videoSrc(a)}" data-autoplay-id="${a.id}">
        <img src="${a.image}" alt="" loading="lazy"><video muted playsinline loop preload="none" aria-hidden="true"></video>
        <span class="m-progress" aria-hidden="true"><span class="m-fill"></span></span>
        <span class="fb-card-overlay">${a.active ? `<span class="spy-chip" data-size="xxs" data-variant="success" data-selected>${ic('success', 'xs')}Active</span>` : '<span class="spy-chip" data-size="xxs" data-variant="neutral" data-selected>Inactive</span>'}<span class="spy-result-duration">${fmtDur(a.duration)}</span></span>
      </a>
      <div class="fb-card-ad">
        <div class="fb-card-adv">${avatar(b)}<span><strong>${esc(b.name)}</strong><span class="spy-caption-m spy-text-tertiary">Sponsored</span></span>
          <button class="spy-btn" data-variant="ghost" data-size="xxs" data-icon-only data-action="save" data-id="${a.id}" aria-pressed="${saved}" aria-label="${saved ? 'Saved' : 'Save to collection'}">${ic(saved ? 'check' : 'plus', 'sm')}</button></div>
        <p class="fb-card-copy">${esc(a.description)}</p>
        <div class="fb-card-link"><span><span class="spy-caption-s spy-text-tertiary">${esc(m.linkDomain)}</span><strong>${esc(m.linkTitle)}</strong></span><span class="spy-btn" data-variant="outline" data-size="xs" aria-hidden="true">${esc(m.cta)}</span></div>
      </div>
      <div class="fb-card-meta">
        <dl class="fb-card-facts">
          <div><dt>Library ID</dt><dd class="spy-mono">${esc(m.libraryId)}</dd></div>
          <div><dt>Started</dt><dd>${fmtDate(a.startedAt)} · ${a.daysRunning} days</dd></div>
          <div><dt>Platforms</dt><dd class="fb-platforms">${m.platforms.map((p) => `<span class="spy-tag">${esc(PLATFORM_LABEL[p])}</span>`).join('')}</dd></div>
        </dl>
        <div class="fb-card-foot">
          <span class="spy-caption-m spy-text-secondary fb-versions">${m.versions > 1 ? `${ic('layers', 'xs')}${m.versions} versions` : 'Single version'}</span>
          <a class="spy-btn" data-variant="outline" data-size="xs" href="#/ad/${a.id}">See ad details ${ic('arrow-right', 'xs')}</a>
        </div>
      </div>
    </article>`;
  }

  function viewOverview() {
    const isTk = S.source === 'tiktok';
    const list = isTk ? tkResults() : fbResults();
    const counts = {}; list.forEach((a) => { counts[a.industry] = (counts[a.industry] || 0) + 1; });
    const pref = S.profile.industries;
    const cats = INDUSTRIES.filter((c) => counts[c]).sort((x, y) => (pref.includes(y) - pref.includes(x)) || counts[y] - counts[x]);
    const cat = cats.includes(S.category) ? S.category : 'all';
    const card = isTk ? tkCard : fbCard;
    const grid = (items) => `<div class="${isTk ? 'tk-grid' : 'fb-grid'}">${items.map(card).join('')}</div>`;

    const rail = `<div class="cat-rail" role="tablist" aria-label="Categories">
      ${chip(`All <span class="cat-count">${list.length}</span>`, cat === 'all', 'data-action="category" data-value="all" role="tab"')}
      ${cats.map((c) => chip(`${esc(c)} <span class="cat-count">${counts[c]}</span>`, cat === c, `data-action="category" data-value="${esc(c)}" role="tab"`)).join('')}
      ${INDUSTRIES.filter((c) => !counts[c]).slice(0, 4).map((c) => `<button class="spy-chip" data-size="sm" data-disabled aria-disabled="true" title="No ads match the current filters">${esc(c)}</button>`).join('')}
    </div>`;

    let body;
    if (!list.length) {
      body = `<div class="spy-empty app-empty"><span class="spy-icon-tile" data-size="lg">${ic('search')}</span><h2 class="spy-h6">No ads match these filters</h2><p class="spy-body-s spy-text-secondary">Loosen a filter, or scan a specific brand to collect its ads from every source.</p><div class="spy-row"><button class="spy-btn" data-variant="outline" data-size="sm" data-action="${isTk ? 'tk-reset' : 'fb-reset'}">Reset filters</button><button class="spy-btn" data-variant="brand" data-size="sm" data-action="scan-brand">Scan a brand</button></div></div>`;
    } else if (cat === 'all') {
      /* A flat, ranked grid: grouping 1–2 ads per heading wastes the fold. Each card carries its category instead. */
      body = `<section class="cat-section" aria-label="All categories">${grid(list)}</section>`;
    } else {
      body = `<section class="cat-section"><header class="cat-head"><h2 class="spy-h6">${esc(cat)}</h2><span class="spy-caption-l spy-text-tertiary">${plural(list.filter((a) => a.industry === cat).length, 'ad')}</span></header>${grid(list.filter((a) => a.industry === cat))}</section>`;
    }

    const head = '';
    const regionName = (REGIONS.find((r) => r[0] === S.region) || [])[1] || 'all regions';
    /* TikTok gets the same one-line summary Facebook has, in the same place. */
    const tkSummary = isTk ? `<div class="fb-bar"><h1 class="fb-summary"><strong>${plural(list.length, 'top ad')}</strong><span class="spy-text-secondary">${S.query ? `Matching <strong>${esc(S.query)}</strong> · ` : ''}ranked by engagement in ${esc(regionName)}. Open any ad for the hook, audience and adaptability read.</span></h1></div>` : '';
    /* Categories (and TikTok's sort) live in the sticky strip, so they stay in
       reach while the video grid scrolls underneath. */
    const resultsRow = tkSummary + `<div class="strip-results">${rail}${isTk ? select('tk.sort', [['likes', 'Most likes'], ['ctr', 'Best CTR'], ['newest', 'Newest'], ['longest', 'Longest running']], S.tk.sort, 'Sort') : ''}</div>`;

    return shell('overview', `${head}${body}<p class="app-footnote spy-caption-m spy-text-tertiary">${ic('info', 'xs')}Dietfit AI, Duolingo and Cal AI creatives are captured from the live dashboard; the Dietfit “What I eat in a day” video plays from dietfit.health (its metrics are estimates); other brands are prototype samples.</p>`, { strip: searchStrip(resultsRow), wide: true }) + fbDrawer();
  }

  /* ================================================================== CONFIRM ACCOUNTS (live step, missing in Figma) */
  function resolveBrand(q) {
    const s = (q || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    return D.brands.find((b) => s && (b.name.toLowerCase().includes(s) || s.includes(b.domain) || s.includes(b.name.toLowerCase().split(' ')[0]))) || null;
  }
  function viewConfirm(r) {
    const q = r.q.get('q') || '';
    const b = resolveBrand(q);
    if (!b) {
      return shell('overview', `<div class="spy-empty app-empty"><span class="spy-icon-tile" data-size="lg">${ic('search')}</span><h1 class="spy-h6">No listing matched “${esc(q)}”</h1><p class="spy-body-s spy-text-secondary">Try the App Store link or the brand’s website — matching names alone do not establish ownership.</p><div class="spy-row"><a class="spy-btn" data-variant="outline" data-size="sm" href="#/overview">Back to search</a>${D.brands.slice(0, 3).map((x) => `<a class="spy-btn" data-variant="ghost" data-size="sm" href="#/confirm?q=${encodeURIComponent(x.name)}">${esc(x.name)}</a>`).join('')}</div></div>`);
    }
    if (!ui.draftAccounts || ui.draftAccounts.brand !== b.id) ui.draftAccounts = { brand: b.id, pick: Object.fromEntries(['appstore', 'meta', 'tiktok'].map((s) => { const i = b.accounts.filter((a) => a.source === s).findIndex((a) => a.verified); return [s, i === -1 ? [] : [i]]; })) };
    const pick = ui.draftAccounts.pick;
    /* Select or deselect — nothing else. Each matched account is a toggle
       (up to five per source, as in the live product); a source with nothing
       selected is simply not scanned. */
    const MAX = 5;
    const col = (src, title) => {
      const accts = b.accounts.filter((a) => a.source === src);
      const sel = pick[src];
      return `<section class="confirm-col" aria-labelledby="c-${src}"${sel.length ? '' : ' data-off'}>
        <header class="confirm-col-head">
          <span class="spy-source" data-source="${src}"><span class="spy-source-dot"></span></span>
          <h2 id="c-${src}">${title}</h2>
          <span class="confirm-col-state spy-caption-m">${sel.length ? `${sel.length} selected` : 'Not scanned'}</span>
        </header>
        <div class="acct-list" role="group" aria-labelledby="c-${src}">
          ${accts.length ? accts.map((a, i) => { const on = sel.includes(i); return `<button class="acct" type="button" aria-pressed="${on}"${on ? ' data-selected' : ''}${a.verified ? '' : ' data-low'} data-action="pick-account" data-src="${src}" data-value="${i}"${!on && sel.length >= MAX ? ' disabled' : ''}>
            <span class="spy-checkbox"${on ? ' data-checked' : ''} aria-hidden="true"><span class="spy-control-box"><span class="spy-control-indicator">${ic('check')}</span></span></span>
            <span class="acct-avatar" aria-hidden="true">${esc(initials(a.label))}</span>
            <span class="acct-text"><span class="acct-name">${esc(a.label)}</span>
              <span class="acct-meta">${esc(a.handle)} · ${a.verified ? `<span class="spy-text-success">${ic('success', 'xs')}Verified</span>` : `<span class="spy-text-warning">${ic('warning', 'xs')}Name match only</span>`}</span></span>
            <span class="acct-match"><strong>${a.verified ? b.confidence : b.confidence - 31}%</strong><span>match</span></span>
          </button>`; }).join('')
            : `<p class="acct-empty spy-caption-l spy-text-tertiary">No account matched this brand.</p>`}
        </div>
      </section>`;
    };
    const chosen = Object.entries(pick).filter(([, v]) => v.length);
    return shell('overview', `
      <nav class="spy-breadcrumb app-crumb" aria-label="Breadcrumb"><a href="#/overview">Overview</a>${ic('chevron-right', 'sm')}<span aria-current="page">Confirm accounts</span></nav>
      <div class="flow-steps" aria-label="Scan steps"><span data-state="done">1 · Name a brand</span><span data-state="current">2 · Confirm its accounts</span><span>3 · Scan</span><span>4 · Read the playbook</span></div>
      <div class="confirm-head">
        ${avatar(b, 'lg')}
        <div><h1 class="spy-h6">Confirm exact accounts for ${esc(b.name)}</h1><p class="spy-caption-l spy-text-secondary">Choose the exact accounts before a scan starts. Matching names alone do not establish ownership.</p></div>
        ${select('region', REGIONS, S.region, 'Region')}
      </div>
      <div class="confirm-grid">
        ${col('appstore', 'App Store listings')}
        ${col('meta', 'Meta Pages')}
        ${col('tiktok', 'TikTok advertisers')}
      </div>
      <div class="confirm-foot spy-section-card">
        <div><strong>This scan will collect</strong><p class="spy-caption-l spy-text-secondary">${chosen.length ? chosen.map(([s]) => SOURCE[s].long).join(' · ') : 'Nothing selected yet — pick at least one account to scan.'}</p></div>
        <span class="spy-caption-m spy-text-tertiary">Uses 1 of ${S.scansLimit - S.scansUsed} scans left</span>
        <a class="spy-btn" data-variant="ghost" data-size="md" href="#/overview">Search again</a>
        <button class="spy-btn" data-variant="brand" data-size="md" data-action="start-scan" data-id="${b.id}" ${chosen.length ? '' : 'disabled'}>Start scan ${ic('arrow-right', 'sm')}</button>
      </div>`);
  }

  /* ================================================================== SCAN PROGRESS (async, streamed per source) */
  function viewScan(r) {
    const b = brandOf(r.id); if (!b) return viewMissing();
    const t = Number(r.q.get('t') || 0);
    const srcs = ['appstore', 'meta', 'tiktok'];
    const ads = D.ads.filter((a) => a.brandId === b.id);
    const rows = srcs.map((s, i) => {
      const n = ads.filter((a) => a.source === s).length;
      const state = t > i + 1 ? 'done' : t > i ? 'running' : 'queued';
      const count = state === 'done' ? (s === 'appstore' ? 'listing' : plural(n, 'video')) : state === 'running' ? 'working' : 'none yet';
      const note = state === 'done' ? (s === 'appstore' ? 'listing found' : `done in ${4 + i * 3}s`) : state;
      return `<div class="spy-coverage-row"><span class="spy-coverage-name">${source(s)}</span><span class="spy-coverage-count">${count}</span><span class="spy-coverage-status" data-state="${state === 'queued' ? 'skipped' : state}">${ic(state === 'done' ? 'check' : state === 'running' ? 'refresh' : 'minus', 'xs')}${note}</span></div>`;
    }).join('');
    const done = t >= 4;
    const pct = Math.min(100, Math.round((t / 4) * 100));
    return shell('scans', `
      <div class="flow-steps flow-steps--narrow" aria-label="Scan steps"><span data-state="done">1 · Name a brand</span><span data-state="done">2 · Confirm its accounts</span><span data-state="${done ? 'done' : 'current'}">3 · Scan</span><span${done ? ' data-state="current"' : ''}>4 · Read the playbook</span></div>
      <div class="scan-card spy-section-card">
        <div class="scan-card-head">${avatar(b, 'lg')}<div><h1 class="spy-h6">${done ? 'Your scan is ready' : `Scanning ${esc(b.name)}`}</h1><p class="spy-caption-l spy-text-secondary">${done ? `${plural(ads.length, 'video')} · ${srcs.map((s) => `${SOURCE[s].short} ${ads.filter((a) => a.source === s).length}`).join(' · ')}` : 'You can leave; the sheet keeps filling in as sources return.'}</p></div></div>
        <div class="spy-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span class="spy-progress-fill" style="width:${pct}%"></span></div>
        <div class="spy-coverage">${rows}</div>
        <div class="scan-card-foot">
          <a class="spy-btn" data-variant="ghost" data-size="md" href="#/overview">Scan another brand</a>
          <a class="spy-btn" data-variant="${done ? 'brand' : 'outline'}" data-size="md" href="#/brand/${b.id}">${done ? 'Open results' : 'See results so far'} ${ic('arrow-right', 'sm')}</a>
        </div>
      </div>`);
  }

  /* ================================================================== BRAND RESULTS */
  function viewBrand(r) {
    const b = brandOf(r.id); if (!b) return viewMissing();
    let ads = D.ads.filter((a) => a.brandId === b.id);
    const tabCounts = { all: ads.length, meta: ads.filter((a) => a.source === 'meta').length, tiktok: ads.filter((a) => a.source === 'tiktok').length, appstore: ads.filter((a) => a.source === 'appstore').length };
    if (S.brandTab !== 'all') ads = ads.filter((a) => a.source === S.brandTab);
    if (S.highOnly) ads = ads.filter((a) => brandOf(a.brandId).accounts.find((x) => x.source === a.source)?.verified !== false);
    ads.sort(S.brandSort === 'newest' ? (x, y) => x.daysRunning - y.daysRunning : S.brandSort === 'lowest' ? (x, y) => (brandOf(x.brandId).accounts.find((q) => q.source === x.source)?.verified ? 1 : 0) - (brandOf(y.brandId).accounts.find((q) => q.source === y.source)?.verified ? 1 : 0) : (x, y) => y.daysRunning - x.daysRunning);
    const watched = S.watch.some((w) => w.brandId === b.id);
    return shell('scans', `
      <nav class="spy-breadcrumb app-crumb" aria-label="Breadcrumb"><a href="#/scans">Scans</a>${ic('chevron-right', 'sm')}<span aria-current="page">${esc(b.name)}</span></nav>
      <div class="brand-head">
        ${avatar(b, 'lg')}
        <div class="brand-head-text"><h1 class="spy-h6">${esc(b.name)}</h1><p class="spy-caption-l spy-text-secondary">${esc(b.industry)} · ${esc(b.domain)} · <span class="spy-text-success">${b.confidence}% identity confidence</span></p></div>
        <div class="brand-head-actions">
          <button class="spy-btn" data-variant="outline" data-size="sm" data-action="watch" data-id="${b.id}" aria-pressed="${watched}">${ic(watched ? 'check' : 'bell', 'sm')}${watched ? 'Watching' : 'Watch this brand'}</button>
          <button class="spy-btn" data-variant="brand" data-size="sm" data-action="toast" data-title="Analyzing campaign" data-body="Built from every video transcript in this scan.">${ic('sparkle', 'sm')}Analyze campaign</button>
        </div>
      </div>
      <details class="spy-section-card brand-why"><summary><span>${ic('info', 'sm')} Why this match</span>${ic('chevron-down', 'sm')}</summary>
        <ul class="brand-why-list">${b.accounts.map((a) => `<li>${source(a.source)}<span>${esc(a.label)} <span class="spy-text-tertiary">${esc(a.handle)}</span></span>${a.verified ? `<span class="spy-caption-m spy-text-success">${ic('success', 'xs')}Verified owner</span>` : `<span class="spy-caption-m spy-text-warning">${ic('warning', 'xs')}Name match only</span>`}</li>`).join('')}</ul>
      </details>
      <div class="brand-bar">
        ${tabs([['all', `All ${tabCounts.all}`], ['meta', `Meta ${tabCounts.meta}`], ['tiktok', `TikTok ${tabCounts.tiktok}`], ['appstore', `App Store ${tabCounts.appstore}`]], S.brandTab, 'brandTab')}
        <label class="spy-control-label app-switch"><input type="checkbox" class="app-sr" data-bind="highOnly" ${S.highOnly ? 'checked' : ''}><span class="spy-switch" data-size="default"${S.highOnly ? ' data-checked' : ''}><span class="spy-switch-thumb"></span></span><span class="spy-caption-l">High-confidence only</span></label>
        ${select('brandSort', [['longest', 'Longest running'], ['newest', 'Newest'], ['lowest', 'Lowest confidence']], S.brandSort, 'Sort')}
      </div>
      <div class="spy-results brand-grid">${ads.map((a) => `
        <a class="spy-result" href="#/ad/${a.id}">
          <div class="spy-result-media"><img src="${a.image}" alt="" loading="lazy">
            <div class="spy-result-top">${source(a.source)}<span class="spy-result-duration">${fmtDur(a.duration)}</span></div></div>
          <div class="spy-result-foot"><span class="spy-result-title">${esc(a.title)}</span>
            <span class="spy-result-meta spy-caption-m spy-text-secondary">First seen ${fmtDate(a.startedAt).replace(/, \d+$/, '')} · ${a.daysRunning} days running · ${esc(a.format)}</span></div>
        </a>`).join('') || '<p class="spy-body-s spy-text-secondary">No videos from this source.</p>'}</div>`);
  }

  /* ================================================================== AD DETAIL — Video analysis (Figma 87:131) */
  function viewAd(r) {
    const a = adOf(r.id); if (!a) return viewMissing();
    const b = brandOf(a.brandId);
    const list = D.ads; const i = list.indexOf(a);
    const prev = list[(i - 1 + list.length) % list.length]; const next = list[(i + 1) % list.length];
    const verdict = (v) => (v >= 80 ? ['Very strong', 'high'] : v >= 65 ? ['Good', 'medium'] : v >= 50 ? ['Fair', 'medium'] : ['Weak', 'medium']);
    const scores = Object.entries(a.scores).map(([k, v]) => {
      const [label, conf] = verdict(k === 'Brand safety' ? v : v);
      const tone = k === 'Brand safety' ? (v < 50 ? 'danger' : 'success') : v >= 80 ? 'success' : v < 50 ? 'warning' : '';
      return `<div class="spy-metric"><div class="spy-metric-head"><span class="spy-metric-label">${esc(k)}</span><span class="spy-metric-value"${tone ? ` data-tone="${tone}"` : ''}>${v}<small> / 100</small></span></div>
        <div class="spy-metric-track"><div class="spy-metric-fill" style="width:${v}%"></div></div>
        <div class="spy-metric-meta">${ic(conf === 'high' ? 'success' : 'list', 'xs')}${k === 'Brand safety' && v < 50 ? 'High risk' : label} · ${conf} confidence</div></div>`;
    }).join('');
    const c = a.classification || { goal: a.tiktok?.objective || 'Awareness', secondary: 'Saves', type: a.format, topic: a.industry, emotion: 'Curiosity' };
    const why = (a.takeaways || []).slice(0, 4).map((t, k) => `<li class="why-row"><span class="why-n">${k + 1}</span><span>${esc(t)}</span><span class="spy-chip" data-size="xxs" data-variant="${k < 2 ? 'success' : 'neutral'}" data-selected>${k < 2 ? 'High impact' : 'Medium impact'}</span></li>`).join('');
    const tab = S.detailTab;
    const panel = {
      overview: `
        <section class="spy-section-card d-card"><div class="spy-section-head">${ic('list')}<h2 class="spy-section-title">Key takeaways</h2></div>
          <ul class="d-bullets">${(a.takeaways || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          <div class="d-tags">${(a.tags || []).map((t) => `<span class="spy-chip" data-size="xs">${esc(t)}</span>`).join('')}</div></section>
        <section class="spy-section-card d-card"><div class="spy-section-head">${ic('sparkle')}<h2 class="spy-section-title">AI analysis scores</h2><button class="app-textlink" data-action="toast" data-title="How scores are calculated" data-body="Each axis is read from transcript, frames and engagement, with a stated confidence.">How are scores calculated?</button></div>
          <div class="spy-metrics d-scores">${scores}</div></section>
        <section class="spy-section-card d-card"><div class="spy-section-head">${ic('wand')}<h2 class="spy-section-title">Why it worked</h2></div><ol class="why-list">${why}</ol></section>`,
      transcript: `<section class="spy-section-card d-card"><div class="spy-section-head">${ic('list')}<h2 class="spy-section-title">Transcript</h2></div>
        ${(a.transcript || [{ time: '00:00', text: a.description }]).map((l) => `<p class="d-line"><span class="spy-mono spy-text-tertiary">${l.time}</span>${esc(l.text)}</p>`).join('')}</section>`,
      frames: `<section class="spy-section-card d-card"><div class="spy-section-head">${ic('image')}<h2 class="spy-section-title">Key frames</h2></div><div class="d-frames">${[0, 1, 2, 3].map((k) => `<figure><img src="${a.image}" alt="" style="object-position:50% ${k * 30}%"><figcaption class="spy-caption-m spy-text-tertiary">00:0${k * 2}</figcaption></figure>`).join('')}</div></section>`,
      audience: `<section class="spy-section-card d-card"><div class="spy-section-head">${ic('user')}<h2 class="spy-section-title">Audience</h2></div><div class="d-tags">${(a.audience || []).map((t) => `<span class="spy-chip" data-size="sm">${esc(t)}</span>`).join('')}</div></section>`,
      similar: `<section class="spy-section-card d-card"><div class="spy-section-head">${ic('grid')}<h2 class="spy-section-title">Similar videos</h2></div><div class="tk-grid">${D.ads.filter((x) => x.id !== a.id && x.industry === a.industry && x.tiktok).slice(0, 4).map(tkCard).join('') || '<p class="spy-caption-l spy-text-secondary">No similar videos in this workspace yet.</p>'}</div></section>`,
    }[tab];
    const adapt = a.adaptability || 70;
    return shell('overview', `
      <div class="d-layout">
        <aside class="d-left">
          <div class="d-nav"><a class="app-textlink" href="javascript:history.back()">${ic('chevron-left', 'sm')}Back to results</a>
            <span><a class="spy-btn" data-variant="ghost" data-size="xs" data-icon-only href="#/ad/${prev.id}" aria-label="Previous ad">${ic('chevron-left')}</a><a class="spy-btn" data-variant="ghost" data-size="xs" data-icon-only href="#/ad/${next.id}" aria-label="Next ad">${ic('chevron-right')}</a></span></div>
          <div class="spy-player d-player" data-player data-dur="${a.duration}" data-src="${videoSrc(a)}" data-id="${a.id}">
            <img src="${a.image}" alt="${esc(a.title)} — frame"><video playsinline preload="none" aria-hidden="true"></video>
            <button class="d-hit" type="button" data-action="player-toggle" aria-label="Play or pause"></button>
            <span class="d-big-play" aria-hidden="true">${ic('play')}</span>
            <div class="d-player-overlay"><span class="d-player-author">${avatar(b, 'sm')}<strong>${esc(b.accounts.find((x) => x.source === a.source)?.handle || b.name)}</strong></span>
              <button class="spy-btn m-toggle" data-variant="tertiary" data-size="sm" data-icon-only aria-label="Play video" data-action="player-toggle">${ic('play')}</button>
              <span class="spy-result-duration m-time">0:00 / ${fmtDur(a.duration)}</span></div>
            <span class="m-progress" aria-hidden="true"><span class="m-fill"></span></span>
          </div>
          <section class="spy-section-card d-card"><div class="spy-section-head"><h2 class="spy-section-title">Performance</h2><span class="spy-caption-m spy-text-tertiary">Last 30 days</span></div>
            <div class="spy-stats d-stats">${[['views', 'Views'], ['likes', 'Likes'], ['saves', 'Saves'], ['shares', 'Shares'], ['comments', 'Comments'], ['engagement', 'Engagement']].map(([k, t]) => `<div class="spy-stat"><span class="spy-stat-value">${esc(a.metrics[k])}</span><span class="spy-stat-label">${t}</span></div>`).join('')}</div>
            <dl class="d-meta"><div><dt>Caption</dt><dd>${esc(a.description)}</dd></div><div><dt>Started</dt><dd>${fmtDate(a.startedAt)} · ${a.daysRunning} days</dd></div><div><dt>Source</dt><dd>${source(a.source)}</dd></div>${a.meta ? `<div><dt>Library ID</dt><dd class="spy-mono">${esc(a.meta.libraryId)}</dd></div>` : ''}</dl>
            <a class="spy-btn" data-variant="outline" data-size="sm" data-full-width href="#/brand/${b.id}">${ic('link', 'sm')}All ads from ${esc(b.name)}</a>
          </section>
        </aside>
        <div class="d-main">
          <header class="d-title"><div><span class="spy-caption-m spy-text-tertiary">${esc(b.name)} · ${esc(a.format)}</span><h1 class="spy-h6">${esc(a.title)}</h1></div>
            <div class="spy-row"><button class="spy-btn" data-variant="outline" data-size="sm" data-action="save" data-id="${a.id}">${ic(S.saved.includes(a.id) ? 'check' : 'folder', 'sm')}${S.saved.includes(a.id) ? 'Saved' : 'Save'}</button></div></header>
          ${tabs([['overview', 'Overview'], ['transcript', 'Transcript'], ['frames', 'Frames'], ['audience', 'Audience'], ['similar', 'Similar videos']], tab, 'detailTab')}
          ${panel}
        </div>
        <aside class="d-right">
          <section class="spy-section-card d-card"><div class="spy-section-head">${ic('refresh')}<h2 class="spy-section-title">Adaptability</h2><span class="spy-caption-m spy-text-tertiary">For ${esc(D.currentUser.workspace.replace('Team ', ''))}</span></div>
            <div class="d-adapt"><div class="spy-gauge" data-size="sm" data-verdict="${adapt >= 75 ? 'good' : adapt >= 55 ? 'fair' : 'bad'}" data-value="${adapt}"></div>
              <div><strong class="spy-text-success">${adapt >= 75 ? 'High' : adapt >= 55 ? 'Medium' : 'Low'} adaptability</strong><p class="spy-caption-l spy-text-secondary">Core mechanics can be adapted to your product with some modifications.</p></div></div>
            <div class="spy-verdicts" role="list">
              <div class="spy-verdict" data-verdict="keep" role="listitem"><span class="spy-verdict-icon">${ic('check')}</span><span class="spy-verdict-label">Keep</span><ul class="spy-verdict-reasons"><li>${esc((a.tags || [])[0] || 'Hook')}</li><li>${esc((a.tags || [])[1] || 'Format')}</li></ul></div>
              <div class="spy-verdict" data-verdict="modify" role="listitem"><span class="spy-verdict-icon">${ic('minus')}</span><span class="spy-verdict-label">Modify</span><ul class="spy-verdict-reasons"><li>Swap in your product proof</li><li>Localise the claim</li></ul></div>
              <div class="spy-verdict" data-verdict="remove" role="listitem"><span class="spy-verdict-icon">${ic('close')}</span><span class="spy-verdict-label">Remove</span><ul class="spy-verdict-reasons"><li>Unverifiable health claims</li></ul></div>
            </div></section>
          <section class="spy-section-card d-card"><div class="spy-section-head">${ic('layers')}<h2 class="spy-section-title">Content classification</h2></div>
            <div class="spy-classify">${[['sparkle', 'Primary goal', [c.goal], 1], ['refresh', 'Secondary goal', [c.secondary]], ['grid', 'Format', [a.format]], ['layers', 'Content type', [c.type]], ['info', 'Topic', [c.topic]], ['user', 'Audience', (a.audience || []).slice(0, 2)], ['wand', 'Emotion', [c.emotion]]].map(([icn, l, vals, tint]) => `<div class="spy-classify-row">${ic(icn)}<span class="spy-classify-label">${l}</span><span class="spy-classify-values">${vals.map((v) => `<span class="spy-classify-value"${tint ? ' data-tone="tint"' : ''}>${esc(v)}</span>`).join('')}</span></div>`).join('')}</div></section>
          <section class="spy-section-card d-card"><div class="spy-section-head">${ic('video')}<h2 class="spy-section-title">Production effort</h2><span class="spy-chip" data-size="xxs" data-variant="success" data-selected>Low</span></div>
            <div class="spy-stats d-effort"><div class="spy-stat"><span class="spy-stat-value">~15 min</span><span class="spy-stat-label">Shoot</span></div><div class="spy-stat"><span class="spy-stat-value">~25 min</span><span class="spy-stat-label">Edit</span></div><div class="spy-stat"><span class="spy-stat-value">1</span><span class="spy-stat-label">Talent</span></div></div>
            <button class="spy-btn" data-variant="brand" data-size="md" data-full-width data-action="toast" data-title="Brief drafted" data-body="A shot list for your brand is in Collections.">${ic('sparkle', 'sm')}Create a similar video</button></section>
        </aside>
      </div>`, { wide: true });
  }

  /* ================================================================== SCANS / WATCHLIST / COLLECTIONS */
  function viewScans() {
    const rows = S.scans.map((s) => { const b = brandOf(s.brandId); return `<tr>
      <td><a class="app-cell-brand" href="#/brand/${b.id}">${avatar(b, 'sm')}${esc(b.name)}</a></td>
      <td class="app-num">${s.videos}</td><td><span class="app-sources">${s.sources.map(source).join('')}</span></td>
      <td>${s.from === 'watchlist' ? 'Watchlist' : 'Search'}</td><td class="spy-text-secondary">${fmtDate(s.at.slice(0, 10))}</td>
      <td><a class="spy-btn" data-variant="ghost" data-size="xs" href="#/brand/${b.id}">Open ${ic('chevron-right', 'sm')}</a></td></tr>`; }).join('');
    return shell('scans', `<div class="page-head"><div><h1 class="spy-h6">Scans</h1><p class="spy-caption-l spy-text-secondary">${S.scansUsed} of ${S.scansLimit} scans used this month. A scan is held, not lost, when you run out.</p></div><button class="spy-btn" data-variant="brand" data-size="sm" data-action="scan-brand">${ic('plus', 'sm')}New scan</button></div>
      <div class="spy-table-wrap app-table"><table class="spy-table"><thead><tr><th>Brand</th><th>Videos</th><th>Sources</th><th>Started from</th><th>Scanned</th><th><span class="app-sr">Actions</span></th></tr></thead><tbody>${rows}</tbody></table></div>`);
  }
  function viewWatchlist() {
    const rows = S.watch.map((w, i) => { const b = brandOf(w.brandId); return `<tr>
      <td><a class="app-cell-brand" href="#/brand/${b.id}">${avatar(b, 'sm')}${esc(b.name)}</a></td>
      <td>${select(`watch.${i}.cadence`, [['weekly', 'Weekly'], ['monthly', 'Monthly']], w.cadence, null)}</td>
      <td>${select(`watch.${i}.alerts`, [['default', 'Default'], ['instant', 'Instant'], ['weekly_digest', 'Weekly digest'], ['off', 'Off']], w.alerts, null)}</td>
      <td class="spy-text-secondary">${fmtDate(w.last)}</td>
      <td>${w.newSince ? `<span class="spy-chip" data-size="xxs" data-variant="success" data-selected>+${w.newSince} new</span>` : '<span class="spy-caption-m spy-text-tertiary">No change</span>'}</td>
      <td class="app-row-actions"><button class="spy-btn" data-variant="ghost" data-size="xs" data-action="rescan" data-id="${b.id}" aria-label="Re-scan ${esc(b.name)} now">${ic('refresh', 'sm')}Re-scan</button><button class="spy-btn" data-variant="danger-quiet" data-size="xs" data-icon-only data-action="unwatch" data-id="${b.id}" aria-label="Stop watching ${esc(b.name)}">${ic('trash', 'sm')}</button></td></tr>`; }).join('');
    return shell('watchlist', `<div class="page-head"><div><h1 class="spy-h6">Watchlist</h1><p class="spy-caption-l spy-text-secondary">Watched brands are re-scanned on their cadence. New creatives since the last run are flagged.</p></div></div>
      ${S.watch.length ? `<div class="spy-table-wrap app-table"><table class="spy-table"><thead><tr><th>Brand</th><th>Re-scan</th><th>Alerts</th><th>Last re-scan</th><th>Since last scan</th><th><span class="app-sr">Actions</span></th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="spy-empty app-empty"><span class="spy-icon-tile" data-size="lg">${ic('bell')}</span><h2 class="spy-h6">Nothing watched yet.</h2><p class="spy-body-s spy-text-secondary">Open a brand’s results and choose “Watch this brand”.</p></div>`}`);
  }
  function viewCollections() {
    const cols = S.collections.map((c) => `<section class="cat-section"><header class="cat-head"><h2 class="spy-h6">${esc(c.name)}</h2><span class="spy-caption-l spy-text-tertiary">${plural(c.items.length, 'creative')}</span></header>
      ${c.items.length ? `<div class="tk-grid">${c.items.map(adOf).filter(Boolean).map((a) => (a.tiktok ? tkCard(a) : `<a class="spy-result" href="#/ad/${a.id}"><div class="spy-result-media"><img src="${a.image}" alt="" loading="lazy"></div><span class="spy-result-title">${esc(a.title)}</span></a>`)).join('')}</div>` : '<p class="spy-caption-l spy-text-secondary">This collection is empty. Save a creative from any scan’s results to keep it here.</p>'}</section>`).join('');
    return shell('collections', `<div class="page-head"><div><h1 class="spy-h6">Collections</h1><p class="spy-caption-l spy-text-secondary">What you keep here stays as it is today, even after the scan that found it is gone.</p></div>
      <form class="spy-row" data-form="collection"><div class="spy-field-control" data-size="sm"><input class="spy-field-input" name="name" placeholder="Q4 offer angles" aria-label="New collection name"></div><button class="spy-btn" data-variant="outline" data-size="sm" type="submit">${ic('plus', 'sm')}New collection</button></form></div>${cols}`);
  }
  const viewMissing = () => shell('overview', `<div class="spy-empty app-empty"><h1 class="spy-h6">This page could not load</h1><a class="spy-btn" data-variant="outline" data-size="sm" href="#/overview">Back to search</a></div>`);

  /* ================================================================== render */
  function render() {
    const r = route();
    if (ui.scanTimer) { clearTimeout(ui.scanTimer); ui.scanTimer = null; }
    app.querySelectorAll('[data-playing]').forEach((el) => mediaStop(el));
    if (!S.signedIn && r.name !== 'login') { location.replace('#/login'); return; }
    if (S.signedIn && !S.onboarded && !['onboarding', 'login'].includes(r.name)) { location.replace('#/onboarding'); return; }
    const views = { login: viewLogin, onboarding: viewOnboarding, overview: viewOverview, confirm: viewConfirm, scan: viewScan, brand: viewBrand, ad: viewAd, scans: viewScans, watchlist: viewWatchlist, collections: viewCollections };
    const titles = { login: 'Sign in', onboarding: 'Welcome', overview: 'Overview', confirm: 'Confirm accounts', scan: 'Scan', brand: 'Results', ad: 'Video analysis', scans: 'Scans', watchlist: 'Watchlist', collections: 'Collections' };
    app.innerHTML = (views[r.name] || viewMissing)(r);
    document.title = `${titles[r.name] || 'Spyy'} · Spyy`;
    app.querySelectorAll('.spy-gauge[data-value]').forEach(paintGauge);
    if (r.name === 'scan' && Number(r.q.get('t') || 0) < 4) {
      ui.scanTimer = setTimeout(() => { location.replace(`#/scan/${r.id}?t=${Number(r.q.get('t') || 0) + 1}`); }, 900);
    }
    const chat = app.querySelector('.chat-log'); if (chat) chat.scrollTop = chat.scrollHeight;
    ui.fbAnim = false;
    placeDropdown();
    const pl = app.querySelector('[data-player]');
    if (pl && ui.autoplay === pl.dataset.id) mediaStart(pl);
    ui.autoplay = null;
  }
  function placeDropdown() {
    const menu = app.parentNode.querySelector('[data-dd-menu]');
    if (menu) {
      const trig = menu.parentNode.querySelector('[data-dd-trigger]');
      const r = trig.getBoundingClientRect(); const gap = 4;
      menu.style.minWidth = `${r.width}px`;
      const h = Math.min(menu.scrollHeight, 320);
      const below = window.innerHeight - r.bottom - gap - 8;
      const up = below < Math.min(h, 200) && r.top > below;
      menu.style.left = `${Math.min(r.left, window.innerWidth - Math.max(r.width, menu.offsetWidth) - 8)}px`;
      menu.style.top = up ? `${Math.max(8, r.top - gap - h)}px` : `${r.bottom + gap}px`;
      menu.style.maxHeight = `${up ? Math.min(320, r.top - gap - 8) : Math.min(320, below)}px`;
      if (ui.ddFocus === 'menu') (menu.querySelector('[aria-selected="true"]') || menu.querySelector('[role="option"]'))?.focus({ preventScroll: true });
    } else if (ui.ddFocus && ui.ddFocus !== 'menu') {
      app.querySelector(`[data-dd-trigger="${CSS.escape(ui.ddFocus)}"]`)?.focus({ preventScroll: true });
    }
    ui.ddFocus = null;
  }
  /* ------------------------------------------------------------ media playback
     Plays the real file when one exists at assets/videos/<ad id>.mp4. Without
     it (the prototype ships thumbnails only) the poster runs as a timed
     preview — slow zoom, moving progress, live clock — so hover and play
     still behave like a player instead of doing nothing. */
  function mediaUpdate(root) {
    const dur = Number(root.dataset.dur) || 1; const t = root._t || 0;
    const fill = root.querySelector('.m-fill'); if (fill) fill.style.width = `${Math.min(100, (t / dur) * 100)}%`;
    const time = root.querySelector('.m-time'); if (time) time.textContent = `${fmtDur(Math.floor(t))} / ${fmtDur(dur)}`;
    const btn = root.querySelector('.m-toggle'); if (btn) { const on = root.hasAttribute('data-playing'); btn.innerHTML = ic(on ? 'pause' : 'play'); btn.setAttribute('aria-label', on ? 'Pause video' : 'Play video'); }
  }
  function mediaStart(root) {
    if (root._timer) return;
    const v = root.querySelector('video'); const dur = Number(root.dataset.dur) || 1;
    root.setAttribute('data-playing', '');
    if (v && !root._tried && root.dataset.src) {
      root._tried = true; v.muted = root.hasAttribute('data-muted'); v.src = root.dataset.src;
      v.addEventListener('error', () => { root._real = false; root.removeAttribute('data-real'); }, { once: true });
      v.play().then(() => { root._real = true; root.setAttribute('data-real', ''); if (root._t) v.currentTime = root._t; }).catch(() => { root._real = false; });
    } else if (v && root._real) { v.play().catch(() => {}); }
    root._timer = setInterval(() => {
      if (root._real && v) root._t = v.currentTime;
      else { root._t = (root._t || 0) + 0.25; if (root._t >= dur) { if (root.hasAttribute('data-preview')) root._t = 0; else { mediaStop(root); root._t = 0; } } }
      mediaUpdate(root);
    }, 250);
    mediaUpdate(root);
  }
  function mediaStop(root, reset) {
    clearInterval(root._timer); root._timer = null; root.removeAttribute('data-playing');
    const v = root.querySelector('video'); if (v && root._real) v.pause();
    if (reset) { root._t = 0; if (v && root._real) v.currentTime = 0; }
    mediaUpdate(root);
  }
  document.addEventListener('mouseover', (e) => { const m = e.target.closest && e.target.closest('[data-preview]'); if (m && !m.contains(e.relatedTarget)) mediaStart(m); });
  document.addEventListener('mouseout', (e) => { const m = e.target.closest && e.target.closest('[data-preview]'); if (m && !m.contains(e.relatedTarget)) mediaStop(m, true); });
  document.addEventListener('focusin', (e) => { const m = e.target.closest && e.target.closest('[data-preview]'); if (m) mediaStart(m); });
  document.addEventListener('focusout', (e) => { const m = e.target.closest && e.target.closest('[data-preview]'); if (m) mediaStop(m, true); });
  /* Opening an ad from a card carries the play intent into the detail player. */
  document.addEventListener('click', (e) => { const m = e.target.closest && e.target.closest('[data-autoplay-id]'); if (m) ui.autoplay = m.dataset.autoplayId; }, true);

  function paintGauge(g) {
    const v = Number(g.dataset.value); const R = 42; const C = 2 * Math.PI * R;
    g.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="spy-gauge-track" cx="50" cy="50" r="${R}"></circle><circle class="spy-gauge-arc" cx="50" cy="50" r="${R}" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - v / 100)).toFixed(2)}"></circle></svg><span class="spy-gauge-center"><span class="spy-gauge-number">${v}<small>/100</small></span></span>`;
    g.setAttribute('role', 'img'); g.setAttribute('aria-label', `Adaptability ${v} out of 100`);
  }

  /* ---- state writers */
  function setPath(path, value) {
    const k = path.split('.');
    if (k[0] === 'watch') { S.watch[Number(k[1])][k[2]] = value; toast('Watchlist updated'); return; }
    if (k[0] === 'fb' && k[1] === 'platform') { const p = k[2]; S.fb.platforms = value ? [...new Set([...S.fb.platforms, p])] : S.fb.platforms.filter((x) => x !== p); return; }
    let o = S; for (let i = 0; i < k.length - 1; i++) o = o[k[i]];
    o[k[k.length - 1]] = value;
  }

  /* ---- events */
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-bind]'); if (!el) return;
    const v = el.type === 'checkbox' ? el.checked : el.value;
    setPath(el.dataset.bind, v); save(); render();
  });
  /* Remember which drawer sections are open, so a re-render (e.g. opening a dropdown inside one) does not collapse them. */
  document.addEventListener('toggle', (e) => { const d = e.target; if (d.classList && d.classList.contains('fb-sec')) ui.fbSecs[d.dataset.sec] = d.open; }, true);
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-bind="fb.advertiser"]'); if (!el) return;
    S.fb.advertiser = el.value; save();
  });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault();
    const kind = f.dataset.form;
    if (kind === 'email') { S.signedIn = true; save(); toast('Check your inbox', 'We sent a sign-in link. Opening it signs you in — this prototype does it for you.'); go('#/onboarding'); }
    if (kind === 'search') { S.query = f.q.value.trim(); S.category = 'all'; save(); render(); }
    if (kind === 'composer') { const v = f.reply.value.trim(); if (!v) return; const b = resolveBrand(v); toast(b ? `Found ${b.name}` : 'Noted', b ? 'Added to your research list.' : 'Spyy will use this as context.'); if (b && !S.profile.research.includes('Direct competitors')) S.profile.research.push('Direct competitors'); save(); render(); }
    if (kind === 'collection') { const n = f.name.value.trim(); if (!n) return; S.collections.push({ id: `c${Date.now()}`, name: n, items: [] }); save(); toast(`Collection “${n}” created`); render(); }
  });
  document.addEventListener('keydown', (e) => {
    const opt = e.target.closest && e.target.closest('.app-dd-menu [role="option"]');
    if (opt && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      const all = [...opt.parentNode.querySelectorAll('[role="option"]')];
      all[(all.indexOf(opt) + (e.key === 'ArrowDown' ? 1 : -1) + all.length) % all.length].focus();
      return;
    }
    if (e.key === 'Escape' && ui.menu && ui.menu.startsWith('dd:')) { ui.ddFocus = ui.menu.slice(3); ui.menu = null; render(); return; }
    if (e.key === 'Escape') { if (ui.fbDrawer) { ui.fbDrawer = false; render(); } else if (ui.menu) { ui.menu = null; render(); } }
  });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action], [data-tab]');
    if (!t) { if (ui.menu && !e.target.closest('.app-menu, .app-dd-menu')) { ui.menu = null; render(); } return; }
    if (t.dataset.tab) { S[t.dataset.tab] = t.dataset.value; save(); render(); return; }
    const a = t.dataset.action; const v = t.dataset.value;
    const act = {
      theme: () => { const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; try { localStorage.setItem('spyy-theme', next); } catch (x) { /* */ } },
      menu: () => { ui.menu = ui.menu === t.dataset.menu ? null : t.dataset.menu; if (ui.menu && ui.menu.startsWith('dd:')) ui.ddFocus = 'menu'; },
      'dd-pick': () => { setPath(t.dataset.bind, t.dataset.value); ui.menu = null; ui.ddFocus = t.dataset.bind; },
      signin: () => { S.signedIn = true; go('#/onboarding'); },
      signout: () => { S.signedIn = false; ui.menu = null; go('#/login'); },
      'restart-onboarding': () => { S.onboarded = false; ui.onboardStep = 0; ui.onboardResumed = true; ui.menu = null; go('#/onboarding'); },
      'onboard-pick': () => {
        const q = ONBOARD.find((x) => x.key === t.dataset.key);
        if (q.single) S.profile[q.key] = v;
        else S.profile[q.key] = S.profile[q.key].includes(v) ? S.profile[q.key].filter((x) => x !== v) : [...S.profile[q.key], v];
      },
      'onboard-next': () => { ui.onboardStep += 1; },
      'onboard-mode': () => { ui.formMode = !ui.formMode; },
      'onboard-finish': () => {
        const p = S.profile; if (p.sources[0]) S.source = p.sources[0] === 'appstore' ? 'meta' : p.sources[0];
        if (p.regions[0]) S.region = p.regions[0]; S.onboarded = true; go('#/overview');
      },
      source: () => { S.source = v; S.category = 'all'; },
      category: () => { S.category = v; window.scrollTo({ top: 0, behavior: 'smooth' }); },
      'tk-set': () => { S.tk[t.dataset.key] = v; },
      'tk-toggle': () => { S.tkOpen = !S.tkOpen; },
      'tk-clear': () => { const k = t.dataset.key; S.tk[k] = defaults().tk[k]; if (k === 'firstSeen') S.tk.lastSeen = ''; },
      'tk-reset': () => { S.tk = { ...defaults().tk, sort: S.tk.sort }; S.query = ''; },
      'fb-drawer': () => { ui.fbDrawer = true; ui.fbAnim = true; },
      'fb-drawer-close': () => { ui.fbDrawer = false; },
      'fb-clear': () => { const k = t.dataset.key; S.fb[k] = k === 'status' ? 'all' : defaults().fb[k]; },
      'fb-reset': () => { S.fb = { ...defaults().fb, sort: S.fb.sort }; S.query = ''; },
      'clear-query': () => { S.query = ''; },
      'scan-brand': () => { const q = app.querySelector('input[name="q"]')?.value.trim() || S.query; if (!q) { toast('Name a brand first', 'Type an app name, a brand, or paste an App Store link.', 'warning'); app.querySelector('input[name="q"]')?.focus(); return 'stay'; } S.query = q; ui.draftAccounts = null; go(`#/confirm?q=${encodeURIComponent(q)}`); return 'stay'; },
      'pick-account': () => { const arr = ui.draftAccounts.pick[t.dataset.src]; const n = Number(v); ui.draftAccounts.pick[t.dataset.src] = arr.includes(n) ? arr.filter((x) => x !== n) : [...arr, n]; },
      'start-scan': () => {
        const id = t.dataset.id; S.scansUsed += 1;
        S.scans.unshift({ brandId: id, videos: D.ads.filter((x) => x.brandId === id).length, sources: Object.entries(ui.draftAccounts.pick).filter(([, x]) => x.length).map(([s]) => s), from: 'search', at: new Date().toISOString() });
        save(); go(`#/scan/${id}?t=0`); return 'stay';
      },
      save: () => {
        const id = t.dataset.id; const c = S.collections[0];
        if (S.saved.includes(id)) { S.saved = S.saved.filter((x) => x !== id); c.items = c.items.filter((x) => x !== id); toast('Removed from collection'); }
        else { S.saved.push(id); c.items.push(id); toast(`Saved to “${c.name}”`, 'It stays exactly as it is today.'); }
      },
      watch: () => {
        const id = t.dataset.id;
        if (S.watch.some((w) => w.brandId === id)) { S.watch = S.watch.filter((w) => w.brandId !== id); toast('Stopped watching.'); }
        else { S.watch.push({ brandId: id, cadence: 'weekly', alerts: 'default', last: new Date().toISOString().slice(0, 10), newSince: 0 }); toast(`Watching ${brandOf(id).name}`, 'Re-scanned weekly.'); }
      },
      unwatch: () => { S.watch = S.watch.filter((w) => w.brandId !== t.dataset.id); toast('Stopped watching.'); },
      rescan: () => { toast('Re-scanning now', 'The new-since-last-scan count appears when it finishes.'); return 'stay'; },
      toast: () => { toast(t.dataset.title, t.dataset.body); return 'stay'; },
      'player-toggle': () => { const pl = t.closest('[data-player]'); if (pl._timer) mediaStop(pl); else mediaStart(pl); return 'stay'; },
    }[a];
    if (!act) return;
    e.preventDefault();
    if (act() !== 'stay') { save(); render(); }
  });

  const closeDd = () => { if (ui.menu && ui.menu.startsWith('dd:')) { ui.menu = null; render(); } };
  window.addEventListener('resize', closeDd);
  window.addEventListener('scroll', (e) => { if (!(e.target instanceof Element && e.target.closest('.app-dd-menu'))) closeDd(); }, true);
  window.addEventListener('hashchange', () => { ui.fbDrawer = false; ui.menu = null; render(); window.scrollTo(0, 0); });
  render();
})();
