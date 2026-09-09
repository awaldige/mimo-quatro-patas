"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface VendaPorDia {
data: string;
pedidos: number;
faturamento: number;
}

interface ProdutoMaisVendido {
produtoId: number;
nome: string;
quantidade: number;
faturamento: number;
}

interface VendaPorPagamento {
pagamento: string;
pedidos: number;
faturamento: number;
}

interface PedidoPorStatus {
status: string;
quantidade: number;
valor: number;
}

interface ProdutoEstoque {
id: number;
nome: string;
estoque: number;
preco: number;
precoPromo: number | null;
categoria: string | null;
}

interface Relatorio {
periodo: {
inicio: string;
fim: string;
};

resumo: {
pedidos: number;
pedidosValidos: number;
pedidosCancelados: number;
faturamento: number;
subtotal: number;
descontos: number;
frete: number;
ticketMedio: number;
quantidadeItensVendidos: number;
};

vendasPorDia: VendaPorDia[];
produtosMaisVendidos: ProdutoMaisVendido[];
vendasPorPagamento: VendaPorPagamento[];
pedidosPorStatus: PedidoPorStatus[];

estoque: {
totalProdutos: number;
produtosSemEstoque: number;
produtosEstoqueBaixo: number;
valorEstimado: number;
produtos: ProdutoEstoque[];
};
}

type Periodo = "7" | "30" | "mes" | "personalizado";

function formatarMoeda(valor: number) {
return valor.toLocaleString("pt-BR", {
style: "currency",
currency: "BRL",
});
}

function formatarData(data: string) {
const [ano, mes, dia] = data.split("-");

return `${dia}/${mes}`;
}

function formatarDataCompleta(data: string) {
return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}

function obterDataLocalISO(data: Date) {
const ano = data.getFullYear();
const mes = String(data.getMonth() + 1).padStart(2, "0");
const dia = String(data.getDate()).padStart(2, "0");

return `${ano}-${mes}-${dia}`;
}

function obterPeriodo(periodo: Periodo) {
const hoje = new Date();

const fim = new Date(hoje);
const inicio = new Date(hoje);

if (periodo === "7") {
inicio.setDate(inicio.getDate() - 6);
}

if (periodo === "30") {
inicio.setDate(inicio.getDate() - 29);
}

if (periodo === "mes") {
inicio.setDate(1);
}

return {
inicio: obterDataLocalISO(inicio),
fim: obterDataLocalISO(fim),
};
}

export default function RelatoriosPage() {
const [relatorio, setRelatorio] = useState<Relatorio | null>(null);

const [periodo, setPeriodo] = useState<Periodo>("30");

const [dataInicio, setDataInicio] = useState("");
const [dataFim, setDataFim] = useState("");

const [carregando, setCarregando] = useState(true);
const [erro, setErro] = useState("");

const [buscaEstoque, setBuscaEstoque] = useState("");

const apiBaseUrl = useMemo(() => {
const rawApiUrl =
process.env.NEXT_PUBLIC_API_URL ||
"http://localhost:3001";


return `${rawApiUrl
  .replace(/\/+$/, "")
  .replace(/\/api$/, "")}/api`;

}, []);

async function carregarRelatorios(
inicio?: string,
fim?: string
) {
try {
setCarregando(true);
setErro("");


  const params = new URLSearchParams();

  if (inicio) {
    params.set("inicio", inicio);
  }

  if (fim) {
    params.set("fim", fim);
  }

  const url = `${apiBaseUrl}/relatorios${
    params.toString()
      ? `?${params.toString()}`
      : ""
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar os relatórios."
    );
  }

  const data: Relatorio = await response.json();

  setRelatorio(data);
} catch (error) {
  console.error(
    "Erro ao carregar relatórios:",
    error
  );

  setErro(
    "Não foi possível carregar os relatórios."
  );
} finally {
  setCarregando(false);
}


}

useEffect(() => {
const periodoInicial = obterPeriodo("30");


setDataInicio(periodoInicial.inicio);
setDataFim(periodoInicial.fim);

carregarRelatorios(
  periodoInicial.inicio,
  periodoInicial.fim
);


}, []);

function aplicarPeriodo(novoPeriodo: Periodo) {
setPeriodo(novoPeriodo);


if (novoPeriodo === "personalizado") {
  return;
}

const datas = obterPeriodo(novoPeriodo);

setDataInicio(datas.inicio);
setDataFim(datas.fim);

carregarRelatorios(
  datas.inicio,
  datas.fim
);


}

function aplicarPeriodoPersonalizado() {
if (!dataInicio || !dataFim) {
setErro(
"Informe a data inicial e a data final."
);


  return;
}

if (dataInicio > dataFim) {
  setErro(
    "A data inicial não pode ser maior que a data final."
  );

  return;
}

carregarRelatorios(
  dataInicio,
  dataFim
);


}

const estoqueFiltrado =
relatorio?.estoque.produtos.filter((produto) =>
produto.nome
.toLowerCase()
.includes(buscaEstoque.toLowerCase())
) || [];

const maiorFaturamento =
Math.max(
...(relatorio?.vendasPorDia.map(
(item) => item.faturamento
) || [0])
) || 1;

const maiorQuantidadeProduto =
Math.max(
...(relatorio?.produtosMaisVendidos.map(
(item) => item.quantidade
) || [0])
) || 1;

function nomePagamento(pagamento: string) {
const nomes: Record<string, string> = {
PIX: "PIX",
CARTAO: "Cartão",
BOLETO: "Boleto",
};


return nomes[pagamento] || pagamento;


}

function nomeStatus(status: string) {
const nomes: Record<string, string> = {
PENDENTE: "Pendente",
PROCESSANDO: "Processando",
ENVIADO: "Enviado",
ENTREGUE: "Entregue",
CANCELADO: "Cancelado",
CONCLUIDO: "Concluído",
};


return nomes[status] || status;


}

function classeStatus(status: string) {
const classes: Record<string, string> = {
PENDENTE:
"bg-yellow-100 text-yellow-700",
PROCESSANDO:
"bg-blue-100 text-blue-700",
ENVIADO:
"bg-purple-100 text-purple-700",
ENTREGUE:
"bg-green-100 text-green-700",
CONCLUIDO:
"bg-green-100 text-green-700",
CANCELADO:
"bg-red-100 text-red-700",
};


return (
  classes[status] ||
  "bg-gray-100 text-gray-700"
);


}

if (carregando && !relatorio) {
return ( <main className="min-h-screen bg-gray-50 p-6"> <div className="mx-auto max-w-7xl"> <div className="flex min-h-[400px] items-center justify-center"> <div className="text-center"> <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />


          <p className="text-gray-600">
            Carregando relatórios...
          </p>
        </div>
      </div>
    </div>
  </main>
);


}

if (erro && !relatorio) {
return ( <main className="min-h-screen bg-gray-50 p-6"> <div className="mx-auto max-w-7xl"> <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"> <h1 className="mb-2 text-xl font-bold text-red-700">
Erro ao carregar relatórios </h1>


        <p className="mb-4 text-red-600">
          {erro}
        </p>

        <button
          onClick={() => {
            const datas = obterPeriodo("30");

            carregarRelatorios(
              datas.inicio,
              datas.fim
            );
          }}
          className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  </main>
);


}

if (!relatorio) {
return null;
}

return ( <main className="min-h-screen bg-gray-50 p-4 md:p-6"> <div className="mx-auto max-w-7xl space-y-6">


    {/* =====================================================
        CABEÇALHO
    ===================================================== */}

    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Relatórios
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Visão geral das vendas, pedidos e estoque.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {carregando && (
            <div className="text-sm text-gray-500">
              Atualizando...
            </div>
          )}

          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
          >
            ← Voltar ao Painel
          </Link>

        </div>
      </div>
    </section>

    {/* =====================================================
        FILTRO DE PERÍODO
    ===================================================== */}

    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">
          Período do relatório
        </h2>

        <p className="text-sm text-gray-500">
          Escolha o período que deseja analisar.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => aplicarPeriodo("7")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            periodo === "7"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Últimos 7 dias
        </button>

        <button
          onClick={() => aplicarPeriodo("30")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            periodo === "30"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Últimos 30 dias
        </button>

        <button
          onClick={() => aplicarPeriodo("mes")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            periodo === "mes"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Este mês
        </button>

        <button
          onClick={() =>
            aplicarPeriodo("personalizado")
          }
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            periodo === "personalizado"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Personalizado
        </button>
      </div>

      {periodo === "personalizado" && (
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Data inicial
            </label>

            <input
              type="date"
              value={dataInicio}
              onChange={(event) =>
                setDataInicio(event.target.value)
              }
              className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Data final
            </label>

            <input
              type="date"
              value={dataFim}
              onChange={(event) =>
                setDataFim(event.target.value)
              }
              className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            />
          </div>

          <button
            onClick={aplicarPeriodoPersonalizado}
            className="rounded-lg bg-gray-900 px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800"
          >
            Aplicar período
          </button>
        </div>
      )}

      <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
        Período analisado:{" "}
        <strong>
          {formatarDataCompleta(
            relatorio.periodo.inicio
          )}
        </strong>{" "}
        até{" "}
        <strong>
          {formatarDataCompleta(
            relatorio.periodo.fim
          )}
        </strong>
      </div>

      {erro && (
        <p className="mt-3 text-sm font-medium text-red-600">
          {erro}
        </p>
      )}
    </section>

    {/* =====================================================
        INDICADORES
    ===================================================== */}

    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">
          Faturamento
        </p>

        <p className="mt-2 text-2xl font-bold text-gray-900">
          {formatarMoeda(
            relatorio.resumo.faturamento
          )}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Pedidos não cancelados
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">
          Pedidos
        </p>

        <p className="mt-2 text-2xl font-bold text-gray-900">
          {relatorio.resumo.pedidos}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {relatorio.resumo.pedidosCancelados} cancelado(s)
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">
          Ticket médio
        </p>

        <p className="mt-2 text-2xl font-bold text-gray-900">
          {formatarMoeda(
            relatorio.resumo.ticketMedio
          )}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Média por pedido válido
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">
          Itens vendidos
        </p>

        <p className="mt-2 text-2xl font-bold text-gray-900">
          {relatorio.resumo.quantidadeItensVendidos}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Unidades vendidas
        </p>
      </div>
    </section>

    {/* =====================================================
        RESUMO FINANCEIRO
    ===================================================== */}

    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">
          Subtotal
        </p>

        <p className="mt-2 text-xl font-bold text-gray-900">
          {formatarMoeda(
            relatorio.resumo.subtotal
          )}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">
          Descontos
        </p>

        <p className="mt-2 text-xl font-bold text-gray-900">
          {formatarMoeda(
            relatorio.resumo.descontos
          )}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">
          Frete
        </p>

        <p className="mt-2 text-xl font-bold text-gray-900">
          {formatarMoeda(
            relatorio.resumo.frete
          )}
        </p>
      </div>
    </section>

    {/* =====================================================
        VENDAS POR DIA
    ===================================================== */}

    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          Vendas por dia
        </h2>

        <p className="text-sm text-gray-500">
          Faturamento diário no período selecionado.
        </p>
      </div>

      {relatorio.vendasPorDia.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
          Nenhuma venda encontrada no período.
        </div>
      ) : (
        <div className="space-y-4">
          {relatorio.vendasPorDia.map((item) => (
            <div
              key={item.data}
              className="grid grid-cols-[70px_1fr_auto] items-center gap-3"
            >
              <span className="text-sm font-medium text-gray-600">
                {formatarData(item.data)}
              </span>

              <div className="h-8 overflow-hidden rounded-lg bg-gray-100">
                <div
                  className="flex h-full items-center rounded-lg bg-gray-800 px-3 text-xs font-semibold text-white transition-all"
                  style={{
                    width: `${Math.max(
                      (item.faturamento /
                        maiorFaturamento) *
                        100,
                      8
                    )}%`,
                  }}
                >
                  {item.pedidos}{" "}
                  {item.pedidos === 1
                    ? "pedido"
                    : "pedidos"}
                </div>
              </div>

              <span className="text-sm font-bold text-gray-900">
                {formatarMoeda(
                  item.faturamento
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>

    {/* =====================================================
        PRODUTOS + PAGAMENTOS
    ===================================================== */}

    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

      {/* PRODUTOS MAIS VENDIDOS */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Produtos mais vendidos
          </h2>

          <p className="text-sm text-gray-500">
            Top 10 produtos do período.
          </p>
        </div>

        {relatorio.produtosMaisVendidos.length ===
        0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
            Nenhum produto vendido no período.
          </div>
        ) : (
          <div className="space-y-4">
            {relatorio.produtosMaisVendidos.map(
              (produto, index) => (
                <div key={produto.produtoId}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
                        {index + 1}
                      </span>

                      <span className="truncate text-sm font-medium text-gray-800">
                        {produto.nome}
                      </span>
                    </div>

                    <span className="shrink-0 text-sm font-bold text-gray-900">
                      {produto.quantidade}
                    </span>
                  </div>

                  <div className="ml-10 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gray-700"
                      style={{
                        width: `${
                          (produto.quantidade /
                            maiorQuantidadeProduto) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <p className="ml-10 mt-1 text-xs text-gray-500">
                    {formatarMoeda(
                      produto.faturamento
                    )}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* FORMAS DE PAGAMENTO */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Formas de pagamento
          </h2>

          <p className="text-sm text-gray-500">
            Distribuição dos pedidos por pagamento.
          </p>
        </div>

        {relatorio.vendasPorPagamento.length ===
        0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
            Nenhuma venda encontrada.
          </div>
        ) : (
          <div className="space-y-4">
            {relatorio.vendasPorPagamento.map(
              (item) => {
                const percentual =
                  relatorio.resumo.pedidosValidos >
                  0
                    ? (item.pedidos /
                        relatorio.resumo
                          .pedidosValidos) *
                      100
                    : 0;

                return (
                  <div key={item.pagamento}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">
                        {nomePagamento(
                          item.pagamento
                        )}
                      </span>

                      <span className="text-sm text-gray-500">
                        {item.pedidos}{" "}
                        {item.pedidos === 1
                          ? "pedido"
                          : "pedidos"}
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gray-800"
                        style={{
                          width: `${percentual}%`,
                        }}
                      />
                    </div>

                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>
                        {percentual.toFixed(1)}%
                      </span>

                      <span>
                        {formatarMoeda(
                          item.faturamento
                        )}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </section>

    {/* =====================================================
        STATUS DOS PEDIDOS
    ===================================================== */}

    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">
          Pedidos por status
        </h2>

        <p className="text-sm text-gray-500">
          Situação dos pedidos no período selecionado.
        </p>
      </div>

      {relatorio.pedidosPorStatus.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
          Nenhum pedido encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {relatorio.pedidosPorStatus.map(
            (item) => (
              <div
                key={item.status}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${classeStatus(
                      item.status
                    )}`}
                  >
                    {nomeStatus(item.status)}
                  </span>

                  <span className="text-lg font-bold text-gray-900">
                    {item.quantidade}
                  </span>
                </div>

                <p className="text-sm text-gray-500">
                  Valor dos pedidos
                </p>

                <p className="mt-1 font-bold text-gray-900">
                  {formatarMoeda(item.valor)}
                </p>
              </div>
            )
          )}
        </div>
      )}
    </section>

    {/* =====================================================
        ESTOQUE
    ===================================================== */}

    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Estoque
          </h2>

          <p className="text-sm text-gray-500">
            Situação atual dos produtos cadastrados.
          </p>
        </div>

        <input
          type="text"
          placeholder="Buscar produto..."
          value={buscaEstoque}
          onChange={(event) =>
            setBuscaEstoque(event.target.value)
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-500 md:w-72"
        />
      </div>

      {/* INDICADORES DE ESTOQUE */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Produtos cadastrados
          </p>

          <p className="mt-1 text-xl font-bold text-gray-900">
            {relatorio.estoque.totalProdutos}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Sem estoque
          </p>

          <p className="mt-1 text-xl font-bold text-red-600">
            {relatorio.estoque.produtosSemEstoque}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Valor estimado
          </p>

          <p className="mt-1 text-xl font-bold text-gray-900">
            {formatarMoeda(
              relatorio.estoque.valorEstimado
            )}
          </p>
        </div>
      </div>

      {/* TABELA */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Produto
              </th>

              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Categoria
              </th>

              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Estoque
              </th>

              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Preço
              </th>

              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Situação
              </th>
            </tr>
          </thead>

          <tbody>
            {estoqueFiltrado.map((produto) => {
              const preco =
                produto.precoPromo ??
                produto.preco;

              let situacao = "Normal";
              let classe =
                "bg-green-100 text-green-700";

              if (produto.estoque <= 0) {
                situacao = "Sem estoque";
                classe =
                  "bg-red-100 text-red-700";
              } else if (
                produto.estoque <= 5
              ) {
                situacao = "Estoque baixo";
                classe =
                  "bg-yellow-100 text-yellow-700";
              }

              return (
                <tr
                  key={produto.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-3 py-4 text-sm font-medium text-gray-900">
                    {produto.nome}
                  </td>

                  <td className="px-3 py-4 text-sm text-gray-600">
                    {produto.categoria || "-"}
                  </td>

                  <td className="px-3 py-4 text-sm font-semibold text-gray-900">
                    {produto.estoque}
                  </td>

                  <td className="px-3 py-4 text-sm text-gray-700">
                    {formatarMoeda(preco)}
                  </td>

                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${classe}`}
                    >
                      {situacao}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {estoqueFiltrado.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Nenhum produto encontrado.
          </div>
        )}
      </div>
    </section>

    {/* =====================================================
        RODAPÉ DO RELATÓRIO
    ===================================================== */}

    <section className="pb-6 text-center text-xs text-gray-400">
      Relatório gerado com dados reais do Mimo Quatro Patas.
    </section>
  </div>
</main>


);
}
