const locationsContainer = document.getElementById("locations");
const updateTimeElement = document.getElementById("last-update");

const saoJose = ["inc250", "inc251", "inc252"];
const tresCoracoes = ["inc234", "inc235", "inc236"];
const carmopolis = ["inc237", "inc238", "inc239"];
const inCharge = ["inc241"];
const aparecida = ["inc247", "inc248", "inc249"];

const locations = [
  { name: "São José", keys: saoJose },
  { name: "Três Corações", keys: tresCoracoes },
  { name: "Carmópolis", keys: carmopolis },
  { name: "InCharge", keys: inCharge },
  { name: "Aparecida", keys: aparecida },
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

function createLocationColumn(cityName, keys, data) {
  const cityDiv = document.createElement("div");
  cityDiv.className = "city-column";

  const title = document.createElement("h2");
  title.textContent = cityName;
  cityDiv.appendChild(title);

  keys.forEach((key) => {
    const chargerTitle = document.createElement("h3");
    chargerTitle.className = "titleCidade";
    chargerTitle.textContent = key;
    cityDiv.appendChild(chargerTitle);

    if (!data[key] || data[key].length === 0) {
      const p = document.createElement("p");
      p.textContent = "Carregando dados...";
      cityDiv.appendChild(p);
    } else {
      const containerInfo = document.createElement("div");
      containerInfo.className = "containerInfo";

      data[key].forEach((charger) => {
        const chargerDiv = document.createElement("div");
        chargerDiv.className = "chargerInfo";
        chargerDiv.textContent = `Plug ${charger.plug}`;
        chargerDiv.style.backgroundColor = getStatusColor(charger.status, charger.online);
        if (charger.online === 0) {
          chargerDiv.style.opacity = "0.5";
        }
        containerInfo.appendChild(chargerDiv);
      });

      cityDiv.appendChild(containerInfo);
    }
  });

  locationsContainer.appendChild(cityDiv);
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

  const urls = [
    "inc250", "inc251", "inc252",
    "inc234", "inc235", "inc236",
    "inc237", "inc238", "inc239",
    "inc241", "inc247", "inc248", "inc249"
  ].map((key) => ({ key, url: `https://api.incharge.app/api/v2/now/${key}` }));

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

  locations.forEach((loc) => {
    createLocationColumn(loc.name, loc.keys, data);
  });

  atualizarHorario();
}

getAllData();
setInterval(getAllData, 30000);
