
"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

interface Avaliacao {
  id: number;
  nome: string;
  email?: string | null;
  nota: number;
  comentario?: string | null;
  aprovado?: boolean;
  ativo?: boolean;
  produtoId?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AvaliacoesProdutoProps {
  produtoId: number;
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api"
).replace(/\/+$/, "");

export default function AvaliacoesProduto({
  produtoId,
}: AvaliacoesProdutoProps) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  // =====================================================
  // LER RESPOSTA DA API COM SEGURANÇA
  // =====================================================

  async function lerResposta(resposta: Response): Promise<unknown> {
    const texto = await resposta.text();

    if (!texto) {
      return null;
    }

    try {
      return JSON.parse(texto);
    } catch {
      console.error(
        "[AvaliacoesProduto] Resposta não JSON:",
        texto.substring(0, 500)
      );

      throw new Error(
        `A API retornou uma resposta inválida. Status: ${resposta.status} ${resposta.statusText}.`
      );
    }
  }

  // =====================================================
  // CARREGAR AVALIAÇÕES
  // =====================================================

  async function carregarAvaliacoes() {
    if (!produtoId || Number.isNaN(Number(produtoId))) {
      setAvaliacoes([]);
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);
      setErro("");

      const url = `${API_URL}/avaliacoes?produtoId=${produtoId}`;

      console.log("[AvaliacoesProduto] GET:", url);

      const resposta = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const dados = await lerResposta(resposta);

      console.log("[AvaliacoesProduto] Resposta:", {
        status: resposta.status,
        dados,
      });

      if (!resposta.ok) {
        const objeto = dados as
          | {
              message?: string;
              error?: string;
            }
          | null;

        throw new Error(
          objeto?.message ||
            objeto?.error ||
            `Erro ao carregar avaliações. Status ${resposta.status}.`
        );
      }

      let lista: Avaliacao[] = [];

      if (Array.isArray(dados)) {
        lista = dados as Avaliacao[];
      } else if (
        dados &&
        typeof dados === "object" &&
        Array.isArray(
          (dados as { avaliacoes?: unknown }).avaliacoes
        )
      ) {
        lista = (
          dados as {
            avaliacoes: Avaliacao[];
          }
        ).avaliacoes;
      }

      // ===================================================
      // GARANTIR PRODUTO CORRETO
      // ===================================================

      const avaliacoesDoProduto = lista.filter(
        (avaliacao) =>
          !avaliacao.produtoId ||
          Number(avaliacao.produtoId) === Number(produtoId)
      );

      // ===================================================
      // MOSTRAR SOMENTE AVALIAÇÕES PUBLICÁVEIS
      // ===================================================

      const avaliacoesPublicadas =
        avaliacoesDoProduto.filter((avaliacao) => {
          const aprovado =
            avaliacao.aprovado === undefined ||
            avaliacao.aprovado === true;

          const ativo =
            avaliacao.ativo === undefined ||
            avaliacao.ativo === true;

          return aprovado && ativo;
        });

      setAvaliacoes(avaliacoesPublicadas);
    } catch (error) {
      console.error(
        "[AvaliacoesProduto] Erro ao carregar:",
        error
      );

      setAvaliacoes([]);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as avaliações."
      );
    } finally {
      setCarregando(false);
    }
  }

  // =====================================================
  // CARREGAR AO ABRIR A PÁGINA
  // =====================================================

  useEffect(() => {
    carregarAvaliacoes();
  }, [produtoId]);

  // =====================================================
  // MÉDIA
  // =====================================================

  const media = useMemo(() => {
    if (avaliacoes.length === 0) {
      return 0;
    }

    const soma = avaliacoes.reduce(
      (total, avaliacao) =>
        total + Number(avaliacao.nota || 0),
      0
    );

    return soma / avaliacoes.length;
  }, [avaliacoes]);

  // =====================================================
  // ESTRELAS
  // =====================================================

  function renderizarEstrelas(
    valor: number,
    tamanho = "text-xl"
  ) {
    const notaNormalizada = Math.max(
      0,
      Math.min(5, Math.round(Number(valor) || 0))
    );

    return (
      <span
        className={`${tamanho} tracking-wide`}
        aria-label={`Nota ${notaNormalizada} de 5`}
      >
        <span className="text-[#e58b6f]">
          {"★".repeat(notaNormalizada)}
        </span>

        <span className="text-[#eadfd6]">
          {"★".repeat(5 - notaNormalizada)}
        </span>
      </span>
    );
  }

  // =====================================================
  // FORMATAR DATA
  // =====================================================

  function formatarData(data?: string) {
    if (!data) {
      return "";
    }

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
      return "";
    }

    return dataFormatada.toLocaleDateString("pt-BR");
  }

  // =====================================================
  // ENVIAR AVALIAÇÃO
  // =====================================================

  async function enviarAvaliacao(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();
    const comentarioLimpo = comentario.trim();

    // ===================================================
    // VALIDAÇÕES
    // ===================================================

    if (!nomeLimpo) {
      setErro("Informe seu nome.");
      return;
    }

    if (nomeLimpo.length < 2) {
      setErro(
        "O nome deve ter pelo menos 2 caracteres."
      );
      return;
    }

    if (nota < 1 || nota > 5) {
      setErro("Selecione uma nota entre 1 e 5.");
      return;
    }

    if (!comentarioLimpo) {
      setErro("Escreva um comentário.");
      return;
    }

    if (comentarioLimpo.length < 5) {
      setErro(
        "O comentário deve ter pelo menos 5 caracteres."
      );
      return;
    }

    if (!produtoId || Number.isNaN(Number(produtoId))) {
      setErro("Produto inválido.");
      return;
    }

    // ===================================================
    // ENVIO
    // ===================================================

    try {
      setEnviando(true);

      const url = `${API_URL}/avaliacoes`;

      console.log("[AvaliacoesProduto] POST:", {
        url,
        produtoId,
      });

      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nome: nomeLimpo,
          email: emailLimpo || null,
          nota,
          comentario: comentarioLimpo,
          produtoId: Number(produtoId),
        }),
      });

      const dados = await lerResposta(resposta);

      console.log("[AvaliacoesProduto] Resposta POST:", {
        status: resposta.status,
        dados,
      });

      if (!resposta.ok) {
        const objeto = dados as
          | {
              message?: string;
              error?: string;
            }
          | null;

        throw new Error(
          objeto?.message ||
            objeto?.error ||
            `Erro ao enviar avaliação. Status ${resposta.status}.`
        );
      }

      // =================================================
      // LIMPAR FORMULÁRIO
      // =================================================

      setNome("");
      setEmail("");
      setNota(5);
      setComentario("");

      setMensagem(
        "Avaliação enviada com sucesso! Ela será analisada antes de aparecer na loja."
      );

      // =================================================
      // ATUALIZAR LISTA
      // =================================================

      await carregarAvaliacoes();
    } catch (error) {
      console.error(
        "[AvaliacoesProduto] Erro ao enviar:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar sua avaliação."
      );
    } finally {
      setEnviando(false);
    }
  }

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <section className="mt-12">
      <div className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">

          {/* =================================================
              RESUMO
          ================================================= */}

          <div className="lg:border-r lg:border-[#eadfd6] lg:pr-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e58b6f]">
              Avaliações
            </p>

            <h2 className="mt-2 text-2xl font-bold text-[#2d2a26]">
              O que nossos clientes dizem
            </h2>

            <div className="mt-6">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-[#2d2a26]">
                  {media.toFixed(1)}
                </span>

                <span className="pb-1 text-sm text-[#a39a92]">
                  / 5
                </span>
              </div>

              <div className="mt-2">
                {renderizarEstrelas(
                  media,
                  "text-2xl"
                )}
              </div>

              <p className="mt-3 text-sm text-[#756f69]">
                {avaliacoes.length === 0
                  ? "Ainda não há avaliações."
                  : `${avaliacoes.length} ${
                      avaliacoes.length === 1
                        ? "avaliação"
                        : "avaliações"
                    }`}
              </p>
            </div>
          </div>

          {/* =================================================
              LISTA
          ================================================= */}

          <div>
            {carregando ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#eadfd6] border-t-[#e58b6f]" />
              </div>
            ) : erro && avaliacoes.length === 0 ? (
              <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
                {erro}
              </div>
            ) : avaliacoes.length === 0 ? (
              <div className="rounded-2xl bg-[#fffaf5] px-6 py-10 text-center">
                <div className="text-4xl">
                  🐾
                </div>

                <h3 className="mt-3 font-bold text-[#2d2a26]">
                  Seja o primeiro a avaliar
                </h3>

                <p className="mt-2 text-sm text-[#756f69]">
                  Sua opinião ajuda outros clientes a
                  conhecerem melhor este produto.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {avaliacoes.map((avaliacao) => (
                  <article
                    key={avaliacao.id}
                    className="rounded-2xl border border-[#eadfd6] bg-[#fffaf5] p-5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-bold text-[#2d2a26]">
                          {avaliacao.nome}
                        </h3>

                        {renderizarEstrelas(
                          avaliacao.nota,
                          "text-base"
                        )}
                      </div>

                      {avaliacao.createdAt && (
                        <span className="text-xs text-[#a39a92]">
                          {formatarData(
                            avaliacao.createdAt
                          )}
                        </span>
                      )}
                    </div>

                    {avaliacao.comentario && (
                      <p className="mt-4 text-sm leading-7 text-[#756f69]">
                        “{avaliacao.comentario}”
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            FORMULÁRIO
        ================================================= */}

        <div className="mt-10 border-t border-[#eadfd6] pt-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e58b6f]">
              Sua opinião
            </p>

            <h3 className="mt-2 text-2xl font-bold text-[#2d2a26]">
              Avalie este produto
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#756f69]">
              Conte para outros clientes como foi sua
              experiência. Sua avaliação será analisada
              antes de ser publicada.
            </p>

            {erro && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                {erro}
              </div>
            )}

            {mensagem && (
              <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
                {mensagem}
              </div>
            )}

            <form
              onSubmit={enviarAvaliacao}
              className="mt-6 space-y-5"
            >
              {/* NOME + EMAIL */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="avaliacao-nome"
                    className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                  >
                    Seu nome
                  </label>

                  <input
                    id="avaliacao-nome"
                    type="text"
                    value={nome}
                    onChange={(event) =>
                      setNome(event.target.value)
                    }
                    placeholder="Digite seu nome"
                    disabled={enviando}
                    autoComplete="name"
                    className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-sm text-[#2d2a26] outline-none transition placeholder:text-[#a39a92] focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="avaliacao-email"
                    className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                  >
                    E-mail
                    <span className="ml-1 font-normal text-[#a39a92]">
                      (opcional)
                    </span>
                  </label>

                  <input
                    id="avaliacao-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="seu@email.com"
                    disabled={enviando}
                    autoComplete="email"
                    className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-sm text-[#2d2a26] outline-none transition placeholder:text-[#a39a92] focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* NOTA */}

              <div>
                <span className="mb-3 block text-sm font-semibold text-[#2d2a26]">
                  Sua nota
                </span>

                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map(
                    (valor) => (
                      <button
                        key={valor}
                        type="button"
                        onClick={() =>
                          setNota(valor)
                        }
                        disabled={enviando}
                        aria-label={`Dar ${valor} ${
                          valor === 1
                            ? "estrela"
                            : "estrelas"
                        }`}
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition ${
                          nota >= valor
                            ? "border-[#e58b6f] bg-[#fff4ec] text-[#e58b6f]"
                            : "border-[#eadfd6] bg-white text-[#eadfd6]"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        ★
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* COMENTÁRIO */}

              <div>
                <label
                  htmlFor="avaliacao-comentario"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  Comentário
                </label>

                <textarea
                  id="avaliacao-comentario"
                  value={comentario}
                  onChange={(event) =>
                    setComentario(event.target.value)
                  }
                  rows={5}
                  placeholder="Conte como foi sua experiência com este produto..."
                  disabled={enviando}
                  className="w-full resize-none rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-sm leading-6 text-[#2d2a26] outline-none transition placeholder:text-[#a39a92] focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20 disabled:opacity-60"
                />
              </div>

              {/* BOTÃO */}

              <button
                type="submit"
                disabled={enviando}
                className="rounded-full bg-[#e58b6f] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando
                  ? "Enviando..."
                  : "Enviar avaliação"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
