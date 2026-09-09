
import Link from "next/link";

import {
  getProdutos,
  getImagemUrl,
  Produto,
} from "@/services/api";

import AdicionarAoCarrinho from "@/components/AdicionarAoCarrinho";

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

export default async function ProdutosDestaque() {
  let produtos: Produto[] = [];

  try {
    produtos = await getProdutos();
  } catch (error) {
    console.error(
      "Erro ao carregar produtos em destaque:",
      error
    );
  }

  const produtosDestaque = produtos.filter(
    (produto) =>
      produto &&
      produto.id &&
      produto.destaque &&
      produto.ativo
  );

  return (
    <section
      id="produtos"
      className="bg-white px-6 py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            CABEÇALHO
        ===================================================== */}

        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-[#f6c85f]/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.15em] text-[#c96d53]">
            🐾 Nossos queridinhos
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#2d2a26] md:text-4xl">
            Produtos em destaque
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#756f69] md:text-lg">
            Produtos escolhidos com carinho para deixar a vida do
            seu pet ainda mais confortável, divertida e especial.
          </p>
        </div>

        {/* =====================================================
            SEM PRODUTOS
        ===================================================== */}

        {produtosDestaque.length === 0 ? (
          <div className="rounded-[2rem] border border-[#eadfd6] bg-[#fffaf5] px-6 py-14 text-center">

            <div className="text-6xl">
              🐾
            </div>

            <h3 className="mt-5 text-xl font-bold text-[#2d2a26]">
              Nenhum produto em destaque
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756f69]">
              Em breve teremos novidades especiais para o seu pet.
            </p>

            <Link
              href="/produtos"
              className="mt-7 inline-flex rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53] focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
            >
              Ver produtos
            </Link>

          </div>
        ) : (

          /* =====================================================
             LISTA
          ===================================================== */

          <>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

              {produtosDestaque.map((produto) => {

                const imagem = getImagemUrl(
                  produto.imagem
                );

                const precoOriginal =
                  Number(produto.preco);

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

                const percentualDesconto =
                  temOferta && precoOriginal > 0
                    ? Math.round(
                        ((precoOriginal - precoAtual) /
                          precoOriginal) *
                          100
                      )
                    : 0;

                const economia = temOferta
                  ? precoOriginal - precoAtual
                  : 0;

                return (
                  <article
                    key={produto.id}
                    className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#eadfd6] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e58b6f]/40 hover:shadow-xl"
                  >

                    {/* =================================================
                        IMAGEM
                    ================================================= */}

                    <Link
                      href={`/produtos/${produto.id}`}
                      className="block"
                    >
                      <div className="relative h-64 overflow-hidden bg-[#fff4ec]">

                        {imagem ? (
                          <img
                            src={imagem}
                            alt={produto.nome}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center">
                            <span className="text-7xl">
                              🐾
                            </span>

                            <span className="mt-3 text-sm text-[#756f69]">
                              Foto em breve
                            </span>
                          </div>
                        )}

                        {/* Gradiente */}

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />

                        {/* =================================================
                            OFERTA
                        ================================================= */}

                        {temOferta &&
                          percentualDesconto > 0 && (
                            <span className="absolute left-4 top-4 rounded-full bg-[#e58b6f] px-4 py-2 text-xs font-bold text-white shadow-md">
                              -{percentualDesconto}%
                            </span>
                          )}

                        {/* =================================================
                            DESTAQUE
                        ================================================= */}

                        <span className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[#2d2a26] shadow-md backdrop-blur">
                          ⭐ Destaque
                        </span>

                      </div>
                    </Link>

                    {/* =================================================
                        CONTEÚDO
                    ================================================= */}

                    <div className="flex flex-1 flex-col p-6">

                      {/* Categoria */}

                      {produto.categoria?.nome && (
                        <span className="text-xs font-bold uppercase tracking-wider text-[#e58b6f]">
                          {produto.categoria.nome}
                        </span>
                      )}

                      {/* Nome */}

                      <Link
                        href={`/produtos/${produto.id}`}
                      >
                        <h3 className="mt-2 text-xl font-bold leading-tight text-[#2d2a26] transition hover:text-[#e58b6f]">
                          {produto.nome}
                        </h3>
                      </Link>

                      {/* Descrição */}

                      {produto.descricao ? (
                        <p className="mt-3 min-h-[48px] line-clamp-2 text-sm leading-6 text-[#756f69]">
                          {produto.descricao}
                        </p>
                      ) : (
                        <div className="min-h-[48px]" />
                      )}

                      {/* =================================================
                          PREÇO
                      ================================================= */}

                      <div className="mt-5">

                        {temOferta ? (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              {formatarPreco(precoOriginal)}
                            </span>

                            <div className="mt-1">
                              <strong className="text-2xl font-bold text-[#e58b6f]">
                                {formatarPreco(precoAtual)}
                              </strong>
                            </div>

                            {economia > 0 && (
                              <p className="mt-1 text-xs font-semibold text-green-600">
                                Você economiza{" "}
                                {formatarPreco(economia)}
                              </p>
                            )}
                          </>
                        ) : (
                          <strong className="text-2xl font-bold text-[#e58b6f]">
                            {formatarPreco(precoAtual)}
                          </strong>
                        )}

                      </div>

                      {/* =================================================
                          ESTOQUE
                      ================================================= */}

                      <div className="mt-4">

                        {produto.estoque <= 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500">
                            <span>●</span>
                            Produto esgotado
                          </span>
                        ) : produto.estoque <= 5 ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500">
                            <span>●</span>
                            Últimas unidades
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                            <span>●</span>
                            Em estoque
                          </span>
                        )}

                      </div>

                      {/* =================================================
                          DETALHES
                      ================================================= */}

                      <Link
                        href={`/produtos/${produto.id}`}
                        className="mt-5 block w-full rounded-full border-2 border-[#e58b6f] px-5 py-3 text-center font-semibold text-[#e58b6f] transition hover:bg-[#fff4ec] focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
                      >
                        Ver detalhes
                      </Link>

                      {/* =================================================
                          CARRINHO
                      ================================================= */}

                      <div className="mt-3">
                        <AdicionarAoCarrinho
                          produto={produto}
                        />
                      </div>

                    </div>
                  </article>
                );
              })}

            </div>

            {/* =====================================================
                VER TODOS
            ===================================================== */}

            <div className="mt-12 text-center">

              <Link
                href="/produtos"
                className="inline-flex items-center gap-2 rounded-full bg-[#2d2a26] px-7 py-3.5 font-semibold text-white transition hover:bg-[#3f3a35] focus:outline-none focus:ring-2 focus:ring-[#2d2a26] focus:ring-offset-2"
              >
                Ver todos os produtos

                <span aria-hidden="true">
                  →
                </span>
              </Link>

            </div>
          </>
        )}

      </div>
    </section>
  );
}

