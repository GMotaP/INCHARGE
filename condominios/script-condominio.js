const locationsContainer = document.getElementById("locations");
const updateTimeElement = document.getElementById("last-update");
const filterSelect = document.getElementById("condo-filter");

const condominiosIndividuais = [
  { nome: "Cond Iman Vila Mariana", incs: ["INC101", "INC258", "INC243", "INC102"] },
  { nome: "CONDOMINIO EDIFICIO BELLE VILLE", incs: ["INC130", "INC131", "INC170", "INC257"] },
  { nome: "CONDOMINIO EDIFICIO GRAND PRIVILEGE", incs: ["INC181", "INC286", "INC180", "INC179", "INC185", "INC182", "INC183", "INC184", "INC297", "INC262"] },
  { nome: "CONDOMINIO EDIFICIO GRAND STATION", incs: ["INC135", "INC136", "INC265", "INC266"] },
  { nome: "Condomínio Itanhangá Hills", incs: ["INC195", "INC197", "INC294", "INC196", "INC261"] },
  { nome: "CONDOMINIO LAKE - PARQUE IBIRAPUERA", incs: ["INC092", "INC093", "INC094", "INC099"] },
  { nome: "CONDOMINIO RESIDENCIAL AMAVEL", incs: ["INC203", "INC204", "INC302", "INC205", "INC206", "INC253", "INC208", "INC210", "INC219", "INC267", "INC207", "INC209", "INC213", "INC292", "INC211", "INC212", "INC217", "INC216", "INC218", "INC293", "INC214", "INC215"] },
  { nome: "EDIFICIO BRASILIA CELEBRATION", incs: ["INC103", "INC201"] },
  { nome: "EDIFICIO LE PARC ITAIM", incs: ["INC061", "INC062", "INC063", "INC064", "INC065", "INC066", "INC067", "INC068", "INC069", "INC070", "INC071", "INC072", "INC073", "INC074", "INC075", "INC076", "INC077", "INC079", "INC080", "INC081", "INC082", "INC083", "INC084", "INC085", "INC086", "INC087", "INC088", "INC089"] },
  { nome: "EDIFICIO OIAPOQUE", incs: ["INC015", "INC149", "INC159", "INC161", "INC167", "INC175", "INC242", "INC016", "INC110", "INC150", "INC160", "iNC194", "INC246", "INC111", "INC112", "INC113", "INC114", "INC116", "INC115", "INC172", "INC174", "INC169"] },
  { nome: "Edificio Parc Devant", incs: ["INC177", "INC188", "INC199", "INC200", "INC256", "INC176", "INC193", "INC260", "INC259", "INC178", "INC186", "INC187", "INC189", "INC190", "INC191", "INC192", "INC300"] },
  { nome: "ETERN", incs: ["INC221", "INC220", "INC295", "INC284"] },
  { nome: "VILA NOVA RESERVED", incs: ["INC272", "INC271", "INC273", "INC275", "INC276", "INC301", "INC274", "INC277", "INC279", "INC281", "INC278", "IN280"] }
];

const condominiosAgrupados = [
  { nome: "CONDOMINIO DO EDIFICIO BEVERLY HILLS", incs: ["INC019"] },
  { nome: "CONDOMINIO EDIFICIO RESIDENCIAL CEDRO", incs: ["INC156"] },
  { nome: "CONDOMÍNIO EDIFÍCIO VERTIGO", incs: ["INC155"] },
  { nome: "Condomínio Essência da Vila", incs: ["INC224", "INC225", "INC226"] },
  { nome: "Condomínio Meridian Residence", incs: ["INC152"] },
  { nome: "CONDOMÍNIO MIRANTE CLUB STRATÉGIA", incs: ["INC233"] },
  { nome: "CONDOMINIO PALOMAR", incs: ["INC263"] },
  { nome: "CONDOMINIO SINTONIA IBIRAPUERA", incs: ["INC166"] },
  { nome: "CONDOMINIO WOK RESIDENCE", incs: ["INC123", "INC270"] },
  { nome: "EDIFICIO BIOS SANTANA", incs: ["INC008"] },
  { nome: "Edifício Le Rêve Exto", incs: ["INC222", "INC223"] },
  { nome: "INSPIRE IBIRAPUERA", incs: ["INC254", "INC255"] },
  { nome: "INSIGHT VILA LEOPOLDINA", incs: ["INC026", "INC020"] },
  { nome: "Plaza de España", incs: ["INC229", "INC230"] }
];

// guarda o último dataset retornado da API
let ultimoData = {};
// guarda o filtro atual ("all" ou nome do condomínio)
let filtroSelecionado = "all";

function getStatusColor(status, online) {
  if (online === 0) return "black";
  switch (status) {
    case "Available": return "#4caf50";
    case "Preparing": return "#006400";
    case "Finishing": return "#FFFF00";
    case "Charging": return "#FF585B";
    default: return "#808080";
  }
}

function createLocationColumn(nome, incs, data) {
  const div = document.createElement("div");
  div.className = "city-column";

  const title = document.createElement("h2");
  title.textContent = nome;
  div.appendChild(title);

  incs.forEach((inc) => {
    const chargerTitle = document.createElement("h3");
    chargerTitle.className = "titleCidade";
    chargerTitle.textContent = inc.toUpperCase();
    div.appendChild(chargerTitle);

    const chargers = data[inc] || [];
    const containerInfo = document.createElement("div");
    containerInfo.className = "containerInfo";

    if (chargers.length === 0) {
      const p = document.createElement("p");
      p.textContent = "Carregando dados...";
      div.appendChild(p);
    } else {
      chargers.forEach((plugInfo) => {
        const link = document.createElement("a");
        link.href = `https://incharge.app/now/${inc}/${plugInfo.plug}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const chargerDiv = document.createElement("div");
        chargerDiv.className = "chargerInfo";
        chargerDiv.textContent = `Plug ${plugInfo.plug}`;
        chargerDiv.style.backgroundColor = getStatusColor(plugInfo.status, plugInfo.online);
        if (plugInfo.online === 0) {
          chargerDiv.style.opacity = "0.5";
        }

        link.appendChild(chargerDiv);
        containerInfo.appendChild(link);
      });

      div.appendChild(containerInfo);
    }
  });

  locationsContainer.appendChild(div);
}

function createGroupedColumn(grupo, data) {
  const wrapper = document.createElement("div");
  wrapper.className = "city-column";

  grupo.forEach((cond) => {
    const title = document.createElement("h2");
    title.textContent = cond.nome;
    wrapper.appendChild(title);

    cond.incs.forEach((inc) => {
      const chargerTitle = document.createElement("h3");
      chargerTitle.className = "titleCidade";
      chargerTitle.textContent = inc.toUpperCase();
      wrapper.appendChild(chargerTitle);

      const chargers = data[inc] || [];
      const containerInfo = document.createElement("div");
      containerInfo.className = "containerInfo";

      if (chargers.length === 0) {
        const p = document.createElement("p");
        p.textContent = "Carregando dados...";
        wrapper.appendChild(p);
      } else {
        chargers.forEach((plugInfo) => {
          const link = document.createElement("a");
          link.href = `https://incharge.app/now/${inc}/${plugInfo.plug}`;
          link.target = "_blank";
          link.rel = "noopener noreferrer";

          const chargerDiv = document.createElement("div");
          chargerDiv.className = "chargerInfo";
          chargerDiv.textContent = `Plug ${plugInfo.plug}`;
          chargerDiv.style.backgroundColor = getStatusColor(plugInfo.status, plugInfo.online);
          if (plugInfo.online === 0) {
            chargerDiv.style.opacity = "0.5";
          }

          link.appendChild(chargerDiv);
          containerInfo.appendChild(link);
        });

        wrapper.appendChild(containerInfo);
      }
    });
  });

  locationsContainer.appendChild(wrapper);
}

function atualizarHorario() {
  const agora = new Date();
  const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const data = agora.toLocaleDateString("pt-BR");
  if (updateTimeElement) {
    updateTimeElement.textContent = `Última atualização: ${data} às ${hora}`;
  }
}

// popula o <select> com todos os condomínios
function popularFiltro() {
  if (!filterSelect) return;

  // opção "Todos"
  const optTodos = document.createElement("option");
  optTodos.value = "all";
  optTodos.textContent = "Todos os condomínios";
  filterSelect.appendChild(optTodos);

  const optGroupInd = document.createElement("optgroup");
  optGroupInd.label = "Condomínios Individuais";
  condominiosIndividuais.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.nome;
    opt.textContent = c.nome;
    optGroupInd.appendChild(opt);
  });
  filterSelect.appendChild(optGroupInd);

  const optGroupAgr = document.createElement("optgroup");
  optGroupAgr.label = "Condomínios Agrupados";
  condominiosAgrupados.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.nome;
    opt.textContent = c.nome;
    optGroupAgr.appendChild(opt);
  });
  filterSelect.appendChild(optGroupAgr);

  filterSelect.addEventListener("change", () => {
    filtroSelecionado = filterSelect.value;
    renderCondominios();
  });
}

// desenha na tela de acordo com o filtro atual
function renderCondominios() {
  locationsContainer.innerHTML = "";

  if (filtroSelecionado === "all") {
    // visão original: todos os individuais + agrupados juntos
    condominiosIndividuais.forEach((c) => {
      createLocationColumn(c.nome, c.incs, ultimoData);
    });
    createGroupedColumn(condominiosAgrupados, ultimoData);
  } else {
    // tentar achar entre os individuais
    const condIndividual = condominiosIndividuais.find((c) => c.nome === filtroSelecionado);
    if (condIndividual) {
      createLocationColumn(condIndividual.nome, condIndividual.incs, ultimoData);
      return;
    }

    // se não achou, procura entre os agrupados
    const condAgr = condominiosAgrupados.find((c) => c.nome === filtroSelecionado);
    if (condAgr) {
      // passa como array com um só para reutilizar a função
      createGroupedColumn([condAgr], ultimoData);
    }
  }
}

async function getAllData() {
  const allIncs = [...condominiosIndividuais, ...condominiosAgrupados].flatMap((c) => c.incs);
  const urls = allIncs.map((key) => ({
    key,
    url: `https://api.incharge.app/api/v2/now/${key}`
  }));

  const responses = await Promise.all(
    urls.map((item) =>
      fetch(item.url)
        .then((res) => res.json())
        .then((result) => ({ key: item.key, data: result }))
        .catch(() => ({ key: item.key, data: [] }))
    )
  );

  const data = {};
  responses.forEach((r) => {
    data[r.key] = r.data;
  });

  ultimoData = data;
  renderCondominios();
  atualizarHorario();
}

// inicialização
popularFiltro();
getAllData();
setInterval(getAllData, 60000);
