
import type { Metadata } from "next";

import ProdutosClient from "./ProdutosClient";

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

export default function ProdutosPage() {
  return <ProdutosClient />;
}

