(function () {
  const locationsContainer = document.getElementById("locations");
  const secondaryContainer = document.getElementById("locations-secondary");
  const updateTimeElement = document.getElementById("last-update");
  const scaleRoot = document.getElementById("scale-root");

  if (!locationsContainer || !secondaryContainer || !updateTimeElement || !scaleRoot) {
    console.error("[INCHARGE] Elementos base não encontrados.", {
      hasLocations: !!locationsContainer,
      hasSecondary: !!secondaryContainer,
      hasUpdate: !!updateTimeElement,
      hasScale: !!scaleRoot,
    });
    return;
  }

  const saoJose = ["inc250", "inc251", "inc252"];
  const tresCoracoes = ["inc234", "inc235", "inc241"];
  const carmopolis = ["inc237", "inc238", "inc239"];
  const aparecida = ["inc247", "inc248", "inc249"];
  const scherer = ["pc129", "pc130", "pc131", "pc132"];

  const santaRita = ["pc025"];
  const itajuba = ["pc106"];
  const paraDeMinas = ["pc111"];
  const campoBelo = ["pc112"];

  const locations = [
    {
      name: "São José dos Campos - SP",
      keys: saoJose,
      link: "https://www.google.com.br/maps/place/PIT+-+Parque+de+Inovação+Tecnológica+São+José+dos+Campos",
    },
    {
      name: "Três Corações - MG",
      keys: tresCoracoes,
      link: "https://www.google.com.br/maps/place/Venda+do+Chico+-+Três+Corações",
    },
    {
      name: "Carmópolis de Minas - MG",
      keys: carmopolis,
      link: "https://www.google.com.br/maps/place/Eletroposto+Carmópolis+de+Minas",
    },
    {
      name: "Aparecida - SP",
      keys: aparecida,
      link: "https://www.google.com.br/maps/place/Posto+Arco+Íris+Aparecida",
    },
    {
      name: "Scherer carregadores",
      keys: scherer,
      link: "#",
    },
  ];

  const singleUnits = {
    groupName: "Unidades Individuais",
    children: [
      {
        name: "Santa Rita do Sapucaí - MG",
        keys: santaRita,
        link: "https://www.google.com.br/maps/place/INCHARGE+Santa+Rita",
      },
      {
        name: "Itajubá - ITACAR",
        keys: itajuba,
        link: "https://www.google.com.br/maps/place/Itajubá+ITACAR",
      },
      {
        name: "Pará de Minas - MG",
        keys: paraDeMinas,
        link: "https://www.google.com.br/maps/place/Pará+de+Minas+MG",
      },
      {
        name: "Campo Belo - MG (Impacto Energia Solar)",
        keys: campoBelo,
        link: "https://www.google.com.br/maps/place/Campo+Belo+MG",
      },
    ],
  };

  function getStatusClass(status, online) {
    if (online === 0) return "is-offline";
    switch (status) {
      case "Available":
        return "is-available";
      case "Preparing":
        return "is-preparing";
      case "Finishing":
        return "is-finishing";
      case "Charging":
        return "is-charging";
      default:
        return "is-available";
    }
  }

  function getPaymentLink(key, plug) {
    const upper = key.toUpperCase();
    if (upper === "PC106") return `https://pay4charge.com/now/PC106/${plug}`;
    if (upper === "P4C006") return `https://pay4charge.com/now/P4C006/${plug}`;
    return `https://pay.incharge.app/now/${upper}/${plug}`;
  }

  function createChargerContainer(key, data) {
    const container = document.createElement("div");
    container.className = "containerInfo";

    const chargers = Array.isArray(data[key]) ? data[key] : [];

    if (chargers.length === 3) {
      container.classList.add("cols-3");
    }

    if (chargers.length === 0) {
      const p = document.createElement("p");
      p.className = "loading";
      p.textContent = "Carregando dados...";
      container.appendChild(p);
      return container;
    }

    chargers.forEach((ch) => {
      const linkA = document.createElement("a");
      linkA.href = getPaymentLink(key, ch.plug);
      linkA.target = "_blank";
      linkA.rel = "noopener noreferrer";

      const item = document.createElement("div");
      item.className = `chargerInfo ${getStatusClass(ch.status, ch.online)}`;
      item.textContent = `Plug ${ch.plug}`;
      if (ch.online === 0) item.style.opacity = "0.6";

      linkA.appendChild(item);
      container.appendChild(linkA);
    });

    return container;
  }

  function createLocationColumn(cityName, keys, data, link) {
    const city = document.createElement("article");
    city.className = "city-column";

    const h2 = document.createElement("h2");
    const a = document.createElement("a");
    a.href = link || "#";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = cityName;
    h2.appendChild(a);
    city.appendChild(h2);

    keys.forEach((key) => {
      const title = document.createElement("h3");
      title.className = "titleCidade";
      title.textContent = key.toUpperCase();
      city.appendChild(title);
      city.appendChild(createChargerContainer(key, data));
    });

    locationsContainer.appendChild(city);
  }

  function createSingleUnitsRow(group, data) {
    secondaryContainer.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "singles-wrapper";

    const title = document.createElement("h2");
    title.className = "singles-title";
    title.textContent = group.groupName;
    wrapper.appendChild(title);

    const row = document.createElement("div");
    row.className = "singles-row";

    group.children.forEach((loc) => {
      const card = document.createElement("article");
      card.className = "single-card";

      const h3 = document.createElement("h3");
      const a = document.createElement("a");
      a.href = loc.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = loc.name;
      h3.appendChild(a);
      card.appendChild(h3);

      loc.keys.forEach((key) => {
        const code = document.createElement("p");
        code.className = "titleCidade";
        code.textContent = key.toUpperCase();
        card.appendChild(code);
        card.appendChild(createChargerContainer(key, data));
      });

      row.appendChild(card);
    });

    wrapper.appendChild(row);
    secondaryContainer.appendChild(wrapper);
  }

  function atualizarHorario() {
    const agora = new Date();
    const hora = agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const data = agora.toLocaleDateString("pt-BR");
    updateTimeElement.textContent = `Última atualização: ${data} às ${hora}`;
  }

  function fitToViewport() {
    scaleRoot.style.transform = "scale(1)";
    const margin = 8;

    const rect = scaleRoot.getBoundingClientRect();
    const neededH = rect.height;
    const neededW = rect.width;

    const availableH = window.innerHeight - margin;
    const availableW = window.innerWidth - margin;

    let scale = Math.min(1, availableH / neededH, availableW / neededW);
    if (scale < 0.6) scale = 0.6;

    scaleRoot.style.transform = `scale(${scale})`;
  }

  let globalData = {};

  async function getAllData() {
    try {
      locationsContainer.innerHTML = "";
      secondaryContainer.innerHTML = "";

      const allKeys = [
        ...saoJose,
        ...tresCoracoes,
        ...carmopolis,
        ...aparecida,
        ...scherer,
        ...santaRita,
        ...itajuba,
        ...paraDeMinas,
        ...campoBelo,
      ];

      const urls = allKeys.map((key) => ({
        key,
        url: `https://api.incharge.app/api/v2/now/${key}`,
      }));

      const responses = await Promise.all(
        urls.map(async (item) => {
          try {
            const res = await fetch(item.url, { cache: "no-store" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const parsed = Array.isArray(data)
              ? data
              : Array.isArray(data?.chargers)
                ? data.chargers
                : [];
            return { key: item.key, data: parsed };
          } catch (err) {
            console.error("[INCHARGE] Falha ao buscar", item.key, err);
            return { key: item.key, data: [] };
          }
        })
      );

      globalData = {};
      responses.forEach((result) => {
        globalData[result.key] = result.data;
      });

      locations.forEach((loc) => {
        createLocationColumn(loc.name, loc.keys, globalData, loc.link);
      });

      createSingleUnitsRow(singleUnits, globalData);

      atualizarHorario();
      fitToViewport();
    } catch (e) {
      console.error("[INCHARGE] Erro inesperado em getAllData()", e);
      locationsContainer.innerHTML = '<div class="loading">Não foi possível carregar os dados agora.</div>';
    }
  }

  getAllData();
  setInterval(getAllData, 30000);
  window.addEventListener("resize", fitToViewport);
})();