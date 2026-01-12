//mapa
const map = L.map("map").setView([-22.9035, -43.2096], 11);
const bikeIcon = L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/icons/bicycle.svg',
    iconSize: [35, 35],
});

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom: 18}).addTo(map);

//DOM
const inputEndereco = document.getElementById("inputEndereco");
const btnBuscar = document.getElementById("btnBuscar");
const botaoQtd = document.getElementById("qtdDropdown");
const itensDropdown = document.querySelectorAll(".dropdown-item");
const listaBicicletarios = document.getElementById("listaBicicletarios");
const buscarTexto = document.getElementById("buscarTexto");
const loadingSpinner = document.getElementById("loadingSpinner");

//variaveis
let bicicletarios = [];
let qtdBicicletarios = 5;
let marcadores = L.layerGroup().addTo(map);

async function carregarBicicletarios() {
    try {
        const dados = await fetch("https://api.citybik.es/bikerio.json").then((dados) => dados.json());
        if(!dados) return null;

        for(let i = 0; i < dados.length; i++){
            let bicicletario = {
                id: dados[i].id,
                name: dados[i].name,
                lat: dados[i].lat / 1000000,
                lng: dados[i].lng / 1000000,
            };
            bicicletarios.push(bicicletario);
        }

    } catch (erro) {
        console.error("erro ao carregar estações:", erro);
    }
}
carregarBicicletarios();

//atualiza a qtd selecionada
function atualizarQtdBicicletarios(e){ //o evento "e" é passado automaticamente quando clica na opção 
    qtdBicicletarios = Number(e.target.textContent);
    botaoQtd.textContent = qtdBicicletarios;
}

for (let i = 0; i < itensDropdown.length; i++) {
    itensDropdown[i].addEventListener("click", atualizarQtdBicicletarios);
}

//verifica se ativa ou nao o botao
function ativarBotaoBuscar(){
    if(inputEndereco.value.trim() === "") btnBuscar.disabled = true;
    else btnBuscar.disabled = false;
}
inputEndereco.addEventListener("input", ativarBotaoBuscar);

//geocodificação do endereço (api do nominatim)
async function geocodificarEndereco(endereco) {
    try {
        const dados = await fetch(`https://nominatim.openstreetmap.org/search?q=${endereco}&format=json&limit=1`).then((dados) => dados.json());
        if (!dados) return null;

        return {
            lat: Number(dados[0].lat),
            lon: Number(dados[0].lon),
            name: dados[0].display_name
        };

    } catch (erro) {
        console.error("erro ao carregar dados:", erro.message);
    }
}

//calcula a distância, fórmula de haversine
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const r = 6371;
    const dLat = (lat2 - lat1) * Math.PI/180;
    const dLon = (lon2 - lon1) * Math.PI/180;

    const lat1Rad = lat1 * Math.PI/180;
    const lat2Rad = lat2 * Math.PI/180;

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return r * c;
}

//display da lista
function renderizarLista(bicicletarios) {
    listaBicicletarios.innerHTML = ""; //limpa os bicicletarios da lista anterior
    for(let i = 0; i < qtdBicicletarios; i++){
        let bicicletario = bicicletarios[i];

        let li = document.createElement("li");
        li.textContent = `• ${bicicletario.name} | ${bicicletario.distancia.toFixed(2)} km`;
        
        listaBicicletarios.appendChild(li);
    }
}

//display dos marcadores
function renderizarMapa(origem, bicicletarios) {
    marcadores.clearLayers();//limpa os marcadores antigos

    L.marker([origem.lat, origem.lon])
        .bindPopup(`<strong>Endereço informado: </strong>${origem.name}`)
        .addTo(marcadores);
        
    for(let i = 0; i < qtdBicicletarios; i++){
        let bicicletario = bicicletarios[i];
        L.marker([bicicletario.lat, bicicletario.lng], { icon: bikeIcon })
            .bindPopup(`<strong>${bicicletario.name}</strong><br> Distância: ${bicicletario.distancia.toFixed(2)} km`)
            .addTo(marcadores);
    }
}

//ao clica no botao de buscar
async function buscar(e) {
    e.preventDefault(); //!!!! impede de recarregar a página, sempre que da submit em um form ele recarrega a pagina

    btnBuscar.disabled = true;
    buscarTexto.textContent = "Carregando...";
    loadingSpinner.classList.remove("d-none");

    let origem = await geocodificarEndereco(inputEndereco.value.trim());
    if (!origem) {
        alert("Endereço não encontrado");
        return;
    }

    let bicicletariosDistancia = [];
    for (let i = 0; i < bicicletarios.length; i++) {
        let bicicletario = bicicletarios[i];
        bicicletariosDistancia.push({
            name: bicicletario.name,
            lat: bicicletario.lat,
            lng: bicicletario.lng,
            distancia: calcularDistancia(origem.lat, origem.lon, bicicletario.lat, bicicletario.lng)
        });
    }

    bicicletariosDistancia.sort((a,b) => a.distancia - b.distancia);
    renderizarLista(bicicletariosDistancia);
    renderizarMapa(origem, bicicletariosDistancia);

    btnBuscar.disabled = false;
    buscarTexto.textContent = "Buscar";
    loadingSpinner.classList.add("d-none");    
}
btnBuscar.addEventListener("click", buscar);