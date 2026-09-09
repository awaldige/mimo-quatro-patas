export default function Hero() {
  return (
    <section className="overflow-hidden bg-[#fffaf5]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 md:grid-cols-2 md:py-16 lg:py-20">
        {/* =====================================================
            CONTEÚDO
        ===================================================== */}
        <div>
          <span className="inline-flex items-center rounded-full bg-[#f6c85f]/20 px-4 py-2 text-sm font-semibold text-[#c96d53]">
            🐾 Amor em cada detalhe
          </span>

          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-[#2d2a26] sm:text-5xl md:text-5xl lg:text-6xl">
            Produtos para cães e gatos para deixar seu pet ainda mais feliz
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[#756f69]">
            Encontre produtos especiais para cães e gatos, selecionados
            para trazer mais conforto, diversão e carinho para quem faz
            parte da sua família.
          </p>

          {/* =====================================================
              BOTÕES
          ===================================================== */}
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#produtos"
              className="inline-flex items-center justify-center rounded-full bg-[#e58b6f] px-7 py-3.5 font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#c96d53] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
            >
              🛍️ Comprar agora
            </a>

            <a
              href="#categorias"
              className="inline-flex items-center justify-center rounded-full border border-[#eadfd6] bg-white px-7 py-3.5 font-semibold text-[#2d2a26] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#fdf4ec] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
            >
              Ver categorias
              <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>

          {/* =====================================================
              BENEFÍCIOS
          ===================================================== */}
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#756f69]">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-bold text-[#8db596]">✓</span>
              Produtos selecionados
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="font-bold text-[#8db596]">✓</span>
              Compra segura
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="font-bold text-[#8db596]">✓</span>
              Para cães e gatos
            </span>
          </div>
        </div>

        {/* =====================================================
            IMAGEM DO HERO
        ===================================================== */}
        <div className="relative">
          <div className="relative min-h-[380px] overflow-hidden rounded-[2rem] bg-[#f6c85f]/20 shadow-sm sm:min-h-[440px] md:min-h-[480px]">
            <img
            src="/imagem/hero-mimo.png"
              alt="Produtos e acessórios para cães e gatos da Mimo Quatro Patas"
              className="h-full min-h-[380px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:min-h-[440px] md:min-h-[480px]"
            />

            {/* Gradiente suave */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          </div>

          {/* =====================================================
              CARD INFERIOR
          ===================================================== */}
          <div className="absolute -bottom-3 left-3 rounded-2xl border border-[#eadfd6] bg-white px-5 py-4 shadow-lg sm:-bottom-4 sm:-left-4">
            <p className="text-sm font-semibold text-[#2d2a26]">
              ❤️ Feito com carinho
            </p>

            <p className="mt-1 text-xs text-[#756f69]">
              Para quem ama pets
            </p>
          </div>

          {/* =====================================================
              CARD SUPERIOR
          ===================================================== */}
          <div className="absolute right-3 top-3 rounded-2xl border border-white/60 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:right-4 sm:top-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#e58b6f]">
              Mimo Quatro Patas
            </p>

            <p className="mt-1 text-sm font-semibold text-[#2d2a26]">
              Cuidado, carinho e diversão 🐾
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}