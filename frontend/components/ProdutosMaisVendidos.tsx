"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdicionarAoCarrinho from "@/components/AdicionarAoCarrinho";
import { getImagemUrl } from "@/services/api";

interface Categoria {
  id: number;
  nome: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao?: string | null;
  preco: string | number;
  precoPromo?: string | number | null;
  imagem?: string | null;
  estoque: number;
  destaque: boolean;
  oferta: boolean;
  ativo: boolean;
  categoriaId: number;
  categoria?: Categoria | null;
  quantidadeVendida: number;
}

export default function ProdutosMaisVendidos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function carregarMaisVendidos() {
      try {
        setCarregando(true);
        setErro(false);

        const rawApiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        const apiUrl = rawApiUrl
          .replace(/\/+$/, "")
          .replace(/\/api$/, "");

        const response = await fetch(
          `${apiUrl}/api/produtos/mais-vendidos?limite=6`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar produtos mais vendidos.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Resposta inválida da API.");
        }

        setProdutos(data);
      } catch (error) {
        console.error(
          "Erro ao carregar produtos mais vendidos:",
          error
        );

        setErro(true);
        setProdutos([]);
      } finally {
        setCarregando(false);
      }
    }

    carregarMaisVendidos();
  }, []);

  // ========================================
  // FORMATAR PREÇO
  // ========================================

  function formatarPreco(valor: string | number) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      return "R$ 0,00";
    }

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // ========================================
  // CALCULAR DESCONTO
  // ========================================

  function calcularDesconto(
    preco: string | number,
    precoPromo?: string | number | null
  ) {
    const precoNormal = Number(preco);
    const precoPromocional = Number(precoPromo);

    if (
      !Number.isFinite(precoNormal) ||
      !Number.isFinite(precoPromocional) ||
      precoNormal <= 0 ||
      precoPromocional <= 0 ||
      precoPromocional >= precoNormal
    ) {
      return 0;
    }

    return Math.round(
      ((precoNormal - precoPromocional) / precoNormal) * 100
    );
  }

  // ========================================
  // RANKING
  // ========================================

  function obterRanking(posicao: number) {
    if (posicao === 1) {
      return {
        icone: "🥇",
        classe:
          "border-[#e5b94f] bg-[#fff8dc] text-[#8a6500]",
      };
    }

    if (posicao === 2) {
      return {
        icone: "🥈",
        classe:
          "border-[#c7cbd0] bg-[#f5f6f7] text-[#62676c]",
      };
    }

    if (posicao === 3) {
      return {
        icone: "🥉",
        classe:
          "border-[#d69a6a] bg-[#fff0e5] text-[#8a542f]",
      };
    }

    return {
      icone: null,
      classe:
        "border-gray-200 bg-white text-gray-600",
    };
  }

  // ========================================
  // LOADING
  // ========================================

  if (carregando) {
    return (
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mx-auto h-8 w-64 animate-pulse rounded-full bg-gray-200" />

            <div className="mx-auto mt-4 h-10 w-80 max-w-full animate-pulse rounded-lg bg-gray-200" />

            <div className="mx-auto mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-gray-100" />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="min-h-[620px] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] animate-pulse bg-gray-200" />

                <div className="space-y-3 p-6">
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />

                  <div className="h-6 animate-pulse rounded bg-gray-200" />

                  <div className="h-6 w-3/4 animate-pulse rounded bg-gray-100" />

                  <div className="h-16 animate-pulse rounded-xl bg-gray-100" />

                  <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />

                  <div className="h-11 animate-pulse rounded-xl bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ========================================
  // ERRO
  // ========================================

  if (erro) {
    return null;
  }

  // ========================================
  // SEM PRODUTOS
  // ========================================

  if (produtos.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#fffaf5] py-16 md:py-20">
      {/* ========================================
          DECORAÇÃO
      ======================================== */}

      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#e58b6f]/5 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#e58b6f]/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ========================================
            CABEÇALHO
        ======================================== */}

        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e58b6f]/20 bg-[#e58b6f]/10 px-4 py-2 text-sm font-semibold text-[#c96d53]">
            <span>🔥</span>
            Favoritos dos clientes
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#2d2a26] sm:text-4xl">
            Produtos mais vendidos
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-gray-600">
            Os produtos que estão fazendo sucesso entre
            nossos clientes e seus pets.
          </p>
        </div>

        {/* ========================================
            PRODUTOS
        ======================================== */}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {produtos.map((produto, index) => {
            const posicao = index + 1;

            const precoNormal = Number(produto.preco);

            const precoPromocional =
              produto.precoPromo !== null &&
              produto.precoPromo !== undefined
                ? Number(produto.precoPromo)
                : 0;

            const temPromocao =
              Number.isFinite(precoNormal) &&
              precoNormal > 0 &&
              Number.isFinite(precoPromocional) &&
              precoPromocional > 0 &&
              precoPromocional < precoNormal;

            const precoAtual = temPromocao
              ? precoPromocional
              : precoNormal;

            const desconto = calcularDesconto(
              produto.preco,
              produto.precoPromo
            );

            const ranking = obterRanking(posicao);

            return (
              <article
                key={produto.id}
                className="group relative flex min-h-[620px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#e58b6f]/30 hover:shadow-xl"
              >
                {/* ========================================
                    RANKING
                ======================================== */}

                <div className="absolute left-4 top-4 z-20">
                  <div
                    className={`flex h-11 min-w-11 items-center justify-center gap-1 rounded-full border px-3 text-sm font-bold shadow-sm backdrop-blur ${ranking.classe}`}
                  >
                    {ranking.icone ? (
                      <span className="text-lg">
                        {ranking.icone}
                      </span>
                    ) : (
                      <span>#{posicao}</span>
                    )}
                  </div>
                </div>

                {/* ========================================
                    SELO MAIS VENDIDO
                ======================================== */}

                <div className="absolute right-4 top-4 z-20">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#2d2a26]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md backdrop-blur">
                    🔥 Mais vendido
                  </span>
                </div>

                {/* ========================================
                    IMAGEM
                ======================================== */}

                <Link
                  href={`/produtos/${produto.id}`}
                  className="relative block aspect-[4/3] overflow-hidden bg-[#f8f5f1]"
                >
                  {produto.imagem ? (
                    <img
                      src={
                        getImagemUrl(
                          produto.imagem ?? undefined
                        ) ?? undefined
                      }
                      alt={`${produto.nome} - produto para cães e gatos`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-7xl">🐾</span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {temPromocao && desconto > 0 && (
                    <span className="absolute bottom-4 left-4 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                      -{desconto}%
                    </span>
                  )}
                </Link>

                {/* ========================================
                    CONTEÚDO
                ======================================== */}

                <div className="flex flex-1 flex-col p-6">
                  {/* Categoria */}

                  {produto.categoria && (
                    <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#c96d53]">
                      {produto.categoria.nome}
                    </span>
                  )}

                  {/* Nome */}

                  <Link href={`/produtos/${produto.id}`}>
                    <h3 className="line-clamp-2 min-h-[52px] text-lg font-semibold leading-7 text-[#2d2a26] transition-colors duration-200 hover:text-[#c96d53]">
                      {produto.nome}
                    </h3>
                  </Link>

                  {/* ========================================
                      VENDAS
                  ======================================== */}

                  <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#fff8f5] px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                      🛒
                    </div>

                    <div className="min-w-0 leading-tight">
                      <p className="text-sm font-bold text-[#2d2a26]">
                        {produto.quantidadeVendida}{" "}
                        {produto.quantidadeVendida === 1
                          ? "unidade vendida"
                          : "unidades vendidas"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Favorito dos clientes
                      </p>
                    </div>
                  </div>

                  {/* ========================================
                      PREÇO
                  ======================================== */}

                  <div className="mt-5">
                    {temPromocao && (
                      <span className="block text-sm text-gray-400 line-through">
                        {formatarPreco(produto.preco)}
                      </span>
                    )}

                    <span className="text-3xl font-bold tracking-tight text-[#c96d53]">
                      {formatarPreco(precoAtual)}
                    </span>
                  </div>

                  {/* ========================================
                      ESTOQUE
                  ======================================== */}

                  <div className="mt-3 min-h-[20px]">
                    {produto.estoque > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                        <span>✓</span>
                        Disponível para compra
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500">
                        <span>×</span>
                        Produto esgotado
                      </span>
                    )}
                  </div>

                  {/* ========================================
                      AÇÕES
                  ======================================== */}

                  <div className="mt-auto pt-6">
                    {produto.estoque > 0 ? (
                      <AdicionarAoCarrinho
                        produto={{
                          id: produto.id,
                          nome: produto.nome,
                          descricao: produto.descricao,
                          preco: produto.preco,
                          precoPromo: produto.precoPromo,
                          imagem: produto.imagem,
                          estoque: produto.estoque,
                          ativo: produto.ativo,
                          destaque: produto.destaque,
                          oferta: produto.oferta,
                          categoriaId: produto.categoriaId,
                          categoria: produto.categoria,
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full cursor-not-allowed rounded-xl bg-gray-100 px-4 py-3.5 text-sm font-semibold text-gray-400"
                      >
                        Produto indisponível
                      </button>
                    )}

                    <Link
                      href={`/produtos/${produto.id}`}
                      className="mt-3 flex items-center justify-center gap-1 text-sm font-semibold text-gray-500 transition-colors hover:text-[#c96d53]"
                    >
                      Ver detalhes

                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ========================================
            BOTÃO FINAL
        ======================================== */}

        <div className="mt-12 text-center">
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 rounded-full border border-[#e58b6f]/30 bg-white px-7 py-3.5 text-sm font-semibold text-[#c96d53] shadow-sm transition-all duration-200 hover:border-[#e58b6f] hover:bg-[#fff8f5] hover:shadow-md"
          >
            Ver todos os produtos

            <span className="transition-transform duration-200">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}