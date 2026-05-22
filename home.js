/* ──────────────────────────────────────────────────────────
   INCHARGE · home.js
   Busca live counts da API e preenche os mini-stats
   dos cards de Eletropostos e Condomínios.
   ────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Chaves dos eletropostos (espelha status/app.js) ─────── */
  const ELET_KEYS = [
    /* Locais principais */
    "inc250","inc251","inc252",
    "inc234","inc235","inc241",
    "inc237","inc238","inc239",
    "inc247","inc248","inc249",
    "pc129","pc130","pc131","pc132",
    /* Unidades individuais */
    "pc025","pc106","pc111","pc112",
  ];

  const TOTAL_CONDOS = 43; // 14 individuais + 29 agrupados

  /* ── Elements ──────────────────────────────────────────── */
  const elEletAvail    = document.getElementById('elet-available');
  const elEletCharging = document.getElementById('elet-charging');
  const elEletOffline  = document.getElementById('elet-offline');
  const elCondoTotal   = document.getElementById('condo-total');

  /* ── Preenche condo total (estático) ─────────────────────── */
  if (elCondoTotal) elCondoTotal.textContent = String(TOTAL_CONDOS);

  /* ── Fetch um endpoint ───────────────────────────────────── */
  async function fetchKey(key) {
    try {
      const res = await fetch(
        `https://api.incharge.app/api/v2/now/${key}`,
        { cache: 'no-store' }
      );
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json
        : Array.isArray(json?.chargers) ? json.chargers
        : [];
    } catch {
      return [];
    }
  }

  function getStatus(ch) {
    if (!ch || ch.online === 0) return 'offline';
    const s = (ch.status || '').toLowerCase();
    if (s === 'available') return 'available';
    if (s === 'charging')  return 'charging';
    if (s === 'finishing') return 'finishing';
    if (s === 'preparing') return 'preparing';
    return 'available';
  }

  /* ── Busca e agrega todos os eletropostos ────────────────── */
  async function loadEletStats() {
    /* Marca como carregando */
    [elEletAvail, elEletCharging, elEletOffline].forEach(el => {
      if (el) el.closest('.pstat')?.classList.add('is-loading');
    });

    const results = await Promise.all(ELET_KEYS.map(fetchKey));

    const stats = { available: 0, charging: 0, offline: 0 };
    let anyData = false;

    results.forEach(plugs => {
      plugs.forEach(ch => {
        anyData = true;
        const st = getStatus(ch);
        if (st === 'available' || st === 'finishing' || st === 'preparing') {
          stats.available++;
        } else if (st === 'charging') {
          stats.charging++;
        } else {
          stats.offline++;
        }
      });
    });

    /* Remove shimmer */
    [elEletAvail, elEletCharging, elEletOffline].forEach(el => {
      if (el) el.closest('.pstat')?.classList.remove('is-loading');
    });

    if (!anyData) {
      /* CORS/offline — sem dados, esconde os stats */
      [elEletAvail, elEletCharging, elEletOffline].forEach(el => {
        if (el?.closest('.pstat')) el.closest('.pstat').style.display = 'none';
      });
      return;
    }

    if (elEletAvail)    elEletAvail.textContent    = String(stats.available);
    if (elEletCharging) elEletCharging.textContent = String(stats.charging);
    if (elEletOffline && stats.offline > 0) {
      elEletOffline.textContent = String(stats.offline);
    } else if (elEletOffline) {
      elEletOffline.closest('.pstat')?.style.setProperty('display', 'none');
    }
  }

  /* ── Boot ────────────────────────────────────────────────── */
  function boot() {
    loadEletStats();
    setInterval(loadEletStats, 60_000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
