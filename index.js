/**
 * Atualiza contadores de status (Disponíveis, Em carga, Offline)
 * Estratégias:
 *  1) Tenta JSON em: /status-data.json, /status/status-data.json, /api/status
 *     - Formatos aceitos:
 *         { available: 0, charging: 0, offline: 0 }
 *         ou [{ status: "available"|"charging"|"offline", ...}, ...]
 *  2) Se falhar, busca "status.html" e tenta:
 *       - #count-available, #count-charging, #count-offline
 *       - ou elementos com [data-status="available|charging|offline"]
 */

document.addEventListener("DOMContentLoaded", () => {
  const els = {
    available: document.querySelector(".js-count-available"),
    charging: document.querySelector(".js-count-charging"),
    offline: document.querySelector(".js-count-offline"),
    footer: document.querySelector(".preview-card__footer"),
  };

  const fmt = new Intl.NumberFormat("pt-BR");
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

  function setCounts({ available = 0, charging = 0, offline = 0 }) {
    if (els.available) els.available.textContent = fmt.format(available);
    if (els.charging) els.charging.textContent = fmt.format(charging);
    if (els.offline) els.offline.textContent = fmt.format(offline);
  }

  function setUpdatedNow(ts = Date.now()) {
    if (!els.footer) return;
    const diffMin = Math.round((Date.now() - ts) / 60000);
    els.footer.textContent =
      diffMin === 0 ? "Atualizado agora" : `Atualizado ${rtf.format(-diffMin, "minute")}`;
  }

  async function tryJsonEndpoints() {
    const endpoints = ["/status-data.json", "/status/status-data.json", "/api/status"];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        const data = await res.json();
        // Dois formatos suportados:
        if (Array.isArray(data)) {
          const counts = countFromArray(data);
          return counts;
        } else if (data && typeof data === "object") {
          // normaliza chaves
          const available = num(data.available ?? data.disponiveis ?? data['disponíveis']);
          const charging = num(data.charging ?? data.em_carga ?? data['em_carga'] ?? data['em carga']);
          const offline = num(data.offline ?? data.fault ?? data.inativos ?? data['offline']);
          if ([available, charging, offline].some(n => Number.isFinite(n))) {
            return {
              available: isFinite(available) ? available : 0,
              charging: isFinite(charging) ? charging : 0,
              offline: isFinite(offline) ? offline : 0,
            };
          }
        }
      } catch (e) {
        // ignora e tenta o próximo
        console.debug("[status] Falha no endpoint JSON", url, e);
      }
    }
    return null;
  }

  function num(v) {
    const n = typeof v === "string" ? Number(v.replace(/\D+/g, "")) : Number(v);
    return Number.isFinite(n) ? n : NaN;
  }

  function countFromArray(arr) {
    const norm = (s) => String(s || "").toLowerCase().trim();
    const counts = { available: 0, charging: 0, offline: 0 };
    for (const it of arr) {
      const s = norm(it.status || it.state || it.situacao || it.situação);
      if (s.includes("avail") || s.includes("dispon")) counts.available++;
      else if (s.includes("charg") || s.includes("carga")) counts.charging++;
      else if (s.includes("off") || s.includes("down") || s.includes("falha") || s.includes("offline")) counts.offline++;
    }
    return counts;
  }

  async function tryParseStatusHtml() {
    try {
      const res = await fetch("status.html", { cache: "no-store" });
      if (!res.ok) return null;
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      // 1) IDs explícitos
      const byId = {
        available: doc.querySelector("#count-available"),
        charging: doc.querySelector("#count-charging"),
        offline: doc.querySelector("#count-offline"),
      };
      if (byId.available || byId.charging || byId.offline) {
        return {
          available: num(byId.available?.textContent) || 0,
          charging: num(byId.charging?.textContent) || 0,
          offline: num(byId.offline?.textContent) || 0,
        };
      }

      // 2) data-status
      const items = Array.from(doc.querySelectorAll("[data-status]"));
      if (items.length) {
        const arr = items.map((el) => ({ status: el.getAttribute("data-status") }));
        return countFromArray(arr);
      }

      // 3) classes convencionais
      const arr = [];
      arr.push(...Array.from(doc.querySelectorAll(".status--available")).map(() => ({ status: "available" })));
      arr.push(...Array.from(doc.querySelectorAll(".status--charging")).map(() => ({ status: "charging" })));
      arr.push(...Array.from(doc.querySelectorAll(".status--offline, .status--down, .status--fault")).map(() => ({ status: "offline" })));
      if (arr.length) return countFromArray(arr);

      return null;
    } catch (e) {
      console.debug("[status] Falha ao ler status.html", e);
      return null;
    }
  }

  async function updateCounts() {
    try {
      let counts = await tryJsonEndpoints();
      if (!counts) counts = await tryParseStatusHtml();
      if (!counts) {
        console.warn("[status] Não foi possível obter contadores; mantendo valores atuais.");
        setUpdatedNow(Date.now());
        return;
      }
      setCounts(counts);
      setUpdatedNow(Date.now());
    } catch (e) {
      console.error("[status] Erro ao atualizar contadores", e);
      setUpdatedNow(Date.now());
    }
  }

  // Primeira atualização e refresh a cada 60s
  updateCounts();
  setInterval(updateCounts, 60_000);
});
