import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getProdutoById,
  getImagemUrl,
  type Produto,
} from "@/services/api";

import AdicionarAoCarrinho from "@/components/AdicionarAoCarrinho";
import FormularioAvaliacao from "@/components/FormularioAvaliacao";

/*
=========================================================
CONFIGURAÇÃO DA ROTA
=========================================================
Esta página depende da API e do banco de dados.

Forçamos renderização dinâmica para evitar que o Next.js
tente gerar todas as páginas de produtos durante o build.
*/

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Avaliacao {
  id: number;
  nome: string;
  nota: number;
  comentario?: string | null;
  produtoId: number;
  aprovado: boolean;
  ativo: boolean;
  createdAt?: string;
}

interface ProdutoPageProps {
  params: Promise<{
    id: string;
  }>;
}

/*
=========================================================
FUNÇÕES AUXILIARES
=========================================================
*/

function formatarPreco(valor: string | number) {
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
  precoPromo: string | number
) {
  const valorOriginal = Number(preco);
  const valorPromocional = Number(precoPromo);

  if (
    !valorOriginal ||
    !valorPromocional ||
    valorPromocional >= valorOriginal
  ) {
    return 0;
  }

  return Math.round(
    ((valorOriginal - valorPromocional) / valorOriginal) * 100
  );
}

function formatarData(dataString?: string) {
  if (!dataString) {
    return "";
  }

  const data = new Date(dataString);

  if (Number.isNaN(data.getTime())) {
    return "";
  }

  return data.toLocaleDateString("pt-BR");
}

function renderizarEstrelas(nota: number) {
  const notaSegura = Math.min(
    5,
    Math.max(0, Math.round(Number(nota)))
  );

  return (
    <span
      className="tracking-wide text-[#e58b6f]"
      aria-label={`Nota ${notaSegura} de 5`}
    >
      {"★".repeat(notaSegura)}

      <span className="text-[#eadfd6]">
        {"★".repeat(5 - notaSegura)}
      </span>
    </span>
  );
}

/*
=========================================================
AVALIAÇÕES
=========================================================
*/

async function getAvaliacoesByProduto(
  produtoId: number
): Promise<Avaliacao[]> {
  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api"
  ).replace(/\/+$/, "");

  try {
    const resposta = await fetch(`${apiUrl}/avaliacoes`, {
      cache: "no-store",
    });

    if (!resposta.ok) {
      console.error(
        "[produto] Erro ao carregar avaliações:",
        resposta.status
      );

      return [];
    }

    const dados = await resposta.json();

    const avaliacoes: Avaliacao[] = Array.isArray(dados)
      ? dados
      : Array.isArray(dados?.avaliacoes)
        ? dados.avaliacoes
        : [];

    return avaliacoes.filter(
      (avaliacao) =>
        Number(avaliacao.produtoId) === produtoId &&
        avaliacao.aprovado &&
        avaliacao.ativo
    );
  } catch (error) {
    console.error(
      "[produto] Erro ao buscar avaliações:",
      error
    );

    return [];
  }
}

/*
=========================================================
SEO INDIVIDUAL DO PRODUTO
=========================================================
*/

export async function generateMetadata({
  params,
}: ProdutoPageProps): Promise<Metadata> {
  const { id } = await params;

  const produtoId = Number(id);

  if (!Number.isInteger(produtoId)) {
    return {
      title: "Produto não encontrado | Mimo Quatro Patas",
      description:
        "O produto que você está procurando não foi encontrado.",
    };
  }

  try {
    const produto = await getProdutoById(produtoId);

    if (!produto || !produto.ativo) {
      return {
        title: "Produto não encontrado | Mimo Quatro Patas",
        description:
          "O produto que você está procurando não está disponível.",
      };
    }

    const descricaoBase =
      produto.descricao?.trim() ||
      `Confira ${produto.nome}, produto para cães e gatos na Mimo Quatro Patas.`;

    const descricao =
      descricaoBase.length > 160
        ? `${descricaoBase.substring(0, 157)}...`
        : descricaoBase;

    const imagemUrl = getImagemUrl(produto.imagem);

    return {
      title: `${produto.nome} | Mimo Quatro Patas`,

      description: descricao,

      keywords: [
        produto.nome,
        "produtos para cães",
        "produtos para gatos",
        "produtos pet",
        "acessórios para pets",
        "loja pet",
        "Mimo Quatro Patas",
      ],

      openGraph: {
        type: "website",
        locale: "pt_BR",
        siteName: "Mimo Quatro Patas",

        title: `${produto.nome} | Mimo Quatro Patas`,

        description: descricao,

        images: imagemUrl
          ? [
              {
                url: imagemUrl,
                alt: `${produto.nome} - Mimo Quatro Patas`,
              },
            ]
          : undefined,
      },

      twitter: {
        card: "summary_large_image",

        title: `${produto.nome} | Mimo Quatro Patas`,

        description: descricao,

        images: imagemUrl
          ? [imagemUrl]
          : undefined,
      },

      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error(
      "[produto] Erro ao gerar metadata:",
      error
    );

    return {
      title: "Produto | Mimo Quatro Patas",
      description:
        "Confira nossos produtos para cães e gatos na Mimo Quatro Patas.",
    };
  }
}

/*
=========================================================
PÁGINA DO PRODUTO
=========================================================
*/

export default async function ProdutoPage({
  params,
}: ProdutoPageProps) {
  const { id } = await params;

  const produtoId = Number(id);

  if (!Number.isInteger(produtoId)) {
    notFound();
  }

  let produto: Produto | null = null;

  try {
    produto = await getProdutoById(produtoId);
  } catch (error) {
    console.error(
      "[produto] Erro ao carregar produto:",
      error
    );

    notFound();
  }

  if (!produto || !produto.ativo) {
    notFound();
  }

  /*
  =========================================================
  AVALIAÇÕES
  =========================================================
  */

  const avaliacoes = await getAvaliacoesByProduto(
    produto.id
  );

  /*
  =========================================================
  IMAGEM
  =========================================================
  */

  const imagemUrl = getImagemUrl(produto.imagem);

  /*
  =========================================================
  OFERTA
  =========================================================
  */

  const precoOriginal = Number(produto.preco);

  const precoPromocional =
    produto.precoPromo !== null &&
    produto.precoPromo !== undefined
      ? Number(produto.precoPromo)
      : 0;

  const temOferta =
    precoPromocional > 0 &&
    precoPromocional < precoOriginal;

  const precoAtual = temOferta
    ? precoPromocional
    : precoOriginal;

  const desconto = temOferta
    ? calcularDesconto(
        precoOriginal,
        precoPromocional
      )
    : 0;

  const economia = temOferta
    ? precoOriginal - precoAtual
    : 0;

  /*
  =========================================================
  MÉDIA DAS AVALIAÇÕES
  =========================================================
  */

  const somaNotas = avaliacoes.reduce(
    (total, avaliacao) =>
      total + Number(avaliacao.nota || 0),
    0
  );

  const notaMedia =
    avaliacoes.length > 0
      ? somaNotas / avaliacoes.length
      : 0;

  /*
  =========================================================
  SCHEMA.ORG / JSON-LD
  =========================================================
  */

  const descricaoSchema =
    produto.descricao?.trim() ||
    `Confira ${produto.nome}, produto para cães e gatos na Mimo Quatro Patas.`;

  const schemaProduto: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",

    name: produto.nome,

    description: descricaoSchema,

    image: imagemUrl
      ? [imagemUrl]
      : undefined,

    category:
      produto.categoria?.nome ||
      "Produtos para pets",

    sku: String(produto.id),

    brand: {
      "@type": "Brand",
      name: "Mimo Quatro Patas",
    },

    offers: {
      "@type": "Offer",

      priceCurrency: "BRL",

      price: precoAtual.toFixed(2),

      availability:
        produto.estoque > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

      itemCondition:
        "https://schema.org/NewCondition",

      seller: {
        "@type": "Organization",
        name: "Mimo Quatro Patas",
      },
    },
  };

  /*
  =========================================================
  AGREGADO DE AVALIAÇÕES
  =========================================================
  */

  if (avaliacoes.length > 0) {
    schemaProduto.aggregateRating = {
      "@type": "AggregateRating",

      ratingValue: Number(
        notaMedia.toFixed(1)
      ),

      bestRating: 5,

      worstRating: 1,

      ratingCount: avaliacoes.length,
    };
  }

  /*
  =========================================================
  RENDERIZAÇÃO
  =========================================================
  */

  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-12">
      {/* JSON-LD */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaProduto),
        }}
      />

      <div className="mx-auto max-w-7xl">
        {/* VOLTAR */}

        <Link
          href="/produtos"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#e58b6f] transition hover:text-[#c96d53]"
        >
          ← Voltar para produtos
        </Link>

        {/* PRODUTO */}

        <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#eadfd6] bg-white shadow-sm">
          <div className="grid md:grid-cols-2">
            {/* IMAGEM */}

            <div className="relative flex min-h-[420px] items-center justify-center bg-[#fff4ec] p-6 md:min-h-[600px] md:p-10">
              {imagemUrl ? (
                <img
                  src={imagemUrl}
                  alt={`${produto.nome} - produto para cães e gatos`}
                  loading="eager"
                  className="max-h-[540px] w-full object-contain transition duration-500 hover:scale-105"
                />
              ) : (
                <div className="text-center">
                  <div className="text-8xl">
                    🐾
                  </div>

                  <p className="mt-4 text-sm text-[#756f69]">
                    Foto em breve
                  </p>
                </div>
              )}

              {/* SELO DE OFERTA */}

              {temOferta && desconto > 0 && (
                <span className="absolute left-6 top-6 rounded-full bg-[#e58b6f] px-5 py-2 text-sm font-bold text-white shadow-md">
                  -{desconto}% OFF
                </span>
              )}

              {/* SELO DE DESTAQUE */}

              {produto.destaque && (
                <span className="absolute right-6 top-6 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#2d2a26] shadow-md">
                  ⭐ Destaque
                </span>
              )}
            </div>

            {/* INFORMAÇÕES */}

            <div className="flex flex-col justify-center p-8 md:p-12">
              {/* CATEGORIA */}

              {produto.categoria?.nome && (
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#e58b6f]">
                  {produto.categoria.nome}
                </span>
              )}

              {/* NOME */}

              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#2d2a26] md:text-5xl">
                {produto.nome}
              </h1>

              {/* AVALIAÇÃO RESUMIDA */}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {avaliacoes.length > 0 ? (
                  <>
                    <span className="text-lg">
                      {renderizarEstrelas(
                        notaMedia
                      )}
                    </span>

                    <span className="text-sm font-semibold text-[#756f69]">
                      {notaMedia.toFixed(1)} / 5
                    </span>

                    <span className="text-sm text-[#a39a92]">
                      ({avaliacoes.length}{" "}
                      {avaliacoes.length === 1
                        ? "avaliação"
                        : "avaliações"})
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-[#a39a92]">
                    Ainda não há avaliações
                  </span>
                )}
              </div>

              {/* DESCRIÇÃO */}

              {produto.descricao && (
                <p className="mt-6 text-base leading-8 text-[#756f69]">
                  {produto.descricao}
                </p>
              )}

              {/* DIVISOR */}

              <div className="my-7 h-px bg-[#eadfd6]" />

              {/* PREÇO */}

              <div>
                {temOferta ? (
                  <>
                    <span className="text-base text-[#756f69] line-through">
                      {formatarPreco(
                        precoOriginal
                      )}
                    </span>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <strong className="text-4xl font-bold text-[#e58b6f]">
                        {formatarPreco(
                          precoAtual
                        )}
                      </strong>

                      {desconto > 0 && (
                        <span className="rounded-full bg-[#f6c85f] px-3 py-1 text-sm font-bold text-[#2d2a26]">
                          {desconto}% OFF
                        </span>
                      )}
                    </div>

                    {economia > 0 && (
                      <p className="mt-2 text-sm font-medium text-green-600">
                        Você economiza{" "}
                        {formatarPreco(economia)}
                      </p>
                    )}
                  </>
                ) : (
                  <strong className="text-4xl font-bold text-[#e58b6f]">
                    {formatarPreco(
                      precoOriginal
                    )}
                  </strong>
                )}
              </div>

              {/* ESTOQUE */}

              <div className="mt-7">
                {produto.estoque <= 0 ? (
                  <div className="rounded-2xl bg-red-50 px-5 py-4">
                    <p className="font-semibold text-red-500">
                      Produto esgotado
                    </p>

                    <p className="mt-1 text-sm text-red-400">
                      Este produto não está disponível no momento.
                    </p>
                  </div>
                ) : produto.estoque <= 5 ? (
                  <div className="rounded-2xl bg-orange-50 px-5 py-4">
                    <p className="font-semibold text-orange-500">
                      Últimas unidades
                    </p>

                    <p className="mt-1 text-sm text-orange-400">
                      Aproveite enquanto ainda temos disponibilidade.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-green-50 px-5 py-4">
                    <p className="font-semibold text-green-600">
                      ✓ Produto disponível
                    </p>

                    <p className="mt-1 text-sm text-green-500">
                      Produto disponível para adicionar ao carrinho.
                    </p>
                  </div>
                )}
              </div>

              {/* CARRINHO */}

              <div className="mt-6">
                <AdicionarAoCarrinho
                  produto={produto}
                />
              </div>

              {/* CONTINUAR COMPRANDO */}

              <Link
                href="/produtos"
                className="mt-4 block w-full rounded-full border-2 border-[#eadfd6] px-6 py-4 text-center font-semibold text-[#756f69] transition hover:border-[#e58b6f] hover:bg-[#fffaf5] hover:text-[#e58b6f] focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>

        {/* AVALIAÇÕES */}

        <section className="mt-10 rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm md:p-10">
          {/* CABEÇALHO */}

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e58b6f]">
                Opiniões dos clientes
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#2d2a26] md:text-3xl">
                Avaliações do produto
              </h2>

              <p className="mt-2 text-sm text-[#756f69]">
                Veja o que outros clientes acharam deste produto.
              </p>
            </div>

            {avaliacoes.length > 0 && (
              <div className="rounded-3xl bg-[#fffaf5] px-6 py-5 text-center">
                <div className="text-3xl font-bold text-[#2d2a26]">
                  {notaMedia.toFixed(1)}
                </div>

                <div className="mt-1">
                  {renderizarEstrelas(
                    notaMedia
                  )}
                </div>

                <p className="mt-1 text-xs text-[#a39a92]">
                  {avaliacoes.length}{" "}
                  {avaliacoes.length === 1
                    ? "avaliação"
                    : "avaliações"}
                </p>
              </div>
            )}
          </div>

          {/* LISTA DE AVALIAÇÕES */}

          {avaliacoes.length === 0 ? (
            <div className="mt-8 rounded-3xl bg-[#fffaf5] px-6 py-12 text-center">
              <div className="text-5xl">
                ⭐
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#2d2a26]">
                Ainda não há avaliações
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756f69]">
                Este produto ainda não recebeu avaliações de clientes.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {avaliacoes.map((avaliacao) => (
                <article
                  key={avaliacao.id}
                  className="rounded-3xl border border-[#eadfd6] bg-[#fffaf5] p-5 md:p-6"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-bold text-[#2d2a26]">
                        {avaliacao.nome}
                      </h3>

                      <div className="mt-1">
                        {renderizarEstrelas(
                          avaliacao.nota
                        )}
                      </div>
                    </div>

                    {avaliacao.createdAt && (
                      <span className="text-xs text-[#a39a92]">
                        {formatarData(
                          avaliacao.createdAt
                        )}
                      </span>
                    )}
                  </div>

                  {avaliacao.comentario && (
                    <p className="mt-4 text-sm leading-7 text-[#756f69]">
                      “{avaliacao.comentario}”
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* FORMULÁRIO */}

          <FormularioAvaliacao
            produtoId={produto.id}
          />
        </section>

        {/* RODAPÉ */}

        <footer className="mt-10 border-t border-[#eadfd6] pt-6 text-center">
          <p className="text-sm text-[#a39a92]">
            Mimo Quatro Patas • Produtos para o seu melhor amigo
          </p>
        </footer>
      </div>
    </main>
  );
}