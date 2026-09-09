import Link from "next/link";

import CarrinhoBotao from "@/components/CarrinhoBotao";

export default function Header() {
  return (
    <header className="border-b border-[#eadfd6] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-[#e58b6f]"
        >
          Mimo Quatro Patas
        </Link>

        {/* Navegação */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-[#2d2a26] transition hover:text-[#e58b6f]"
          >
            Início
          </Link>

          <Link
            href="/produtos"
            className="text-sm font-medium text-[#2d2a26] transition hover:text-[#e58b6f]"
          >
            Produtos
          </Link>

          <Link
            href="/categorias"
            className="text-sm font-medium text-[#2d2a26] transition hover:text-[#e58b6f]"
          >
            Categorias
          </Link>

          <Link
            href="/ofertas"
            className="text-sm font-medium text-[#2d2a26] transition hover:text-[#e58b6f]"
          >
            Ofertas
          </Link>
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-3">

          {/* Carrinho */}
          <CarrinhoBotao />

        </div>
      </div>
    </header>
  );
}