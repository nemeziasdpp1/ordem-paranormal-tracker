const personagens = [
  {
    nome: "Dio",
    pv: "20/20",
    san: "15/15",
    pe: "10/10",
    iniciativa: 12
  }
];

const container = document.getElementById("container");

function render() {
  container.innerHTML = "";

  personagens
    .sort((a, b) => b.iniciativa - a.iniciativa)
    .forEach(p => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <strong>${p.nome}</strong><br>
        PV: ${p.pv}<br>
        SAN: ${p.san}<br>
        PE: ${p.pe}<br>
        Iniciativa: ${p.iniciativa}
      `;

      container.appendChild(div);
    });
}

render();
