
"use client";

import { useEffect, useState } from "react";

interface Pedido {
  id: number;
  nomeCliente: string;
  emailCliente: string;
  telefoneCliente?: string | null;
  total: number;
  subtotal: number;
  frete: number;
  desconto: number;
  status: string;
  formaPagamento: string;
  createdAt: string;
  itens?: ItemPedido[];
}

interface ItemPedido {
  id: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  produto?: {
    id: number;
    nome: string;
    imagem?: string | null;
  } | null;
}

function obterApiUrl(): string {
  const configurada = process.env.NEXT_PUBLIC_API_URL?.trim();

  const ambienteLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  let base: string;

  if (configurada) {
    base = configurada;
  } else if (ambienteLocal) {
    base = "http://localhost:3001";
  } else {
    base = "https://mimo-quatro-patas.onrender.com";
  }

  base = base.trim().replace(/\/+$/, "");

  /*
   * A variável da Vercel pode estar configurada como:
   *
   * https://mimo-quatro-patas.onrender.com
   *
   * ou:
   *
   * https://mimo-quatro-patas.onrender.com/api
   *
   * Em ambos os casos precisamos terminar com apenas /api.
   */
  base = base.replace(/\/api$/i, "");

  /*
   * Evita que uma configuração antiga de localhost
   * seja usada na produção.
   */
  if (
    !ambienteLocal &&
    /^https?:\/\/localhost(?::\d+)?$/i.test(base)
  ) {
    base = "https://mimo-quatro-patas.onrender.com";
  }

  return `${base}/api`;
}

const API_URL = obterApiUrl();

const STATUS_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  PROCESSANDO: "Processando",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const STATUS_CLASSES: Record<string, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-800",
  PAGO: "bg-blue-100 text-blue-800",
  PROCESSANDO: "bg-purple-100 text-purple-800",
  ENVIADO: "bg-indigo-100 text-indigo-800",
  ENTREGUE: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
};

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor) || 0);
}

function formatarData(data: string) {
  if (!data) return "-";

  return new Date(data).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function PedidosAdminPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [busca, setBusca] = useState("");

  const [pedidoSelecionado, setPedidoSelecionado] =
    useState<Pedido | null>(null);

  const [carregandoDetalhes, setCarregandoDetalhes] =
    useState(false);

  const [novoStatus, setNovoStatus] = useState("");
  const [salvandoStatus, setSalvandoStatus] = useState(false);

  async function carregarPedidos() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch(`${API_URL}/pedidos`, {
        method: "GET",
        cache: "no-store",
      });

      const texto = await resposta.text();

      let dados: any;

      try {
        dados = JSON.parse(texto);
      } catch {
        throw new Error(
          `A API não retornou JSON. URL: ${API_URL}/pedidos\n\n${texto.slice(
            0,
            500
          )}`
        );
      }

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.error ||
            `Erro HTTP ${resposta.status}`
        );
      }

      if (!dados?.success) {
        throw new Error(
          dados?.message || "Não foi possível carregar os pedidos."
        );
      }

      setPedidos(Array.isArray(dados.pedidos) ? dados.pedidos : []);
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

  async function abrirDetalhes(id: number) {
    try {
      setCarregandoDetalhes(true);
      setErro("");

      const resposta = await fetch(`${API_URL}/pedidos/${id}`, {
        method: "GET",
        cache: "no-store",
      });

      const texto = await resposta.text();

      let dados: any;

      try {
        dados = JSON.parse(texto);
      } catch {
        throw new Error(
          `A API não retornou JSON. URL: ${API_URL}/pedidos/${id}\n\n${texto.slice(
            0,
            500
          )}`
        );
      }

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.error ||
            `Erro HTTP ${resposta.status}`
        );
      }

      if (!dados?.success) {
        throw new Error(
          dados?.message ||
            "Não foi possível carregar os detalhes do pedido."
        );
      }

      setPedidoSelecionado(dados.pedido);
      setNovoStatus(dados.pedido?.status || "");
    } catch (error) {
      console.error("Erro ao carregar pedido:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar detalhes do pedido."
      );
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  async function alterarStatus() {
    if (!pedidoSelecionado || !novoStatus) return;

    try {
      setSalvandoStatus(true);
      setErro("");

      const resposta = await fetch(
        `${API_URL}/pedidos/${pedidoSelecionado.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: novoStatus,
          }),
        }
      );

      const texto = await resposta.text();

      let dados: any;

      try {
        dados = JSON.parse(texto);
      } catch {
        throw new Error(
          `A API não retornou JSON. URL: ${API_URL}/pedidos/${pedidoSelecionado.id}/status\n\n${texto.slice(
            0,
            500
          )}`
        );
      }

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.error ||
            `Erro HTTP ${resposta.status}`
        );
      }

      if (!dados?.success) {
        throw new Error(
          dados?.message || "Não foi possível alterar o status."
        );
      }

      const pedidoAtualizado =
        dados.pedido || {
          ...pedidoSelecionado,
          status: novoStatus,
        };

      setPedidoSelecionado(pedidoAtualizado);

      setPedidos((lista) =>
        lista.map((pedido) =>
          pedido.id === pedidoAtualizado.id
            ? {
                ...pedido,
                status: pedidoAtualizado.status,
              }
            : pedido
        )
      );
    } catch (error) {
      console.error("Erro ao alterar status:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao alterar status do pedido."
      );
    } finally {
      setSalvandoStatus(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const correspondeStatus =
      filtroStatus === "TODOS" ||
      pedido.status === filtroStatus;

    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return correspondeStatus;
    }

    const correspondeBusca =
      String(pedido.id).includes(termo) ||
      pedido.nomeCliente?.toLowerCase().includes(termo) ||
      pedido.emailCliente?.toLowerCase().includes(termo) ||
      pedido.telefoneCliente?.toLowerCase().includes(termo);

    return correspondeStatus && correspondeBusca;
  });

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciar Pedidos
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Consulte e gerencie os pedidos realizados na loja.
            </p>
          </div>

          <button
            type="button"
            onClick={carregarPedidos}
            disabled={carregando}
            className="rounded-lg bg-[#e58b6f] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? "Atualizando..." : "Atualizar pedidos"}
          </button>
        </div>

        {erro && (
          <div className="mb-6 whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Erro:</strong> {erro}
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total de pedidos</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {pedidos.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pedidos pendentes</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {
                pedidos.filter(
                  (pedido) => pedido.status === "PENDENTE"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pedidos entregues</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {
                pedidos.filter(
                  (pedido) => pedido.status === "ENTREGUE"
                ).length
              }
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="busca"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Buscar pedido
              </label>

              <input
                id="busca"
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="ID, cliente, e-mail ou telefone"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20"
              />
            </div>

            <div>
              <label
                htmlFor="filtroStatus"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                id="filtroStatus"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20"
              >
                <option value="TODOS">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Pago</option>
                <option value="PROCESSANDO">
                  Processando
                </option>
                <option value="ENVIADO">Enviado</option>
                <option value="ENTREGUE">Entregue</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {carregando ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Carregando pedidos...
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-gray-700">
                Nenhum pedido encontrado.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Tente alterar os filtros ou atualizar a lista.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Pedido
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Cliente
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Data
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Pagamento
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Total
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {pedidosFiltrados.map((pedido) => (
                    <tr
                      key={pedido.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        #{pedido.id}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">
                          {pedido.nomeCliente || "-"}
                        </div>

                        <div className="text-xs text-gray-500">
                          {pedido.emailCliente || "-"}
                        </div>

                        {pedido.telefoneCliente && (
                          <div className="text-xs text-gray-500">
                            {pedido.telefoneCliente}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {formatarData(pedido.createdAt)}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {pedido.formaPagamento || "-"}
                      </td>

                      <td className="px-4 py-4 font-semibold text-gray-900">
                        {formatarMoeda(pedido.total)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            STATUS_CLASSES[pedido.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {STATUS_LABELS[pedido.status] ||
                            pedido.status ||
                            "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => abrirDetalhes(pedido.id)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-[#e58b6f] hover:text-[#c96d53]"
                        >
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {pedidoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Pedido #{pedidoSelecionado.id}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {formatarData(pedidoSelecionado.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPedidoSelecionado(null)}
                className="rounded-lg px-3 py-2 text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            {carregandoDetalhes ? (
              <div className="p-10 text-center text-sm text-gray-500">
                Carregando detalhes...
              </div>
            ) : (
              <div className="space-y-6 p-5">
                <section>
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Cliente
                  </h3>

                  <div className="grid gap-3 rounded-xl bg-gray-50 p-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500">
                        Nome
                      </p>

                      <p className="font-medium text-gray-900">
                        {pedidoSelecionado.nomeCliente || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        E-mail
                      </p>

                      <p className="font-medium text-gray-900">
                        {pedidoSelecionado.emailCliente || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Telefone
                      </p>

                      <p className="font-medium text-gray-900">
                        {pedidoSelecionado.telefoneCliente || "-"}
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Status do pedido
                  </h3>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <select
                      value={novoStatus}
                      onChange={(e) =>
                        setNovoStatus(e.target.value)
                      }
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20"
                    >
                      <option value="PENDENTE">
                        Pendente
                      </option>

                      <option value="PAGO">Pago</option>

                      <option value="PROCESSANDO">
                        Processando
                      </option>

                      <option value="ENVIADO">
                        Enviado
                      </option>

                      <option value="ENTREGUE">
                        Entregue
                      </option>

                      <option value="CANCELADO">
                        Cancelado
                      </option>
                    </select>

                    <button
                      type="button"
                      onClick={alterarStatus}
                      disabled={
                        salvandoStatus ||
                        novoStatus === pedidoSelecionado.status
                      }
                      className="rounded-lg bg-[#e58b6f] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {salvandoStatus
                        ? "Salvando..."
                        : "Salvar status"}
                    </button>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Resumo financeiro
                  </h3>

                  <div className="space-y-2 rounded-xl bg-gray-50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Subtotal
                      </span>

                      <span className="font-medium">
                        {formatarMoeda(
                          pedidoSelecionado.subtotal
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Frete
                      </span>

                      <span className="font-medium">
                        {formatarMoeda(
                          pedidoSelecionado.frete
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Desconto
                      </span>

                      <span className="font-medium text-green-600">
                        -{" "}
                        {formatarMoeda(
                          pedidoSelecionado.desconto
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between border-t border-gray-200 pt-3">
                      <span className="font-semibold text-gray-900">
                        Total
                      </span>

                      <span className="text-lg font-bold text-gray-900">
                        {formatarMoeda(
                          pedidoSelecionado.total
                        )}
                      </span>
                    </div>
                  </div>
                </section>

                {pedidoSelecionado.itens &&
                  pedidoSelecionado.itens.length > 0 && (
                    <section>
                      <h3 className="mb-3 font-semibold text-gray-900">
                        Produtos
                      </h3>

                      <div className="space-y-3">
                        {pedidoSelecionado.itens.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.produto?.nome ||
                                  `Produto #${item.id}`}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                Quantidade: {item.quantidade}
                              </p>

                              <p className="text-sm text-gray-500">
                                Unitário:{" "}
                                {formatarMoeda(
                                  item.precoUnitario
                                )}
                              </p>
                            </div>

                            <p className="font-semibold text-gray-900">
                              {formatarMoeda(item.subtotal)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
              </div>
            )}

            <div className="flex justify-end border-t border-gray-200 p-5">
              <button
                type="button"
                onClick={() => setPedidoSelecionado(null)}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
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

