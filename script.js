const locationsContainer = document.getElementById("locations");
const updateTimeElement = document.getElementById("last-update");

// Definição dos carregadores por localidade
const saoJose = ["inc250", "inc251", "inc252"];
const tresCoracoes = ["inc234", "inc235", "inc236"];
const carmopolis = ["inc237", "inc238", "inc239"];
const aparecida = ["inc247", "inc248", "inc249"];
const santaRita = ["inc241"];
const itajuba = ["pc106"];
const divinopolis = ["p4c006"];

// Estrutura com nomes e links de cada local
const locations = [
  { name: "São José dos Campos - SP", keys: saoJose, link: "https://www.google.com.br/maps/place/PIT+-+Parque+de+Inovação+Tecnológica+São+José+dos+Campos" },
  { name: "Três Corações - MG", keys: tresCoracoes, link: "https://www.google.com.br/maps/place/Venda+do+Chico+-+Três+Corações" },
  { name: "Carmópolis de Minas - MG", keys: carmopolis, link: "https://www.google.com.br/maps/place/Eletroposto+Carmópolis+de+Minas" },
  { name: "Aparecida - SP", keys: aparecida, link: "https://www.google.com.br/maps/place/Posto+Arco+Íris+Aparecida" },
  {
    group: true,
    name: "Unidades Individuais",
    children: [
      { name: "Santa Rita do Sapucaí - MG", keys: santaRita, link: "https://www.google.com.br/maps/place/INCHARGE+Santa+Rita" },
      { name: "Itajubá - ITACAR", keys: itajuba, link: "https://www.google.com.br/maps/place/Itajubá+ITACAR" },
      { name: "Divinópolis - AGL", keys: divinopolis, link: "https://www.google.com.br/maps/place/Divinópolis+AGL" }
    ]
  }
];

// Define a cor de fundo conforme o status do carregador
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

// Gera o link de pagamento conforme a localidade (exceções Itajubá e Divinópolis)
function getPaymentLink(key, plug) {
  const upperKey = key.toUpperCase();
  if (upperKey === "PC106") {
    // Itajubá (ITACAR)
    return `https://pay4charge.com/now/PC106/${plug}`;
  }
  if (upperKey === "P4C006") {
    // Divinópolis (AGL) → ID padronizado no pay4charge é PC006
    return `https://pay4charge.com/now/PC006/${plug}`;
  }
  // Demais continuam no Pay Incharge
  return `https://pay.incharge.app/now/${upperKey}/${plug}`;
}

// Cria coluna de carregadores para cidades comuns (não agrupadas)
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

    const chargers = data[key] || [];
    const containerInfo = document.createElement("div");
    containerInfo.className = "containerInfo";

    if (chargers.length === 0) {
      const p = document.createElement("p");
      p.textContent = "Carregando dados...";
      cityDiv.appendChild(p);
    } else {
      chargers.forEach((charger) => {
        const linkA = document.createElement("a");
        linkA.href = getPaymentLink(key, charger.plug);
        linkA.target = "_blank";
        linkA.rel = "noopener noreferrer";

        const chargerDiv = document.createElement("div");
        chargerDiv.className = "chargerInfo";
        chargerDiv.textContent = `Plug ${charger.plug}`;
        chargerDiv.style.backgroundColor = getStatusColor(charger.status, charger.online);
        if (charger.online === 0) {
          chargerDiv.style.opacity = "0.5";
        }

        linkA.appendChild(chargerDiv);
        containerInfo.appendChild(linkA);
      });

      cityDiv.appendChild(containerInfo);
    }
  });

  locationsContainer.appendChild(cityDiv);
}

// Cria colunas agrupadas (ex: Unidades Individuais)
function createGroupedColumn(group) {
  const wrapper = document.createElement("div");
  wrapper.className = "city-column";

  group.children.forEach((loc) => {
    const title = document.createElement("h2");
    const linkElement = document.createElement("a");
    linkElement.href = loc.link;
    linkElement.textContent = loc.name;
    linkElement.target = "_blank";
    linkElement.rel = "noopener noreferrer";
    linkElement.style.color = "red";
    linkElement.style.textDecoration = "none";
    title.appendChild(linkElement);
    wrapper.appendChild(title);

    loc.keys.forEach((key) => {
      const chargerTitle = document.createElement("h3");
      chargerTitle.className = "titleCidade";
      chargerTitle.textContent = key.toUpperCase();
      wrapper.appendChild(chargerTitle);

      const chargers = globalData[key] || [];
      const containerInfo = document.createElement("div");
      containerInfo.className = "containerInfo";

      if (chargers.length === 0) {
        const p = document.createElement("p");
        p.textContent = "Carregando dados...";
        wrapper.appendChild(p);
      } else {
        chargers.forEach((charger) => {
          const linkA = document.createElement("a");
          linkA.href = getPaymentLink(key, charger.plug);
          linkA.target = "_blank";
          linkA.rel = "noopener noreferrer";

          const chargerDiv = document.createElement("div");
          chargerDiv.className = "chargerInfo";
          chargerDiv.textContent = `Plug ${charger.plug}`;
          chargerDiv.style.backgroundColor = getStatusColor(charger.status, charger.online);
          if (charger.online === 0) {
            chargerDiv.style.opacity = "0.5";
          }

          linkA.appendChild(chargerDiv);
          containerInfo.appendChild(linkA);
        });

        wrapper.appendChild(containerInfo);
      }
    });
  });

  locationsContainer.appendChild(wrapper);
}

let globalData = {};

// Atualiza o horário de última atualização
function atualizarHorario() {
  const agora = new Date();
  const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const data = agora.toLocaleDateString("pt-BR");
  if (updateTimeElement) {
    updateTimeElement.textContent = `Última atualização: ${data} às ${hora}`;
  }
}

// Busca dados de todos os carregadores
async function getAllData() {
  locationsContainer.innerHTML = "";

  const allKeys = [
    ...saoJose, ...tresCoracoes, ...carmopolis, ...aparecida,
    ...santaRita, ...itajuba, ...divinopolis
  ];

  const urls = allKeys.map((key) => ({
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

  globalData = {};
  responses.forEach((r) => {
    globalData[r.key] = r.data;
  });

  locations.forEach((loc) => {
    if (loc.group) {
      createGroupedColumn(loc);
    } else {
      createLocationColumn(loc.name, loc.keys, globalData, loc.link);
    }
  });

  atualizarHorario();
}

// Inicia o carregamento e atualiza a cada 30 segundos
getAllData();
setInterval(getAllData, 30000);
