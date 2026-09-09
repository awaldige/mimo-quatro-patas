"use client";

import { useEffect, useState } from "react";
import FormularioAvaliacaoLoja from "./FormularioAvaliacaoLoja";

interface Avaliacao {
  id: number;
  nome: string;
  nota: number;
  comentario?: string | null;
  aprovado: boolean;
  ativo: boolean;
  produtoId?: number | null;
  createdAt?: string;
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export default function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarAvaliacoes() {
      try {
        const resposta = await fetch(
          `${API_URL}/api/avaliacoes/loja`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!resposta.ok) {
          throw new Error(
            `Erro ao carregar avaliações. Status ${resposta.status}.`
          );
        }

        const dados = await resposta.json();

        const lista: Avaliacao[] = Array.isArray(dados)
          ? dados
          : Array.isArray(dados?.avaliacoes)
          ? dados.avaliacoes
          : [];

        /*
         * A rota /avaliacoes/loja já retorna somente:
         *
         * - avaliações da loja
         * - produtoId = null
         * - aprovadas
         * - ativas
         *
         * Mantemos uma validação adicional no frontend.
         */

        const avaliacaoPublicas = lista
          .filter(
            (avaliacao) =>
              avaliacao.produtoId === null &&
              avaliacao.aprovado === true &&
              avaliacao.ativo === true &&
              Boolean(avaliacao.comentario?.trim())
          )
          .sort((a, b) => {
            const dataA = a.createdAt
              ? new Date(a.createdAt).getTime()
              : 0;

            const dataB = b.createdAt
              ? new Date(b.createdAt).getTime()
              : 0;

            return dataB - dataA;
          });

        /*
         * A Home mostra no máximo 3 avaliações.
         */
        setAvaliacoes(avaliacaoPublicas.slice(0, 3));
      } catch (error) {
        console.error(
          "[Avaliacoes] Erro ao carregar avaliações:",
          error
        );

        setAvaliacoes([]);
      } finally {
        setCarregando(false);
      }
    }

    carregarAvaliacoes();
  }, []);

  // =====================================================
  // ESTRELAS
  // =====================================================

  function renderizarEstrelas(nota: number) {
    const notaSegura = Math.max(
      0,
      Math.min(5, Math.round(Number(nota) || 0))
    );

    return (
      <span
        className="relative text-lg tracking-[0.2em] text-[#f6c85f]"
        aria-label={`Avaliação de ${notaSegura} estrelas`}
      >
        {"★".repeat(notaSegura)}

        <span className="text-[#eadfd6]">
          {"★".repeat(5 - notaSegura)}
        </span>
      </span>
    );
  }

  // =====================================================
  // FORMATAR NOME
  // =====================================================

  function formatarNome(nome: string) {
    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
      return "Cliente";
    }

    const partes = nomeLimpo.split(/\s+/);

    if (partes.length === 1) {
      return partes[0];
    }

    return `${partes[0]} ${partes[partes.length - 1]}`;
  }

  // =====================================================
  // CABEÇALHO
  // =====================================================

  function Cabecalho() {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex rounded-full bg-[#e58b6f]/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.15em] text-[#e58b6f]">
          Quem ama, recomenda
        </span>

        <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#2d2a26] md:text-4xl">
          O que nossos clientes dizem
        </h2>

        <p className="mt-4 leading-7 text-[#756f69]">
          A experiência de quem já encontrou um mimo especial
          para seu pet.
        </p>
      </div>
    );
  }

  // =====================================================
  // CARREGANDO
  // =====================================================

  if (carregando) {
    return (
      <section className="bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Cabecalho />

          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#eadfd6] border-t-[#e58b6f]" />
          </div>

          {/* FORMULÁRIO */}

          <FormularioAvaliacaoLoja />

          {/* MENSAGEM FINAL */}

          <div className="mx-auto mt-12 max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f6c85f]/15 px-5 py-2.5 text-sm font-semibold text-[#756f69]">
              <span>🐶</span>
              <span>Feito para quem ama e cuida</span>
              <span>🐱</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // SEM AVALIAÇÕES
  // =====================================================

  if (avaliacoes.length === 0) {
    return (
      <section className="bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Cabecalho />

          {/* AVISO */}

          <div className="mx-auto mt-12 max-w-xl rounded-[2rem] border border-[#eadfd6] bg-[#fffaf5] p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f6c85f]/20 text-3xl">
              🐾
            </div>

            <h3 className="mt-5 text-xl font-bold text-[#2d2a26]">
              Ainda não temos avaliações
            </h3>

            <p className="mt-3 leading-7 text-[#756f69]">
              Seja o primeiro a compartilhar sua experiência
              com a Mimo Quatro Patas.
            </p>
          </div>

          {/* FORMULÁRIO */}

          <FormularioAvaliacaoLoja />

          {/* MENSAGEM FINAL */}

          <div className="mx-auto mt-12 max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f6c85f]/15 px-5 py-2.5 text-sm font-semibold text-[#756f69]">
              <span>🐶</span>
              <span>Feito para quem ama e cuida</span>
              <span>🐱</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // AVALIAÇÕES DA LOJA
  // =====================================================

  return (
    <section className="bg-white px-6 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <Cabecalho />

        {/* AVALIAÇÕES */}

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {avaliacoes.map((avaliacao) => (
            <article
              key={avaliacao.id}
              className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#eadfd6] bg-[#fffaf5] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e58b6f]/40 hover:shadow-xl"
            >
              {/* DECORAÇÃO */}

              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#f6c85f]/10 transition duration-500 group-hover:scale-150" />

              {/* ESTRELAS */}

              <div className="relative">
                {renderizarEstrelas(avaliacao.nota)}
              </div>

              {/* COMENTÁRIO */}

              <div className="relative flex-1">
                <div className="mt-5 text-4xl leading-none text-[#e58b6f]/20">
                  “
                </div>

                <p className="mt-1 text-base leading-7 text-[#756f69]">
                  {avaliacao.comentario}
                </p>
              </div>

              {/* CLIENTE */}

              <div className="relative mt-7 flex items-center gap-4 border-t border-[#eadfd6] pt-5">
                {/* AVATAR */}

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f6c85f]/25 text-xl">
                  🐾
                </div>

                <div className="min-w-0">
                  <p className="truncate font-bold text-[#2d2a26]">
                    {formatarNome(avaliacao.nome)}
                  </p>

                  <p className="mt-1 text-sm text-[#756f69]">
                    Cliente Mimo Quatro Patas
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* FORMULÁRIO DE AVALIAÇÃO DA LOJA */}

        <FormularioAvaliacaoLoja />

        {/* MENSAGEM FINAL */}

        <div className="mx-auto mt-12 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f6c85f]/15 px-5 py-2.5 text-sm font-semibold text-[#756f69]">
            <span>🐶</span>
            <span>Feito para quem ama e cuida</span>
            <span>🐱</span>
          </div>
        </div>
      </div>
    </section>
  );
}