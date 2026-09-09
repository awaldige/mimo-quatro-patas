
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

export default async function Ofertas() {
  let produtos: Produto[] = [];

  try {
    produtos = await getProdutos();
  } catch (error) {
    console.error("Erro ao carregar ofertas:", error);
  }

  const ofertas = produtos.filter(
    (produto) =>
      produto &&
      produto.id &&
      produto.ativo &&
      produto.precoPromo !== null &&
      produto.precoPromo !== undefined &&
      Number(produto.precoPromo) > 0 &&
      Number(produto.precoPromo) < Number(produto.preco)
  );

  return (
    <section
      id="ofertas"
      className="bg-[#fffaf5] px-6 py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            CONTAINER PRINCIPAL
        ===================================================== */}

        <div className="overflow-hidden rounded-[2.5rem] bg-[#e58b6f] px-6 py-10 shadow-sm md:px-10 md:py-12">
          {/* =====================================================
              CABEÇALHO
          ===================================================== */}

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-bold uppercase tracking-[0.15em] text-white">
                🔥 Aproveite enquanto durar
              </span>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Ofertas especiais
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 md:text-lg">
                Mimos selecionados com preços especiais para você
                cuidar do seu pet com qualidade e economia.
              </p>
            </div>

            <div className="w-fit rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#c96d53] shadow-sm">
              🏷️ Promoções
            </div>
          </div>

          {/* =====================================================
              NENHUMA OFERTA
          ===================================================== */}

          {ofertas.length === 0 ? (
            <div className="mt-10 rounded-[2rem] bg-white px-6 py-14 text-center">
              <div className="text-6xl">
                🐾
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#2d2a26]">
                Nenhuma oferta disponível
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756f69]">
                Em breve teremos novidades e promoções especiais
                para o seu pet.
              </p>

              <Link
                href="/produtos"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2d2a26] px-6 py-3 font-semibold text-white transition hover:bg-[#3f3a35] focus:outline-none focus:ring-2 focus:ring-[#2d2a26] focus:ring-offset-2"
              >
                Ver produtos

                <span aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          ) : (
            <>
              {/* =================================================
                  CARDS
              ================================================= */}

              <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {ofertas.map((oferta) => {
                  const precoOriginal = Number(oferta.preco);
                  const precoAtual = Number(oferta.precoPromo);

                  const desconto = calcularDesconto(
                    oferta.preco,
                    oferta.precoPromo!
                  );

                  const economia =
                    precoOriginal - precoAtual;

                  const imagemUrl = getImagemUrl(
                    oferta.imagem
                  );

                  return (
                    <article
                      key={oferta.id}
                      className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#eadfd6] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                    >
                      {/* =================================================
                          IMAGEM
                      ================================================= */}

                      <Link
                        href={`/produtos/${oferta.id}`}
                        className="block"
                      >
                        <div className="relative h-60 overflow-hidden bg-[#fffaf5]">
                          {imagemUrl ? (
                            <img
                              src={imagemUrl}
                              alt={oferta.nome}
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

                          {/* Gradiente inferior */}

                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />

                          {/* =================================================
                              DESCONTO
                          ================================================= */}

                          {desconto > 0 && (
                            <span className="absolute left-4 top-4 rounded-full bg-[#f6c85f] px-4 py-2 text-xs font-bold text-[#2d2a26] shadow-md">
                              -{desconto}%
                            </span>
                          )}

                          {/* =================================================
                              OFERTA
                          ================================================= */}

                          <span className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[#c96d53] shadow-md backdrop-blur">
                            🔥 Oferta
                          </span>
                        </div>
                      </Link>

                      {/* =================================================
                          INFORMAÇÕES
                      ================================================= */}

                      <div className="flex flex-1 flex-col p-6">
                        {/* Categoria */}

                        {oferta.categoria?.nome && (
                          <span className="text-xs font-bold uppercase tracking-wider text-[#8db596]">
                            {oferta.categoria.nome}
                          </span>
                        )}

                        {/* Nome */}

                        <Link
                          href={`/produtos/${oferta.id}`}
                        >
                          <h3 className="mt-2 text-xl font-bold leading-tight text-[#2d2a26] transition hover:text-[#e58b6f]">
                            {oferta.nome}
                          </h3>
                        </Link>

                        {/* Descrição */}

                        {oferta.descricao ? (
                          <p className="mt-3 min-h-[48px] line-clamp-2 text-sm leading-6 text-[#756f69]">
                            {oferta.descricao}
                          </p>
                        ) : (
                          <div className="min-h-[48px]" />
                        )}

                        {/* =================================================
                            PREÇOS
                        ================================================= */}

                        <div className="mt-5">
                          <span className="text-sm text-gray-400 line-through">
                            {formatarPreco(precoOriginal)}
                          </span>

                          <div className="mt-1 flex flex-wrap items-end gap-2">
                            <strong className="text-2xl font-bold text-[#e58b6f]">
                              {formatarPreco(precoAtual)}
                            </strong>

                            {desconto > 0 && (
                              <span className="mb-1 rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-600">
                                {desconto}% OFF
                              </span>
                            )}
                          </div>

                          {economia > 0 && (
                            <p className="mt-1 text-xs font-semibold text-green-600">
                              Você economiza{" "}
                              {formatarPreco(economia)}
                            </p>
                          )}
                        </div>

                        {/* =================================================
                            ESTOQUE
                        ================================================= */}

                        <div className="mt-4">
                          {oferta.estoque <= 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500">
                              <span>●</span>
                              Produto esgotado
                            </span>
                          ) : oferta.estoque <= 5 ? (
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
                          href={`/produtos/${oferta.id}`}
                          className="mt-5 block w-full rounded-full border-2 border-[#e58b6f] px-5 py-3 text-center font-semibold text-[#e58b6f] transition hover:bg-[#fff4ec] focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
                        >
                          Ver detalhes
                        </Link>

                        {/* =================================================
                            CARRINHO
                        ================================================= */}

                        <div className="mt-3">
                          <AdicionarAoCarrinho
                            produto={oferta}
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* =================================================
                  BOTÃO FINAL
              ================================================= */}

              <div className="mt-10 text-center">
                <Link
                  href="/produtos"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-[#c96d53] shadow-sm transition hover:bg-[#fffaf5] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#e58b6f]"
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
      </div>
    </section>
  );
}

