(function () {
  const locationsContainer = document.getElementById("locations");
  const updateTimeElement = document.getElementById("last-update");
  const scaleRoot = document.getElementById("scale-root");

  // Guardas: se algum elemento não existir, loga e aborta
  if (!locationsContainer || !updateTimeElement || !scaleRoot) {
    console.error("[INCHARGE] Elementos base não encontrados.",
      { hasLocations: !!locationsContainer, hasUpdate: !!updateTimeElement, hasScale: !!scaleRoot });
    return;
  }

  /* Locais */
  const saoJose = ["inc250","inc251","inc252"];
  const tresCoracoes = ["inc234","inc235","inc236"];
  const carmopolis = ["inc237","inc238","inc239"];
  const aparecida = ["inc247","inc248","inc249"];
  const paraDeMinas = ["pc111"]; // NOVO
  const santaRita = ["inc241"];
  const itajuba = ["pc106"];
  // AGL removido

  const locations = [
    { name:"São José dos Campos - SP", keys:saoJose, link:"https://www.google.com.br/maps/place/PIT+-+Parque+de+Inovação+Tecnológica+São+José+dos+Campos" },
    { name:"Três Corações - MG", keys:tresCoracoes, link:"https://www.google.com.br/maps/place/Venda+do+Chico+-+Três+Corações" },
    { name:"Carmópolis de Minas - MG", keys:carmopolis, link:"https://www.google.com.br/maps/place/Eletroposto+Carmópolis+de+Minas" },
    { name:"Aparecida - SP", keys:aparecida, link:"https://www.google.com.br/maps/place/Posto+Arco+Íris+Aparecida" },

    // NOVO LOCAL
    { name:"Pará de Minas - MG", keys:paraDeMinas, link:"https://www.google.com.br/maps/place/Pará+de+Minas+MG" },

    {
      group:true,
      name:"Unidades Individuais",
      children:[
        { name:"Santa Rita do Sapucaí - MG", keys:santaRita, link:"https://www.google.com.br/maps/place/INCHARGE+Santa+Rita" },
        { name:"Itajubá - ITACAR", keys:itajuba, link:"https://www.google.com.br/maps/place/Itajubá+ITACAR" }
      ]
    }
  ];

  /* Helpers */
  function getStatusClass(status, online){
    if(online === 0) return "is-offline";
    switch(status){
      case "Available": return "is-available";
      case "Preparing": return "is-preparing";
      case "Finishing": return "is-finishing";
      case "Charging":  return "is-charging";
      default:          return "is-available";
    }
  }

  function getPaymentLink(key, plug){
    const upper = key.toUpperCase();
    if(upper === "PC106")  return `https://pay4charge.com/now/PC106/${plug}`;
    // Mantido por compatibilidade; não é mais usado:
    if(upper === "P4C006") return `https://pay4charge.com/now/P4C006/${plug}`;
    return `https://pay.incharge.app/now/${upper}/${plug}`;
  }

  function createLocationColumn(cityName, keys, data, link){
    const city = document.createElement("div");
    city.className = "city-column";

    const h2 = document.createElement("h2");
    const a = document.createElement("a");
    a.href = link || "#"; a.target="_blank"; a.rel="noopener noreferrer";
    a.textContent = cityName;
    h2.appendChild(a);
    city.appendChild(h2);

    keys.forEach(key=>{
      const t = document.createElement("h3");
      t.className="titleCidade";
      t.textContent = key.toUpperCase();
      city.appendChild(t);

      const container = document.createElement("div");
      container.className = "containerInfo";

      const chargers = Array.isArray(data[key]) ? data[key] : [];

      if (chargers.length === 3) {
        container.classList.add('cols-3');
      }

      if(chargers.length === 0){
        const p = document.createElement("p");
        p.className="loading"; p.textContent="Carregando dados...";
        container.appendChild(p);
      }else{
        chargers.forEach(ch=>{
          const linkA = document.createElement("a");
          linkA.href = getPaymentLink(key, ch.plug);
          linkA.target="_blank"; linkA.rel="noopener noreferrer";

          const item = document.createElement("div");
          item.className = "chargerInfo " + getStatusClass(ch.status, ch.online);
          item.textContent = `Plug ${ch.plug}`;
          if(ch.online === 0) item.style.opacity = "0.6";

          linkA.appendChild(item);
          container.appendChild(linkA);
        });
      }
      city.appendChild(container);
    });

    locationsContainer.appendChild(city);
  }

  function createGroupedColumn(group){
    const col = document.createElement("div");
    col.className="city-column";

    const title = document.createElement("h2");
    title.innerHTML = `<span style="color:#ffffff;background:rgba(255,255,255,.08);padding:6px 12px;border-radius:999px;border:1px dashed rgba(255,255,255,.5)">${group.name}</span>`;
    col.appendChild(title);

    group.children.forEach(loc=>{
      const h2 = document.createElement("h2");
      const a = document.createElement("a");
      a.href = loc.link; a.target="_blank"; a.rel="noopener noreferrer";
      a.textContent = loc.name;
      h2.appendChild(a);
      col.appendChild(h2);

      loc.keys.forEach(key=>{
        const t = document.createElement("h3");
        t.className="titleCidade";
        t.textContent = key.toUpperCase();
        col.appendChild(t);

        const container = document.createElement("div");
        container.className="containerInfo";

        const chargers = Array.isArray(globalData[key]) ? globalData[key] : [];

        if (chargers.length === 3) {
          container.classList.add('cols-3');
        }

        if(chargers.length === 0){
          const p=document.createElement("p"); p.className="loading"; p.textContent="Carregando dados...";
          container.appendChild(p);
        }else{
          chargers.forEach(ch=>{
            const linkA = document.createElement("a");
            linkA.href = getPaymentLink(key, ch.plug);
            linkA.target="_blank"; linkA.rel="noopener noreferrer";

            const item = document.createElement("div");
            item.className = "chargerInfo " + getStatusClass(ch.status, ch.online);
            item.textContent = `Plug ${ch.plug}`;
            if(ch.online === 0) item.style.opacity="0.6";

            linkA.appendChild(item);
            container.appendChild(linkA);
          });
        }
        col.appendChild(container);
      });
    });

    locationsContainer.appendChild(col);
  }

  function atualizarHorario(){
    const agora = new Date();
    const hora = agora.toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const data = agora.toLocaleDateString("pt-BR");
    updateTimeElement.textContent = `Última atualização: ${data} às ${hora}`;
  }

  /* Escala automática para caber no viewport */
  function fitToViewport(){
    scaleRoot.style.transform = `scale(1)`;
    const margin = 8;

    const rect = scaleRoot.getBoundingClientRect();
    const neededH = rect.height;
    const neededW = rect.width;

    const availableH = window.innerHeight - margin;
    const availableW = window.innerWidth - margin;

    let scale = Math.min(1, availableH/neededH, availableW/neededW);
    if(scale < 0.6) scale = 0.6;

    scaleRoot.style.transform = `scale(${scale})`;
  }

  /* Fetch de dados */
  let globalData = {};
  async function getAllData(){
    try {
      locationsContainer.innerHTML = "";

      const allKeys = [
        ...saoJose,
        ...tresCoracoes,
        ...carmopolis,
        ...aparecida,
        ...paraDeMinas, // NOVO
        ...santaRita,
        ...itajuba
      ];

      const urls = allKeys.map(key => ({key, url:`https://api.incharge.app/api/v2/now/${key}`}));

      const responses = await Promise.all(
        urls.map(async (item) => {
          try {
            const res = await fetch(item.url, { cache: "no-store" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            // Esperamos um array; se vier objeto, tente pegar alguma chave comum
            const parsed = Array.isArray(data) ? data : (Array.isArray(data?.chargers) ? data.chargers : []);
            return { key:item.key, data: parsed };
          } catch (err) {
            console.error("[INCHARGE] Falha ao buscar", item.key, err);
            return { key:item.key, data: [] };
          }
        })
      );

      globalData = {};
      responses.forEach(r => { globalData[r.key] = r.data; });

      locations.forEach(loc=>{
        if(loc.group) createGroupedColumn(loc);
        else createLocationColumn(loc.name, loc.keys, globalData, loc.link);
      });

      atualizarHorario();
      fitToViewport();
    } catch (e) {
      console.error("[INCHARGE] Erro inesperado em getAllData()", e);
      locationsContainer.innerHTML = `<div class="loading">Não foi possível carregar os dados agora.</div>`;
    }
  }

  // Init
  getAllData();
  setInterval(getAllData, 30000);
  window.addEventListener('resize', fitToViewport);
})(); 
