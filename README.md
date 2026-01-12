# 🚲 Bicicletários Rio

Projeto web que permite ao usuário encontrar os bicicletários mais próximos a partir de um endereço informado no Rio de Janeiro.

A aplicação utiliza **Leaflet** para o mapa, **OpenStreetMap** para geocodificação e **CityBikes API** para os dados dos bicicletários,
além de HTML5, CSS, Javascript puro e bootstrap.

---

## Funcionamento

* O usuário digita um endereço
* Escolhe a quantidade de bicicletários a exibir
* Exibe os **mais próximos**, ordenados crescentemente pela distância

---

## 🌍 APIs Utilizadas

### 📌 CityBikes

Responsável por fornecer os dados dos bicicletários do Rio:

```
https://api.citybik.es/bikerio.json
```

### 📌 Nominatim (OpenStreetMap)

Utilizada para converter o endereço informado em latitude e longitude:

```
https://nominatim.openstreetmap.org/search
```

---

## Como Executar o Projeto

1. Clone ou baixe o repositório
2. Rode o arquivo `index.html` através de um servidor local, dica: utilize a extensão Live Server do VSCode
3. Digite um endereço válido no Rio de Janeiro
4. Escolha a quantidade de bicicletários
5. Clique em **Buscar**
