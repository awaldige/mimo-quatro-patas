"use client";

import Link from "next/link";
import { useState } from "react";

import { Produto } from "@/services/api";
import { useCarrinho } from "@/components/CarrinhoProvider";

interface AdicionarAoCarrinhoProps {
  produto: Produto;
}

export default function AdicionarAoCarrinho({
  produto,
}: AdicionarAoCarrinhoProps) {
  const { adicionarAoCarrinho, itens } = useCarrinho();

  const [adicionado, setAdicionado] = useState(false);

  // Proteção contra produto inválido
  if (!produto || !produto.id) {
    return null;
  }

  const estoque = Number(produto.estoque ?? 0);

  const itemNoCarrinho = itens.find(
    (item) => item.produto?.id === produto.id
  );

  const quantidadeNoCarrinho =
    itemNoCarrinho?.quantidade ?? 0;

  function handleAdicionar() {
    if (estoque <= 0) {
      return;
    }

    if (quantidadeNoCarrinho >= estoque) {
      return;
    }

    adicionarAoCarrinho(produto);

    setAdicionado(true);

    setTimeout(() => {
      setAdicionado(false);
    }, 2000);
  }

  // Produto sem estoque
  if (estoque <= 0) {
    return (
      <button
        type="button"
        disabled
        className="mt-8 w-full cursor-not-allowed rounded-full bg-gray-300 px-6 py-4 font-semibold text-white"
      >
        Produto esgotado
      </button>
    );
  }

  const estoqueAtingido =
    quantidadeNoCarrinho >= estoque;

  return (
    <div className="mt-8 space-y-3">
      <button
        type="button"
        onClick={handleAdicionar}
        disabled={estoqueAtingido}
        className={`w-full rounded-full px-6 py-4 font-semibold text-white transition ${
          estoqueAtingido
            ? "cursor-not-allowed bg-gray-300"
            : "bg-[#e58b6f] hover:bg-[#c96d53]"
        }`}
      >
        {estoqueAtingido
          ? "Limite de estoque atingido"
          : adicionado
          ? "✓ Adicionado ao carrinho"
          : "Adicionar ao carrinho"}
      </button>

      {adicionado && (
        <Link
          href="/carrinho"
          className="block w-full rounded-full border-2 border-[#e58b6f] px-6 py-4 text-center font-semibold text-[#e58b6f] transition hover:bg-[#fff4ec]"
        >
          Ver carrinho
        </Link>
      )}
    </div>
  );
}