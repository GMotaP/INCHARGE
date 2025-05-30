const locationsContainer = document.getElementById("locations");
const updateTimeElement = document.getElementById("last-update");

// Dados dos condomínios
const condominios = [
  { nome: "Edifício Bios Santana", incs: ["INC008"] },
  { nome: "Conjunto Comercial Casablanca", incs: ["INC005", "INC006"] },
  { nome: "Edifício Oiapoque", incs: ["INC015", "INC016", "INC110"] },
  { nome: "Condomínio Palomar", incs: ["INC263"] },
  { nome: "Sky Galleria", incs: ["INC037", "INC038", "INC039"] },
  // Adicione mais conforme desejar
];

function getStatusColor(status, online) {
  if (online === 0) return "black";
  switch (status) {
    case "Available":
      return "#4caf50";
    case "Preparing":
      return "#006400";
    case "Finishing":
      return "#FFFF00";
    case "Charging":
      return "#FF585B";
    default:
      return "#808080";
  }
}

function createLocationColumn(nome, incs, data) {
  const div = document.createElement("div");
  div.className = "city-column";

  const title = document.createElement("h2");
  title.textContent = nome;
  div.appendChild(title);

  incs.forEach((inc) => {
    const subTitle = document.createElement("h3");
    subTitle.className = "titleCidade";
    subTitle.textContent = inc;
    div.appendChild(subTitle);

    if (!data[inc] || data[inc].length === 0) {
      const p = document.createElement("p");
      p.textContent = "Carregando dados...";
      div.appendChild(p);
    } else {
      const containerInfo = document.createElement("div");
      containerInfo.className = "containerInfo";

      data[inc].forEach((plugInfo) => {
        const link = document.createElement("a");
        link.href = `https://incharge.app/now/${inc}/${plugInfo.plug}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const box = document.createElement("div");
        box.className = "chargerInfo";
        box.textContent = `Plug ${plugInfo.plug}`;
        box.style.backgroundColor = getStatusColor(plugInfo.status, plugInfo.online);
        if (plugInfo.online === 0) {
          box.style.opacity = "0.5";
        }

        link.appendChild(box);
        containerInfo.appendChild(link);
      });

      div.appendChild(containerInfo);
    }
  });

  locationsContainer.appendChild(div);
}

function atualizarHorario() {
  const agora = new Date();
  const hora = agora.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const data = agora.toLocaleDateString("pt-BR");
  if (updateTimeElement) {
    updateTimeElement.textContent = `Última atualização: ${data} às ${hora}`;
  }
}

async function getAllData() {
  locationsContainer.innerHTML = "";

  const urls = condominios.flatMap((c) =>
    c.incs.map((key) => ({ key, url: `https://api.incharge.app/api/v2/now/${key}` }))
  );

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

  condominios.forEach((c) => {
    createLocationColumn(c.nome, c.incs, data);
  });

  atualizarHorario();
}

getAllData();
setInterval(getAllData, 30000);
