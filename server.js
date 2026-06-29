// server.js
// Back-end do sistema "Controle Financeiro Inteligente"
// Armazenamento em memória (reinicia ao reiniciar o servidor)

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve o front-end

// ---------------------------------------------------------
// "Banco de dados" em memória
// ---------------------------------------------------------
let gastos = []; // { id, descricao, categoria, valor, data }
let orcamento = 1000; // valor padrão de orçamento mensal
let proximoId = 1;

// ---------------------------------------------------------
// ROTA 1: Cadastrar gasto
// ---------------------------------------------------------
app.post("/api/gastos", (req, res) => {
  const { descricao, categoria, valor, data } = req.body;

  if (!descricao || !categoria || !valor || !data) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
  }

  const novoGasto = {
    id: proximoId++,
    descricao,
    categoria,
    valor: parseFloat(valor),
    data,
  };

  gastos.push(novoGasto);
  res.status(201).json(novoGasto);
});

// ---------------------------------------------------------
// ROTA 2: Listar gastos cadastrados
// ---------------------------------------------------------
app.get("/api/gastos", (req, res) => {
  res.json(gastos);
});

// ---------------------------------------------------------
// ROTA: Excluir gasto
// ---------------------------------------------------------
app.delete("/api/gastos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  gastos = gastos.filter((g) => g.id !== id);
  res.json({ sucesso: true });
});

// ---------------------------------------------------------
// ROTA: Definir/atualizar orçamento mensal
// ---------------------------------------------------------
app.post("/api/orcamento", (req, res) => {
  const { valor } = req.body;
  if (!valor || valor <= 0) {
    return res.status(400).json({ erro: "Valor de orçamento inválido." });
  }
  orcamento = parseFloat(valor);
  res.json({ orcamento });
});

app.get("/api/orcamento", (req, res) => {
  res.json({ orcamento });
});

// ---------------------------------------------------------
// ROTA 3: Análise automática (REGRAS INTELIGENTES)
// ---------------------------------------------------------
app.get("/api/analise", (req, res) => {
  const totalGasto = gastos.reduce((soma, g) => soma + g.valor, 0);

  // Agrupa gastos por categoria
  const porCategoria = {};
  gastos.forEach((g) => {
    porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + g.valor;
  });

  // Agrupa gastos por data (para detectar muitos gastos no mesmo dia)
  const porData = {};
  gastos.forEach((g) => {
    porData[g.data] = (porData[g.data] || 0) + 1;
  });

  const alertas = [];

  // ----------- REGRA INTELIGENTE 1 -----------
  // Se o gasto total ultrapassar o orçamento, exibir alerta.
  if (totalGasto > orcamento) {
    alertas.push({
      tipo: "alerta",
      mensagem: `Alerta: seus gastos totais (R$ ${totalGasto.toFixed(
        2
      )}) ultrapassaram o orçamento definido (R$ ${orcamento.toFixed(2)}).`,
    });
  } else if (totalGasto > orcamento * 0.8) {
    alertas.push({
      tipo: "aviso",
      mensagem: `Atenção: você já utilizou ${(
        (totalGasto / orcamento) *
        100
      ).toFixed(0)}% do seu orçamento mensal.`,
    });
  }

  // ----------- REGRA INTELIGENTE 2 -----------
  // Se uma categoria representar mais de 50% dos gastos, exibir aviso.
  Object.entries(porCategoria).forEach(([categoria, valor]) => {
    const percentual = totalGasto > 0 ? (valor / totalGasto) * 100 : 0;
    if (percentual > 50) {
      alertas.push({
        tipo: "recomendacao",
        mensagem: `Alerta: seus gastos com "${categoria}" representam ${percentual.toFixed(
          0
        )}% do total. Recomenda-se revisar esse tipo de despesa.`,
      });
    }
  });

  // ----------- REGRA INTELIGENTE 3 -----------
  // Se houver muitos gastos pequenos no mesmo dia (3+), exibir recomendação de controle.
  Object.entries(porData).forEach(([data, quantidade]) => {
    if (quantidade >= 3) {
      alertas.push({
        tipo: "recomendacao",
        mensagem: `Recomendação: você registrou ${quantidade} gastos no dia ${data}. Muitos gastos pequenos no mesmo dia podem indicar falta de controle financeiro.`,
      });
    }
  });

  if (alertas.length === 0) {
    alertas.push({
      tipo: "ok",
      mensagem: "Tudo certo! Seus gastos estão dentro do esperado.",
    });
  }

  res.json({
    totalGasto,
    orcamento,
    percentualUsado: orcamento > 0 ? (totalGasto / orcamento) * 100 : 0,
    porCategoria,
    alertas,
  });
});

const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
