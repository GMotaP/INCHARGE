/* ──────────────────────────────────────────────────────────
   INCHARGE · app.js
   Fetch dos status, render dos cards, contadores ao vivo.
   ────────────────────────────────────────────────────────── */
(function () {
  // ── Configuration ───────────────────────────────────────
  const REFRESH_MS = 30000;
  const TICK_MS = 1000;

  const cities = [
    { name: "São José dos Campos - SP",       keys: ["inc250", "inc251", "inc252"], link: "https://www.google.com.br/maps/place/PIT+-+Parque+de+Inovação+Tecnológica+São+José+dos+Campos" },
    { name: "Aparecida - SP",                  keys: ["inc247", "inc248", "inc249"], link: "https://www.google.com.br/maps/place/Posto+Arco+Íris+Aparecida" },
    { name: "Três Corações - MG",              keys: ["inc234", "inc235", "inc241"], link: "https://www.google.com.br/maps/place/Venda+do+Chico+-+Três+Corações" },
    { name: "Carmópolis de Minas - MG",        keys: ["inc238", "inc239"], link: "https://www.google.com.br/maps/place/Eletroposto+Carmópolis+de+Minas" },
    { name: "ServSul (Pouso Alegre - MG)",     keys: ["pc139", "pc141"], link: "#" },
    { name: "Posto Beija Flor - MG",           keys: ["inc237", "inc236"], link: "#" },
    { name: "Lumus (Pará de Minas - MG)",      keys: ["pc111", "pc134"], link: "#" },
    { name: "GO Eletric 1",                    keys: ["POSTO5120", "CAJAMAR03", "RIACHOGRANDE120", "FAROL48DC02"], link: "#" },
    { name: "GO Eletric 2",                    keys: ["SOROCABA2", "FAROLCARRETEIRO02", "LOUVEIRA1", "SRPQ5"], link: "#" },
    { name: "GO Eletric 3",                    keys: ["CACAPAVADC1", "SUZANODC1", "SRPQ1", "SRPQ2"], link: "#" },
    { name: "GO Eletric 4",                    keys: ["SRPQ3", "CAJAMAR01", "CAJAMAR02", "CAJAMAR04"], link: "#" },
    { name: "GO Eletric 5",                    keys: ["FAROL48DC01", "FAROLCARRETEIRO01", "FAROLDUTRA01", "FAROLFERNAODIAS01"], link: "#" },
    { name: "GO Eletric 6",                    keys: ["HORTIFRUTIDC", "LOUVEIRA2", "LOUVEIRA3", "LOUVEIRA4"], link: "#" },
    { name: "GO Eletric 7",                    keys: ["SOROCABA1", "NEGREIROSDC", "POUPAKIDC"], link: "#" },
  ];

  const acGroups = [
    { name: "GO Eletric AC 1",                 keys: ["FAROL48AC1", "FAROL48AC2", "HORTIFRUTIAC"], link: "#" },
    { name: "GO Eletric AC 2",                 keys: ["POSTO57", "RIACHOGRANDE7", "NEGREIROSAC"], link: "#" },
    { name: "GO Eletric AC 3",                 keys: ["POUPAKIAC", "FEPASA", "GACSANTAEMILIARIBEIRAO"], link: "#" },
  ];

  const singles = [
    { name: "Santa Rita do Sapucaí - MG",         keys: ["pc025"], link: "https://www.google.com.br/maps/place/INCHARGE+Santa+Rita" },
    { name: "Impacto Solar (Campo Belo - MG)",    keys: ["pc112"], link: "https://www.google.com.br/maps/place/Campo+Belo+MG" },
    { name: "Itacar (Itajubá - MG)",               keys: ["pc106", "pc128"], link: "https://www.google.com.br/maps/place/Itajubá+ITACAR" },
    { name: "Scherer Carregadores",                keys: ["pc129", "pc130", "pc131", "pc132"], link: "#" },
  ];

  const STATUS_LABEL = {
    Available: "Disponível",
    Preparing: "Preparando",
    Charging:  "Carregando",
    Finishing: "Finalizando",
    Offline:   "Offline",
  };

  // ── Elements ────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const root = document.documentElement;
  const elKpis      = $("#kpis");
  const elLocations = $("#locations");
  const elAcLocations = $("#ac-locations");
  const elSingles   = $("#singles");
  const elUpdated   = $("#last-update");
  const elLive      = $("#live-pill");
  const elBanner    = $("#banner");
  const elBtnTheme  = $("#theme-toggle");

  // ── State ───────────────────────────────────────────────
  let allKeys = [...cities.flatMap(c => c.keys), ...acGroups.flatMap(c => c.keys), ...singles.flatMap(s => s.keys)];
  let data = {};       // { key: [{ plug, status, online }, ...] }
  let details = {};    // { "key/plug": { percent, minutesTo80Percent, ... } }
  let lastFetchTs = 0; // ms epoch of last successful fetch
  let usingMock = false;

  // ── Utils ───────────────────────────────────────────────
  function getStatus(ch) {
    if (!ch || ch.online === 0) return "Offline";
    return STATUS_LABEL[ch.status] ? ch.status : "Available";
  }
  function statusClass(ch) {
    const s = getStatus(ch);
    return "is-" + s.toLowerCase();
  }
  function paymentLink(key, plug) {
    const upper = String(key).toUpperCase();
    if (upper === "PC106") return `https://pay4charge.com/now/PC106/${plug}`;
    if (upper === "P4C006") return `https://pay4charge.com/now/P4C006/${plug}`;
    return `https://pay.incharge.app/now/${upper}/${plug}`;
  }
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("data-")) node.setAttribute(k, v);
      else if (k in node) node[k] = v;
      else node.setAttribute(k, v);
    }
    for (const c of children.flat()) {
      if (c == null) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  }

  // Inline icons (kept tiny)
  const SVG_MAP   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7-7-12a7 7 0 1 1 14 0c0 5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>`;
  const SVG_EXT   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>`;

  // ── Render: KPIs ────────────────────────────────────────
  function renderKpis(stats) {
    const items = [
      { key: "total",     label: "Total",         value: stats.total,     cls: "kpi--total" },
      { key: "available", label: "Disponíveis",   value: stats.available, cls: "kpi--available" },
      { key: "charging",  label: "Carregando",    value: stats.charging,  cls: "kpi--charging" },
      { key: "finishing", label: "Finalizando",   value: stats.finishing, cls: "kpi--finishing" },
      { key: "offline",   label: "Offline",       value: stats.offline,   cls: "kpi--offline" },
    ];
    elKpis.replaceChildren(...items.map(it =>
      el("div", { class: `kpi ${it.cls}` },
        el("div", { class: "kpi__swatch" }),
        el("div", { class: "kpi__body" },
          el("span", { class: "kpi__label" }, it.label),
          el("span", { class: "kpi__value" }, String(it.value)),
        )
      )
    ));
  }

  // ── Render: plug (card de status, no estilo ITACAR) ─────
  // Mesmo tamanho para todos os status. Mostra % + barra só quando carregando.
  function renderPlug(key, ch, detail) {
    const status     = getStatus(ch);
    const label      = STATUS_LABEL[status] || status;
    const isCharging = status === "Charging";

    const card = el("a", {
      class: `status-card ${statusClass(ch)}`,
      href: paymentLink(key, ch.plug),
      target: "_blank",
      rel: "noopener noreferrer",
      title: `${key.toUpperCase()} · Plug ${ch.plug} — ${label}`,
    });

    const raw = detail && Number.isFinite(detail.percent) ? detail.percent : null;
    const pct = raw == null ? null : Math.max(0, Math.min(100, Math.round(raw)));

    card.append(
      el("div", { class: "status-card__top" },
        el("span", { class: "status-card__title" },
          el("span", { class: "status-card__dot" }),
          el("span", { class: "status-card__title-text" }, `P${ch.plug} · ${label}`),
        ),
        isCharging ? el("span", { class: "status-card__pct" }, pct != null ? `${pct}%` : "…") : null,
      ),
      el("div", { class: "status-card__bar" },
        el("span", { class: "status-card__fill", style: `width:${isCharging && pct != null ? pct : 0}%` }),
      ),
    );

    return card;
  }

  function renderLoadingPlug() {
    return el("div", { class: "status-card is-loading" },
      el("div", { class: "status-card__top" },
        el("span", { class: "status-card__title" },
          el("span", { class: "status-card__dot" }),
          el("span", { class: "status-card__title-text" }, "—"),
        ),
      ),
      el("div", { class: "status-card__bar" },
        el("span", { class: "status-card__fill", style: "width:0%" }),
      ),
    );
  }

  function renderUnit(key) {
    const list = Array.isArray(data[key]) ? data[key] : [];
    const ok = list.filter(c => getStatus(c) !== "Offline").length;
    const upper = key.toUpperCase();
    const prefix = upper.replace(/\d+$/, "");
    const suffix = upper.slice(prefix.length);

    const unit = el("article", { class: "unit" });
    unit.append(
      el("div", { class: "unit__head" },
        el("span", { class: "unit__id" },
          el("span", { class: "unit__id-prefix" }, prefix),
          suffix,
        ),
        el("span", { class: "unit__health" }, list.length ? `${ok}/${list.length}` : "—"),
      ),
    );

    const plugs = el("div", { class: "plugs", "data-count": String(Math.max(list.length, 1)) });
    if (list.length === 0) {
      // Show 2 loading shimmer slots
      plugs.append(renderLoadingPlug(), renderLoadingPlug());
    } else {
      list.forEach(ch => plugs.append(renderPlug(key, ch, details[`${key}/${ch.plug}`])));
    }
    unit.append(plugs);
    return unit;
  }

  // ── Aggregate stats ─────────────────────────────────────
  function aggregate(keys) {
    const stats = { total: 0, available: 0, charging: 0, finishing: 0, preparing: 0, offline: 0 };
    keys.forEach(k => {
      const arr = data[k] || [];
      arr.forEach(ch => {
        stats.total++;
        const s = getStatus(ch).toLowerCase();
        if (stats[s] != null) stats[s]++;
      });
    });
    return stats;
  }

  // ── Render: cities ──────────────────────────────────────
  function renderLocationGroup(list, targetEl) {
    const frag = document.createDocumentFragment();
    list.forEach(city => {
      const stats = aggregate(city.keys);

      const head = el("div", { class: "city__head" },
        el("div", { class: "city__name" },
          el("span", { class: "city__name-text" }, city.name),
          city.link && city.link !== "#"
            ? el("a", { class: "city__map", href: city.link, target: "_blank", rel: "noopener noreferrer", html: SVG_MAP, "aria-label": "Abrir no mapa" })
            : null
        ),
        el("div", { class: "city__summary" },
          stats.available
            ? el("span", { class: "city__stat", "data-st": "available", title: "Disponíveis" }, String(stats.available))
            : null,
          stats.charging
            ? el("span", { class: "city__stat", "data-st": "charging", title: "Carregando" }, String(stats.charging))
            : null,
          stats.offline
            ? el("span", { class: "city__stat", "data-st": "offline", title: "Offline" }, String(stats.offline))
            : null,
        ),
      );

      const body = el("div", { class: "city__body" });
      city.keys.forEach(k => body.append(renderUnit(k)));

      frag.append(el("article", { class: "city" }, head, body));
    });
    targetEl.replaceChildren(frag);
  }
  function renderCities() { renderLocationGroup(cities, elLocations); }
  function renderAcGroups() { renderLocationGroup(acGroups, elAcLocations); }

  // ── Render: singles ─────────────────────────────────────
  function renderSingles() {
    const frag = document.createDocumentFragment();
    singles.forEach(s => {
      const isMulti = s.keys.length > 1;
      const allList = s.keys.flatMap(k => data[k] || []);
      const ok = allList.filter(c => getStatus(c) !== "Offline").length;

      const card = el("article", { class: "single" });
      card.append(
        el("div", { class: "single__head" },
          el("div", { class: "single__name" },
            el("span", { class: "single__name-text" }, s.name),
            el("span", { class: "single__id" }, s.keys.map(k => k.toUpperCase()).join(" · ")),
          ),
          el("div", { class: "city__summary" },
            allList.length
              ? el("span", { class: "city__stat", "data-st": "available" }, `${ok}/${allList.length}`)
              : null,
            s.link && s.link !== "#"
              ? el("a", { class: "city__map", href: s.link, target: "_blank", rel: "noopener noreferrer", html: SVG_MAP, "aria-label": "Abrir no mapa" })
              : null,
          ),
        ),
      );

      if (isMulti) {
        // Render each charger unit separately (like a city body)
        s.keys.forEach(k => card.append(renderUnit(k)));
      } else {
        const key = s.keys[0];
        const list = data[key] || [];
        const plugs = el("div", { class: "plugs", "data-count": String(Math.max(list.length, 1)) });
        if (list.length === 0) {
          plugs.append(renderLoadingPlug(), renderLoadingPlug());
        } else {
          list.forEach(ch => plugs.append(renderPlug(key, ch, details[`${key}/${ch.plug}`])));
        }
        card.append(plugs);
      }

      frag.append(card);
    });
    elSingles.replaceChildren(frag);
  }

  // ── Render: timer "há Xs" ──────────────────────────────
  function fmtSince(ms) {
    if (!lastFetchTs) return "esperando dados…";
    const s = Math.floor((Date.now() - lastFetchTs) / 1000);
    if (s < 5) return "agora";
    if (s < 60) return `há ${s}s`;
    if (s < 3600) return `há ${Math.floor(s / 60)}min ${s % 60}s`;
    return `há ${Math.floor(s / 3600)}h`;
  }

  // ── Render: Brasília clock ─────────────────────────────
  function updateClock() {
    const elClock = document.getElementById("clock-time");
    if (!elClock) return;
    const now = new Date();
    const timeStr = now.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    elClock.textContent = timeStr;
  }

  function renderUpdated() {
    elUpdated.textContent = fmtSince();
    const stale = lastFetchTs && (Date.now() - lastFetchTs > REFRESH_MS * 2);
    elLive.classList.toggle("is-stale", !!stale);
    elLive.querySelector(".live-text").textContent = stale ? "PAUSADO" : "AO VIVO";
    updateClock();
  }

  // ── Fetch ───────────────────────────────────────────────
  async function fetchOne(key) {
    try {
      const res = await fetch(`https://api.incharge.app/api/v2/now/${key}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : Array.isArray(json?.chargers) ? json.chargers : [];
      return { key, data: arr, ok: true };
    } catch (err) {
      return { key, data: [], ok: false, err };
    }
  }

  // Detalhe de um plug (bateria %) — endpoint /now/{key}/{plug}
  async function fetchDetail(key, plug) {
    try {
      const res = await fetch(`https://api.incharge.app/api/v2/now/${key}/${plug}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const obj = Array.isArray(json) ? json[0] : json;
      return { key, plug, detail: obj || null, ok: true };
    } catch (err) {
      return { key, plug, detail: null, ok: false };
    }
  }

  // Busca o detalhe de todos os plugs que estão carregando
  async function refreshDetails() {
    const charging = [];
    allKeys.forEach(k => {
      (data[k] || []).forEach(ch => {
        if (getStatus(ch) === "Charging") charging.push({ key: k, plug: ch.plug });
      });
    });
    if (charging.length === 0) { details = {}; return; }

    const results = await Promise.all(charging.map(p => fetchDetail(p.key, p.plug)));
    const next = {};
    results.forEach(r => { if (r.ok && r.detail) next[`${r.key}/${r.plug}`] = r.detail; });
    details = next;
  }

  async function refresh() {
    try {
      const results = await Promise.all(allKeys.map(fetchOne));
      const okCount = results.filter(r => r.ok).length;
      const next = {};
      results.forEach(r => { next[r.key] = r.data; });

      if (okCount === 0) {
        // CORS-locked or offline → fall back to mock so the redesign is reviewable
        if (!usingMock) {
          usingMock = true;
          applyMock();
          showBanner("Visualizando com dados de exemplo — a API real está bloqueada por CORS neste preview.");
        }
      } else {
        usingMock = false;
        data = next;
        lastFetchTs = Date.now();
        hideBanner();
        await refreshDetails();
      }

      renderAll();
      renderUpdated();
    } catch (e) {
      console.error("[INCHARGE] refresh failed", e);
    }
  }

  function renderAll() {
    renderKpis(aggregate(allKeys));
    renderCities();
    renderAcGroups();
    renderSingles();
  }

  // ── Mock data (preview fallback) ───────────────────────
  function applyMock() {
    const statuses = ["Available", "Available", "Available", "Charging", "Charging", "Finishing", "Preparing"];
    const pick = () => statuses[Math.floor(Math.random() * statuses.length)];
    const next = {};
    allKeys.forEach((key, idx) => {
      const isPC = key.startsWith("pc");
      const isSingleton = singles.some(s => s.keys.includes(key) && s.keys.length === 1);
      const n = isSingleton ? (key === "pc106" ? 2 : 1) : (isPC ? 2 : 3);
      const offlineLuck = idx % 11 === 0; // ~9% offline
      next[key] = Array.from({ length: n }, (_, i) => ({
        plug: i + 1,
        status: pick(),
        online: offlineLuck && i === 0 ? 0 : 1,
      }));
    });
    data = next;

    // Detalhes de exemplo (bateria %) para os plugs carregando
    const det = {};
    allKeys.forEach(key => {
      (next[key] || []).forEach(ch => {
        if (ch.online !== 0 && ch.status === "Charging") {
          const k = `${key}/${ch.plug}`;
          const prev = details[k] && Number.isFinite(details[k].percent) ? details[k].percent : 35 + Math.floor(Math.random() * 40);
          const percent = Math.min(100, prev + Math.floor(Math.random() * 4));
          det[k] = {
            percent,
            minutesTo80Percent: Math.max(0, Math.round((80 - percent) / 3)),
            minutesConnected: 5 + Math.floor(Math.random() * 40),
            status: "Charging",
          };
        }
      });
    });
    details = det;
    lastFetchTs = Date.now();
  }

  function showBanner(msg) {
    if (!elBanner) return;
    elBanner.textContent = "";
    elBanner.append(
      el("span", { class: "banner__dot" }),
      el("span", null, msg),
    );
    elBanner.style.display = "flex";
  }
  function hideBanner() { if (elBanner) elBanner.style.display = "none"; }

  // ── Theme ───────────────────────────────────────────────
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("incharge.theme", theme); } catch (_) {}
  }
  function toggleTheme() {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  }
  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem("incharge.theme"); } catch (_) {}
    if (saved === "light" || saved === "dark") applyTheme(saved);
    elBtnTheme && elBtnTheme.addEventListener("click", toggleTheme);
  }

  // ── Boot ────────────────────────────────────────────────
  function boot() {
    initTheme();

    // Start clock immediately
    updateClock();

    // initial paint with placeholders
    renderAll();

    refresh();
    setInterval(refresh, REFRESH_MS);
    setInterval(renderUpdated, TICK_MS);

    // Expose for tweaks panel
    window.__incharge = { refresh, renderAll, refreshDetails };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();