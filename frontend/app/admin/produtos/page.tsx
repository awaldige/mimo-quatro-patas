"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
  };
};

interface Categoria {
  id: number;
  nome: string;
  ativo?: boolean;
}

interface Fornecedor {
  id: number;
  nome: string;
  empresa?: string | null;
  ativo?: boolean;
}

interface Produto {
  id: number;
  nome: string;
  descricao?: string | null;
  imagem?: string | null;

  preco: string | number;
  precoPromo?: string | number | null;

  estoque: number;
  ativo: boolean;
  destaque: boolean;
  oferta: boolean;

  categoriaId?: number | null;
  fornecedorId?: number | null;

  categoria?: Categoria | null;
  fornecedor?: Fornecedor | null;

  custoFornecedor?: string | number | null;
  linkFornecedor?: string | null;
  skuFornecedor?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

/**
 * URL base da API.
 *
 * A variável da Vercel deve conter:
 * https://mimo-quatro-patas.onrender.com
 *
 * Mesmo que alguém configure a variável com /api,
 * removemos para manter o padrão do projeto.
 */
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export default function ProdutosAdminPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  const [processandoId, setProcessandoId] = useState<number | null>(null);

  const [mensagem, setMensagem] = useState("");

  /**
   * Converte uma resposta da API com segurança.
   *
   * Evita o erro:
   * Unexpected token '<', "<!DOCTYPE "... is not valid JSON
   *
   * quando a URL retorna HTML em vez de JSON.
   */
  async function lerResposta(response: Response) {
    const texto = await response.text();

    if (!texto) {
      return null;
    }

    try {
      return JSON.parse(texto);
    } catch {
      throw new Error(
        `A API retornou uma resposta inválida. Status: ${response.status} ${response.statusText}`
      );
    }
  }

  /**
   * Carrega produtos e categorias.
   */
  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");
      setMensagem("");

      const produtosUrl = `${API_URL}/api/produtos`;
      const categoriasUrl = `${API_URL}/api/categorias`;

      console.log("[Admin Produtos] API:", API_URL);
      console.log("[Admin Produtos] Produtos:", produtosUrl);
      console.log("[Admin Produtos] Categorias:", categoriasUrl);

      const [produtosResponse, categoriasResponse] = await Promise.all([
        fetch(produtosUrl, {
          cache: "no-store",
        }),

        fetch(categoriasUrl, {
          cache: "no-store",
        }),
      ]);

      const produtosData = await lerResposta(produtosResponse);
      const categoriasData = await lerResposta(categoriasResponse);

      if (!produtosResponse.ok) {
        throw new Error(
          produtosData?.message ||
            produtosData?.error ||
            "Não foi possível carregar os produtos."
        );
      }

      if (!categoriasResponse.ok) {
        throw new Error(
          categoriasData?.message ||
            categoriasData?.error ||
            "Não foi possível carregar as categorias."
        );
      }

      const listaProdutos = Array.isArray(produtosData)
        ? produtosData
        : Array.isArray(produtosData?.produtos)
          ? produtosData.produtos
          : Array.isArray(produtosData?.data)
            ? produtosData.data
            : [];

      const listaCategorias = Array.isArray(categoriasData)
        ? categoriasData
        : Array.isArray(categoriasData?.categorias)
          ? categoriasData.categorias
          : Array.isArray(categoriasData?.data)
            ? categoriasData.data
            : [];

      setProdutos(listaProdutos);
      setCategorias(listaCategorias);
    } catch (error) {
      console.error("[Admin Produtos] Erro ao carregar:", error);

      setProdutos([]);
      setCategorias([]);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar produtos."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  /**
   * Formata valores em reais.
   */
  function formatarMoeda(valor: string | number) {
    const numero = Number(valor);

    if (Number.isNaN(numero)) {
      return "R$ 0,00";
    }

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  /**
   * Retorna o preço efetivo de venda.
   */
  function obterPrecoAtual(produto: Produto) {
    const preco = Number(produto.preco);

    const precoPromo =
      produto.precoPromo !== null &&
      produto.precoPromo !== undefined
        ? Number(produto.precoPromo)
        : null;

    if (
      precoPromo !== null &&
      !Number.isNaN(precoPromo) &&
      precoPromo > 0 &&
      precoPromo < preco
    ) {
      return precoPromo;
    }

    return preco;
  }

  /**
   * Verifica se o produto possui promoção válida.
   */
  function possuiPromocao(produto: Produto) {
    const preco = Number(produto.preco);

    const precoPromo =
      produto.precoPromo !== null &&
      produto.precoPromo !== undefined
        ? Number(produto.precoPromo)
        : null;

    return (
      precoPromo !== null &&
      !Number.isNaN(precoPromo) &&
      precoPromo > 0 &&
      precoPromo < preco
    );
  }

  /**
   * Monta a URL da imagem do produto.
   */
  function obterImagemUrl(imagem?: string | null) {
    if (!imagem) {
      return null;
    }

    const imagemNormalizada = String(imagem).trim();

    if (!imagemNormalizada) {
      return null;
    }

    if (
      imagemNormalizada.startsWith("http://") ||
      imagemNormalizada.startsWith("https://")
    ) {
      return imagemNormalizada;
    }

    if (
      imagemNormalizada.startsWith("/imagem/") ||
      imagemNormalizada.startsWith("/images/") ||
      imagemNormalizada.startsWith("/produtos/")
    ) {
      return imagemNormalizada;
    }

    if (imagemNormalizada.startsWith("/uploads/")) {
      return `${API_URL}${imagemNormalizada}`;
    }

    if (imagemNormalizada.startsWith("/")) {
      return imagemNormalizada;
    }

    return `${API_URL}/uploads/${imagemNormalizada}`;
  }

  /**
   * Produtos filtrados.
   */
  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return produtos.filter((produto) => {
      const nomeProduto = String(produto.nome || "").toLowerCase();

      const sku = produto.skuFornecedor
        ? String(produto.skuFornecedor).toLowerCase()
        : "";

      const correspondeBusca =
        !termo ||
        nomeProduto.includes(termo) ||
        String(produto.id).includes(termo) ||
        sku.includes(termo);

      const correspondeCategoria =
        !filtroCategoria ||
        String(produto.categoriaId) === filtroCategoria;

      const correspondeStatus =
        filtroStatus === "TODOS" ||
        (filtroStatus === "ATIVOS" && produto.ativo) ||
        (filtroStatus === "INATIVOS" && !produto.ativo);

      return (
        correspondeBusca &&
        correspondeCategoria &&
        correspondeStatus
      );
    });
  }, [produtos, busca, filtroCategoria, filtroStatus]);

  const quantidadeAtivos = produtos.filter(
    (produto) => produto.ativo
  ).length;

  const quantidadeInativos = produtos.filter(
    (produto) => !produto.ativo
  ).length;

  const quantidadeOfertas = produtos.filter(
    (produto) => produto.oferta
  ).length;

  const quantidadeDestaques = produtos.filter(
    (produto) => produto.destaque
  ).length;

  /**
   * Ativa/desativa um produto.
   */
  async function alterarStatus(produto: Produto) {
    try {
      setProcessandoId(produto.id);
      setMensagem("");

      const response = await fetch(
        `${API_URL}/api/produtos/${produto.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ativo: !produto.ativo,
          }),
        }
      );

      const data = await lerResposta(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Não foi possível alterar o status do produto."
        );
      }

      setProdutos((anterior) =>
        anterior.map((item) =>
          item.id === produto.id
            ? {
                ...item,
                ativo: !produto.ativo,
              }
            : item
        )
      );

      setMensagem(
        produto.ativo
          ? "Produto desativado com sucesso."
          : "Produto ativado com sucesso."
      );
    } catch (error) {
      console.error(
        "[Admin Produtos] Erro ao alterar status:",
        error
      );

      setMensagem(
        error instanceof Error
          ? error.message
          : "Erro ao alterar status do produto."
      );
    } finally {
      setProcessandoId(null);
    }
  }

  /**
   * Exclui um produto.
   */
  async function excluirProduto(produto: Produto) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o produto "${produto.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setProcessandoId(produto.id);
      setMensagem("");

      const response = await fetch(
        `${API_URL}/api/produtos/${produto.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await lerResposta(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Não foi possível excluir o produto."
        );
      }

      setProdutos((anterior) =>
        anterior.filter(
          (item) => item.id !== produto.id
        )
      );

      setMensagem("Produto excluído com sucesso.");
    } catch (error) {
      console.error(
        "[Admin Produtos] Erro ao excluir:",
        error
      );

      setMensagem(
        error instanceof Error
          ? error.message
          : "Erro ao excluir produto."
      );
    } finally {
      setProcessandoId(null);
    }
  }

  /**
   * Estado de carregamento.
   */
  if (carregando) {
    return (
      <main className="min-h-screen bg-[#fffaf5] px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-[#eadfd6] bg-white px-6 py-16 text-center shadow-sm">
            <div
              className="text-5xl"
              role="img"
              aria-label="Patinha"
            >
              🐾
            </div>

            <p className="mt-4 font-semibold text-[#756f69]">
              Carregando produtos...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /**
   * Estado de erro.
   */
  if (erro) {
    return (
      <main className="min-h-screen bg-[#fffaf5] px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-200 bg-white px-6 py-16 text-center shadow-sm">
            <div
              className="text-5xl"
              role="img"
              aria-label="Atenção"
            >
              ⚠️
            </div>

            <h1 className="mt-4 text-2xl font-bold text-[#2d2a26]">
              Não foi possível carregar os produtos
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-[#756f69]">
              {erro}
            </p>

            <button
              type="button"
              onClick={carregarDados}
              className="mt-6 rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53]"
            >
              Tentar novamente
            </button>

            <p className="mt-4 text-xs text-[#a39a92]">
              API: {API_URL}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-[#e58b6f] transition hover:text-[#c96d53]"
            >
              ← Voltar para administração
            </Link>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2d2a26] md:text-4xl">
              Gerenciar Produtos
            </h1>

            <p className="mt-2 text-[#756f69]">
              Cadastre, edite e gerencie os produtos da
              Mimo Quatro Patas.
            </p>
          </div>

          {/* Ações principais */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/produtos/lote"
              className="inline-flex w-fit items-center rounded-full border border-[#d9b8ff] bg-white px-6 py-3 font-semibold text-purple-700 shadow-sm transition hover:bg-purple-50"
            >
              📦 Cadastro em lote
            </Link>

            <Link
              href="/admin/produtos/novo"
              className="inline-flex w-fit items-center rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#c96d53]"
            >
              + Novo produto
            </Link>
          </div>
        </div>

        {/* Mensagem */}
        {mensagem && (
          <div className="mt-6 rounded-2xl border border-[#eadfd6] bg-white px-5 py-4 text-sm font-semibold text-[#c96d53] shadow-sm">
            {mensagem}
          </div>
        )}

        {/* Indicadores */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-[#eadfd6] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#756f69]">
              Total de produtos
            </p>

            <p className="mt-2 text-3xl font-bold text-[#2d2a26]">
              {produtos.length}
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#756f69]">
              Produtos ativos
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {quantidadeAtivos}
            </p>

            <p className="mt-1 text-xs text-[#a39a92]">
              {quantidadeInativos} inativos
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#756f69]">
              Ofertas
            </p>

            <p className="mt-2 text-3xl font-bold text-[#e58b6f]">
              {quantidadeOfertas}
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#756f69]">
              Destaques
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {quantidadeDestaques}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <section className="mt-6 rounded-3xl border border-[#eadfd6] bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px]">
            <div>
              <label
                htmlFor="busca-produto"
                className="block text-sm font-bold text-[#2d2a26]"
              >
                Buscar produto
              </label>

              <input
                id="busca-produto"
                type="text"
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
                placeholder="Nome, ID ou SKU do fornecedor..."
                className="mt-2 w-full rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 text-[#2d2a26] outline-none transition placeholder:text-[#b8afa8] focus:border-[#e58b6f]"
              />
            </div>

            <div>
              <label
                htmlFor="filtro-categoria"
                className="block text-sm font-bold text-[#2d2a26]"
              >
                Categoria
              </label>

              <select
                id="filtro-categoria"
                value={filtroCategoria}
                onChange={(event) =>
                  setFiltroCategoria(event.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 font-semibold text-[#2d2a26] outline-none focus:border-[#e58b6f]"
              >
                <option value="">
                  Todas as categorias
                </option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria.id}
                    value={categoria.id}
                  >
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filtro-status"
                className="block text-sm font-bold text-[#2d2a26]"
              >
                Status
              </label>

              <select
                id="filtro-status"
                value={filtroStatus}
                onChange={(event) =>
                  setFiltroStatus(event.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 font-semibold text-[#2d2a26] outline-none focus:border-[#e58b6f]"
              >
                <option value="TODOS">Todos</option>
                <option value="ATIVOS">Ativos</option>
                <option value="INATIVOS">Inativos</option>
              </select>
            </div>
          </div>
        </section>

        {/* Lista */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-[#eadfd6] bg-white shadow-sm">
          <div className="border-b border-[#eadfd6] px-6 py-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-[#2d2a26]">
                  Produtos cadastrados
                </h2>

                <p className="mt-1 text-sm text-[#756f69]">
                  {produtosFiltrados.length}{" "}
                  {produtosFiltrados.length === 1
                    ? "produto encontrado"
                    : "produtos encontrados"}
                </p>
              </div>
            </div>
          </div>

          {produtosFiltrados.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div
                className="text-5xl"
                role="img"
                aria-label="Pesquisa"
              >
                🔎
              </div>

              <h3 className="mt-4 text-xl font-bold text-[#2d2a26]">
                Nenhum produto encontrado
              </h3>

              <p className="mt-2 text-[#756f69]">
                Tente alterar os filtros ou cadastrar um
                novo produto.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#eadfd6]">
              {produtosFiltrados.map((produto) => {
                const imagemUrl = obterImagemUrl(
                  produto.imagem
                );

                const promocao =
                  possuiPromocao(produto);

                const precoAtual =
                  obterPrecoAtual(produto);

                const estoqueBaixo =
                  produto.estoque > 0 &&
                  produto.estoque <= 5;

                const semEstoque =
                  produto.estoque <= 0;

                return (
                  <article
                    key={produto.id}
                    className="p-5 transition hover:bg-[#fffdfb] md:p-6"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      {/* Produto */}
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#fff4ec]">
                          {imagemUrl ? (
                            <img
                              src={imagemUrl}
                              alt={produto.nome}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <span className="text-4xl">
                              🐾
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-[#2d2a26]">
                              {produto.nome}
                            </h3>

                            {!produto.ativo && (
                              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                                Inativo
                              </span>
                            )}

                            {produto.destaque && (
                              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                                Destaque
                              </span>
                            )}

                            {produto.oferta && (
                              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                                Oferta
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-[#756f69]">
                            Produto #{produto.id}

                            {produto.categoria?.nome
                              ? ` • ${produto.categoria.nome}`
                              : ""}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#fff4ec] px-3 py-1 text-sm font-semibold text-[#756f69]">
                              Estoque: {produto.estoque}
                            </span>

                            {semEstoque && (
                              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                                Sem estoque
                              </span>
                            )}

                            {estoqueBaixo && (
                              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700">
                                Estoque baixo
                              </span>
                            )}

                            <span className="rounded-full bg-[#fff4ec] px-3 py-1 text-sm font-semibold text-[#756f69]">
                              {formatarMoeda(precoAtual)}
                            </span>

                            {promocao && (
                              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                                Promoção
                              </span>
                            )}
                          </div>

                          {produto.fornecedor && (
                            <p className="mt-3 text-sm text-[#756f69]">
                              <strong>
                                Fornecedor:
                              </strong>{" "}
                              {produto.fornecedor.nome}

                              {produto.skuFornecedor
                                ? ` • SKU: ${produto.skuFornecedor}`
                                : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Preços */}
                      <div className="grid gap-4 sm:grid-cols-2 xl:min-w-[260px]">
                        <div className="rounded-2xl bg-[#fffaf5] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                            Preço
                          </p>

                          <p
                            className={`mt-1 font-bold ${
                              promocao
                                ? "text-sm text-[#a39a92] line-through"
                                : "text-xl text-[#2d2a26]"
                            }`}
                          >
                            {formatarMoeda(
                              produto.preco
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#fffaf5] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#a39a92]">
                            Venda
                          </p>

                          <p className="mt-1 text-xl font-bold text-[#e58b6f]">
                            {formatarMoeda(
                              precoAtual
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <Link
                          href={`/admin/produtos/${produto.id}`}
                          className="rounded-full border border-[#eadfd6] bg-white px-4 py-2 text-sm font-semibold text-[#2d2a26] transition hover:bg-[#fff4ec]"
                        >
                          Editar
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            alterarStatus(produto)
                          }
                          disabled={
                            processandoId ===
                            produto.id
                          }
                          className="rounded-full border border-[#eadfd6] bg-white px-4 py-2 text-sm font-semibold text-[#756f69] transition hover:bg-[#fff4ec] disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                          {processandoId ===
                          produto.id
                            ? "Processando..."
                            : produto.ativo
                              ? "Desativar"
                              : "Ativar"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            excluirProduto(produto)
                          }
                          disabled={
                            processandoId ===
                            produto.id
                          }
                          className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Rodapé */}
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <Link
            href="/admin"
            className="rounded-full border border-[#eadfd6] bg-white px-6 py-3 font-semibold text-[#2d2a26] transition hover:bg-[#fff4ec]"
          >
            ← Administração
          </Link>

          <Link
            href="/admin/produtos/lote"
            className="rounded-full border border-[#d9b8ff] bg-white px-6 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
          >
            📦 Cadastro em lote
          </Link>

          <Link
            href="/admin/produtos/novo"
            className="rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53]"
          >
            + Cadastrar produto
          </Link>
        </div>
      </div>
    </main>
  );
}