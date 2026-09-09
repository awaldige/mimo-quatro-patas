
import type { MetadataRoute } from "next";

import { getProdutos } from "@/services/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dataAtual = new Date();

  const paginasPrincipais: MetadataRoute.Sitemap = [
    {
      url: "/",
      lastModified: dataAtual,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "/produtos",
      lastModified: dataAtual,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "/categorias",
      lastModified: dataAtual,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "/ofertas",
      lastModified: dataAtual,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const produtos = await getProdutos();

    const produtosSitemap: MetadataRoute.Sitemap = produtos
      .filter((produto) => produto.ativo)
      .map((produto) => ({
        url: `/produtos/${produto.id}`,
        lastModified: dataAtual,
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    return [
      ...paginasPrincipais,
      ...produtosSitemap,
    ];
  } catch (error) {
    console.error(
      "[sitemap] Erro ao carregar produtos:",
      error
    );

    return paginasPrincipais;
  }
}

