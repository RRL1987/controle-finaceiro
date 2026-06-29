# Controle Financeiro Inteligente

Sistema completo (front-end + back-end) para registrar gastos, definir orçamento
e receber alertas/recomendações automáticas, com gráficos.

## Como executar

1. Tenha o Node.js instalado (https://nodejs.org).
2. Abra um terminal nesta pasta.
3. Instale as dependências:
   ```
   npm install
   ```
4. Inicie o servidor:
   ```
   npm start
   ```
5. Abra o navegador em: **http://localhost:3000**

(O próprio Express já serve o front-end junto com o back-end, então não precisa
abrir o `index.html` separadamente.)

## Estrutura do projeto

```
controle-financeiro/
├── server.js          -> back-end (Express)
├── package.json
└── public/
    ├── index.html      -> tela principal (front-end)
    ├── style.css
    └── script.js       -> comunicação com o back-end + gráficos
```

## Rotas do back-end

| Método | Rota              | Função                                   |
|--------|-------------------|-------------------------------------------|
| POST   | /api/gastos       | Cadastra um novo gasto                    |
| GET    | /api/gastos       | Lista todos os gastos cadastrados         |
| DELETE | /api/gastos/:id   | Remove um gasto                           |
| POST   | /api/orcamento    | Define/atualiza o orçamento mensal        |
| GET    | /api/orcamento    | Retorna o orçamento atual                 |
| GET    | /api/analise      | Retorna a análise automática (regras)     |

## Regras inteligentes implementadas

1. **Orçamento ultrapassado:** se o total gasto > orçamento → alerta vermelho.
   (E se passar de 80% do orçamento → aviso amarelo preventivo.)
2. **Categoria dominante:** se uma categoria representa mais de 50% dos gastos
   totais → recomendação para revisar aquele tipo de despesa.
3. **Muitos gastos no mesmo dia:** se houver 3 ou mais gastos registrados na
   mesma data → recomendação de controle financeiro (possível compra impulsiva).

## Gráficos gerados

1. **Gráfico de pizza** — gastos por categoria.
2. **Gráfico de linha** — evolução dos gastos ao longo do tempo (por data).

## Observações

- Os dados ficam armazenados em **memória** (zeram ao reiniciar o servidor),
  conforme permitido pelo enunciado do trabalho.
- O front-end (HTML/CSS/JS) se comunica com o back-end via **fetch()**
  fazendo requisições HTTP (GET/POST/DELETE) para a API em `http://localhost:3000/api`.
