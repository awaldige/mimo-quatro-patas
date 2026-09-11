import type { Metadata } from "next";
import Link from "next/link";

import {
  getCategorias,
  type Categoria,
  getImagemUrl,
} from "@/services/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categorias | Mimo Quatro Patas",
  description:
    "Explore as categorias da Mimo Quatro Patas e encontre produtos especiais para cães, gatos e outros pets.",
  keywords: [
    "categorias pet",
    "produtos para cães",
    "produtos para gatos",
    "acessórios para pets",
    "loja pet",
    "Mimo Quatro Patas",
  ],
  openGraph: {
    title: "Categorias | Mimo Quatro Patas",
    description:
      "Explore nossas categorias e encontre produtos especiais para o seu pet.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Categorias | Mimo Quatro Patas",
    description:
      "Explore nossas categorias e encontre produtos especiais para o seu pet.",
  },
};

function obterEmoji(nome: string) {
  const nomeNormalizado = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (
    nomeNormalizado.includes("cachorro") ||
    nomeNormalizado.includes("cao") ||
    nomeNormalizado.includes("caes") ||
    nomeNormalizado.includes("dog")
  ) {
    return "🐶";
  }

  if (
    nomeNormalizado.includes("gato") ||
    nomeNormalizado.includes("gatos") ||
    nomeNormalizado.includes("cat")
  ) {
    return "🐱";
  }

  if (
    nomeNormalizado.includes("acessorio") ||
    nomeNormalizado.includes("acessorios")
  ) {
    return "🎀";
  }

  if (
    nomeNormalizado.includes("brinquedo") ||
    nomeNormalizado.includes("brinquedos")
  ) {
    return "🧸";
  }

  if (
    nomeNormalizado.includes("higiene") ||
    nomeNormalizado.includes("banho")
  ) {
    return "🧼";
  }

  if (
    nomeNormalizado.includes("alimentacao") ||
    nomeNormalizado.includes("racao") ||
    nomeNormalizado.includes("comida")
  ) {
    return "🥣";
  }

  if (
    nomeNormalizado.includes("passaro") ||
    nomeNormalizado.includes("ave") ||
    nomeNormalizado.includes("aves")
  ) {
    return "🐦";
  }

  if (
    nomeNormalizado.includes("peixe") ||
    nomeNormalizado.includes("peixes")
  ) {
    return "🐟";
  }

  return "🐾";
}

export default async function CategoriasPage() {
  let categorias: Categoria[] = [];

  try {
    categorias = await getCategorias();
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }

  const categoriasAtivas = categorias
    .filter((categoria) => categoria.ativo)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        {/* VOLTAR */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#e58b6f] transition hover:text-[#c96d53] focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
        >
          ← Voltar para a página inicial
        </Link>

        {/* CABEÇALHO */}
        <div className="mx-auto mt-10 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e58b6f]">
            Explore nossa loja
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2d2a26] md:text-4xl">
            Categorias
          </h1>

          <p className="mt-4 leading-7 text-[#756f69]">
            Encontre produtos especiais para cada momento da vida do seu pet.
            Escolha uma categoria e descubra nossos produtos.
          </p>
        </div>

        {/* CATEGORIAS */}
        {categoriasAtivas.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-[#eadfd6] bg-white px-6 py-16 text-center shadow-sm">
            <div
              className="text-6xl"
              role="img"
              aria-label="Patinha de animal"
            >
              🐾
            </div>

            <h2 className="mt-5 text-2xl font-bold text-[#2d2a26]">
              Nenhuma categoria disponível
            </h2>

            <p className="mx-auto mt-3 max-w-md text-[#756f69]">
              Estamos preparando novas categorias e produtos para o seu pet.
            </p>

            <Link
              href="/produtos"
              className="mt-8 inline-flex rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53] focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categoriasAtivas.map((categoria) => {
              const imagemUrl = categoria.imagem
                ? getImagemUrl(categoria.imagem)
                : null;

              return (
                <Link
                  key={categoria.id}
                  href={`/produtos?categoria=${categoria.id}`}
                  aria-label={`Ver produtos da categoria ${categoria.nome}`}
                  className="group relative overflow-hidden rounded-[2rem] border border-[#eadfd6] bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#e58b6f]/40 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
                >
                  {/* DECORAÇÃO */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#f6c85f]/10 transition duration-500 group-hover:scale-150" />

                  {/* IMAGEM DA CATEGORIA */}
                  <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-3xl bg-[#fff7ed]">
                    {imagemUrl ? (
                      <img
                        src={imagemUrl}
                        alt={`Categoria ${categoria.nome}`}
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-6xl"
                        role="img"
                        aria-label={`Ícone da categoria ${categoria.nome}`}
                      >
                        {obterEmoji(categoria.nome)}
                      </div>
                    )}
                  </div>

                  {/* NOME */}
                  <h2 className="relative mt-6 text-xl font-bold text-[#2d2a26]">
                    {categoria.nome}
                  </h2>

                  {/* DESCRIÇÃO */}
                  {categoria.descricao ? (
                    <p className="relative mt-3 line-clamp-3 min-h-[72px] leading-7 text-[#756f69]">
                      {categoria.descricao}
                    </p>
                  ) : (
                    <p className="relative mt-3 min-h-[72px] leading-7 text-[#756f69]">
                      Encontre produtos especiais para o seu pet.
                    </p>
                  )}

                  {/* AÇÃO */}
                  <span className="relative mt-5 inline-flex items-center gap-2 font-semibold text-[#e58b6f] transition group-hover:gap-3 group-hover:text-[#c96d53]">
                    Ver produtos
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}