"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Produto {
  id: number;
  nome: string;
  imagem?: string | null;
}

interface Fornecedor {
  id: number;
  nome: string;
  empresa?: string | null;
  email?: string | null;
  telefone?: string | null;
  site?: string | null;
}

interface PedidoItem {
  id: number;
  produtoId: number;
  nomeProduto: string;
  preco: string | number;
  quantidade: number;
  produto?: Produto | null;

  fornecedorId?: number | null;
  fornecedorNome?: string | null;
  skuFornecedor?: string | null;
  custoFornecedor?: string | number | null;
  linkFornecedor?: string | null;

  statusFornecedor?: string | null;
  numeroPedidoFornecedor?: string | null;

  dataEncaminhamento?: string | null;
  dataPedidoFornecedor?: string | null;
  dataEnvioFornecedor?: string | null;
  dataEntregaFornecedor?: string | null;

  fornecedor?: Fornecedor | null;
}

interface Pedido {
  id: number;
  nomeCliente: string;
  email: string;
  telefone: string;

  cep: string;
  estado: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;

  subtotal: string | number;
  frete: string | number;
  total: string | number;

  pagamento: string;
  status: string;

  itens: PedidoItem[];

  createdAt: string;
  updatedAt: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const STATUS_PEDIDO = [
  "PENDENTE",
  "PAGO",
  "PROCESSANDO",
  "ENVIADO",
  "ENTREGUE",
  "CANCELADO",
];

const STATUS_FORNECEDOR = [
  "AGUARDANDO_FORNECEDOR",
  "ENCAMINHADO_FORNECEDOR",
  "PEDIDO_FORNECEDOR_REALIZADO",
  "AGUARDANDO_ENVIO",
  "ENVIADO",
  "ENTREGUE",
];

function formatarMoeda(valor: string | number | null | undefined) {
  const numero = Number(valor);

  if (Number.isNaN(numero)) {
    return "R$ 0,00";
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data: string | null | undefined) {
  if (!data) return "-";

  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return "-";
  }

  return dataConvertida.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatarPagamento(pagamento: string) {
  switch (pagamento) {
    case "PIX":
      return "PIX";

    case "CARTAO":
      return "Cartão";

    case "BOLETO":
      return "Boleto";

    default:
      return pagamento;
  }
}

function obterClasseStatus(status: string) {
  switch (status) {
    case "PENDENTE":
      return "bg-yellow-100 text-yellow-800";

    case "PAGO":
      return "bg-blue-100 text-blue-800";

    case "PROCESSANDO":
      return "bg-purple-100 text-purple-800";

    case "ENVIADO":
      return "bg-indigo-100 text-indigo-800";

    case "ENTREGUE":
      return "bg-green-100 text-green-800";

    case "CANCELADO":
      return "bg-red-100 text-red-800";

    default:
      return "bg-gray-100 text-gray-800";
  }
}

function obterClasseStatusFornecedor(status: string) {
  switch (status) {
    case "AGUARDANDO_FORNECEDOR":
      return "bg-yellow-100 text-yellow-800";

    case "ENCAMINHADO_FORNECEDOR":
      return "bg-blue-100 text-blue-800";

    case "PEDIDO_FORNECEDOR_REALIZADO":
      return "bg-purple-100 text-purple-800";

    case "AGUARDANDO_ENVIO":
      return "bg-orange-100 text-orange-800";

    case "ENVIADO":
      return "bg-indigo-100 text-indigo-800";

    case "ENTREGUE":
      return "bg-green-100 text-green-800";

    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatarStatusFornecedor(status: string | null | undefined) {
  switch (status) {
    case "AGUARDANDO_FORNECEDOR":
      return "Aguardando fornecedor";

    case "ENCAMINHADO_FORNECEDOR":
      return "Encaminhado ao fornecedor";

    case "PEDIDO_FORNECEDOR_REALIZADO":
      return "Pedido realizado";

    case "AGUARDANDO_ENVIO":
      return "Aguardando envio";

    case "ENVIADO":
      return "Enviado";

    case "ENTREGUE":
      return "Entregue";

    default:
      return "Sem fornecedor";
  }
}

function obterStatusFornecedorPedido(pedido: Pedido) {
  const itens = pedido.itens || [];

  if (itens.length === 0) {
    return null;
  }

  const status = itens
    .map((item) => item.statusFornecedor)
    .filter(Boolean) as string[];

  if (status.length === 0) {
    return null;
  }

  const prioridade: Record<string, number> = {
    AGUARDANDO_FORNECEDOR: 1,
    ENCAMINHADO_FORNECEDOR: 2,
    PEDIDO_FORNECEDOR_REALIZADO: 3,
    AGUARDANDO_ENVIO: 4,
    ENVIADO: 5,
    ENTREGUE: 6,
  };

  return status.reduce((statusAtual, statusItem) => {
    const prioridadeAtual = prioridade[statusAtual] || 0;
    const prioridadeItem = prioridade[statusItem] || 0;

    return prioridadeItem < prioridadeAtual
      ? statusItem
      : statusAtual;
  }, status[0]);
}

async function obterJson(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  const texto = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      `A API não retornou JSON. URL: ${response.url}. Resposta recebida: ${texto.slice(
        0,
        200
      )}`
    );
  }

  let data;

  try {
    data = JSON.parse(texto);
  } catch {
    throw new Error(
      `A API retornou uma resposta inválida. URL: ${response.url}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message || "Erro ao comunicar com a API."
    );
  }

  return data;
}

export default function PedidosAdminPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoSelecionado, setPedidoSelecionado] =
    useState<Pedido | null>(null);

  const [statusSelecionado, setStatusSelecionado] =
    useState("");

  const [filtroStatusPedido, setFiltroStatusPedido] =
    useState("TODOS");

  const [filtroStatusFornecedor, setFiltroStatusFornecedor] =
    useState("TODOS");

  const [carregando, setCarregando] = useState(true);
  const [carregandoDetalhes, setCarregandoDetalhes] =
    useState(false);

  const [atualizandoStatus, setAtualizandoStatus] =
    useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  // =====================================================
  // LISTAR PEDIDOS
  // =====================================================

  async function carregarPedidos() {
    try {
      setCarregando(true);
      setErro("");

      const response = await fetch(`${API_URL}/pedidos`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const data = await obterJson(response);

      if (!data.success) {
        throw new Error(
          data.message || "Erro ao carregar pedidos."
        );
      }

      setPedidos(
        Array.isArray(data.pedidos) ? data.pedidos : []
      );
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar pedidos."
      );
    } finally {
      setCarregando(false);
    }
  }

  // =====================================================
  // BUSCAR PEDIDO POR ID
  // =====================================================

  async function abrirPedido(id: number) {
    try {
      setCarregandoDetalhes(true);
      setErro("");
      setMensagem("");

      const response = await fetch(
        `${API_URL}/pedidos/${id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await obterJson(response);

      if (!data.success || !data.pedido) {
        throw new Error(
          data.message ||
            "Erro ao carregar detalhes do pedido."
        );
      }

      setPedidoSelecionado(data.pedido);
      setStatusSelecionado(data.pedido.status);
    } catch (error) {
      console.error("Erro ao buscar pedido:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar detalhes do pedido."
      );
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  // =====================================================
  // ATUALIZAR STATUS DO PEDIDO
  // =====================================================

  async function atualizarStatus() {
    if (!pedidoSelecionado) return;

    if (!statusSelecionado) {
      setErro("Selecione um status.");
      return;
    }

    try {
      setAtualizandoStatus(true);
      setErro("");
      setMensagem("");

      const response = await fetch(
        `${API_URL}/pedidos/${pedidoSelecionado.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            status: statusSelecionado,
          }),
        }
      );

      const data = await obterJson(response);

      if (!data.success || !data.pedido) {
        throw new Error(
          data.message ||
            "Erro ao atualizar status do pedido."
        );
      }

      setPedidoSelecionado(data.pedido);
      setStatusSelecionado(data.pedido.status);

      setPedidos((pedidosAtuais) =>
        pedidosAtuais.map((pedido) =>
          pedido.id === data.pedido.id
            ? data.pedido
            : pedido
        )
      );

      setMensagem(
        "Status do pedido atualizado com sucesso."
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar status:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar status do pedido."
      );
    } finally {
      setAtualizandoStatus(false);
    }
  }

  // =====================================================
  // FECHAR DETALHES
  // =====================================================

  function fecharDetalhes() {
    setPedidoSelecionado(null);
    setStatusSelecionado("");
    setMensagem("");
    setErro("");
  }

  // =====================================================
  // FILTROS
  // =====================================================

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const statusFornecedor =
        obterStatusFornecedorPedido(pedido);

      const correspondeStatusPedido =
        filtroStatusPedido === "TODOS" ||
        pedido.status === filtroStatusPedido;

      const correspondeStatusFornecedor =
        filtroStatusFornecedor === "TODOS" ||
        statusFornecedor === filtroStatusFornecedor;

      return (
        correspondeStatusPedido &&
        correspondeStatusFornecedor
      );
    });
  }, [
    pedidos,
    filtroStatusPedido,
    filtroStatusFornecedor,
  ]);

  // =====================================================
  // INDICADORES DROPSHIPPING
  // =====================================================

  const quantidadeAguardandoFornecedor = pedidos.filter(
    (pedido) =>
      obterStatusFornecedorPedido(pedido) ===
      "AGUARDANDO_FORNECEDOR"
  ).length;

  const quantidadePedidosFornecedor = pedidos.filter(
    (pedido) =>
      obterStatusFornecedorPedido(pedido) ===
      "PEDIDO_FORNECEDOR_REALIZADO"
  ).length;

  const quantidadeAguardandoEnvio = pedidos.filter(
    (pedido) =>
      obterStatusFornecedorPedido(pedido) ===
      "AGUARDANDO_ENVIO"
  ).length;

  const quantidadeEnviados = pedidos.filter(
    (pedido) =>
      obterStatusFornecedorPedido(pedido) === "ENVIADO"
  ).length;

  // =====================================================
  // CARREGAR AO ABRIR
  // =====================================================

  useEffect(() => {
    carregarPedidos();
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* CABEÇALHO */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-[#e58b6f] hover:text-[#c96d53]"
            >
              ← Voltar para o dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#2d2a26] md:text-4xl">
              Pedidos
            </h1>

            <p className="mt-2 text-[#756f69]">
              Acompanhe pedidos, pagamentos e o fluxo de
              dropshipping.
            </p>
          </div>

          <button
            type="button"
            onClick={carregarPedidos}
            disabled={carregando}
            className="inline-flex w-fit items-center rounded-full border-2 border-[#e58b6f] px-5 py-3 text-sm font-semibold text-[#e58b6f] transition hover:bg-[#fff4ec] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↻ Atualizar pedidos
          </button>
        </div>

        {/* ERRO */}

        {erro && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <strong>Erro:</strong> {erro}
          </div>
        )}

        {/* MENSAGEM */}

        {mensagem && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {mensagem}
          </div>
        )}

        {/* INDICADORES GERAIS */}

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="text-3xl">🛒</div>

            <p className="mt-4 text-sm font-medium text-[#756f69]">
              Total de pedidos
            </p>

            <strong className="mt-1 block text-3xl font-bold text-[#2d2a26]">
              {pedidos.length}
            </strong>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="text-3xl">⏳</div>

            <p className="mt-4 text-sm font-medium text-[#756f69]">
              Pedidos pendentes
            </p>

            <strong className="mt-1 block text-3xl font-bold text-[#2d2a26]">
              {
                pedidos.filter(
                  (pedido) => pedido.status === "PENDENTE"
                ).length
              }
            </strong>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="text-3xl">🚚</div>

            <p className="mt-4 text-sm font-medium text-[#756f69]">
              Enviados
            </p>

            <strong className="mt-1 block text-3xl font-bold text-[#2d2a26]">
              {
                pedidos.filter(
                  (pedido) => pedido.status === "ENVIADO"
                ).length
              }
            </strong>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="text-3xl">✅</div>

            <p className="mt-4 text-sm font-medium text-[#756f69]">
              Entregues
            </p>

            <strong className="mt-1 block text-3xl font-bold text-[#2d2a26]">
              {
                pedidos.filter(
                  (pedido) => pedido.status === "ENTREGUE"
                ).length
              }
            </strong>
          </div>
        </section>

        {/* INDICADORES DROPSHIPPING */}

        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#2d2a26]">
              Operação de dropshipping
            </h2>

            <p className="mt-1 text-sm text-[#756f69]">
              Acompanhe os pedidos desde o encaminhamento ao
              fornecedor até a entrega.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
              <div className="text-3xl">⏳</div>

              <p className="mt-4 text-sm font-semibold text-yellow-800">
                Aguardando fornecedor
              </p>

              <strong className="mt-1 block text-3xl font-bold text-yellow-900">
                {quantidadeAguardandoFornecedor}
              </strong>
            </div>

            <div className="rounded-3xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
              <div className="text-3xl">📦</div>

              <p className="mt-4 text-sm font-semibold text-purple-800">
                Pedidos ao fornecedor
              </p>

              <strong className="mt-1 block text-3xl font-bold text-purple-900">
                {quantidadePedidosFornecedor}
              </strong>
            </div>

            <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
              <div className="text-3xl">🚚</div>

              <p className="mt-4 text-sm font-semibold text-orange-800">
                Aguardando envio
              </p>

              <strong className="mt-1 block text-3xl font-bold text-orange-900">
                {quantidadeAguardandoEnvio}
              </strong>
            </div>

            <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm">
              <div className="text-3xl">📬</div>

              <p className="mt-4 text-sm font-semibold text-indigo-800">
                Enviados pelo fornecedor
              </p>

              <strong className="mt-1 block text-3xl font-bold text-indigo-900">
                {quantidadeEnviados}
              </strong>
            </div>
          </div>
        </section>

        {/* FILTROS */}

        <section className="mt-10 rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#2d2a26]">
                Filtros
              </h2>

              <p className="mt-1 text-sm text-[#756f69]">
                Filtre os pedidos por status da venda ou do
                fornecedor.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="filtro-status-pedido"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  Status do pedido
                </label>

                <select
                  id="filtro-status-pedido"
                  value={filtroStatusPedido}
                  onChange={(event) =>
                    setFiltroStatusPedido(event.target.value)
                  }
                  className="w-full min-w-[220px] rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 text-sm font-semibold text-[#2d2a26] outline-none focus:border-[#e58b6f]"
                >
                  <option value="TODOS">
                    Todos os status
                  </option>

                  {STATUS_PEDIDO.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="filtro-status-fornecedor"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  Status do fornecedor
                </label>

                <select
                  id="filtro-status-fornecedor"
                  value={filtroStatusFornecedor}
                  onChange={(event) =>
                    setFiltroStatusFornecedor(
                      event.target.value
                    )
                  }
                  className="w-full min-w-[250px] rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 text-sm font-semibold text-[#2d2a26] outline-none focus:border-[#e58b6f]"
                >
                  <option value="TODOS">
                    Todos os status
                  </option>

                  {STATUS_FORNECEDOR.map((status) => (
                    <option key={status} value={status}>
                      {formatarStatusFornecedor(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {(filtroStatusPedido !== "TODOS" ||
            filtroStatusFornecedor !== "TODOS") && (
            <button
              type="button"
              onClick={() => {
                setFiltroStatusPedido("TODOS");
                setFiltroStatusFornecedor("TODOS");
              }}
              className="mt-5 rounded-full border border-[#eadfd6] px-5 py-2 text-sm font-semibold text-[#756f69] transition hover:border-[#e58b6f] hover:bg-[#fffaf5] hover:text-[#2d2a26]"
            >
              Limpar filtros
            </button>
          )}
        </section>

        {/* LISTA */}

        <section className="mt-10">
          <div className="overflow-hidden rounded-3xl border border-[#eadfd6] bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-[#eadfd6] px-6 py-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-[#2d2a26]">
                  Pedidos realizados
                </h2>

                <p className="mt-1 text-sm text-[#756f69]">
                  Exibindo {pedidosFiltrados.length} de{" "}
                  {pedidos.length} pedido(s).
                </p>
              </div>
            </div>

            {carregando ? (
              <div className="px-6 py-16 text-center text-[#756f69]">
                Carregando pedidos...
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="text-5xl">🛒</div>

                <h3 className="mt-4 text-xl font-bold text-[#2d2a26]">
                  Nenhum pedido encontrado
                </h3>

                <p className="mt-2 text-sm text-[#756f69]">
                  Nenhum pedido corresponde aos filtros
                  selecionados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-[#eadfd6] text-left">
                      <th className="px-6 py-4 text-sm font-bold text-[#2d2a26]">
                        Pedido
                      </th>

                      <th className="px-6 py-4 text-sm font-bold text-[#2d2a26]">
                        Cliente
                      </th>

                      <th className="px-6 py-4 text-sm font-bold text-[#2d2a26]">
                        Data
                      </th>

                      <th className="px-6 py-4 text-sm font-bold text-[#2d2a26]">
                        Itens
                      </th>

                      <th className="px-6 py-4 text-sm font-bold text-[#2d2a26]">
                        Total
                      </th>

                      <th className="px-6 py-4 text-sm font-bold text-[#2d2a26]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-sm font-bold text-[#2d2a26]">
                        Dropshipping
                      </th>

                      <th className="px-6 py-4 text-right text-sm font-bold text-[#2d2a26]">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pedidosFiltrados.map((pedido) => {
                      const statusFornecedor =
                        obterStatusFornecedorPedido(pedido);

                      return (
                        <tr
                          key={pedido.id}
                          className="border-b border-[#f0e7df] last:border-b-0"
                        >
                          <td className="px-6 py-5">
                            <strong className="text-[#2d2a26]">
                              #{pedido.id}
                            </strong>
                          </td>

                          <td className="px-6 py-5">
                            <div className="font-semibold text-[#2d2a26]">
                              {pedido.nomeCliente}
                            </div>

                            <div className="mt-1 text-sm text-[#756f69]">
                              {pedido.email}
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-[#756f69]">
                            {formatarData(pedido.createdAt)}
                          </td>

                          <td className="px-6 py-5 text-sm text-[#756f69]">
                            {pedido.itens?.length || 0}{" "}
                            {pedido.itens?.length === 1
                              ? "item"
                              : "itens"}
                          </td>

                          <td className="px-6 py-5 font-bold text-[#2d2a26]">
                            {formatarMoeda(pedido.total)}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${obterClasseStatus(
                                pedido.status
                              )}`}
                            >
                              {pedido.status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            {statusFornecedor ? (
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${obterClasseStatusFornecedor(
                                  statusFornecedor
                                )}`}
                              >
                                {formatarStatusFornecedor(
                                  statusFornecedor
                                )}
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                                Sem fornecedor
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-5 text-right">
                            <Link
                              href={`/admin/pedidos/${pedido.id}`}
                              className="inline-flex rounded-full border border-[#eadfd6] px-4 py-2 text-sm font-semibold text-[#2d2a26] transition hover:border-[#e58b6f] hover:bg-[#fff4ec]"
                            >
                              Ver pedido
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =====================================================
          MODAL DE DETALHES
      ===================================================== */}

      {pedidoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* CABEÇALHO */}

            <div className="flex items-start justify-between border-b border-[#eadfd6] px-6 py-5">
              <div>
                <span className="text-sm font-bold text-[#e58b6f]">
                  Pedido #{pedidoSelecionado.id}
                </span>

                <h2 className="mt-1 text-2xl font-bold text-[#2d2a26]">
                  Detalhes do pedido
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharDetalhes}
                className="text-xl font-bold text-[#756f69] transition hover:text-[#2d2a26]"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {/* CONTEÚDO */}

            <div className="max-h-[calc(90vh-150px)] overflow-y-auto px-6 py-6">
              {carregandoDetalhes ? (
                <div className="py-20 text-center text-[#756f69]">
                  Carregando detalhes...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* STATUS DO PEDIDO */}

                  <section className="rounded-3xl border border-[#eadfd6] bg-[#fffaf5] p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#756f69]">
                          Status atual do pedido
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${obterClasseStatus(
                            pedidoSelecionado.status
                          )}`}
                        >
                          {pedidoSelecionado.status}
                        </span>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                          value={statusSelecionado}
                          onChange={(event) =>
                            setStatusSelecionado(
                              event.target.value
                            )
                          }
                          className="rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 text-sm font-semibold text-[#2d2a26] outline-none focus:border-[#e58b6f]"
                        >
                          {STATUS_PEDIDO.map((status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={atualizarStatus}
                          disabled={
                            atualizandoStatus ||
                            statusSelecionado ===
                              pedidoSelecionado.status
                          }
                          className="rounded-2xl bg-[#e58b6f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {atualizandoStatus
                            ? "Atualizando..."
                            : "Atualizar status"}
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* RESUMO DROPSHIPPING */}

                  <section className="rounded-3xl border border-[#eadfd6] bg-white p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[#2d2a26]">
                          Status do dropshipping
                        </h3>

                        <p className="mt-1 text-sm text-[#756f69]">
                          Situação atual dos produtos junto aos
                          fornecedores.
                        </p>
                      </div>

                      {obterStatusFornecedorPedido(
                        pedidoSelecionado
                      ) && (
                        <span
                          className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-bold ${obterClasseStatusFornecedor(
                            obterStatusFornecedorPedido(
                              pedidoSelecionado
                            ) || ""
                          )}`}
                        >
                          {formatarStatusFornecedor(
                            obterStatusFornecedorPedido(
                              pedidoSelecionado
                            )
                          )}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 space-y-4">
                      {pedidoSelecionado.itens?.map(
                        (item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl bg-[#fffaf5] p-5"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <p className="font-bold text-[#2d2a26]">
                                  {item.nomeProduto}
                                </p>

                                <p className="mt-1 text-sm text-[#756f69]">
                                  Quantidade:{" "}
                                  {item.quantidade}
                                </p>

                                <p className="mt-1 text-sm text-[#756f69]">
                                  Fornecedor:{" "}
                                  <strong className="text-[#2d2a26]">
                                    {item.fornecedorNome ||
                                      item.fornecedor?.nome ||
                                      "Não definido"}
                                  </strong>
                                </p>
                              </div>

                              <div className="text-left lg:text-right">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                                  Status
                                </p>

                                <span
                                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${obterClasseStatusFornecedor(
                                    item.statusFornecedor ||
                                      ""
                                  )}`}
                                >
                                  {formatarStatusFornecedor(
                                    item.statusFornecedor
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                                  SKU fornecedor
                                </p>

                                <p className="mt-1 text-sm font-semibold text-[#2d2a26]">
                                  {item.skuFornecedor ||
                                    "-"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                                  Custo fornecedor
                                </p>

                                <p className="mt-1 text-sm font-semibold text-[#2d2a26]">
                                  {item.custoFornecedor !=
                                  null
                                    ? formatarMoeda(
                                        item.custoFornecedor
                                      )
                                    : "-"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                                  Pedido fornecedor
                                </p>

                                <p className="mt-1 text-sm font-semibold text-[#2d2a26]">
                                  {item.numeroPedidoFornecedor ||
                                    "-"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                                  Encaminhamento
                                </p>

                                <p className="mt-1 text-sm font-semibold text-[#2d2a26]">
                                  {formatarData(
                                    item.dataEncaminhamento
                                  )}
                                </p>
                              </div>
                            </div>

                            {item.linkFornecedor && (
                              <div className="mt-4">
                                <a
                                  href={item.linkFornecedor}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-semibold text-[#e58b6f] hover:text-[#c96d53]"
                                >
                                  Abrir produto do fornecedor →
                                </a>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </section>

                  {/* DADOS DO CLIENTE */}

                  <section className="rounded-3xl border border-[#eadfd6] bg-white p-6">
                    <h3 className="text-xl font-bold text-[#2d2a26]">
                      Dados do cliente
                    </h3>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                          Nome
                        </p>

                        <p className="mt-1 font-semibold text-[#2d2a26]">
                          {pedidoSelecionado.nomeCliente}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                          Telefone
                        </p>

                        <p className="mt-1 font-semibold text-[#2d2a26]">
                          {pedidoSelecionado.telefone}
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                          E-mail
                        </p>

                        <p className="mt-1 font-semibold text-[#2d2a26]">
                          {pedidoSelecionado.email}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* ENDEREÇO */}

                  <section className="rounded-3xl border border-[#eadfd6] bg-white p-6">
                    <h3 className="text-xl font-bold text-[#2d2a26]">
                      Endereço de entrega
                    </h3>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                          Endereço
                        </p>

                        <p className="mt-1 font-semibold text-[#2d2a26]">
                          {pedidoSelecionado.endereco},{" "}
                          {pedidoSelecionado.numero}
                        </p>
                      </div>

                      {pedidoSelecionado.complemento && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                            Complemento
                          </p>

                          <p className="mt-1 font-semibold text-[#2d2a26]">
                            {pedidoSelecionado.complemento}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                          Bairro
                        </p>

                        <p className="mt-1 font-semibold text-[#2d2a26]">
                          {pedidoSelecionado.bairro}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                          Cidade
                        </p>

                        <p className="mt-1 font-semibold text-[#2d2a26]">
                          {pedidoSelecionado.cidade} -{" "}
                          {pedidoSelecionado.estado}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                          CEP
                        </p>

                        <p className="mt-1 font-semibold text-[#2d2a26]">
                          {pedidoSelecionado.cep}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* PRODUTOS */}

                  <section className="rounded-3xl border border-[#eadfd6] bg-white p-6">
                    <h3 className="text-xl font-bold text-[#2d2a26]">
                      Produtos do pedido
                    </h3>

                    <div className="mt-5 space-y-4">
                      {pedidoSelecionado.itens?.map(
                        (item) => (
                          <div
                            key={item.id}
                            className="flex flex-col justify-between gap-3 rounded-2xl bg-[#fffaf5] p-4 sm:flex-row sm:items-center"
                          >
                            <div>
                              <p className="font-bold text-[#2d2a26]">
                                {item.nomeProduto}
                              </p>

                              <p className="mt-1 text-sm text-[#756f69]">
                                Quantidade:{" "}
                                {item.quantidade}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-sm text-[#756f69]">
                                {formatarMoeda(item.preco)} cada
                              </p>

                              <p className="mt-1 font-bold text-[#2d2a26]">
                                {formatarMoeda(
                                  Number(item.preco) *
                                    item.quantidade
                                )}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </section>

                  {/* PAGAMENTO E TOTAL */}

                  <section className="rounded-3xl border border-[#eadfd6] bg-[#fffaf5] p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-[#756f69]">
                          Forma de pagamento
                        </span>

                        <strong className="text-[#2d2a26]">
                          {formatarPagamento(
                            pedidoSelecionado.pagamento
                          )}
                        </strong>
                      </div>

                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-[#756f69]">
                          Subtotal
                        </span>

                        <strong className="text-[#2d2a26]">
                          {formatarMoeda(
                            pedidoSelecionado.subtotal
                          )}
                        </strong>
                      </div>

                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-[#756f69]">
                          Frete
                        </span>

                        <strong className="text-[#2d2a26]">
                          {formatarMoeda(
                            pedidoSelecionado.frete
                          )}
                        </strong>
                      </div>

                      <div className="border-t border-[#eadfd6] pt-4">
                        <div className="flex justify-between gap-4">
                          <span className="text-lg font-bold text-[#2d2a26]">
                            Total
                          </span>

                          <strong className="text-2xl font-bold text-[#e58b6f]">
                            {formatarMoeda(
                              pedidoSelecionado.total
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* DATA */}

                  <div className="text-sm text-[#a39a92]">
                    Pedido realizado em{" "}
                    {formatarData(
                      pedidoSelecionado.createdAt
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RODAPÉ */}

            <div className="flex justify-between border-t border-[#eadfd6] bg-white px-6 py-5">
              <Link
                href={`/admin/pedidos/${pedidoSelecionado.id}`}
                onClick={fecharDetalhes}
                className="rounded-full bg-[#e58b6f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c96d53]"
              >
                Abrir página completa
              </Link>

              <button
                type="button"
                onClick={fecharDetalhes}
                className="rounded-full border border-[#eadfd6] px-6 py-3 text-sm font-semibold text-[#2d2a26] transition hover:bg-[#fffaf5]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}