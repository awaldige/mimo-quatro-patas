
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  Produto,
  getProdutos,
  getCategorias,
  getImagemUrl,
  Categoria,
} from "@/services/api";

import AdicionarAoCarrinho from "@/components/AdicionarAoCarrinho";

export default function ProdutosClient() {
  console.log("[Produtos] COMPONENTE CARREGOU");

  const searchParams = useSearchParams();
  const categoriaParam = searchParams.get("categoria");

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const categoriaId = categoriaParam
    ? Number(categoriaParam)
    : null;

  const categoriaSelecionada =
    categoriaId && !Number.isNaN(categoriaId)
      ? categorias.find(
          (categoria) => Number(categoria.id) === categoriaId
        )
      : null;

  useEffect(() => {
    console.log("[Produtos] USEEFFECT EXECUTOU");

    async function carregarProdutos() {
      try {
        setCarregando(true);
        setErro("");

        const [dadosProdutos, dadosCategorias] =
          await Promise.all([
            getProdutos(),
            getCategorias(),
          ]);

        console.log(
          "[Produtos] Dados recebidos:",
          dadosProdutos
        );

        console.log(
          "[Produtos] Quantidade total:",
          dadosProdutos.length
        );

        console.log(
          "[Produtos] Categoria selecionada:",
          categoriaId
        );

        setCategorias(dadosCategorias);

        if (
          categoriaId !== null &&
          !Number.isNaN(categoriaId)
        ) {
          const produtosFiltrados = dadosProdutos.filter(
            (produto) =>
              Number(produto.categoriaId) === categoriaId
          );

          console.log(
            "[Produtos] Produtos da categoria:",
            produtosFiltrados
          );

          console.log(
            "[Produtos] Quantidade filtrada:",
            produtosFiltrados.length
          );

          setProdutos(produtosFiltrados);
        } else {
          setProdutos(dadosProdutos);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar produtos:",
          error
        );

        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os produtos."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarProdutos();
  }, [categoriaId]);

  function formatarPreco(
    valor: string | number | null | undefined
  ) {
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

  function calcularDesconto(
    preco: string | number,
    precoPromo?: string | number | null
  ) {
    const precoOriginal = Number(preco);
    const precoPromocional = Number(precoPromo);

    if (
      !precoOriginal ||
      !precoPromocional ||
      precoPromocional >= precoOriginal
    ) {
      return 0;
    }

    return Math.round(
      ((precoOriginal - precoPromocional) /
        precoOriginal) *
        100
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            CABEÇALHO
        ===================================================== */}

        <div className="mb-10">

          <Link
            href="/"
            className="text-sm font-semibold text-[#e58b6f] transition hover:text-[#c96d53]"
          >
            ← Voltar para a página inicial
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <h1 className="text-3xl font-bold text-[#2d2a26]">
                {categoriaSelecionada
                  ? categoriaSelecionada.nome
                  : "Produtos para Cães e Gatos"}
              </h1>

              <p className="mt-2 text-[#756f69]">
                {categoriaSelecionada
                  ? categoriaSelecionada.descricao ||
                    `Confira os produtos da categoria ${categoriaSelecionada.nome}.`
                  : "Encontre produtos especiais, acessórios e mimos para cuidar do seu pet."}
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              {categoriaSelecionada && (
                <Link
                  href="/produtos"
                  className="inline-flex items-center justify-center rounded-full border-2 border-[#e58b6f] px-5 py-3 font-semibold text-[#e58b6f] transition hover:bg-[#fff4ec]"
                >
                  ← Ver todos os produtos
                </Link>
              )}

              <Link
                href="/carrinho"
                className="inline-flex items-center justify-center rounded-full border-2 border-[#e58b6f] px-5 py-3 font-semibold text-[#e58b6f] transition hover:bg-[#fff4ec]"
              >
                🛒 Ver carrinho
              </Link>

            </div>

          </div>

        </div>

        {/* =====================================================
            CARREGANDO
        ===================================================== */}

        {carregando && (
          <div className="rounded-3xl border border-[#eadfd6] bg-white px-6 py-16 text-center shadow-sm">

            <div className="text-5xl">
              🐾
            </div>

            <p className="mt-4 font-semibold text-[#756f69]">
              Carregando produtos...
            </p>

          </div>
        )}

        {/* =====================================================
            ERRO
        ===================================================== */}

        {!carregando && erro && (
          <div className="rounded-3xl border border-red-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="text-5xl">
              ⚠️
            </div>

            <h2 className="mt-4 text-xl font-bold text-[#2d2a26]">
              Não foi possível carregar os produtos
            </h2>

            <p className="mt-2 text-red-500">
              {erro}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53]"
            >
              Tentar novamente
            </button>

          </div>
        )}

        {/* =====================================================
            NENHUM PRODUTO
        ===================================================== */}

        {!carregando &&
          !erro &&
          produtos.length === 0 && (
            <div className="rounded-3xl border border-[#eadfd6] bg-white px-6 py-16 text-center shadow-sm">

              <div className="text-6xl">
                📦
              </div>

              <h2 className="mt-4 text-xl font-bold text-[#2d2a26]">
                {categoriaSelecionada
                  ? "Nenhum produto encontrado nesta categoria"
                  : "Nenhum produto encontrado"}
              </h2>

              <p className="mt-2 text-[#756f69]">
                {categoriaSelecionada
                  ? `No momento não existem produtos disponíveis em ${categoriaSelecionada.nome}.`
                  : "No momento não existem produtos disponíveis."}
              </p>

              <Link
                href="/produtos"
                className="mt-6 inline-block rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53]"
              >
                Ver todos os produtos
              </Link>

            </div>
          )}

        {/* =====================================================
            LISTA DE PRODUTOS
        ===================================================== */}

        {!carregando &&
          !erro &&
          produtos.length > 0 && (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {produtos.map((produto) => {

                if (!produto || !produto.id) {
                  return null;
                }

                const imagem = getImagemUrl(
                  produto.imagem
                );

                const precoOriginal =
                  Number(produto.preco);

                const precoPromocional =
                  Number(produto.precoPromo);

                const possuiOferta =
                  precoPromocional > 0 &&
                  precoPromocional < precoOriginal;

                const desconto =
                  calcularDesconto(
                    produto.preco,
                    produto.precoPromo
                  );

                const estoque =
                  Number(produto.estoque ?? 0);

                return (
                  <article
                    key={produto.id}
                    className="group overflow-hidden rounded-3xl border border-[#eadfd6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >

                    {/* =================================================
                        IMAGEM
                    ================================================= */}

                    <Link
                      href={`/produtos/${produto.id}`}
                      className="block"
                    >

                      <div className="relative flex h-64 items-center justify-center overflow-hidden bg-[#fff4ec]">

                        {imagem ? (
                          <img
                            src={imagem}
                            alt={`${produto.nome} - produto para cães e gatos`}
                            className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
                            onError={(event) => {
                              console.error(
                                "[Produtos] Erro ao carregar imagem:",
                                imagem
                              );

                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="text-center">

                            <div className="text-6xl">
                              🐾
                            </div>

                            <p className="mt-2 text-xs text-[#a39a92]">
                              Imagem não disponível
                            </p>

                          </div>
                        )}

                        {/* =================================================
                            OFERTA
                        ================================================= */}

                        {possuiOferta &&
                          desconto > 0 && (
                            <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                              -{desconto}%
                            </span>
                          )}

                        {/* =================================================
                            DESTAQUE
                        ================================================= */}

                        {produto.destaque && (
                          <span className="absolute right-4 top-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900">
                            ⭐ Destaque
                          </span>
                        )}

                      </div>

                    </Link>

                    {/* =================================================
                        CONTEÚDO
                    ================================================= */}

                    <div className="p-5">

                      {produto.categoria?.nome && (
                        <p className="text-xs font-bold uppercase tracking-wide text-[#e58b6f]">
                          {produto.categoria.nome}
                        </p>
                      )}

                      <Link
                        href={`/produtos/${produto.id}`}
                      >
                        <h2 className="mt-2 line-clamp-2 min-h-[56px] text-lg font-bold text-[#2d2a26] transition hover:text-[#e58b6f]">
                          {produto.nome}
                        </h2>
                      </Link>

                      {produto.descricao && (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#756f69]">
                          {produto.descricao}
                        </p>
                      )}

                      {/* =================================================
                          PREÇO
                      ================================================= */}

                      <div className="mt-4">

                        {possuiOferta ? (
                          <>

                            <p className="text-sm text-[#a39a92] line-through">
                              {formatarPreco(
                                produto.preco
                              )}
                            </p>

                            <div className="flex flex-wrap items-center gap-2">

                              <p className="text-2xl font-bold text-[#e58b6f]">
                                {formatarPreco(
                                  produto.precoPromo
                                )}
                              </p>

                              {desconto > 0 && (
                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                                  {desconto}% OFF
                                </span>
                              )}

                            </div>

                            <p className="mt-1 text-xs font-semibold text-green-600">
                              Você economiza{" "}
                              {formatarPreco(
                                precoOriginal -
                                  precoPromocional
                              )}
                            </p>

                          </>
                        ) : (
                          <p className="text-2xl font-bold text-[#2d2a26]">
                            {formatarPreco(
                              produto.preco
                            )}
                          </p>
                        )}

                      </div>

                      {/* =================================================
                          ESTOQUE
                      ================================================= */}

                      <div className="mt-3">

                        {estoque > 0 ? (
                          <span className="text-xs font-semibold text-green-600">
                            ● Em estoque
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-red-500">
                            ● Produto esgotado
                          </span>
                        )}

                      </div>

                      {/* =================================================
                          DETALHES
                      ================================================= */}

                      <Link
                        href={`/produtos/${produto.id}`}
                        className="mt-4 block w-full rounded-full border-2 border-[#e58b6f] px-5 py-3 text-center text-sm font-bold text-[#e58b6f] transition hover:bg-[#fff4ec]"
                      >
                        Ver detalhes
                      </Link>

                      {/* =================================================
                          CARRINHO
                      ================================================= */}

                      <AdicionarAoCarrinho
                        produto={produto}
                      />

                    </div>

                  </article>
                );
              })}

            </div>
          )}

      </div>
    </main>
  );
}

