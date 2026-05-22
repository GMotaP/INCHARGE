/* ──────────────────────────────────────────────────────────
   INCHARGE · Condomínios — app.js
   Carregamento lazy por visibilidade (IntersectionObserver),
   dot grid compacto, detalhes expansíveis por card.
   ────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────────── */
  const REFRESH_MS  = 60_000;  // refresca condos carregados a cada 60s
  const MAX_FLIGHT  = 25;      // máx de requisições simultâneas
  const OBS_MARGIN  = '350px'; // pré-carrega 350px antes de entrar na tela

  /* ── Dados ───────────────────────────────────────────────── */
  const INDIVIDUAIS = [
    { nome: "Iman Vila Mariana",            incs: ["INC101","INC258","INC243","INC102"],                                                                                                                                                                                                                                                                         tipo: "individual" },
    { nome: "Belle Ville",                  incs: ["INC130","INC131","INC170","INC257"],                                                                                                                                                                                                                                                                         tipo: "individual" },
    { nome: "Grand Privilege",              incs: ["INC181","INC286","INC180","INC179","INC185","INC182","INC183","INC184","INC297","INC262"],                                                                                                                                                                                                                    tipo: "individual" },
    { nome: "Grand Station",                incs: ["INC135","INC136","INC265","INC266"],                                                                                                                                                                                                                                                                         tipo: "individual" },
    { nome: "Itanhangá Hills",              incs: ["INC195","INC197","INC294","INC196","INC261"],                                                                                                                                                                                                                                                                 tipo: "individual" },
    { nome: "Lake · Parque Ibirapuera",     incs: ["INC092","INC093","INC094","INC099"],                                                                                                                                                                                                                                                                         tipo: "individual" },
    { nome: "Residencial Amavel",           incs: ["INC203","INC204","INC302","INC205","INC206","INC253","INC208","INC210","INC219","INC267","INC207","INC209","INC213","INC292","INC211","INC212","INC217","INC216","INC218","INC293","INC214","INC215"],                                                                                                        tipo: "individual" },
    { nome: "Brasília Celebration",         incs: ["INC103","INC201"],                                                                                                                                                                                                                                                                                           tipo: "individual" },
    { nome: "Le Parc Itaim",                incs: ["INC061","INC062","INC063","INC064","INC065","INC066","INC067","INC068","INC069","INC070","INC071","INC072","INC073","INC074","INC075","INC076","INC077","INC079","INC080","INC081","INC082","INC083","INC084","INC085","INC086","INC087","INC088","INC089"],                                                  tipo: "individual" },
    { nome: "Oiapoque",                     incs: ["INC015","INC149","INC159","INC161","INC167","INC175","INC242","INC016","INC110","INC150","INC160","INC194","INC246","INC111","INC112","INC113","INC114","INC116","INC115","INC172","INC174","INC169"],                                                                                                        tipo: "individual" },
    { nome: "Parc Devant",                  incs: ["INC177","INC188","INC199","INC200","INC256","INC176","INC193","INC260","INC259","INC178","INC186","INC187","INC189","INC190","INC191","INC192","INC300"],                                                                                                                                                     tipo: "individual" },
    { nome: "ETERN",                        incs: ["INC221","INC220","INC295","INC284"],                                                                                                                                                                                                                                                                         tipo: "individual" },
    { nome: "Vila Nova Reserved",           incs: ["INC272","INC271","INC273","INC275","INC276","INC301","INC274","INC277","INC279","INC281","INC278","INC280"],                                                                                                                                                                                                  tipo: "individual" },
    { nome: "Reserva do Golf",              incs: ["INC140","INC142","INC132","INC143"],                                                                                                                                                                                                                                                                         tipo: "individual" },
  ];

  const AGRUPADOS = [
    { nome: "Beverly Hills",               incs: ["INC019"],                            tipo: "agrupado" },
    { nome: "Residencial Cedro",           incs: ["INC156"],                            tipo: "agrupado" },
    { nome: "Vertigo",                     incs: ["INC155"],                            tipo: "agrupado" },
    { nome: "Essência da Vila",            incs: ["INC224","INC225","INC226"],           tipo: "agrupado" },
    { nome: "Meridian Residence",          incs: ["INC152"],                            tipo: "agrupado" },
    { nome: "Mirante Club Stratégia",      incs: ["INC233"],                            tipo: "agrupado" },
    { nome: "Palomar",                     incs: ["INC263"],                            tipo: "agrupado" },
    { nome: "Sintonia Ibirapuera",         incs: ["INC166"],                            tipo: "agrupado" },
    { nome: "WOK Residence",               incs: ["INC123","INC270"],                   tipo: "agrupado" },
    { nome: "BIOS Santana",                incs: ["INC008"],                            tipo: "agrupado" },
    { nome: "Le Rêve Exto",               incs: ["INC222","INC223"],                   tipo: "agrupado" },
    { nome: "Inspire Ibirapuera",          incs: ["INC254","INC255"],                   tipo: "agrupado" },
    { nome: "Insight Vila Leopoldina",     incs: ["INC026","INC020"],                   tipo: "agrupado" },
    { nome: "Plaza de España",             incs: ["INC229","INC230"],                   tipo: "agrupado" },
    { nome: "Casablanca",                  incs: ["INC005","INC006"],                   tipo: "agrupado" },
    { nome: "Premiere",                    incs: ["INC128"],                            tipo: "agrupado" },
    { nome: "Uplife Conceição",            incs: ["INC117"],                            tipo: "agrupado" },
    { nome: "Upcon Cínquo",               incs: ["INC118"],                            tipo: "agrupado" },
    { nome: "Statement",                   incs: ["INC198","INC227","INC228"],           tipo: "agrupado" },
    { nome: "Sintonia Perdizes",           incs: ["INC231","INC232"],                   tipo: "agrupado" },
    { nome: "Modern",                      incs: ["INC264"],                            tipo: "agrupado" },
    { nome: "Melo Alves 645",              incs: ["INC268","INC269"],                   tipo: "agrupado" },
    { nome: "Signat",                      incs: ["INC285"],                            tipo: "agrupado" },
    { nome: "Grand Paysage",               incs: ["INC287","INC288"],                   tipo: "agrupado" },
    { nome: "LOOMI",                       incs: ["INC296"],                            tipo: "agrupado" },
    { nome: "Paulista Home Resort",        incs: ["INC309","INC310","INC311"],           tipo: "agrupado" },
    { nome: "Alabarce",                    incs: ["INC109","INC108"],                   tipo: "agrupado" },
    { nome: "Praça Perdizes",              incs: ["INC328","INC336","INC341"],           tipo: "agrupado" },
    { nome: "Raízes Guilhermina",          incs: ["INC344"],                            tipo: "agrupado" },
  ];

  const ALL_CONDOS = [...INDIVIDUAIS, ...AGRUPADOS];

  /* ── Status helpers ──────────────────────────────────────── */
  const STATUS_LABEL = {
    Available: "Disponível",
    Preparing: "Preparando",
    Charging:  "Carregando",
    Finishing: "Finalizando",
    Offline:   "Offline",
  };

  function getStatus(ch) {
    if (!ch || ch.online === 0) return "Offline";
    return STATUS_LABEL[ch.status] ? ch.status : "Available";
  }

  function payLink(key, plug) {
    return `https://pay.incharge.app/now/${key.toUpperCase()}/${plug}`;
  }

  /* ── Estado global ───────────────────────────────────────── */
  // condoData[nome] = { INC001: [{plug, status, online}, ...], ... }
  const condoData  = {};   // dados carregados
  const loadedSet  = new Set(); // condos já buscados
  let searchQuery  = '';
  let activeFilter = 'all';
  let lastFetchTs  = 0;

  /* ── Fila de requisições com limite de concorrência ──────── */
  let inFlight = 0;
  const taskQueue = [];

  function runQueue() {
    while (inFlight < MAX_FLIGHT && taskQueue.length > 0) {
      const task = taskQueue.shift();
      inFlight++;
      task().finally(() => { inFlight--; runQueue(); });
    }
  }

  function enqueue(fn) {
    return new Promise((resolve, reject) => {
      taskQueue.push(() => fn().then(resolve, reject));
      runQueue();
    });
  }

  async function fetchOne(key) {
    return enqueue(async () => {
      try {
        const res = await fetch(
          `https://api.incharge.app/api/v2/now/${key}`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return Array.isArray(json)
          ? json
          : Array.isArray(json?.chargers) ? json.chargers : [];
      } catch {
        return [];
      }
    });
  }

  /* ── DOM helpers ─────────────────────────────────────────── */
  const $ = (sel) => document.querySelector(sel);
  const root      = document.documentElement;
  const elKpis    = $('#kpis');
  const elCondos  = $('#condos');
  const elBanner  = $('#banner');
  const elUpdated = $('#last-update');
  const elLive    = $('#live-pill');
  const elEmpty   = $('#empty-state');

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class')        node.className = v;
      else if (k === 'html')    node.innerHTML = v;
      else if (k.startsWith('data-')) node.setAttribute(k, v);
      else if (k in node)       node[k] = v;
      else                      node.setAttribute(k, v);
    }
    for (const c of children.flat()) {
      if (c == null) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  }

  /* ── KPIs globais ────────────────────────────────────────── */
  function computeGlobalStats() {
    const s = { condos: ALL_CONDOS.length, total: 0, available: 0, charging: 0, finishing: 0, offline: 0 };
    for (const incData of Object.values(condoData)) {
      if (!incData) continue;
      for (const plugs of Object.values(incData)) {
        for (const ch of (plugs || [])) {
          s.total++;
          const st = getStatus(ch).toLowerCase();
          if (st in s) s[st]++;
        }
      }
    }
    return s;
  }

  function renderKpis() {
    const s = computeGlobalStats();
    const items = [
      { label: "Condomínios", value: s.condos,    cls: "kpi--total"     },
      { label: "Disponíveis", value: s.available, cls: "kpi--available" },
      { label: "Carregando",  value: s.charging,  cls: "kpi--charging"  },
      { label: "Finalizando", value: s.finishing, cls: "kpi--finishing" },
      { label: "Offline",     value: s.offline,   cls: "kpi--offline"   },
    ];
    elKpis.replaceChildren(
      ...items.map(it =>
        el('div', { class: `kpi ${it.cls}` },
          el('div', { class: 'kpi__swatch' }),
          el('div', { class: 'kpi__body' },
            el('span', { class: 'kpi__label' }, it.label),
            el('span', { class: 'kpi__value' }, String(it.value)),
          )
        )
      )
    );
  }

  /* ── Stats por condo ─────────────────────────────────────── */
  function condoStats(nome) {
    const incData = condoData[nome];
    if (!incData) return null;
    const s = { total: 0, available: 0, charging: 0, finishing: 0, preparing: 0, offline: 0 };
    for (const plugs of Object.values(incData)) {
      for (const ch of (plugs || [])) {
        s.total++;
        const st = getStatus(ch).toLowerCase();
        if (st in s) s[st]++;
      }
    }
    return s;
  }

  /* ── Dot grid ────────────────────────────────────────────── */
  function buildDotGrid(nome, condo) {
    const incData = condoData[nome];
    const grid = el('div', { class: 'dot-grid' });

    if (!incData) {
      // Shimmer: estimativa de pontinhos de carregamento
      const n = Math.min(condo.incs.length * 2, 24);
      for (let i = 0; i < n; i++) {
        grid.append(el('a', { class: 'dot dot--loading' }));
      }
      return grid;
    }

    condo.incs.forEach(key => {
      const plugs = incData[key] || [];
      const group = el('div', { class: 'dot-group' });

      if (plugs.length === 0) {
        // INC sem dados — 1 dot cinza de carregamento
        group.append(el('a', {
          class: 'dot dot--loading',
          title: `${key.toUpperCase()} — sem dados`,
        }));
      } else {
        plugs.forEach(ch => {
          const st  = getStatus(ch);
          const lbl = STATUS_LABEL[st] || st;
          group.append(el('a', {
            class: `dot dot--${st.toLowerCase()}`,
            href:  payLink(key, ch.plug),
            target: '_blank',
            rel:   'noopener noreferrer',
            title: `${key.toUpperCase()} · P${ch.plug} — ${lbl}`,
          }));
        });
      }
      grid.append(group);
    });

    return grid;
  }

  /* ── Summary badges ──────────────────────────────────────── */
  function buildSummary(stats) {
    const wrap = el('div', { class: 'condo-summary' });
    if (!stats) {
      wrap.append(el('span', { class: 'cstat' }, '…'));
      return wrap;
    }
    const show = [
      { key: 'available', label: 'Disponíveis' },
      { key: 'charging',  label: 'Carregando'  },
      { key: 'finishing', label: 'Finalizando' },
      { key: 'offline',   label: 'Offline'     },
    ];
    show.forEach(({ key, label }) => {
      if (stats[key]) {
        wrap.append(el('span', { class: 'cstat', 'data-st': key, title: label }, String(stats[key])));
      }
    });
    if (!wrap.childElementCount) {
      wrap.append(el('span', { class: 'cstat' }, '—'));
    }
    return wrap;
  }

  /* ── Detail panel (expanded, mostra unidades com labels) ─── */
  function buildDetailPanel(nome, condo) {
    const panel = el('div', { class: 'condo-detail' });
    const incData = condoData[nome];
    if (!incData) return panel;

    condo.incs.forEach(key => {
      const plugs = incData[key] || [];
      const ok    = plugs.filter(c => getStatus(c) !== 'Offline').length;
      const unit  = el('div', { class: 'detail-unit' });

      unit.append(el('span', { class: 'detail-unit__id' }, key.toUpperCase()));

      const plugsWrap = el('div', { class: 'detail-unit__plugs' });
      if (plugs.length === 0) {
        plugsWrap.append(el('span', { style: 'color:var(--text-3);font-size:0.7rem' }, '—'));
      } else {
        plugs.forEach(ch => {
          const st = getStatus(ch);
          plugsWrap.append(
            el('a', {
              class: `detail-plug is-${st.toLowerCase()}`,
              href:  payLink(key, ch.plug),
              target: '_blank',
              rel:   'noopener noreferrer',
              title: `${key.toUpperCase()} · P${ch.plug} — ${STATUS_LABEL[st] || st}`,
            }, `P${ch.plug}`)
          );
        });
      }

      unit.append(
        plugsWrap,
        el('span', { class: 'detail-unit__health' },
          plugs.length ? `${ok}/${plugs.length}` : '—'
        )
      );
      panel.append(unit);
    });

    return panel;
  }

  /* ── Montar card ─────────────────────────────────────────── */
  function buildCard(condo) {
    const { nome, incs, tipo } = condo;
    const loaded = loadedSet.has(nome) && !!condoData[nome];
    const stats  = condoStats(nome);
    const pct    = stats && stats.total > 0
      ? Math.round(stats.available / stats.total * 100) : 0;

    const stateClass = !loadedSet.has(nome) ? 'is-unloaded'
                     : !condoData[nome]     ? 'is-fetching' : '';

    const card = el('article', {
      class: `condo-card ${stateClass}`,
      'data-condo': nome,
      'data-tipo': tipo,
    });

    /* cabeçalho */
    card.append(
      el('div', { class: 'condo-head' },
        el('div', { class: 'condo-name-wrap' },
          el('span', { class: 'condo-name' }, nome),
          el('span', { class: `condo-tipo condo-tipo--${tipo}` }, tipo === 'individual' ? 'Individual' : 'Agrupado'),
        ),
        buildSummary(stats),
      )
    );

    /* barra de progresso */
    const fill = el('div', { class: 'condo-bar__fill', style: `width:${pct}%` });
    card.append(
      el('div', { class: 'condo-bar-wrap' },
        el('div', { class: 'condo-bar' }, fill),
        el('span', { class: 'condo-bar__label' },
          loaded ? `${pct}% disp.` : '…'
        ),
      )
    );

    /* dot grid */
    card.append(buildDotGrid(nome, condo));

    /* footer: meta + botão detalhes */
    const totalPlugs = stats ? stats.total : 0;
    const toggleBtn = el('button', {
      class: 'condo-toggle',
      'aria-expanded': 'false',
      html: `Detalhes <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
    });

    card.append(
      el('div', { class: 'condo-footer' },
        el('span', { class: 'condo-meta' },
          `${incs.length} unidade${incs.length !== 1 ? 's' : ''}` +
          (totalPlugs ? ` · ${totalPlugs} plug${totalPlugs !== 1 ? 's' : ''}` : '')
        ),
        toggleBtn,
      )
    );

    /* painel de detalhe (oculto por padrão) */
    card.append(buildDetailPanel(nome, condo));

    /* toggle expand */
    toggleBtn.addEventListener('click', () => {
      const expanded = card.classList.toggle('is-expanded');
      toggleBtn.setAttribute('aria-expanded', String(expanded));
      // Se ainda não carregou, aguarda e atualiza quando chegar
    });

    return card;
  }

  /* ── Atualizar card existente no DOM ─────────────────────── */
  function patchCard(nome) {
    const card = elCondos.querySelector(`[data-condo="${CSS.escape(nome)}"]`);
    if (!card) return;

    const condo = ALL_CONDOS.find(c => c.nome === nome);
    if (!condo) return;

    const stats = condoStats(nome);
    const pct   = stats && stats.total > 0 ? Math.round(stats.available / stats.total * 100) : 0;

    // summary
    const oldSummary = card.querySelector('.condo-summary');
    if (oldSummary) oldSummary.replaceWith(buildSummary(stats));

    // barra
    const fillEl     = card.querySelector('.condo-bar__fill');
    const labelEl    = card.querySelector('.condo-bar__label');
    if (fillEl)  fillEl.style.width = `${pct}%`;
    if (labelEl) labelEl.textContent = `${pct}% disp.`;

    // dot grid
    const oldGrid = card.querySelector('.dot-grid');
    if (oldGrid) oldGrid.replaceWith(buildDotGrid(nome, condo));

    // detail panel (se estiver expandido)
    const oldDetail = card.querySelector('.condo-detail');
    if (oldDetail) oldDetail.replaceWith(buildDetailPanel(nome, condo));

    // footer meta
    const metaEl = card.querySelector('.condo-meta');
    const totalPlugs = stats ? stats.total : 0;
    if (metaEl) {
      metaEl.textContent = `${condo.incs.length} unidade${condo.incs.length !== 1 ? 's' : ''}` +
        (totalPlugs ? ` · ${totalPlugs} plug${totalPlugs !== 1 ? 's' : ''}` : '');
    }

    card.classList.remove('is-unloaded', 'is-fetching');
  }

  /* ── Renderizar todos os cards (filtro/busca) ────────────── */
  function renderCards() {
    const filtered = getFiltered();

    if (filtered.length === 0) {
      elCondos.replaceChildren();
      elEmpty.style.display = '';
    } else {
      elEmpty.style.display = 'none';
      const frag = document.createDocumentFragment();
      filtered.forEach(c => frag.append(buildCard(c)));
      elCondos.replaceChildren(frag);

      // Observar cards ainda não carregados
      elCondos.querySelectorAll('.condo-card.is-unloaded').forEach(card => {
        observer.observe(card);
      });
    }

    updateTabCounts();
  }

  /* ── Filtro ──────────────────────────────────────────────── */
  function getFiltered() {
    return ALL_CONDOS.filter(c => {
      const matchFilter = activeFilter === 'all' || c.tipo === activeFilter;
      const matchSearch = !searchQuery ||
        c.nome.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }

  function updateTabCounts() {
    const q = searchQuery;
    const counts = { all: 0, individual: 0, agrupado: 0 };
    ALL_CONDOS.forEach(c => {
      const match = !q || c.nome.toLowerCase().includes(q.toLowerCase());
      if (match) { counts.all++; counts[c.tipo]++; }
    });
    ['all','individual','agrupado'].forEach(k => {
      const el = document.getElementById(`count-${k}`);
      if (el) el.textContent = counts[k] || '';
    });
  }

  /* ── Buscar dados de um condo ────────────────────────────── */
  async function fetchCondo(nome) {
    const condo = ALL_CONDOS.find(c => c.nome === nome);
    if (!condo) return;

    // marca como fetching
    const card = elCondos.querySelector(`[data-condo="${CSS.escape(nome)}"]`);
    if (card) card.classList.replace('is-unloaded', 'is-fetching');

    const results = await Promise.all(
      condo.incs.map(key =>
        fetchOne(key).then(plugs => ({ key, plugs }))
      )
    );

    const incData   = {};
    let anyRealData = false;

    results.forEach(({ key, plugs }) => {
      incData[key] = plugs;
      if (plugs && plugs.length > 0) anyRealData = true;
    });

    // fallback mock se CORS bloqueou tudo
    if (!anyRealData) {
      const mock = {};
      const opts = ['Available','Available','Charging','Finishing','Offline'];
      condo.incs.forEach(key => {
        mock[key] = [
          { plug: 1, status: opts[Math.floor(Math.random() * (opts.length - 1))], online: 1 },
          { plug: 2, status: opts[Math.floor(Math.random() * (opts.length - 1))], online: Math.random() > 0.08 ? 1 : 0 },
        ];
      });
      condoData[nome] = mock;
      showBanner('Dados de exemplo — API bloqueada por CORS neste preview.');
    } else {
      condoData[nome] = incData;
      lastFetchTs     = Date.now();
    }

    patchCard(nome);
    renderKpis();
    renderUpdated();
  }

  /* ── IntersectionObserver (lazy load) ────────────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const nome = entry.target.dataset.condo;
      if (!nome || loadedSet.has(nome)) return;
      loadedSet.add(nome);
      observer.unobserve(entry.target);
      fetchCondo(nome);
    });
  }, { rootMargin: OBS_MARGIN });

  /* ── Refresh de condos já carregados ─────────────────────── */
  async function refreshAll() {
    // Paralelo por grupos de 5 para não sobrecarregar
    const batch = [...loadedSet];
    for (let i = 0; i < batch.length; i += 5) {
      await Promise.all(batch.slice(i, i + 5).map(nome => fetchCondo(nome)));
    }
  }

  /* ── Timestamp ───────────────────────────────────────────── */
  function fmtSince() {
    if (!lastFetchTs) return 'carregando…';
    const s = Math.floor((Date.now() - lastFetchTs) / 1000);
    if (s < 5)    return 'agora';
    if (s < 60)   return `há ${s}s`;
    if (s < 3600) return `há ${Math.floor(s / 60)}min`;
    return `há ${Math.floor(s / 3600)}h`;
  }

  function renderUpdated() {
    if (elUpdated) elUpdated.textContent = fmtSince();
    const stale = lastFetchTs && (Date.now() - lastFetchTs > REFRESH_MS * 2);
    if (elLive) {
      elLive.classList.toggle('is-stale', !!stale);
      const txt = elLive.querySelector('.live-text');
      if (txt) txt.textContent = stale ? 'PAUSADO' : 'AO VIVO';
    }
  }

  /* ── Banner ──────────────────────────────────────────────── */
  function showBanner(msg) {
    if (!elBanner) return;
    elBanner.replaceChildren(
      el('span', { class: 'banner__dot' }),
      el('span', null, msg),
    );
    elBanner.style.display = 'flex';
  }

  /* ── Tema ────────────────────────────────────────────────── */
  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem('incharge.theme'); } catch (_) {}
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
    const btn = $('#theme-toggle');
    if (btn) btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('incharge.theme', next); } catch (_) {}
    });
  }

  /* ── Controles: busca + filtro ───────────────────────────── */
  function initControls() {
    const searchEl = $('#search-input');
    if (searchEl) {
      searchEl.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderCards();
      });
    }
    document.querySelectorAll('.ftab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        document.querySelectorAll('.ftab').forEach(b =>
          b.classList.toggle('is-on', b === btn)
        );
        renderCards();
      });
    });
  }

  /* ── Boot ────────────────────────────────────────────────── */
  function boot() {
    initTheme();
    initControls();
    renderKpis();
    renderCards();
    setInterval(refreshAll, REFRESH_MS);
    setInterval(renderUpdated, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
