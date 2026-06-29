const API = "http://localhost:3000/api";

let graficoPizza, graficoLinha;

// ---------------------------------------------------------
// Carrega tudo ao abrir a página
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  carregarOrcamento();
  carregarGastos();
  carregarAnalise();
});

// ---------------------------------------------------------
// Cadastrar gasto (envia para o back-end)
// ---------------------------------------------------------
document.getElementById("formGasto").addEventListener("submit", async (e) => {
  e.preventDefault();

  const novoGasto = {
    descricao: document.getElementById("descricao").value,
    categoria: document.getElementById("categoria").value,
    valor: document.getElementById("valor").value,
    data: document.getElementById("data").value,
  };

  await fetch(`${API}/gastos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novoGasto),
  });

  document.getElementById("formGasto").reset();

  carregarGastos();
  carregarAnalise();
});

// ---------------------------------------------------------
// Definir orçamento
// ---------------------------------------------------------
async function definirOrcamento() {
  const valor = document.getElementById("inputOrcamento").value;
  if (!valor) return;

  await fetch(`${API}/orcamento`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ valor }),
  });

  carregarOrcamento();
  carregarAnalise();
}

async function carregarOrcamento() {
  const res = await fetch(`${API}/orcamento`);
  const data = await res.json();
  document.getElementById("orcamentoAtual").textContent =
    "R$ " + data.orcamento.toFixed(2);
}

// ---------------------------------------------------------
// Listar gastos cadastrados (tabela)
// ---------------------------------------------------------
async function carregarGastos() {
  const res = await fetch(`${API}/gastos`);
  const gastos = await res.json();

  const tbody = document.querySelector("#tabelaGastos tbody");
  tbody.innerHTML = "";

  gastos.forEach((g) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${g.descricao}</td>
      <td>${g.categoria}</td>
      <td>R$ ${g.valor.toFixed(2)}</td>
      <td>${g.data}</td>
      <td><button class="btn-excluir" onclick="excluirGasto(${g.id})">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });

  atualizarGraficoLinha(gastos);
}

async function excluirGasto(id) {
  await fetch(`${API}/gastos/${id}`, { method: "DELETE" });
  carregarGastos();
  carregarAnalise();
}

// ---------------------------------------------------------
// Buscar análise automática (regras inteligentes + categorias)
// ---------------------------------------------------------
async function carregarAnalise() {
  const res = await fetch(`${API}/analise`);
  const analise = await res.json();

  document.getElementById("totalGasto").textContent =
    "R$ " + analise.totalGasto.toFixed(2);
  document.getElementById("percentualUsado").textContent =
    analise.percentualUsado.toFixed(0) + "%";

  // Renderiza alertas inteligentes
  const divAlertas = document.getElementById("alertas");
  divAlertas.innerHTML = "";
  analise.alertas.forEach((a) => {
    const div = document.createElement("div");
    div.className = `alerta-item ${a.tipo}`;
    div.textContent = a.mensagem;
    divAlertas.appendChild(div);
  });

  atualizarGraficoPizza(analise.porCategoria);
}

// ---------------------------------------------------------
// GRÁFICO 1: Pizza - Gastos por categoria
// ---------------------------------------------------------
function atualizarGraficoPizza(porCategoria) {
  const ctx = document.getElementById("graficoPizza");
  const labels = Object.keys(porCategoria);
  const valores = Object.values(porCategoria);

  if (graficoPizza) graficoPizza.destroy();

  graficoPizza = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: valores,
          backgroundColor: [
            "#2563eb", "#f59e0b", "#ef4444", "#22c55e",
            "#a855f7", "#06b6d4", "#f97316",
          ],
        },
      ],
    },
    options: { responsive: true },
  });
}

// ---------------------------------------------------------
// GRÁFICO 2: Linha - Evolução dos gastos ao longo do tempo
// ---------------------------------------------------------
function atualizarGraficoLinha(gastos) {
  const ctx = document.getElementById("graficoLinha");

  // Agrupa e ordena por data
  const porData = {};
  gastos.forEach((g) => {
    porData[g.data] = (porData[g.data] || 0) + g.valor;
  });
  const datasOrdenadas = Object.keys(porData).sort();
  const valores = datasOrdenadas.map((d) => porData[d]);

  if (graficoLinha) graficoLinha.destroy();

  graficoLinha = new Chart(ctx, {
    type: "line",
    data: {
      labels: datasOrdenadas,
      datasets: [
        {
          label: "Gastos (R$)",
          data: valores,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.15)",
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: { responsive: true },
  });
}
