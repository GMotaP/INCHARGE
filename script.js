const locationsContainer = document.getElementById("locations");

const saoJose = ["inc250", "inc251", "inc252"];
const tresCoracoes = ["inc234", "inc235", "inc236"];
const carmopolis = ["inc237", "inc238", "inc239"];
const inCharge = ["inc241"];

const locations = [
  { name: "São José", keys: saoJose },
  { name: "Três Corações", keys: tresCoracoes },
  { name: "Carmópolis", keys: carmopolis },
  { name: "InCharge", keys: inCharge },
];

function getStatusColor(status) {
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
        chargerDiv.style.backgroundColor = getStatusColor(charger.status);
        if (charger.status === "Offline") {
          chargerDiv.style.opacity = "0.5";
        }
        containerInfo.appendChild(chargerDiv);
      });

      cityDiv.appendChild(containerInfo);
    }
  });

  locationsContainer.appendChild(cityDiv);
}

async function getAllData() {
  const urls = [
    { key: "inc250", url: "https://api.incharge.app/api/v2/now/inc250" },
    { key: "inc251", url: "https://api.incharge.app/api/v2/now/inc251" },
    { key: "inc252", url: "https://api.incharge.app/api/v2/now/inc252" },
    { key: "inc234", url: "https://api.incharge.app/api/v2/now/inc234" },
    { key: "inc235", url: "https://api.incharge.app/api/v2/now/inc235" },
    { key: "inc236", url: "https://api.incharge.app/api/v2/now/inc236" },
    { key: "inc237", url: "https://api.incharge.app/api/v2/now/inc237" },
    { key: "inc238", url: "https://api.incharge.app/api/v2/now/inc238" },
    { key: "inc239", url: "https://api.incharge.app/api/v2/now/inc239" },
    { key: "inc241", url: "https://api.incharge.app/api/v2/now/inc241" },
    { key: "inc241", url: "https://api.incharge.app/api/v2/now/inc247" },
    { key: "inc241", url: "https://api.incharge.app/api/v2/now/inc248" },
    { key: "inc241", url: "https://api.incharge.app/api/v2/now/inc249" },
  ];

  const responses = await Promise.all(
    urls.map((item) =>
      fetch(item.url)
        .then((res) => res.json())
        .then((result) => ({ key: item.key, data: result }))
    )
  );

  const data = {};
  responses.forEach((r) => {
    data[r.key] = r.data;
  });

  locations.forEach((loc) => {
    createLocationColumn(loc.name, loc.keys, data);
  });
}

getAllData();
