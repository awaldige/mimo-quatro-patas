import type { Metadata } from "next";

import "./globals.css";

import { CarrinhoProvider } from "@/components/CarrinhoProvider";

export const metadata: Metadata = {
  title: {
    default: "Mimo Quatro Patas | Produtos para Cães e Gatos",
    template: "%s | Mimo Quatro Patas",
  },

  description:
    "Encontre produtos, acessórios e mimos para cães e gatos na Mimo Quatro Patas.",

  keywords: [
    "produtos para cães",
    "produtos para gatos",
    "acessórios para pets",
    "pet shop",
    "loja pet",
    "cães",
    "gatos",
    "acessórios pet",
    "Mimo Quatro Patas",
  ],

  authors: [
    {
      name: "Mimo Quatro Patas",
    },
  ],

  creator: "Mimo Quatro Patas",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Mimo Quatro Patas",
    title: "Mimo Quatro Patas | Produtos para Cães e Gatos",
    description:
      "Encontre produtos, acessórios e mimos para cães e gatos na Mimo Quatro Patas.",
    images: [
      {
        url: "/imagem/og-image.png",
        width: 1536,
        height: 1024,
        alt: "Mimo Quatro Patas - Produtos para cães e gatos",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Mimo Quatro Patas | Produtos para Cães e Gatos",
    description:
      "Encontre produtos, acessórios e mimos para cães e gatos na Mimo Quatro Patas.",
    images: ["/imagem/og-image.png"],
  },

  category: "ecommerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <CarrinhoProvider>{children}</CarrinhoProvider>
      </body>
    </html>
  );
}