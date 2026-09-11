export const dynamic = "force-dynamic";

import Link from "next/link";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categorias from "@/components/Categorias";
import ProdutosDestaque from "@/components/ProdutosDestaque";
import ProdutosMaisVendidos from "@/components/ProdutosMaisVendidos";
import Ofertas from "@/components/Ofertas";
import Beneficios from "@/components/Beneficios";
import Avaliacoes from "@/components/Avaliacoes";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />

      <main className="bg-[#fffaf5]">

        {/* =====================================================
            HERO
        ===================================================== */}
        <section id="inicio">
          <Hero />
        </section>

        {/* =====================================================
            CATEGORIAS
        ===================================================== */}
        <section id="categorias">
          <Categorias />
        </section>

        {/* =====================================================
            PRODUTOS EM DESTAQUE
        ===================================================== */}
        <section id="produtos">
          <ProdutosDestaque />
        </section>

        {/* =====================================================
            PRODUTOS MAIS VENDIDOS
        ===================================================== */}
        <section id="mais-vendidos">
          <ProdutosMaisVendidos />
        </section>

        {/* =====================================================
            OFERTAS
        ===================================================== */}
        <section id="ofertas">
          <Ofertas />
        </section>

        {/* =====================================================
            BENEFÍCIOS
        ===================================================== */}
        <section id="beneficios">
          <Beneficios />
        </section>

        {/* =====================================================
            AVALIAÇÕES
        ===================================================== */}
        <section id="avaliacoes">
          <Avaliacoes />
        </section>

        {/* =====================================================
            CTA FINAL
        ===================================================== */}
        <section
          id="loja"
          className="px-6 py-16 md:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#2d2a26] px-6 py-14 text-center shadow-xl sm:px-10 md:px-16">

              {/* Elementos decorativos */}
              <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#e58b6f]/20" />

              <div className="pointer-events-none absolute -bottom-20 -right-10 h-48 w-48 rounded-full bg-[#e58b6f]/20" />

              {/* Conteúdo */}
              <div className="relative">

                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#e58b6f]">
                  Mimo Quatro Patas
                </span>

                <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold leading-tight text-white md:text-4xl">
                  Encontre o mimo perfeito para o seu pet
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                  Produtos escolhidos para proporcionar mais
                  conforto, diversão e carinho para cães e gatos.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                  <Link
                    href="/produtos"
                    className="rounded-full bg-[#e58b6f] px-7 py-3.5 font-semibold text-white transition hover:bg-[#c96d53] hover:shadow-lg"
                  >
                    Ver todos os produtos
                  </Link>

                  <Link
                    href="#inicio"
                    className="rounded-full border border-white/20 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
                  >
                    Voltar ao início
                  </Link>

                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}