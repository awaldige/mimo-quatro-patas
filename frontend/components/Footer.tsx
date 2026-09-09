"use client";

import Link from "next/link";

export default function Footer() {
  const simularRedeSocial = (rede: string) => {
    alert(
      `${rede}\n\nPerfil oficial da Mimo Quatro Patas em preparação.\nO link será ativado após a aprovação da loja.`
    );
  };

  return (
    <footer className="bg-[#2d2a26] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* Conteúdo principal */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-bold text-[#f6c85f] transition hover:text-white"
            >
              <span className="text-3xl">🐾</span>
              Mimo Quatro Patas
            </Link>

            <p className="mt-5 max-w-sm leading-7 text-white/70">
              Produtos e mimos especiais para cães e gatos, escolhidos com
              carinho para quem considera seu pet parte da família.
            </p>

            <div className="mt-5 inline-flex rounded-full bg-white/5 px-4 py-2 text-sm text-white/60">
              ❤️ Feito para quem ama pets
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="text-base font-bold text-white">
              Navegação
            </h3>

            <nav className="mt-5 flex flex-col gap-3 text-sm text-white/70">
              <Link
                href="/"
                className="transition hover:translate-x-1 hover:text-[#f6c85f]"
              >
                Início
              </Link>

              <Link
                href="/produtos"
                className="transition hover:translate-x-1 hover:text-[#f6c85f]"
              >
                Produtos
              </Link>

              <Link
                href="/categorias"
                className="transition hover:translate-x-1 hover:text-[#f6c85f]"
              >
                Categorias
              </Link>

              <Link
                href="/#ofertas"
                className="transition hover:translate-x-1 hover:text-[#f6c85f]"
              >
                Ofertas
              </Link>
            </nav>
          </div>

          {/* Atendimento */}
          <div>
            <h3 className="text-base font-bold text-white">
              Atendimento
            </h3>

            <div className="mt-5 space-y-4 text-sm text-white/70">
              <p className="flex items-start gap-3">
                <span className="text-lg">💬</span>
                <span>WhatsApp</span>
              </p>

              <p className="flex items-start gap-3">
                <span className="text-lg">📧</span>
                <span className="break-all">
                  contato@mimoquatropatas.com.br
                </span>
              </p>

              <p className="flex items-start gap-3">
                <span className="text-lg">🕐</span>
                <span>
                  Segunda a sexta, das 9h às 18h
                </span>
              </p>
            </div>
          </div>

          {/* Redes sociais */}
          <div>
            <h3 className="text-base font-bold text-white">
              Siga a Mimo
            </h3>

            <p className="mt-5 text-sm leading-6 text-white/60">
              Acompanhe novidades, produtos e novidades para o seu pet.
            </p>

            <div className="mt-5 flex gap-3">
              {/* Instagram */}
              <button
                type="button"
                onClick={() => simularRedeSocial("Instagram")}
                aria-label="Instagram"
                title="Instagram - em breve"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:-translate-y-1 hover:bg-[#e58b6f] focus:outline-none focus:ring-2 focus:ring-[#f6c85f]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                  />
                  <circle cx="12" cy="12" r="4" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => simularRedeSocial("Facebook")}
                aria-label="Facebook"
                title="Facebook - em breve"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:-translate-y-1 hover:bg-[#e58b6f] focus:outline-none focus:ring-2 focus:ring-[#f6c85f]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <path d="M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v6h4v-6h3.5l.5-4H13V9c0-.67.33-1 1-1Z" />
                </svg>
              </button>

              {/* TikTok */}
              <button
                type="button"
                onClick={() => simularRedeSocial("TikTok")}
                aria-label="TikTok"
                title="TikTok - em breve"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:-translate-y-1 hover:bg-[#e58b6f] focus:outline-none focus:ring-2 focus:ring-[#f6c85f]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <path d="M15 3h3c.15 1.25.75 2.32 1.8 3.15A6.7 6.7 0 0 0 23 7.3v3.1a9.6 9.6 0 0 1-5-1.55v7.1a5.55 5.55 0 1 1-5.55-5.55c.32 0 .63.03.93.08v3.18a2.55 2.55 0 1 0 1.62 2.37V3Z" />
                </svg>
              </button>
            </div>

            <p className="mt-3 text-xs text-white/30">
              Redes sociais oficiais em breve
            </p>
          </div>
        </div>

        {/* Linha inferior */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-white/50 md:flex-row md:text-left">
            <p>
              © {new Date().getFullYear()} Mimo Quatro Patas. Todos os
              direitos reservados.
            </p>

            <div className="flex items-center gap-5">
              <span>🐶 Para cães</span>
              <span>🐱 Para gatos</span>
            </div>
          </div>

          {/* Acesso administrativo discreto */}
          <div className="mt-5 text-center">
            <Link
              href="/admin/dashboard"
              className="text-xs text-white/20 transition hover:text-white/50"
            >
              Área administrativa
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}