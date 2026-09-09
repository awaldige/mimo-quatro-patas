
import Link from "next/link";

import {
  getCategorias,
  Categoria,
  getImagemUrl,
} from "@/services/api";

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

export default async function Categorias() {
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
    <section
      id="categorias"
      className="bg-[#fffaf5] px-6 py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            CABEÇALHO
        ===================================================== */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-[#f6c85f]/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.15em] text-[#c96d53]">
            🐾 Explore nossa loja
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#2d2a26] md:text-4xl">
            Encontre tudo para o seu pet
          </h2>

          <p className="mt-4 leading-7 text-[#756f69]">
            Escolha uma categoria e descubra produtos especiais
            para deixar seu cão ou gato ainda mais feliz.
          </p>
        </div>

        {/* =====================================================
            CATEGORIAS
        ===================================================== */}
        {categoriasAtivas.length === 0 ? (
          <div className="mx-auto mt-12 max-w-2xl rounded-[2rem] border border-[#eadfd6] bg-white px-6 py-16 text-center shadow-sm">
            <div
              className="text-6xl"
              role="img"
              aria-label="Patinha de animal"
            >
              🐾
            </div>

            <h3 className="mt-5 text-2xl font-bold text-[#2d2a26]">
              Nenhuma categoria disponível
            </h3>

            <p className="mx-auto mt-3 max-w-md leading-7 text-[#756f69]">
              Estamos preparando novas categorias e produtos
              para o seu pet.
            </p>

            <Link
              href="/produtos"
              className="mt-8 inline-flex rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#c96d53] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categoriasAtivas.map((categoria) => {
              /*
               * Converte imagens como:
               * /uploads/cachorros-123.png
               *
               * para a URL correta do backend quando necessário.
               */
              const imagemUrl = categoria.imagem
                ? getImagemUrl(categoria.imagem)
                : null;

              return (
                <Link
                  key={categoria.id}
                  href={`/produtos?categoria=${categoria.id}`}
                  aria-label={`Ver produtos da categoria ${categoria.nome}`}
                  className="group overflow-hidden rounded-[2rem] border border-[#eadfd6] bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-[#e58b6f]/40 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
                >
                  {/* =================================================
                      IMAGEM
                  ================================================= */}
                  <div className="relative aspect-square w-full overflow-hidden bg-[#fff4ec]">
                    {imagemUrl ? (
                      <img
                        src={imagemUrl}
                        alt={`Produtos da categoria ${categoria.nome}`}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        {/* Decoração */}
                        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#f6c85f]/20 transition duration-500 group-hover:scale-150" />

                        <div className="pointer-events-none absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-[#e58b6f]/10" />

                        {/* Emoji */}
                        <div className="flex h-full items-center justify-center">
                          <div
                            className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#f6c85f]/20 text-6xl shadow-sm transition duration-300 group-hover:scale-110 group-hover:bg-[#f6c85f]/30"
                            role="img"
                            aria-label={`Ícone da categoria ${categoria.nome}`}
                          >
                            {obterEmoji(categoria.nome)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* =================================================
                      CONTEÚDO
                  ================================================= */}
                  <div className="p-6">
                    {!imagemUrl && (
                      <h3 className="text-xl font-bold text-[#2d2a26]">
                        {categoria.nome}
                      </h3>
                    )}

                    {/* Descrição */}
                    {categoria.descricao ? (
                      <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-7 text-[#756f69]">
                        {categoria.descricao}
                      </p>
                    ) : (
                      <p className="mt-3 min-h-[72px] text-sm leading-7 text-[#756f69]">
                        Encontre produtos especiais para o seu pet.
                      </p>
                    )}

                    {/* =================================================
                        AÇÃO
                    ================================================= */}
                    <div className="mt-5 flex items-center justify-between border-t border-[#eadfd6] pt-5">
                      <span className="font-semibold text-[#e58b6f] transition duration-300 group-hover:text-[#c96d53]">
                        Ver produtos
                      </span>

                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff4ec] font-bold text-[#e58b6f] transition duration-300 group-hover:translate-x-1 group-hover:bg-[#e58b6f] group-hover:text-white"
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* =====================================================
            CTA
        ===================================================== */}
        {categoriasAtivas.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/categorias"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#e58b6f] bg-white px-7 py-3 font-semibold text-[#e58b6f] transition duration-300 hover:-translate-y-0.5 hover:bg-[#e58b6f] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
            >
              Ver todas as categorias

              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

