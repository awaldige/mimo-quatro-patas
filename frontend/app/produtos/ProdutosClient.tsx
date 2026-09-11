"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  getCategorias,
  getImagemUrl,
  getProdutos,
  type Categoria,
  type Produto,
} from "@/services/api";

function formatarPreco(valor: number | string | null | undefined): string {
  const numero =
    valor === null || valor === undefined || valor === ""
      ? 0
      : typeof valor === "number"
        ? valor
        : Number(String(valor).replace(",", "."));

  return Number.isFinite(numero)
    ? numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : "R$ 0,00";
}

function temPromocao(produto: Produto): boolean {
  const preco = Number(produto.preco);
  const precoPromo = Number(produto.precoPromo);

  return (
    Number.isFinite(preco) &&
    Number.isFinite(precoPromo) &&
    precoPromo > 0 &&
    precoPromo < preco
  );
}

export default function ProdutosClient() {
  const searchParams = useSearchParams();

  const categoriaParametro = searchParams.get("categoria");
  const categoriaId = categoriaParametro
    ? Number(categoriaParametro)
    : null;

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const [produtosData, categoriasData] = await Promise.all([
          getProdutos(),
          getCategorias(),
        ]);

        if (!ativo) {
          return;
        }

        setProdutos(produtosData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);

        if (ativo) {
          setErro(
            "Não foi possível carregar os produtos no momento."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  const produtosAtivos = useMemo(() => {
    return produtos.filter(
      (produto) => produto.ativo
    );
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    if (
      categoriaId === null ||
      !Number.isFinite(categoriaId)
    ) {
      return produtosAtivos;
    }

    return produtosAtivos.filter(
      (produto) =>
        Number(produto.categoriaId) === categoriaId
    );
  }, [produtosAtivos, categoriaId]);

  const categoriaSelecionada = useMemo(() => {
    if (categoriaId === null) {
      return null;
    }

    return (
      categorias.find(
        (categoria) =>
          Number(categoria.id) === categoriaId
      ) || null
    );
  }, [categorias, categoriaId]);

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#fffaf5] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-[#eadfd6] bg-white px-6 py-16 text-center shadow-sm">
            <div
              className="text-5xl"
              role="img"
              aria-label="Patinha de animal"
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

  if (erro) {
    return (
      <main className="min-h-screen bg-[#fffaf5] px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-[#eadfd6] bg-white px-6 py-16 text-center shadow-sm">
            <div
              className="text-5xl"
              role="img"
              aria-label="Patinha de animal"
            >
              🐾
            </div>

            <h1 className="mt-5 text-2xl font-bold text-[#2d2a26]">
              Não foi possível carregar os produtos
            </h1>

            <p className="mt-3 text-[#756f69]">
              {erro}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-8 rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53]"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#e58b6f] transition hover:text-[#c96d53] focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
        >
          ← Voltar para a página inicial
        </Link>

        <div className="mx-auto mt-10 max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e58b6f]">
            Mimo Quatro Patas
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2d2a26] md:text-4xl">
            {categoriaSelecionada
              ? categoriaSelecionada.nome
              : "Produtos para cães e gatos"}
          </h1>

          <p className="mt-4 leading-7 text-[#756f69]">
            {categoriaSelecionada?.descricao ||
              "Encontre produtos especiais para deixar a vida do seu pet ainda mais confortável, divertida e feliz."}
          </p>

          {categoriaSelecionada && (
            <Link
              href="/produtos"
              className="mt-5 inline-flex items-center gap-2 font-semibold text-[#e58b6f] transition hover:text-[#c96d53]"
            >
              ← Ver todos os produtos
            </Link>
          )}
        </div>

        {produtosFiltrados.length === 0 ? (
          <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-[#eadfd6] bg-white px-6 py-16 text-center shadow-sm">
            <div
              className="text-5xl"
              role="img"
              aria-label="Patinha de animal"
            >
              🐾
            </div>

            <h2 className="mt-5 text-2xl font-bold text-[#2d2a26]">
              Nenhum produto encontrado
            </h2>

            <p className="mt-3 text-[#756f69]">
              Ainda não temos produtos disponíveis nesta categoria.
            </p>

            <Link
              href="/produtos"
              className="mt-8 inline-flex rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53]"
            >
              Ver todos os produtos
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {produtosFiltrados.map((produto) => {
              const promocao = temPromocao(produto);
              const imagemUrl = getImagemUrl(produto.imagem);

              const preco = Number(produto.preco);
              const precoPromo = Number(produto.precoPromo);

              const desconto =
                promocao && preco > 0
                  ? Math.round(
                      ((preco - precoPromo) / preco) * 100
                    )
                  : 0;

              return (
                <Link
                  key={produto.id}
                  href={`/produtos/${produto.id}`}
                  className="group overflow-hidden rounded-3xl border border-[#eadfd6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#fff7ed]">
                    <img
                      src={imagemUrl}
                      alt={`${produto.nome} - produto para cães e gatos`}
                      className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {promocao && desconto > 0 && (
                      <span className="absolute left-4 top-4 rounded-full bg-[#e58b6f] px-3 py-1 text-xs font-bold text-white">
                        -{desconto}%
                      </span>
                    )}

                    {produto.oferta && (
                      <span className="absolute right-4 top-4 rounded-full bg-[#2d2a26] px-3 py-1 text-xs font-semibold text-white">
                        Oferta
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    {produto.categoria?.nome && (
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#e58b6f]">
                        {produto.categoria.nome}
                      </p>
                    )}

                    <h2 className="mt-2 line-clamp-2 min-h-[56px] text-lg font-bold text-[#2d2a26]">
                      {produto.nome}
                    </h2>

                    {produto.descricao && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#756f69]">
                        {produto.descricao}
                      </p>
                    )}

                    <div className="mt-4">
                      {promocao && (
                        <p className="text-sm text-[#999] line-through">
                          {formatarPreco(produto.preco)}
                        </p>
                      )}

                      <p className="text-xl font-bold text-[#e58b6f]">
                        {formatarPreco(
                          promocao
                            ? produto.precoPromo
                            : produto.preco
                        )}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-semibold text-[#e58b6f] transition group-hover:text-[#c96d53]">
                        Ver produto →
                      </span>

                      <span className="text-xs text-[#756f69]">
                        {produto.estoque > 0
                          ? "Disponível"
                          : "Esgotado"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}