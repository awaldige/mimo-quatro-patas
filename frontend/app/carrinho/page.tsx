"use client";

import Link from "next/link";

import { useCarrinho } from "@/components/CarrinhoProvider";
import { getImagemUrl } from "@/services/api";

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CarrinhoPage() {
  const {
    itens,
    quantidadeTotal,
    valorTotal,
    removerDoCarrinho,
    alterarQuantidade,
    limparCarrinho,
  } = useCarrinho();

  if (itens.length === 0) {
    return (
      <main className="min-h-screen bg-[#fffaf5] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-7xl">🛒</div>

            <h1 className="mt-6 text-3xl font-bold text-[#2d2a26]">
              Seu carrinho está vazio
            </h1>

            <p className="mx-auto mt-4 max-w-md text-[#756f69]">
              Escolha alguns mimos para o seu pet e eles aparecerão aqui.
            </p>

            <Link
              href="/#produtos"
              className="mt-8 inline-flex rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53]"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Link
              href="/#produtos"
              className="text-sm font-semibold text-[#e58b6f] transition hover:text-[#c96d53]"
            >
              ← Continuar comprando
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-[#2d2a26] md:text-4xl">
              Meu carrinho
            </h1>

            <p className="mt-2 text-[#756f69]">
              {quantidadeTotal}{" "}
              {quantidadeTotal === 1 ? "item" : "itens"} no carrinho
            </p>
          </div>

          <button
            type="button"
            onClick={limparCarrinho}
            className="w-fit text-sm font-semibold text-[#c96d53] transition hover:text-red-600"
          >
            Limpar carrinho
          </button>
        </div>

        {/* Conteúdo */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Produtos */}
          <section className="space-y-4">
            {itens.map((item) => {
              const precoPromocional = Number(item.produto.precoPromo);
              const precoOriginal = Number(item.produto.preco);

              const possuiOferta =
                precoPromocional > 0 &&
                precoPromocional < precoOriginal;

              const preco = possuiOferta
                ? precoPromocional
                : precoOriginal;

              const subtotal = preco * item.quantidade;

              // Usa a função centralizada de tratamento das imagens
              const imagemUrl = getImagemUrl(item.produto.imagem);

              return (
                <article
                  key={item.produto.id}
                  className="rounded-3xl bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">
                    {/* Imagem */}
                    <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#fff4ec] sm:w-32">
                      {imagemUrl ? (
                        <img
                          src={imagemUrl}
                          alt={item.produto.nome}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(event) => {
                            console.error(
                              "Erro ao carregar imagem:",
                              imagemUrl
                            );

                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-5xl">🐾</span>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        {item.produto.categoria && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-[#e58b6f]">
                            {item.produto.categoria.nome}
                          </span>
                        )}

                        <h2 className="mt-1 text-lg font-bold text-[#2d2a26]">
                          {item.produto.nome}
                        </h2>

                        <p className="mt-2 text-sm font-semibold text-[#e58b6f]">
                          {formatarPreco(preco)}
                        </p>

                        {possuiOferta && (
                          <p className="mt-1 text-xs text-[#756f69] line-through">
                            {formatarPreco(precoOriginal)}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        {/* Quantidade */}
                        <div className="flex items-center overflow-hidden rounded-full border border-[#eadfd6]">
                          <button
                            type="button"
                            onClick={() =>
                              alterarQuantidade(
                                item.produto.id,
                                item.quantidade - 1
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center text-lg font-semibold text-[#2d2a26] transition hover:bg-[#fff4ec]"
                            aria-label={`Diminuir quantidade de ${item.produto.nome}`}
                          >
                            −
                          </button>

                          <span className="flex h-9 min-w-10 items-center justify-center text-sm font-semibold text-[#2d2a26]">
                            {item.quantidade}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              alterarQuantidade(
                                item.produto.id,
                                item.quantidade + 1
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center text-lg font-semibold text-[#2d2a26] transition hover:bg-[#fff4ec]"
                            aria-label={`Aumentar quantidade de ${item.produto.nome}`}
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <strong className="text-lg text-[#2d2a26]">
                          {formatarPreco(subtotal)}
                        </strong>

                        {/* Remover */}
                        <button
                          type="button"
                          onClick={() =>
                            removerDoCarrinho(item.produto.id)
                          }
                          className="text-sm font-semibold text-[#756f69] transition hover:text-red-500"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {/* Resumo */}
          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-xl font-bold text-[#2d2a26]">
              Resumo do pedido
            </h2>

            <div className="mt-6 space-y-4 border-b border-[#eadfd6] pb-6">
              <div className="flex justify-between gap-4 text-sm text-[#756f69]">
                <span>Produtos</span>

                <span>
                  {quantidadeTotal}{" "}
                  {quantidadeTotal === 1 ? "item" : "itens"}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm text-[#756f69]">
                <span>Subtotal</span>

                <span>{formatarPreco(valorTotal)}</span>
              </div>

              <div className="flex justify-between gap-4 text-sm text-[#756f69]">
                <span>Frete</span>

                <span>A calcular</span>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 flex items-center justify-between gap-4">
              <span className="font-semibold text-[#2d2a26]">
                Total
              </span>

              <strong className="text-2xl text-[#e58b6f]">
                {formatarPreco(valorTotal)}
              </strong>
            </div>

            {/* Finalizar compra */}
            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-full bg-[#e58b6f] px-6 py-4 text-center font-semibold text-white transition hover:bg-[#c96d53]"
            >
              Finalizar compra
            </Link>

            <p className="mt-4 text-center text-xs leading-5 text-[#756f69]">
              O frete e as opções de pagamento serão definidos
              na próxima etapa.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}