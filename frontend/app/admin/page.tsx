
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            CABEÇALHO
        ===================================================== */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#e58b6f]">
              Mimo Quatro Patas
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#2d2a26] md:text-4xl">
              Painel Administrativo
            </h1>

            <p className="mt-2 text-[#756f69]">
              Gerencie produtos, categorias, fornecedores e pedidos da loja.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center rounded-full border-2 border-[#e58b6f] px-5 py-3 text-sm font-semibold text-[#e58b6f] transition hover:bg-[#fff4ec] focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
          >
            ← Ver loja
          </Link>
        </div>

        {/* =====================================================
            ÁREAS PRINCIPAIS
        ===================================================== */}

        <section className="mt-10">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* =================================================
                PRODUTOS
            ================================================= */}

            <Link
              href="/admin/produtos"
              className="group rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#e58b6f]/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4ec] text-3xl">
                📦
              </div>

              <p className="mt-5 text-sm font-medium text-[#756f69]">
                Produtos
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#2d2a26]">
                Gerenciar produtos
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756f69]">
                Cadastre, edite, ative ou desative os produtos da loja.
              </p>

              <span className="mt-5 block font-semibold text-[#e58b6f] transition group-hover:text-[#c96d53]">
                Acessar produtos →
              </span>
            </Link>

            {/* =================================================
                CATEGORIAS
            ================================================= */}

            <Link
              href="/admin/categorias"
              className="group rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#e58b6f]/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4ec] text-3xl">
                🐾
              </div>

              <p className="mt-5 text-sm font-medium text-[#756f69]">
                Categorias
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#2d2a26]">
                Gerenciar categorias
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756f69]">
                Crie e organize as categorias de produtos do pet shop.
              </p>

              <span className="mt-5 block font-semibold text-[#e58b6f] transition group-hover:text-[#c96d53]">
                Acessar categorias →
              </span>
            </Link>

            {/* =================================================
                FORNECEDORES
            ================================================= */}

            <Link
              href="/admin/fornecedores"
              className="group rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#e58b6f]/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4ec] text-3xl">
                🚚
              </div>

              <p className="mt-5 text-sm font-medium text-[#756f69]">
                Fornecedores
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#2d2a26]">
                Gerenciar fornecedores
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756f69]">
                Gerencie fornecedores e prepare a loja para dropshipping.
              </p>

              <span className="mt-5 block font-semibold text-[#e58b6f] transition group-hover:text-[#c96d53]">
                Acessar fornecedores →
              </span>
            </Link>

            {/* =================================================
                PEDIDOS
            ================================================= */}

            <Link
              href="/admin/pedidos"
              className="group rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#e58b6f]/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4ec] text-3xl">
                🛒
              </div>

              <p className="mt-5 text-sm font-medium text-[#756f69]">
                Pedidos
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#2d2a26]">
                Gerenciar pedidos
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756f69]">
                Consulte pedidos realizados e acompanhe seus status.
              </p>

              <span className="mt-5 block font-semibold text-[#e58b6f] transition group-hover:text-[#c96d53]">
                Acessar pedidos →
              </span>
            </Link>
          </div>
        </section>

        {/* =====================================================
            RECURSOS ADICIONAIS
        ===================================================== */}

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-[#2d2a26]">
            Recursos adicionais
          </h2>

          <p className="mt-2 text-[#756f69]">
            Ferramentas para ampliar o gerenciamento e o desempenho da loja.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* =================================================
                CUPONS
            ================================================= */}

            <Link
              href="/admin/cupons"
              className="group rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#e58b6f]/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4ec] text-3xl">
                🎟️
              </div>

              <p className="mt-5 text-sm font-medium text-[#756f69]">
                Descontos
              </p>

              <h3 className="mt-1 text-2xl font-bold text-[#2d2a26]">
                Cupons
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#756f69]">
                Crie e gerencie cupons de desconto para os clientes da loja.
              </p>

              <span className="mt-5 block font-semibold text-[#e58b6f] transition group-hover:text-[#c96d53]">
                Gerenciar cupons →
              </span>
            </Link>

            {/* =================================================
                AVALIAÇÕES
            ================================================= */}

            <Link
              href="/admin/avaliacoes"
              className="group rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#e58b6f]/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4ec] text-3xl">
                ⭐
              </div>

              <p className="mt-5 text-sm font-medium text-[#756f69]">
                Clientes
              </p>

              <h3 className="mt-1 text-2xl font-bold text-[#2d2a26]">
                Avaliações
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#756f69]">
                Gerencie avaliações, notas e comentários realizados pelos
                clientes.
              </p>

              <span className="mt-5 block font-semibold text-[#e58b6f] transition group-hover:text-[#c96d53]">
                Gerenciar avaliações →
              </span>
            </Link>

            {/* =================================================
                RELATÓRIOS
            ================================================= */}

            <Link
              href="/admin/relatorios"
              className="group rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#e58b6f]/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4ec] text-3xl">
                📊
              </div>

              <p className="mt-5 text-sm font-medium text-[#756f69]">
                Análise
              </p>

              <h3 className="mt-1 text-2xl font-bold text-[#2d2a26]">
                Relatórios
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#756f69]">
                Consulte vendas, pedidos, produtos e indicadores de desempenho.
              </p>

              <span className="mt-5 block font-semibold text-[#e58b6f] transition group-hover:text-[#c96d53]">
                Ver relatórios →
              </span>
            </Link>
          </div>
        </section>

        {/* =====================================================
            RODAPÉ
        ===================================================== */}

        <footer className="mt-12 border-t border-[#eadfd6] pt-6 text-center">
          <p className="text-sm text-[#a39a92]">
            Mimo Quatro Patas • Painel Administrativo
          </p>
        </footer>
      </div>
    </main>
  );
}

