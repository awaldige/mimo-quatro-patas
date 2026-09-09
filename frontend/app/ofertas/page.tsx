import Link from "next/link";

import { getProdutos, Produto } from "@/services/api";
import AdicionarAoCarrinho from "@/components/AdicionarAoCarrinho";

function formatarPreco(valor: string | number) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function calcularDesconto(preco: number, precoPromo: number) {
  if (preco <= 0 || precoPromo >= preco) {
    return 0;
  }

  return Math.round(((preco - precoPromo) / preco) * 100);
}

export default async function OfertasPage() {
  let produtos: Produto[] = [];

  try {
    produtos = await getProdutos();
  } catch (error) {
    console.error("Erro ao carregar ofertas:", error);
  }

  const ofertas = produtos
    .filter((produto) => {
      if (!produto.ativo) {
        return false;
      }

      if (
        produto.precoPromo === null ||
        produto.precoPromo === undefined
      ) {
        return false;
      }

      const preco = Number(produto.preco);
      const precoPromo = Number(produto.precoPromo);

      return (
        preco > 0 &&
        precoPromo > 0 &&
        precoPromo < preco
      );
    })
    .sort((a, b) => {
      const descontoA = calcularDesconto(
        Number(a.preco),
        Number(a.precoPromo)
      );

      const descontoB = calcularDesconto(
        Number(b.preco),
        Number(b.precoPromo)
      );

      return descontoB - descontoA;
    });

  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">

        {/* Voltar */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-[#e58b6f] transition hover:text-[#c96d53]"
          >
            ← Voltar para a página inicial
          </Link>

          <span className="mt-8 block text-sm font-bold uppercase tracking-[0.2em] text-[#e58b6f]">
            Aproveite nossas ofertas
          </span>

          <h1 className="mt-3 text-3xl font-bold text-[#2d2a26] md:text-4xl">
            Ofertas especiais
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#756f69]">
            Encontre produtos selecionados com preços especiais
            para deixar seu pet ainda mais feliz.
          </p>
        </div>

        {/* Ofertas */}
        {ofertas.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-[#eadfd6] bg-white px-6 py-16 text-center shadow-sm">
            <div
              className="text-6xl"
              role="img"
              aria-label="Patinha de animal"
            >
              🐾
            </div>

            <h2 className="mt-5 text-2xl font-bold text-[#2d2a26]">
              Nenhuma oferta disponível
            </h2>

            <p className="mx-auto mt-3 max-w-md text-[#756f69]">
              No momento não temos produtos em promoção.
              Volte em breve para conferir nossas novidades.
            </p>

            <Link
              href="/produtos"
              className="mt-8 inline-flex rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53]"
            >
              Ver todos os produtos
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {ofertas.map((produto) => {
              const precoOriginal = Number(produto.preco);
              const precoAtual = Number(produto.precoPromo);

              const percentualDesconto = calcularDesconto(
                precoOriginal,
                precoAtual
              );

              return (
                <article
                  key={produto.id}
                  className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#eadfd6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Imagem */}
                  <div className="relative h-64 overflow-hidden bg-[#fff4ec]">
                    {produto.imagem ? (
                      <img
                        src={produto.imagem}
                        alt={produto.nome}
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

                    {/* Desconto */}
                    <span className="absolute left-4 top-4 rounded-full bg-[#e58b6f] px-4 py-2 text-xs font-bold text-white shadow-sm">
                      -{percentualDesconto}%
                    </span>

                    {/* Oferta */}
                    <span className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[#e58b6f] shadow-sm">
                      🔥 Oferta
                    </span>
                  </div>

                  {/* Informações */}
                  <div className="flex flex-1 flex-col p-6">
                    {produto.categoria && (
                      <span className="text-xs font-bold uppercase tracking-wider text-[#e58b6f]">
                        {produto.categoria.nome}
                      </span>
                    )}

                    <h2 className="mt-2 text-xl font-bold text-[#2d2a26]">
                      {produto.nome}
                    </h2>

                    {produto.descricao && (
                      <p className="mt-3 line-clamp-2 min-h-[48px] text-sm leading-6 text-[#756f69]">
                        {produto.descricao}
                      </p>
                    )}

                    {/* Preços */}
                    <div className="mt-5">
                      <span className="text-sm text-gray-400 line-through">
                        {formatarPreco(precoOriginal)}
                      </span>

                      <strong className="mt-1 block text-2xl font-bold text-[#e58b6f]">
                        {formatarPreco(precoAtual)}
                      </strong>
                    </div>

                    {/* Estoque */}
                    <div className="mt-4">
                      {produto.estoque <= 0 ? (
                        <span className="text-sm font-semibold text-red-500">
                          Produto esgotado
                        </span>
                      ) : produto.estoque <= 5 ? (
                        <span className="text-sm font-semibold text-orange-500">
                          Últimas unidades
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-green-600">
                          Em estoque
                        </span>
                      )}
                    </div>

                    {/* Detalhes */}
                    <Link
                      href={`/produtos/${produto.id}`}
                      className="mt-5 block w-full rounded-full border-2 border-[#e58b6f] px-5 py-3 text-center font-semibold text-[#e58b6f] transition hover:bg-[#fff4ec]"
                    >
                      Ver detalhes
                    </Link>

                    {/* Carrinho */}
                    <AdicionarAoCarrinho produto={produto} />
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