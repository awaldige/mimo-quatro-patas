import type { Metadata } from "next";
import { Suspense } from "react";

import ProdutosClient from "./ProdutosClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Produtos para Cães e Gatos | Mimo Quatro Patas",
  description:
    "Confira nossa seleção de produtos para cães e gatos, com acessórios, cuidados, conforto e diversão para o seu pet.",
  keywords: [
    "produtos para cães",
    "produtos para gatos",
    "acessórios para pets",
    "produtos pet",
    "loja pet",
    "Mimo Quatro Patas",
  ],
  openGraph: {
    title: "Produtos para Cães e Gatos | Mimo Quatro Patas",
    description:
      "Confira produtos e acessórios especiais para cães e gatos na Mimo Quatro Patas.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Produtos para Cães e Gatos | Mimo Quatro Patas",
    description:
      "Confira produtos e acessórios especiais para cães e gatos na Mimo Quatro Patas.",
  },
};

function ProdutosLoading() {
  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-[#eadfd6] bg-white px-6 py-16 text-center shadow-sm">
          <div className="text-5xl">🐾</div>

          <p className="mt-4 font-semibold text-[#756f69]">
            Carregando produtos...
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<ProdutosLoading />}>
      <ProdutosClient />
    </Suspense>
  );
}