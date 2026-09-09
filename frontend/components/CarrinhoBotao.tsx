"use client";

import Link from "next/link";

import { useCarrinho } from "@/components/CarrinhoProvider";

export default function CarrinhoBotao() {
  const { quantidadeTotal } = useCarrinho();

  return (
    <Link
      href="/carrinho"
      aria-label={`Carrinho com ${quantidadeTotal} ${
        quantidadeTotal === 1 ? "item" : "itens"
      }`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#eadfd6] bg-white text-xl transition hover:bg-[#fff4ec]"
    >
      🛒

      {quantidadeTotal > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e58b6f] px-1 text-[11px] font-bold text-white">
          {quantidadeTotal > 99 ? "99+" : quantidadeTotal}
        </span>
      )}
    </Link>
  );
}