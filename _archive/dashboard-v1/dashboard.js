(() => {
  'use strict';

  const app = document.querySelector('#app');
  const toastRegion = document.querySelector('#toast-region');
  const root = document.documentElement;
  const storageKey = 'spyy-flow-v2';
  const themeKey = 'spyy-theme';
  const number = new Intl.NumberFormat('en-US');
  let database = { currentUser: {}, brands: [], ads: [] };
  let scanTimer = null;
  let playerTimer = null;

  const defaults = {
    authenticated: false,
    onboarded: false,
    email: '',
    onboardingStep: 0,
    profile: { role: [], goal: [], sources: [] },
    query: '',
    region: 'ALL',
    source: 'all',
    activeOnly: false,
    sort: 'running',
    brandId: null,
    identityResolved: false,
    scan: { status: 'idle', progress: 0, stage: 0 },
    saved: [],
    selectedTab: 'overview',
    model: 'Balanced model',
    watchlistOnly: false,
    playing: false,
    playhead: 0
  };

  const savedState = readStorage();
  const restoredScan = savedState.scan?.status === 'complete'
    ? { status: 'complete', progress: 100, stage: 4 }
    : { ...defaults.scan };
  const state = {
    ...defaults,
    ...savedState,
    profile: { ...defaults.profile, ...(savedState.profile || {}) },
    scan: restoredScan,
    playing: false,
    playhead: 0
  };

  function readStorage() {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); }
    catch (error) { return {}; }
  }

  function persist() {
    const persistedScan = state.scan.status === 'running'
      ? { status: 'idle', progress: 0, stage: 0 }
      : state.scan;
    const snapshot = { ...state, scan: persistedScan, playing: false, playhead: 0 };
    try { localStorage.setItem(storageKey, JSON.stringify(snapshot)); } catch (error) {}
  }

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function icon(name, className = 'spy-icon') {
    return `<svg class="${className}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  }

  function sourceLabel(source) {
    return ({ meta: 'Meta', tiktok: 'TikTok', appstore: 'App Store' })[source] || source;
  }

  function durationLabel(seconds) {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function initials(name = '') {
    return name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  }

  function brandById(id) { return database.brands.find(brand => brand.id === id); }
  function adById(id) { return database.ads.find(ad => ad.id === id); }

  function route() {
    if (!state.authenticated) return { name: 'signin' };
    if (!state.onboarded) return { name: 'onboarding' };
    const match = location.hash.match(/^#video\/([^/]+)$/);
    if (match && adById(match[1])) return { name: 'detail', id: match[1] };
    return { name: 'results' };
  }

  function navigate(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }

  function notify(title, description = '') {
    const node = document.createElement('div');
    node.className = 'flow-toast';
    node.innerHTML = `
      ${icon('success')}
      <span class="flow-toast-copy"><strong>${escapeHTML(title)}</strong>${description ? `<small>${escapeHTML(description)}</small>` : ''}</span>
      <button class="flow-toast-close" type="button" aria-label="Dismiss">${icon('close')}</button>`;
    node.querySelector('button').addEventListener('click', () => node.remove());
    toastRegion.appendChild(node);
    window.setTimeout(() => node.remove(), 3600);
  }

  function cleanupTimers() {
    if (scanTimer) window.clearInterval(scanTimer);
    if (playerTimer) window.clearInterval(playerTimer);
    scanTimer = null;
    playerTimer = null;
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem(themeKey, theme); } catch (error) {}
  }

  function preferredTheme() {
    try { return localStorage.getItem(themeKey) || 'light'; }
    catch (error) { return 'light'; }
  }

  function productTopbar(active = 'overview') {
    return `
      <header class="product-topbar">
        <a class="flow-logo" href="#results" aria-label="Spyy overview">Spyyy</a>
        <nav class="product-nav" aria-label="Product navigation">
          <a href="#results" ${active === 'overview' ? 'data-active aria-current="page"' : ''}>Overview</a>
          <a href="#results" data-action="show-watchlist" ${active === 'watchlist' ? 'data-active aria-current="page"' : ''}>Watchlist</a>
          <a href="#results" data-action="collections">Collections</a>
          <button type="button" data-action="toggle-theme" aria-label="Switch theme">${icon(root.dataset.theme === 'dark' ? 'sun' : 'moon')}</button>
          <button type="button" data-action="sign-out" aria-label="Sign out of ${escapeHTML(database.currentUser.name || 'Spyy')}">
            <span class="product-account">${escapeHTML(initials(database.currentUser.name || 'VN'))}</span>
          </button>
        </nav>
      </header>`;
  }

  function renderSignIn() {
    root.dataset.theme = 'light';
    document.title = 'Sign in · Spyy';
    app.innerHTML = `
      <main class="auth-shell" id="main-content">
        <section class="auth-form-panel" aria-labelledby="signin-title">
          <div class="auth-brandline">
            <span class="flow-logo">Spyyy</span>
            <span class="auth-secure">${icon('lock')} Secure workspace</span>
          </div>
          <div class="auth-card">
            <header class="auth-heading">
              <p class="flow-eyebrow">Creative intelligence</p>
              <h1 id="signin-title">Welcome to Spyyy!</h1>
              <p>Sign in to see what brands are running and why their video creative works.</p>
            </header>
            <button class="spy-btn auth-google" data-variant="secondary" data-size="lg" data-full-width type="button" data-action="google-signin">
              <img src="assets/figma/signin/google.svg" alt="">
              <span>Continue with Google</span>
            </button>
            <div class="auth-divider"><span>or continue with email</span></div>
            <form class="auth-form" id="signin-form" novalidate>
              <label class="spy-field">
                <span class="spy-field-label">Email</span>
                <span class="spy-field-control" data-size="lg">
                  ${icon('user', 'spy-icon spy-field-affix')}
                  <input class="spy-field-input" id="signin-email" name="email" type="email" autocomplete="email" placeholder="you@company.com" value="${escapeHTML(state.email)}" required>
                </span>
              </label>
              <p class="auth-error" id="signin-error" role="alert"></p>
              <button class="spy-btn" data-variant="brand" data-size="lg" data-full-width type="submit">
                <span>Sign in</span>${icon('arrow-right')}
              </button>
            </form>
            <p class="auth-terms">By continuing, you agree to the <a href="#" data-action="legal">Terms</a> and <a href="#" data-action="legal">Privacy Policy</a>.</p>
          </div>
          <p class="auth-footer">© 2026 Spyy · Evidence before opinion.</p>
        </section>
        <aside class="auth-showcase" aria-label="Spyy product preview">
          <div class="auth-showcase-copy">
            <h2>See the creative everyone else missed.</h2>
            <p>Active ads · source coverage · AI analysis</p>
          </div>
          <div class="auth-orbit" aria-hidden="true">
            ${[1, 2, 3, 4, 5, 6].map(index => `<img src="assets/figma/signin/tile-${index}.webp" alt="">`).join('')}
          </div>
          <div class="auth-phone" aria-hidden="true"><img src="assets/figma/signin/phone.webp" alt=""></div>
        </aside>
      </main>`;
  }

  const onboardingSteps = [
    {
      key: 'role',
      title: 'What brings you to Spyy?',
      description: 'This tunes how we rank evidence and which analysis appears first.',
      multi: false,
      options: ['Creative strategy', 'Growth marketing', 'Performance media', 'Founder research']
    },
    {
      key: 'goal',
      title: 'What do you need to learn first?',
      description: 'Pick one or more. You can change this later in workspace settings.',
      multi: true,
      options: ['Find active ads', 'Understand winning hooks', 'Monitor competitors', 'Build creative briefs']
    },
    {
      key: 'sources',
      title: 'Which sources matter to your team?',
      description: 'We will show source coverage and partial failures instead of hiding them.',
      multi: true,
      options: ['Meta', 'TikTok', 'App Store']
    }
  ];

  function profileProgress() {
    const picked = Object.values(state.profile).filter(value => Array.isArray(value) && value.length).length;
    return Math.round((picked / onboardingSteps.length) * 100);
  }

  function renderOnboarding() {
    root.dataset.theme = 'light';
    document.title = 'Set up your workspace · Spyy';
    const step = onboardingSteps[state.onboardingStep];
    const selected = state.profile[step.key] || [];
    const progress = profileProgress();
    app.innerHTML = `
      <div class="onboard-shell">
        <header class="onboard-topbar">
          <span class="flow-logo">Spyyy</span>
          <button class="spy-btn" data-variant="ghost" data-size="sm" type="button" data-action="sign-out">Sign out</button>
        </header>
        <main class="onboard-main" id="main-content">
          <section class="onboard-conversation" aria-labelledby="onboard-title">
            <div class="onboard-thread">
              <header class="onboard-heading">
                <p class="flow-eyebrow">Workspace setup · ${state.onboardingStep + 1} of ${onboardingSteps.length}</p>
                <h1 id="onboard-title">Welcome, ${escapeHTML(database.currentUser.name?.split(' ')[0] || 'Vũ')}.</h1>
                <p>I’ll ask three quick questions, then use your answers to shape the first scan. No generic dashboard, no hidden source failures.</p>
              </header>
              <div class="onboard-question">
                <h2>${escapeHTML(step.title)}</h2>
                <p>${escapeHTML(step.description)}</p>
                <div class="onboard-options" role="group" aria-label="${escapeHTML(step.title)}">
                  ${step.options.map(option => `
                    <button class="spy-chip" data-size="md" type="button" data-action="onboard-option" data-value="${escapeHTML(option)}" ${selected.includes(option) ? 'data-selected aria-pressed="true"' : 'aria-pressed="false"'}>
                      ${selected.includes(option) ? icon('check') : icon('plus')} ${escapeHTML(option)}
                    </button>`).join('')}
                </div>
                <div class="onboard-actions">
                  ${state.onboardingStep ? '<button class="spy-btn" data-variant="ghost" data-size="md" type="button" data-action="onboard-back">Back</button>' : ''}
                  <button class="spy-btn" data-variant="brand" data-size="md" type="button" data-action="onboard-next" ${selected.length ? '' : 'disabled'}>
                    ${state.onboardingStep === onboardingSteps.length - 1 ? 'Open workspace' : 'Continue'} ${icon('arrow-right')}
                  </button>
                </div>
              </div>
            </div>
            <div class="onboard-compose">
              <div class="spy-field-control onboard-compose-control">
                ${icon('plus')}
                <input class="spy-field-input" type="text" placeholder="Reply or add context…" data-action="onboard-compose">
                ${icon('arrow-up')}
              </div>
              <p class="onboard-compose-note">Spyy can make mistakes. Verify important evidence at the source.</p>
            </div>
          </section>
          <aside class="onboard-profile" aria-label="Workspace profile">
            <div class="profile-card">
              <div class="profile-head"><h2>Your research profile</h2><span class="profile-percent">${progress}%</span></div>
              <div class="profile-progress" aria-label="${progress}% complete"><span style="width:${progress}%"></span></div>
              <div class="profile-facts">
                <div class="profile-fact"><span>Role</span><strong>${escapeHTML(state.profile.role[0] || 'Not selected')}</strong></div>
                <div class="profile-fact"><span>Goals</span><strong>${state.profile.goal.length || '—'}</strong></div>
                <div class="profile-fact"><span>Sources</span><strong>${state.profile.sources.length || '—'}</strong></div>
              </div>
            </div>
          </aside>
        </main>
      </div>`;
  }

  function searchDock() {
    return `
      <form class="search-dock" id="search-form">
        <label class="spy-field-control spy-select-trigger search-region" data-size="sm">
          <span class="flow-visually-hidden">Region</span>
          <select class="flow-native-select" id="region-filter" name="region">
            <option value="ALL" ${state.region === 'ALL' ? 'selected' : ''}>All regions</option>
            <option value="US" ${state.region === 'US' ? 'selected' : ''}>United States</option>
            <option value="GB" ${state.region === 'GB' ? 'selected' : ''}>United Kingdom</option>
            <option value="DE" ${state.region === 'DE' ? 'selected' : ''}>Germany</option>
            <option value="VN" ${state.region === 'VN' ? 'selected' : ''}>Vietnam</option>
          </select>${icon('chevron-down')}
        </label>
        <label class="spy-field-control spy-select-trigger search-source" data-size="sm">
          <span class="flow-visually-hidden">Source</span>
          <select class="flow-native-select" id="source-filter" name="source">
            <option value="all" ${state.source === 'all' ? 'selected' : ''}>All sources</option>
            <option value="meta" ${state.source === 'meta' ? 'selected' : ''}>Meta</option>
            <option value="tiktok" ${state.source === 'tiktok' ? 'selected' : ''}>TikTok</option>
            <option value="appstore" ${state.source === 'appstore' ? 'selected' : ''}>App Store</option>
          </select>${icon('chevron-down')}
        </label>
        <label class="search-input-wrap">
          <span class="flow-visually-hidden">Brand, app, or website</span>
          <span class="spy-field-control" data-size="sm">
            ${icon('search', 'spy-icon spy-field-affix')}
            <input class="spy-field-input" id="brand-search" name="query" type="search" autocomplete="off" placeholder="Brand, app, App Store link, or website" value="${escapeHTML(state.query)}">
            ${state.query ? `<button class="spy-field-clear search-clear" type="button" data-action="clear-search" aria-label="Clear search">${icon('close')}</button>` : '<span class="spy-kbd">/</span>'}
          </span>
        </label>
        <button class="spy-btn" data-variant="brand" data-size="sm" type="submit" ${state.query.trim().length < 2 ? 'disabled' : ''}>${icon('sparkle')}<span>Resolve brand</span></button>
      </form>`;
  }

  function renderDiscover() {
    return `
      <section class="discover-hero" aria-labelledby="discover-title">
        <div class="discover-heading">
          <p class="flow-eyebrow">Competitive creative intelligence</p>
          <h1 id="discover-title">Find the signal in every ad.</h1>
          <p>Resolve the exact brand, scan its active video creative across sources, then understand the hooks, audiences, and patterns worth adapting.</p>
        </div>
        <aside class="discover-aside" aria-labelledby="known-brands-title">
          <h2 id="known-brands-title">Start with a known brand</h2>
          <div class="seed-list">
            ${database.brands.map(brand => `
              <button class="seed-brand" type="button" data-action="seed-brand" data-brand-id="${brand.id}">
                <span class="brand-monogram">${escapeHTML(initials(brand.name))}</span>
                <span><strong>${escapeHTML(brand.name)}</strong><small>${escapeHTML(brand.category)}</small></span>
                ${icon('arrow-right')}
              </button>`).join('')}
          </div>
        </aside>
      </section>`;
  }

  function renderIdentity(brand) {
    return `
      <section class="identity-panel" aria-labelledby="identity-title">
        <div class="identity-main">
          <div class="identity-heading">
            <span class="identity-logo">${escapeHTML(initials(brand.name))}</span>
            <span><p class="flow-eyebrow">Identity resolved</p><h1 id="identity-title">Is this ${escapeHTML(brand.name)}?</h1><p>${escapeHTML(brand.description)} · ${escapeHTML(brand.domain)}</p></span>
            <span class="identity-confidence">${brand.confidence}% confidence</span>
          </div>
          <div class="identity-accounts">
            ${brand.accounts.map(account => `
              <div class="identity-account">
                <span class="identity-source" data-source="${account.source}"></span>
                <span><strong>${escapeHTML(account.label)}</strong><small>${escapeHTML(account.handle)}</small></span>
                ${account.verified ? icon('success') : icon('warning')}
              </div>`).join('')}
          </div>
        </div>
        <div class="identity-side">
          <div class="identity-cost"><span>Estimated scan cost</span><strong>✦ 12</strong></div>
          <button class="spy-btn" data-variant="brand" data-size="lg" type="button" data-action="start-scan">Confirm & scan ${icon('arrow-right')}</button>
          <button class="spy-btn" data-variant="ghost" data-size="sm" type="button" data-action="reject-identity">Not the right brand</button>
        </div>
      </section>`;
  }

  function renderScanProgress(brand) {
    const stages = ['Resolve accounts', 'Collect metadata', 'Fetch creatives', 'Analyse video'];
    return `
      <section class="scan-progress" aria-live="polite" aria-label="Scan progress">
        <div class="scan-progress-copy">
          <div class="scan-progress-head"><strong>Scanning ${escapeHTML(brand.name)}</strong><span>${state.scan.progress}% · ${partialAds().length} creatives found</span></div>
          <div class="scan-progress-bar"><span style="width:${state.scan.progress}%"></span></div>
          <div class="scan-progress-steps">${stages.map((stage, index) => `<span ${index < state.scan.stage ? 'data-complete' : ''}>${index < state.scan.stage ? '✓' : '○'} ${stage}</span>`).join('')}</div>
        </div>
        <button class="spy-btn" data-variant="outline" data-size="sm" type="button" data-action="cancel-scan">Cancel</button>
      </section>`;
  }

  function selectedAds() {
    let ads = [...database.ads];
    if (state.brandId) ads = ads.filter(ad => ad.brandId === state.brandId);
    if (state.watchlistOnly) ads = ads.filter(ad => state.saved.includes(ad.id));
    if (state.region !== 'ALL') ads = ads.filter(ad => ad.region === state.region);
    if (state.source !== 'all') ads = ads.filter(ad => ad.source === state.source);
    if (state.activeOnly) ads = ads.filter(ad => ad.active);
    if (state.scan.status === 'running') ads = ads.slice(0, partialAds().length);
    ads.sort((a, b) => {
      if (state.sort === 'newest') return new Date(b.startedAt) - new Date(a.startedAt);
      if (state.sort === 'engagement') return parseFloat(b.metrics.engagement) - parseFloat(a.metrics.engagement);
      return b.daysRunning - a.daysRunning;
    });
    return ads;
  }

  function partialAds() {
    if (!state.brandId) return [];
    const all = database.ads.filter(ad => ad.brandId === state.brandId);
    if (state.scan.status !== 'running') return all;
    return all.slice(0, Math.min(all.length, Math.floor(state.scan.progress / 28)));
  }

  function renderAdCard(ad) {
    const brand = brandById(ad.brandId);
    const saved = state.saved.includes(ad.id);
    return `
      <article class="ad-card">
        <div class="ad-card-top">
          <div class="ad-statusline"><span class="ad-status" ${ad.active ? '' : 'data-inactive'}>${ad.active ? 'Active' : 'Inactive'}</span><span>${ad.daysRunning} days running</span></div>
          <div class="ad-card-meta">Library ID: ${escapeHTML(ad.libraryId)}</div>
          <div class="ad-card-meta">Started ${new Date(`${ad.startedAt}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${escapeHTML(ad.region)}</div>
        </div>
        <div class="ad-brandline">
          <span class="brand-monogram">${escapeHTML(initials(brand.name))}</span>
          <span><strong>${escapeHTML(brand.name)}</strong><small>${escapeHTML(sourceLabel(ad.source))} · ${escapeHTML(ad.format)}</small></span>
        </div>
        <button class="ad-media" type="button" data-action="open-video" data-video-id="${ad.id}" aria-label="Analyse ${escapeHTML(ad.title)}">
          <img src="${escapeHTML(ad.image)}" alt="" loading="lazy" decoding="async">
          <span class="ad-play">${icon('play')}</span>
          <span class="ad-overlay"><strong>${escapeHTML(ad.title)}</strong><small>${escapeHTML(ad.description)}</small></span>
        </button>
        <div class="ad-card-footer">
          <span class="ad-metrics"><span>${escapeHTML(ad.metrics.likes)} likes</span><span>${escapeHTML(ad.metrics.engagement)} engagement</span></span>
          <span class="ad-card-actions">
            <button class="spy-btn" data-variant="ghost" data-size="xs" data-icon-only type="button" data-action="copy-ad" data-video-id="${ad.id}" aria-label="Copy ad link">${icon('copy')}</button>
            <button class="spy-btn" data-variant="ghost" data-size="xs" data-icon-only type="button" data-action="toggle-save" data-video-id="${ad.id}" ${saved ? 'data-saved aria-pressed="true"' : 'aria-pressed="false"'} aria-label="${saved ? 'Remove from' : 'Add to'} watchlist">${icon('pin')}</button>
          </span>
        </div>
      </article>`;
  }

  function renderResultsGrid() {
    const ads = selectedAds();
    const brand = state.brandId ? brandById(state.brandId) : null;
    const title = state.watchlistOnly ? 'Watchlist' : brand ? `${brand.name} creative` : 'All creative';
    return `
      <section aria-labelledby="results-title">
        <header class="results-head">
          <div><h1 id="results-title">${escapeHTML(title)}</h1><p class="results-summary">${number.format(ads.length)} ${ads.length === 1 ? 'result' : 'results'} · source-aware evidence</p></div>
          <div class="results-actions">
            <label class="spy-field-control spy-select-trigger" data-size="sm">
              <span class="results-sort-label">Sort:</span>
              <select class="flow-native-select" id="sort-results">
                <option value="running" ${state.sort === 'running' ? 'selected' : ''}>Longest running</option>
                <option value="newest" ${state.sort === 'newest' ? 'selected' : ''}>Newest first</option>
                <option value="engagement" ${state.sort === 'engagement' ? 'selected' : ''}>Engagement</option>
              </select>${icon('chevron-down')}
            </label>
          </div>
        </header>
        <div class="filter-row" aria-label="Result filters">
          <button class="spy-chip" type="button" data-action="toggle-active" ${state.activeOnly ? 'data-selected aria-pressed="true"' : 'aria-pressed="false"'}>${icon('success')}Active ads</button>
          ${['all', 'meta', 'tiktok', 'appstore'].map(source => `<button class="spy-chip" type="button" data-action="set-source" data-source="${source}" ${state.source === source ? 'data-selected aria-pressed="true"' : 'aria-pressed="false"'}>${source === 'all' ? 'All sources' : sourceLabel(source)}</button>`).join('')}
          <span class="filter-spacer"></span>
          ${brand ? `<button class="spy-btn" data-variant="ghost" data-size="sm" type="button" data-action="new-search">${icon('search')} New brand</button>` : ''}
        </div>
        <div class="ad-grid">
          ${ads.length ? ads.map(renderAdCard).join('') : `
            <div class="results-empty">
              ${icon('search')}
              <h2>No matching creative</h2>
              <p>${state.watchlistOnly ? 'Save ads from the result grid and they will appear here.' : 'Change a source or region filter to broaden this result set.'}</p>
              <button class="spy-btn" data-variant="secondary" data-size="md" type="button" data-action="reset-filters">Reset filters</button>
            </div>`}
        </div>
      </section>`;
  }

  function renderResults() {
    cleanupTimers();
    root.dataset.theme = preferredTheme();
    document.title = 'Overview · Spyy';
    const brand = state.brandId ? brandById(state.brandId) : null;
    const hasResults = state.brandId && (state.scan.status === 'complete' || state.scan.status === 'running');
    app.innerHTML = `
      <div class="product-shell">
        ${productTopbar(state.watchlistOnly ? 'watchlist' : 'overview')}
        ${searchDock()}
        <main class="results-main" id="main-content">
          ${!state.identityResolved && !hasResults && !state.watchlistOnly ? renderDiscover() : ''}
          ${state.identityResolved && state.scan.status === 'idle' && brand ? renderIdentity(brand) : ''}
          ${state.scan.status === 'running' && brand ? renderScanProgress(brand) : ''}
          ${hasResults || state.watchlistOnly ? renderResultsGrid() : ''}
        </main>
      </div>`;
    if (state.scan.status === 'running') resumeScan();
  }

  function renderScore(name, value) {
    const band = value >= 80 ? 'strong' : value >= 65 ? 'good' : value >= 45 ? 'watch' : 'risk';
    const label = ({ strong: 'Very strong', good: 'Good', watch: 'Watch', risk: 'High risk' })[band];
    return `<div class="score-card" data-band="${band}"><span>${escapeHTML(name)}</span><span class="score-value"><strong>${value}</strong><small>/ 100</small></span><span class="score-track"><span style="width:${value}%"></span></span><span class="score-label">${label}</span></div>`;
  }

  function defaultTranscript(ad) {
    return [
      { time: '00:00', text: ad.title },
      { time: '00:03', text: ad.description },
      { time: '00:07', text: 'The product result becomes the visual proof point.' }
    ];
  }

  function tabPanel(ad) {
    if (state.selectedTab === 'transcript') {
      const rows = ad.transcript || defaultTranscript(ad);
      return `<section class="detail-panel detail-tab-content"><div class="detail-panel-inner"><div class="detail-panel-head"><h2>Transcript</h2><button class="spy-btn" data-variant="ghost" data-size="xs" type="button" data-action="copy-transcript">${icon('copy')} Copy</button></div><div class="transcript-list">${rows.map(row => `<div class="transcript-row"><time>${escapeHTML(row.time)}</time><p>${escapeHTML(row.text)}</p></div>`).join('')}</div></div></section>`;
    }
    if (state.selectedTab === 'frames') {
      return `<section class="detail-panel detail-tab-content"><div class="detail-panel-inner"><div class="detail-panel-head"><h2>Key frames</h2><span>3 detected moments</span></div><div class="frame-strip">${['Hook', 'Product proof', 'Call to action'].map((label, index) => `<figure><img src="${escapeHTML(ad.image)}" alt="${label}" style="object-position:${50 + (index - 1) * 18}% center"><figcaption>00:0${index * 3} · ${label}</figcaption></figure>`).join('')}</div></div></section>`;
    }
    if (state.selectedTab === 'audience') {
      return `<section class="detail-panel detail-tab-content"><div class="detail-panel-inner"><div class="detail-panel-head"><h2>Likely audience</h2><span>Inferred from creative signals</span></div><div class="audience-list">${(ad.audience || ['Broad consumer']).map(item => `<span class="spy-chip" data-selected>${escapeHTML(item)}</span>`).join('')}</div></div></section>`;
    }
    if (state.selectedTab === 'similar') {
      const similar = database.ads.filter(item => item.id !== ad.id && (item.brandId === ad.brandId || item.source === ad.source)).slice(0, 3);
      return `<section class="detail-panel detail-tab-content"><div class="detail-panel-inner"><div class="detail-panel-head"><h2>Similar videos</h2><span>${similar.length} close matches</span></div><div class="similar-grid">${similar.map(item => `<button class="similar-card" type="button" data-action="open-video" data-video-id="${item.id}"><img src="${escapeHTML(item.image)}" alt=""><span>${escapeHTML(item.title)}</span></button>`).join('')}</div></div></section>`;
    }
    return `
      <section class="detail-panel detail-tab-content">
        <div class="detail-panel-inner">
          <div class="detail-panel-head"><h2 class="detail-panel-title">${icon('copy')} Key takeaways</h2><span class="spy-chip" data-size="xs" data-selected>${escapeHTML(state.model)}</span></div>
          <ul class="takeaway-list">${ad.takeaways.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
          <div class="detail-tags">${ad.tags.map(tag => `<span class="spy-chip" data-size="xs">${escapeHTML(tag)}</span>`).join('')}</div>
        </div>
      </section>
      <section class="detail-panel detail-tab-content">
        <div class="detail-panel-inner"><div class="detail-panel-head"><h2 class="detail-panel-title">${icon('sparkle')} AI analysis scores</h2><button class="spy-btn" data-variant="ghost" data-size="xs" type="button" data-action="explain-scores">${icon('info')} How scores work</button></div><div class="score-grid">${Object.entries(ad.scores).map(([name, value]) => renderScore(name, value)).join('')}</div></div>
      </section>
      <section class="detail-panel detail-tab-content">
        <div class="detail-panel-inner"><div class="detail-panel-head"><h2 class="detail-panel-title">${icon('wand')} Why it worked</h2></div><div class="reason-list">
          ${ad.takeaways.slice(0, 5).map((item, index) => `<div class="reason-row"><strong>${escapeHTML(ad.tags[index % ad.tags.length])}</strong><span>${escapeHTML(item)}</span><span class="spy-chip" data-size="xs" ${index < 2 ? 'data-variant="error" data-selected' : 'data-variant="neutral" data-selected'}>${index < 2 ? 'High impact' : 'Medium'}</span></div>`).join('')}
        </div></div>
      </section>`;
  }

  function renderDetail(id) {
    cleanupTimers();
    root.dataset.theme = 'dark';
    const ad = adById(id);
    const brand = brandById(ad.brandId);
    document.title = `${ad.title} · Spyy analysis`;
    const classification = ad.classification || { goal: 'Conversion', secondary: 'Engagement', type: ad.format, topic: brand.category, emotion: 'Curiosity' };
    const saved = state.saved.includes(ad.id);
    app.innerHTML = `
      <div class="product-shell">
        ${productTopbar()}
        <main class="detail-page" id="main-content">
          <div class="detail-grid">
            <section class="detail-left" aria-label="Video and performance">
              <button class="spy-btn detail-back" data-variant="ghost" data-size="sm" type="button" data-action="back-results">${icon('chevron-left')} Back to results</button>
              <div class="detail-media">
                <img src="${escapeHTML(ad.image)}" alt="${escapeHTML(ad.title)}">
                <p class="detail-caption">${escapeHTML(ad.title)} — ${escapeHTML(ad.description)}</p>
                <div class="detail-player">
                  <button class="detail-play-btn" type="button" data-action="toggle-player" aria-label="${state.playing ? 'Pause' : 'Play'} video">${icon(state.playing ? 'pause' : 'play')}</button>
                  <button class="detail-timeline" type="button" data-action="seek-player" aria-label="Seek video"><span style="width:${state.playhead}%"></span></button>
                  <span class="detail-time">${durationLabel(Math.round(ad.duration * state.playhead / 100))} / ${durationLabel(ad.duration)}</span>
                  ${icon('volume')}
                </div>
              </div>
              <div class="detail-panel"><div class="detail-panel-inner">
                <div class="detail-panel-head"><h2>Video performance</h2><span class="spy-chip" data-size="xs">Last 30 days</span></div>
                <div class="detail-performance">${Object.entries(ad.metrics).map(([label, value]) => `<span class="performance-item"><strong>${escapeHTML(value)}</strong><span>${escapeHTML(label)}</span></span>`).join('')}</div>
                <div class="detail-meta-list"><div class="detail-meta-row"><span>Posted on</span><strong>${new Date(`${ad.startedAt}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div><div class="detail-meta-row"><span>Creator</span><strong>${escapeHTML(brand.name)}</strong></div><div class="detail-meta-row"><span>Source</span><strong>${escapeHTML(sourceLabel(ad.source))}</strong></div></div>
              </div></div>
            </section>
            <section class="detail-center" aria-labelledby="analysis-title">
              <div class="detail-titlebar">
                <div><p class="flow-eyebrow">Video analysis</p><h1 id="analysis-title">Video Analysis</h1></div>
                <label class="spy-field-control spy-select-trigger detail-model" data-size="sm"><select class="flow-native-select" id="analysis-model"><option ${state.model === 'Balanced model' ? 'selected' : ''}>Balanced model</option><option ${state.model === 'Growth model' ? 'selected' : ''}>Growth model</option><option ${state.model === 'Brand safety model' ? 'selected' : ''}>Brand safety model</option></select>${icon('chevron-down')}</label>
              </div>
              <div class="spy-tabs detail-tabs" data-variant="line"><div class="spy-tabs-list" role="tablist">
                ${[['overview', 'Overview'], ['transcript', 'Transcript'], ['frames', 'Frames'], ['audience', 'Audience'], ['similar', 'Similar videos']].map(([key, label]) => `<button class="spy-tabs-tab" type="button" role="tab" data-action="detail-tab" data-tab="${key}" ${state.selectedTab === key ? 'data-active aria-selected="true"' : 'aria-selected="false"'}><span class="spy-tabs-tab-content">${label}</span></button>`).join('')}
              </div></div>
              ${tabPanel(ad)}
            </section>
            <aside class="detail-right" aria-label="Adaptation and production guidance">
              <section class="detail-panel"><div class="detail-panel-inner">
                <div class="detail-panel-head"><h2 class="detail-panel-title">${icon('layers')} Adaptability</h2><span class="spy-chip" data-size="xs">For my brand</span></div>
                <div class="adapt-score"><span class="adapt-ring" style="--score:${ad.adaptability}"><strong>${ad.adaptability}</strong></span><span class="adapt-copy"><strong>${ad.adaptability >= 85 ? 'High adaptability' : 'Good adaptability'}</strong><p>Core mechanics can be adapted to your product with focused changes.</p></span></div>
                <div class="adapt-actions"><div class="adapt-row"><span class="adapt-state">${icon('check')}</span><strong>Keep</strong><span>Hook structure · native pacing</span><strong>2</strong></div><div class="adapt-row" data-type="modify"><span class="adapt-state">${icon('minus')}</span><strong>Modify</strong><span>Product proof · framing</span><strong>2</strong></div><div class="adapt-row" data-type="remove"><span class="adapt-state">${icon('close')}</span><strong>Remove</strong><span>Unsafe or unverifiable claims</span><strong>1</strong></div></div>
              </div></section>
              <section class="detail-panel"><div class="detail-panel-inner">
                <div class="detail-panel-head"><h2 class="detail-panel-title">${icon('filter')} Content classification</h2></div>
                <div class="classification-list">${Object.entries(classification).map(([key, value]) => `<div class="classification-row"><strong>${escapeHTML(key[0].toUpperCase() + key.slice(1))}</strong><span class="class-pill">${escapeHTML(value)}</span></div>`).join('')}</div>
              </div></section>
              <section class="detail-panel"><div class="detail-panel-inner">
                <div class="detail-panel-head"><h2 class="detail-panel-title">${icon('video')} Production effort</h2><span class="spy-chip" data-size="xs" data-variant="success" data-selected>Low</span></div>
                <div class="production-grid"><span class="production-item">${icon('video')}<span>Shoot</span><strong>~15 min</strong></span><span class="production-item">${icon('crop')}<span>Edit</span><strong>~25 min</strong></span><span class="production-item">${icon('layers')}<span>Assets</span><strong>None</strong></span><span class="production-item">${icon('user')}<span>Talent</span><strong>1 person</strong></span></div>
                <button class="spy-btn production-action" data-variant="brand" data-size="md" data-full-width type="button" data-action="create-brief">${icon('sparkle')} Create adaptation brief</button>
              </div></section>
              <button class="spy-btn" data-variant="secondary" data-size="md" type="button" data-action="toggle-save" data-video-id="${ad.id}" aria-pressed="${saved}">${icon('pin')} ${saved ? 'Saved to watchlist' : 'Save to watchlist'}</button>
            </aside>
          </div>
        </main>
      </div>`;
    if (state.playing) startPlayer(ad);
  }

  function render() {
    cleanupTimers();
    const current = route();
    if (current.name === 'signin') renderSignIn();
    else if (current.name === 'onboarding') renderOnboarding();
    else if (current.name === 'detail') renderDetail(current.id);
    else renderResults();
  }

  function signIn(email) {
    state.authenticated = true;
    state.email = email || database.currentUser.email;
    database.currentUser.email = state.email;
    persist();
    render();
  }

  function resolveBrand(query) {
    const normalized = query.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const found = database.brands.find(brand => {
      const haystack = `${brand.name} ${brand.domain} ${brand.appStoreId || ''}`.toLowerCase();
      return normalized.split(/\s+/).some(part => part.length > 1 && haystack.includes(part));
    });
    return found || database.brands[0];
  }

  function startScan() {
    state.identityResolved = false;
    state.scan = { status: 'running', progress: 8, stage: 0 };
    persist();
    render();
  }

  function resumeScan() {
    if (scanTimer) window.clearInterval(scanTimer);
    scanTimer = window.setInterval(() => {
      state.scan.progress = Math.min(100, state.scan.progress + 7);
      state.scan.stage = Math.min(4, Math.floor(state.scan.progress / 24));
      if (state.scan.progress >= 100) {
        state.scan.status = 'complete';
        state.scan.stage = 4;
        window.clearInterval(scanTimer);
        scanTimer = null;
        persist();
        render();
        notify('Scan complete', `${selectedAds().length} creatives are ready to analyse.`);
        return;
      }
      const bar = document.querySelector('.scan-progress-bar > span');
      const head = document.querySelector('.scan-progress-head span');
      const steps = document.querySelector('.scan-progress-steps');
      if (bar) bar.style.width = `${state.scan.progress}%`;
      if (head) head.textContent = `${state.scan.progress}% · ${partialAds().length} creatives found`;
      if (steps) {
        [...steps.children].forEach((node, index) => {
          node.toggleAttribute('data-complete', index < state.scan.stage);
          node.textContent = `${index < state.scan.stage ? '✓' : '○'} ${['Resolve accounts', 'Collect metadata', 'Fetch creatives', 'Analyse video'][index]}`;
        });
      }
      if (state.scan.progress === 50 || state.scan.progress === 78) render();
    }, 420);
  }

  function startPlayer(ad) {
    playerTimer = window.setInterval(() => {
      state.playhead += 100 / ad.duration / 4;
      if (state.playhead >= 100) { state.playhead = 0; state.playing = false; window.clearInterval(playerTimer); playerTimer = null; }
      const bar = document.querySelector('.detail-timeline span');
      const time = document.querySelector('.detail-time');
      if (bar) bar.style.width = `${state.playhead}%`;
      if (time) time.textContent = `${durationLabel(Math.round(ad.duration * state.playhead / 100))} / ${durationLabel(ad.duration)}`;
      if (!state.playing) render();
    }, 250);
  }

  document.addEventListener('submit', event => {
    if (event.target.id === 'signin-form') {
      event.preventDefault();
      const email = event.target.elements.email.value.trim();
      const error = document.querySelector('#signin-error');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        error.textContent = 'Enter a valid work email, for example you@company.com.';
        event.target.querySelector('.spy-field-control').setAttribute('data-invalid', '');
        return;
      }
      signIn(email);
    }
    if (event.target.id === 'search-form') {
      event.preventDefault();
      const data = new FormData(event.target);
      state.query = String(data.get('query') || '').trim();
      state.region = String(data.get('region') || 'ALL');
      state.source = String(data.get('source') || 'all');
      if (state.query.length < 2) return;
      const button = event.target.querySelector('button[type="submit"]');
      button.setAttribute('aria-busy', 'true');
      window.setTimeout(() => {
        const brand = resolveBrand(state.query);
        state.brandId = brand.id;
        state.query = brand.name;
        state.identityResolved = true;
        state.scan = { status: 'idle', progress: 0, stage: 0 };
        state.watchlistOnly = false;
        persist();
        render();
        document.querySelector('.identity-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'brand-search') {
      state.query = event.target.value;
      const button = document.querySelector('#search-form button[type="submit"]');
      if (button) button.disabled = state.query.trim().length < 2;
    }
  });

  document.addEventListener('change', event => {
    if (event.target.id === 'region-filter') { state.region = event.target.value; persist(); if (state.scan.status === 'complete' || state.watchlistOnly) render(); }
    if (event.target.id === 'source-filter') { state.source = event.target.value; persist(); if (state.scan.status === 'complete' || state.watchlistOnly) render(); }
    if (event.target.id === 'sort-results') { state.sort = event.target.value; persist(); render(); }
    if (event.target.id === 'analysis-model') { state.model = event.target.value; persist(); render(); notify('Analysis updated', `${state.model} has rescored this creative.`); }
  });

  document.addEventListener('click', async event => {
    const control = event.target.closest('[data-action]');
    if (!control) return;
    const action = control.dataset.action;

    if (action === 'google-signin') signIn(database.currentUser.email);
    if (action === 'legal') { event.preventDefault(); notify('Preview environment', 'Legal documents are not part of this product-flow prototype.'); }
    if (action === 'sign-out') {
      Object.assign(state, structuredClone(defaults));
      persist();
      location.hash = '';
      render();
    }
    if (action === 'onboard-option') {
      const step = onboardingSteps[state.onboardingStep];
      const values = state.profile[step.key];
      const value = control.dataset.value;
      if (step.multi) {
        const index = values.indexOf(value);
        if (index >= 0) values.splice(index, 1); else values.push(value);
      } else state.profile[step.key] = [value];
      persist();
      renderOnboarding();
    }
    if (action === 'onboard-back') { state.onboardingStep = Math.max(0, state.onboardingStep - 1); persist(); renderOnboarding(); }
    if (action === 'onboard-next') {
      if (state.onboardingStep < onboardingSteps.length - 1) { state.onboardingStep += 1; persist(); renderOnboarding(); }
      else { state.onboarded = true; persist(); navigate('#results'); notify('Workspace ready', 'Your research profile will shape rankings and analysis.'); }
    }
    if (action === 'toggle-theme') setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'), render();
    if (action === 'seed-brand') {
      const brand = brandById(control.dataset.brandId);
      state.query = brand.name; state.brandId = brand.id; state.identityResolved = true; state.scan = { status: 'idle', progress: 0, stage: 0 }; state.watchlistOnly = false; persist(); render();
    }
    if (action === 'clear-search' || action === 'new-search') {
      state.query = ''; state.brandId = null; state.identityResolved = false; state.scan = { status: 'idle', progress: 0, stage: 0 }; state.watchlistOnly = false; persist(); render(); window.setTimeout(() => document.querySelector('#brand-search')?.focus(), 0);
    }
    if (action === 'reject-identity') { state.identityResolved = false; state.brandId = null; state.query = ''; persist(); render(); window.setTimeout(() => document.querySelector('#brand-search')?.focus(), 0); }
    if (action === 'start-scan') startScan();
    if (action === 'cancel-scan') { cleanupTimers(); state.scan = { status: 'idle', progress: 0, stage: 0 }; state.identityResolved = true; persist(); render(); notify('Scan cancelled', 'No scan credits were charged.'); }
    if (action === 'toggle-active') { state.activeOnly = !state.activeOnly; persist(); render(); }
    if (action === 'set-source') { state.source = control.dataset.source; persist(); render(); }
    if (action === 'reset-filters') { state.region = 'ALL'; state.source = 'all'; state.activeOnly = false; persist(); render(); }
    if (action === 'show-watchlist') { event.preventDefault(); state.watchlistOnly = true; state.identityResolved = false; state.scan.status = 'idle'; persist(); navigate('#results'); }
    if (action === 'collections') { event.preventDefault(); notify('Collections are ready', 'Save an ad first, then group it from the video analysis view.'); }
    if (action === 'open-video') { state.selectedTab = 'overview'; state.playing = false; state.playhead = 0; persist(); navigate(`#video/${control.dataset.videoId}`); }
    if (action === 'back-results') { state.playing = false; state.playhead = 0; navigate('#results'); }
    if (action === 'detail-tab') { state.selectedTab = control.dataset.tab; persist(); renderDetail(route().id); }
    if (action === 'toggle-save') {
      const id = control.dataset.videoId;
      const index = state.saved.indexOf(id);
      if (index >= 0) state.saved.splice(index, 1); else state.saved.push(id);
      persist();
      const current = route();
      if (current.name === 'detail') renderDetail(current.id); else renderResults();
      notify(index >= 0 ? 'Removed from watchlist' : 'Saved to watchlist', 'Your saved state is persisted in this browser.');
    }
    if (action === 'copy-ad') {
      const url = `${location.href.split('#')[0]}#video/${control.dataset.videoId}`;
      try { await navigator.clipboard.writeText(url); notify('Link copied', 'Share this analysis view with your team.'); }
      catch (error) { notify('Copy unavailable', url); }
    }
    if (action === 'toggle-player') {
      state.playing = !state.playing;
      if (state.playhead >= 100) state.playhead = 0;
      renderDetail(route().id);
    }
    if (action === 'seek-player') {
      const rect = control.getBoundingClientRect();
      state.playhead = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      renderDetail(route().id);
    }
    if (action === 'copy-transcript') {
      const ad = adById(route().id);
      const text = (ad.transcript || defaultTranscript(ad)).map(row => `${row.time} ${row.text}`).join('\n');
      try { await navigator.clipboard.writeText(text); notify('Transcript copied'); } catch (error) { notify('Copy unavailable'); }
    }
    if (action === 'explain-scores') notify('Evidence-weighted scores', 'Scores combine hook timing, product visibility, audience cues, provenance, and brand-safety signals.');
    if (action === 'create-brief') notify('Adaptation brief created', 'Keep, modify, and remove guidance has been added to your workspace draft.');
  });

  document.addEventListener('keydown', event => {
    if (event.key === '/' && !/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName || '')) {
      const input = document.querySelector('#brand-search');
      if (input) { event.preventDefault(); input.focus(); }
    }
  });

  window.addEventListener('hashchange', () => {
    render();
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });

  fetch('data/spyy-data.json')
    .then(response => {
      if (!response.ok) throw new Error(`Data request failed: ${response.status}`);
      return response.json();
    })
    .then(data => { database = data; render(); })
    .catch(error => {
      app.innerHTML = `<main class="flow-boot" id="main-content"><span class="flow-logo">Spyyy</span><strong>Could not load the evidence model.</strong><span>${escapeHTML(error.message)}</span><button class="spy-btn" data-variant="brand" data-size="md" onclick="location.reload()">Retry</button></main>`;
    });
})();
