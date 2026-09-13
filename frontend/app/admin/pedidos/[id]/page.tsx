"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Categoria {
  id: number;
  nome: string;
}

interface Fornecedor {
  id: number;
  nome: string;
  empresa?: string | null;
  email?: string | null;
  telefone?: string | null;
  site?: string | null;
  ativo?: boolean;
}

interface Produto {
  id: number;
  nome: string;
  imagem?: string | null;
  preco: string | number;
  precoPromo?: string | number | null;
  estoque: number;
  categoria?: Categoria;
  fornecedor?: Fornecedor | null;
  fornecedorId?: number | null;
  skuFornecedor?: string | null;
  custoFornecedor?: string | number | null;
  linkFornecedor?: string | null;
}

interface PedidoItem {
  id: number;
  pedidoId: number;
  produtoId: number;
  nomeProduto: string;
  preco: string | number;
  quantidade: number;

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

  produto?: Produto | null;
  fornecedor?: Fornecedor | null;
}

interface Cupom {
  id: number;
  codigo: string;
  tipo: string;
  valor: string | number;
}

interface Pedido {
  id: number;

  nomeCliente: string;
  emailCliente?: string | null;
  telefoneCliente?: string | null;

  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;

  subtotal: string | number;
  frete: string | number;
  desconto?: string | number | null;
  total: string | number;

  pagamento: string;
  status: string;

  codigoCupom?: string | null;
  cupom?: Cupom | null;

  createdAt?: string;
  updatedAt?: string;

  itens: PedidoItem[];
}

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

  base = base
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "");

  if (
    !ambienteLocal &&
    /^https?:\/\/localhost(?::\d+)?$/i.test(base)
  ) {
    base = "https://mimo-quatro-patas.onrender.com";
  }

  return `${base}/api`;
}

const API_URL = obterApiUrl();

function obterBaseArquivos(): string {
  return API_URL
    .replace(/\/api\/?$/i, "")
    .replace(/\/+$/, "");
}

const ARQUIVOS_URL = obterBaseArquivos();

function formatarPreco(
  valor: string | number | null | undefined
): string {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return "R$ 0,00";
  }

  const numero = Number(valor);

  if (Number.isNaN(numero)) {
    return "R$ 0,00";
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(
  valor: string | null | undefined
): string {
  if (!valor) {
    return "—";
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "—";
  }

  return data.toLocaleString("pt-BR");
}

function nomeStatusPedido(status: string): string {
  const nomes: Record<string, string> = {
    PENDENTE: "Pendente",
    PAGO: "Pago",
    PROCESSANDO: "Processando",
    ENVIADO: "Enviado",
    ENTREGUE: "Entregue",
    CANCELADO: "Cancelado",
  };

  return nomes[status] || status;
}

function nomeStatusFornecedor(status: string): string {
  const nomes: Record<string, string> = {
    AGUARDANDO_FORNECEDOR: "Aguardando fornecedor",
    ENCAMINHADO_FORNECEDOR: "Encaminhado ao fornecedor",
    PEDIDO_FORNECEDOR_REALIZADO:
      "Pedido do fornecedor realizado",
    AGUARDANDO_ENVIO: "Aguardando envio",
    ENVIADO: "Enviado",
    ENTREGUE: "Entregue",
  };

  return nomes[status] || status;
}

function classeStatusFornecedor(status: string): string {
  const classes: Record<string, string> = {
    AGUARDANDO_FORNECEDOR:
      "bg-yellow-100 text-yellow-700",
    ENCAMINHADO_FORNECEDOR:
      "bg-blue-100 text-blue-700",
    PEDIDO_FORNECEDOR_REALIZADO:
      "bg-purple-100 text-purple-700",
    AGUARDANDO_ENVIO:
      "bg-orange-100 text-orange-700",
    ENVIADO:
      "bg-indigo-100 text-indigo-700",
    ENTREGUE:
      "bg-green-100 text-green-700",
  };

  return (
    classes[status] ||
    "bg-gray-100 text-gray-600"
  );
}

function obterUrlImagem(
  imagem: string | null | undefined
): string | null {
  if (!imagem) {
    return null;
  }

  const valor = String(imagem).trim();

  if (!valor) {
    return null;
  }

  if (
    valor.startsWith("http://") ||
    valor.startsWith("https://")
  ) {
    return valor;
  }

  let caminho = valor
    .replace(/^\/+/, "")
    .replace(/^api\/+/i, "");

  if (!caminho.startsWith("uploads/")) {
    caminho = `uploads/${caminho}`;
  }

  return `${ARQUIVOS_URL}/${caminho}`;
}

function obterProximaEtapa(
  status: string
): string | null {
  const fluxo: Record<string, string> = {
    AGUARDANDO_FORNECEDOR:
      "ENCAMINHADO_FORNECEDOR",

    ENCAMINHADO_FORNECEDOR:
      "PEDIDO_FORNECEDOR_REALIZADO",

    PEDIDO_FORNECEDOR_REALIZADO:
      "AGUARDANDO_ENVIO",

    AGUARDANDO_ENVIO:
      "ENVIADO",

    ENVIADO:
      "ENTREGUE",
  };

  return fluxo[status] || null;
}

function textoProximaEtapa(
  status: string
): string {
  const proxima = obterProximaEtapa(status);

  if (!proxima) {
    return "Fluxo concluído";
  }

  return nomeStatusFornecedor(proxima);
}

function indiceStatusFornecedor(
  status: string
): number {
  return STATUS_FORNECEDOR.indexOf(status);
}

export default function PedidoDetalhesPage() {
  const params = useParams();
  const router = useRouter();

  const idParam = params?.id;

  const id =
    typeof idParam === "string"
      ? idParam
      : Array.isArray(idParam)
      ? idParam[0]
      : "";

  const [pedido, setPedido] =
    useState<Pedido | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState("");

  const [salvandoStatus, setSalvandoStatus] =
    useState(false);

  const [statusPedido, setStatusPedido] =
    useState("");

  const [mensagem, setMensagem] =
    useState("");

  const [tipoMensagem, setTipoMensagem] =
    useState<"sucesso" | "erro">("sucesso");

  const [statusFornecedor, setStatusFornecedor] =
    useState<Record<number, string>>({});

  const [
    numeroPedidoFornecedor,
    setNumeroPedidoFornecedor,
  ] = useState<Record<number, string>>({});

  const [
    salvandoFornecedor,
    setSalvandoFornecedor,
  ] = useState<number | null>(null);

  async function carregarPedido() {
    try {
      setCarregando(true);
      setErro("");

      if (!id) {
        throw new Error(
          "ID do pedido não informado."
        );
      }

      const response = await fetch(
        `${API_URL}/pedidos/${id}`,
        {
          cache: "no-store",
        }
      );

      const texto = await response.text();

      let data: any;

      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error(
          `A API não retornou JSON. URL: ${API_URL}/pedidos/${id}\n\n${texto.slice(
            0,
            500
          )}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Não foi possível carregar o pedido."
        );
      }

      const pedidoRecebido: Pedido =
        data?.pedido || data;

      if (!pedidoRecebido?.id) {
        throw new Error(
          "A API retornou um pedido inválido."
        );
      }

      setPedido(pedidoRecebido);

      setStatusPedido(
        pedidoRecebido.status || "PENDENTE"
      );

      const novosStatusFornecedor:
        Record<number, string> = {};

      const novosNumerosFornecedor:
        Record<number, string> = {};

      for (
        const item of pedidoRecebido.itens || []
      ) {
        novosStatusFornecedor[item.id] =
          item.statusFornecedor ||
          "AGUARDANDO_FORNECEDOR";

        novosNumerosFornecedor[item.id] =
          item.numeroPedidoFornecedor ||
          "";
      }

      setStatusFornecedor(
        novosStatusFornecedor
      );

      setNumeroPedidoFornecedor(
        novosNumerosFornecedor
      );
    } catch (error) {
      console.error(
        "[PedidoDetalhes] Erro ao carregar pedido:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar pedido."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPedido();
  }, [id]);

  function mostrarMensagem(
    texto: string,
    tipo: "sucesso" | "erro" = "sucesso"
  ) {
    setMensagem(texto);
    setTipoMensagem(tipo);
  }

  async function atualizarStatusPedido() {
    if (!pedido) {
      return;
    }

    if (!statusPedido) {
      mostrarMensagem(
        "Selecione um status para o pedido.",
        "erro"
      );
      return;
    }

    try {
      setSalvandoStatus(true);
      setMensagem("");

      const response = await fetch(
        `${API_URL}/pedidos/${pedido.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            status: statusPedido,
          }),
        }
      );

      const texto = await response.text();

      let data: any;

      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error(
          `A API não retornou JSON. URL: ${API_URL}/pedidos/${pedido.id}/status\n\n${texto.slice(
            0,
            500
          )}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Não foi possível atualizar o status do pedido."
        );
      }

      mostrarMensagem(
        "Status do pedido atualizado com sucesso."
      );

      await carregarPedido();
    } catch (error) {
      console.error(
        "[PedidoDetalhes] Erro ao atualizar pedido:",
        error
      );

      mostrarMensagem(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar status.",
        "erro"
      );
    } finally {
      setSalvandoStatus(false);
    }
  }

  async function executarAcaoFornecedor(
    item: PedidoItem,
    novoStatus: string
  ) {
    if (!STATUS_FORNECEDOR.includes(novoStatus)) {
      mostrarMensagem(
        "O status do fornecedor é inválido.",
        "erro"
      );
      return;
    }

    if (
      !item.fornecedorId &&
      !item.fornecedor
    ) {
      mostrarMensagem(
        `O produto "${item.nomeProduto}" está sem fornecedor cadastrado.`,
        "erro"
      );
      return;
    }

    const statusAtual =
      statusFornecedor[item.id] ||
      item.statusFornecedor ||
      "AGUARDANDO_FORNECEDOR";

    const indiceAtual =
      indiceStatusFornecedor(statusAtual);

    const indiceNovo =
      indiceStatusFornecedor(novoStatus);

    if (
      indiceNovo !== -1 &&
      indiceAtual !== -1 &&
      indiceNovo < indiceAtual
    ) {
      mostrarMensagem(
        "O fluxo do fornecedor não pode voltar para uma etapa anterior.",
        "erro"
      );
      return;
    }

    if (
      novoStatus ===
        "PEDIDO_FORNECEDOR_REALIZADO" &&
      !(
        numeroPedidoFornecedor[item.id] ||
        ""
      ).trim()
    ) {
      mostrarMensagem(
        "Informe o número do pedido no fornecedor antes de marcar como pedido realizado.",
        "erro"
      );
      return;
    }

    const numeroFornecedor =
      (
        numeroPedidoFornecedor[item.id] ||
        ""
      ).trim();

    try {
      setSalvandoFornecedor(item.id);
      setMensagem("");

      const payload = {
        status: novoStatus,
        numeroPedidoFornecedor:
          numeroFornecedor || null,
      };

      const response = await fetch(
        `${API_URL}/pedidos/item/${item.id}/fornecedor-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const texto = await response.text();

      let data: any;

      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error(
          `A API não retornou JSON. URL: ${API_URL}/pedidos/item/${item.id}/fornecedor-status\n\n${texto.slice(
            0,
            500
          )}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Não foi possível atualizar o status do fornecedor."
        );
      }

      const itemAtualizado =
        data?.item || data;

      if (
        itemAtualizado &&
        typeof itemAtualizado === "object"
      ) {
        setStatusFornecedor(
          (anterior) => ({
            ...anterior,
            [item.id]:
              itemAtualizado.statusFornecedor ||
              novoStatus,
          })
        );

        setNumeroPedidoFornecedor(
          (anterior) => ({
            ...anterior,
            [item.id]:
              itemAtualizado.numeroPedidoFornecedor ||
              numeroFornecedor ||
              "",
          })
        );
      }

      mostrarMensagem(
        `Item "${item.nomeProduto}" atualizado para "${nomeStatusFornecedor(
          novoStatus
        )}".`
      );

      await carregarPedido();
    } catch (error) {
      console.error(
        "[Dropshipping] Erro ao atualizar fornecedor:",
        error
      );

      mostrarMensagem(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar status do fornecedor.",
        "erro"
      );

      await carregarPedido();
    } finally {
      setSalvandoFornecedor(null);
    }
  }

  async function atualizarStatusFornecedor(
    item: PedidoItem
  ) {
    const novoStatus =
      statusFornecedor[item.id] ||
      item.statusFornecedor ||
      "AGUARDANDO_FORNECEDOR";

    await executarAcaoFornecedor(
      item,
      novoStatus
    );
  }

  async function encaminharFornecedor(
    item: PedidoItem
  ) {
    await executarAcaoFornecedor(
      item,
      "ENCAMINHADO_FORNECEDOR"
    );
  }

  async function marcarPedidoFornecedorRealizado(
    item: PedidoItem
  ) {
    await executarAcaoFornecedor(
      item,
      "PEDIDO_FORNECEDOR_REALIZADO"
    );
  }

  async function marcarAguardandoEnvio(
    item: PedidoItem
  ) {
    await executarAcaoFornecedor(
      item,
      "AGUARDANDO_ENVIO"
    );
  }

  async function marcarEnviado(
    item: PedidoItem
  ) {
    await executarAcaoFornecedor(
      item,
      "ENVIADO"
    );
  }

  async function marcarEntregue(
    item: PedidoItem
  ) {
    await executarAcaoFornecedor(
      item,
      "ENTREGUE"
    );
  }

  function renderizarAcoesFornecedor(
    item: PedidoItem,
    statusAtual: string
  ) {
    const salvando =
      salvandoFornecedor === item.id;

    const temFornecedor =
      Boolean(
        item.fornecedorId ||
          item.fornecedor
      );

    const numeroFornecedor =
      (
        numeroPedidoFornecedor[item.id] ||
        ""
      ).trim();

    const statusConcluido =
      statusAtual === "ENTREGUE";

    if (!temFornecedor) {
      return (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-600">
            Este produto não possui fornecedor cadastrado.
          </p>

          <p className="mt-1 text-sm leading-5 text-red-500">
            Associe um fornecedor ao produto antes de iniciar o fluxo de dropshipping.
          </p>
        </div>
      );
    }

    if (statusConcluido) {
      return (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-lg">
              ✓
            </div>

            <div>
              <p className="font-bold text-green-700">
                Fluxo concluído
              </p>

              <p className="text-sm text-green-600">
                O pedido do fornecedor foi marcado como entregue.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-5">
        <p className="text-sm font-bold text-[#2d2a26]">
          Próxima ação
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          {statusAtual ===
            "AGUARDANDO_FORNECEDOR" && (
            <button
              type="button"
              onClick={() =>
                encaminharFornecedor(item)
              }
              disabled={salvando}
              className="rounded-full bg-[#e58b6f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {salvando
                ? "Processando..."
                : "Encaminhar ao fornecedor"}
            </button>
          )}

          {statusAtual ===
            "ENCAMINHADO_FORNECEDOR" && (
            <button
              type="button"
              onClick={() =>
                marcarPedidoFornecedorRealizado(
                  item
                )
              }
              disabled={
                salvando ||
                !numeroFornecedor
              }
              className="rounded-full bg-[#e58b6f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {salvando
                ? "Processando..."
                : "Marcar pedido realizado"}
            </button>
          )}

          {statusAtual ===
            "PEDIDO_FORNECEDOR_REALIZADO" && (
            <button
              type="button"
              onClick={() =>
                marcarAguardandoEnvio(item)
              }
              disabled={salvando}
              className="rounded-full bg-[#e58b6f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {salvando
                ? "Processando..."
                : "Aguardar envio"}
            </button>
          )}

          {statusAtual ===
            "AGUARDANDO_ENVIO" && (
            <button
              type="button"
              onClick={() =>
                marcarEnviado(item)
              }
              disabled={salvando}
              className="rounded-full bg-[#e58b6f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {salvando
                ? "Processando..."
                : "Marcar como enviado"}
            </button>
          )}

          {statusAtual === "ENVIADO" && (
            <button
              type="button"
              onClick={() =>
                marcarEntregue(item)
              }
              disabled={salvando}
              className="rounded-full bg-[#e58b6f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {salvando
                ? "Processando..."
                : "Marcar como entregue"}
            </button>
          )}
        </div>

        {statusAtual ===
          "ENCAMINHADO_FORNECEDOR" &&
          !numeroFornecedor && (
            <p className="mt-3 text-sm font-semibold text-orange-600">
              Informe o nº do pedido no fornecedor para liberar a próxima etapa.
            </p>
          )}
      </div>
    );
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#fffaf5] px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-[#eadfd6] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4ec]">
              <span className="text-xl">
                ⏳
              </span>
            </div>

            <p className="mt-4 font-semibold text-[#2d2a26]">
              Carregando pedido...
            </p>

            <p className="mt-1 text-sm text-[#756f69]">
              Aguarde enquanto buscamos os dados do pedido.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (erro || !pedido) {
    return (
      <main className="min-h-screen bg-[#fffaf5] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-red-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="text-5xl">
              ⚠️
            </div>

            <h1 className="mt-4 text-2xl font-bold text-[#2d2a26]">
              Pedido não encontrado
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-500">
              {erro ||
                "Não foi possível carregar este pedido."}
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={carregarPedido}
                className="rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53]"
              >
                Tentar novamente
              </button>

              <Link
                href="/admin/pedidos"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#eadfd6] bg-white px-6 py-3 font-semibold text-[#2d2a26] transition hover:border-[#e58b6f] hover:bg-[#fff4ec]"
              >
                <span>←</span>
                Voltar para pedidos
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const subtotal = Number(
    pedido.subtotal || 0
  );

  const frete = Number(
    pedido.frete || 0
  );

  const desconto = Number(
    pedido.desconto || 0
  );

  const total = Number(
    pedido.total || 0
  );

  const custoTotalFornecedor =
    pedido.itens.reduce(
      (totalCusto, item) => {
        const custo = Number(
          item.custoFornecedor || 0
        );

        return (
          totalCusto +
          custo * item.quantidade
        );
      },
      0
    );

  const receitaProdutos =
    pedido.itens.reduce(
      (totalProdutos, item) => {
        return (
          totalProdutos +
          Number(item.preco || 0) *
            item.quantidade
        );
      },
      0
    );

  const margemBrutaProdutos =
    receitaProdutos -
    custoTotalFornecedor;

  const itensConcluidos =
    pedido.itens.filter(
      (item) =>
        (
          statusFornecedor[item.id] ||
          item.statusFornecedor ||
          "AGUARDANDO_FORNECEDOR"
        ) === "ENTREGUE"
    ).length;

  return (
    <main className="min-h-screen bg-[#fffaf5] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">

        {/* CABEÇALHO */}
        <section className="rounded-3xl border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <Link
                href="/admin/pedidos"
                className="inline-flex items-center gap-2 rounded-full border border-[#eadfd6] bg-white px-5 py-2.5 text-sm font-bold text-[#2d2a26] shadow-sm transition hover:border-[#e58b6f] hover:bg-[#fff4ec] hover:text-[#c96d53]"
              >
                <span className="text-lg">
                  ←
                </span>
                Voltar para pedidos
              </Link>

              <div className="mt-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#fff4ec] px-3 py-1 text-xs font-bold text-[#c96d53]">
                    PEDIDO
                  </span>

                  <span className="text-sm text-[#a39a92]">
                    #{pedido.id}
                  </span>
                </div>

                <h1 className="mt-2 text-3xl font-bold text-[#2d2a26]">
                  Gerenciar pedido #{pedido.id}
                </h1>

                <p className="mt-2 text-sm text-[#756f69]">
                  Realizado em{" "}
                  {formatarData(
                    pedido.createdAt
                  )}
                </p>
              </div>
            </div>

            {/* CONTROLE PRINCIPAL */}
            <div className="rounded-2xl bg-[#fffaf5] p-4 sm:p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#a39a92]">
                Status do pedido
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={statusPedido}
                  onChange={(event) =>
                    setStatusPedido(
                      event.target.value
                    )
                  }
                  disabled={salvandoStatus}
                  className="min-w-[190px] rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 text-sm font-semibold text-[#2d2a26] outline-none transition focus:border-[#e58b6f]"
                >
                  {STATUS_PEDIDO.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {nomeStatusPedido(
                          status
                        )}
                      </option>
                    )
                  )}
                </select>

                <button
                  type="button"
                  onClick={
                    atualizarStatusPedido
                  }
                  disabled={salvandoStatus}
                  className="rounded-2xl bg-[#e58b6f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {salvandoStatus
                    ? "Salvando..."
                    : "Salvar status"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* MENSAGEM */}
        {mensagem && (
          <div
            className={`mt-6 rounded-2xl border px-5 py-4 text-sm font-semibold ${
              tipoMensagem === "erro"
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {mensagem}
          </div>
        )}

        {/* RESUMO */}
        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-[#756f69]">
              Status
            </p>

            <p className="mt-3 text-xl font-bold text-[#2d2a26]">
              {nomeStatusPedido(
                pedido.status
              )}
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-[#756f69]">
              Pagamento
            </p>

            <p className="mt-3 text-xl font-bold text-[#2d2a26]">
              {pedido.pagamento}
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-[#756f69]">
              Total
            </p>

            <p className="mt-3 text-xl font-bold text-[#e58b6f]">
              {formatarPreco(total)}
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-[#756f69]">
              Dropshipping
            </p>

            <p className="mt-3 text-xl font-bold text-[#2d2a26]">
              {itensConcluidos}/
              {pedido.itens.length}
            </p>

            <p className="mt-1 text-xs text-[#a39a92]">
              itens concluídos
            </p>
          </div>
        </section>

        {/* CLIENTE E ENDEREÇO */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4ec]">
                👤
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#2d2a26]">
                  Cliente
                </h2>

                <p className="text-sm text-[#756f69]">
                  Dados do comprador
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                  Nome
                </p>

                <p className="mt-1 font-semibold text-[#2d2a26]">
                  {pedido.nomeCliente}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                  E-mail
                </p>

                <p className="mt-1 break-all text-sm text-[#756f69]">
                  {pedido.emailCliente ||
                    "Não informado"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                  Telefone
                </p>

                <p className="mt-1 text-sm text-[#756f69]">
                  {pedido.telefoneCliente ||
                    "Não informado"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4ec]">
                📍
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#2d2a26]">
                  Endereço de entrega
                </h2>

                <p className="text-sm text-[#756f69]">
                  Local de recebimento
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm leading-6 text-[#756f69]">
              {pedido.cep && (
                <p>
                  <strong className="text-[#2d2a26]">
                    CEP:
                  </strong>{" "}
                  {pedido.cep}
                </p>
              )}

              {pedido.endereco && (
                <p className="font-semibold text-[#2d2a26]">
                  {pedido.endereco}
                  {pedido.numero
                    ? `, ${pedido.numero}`
                    : ""}
                </p>
              )}

              {pedido.complemento && (
                <p>
                  {pedido.complemento}
                </p>
              )}

              {pedido.bairro && (
                <p>
                  {pedido.bairro}
                </p>
              )}

              {(pedido.cidade ||
                pedido.estado) && (
                <p>
                  {pedido.cidade || ""}
                  {pedido.cidade &&
                  pedido.estado
                    ? " - "
                    : ""}
                  {pedido.estado || ""}
                </p>
              )}

              {!pedido.endereco &&
                !pedido.cidade &&
                !pedido.cep && (
                  <p>
                    Endereço não informado.
                  </p>
                )}
            </div>
          </div>
        </section>

        {/* ITENS */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-[#eadfd6] bg-white shadow-sm">
          <div className="border-b border-[#eadfd6] bg-[#fffaf5] px-6 py-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#2d2a26]">
                  Itens do pedido
                </h2>

                <p className="mt-1 text-sm text-[#756f69]">
                  Gerencie produtos, fornecedores e o fluxo de dropshipping.
                </p>
              </div>

              <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#2d2a26]">
                {pedido.itens.length}{" "}
                {pedido.itens.length === 1
                  ? "item"
                  : "itens"}
              </span>
            </div>
          </div>

          <div className="divide-y divide-[#eadfd6]">
            {pedido.itens.map(
              (item) => {
                const imagemUrl =
                  obterUrlImagem(
                    item.produto?.imagem
                  );

                const custoItem =
                  Number(
                    item.custoFornecedor || 0
                  ) *
                  item.quantidade;

                const vendaItem =
                  Number(
                    item.preco || 0
                  ) *
                  item.quantidade;

                const statusAtual =
                  statusFornecedor[
                    item.id
                  ] ||
                  item.statusFornecedor ||
                  "AGUARDANDO_FORNECEDOR";

                const indiceAtual =
                  indiceStatusFornecedor(
                    statusAtual
                  );

                return (
                  <article
                    key={item.id}
                    className="p-6 sm:p-7"
                  >
                    {/* PRODUTO */}
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#eadfd6] bg-[#fff4ec]">
                          {imagemUrl ? (
                            <img
                              src={imagemUrl}
                              alt={`${item.nomeProduto} - produto`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <span className="text-4xl">
                              📦
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                            Produto #
                            {item.produtoId}
                          </p>

                          <h3 className="mt-1 break-words text-lg font-bold text-[#2d2a26]">
                            {item.nomeProduto}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#fff4ec] px-3 py-1 text-xs font-bold text-[#c96d53]">
                              Qtd:{" "}
                              {item.quantidade}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${classeStatusFornecedor(
                                statusAtual
                              )}`}
                            >
                              {nomeStatusFornecedor(
                                statusAtual
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#fffaf5] p-4 text-left xl:min-w-[210px] xl:text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                          Preço unitário
                        </p>

                        <p className="mt-1 text-lg font-bold text-[#2d2a26]">
                          {formatarPreco(
                            item.preco
                          )}
                        </p>

                        <p className="mt-1 text-sm text-[#756f69]">
                          Total:{" "}
                          <strong className="text-[#2d2a26]">
                            {formatarPreco(
                              vendaItem
                            )}
                          </strong>
                        </p>
                      </div>
                    </div>

                    {/* FLUXO */}
                    <div className="mt-7 overflow-x-auto">
                      <div className="min-w-[760px]">
                        <div className="flex items-center">
                          {STATUS_FORNECEDOR.map(
                            (
                              status,
                              index
                            ) => {
                              const concluido =
                                indiceAtual >=
                                index;

                              const atual =
                                statusAtual ===
                                status;

                              return (
                                <div
                                  key={status}
                                  className="flex flex-1 items-center"
                                >
                                  <div className="flex flex-col items-center text-center">
                                    <div
                                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                                        concluido
                                          ? "border-[#e58b6f] bg-[#e58b6f] text-white"
                                          : "border-[#eadfd6] bg-white text-[#a39a92]"
                                      }`}
                                    >
                                      {concluido
                                        ? "✓"
                                        : index +
                                          1}
                                    </div>

                                    <p
                                      className={`mt-2 max-w-[115px] text-[11px] font-semibold ${
                                        atual
                                          ? "text-[#c96d53]"
                                          : concluido
                                          ? "text-[#756f69]"
                                          : "text-[#a39a92]"
                                      }`}
                                    >
                                      {nomeStatusFornecedor(
                                        status
                                      )}
                                    </p>
                                  </div>

                                  {index <
                                    STATUS_FORNECEDOR.length -
                                      1 && (
                                    <div
                                      className={`mx-2 h-0.5 flex-1 ${
                                        indiceAtual >
                                        index
                                          ? "bg-[#e58b6f]"
                                          : "bg-[#eadfd6]"
                                      }`}
                                    />
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    {/* FORNECEDOR */}
                    <div className="mt-7 rounded-3xl bg-[#fffaf5] p-5 sm:p-6">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <h4 className="font-bold text-[#2d2a26]">
                            Fornecedor
                          </h4>

                          <p className="mt-1 text-sm text-[#756f69]">
                            Dados utilizados no encaminhamento do produto.
                          </p>
                        </div>

                        {item.fornecedor ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            Fornecedor cadastrado
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                            Sem fornecedor
                          </span>
                        )}
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                            Nome
                          </p>

                          <p className="mt-1 font-semibold text-[#2d2a26]">
                            {item.fornecedorNome ||
                              item.fornecedor?.nome ||
                              "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                            Empresa
                          </p>

                          <p className="mt-1 text-sm text-[#756f69]">
                            {item.fornecedor?.empresa ||
                              "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                            SKU
                          </p>

                          <p className="mt-1 font-semibold text-[#2d2a26]">
                            {item.skuFornecedor ||
                              "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                            Custo unitário
                          </p>

                          <p className="mt-1 font-semibold text-[#2d2a26]">
                            {item.custoFornecedor !==
                              null &&
                            item.custoFornecedor !==
                              undefined
                              ? formatarPreco(
                                  item.custoFornecedor
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                            Custo total
                          </p>

                          <p className="mt-1 font-bold text-[#2d2a26]">
                            {formatarPreco(
                              custoItem
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                            Link do fornecedor
                          </p>

                          {item.linkFornecedor ? (
                            <a
                              href={
                                item.linkFornecedor
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-block break-all text-sm font-semibold text-[#e58b6f] hover:text-[#c96d53]"
                            >
                              {
                                item.linkFornecedor
                              }
                            </a>
                          ) : (
                            <p className="mt-1 text-sm text-[#756f69]">
                              —
                            </p>
                          )}
                        </div>
                      </div>

                      {!item.fornecedor && (
                        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                          Este produto está sem fornecedor cadastrado. Cadastre ou associe um fornecedor antes de encaminhar o pedido.
                        </div>
                      )}
                    </div>

                    {/* CONTROLE DROPSHIPPING */}
                    <div className="mt-6 rounded-3xl border border-[#eadfd6] p-5 sm:p-6">
                      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                        <div>
                          <h4 className="font-bold text-[#2d2a26]">
                            Operação de dropshipping
                          </h4>

                          <p className="mt-1 text-sm text-[#756f69]">
                            Controle aqui cada etapa do pedido junto ao fornecedor.
                          </p>
                        </div>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${classeStatusFornecedor(
                            statusAtual
                          )}`}
                        >
                          {nomeStatusFornecedor(
                            statusAtual
                          )}
                        </span>
                      </div>

                      {renderizarAcoesFornecedor(
                        item,
                        statusAtual
                      )}

                      {/* FORMULÁRIO MANUAL */}
                      <div className="mt-7 rounded-2xl bg-[#fffaf5] p-5">
                        <div>
                          <h5 className="font-bold text-[#2d2a26]">
                            Controle manual
                          </h5>

                          <p className="mt-1 text-sm text-[#756f69]">
                            Atualize a etapa e o número do pedido no fornecedor.
                          </p>
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
                          <div>
                            <label
                              htmlFor={`status-fornecedor-${item.id}`}
                              className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                            >
                              Status do fornecedor
                            </label>

                            <select
                              id={`status-fornecedor-${item.id}`}
                              value={statusAtual}
                              onChange={(
                                event
                              ) => {
                                const valor =
                                  event.target
                                    .value;

                                setStatusFornecedor(
                                  (anterior) => ({
                                    ...anterior,
                                    [item.id]:
                                      valor,
                                  })
                                );
                              }}
                              disabled={
                                salvandoFornecedor ===
                                item.id
                              }
                              className="w-full rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 text-sm font-semibold text-[#2d2a26] outline-none transition focus:border-[#e58b6f]"
                            >
                              {STATUS_FORNECEDOR.map(
                                (status) => (
                                  <option
                                    key={
                                      status
                                    }
                                    value={
                                      status
                                    }
                                  >
                                    {nomeStatusFornecedor(
                                      status
                                    )}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor={`numero-pedido-fornecedor-${item.id}`}
                              className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                            >
                              Nº do pedido no fornecedor
                            </label>

                            <input
                              id={`numero-pedido-fornecedor-${item.id}`}
                              type="text"
                              value={
                                numeroPedidoFornecedor[
                                  item.id
                                ] || ""
                              }
                              onChange={(
                                event
                              ) =>
                                setNumeroPedidoFornecedor(
                                  (anterior) => ({
                                    ...anterior,
                                    [item.id]:
                                      event.target
                                        .value,
                                  })
                                )
                              }
                              placeholder="Ex.: 123456789"
                              disabled={
                                salvandoFornecedor ===
                                item.id
                              }
                              className="w-full rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 text-sm text-[#2d2a26] outline-none transition focus:border-[#e58b6f]"
                            />
                          </div>

                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() =>
                                atualizarStatusFornecedor(
                                  item
                                )
                              }
                              disabled={
                                salvandoFornecedor ===
                                item.id
                              }
                              className="w-full rounded-2xl bg-[#e58b6f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:bg-gray-300 lg:w-auto"
                            >
                              {salvandoFornecedor ===
                              item.id
                                ? "Salvando..."
                                : "Salvar etapa"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* HISTÓRICO */}
                      <div className="mt-7">
                        <p className="text-sm font-bold text-[#2d2a26]">
                          Histórico do fornecedor
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl bg-[#fffaf5] p-4">
                            <p className="text-xs font-semibold text-[#a39a92]">
                              Encaminhamento
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#2d2a26]">
                              {formatarData(
                                item.dataEncaminhamento
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-[#fffaf5] p-4">
                            <p className="text-xs font-semibold text-[#a39a92]">
                              Pedido realizado
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#2d2a26]">
                              {formatarData(
                                item.dataPedidoFornecedor
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-[#fffaf5] p-4">
                            <p className="text-xs font-semibold text-[#a39a92]">
                              Envio
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#2d2a26]">
                              {formatarData(
                                item.dataEnvioFornecedor
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-[#fffaf5] p-4">
                            <p className="text-xs font-semibold text-[#a39a92]">
                              Entrega
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#2d2a26]">
                              {formatarData(
                                item.dataEntregaFornecedor
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CONTATO */}
                    {item.fornecedor && (
                      <div className="mt-5 rounded-2xl bg-[#fffaf5] p-5">
                        <h4 className="font-bold text-[#2d2a26]">
                          Contato do fornecedor
                        </h4>

                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                              E-mail
                            </p>

                            <p className="mt-1 break-all text-sm text-[#756f69]">
                              {item.fornecedor
                                .email ||
                                "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                              Telefone
                            </p>

                            <p className="mt-1 text-sm text-[#756f69]">
                              {item.fornecedor
                                .telefone ||
                                "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                              Site
                            </p>

                            {item.fornecedor
                              .site ? (
                              <a
                                href={
                                  item.fornecedor
                                    .site
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 block break-all text-sm font-semibold text-[#e58b6f] hover:text-[#c96d53]"
                              >
                                {
                                  item.fornecedor
                                    .site
                                }
                              </a>
                            ) : (
                              <p className="mt-1 text-sm text-[#756f69]">
                                —
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        </section>

        {/* PAGAMENTO E FINANCEIRO */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#2d2a26]">
              Informações do pagamento
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex justify-between gap-4">
                <span className="text-[#756f69]">
                  Forma de pagamento
                </span>

                <strong className="text-right text-[#2d2a26]">
                  {pedido.pagamento}
                </strong>
              </div>

              {pedido.codigoCupom && (
                <div className="flex justify-between gap-4">
                  <span className="text-[#756f69]">
                    Cupom
                  </span>

                  <strong className="text-[#2d2a26]">
                    {pedido.codigoCupom}
                  </strong>
                </div>
              )}

              <div className="flex justify-between gap-4">
                <span className="text-[#756f69]">
                  Subtotal
                </span>

                <strong className="text-[#2d2a26]">
                  {formatarPreco(subtotal)}
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#756f69]">
                  Frete
                </span>

                <strong className="text-[#2d2a26]">
                  {formatarPreco(frete)}
                </strong>
              </div>

              {desconto > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-[#756f69]">
                    Desconto
                  </span>

                  <strong className="text-green-600">
                    -{" "}
                    {formatarPreco(
                      desconto
                    )}
                  </strong>
                </div>
              )}

              <div className="border-t border-[#eadfd6] pt-4">
                <div className="flex justify-between gap-4">
                  <span className="text-lg font-bold text-[#2d2a26]">
                    Total
                  </span>

                  <strong className="text-xl font-bold text-[#e58b6f]">
                    {formatarPreco(total)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#2d2a26]">
              Resumo do dropshipping
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex justify-between gap-4">
                <span className="text-[#756f69]">
                  Receita dos produtos
                </span>

                <strong className="text-[#2d2a26]">
                  {formatarPreco(
                    receitaProdutos
                  )}
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#756f69]">
                  Custo dos fornecedores
                </span>

                <strong className="text-[#2d2a26]">
                  {formatarPreco(
                    custoTotalFornecedor
                  )}
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#756f69]">
                  Próxima etapa
                </span>

                <strong className="text-right text-[#2d2a26]">
                  {pedido.itens.length === 1
                    ? textoProximaEtapa(
                        statusFornecedor[
                          pedido.itens[0].id
                        ] ||
                          pedido.itens[0]
                            .statusFornecedor ||
                          "AGUARDANDO_FORNECEDOR"
                      )
                    : `${itensConcluidos} de ${pedido.itens.length} concluídos`}
                </strong>
              </div>

              <div className="border-t border-[#eadfd6] pt-4">
                <div className="flex justify-between gap-4">
                  <span className="font-bold text-[#2d2a26]">
                    Margem bruta dos produtos
                  </span>

                  <strong
                    className={
                      margemBrutaProdutos >=
                      0
                        ? "font-bold text-green-600"
                        : "font-bold text-red-500"
                    }
                  >
                    {formatarPreco(
                      margemBrutaProdutos
                    )}
                  </strong>
                </div>
              </div>

              <p className="pt-2 text-xs leading-5 text-[#a39a92]">
                A margem acima considera apenas a diferença entre o valor vendido dos produtos e o custo informado dos fornecedores. Não considera impostos, taxas de pagamento, frete ou outras despesas operacionais.
              </p>
            </div>
          </div>
        </section>

        {/* RODAPÉ */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#eadfd6] bg-white px-5 py-3 text-sm font-bold text-[#2d2a26] shadow-sm transition hover:border-[#e58b6f] hover:bg-[#fff4ec] hover:text-[#c96d53]"
          >
            <span className="text-lg">
              ←
            </span>
            Voltar para pedidos
          </Link>

          <button
            type="button"
            onClick={() => {
              carregarPedido();
              router.refresh();
            }}
            className="rounded-full border border-[#eadfd6] bg-white px-5 py-3 text-sm font-semibold text-[#2d2a26] transition hover:border-[#e58b6f] hover:bg-[#fff4ec]"
          >
            ↻ Atualizar página
          </button>
        </div>
      </div>
    </main>
  );
}