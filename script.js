const locationsContainer = document.getElementById("locations");
const updateTimeElement = document.getElementById("last-update");

const saoJose = ["inc250", "inc251", "inc252"];
const tresCoracoes = ["inc234", "inc235", "inc236"];
const carmopolis = ["inc237", "inc238", "inc239"];
const inCharge = ["inc241"];
const aparecida = ["inc247", "inc248", "inc249"];
const agl = ["p4c006"];

const locations = [
  { name: "Carregador AGL - P4C006", keys: agl, link: "" },
  { name: "São José dos Campos - SP", keys: saoJose, link: "https://www.google.com.br/maps/place/PIT+-+Parque+de+Inova%C3%A7%C3%A3o+Tecnol%C3%B3gica+S%C3%A3o+Jos%C3%A9+dos+Campos/@-23.1554384,-45.7907483,283m/data=!3m1!1e3!4m6!3m5!1s0x94cc4c345d24cd69:0x3baf325177feb8a0!8m2!3d-23.1553507!4d-45.7902501!16s%2Fg%2F1tgk1rrr" },
  { name: "Três Corações - MG", keys: tresCoracoes, link: "https://www.google.com.br/maps/place/Esta%C3%A7%C3%A3o+de+recarga+de+ve%C3%ADculos+el%C3%A9tricos/@-21.6057204,-45.2401907,52m/data=!3m1!1e3!4m14!1m7!3m6!1s0x94cac2ccf68e4623:0x4d860ff3d588f9e4!2sVenda+do+Chico+-+Restaurante+e+Lanchonete!8m2!3d-21.6052765!4d-45.2404193!16s%2Fg%2F1q2w4kfg_" },
  { name: "Carmópolis de Minas - MG", keys: carmopolis, link: "https://www.google.com.br/maps/place/INCHARGE+Esta%C3%A7%C3%A3o+de+Carregamento/@-20.5065926,-44.6093689,100m" },
  { name: "Aparecida - SP", keys: aparecida, link: "https://www.google.com.br/maps/place/Eletroposto+Posto+Arco+Iris+Aparecida/@-22.8743063,-45.2656434,60m" },
  { name: "Santa Rita do Sapucaí - MG", keys: inCharge, link: "https://www.google.com.br/maps/place/INCHARGE/@-22.25777,-45.6949433,174m" }
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

function createLocationColumn(cityName, keys, data, link) {
  const cityDiv = document.createElement("div");
  cityDiv.className = "city-column";

  const title = document.createElement("h2");
  const linkElement = document.createElement("a");
  linkElement.href = link || "#";
  linkElement.textContent = cityName;
  linkElement.target = "_blank";
  linkElement.rel = "noopener noreferrer";
  linkElement.style.color = "red";
  linkElement.style.textDecoration = "none";
  title.appendChild(linkElement);
  cityDiv.appendChild(title);

  keys.forEach((key) => {
    const chargerTitle = document.createElement("h3");
    chargerTitle.className = "titleCidade";
    chargerTitle.textContent = key.toUpperCase();
    cityDiv.appendChild(chargerTitle);

    if (!data[key] || data[key].length === 0) {
      const p = document.createElement("p");
      p.textContent = "Carregando dados...";
      cityDiv.appendChild(p);
    } else {
      const containerInfo = document.createElement("div");
      containerInfo.className = "containerInfo";

      data[key].forEach((charger) => {
        const link = document.createElement("a");
        link.href = `https://incharge.app/now/${key}/${charger.plug}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const chargerDiv = document.createElement("div");
        chargerDiv.className = "chargerInfo";
        chargerDiv.textContent = `Plug ${charger.plug}`;
        chargerDiv.style.backgroundColor = getStatusColor(charger.status, charger.online);
        if (charger.online === 0) {
          chargerDiv.style.opacity = "0.5";
        }

        link.appendChild(chargerDiv);
        containerInfo.appendChild(link);
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
    "inc247", "inc248", "inc249",
    "inc241", "p4c006" // AGL
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
    createLocationColumn(loc.name, loc.keys, data, loc.link);
  });

  atualizarHorario();
}

getAllData();
setInterval(getAllData, 30000);
