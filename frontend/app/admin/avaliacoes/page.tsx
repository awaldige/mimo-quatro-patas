"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Produto {
  id: number;
  nome: string;
  imagem?: string | null;
}

interface Avaliacao {
  id: number;
  nome: string;
  email?: string | null;
  nota: number;
  comentario?: string | null;
  aprovado: boolean;
  ativo: boolean;
  produtoId: number;
  produto?: Produto | null;
  createdAt?: string;
  updatedAt?: string;
}

interface FormularioAvaliacao {
  nome: string;
  email: string;
  nota: string;
  comentario: string;
  aprovado: boolean;
  ativo: boolean;
}

/*
 * Normaliza a URL da API.
 *
 * Aceita:
 *
 * NEXT_PUBLIC_API_URL=http://localhost:3001
 *
 * ou:
 *
 * NEXT_PUBLIC_API_URL=http://localhost:3001/api
 *
 * e evita gerar:
 *
 * /api/api/avaliacoes
 */
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const formularioInicial: FormularioAvaliacao = {
  nome: "",
  email: "",
  nota: "5",
  comentario: "",
  aprovado: false,
  ativo: true,
};

export default function AvaliacoesPage() {
  const router = useRouter();

  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [avaliacaoEditando, setAvaliacaoEditando] =
    useState<Avaliacao | null>(null);

  const [formulario, setFormulario] =
    useState<FormularioAvaliacao>(formularioInicial);

  // =====================================================
  // LER RESPOSTA DA API
  // =====================================================

  async function lerResposta(resposta: Response) {
    const texto = await resposta.text();

    if (!texto.trim()) {
      return null;
    }

    const contentType =
      resposta.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      console.error(
        "[avaliacoes] Resposta não JSON:",
        texto.substring(0, 500)
      );

      throw new Error(
        `A API retornou uma resposta inválida. Status: ${resposta.status} ${resposta.statusText}.`
      );
    }

    try {
      return JSON.parse(texto);
    } catch {
      console.error(
        "[avaliacoes] JSON inválido:",
        texto.substring(0, 500)
      );

      throw new Error(
        `A API retornou JSON inválido. Status: ${resposta.status}.`
      );
    }
  }

  // =====================================================
  // VERIFICAR LOGIN
  // =====================================================

  useEffect(() => {
    const admin = localStorage.getItem("mimo_admin");

    if (!admin) {
      router.replace("/admin/login");
      return;
    }

    carregarAvaliacoes();
  }, [router]);

  // =====================================================
  // CARREGAR AVALIAÇÕES
  // =====================================================

  async function carregarAvaliacoes() {
    try {
      setCarregando(true);
      setErro("");

      const url = `${API_URL}/api/avaliacoes`;

      console.log("[avaliacoes] GET:", url);

      const resposta = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const dados = await lerResposta(resposta);

      console.log("[avaliacoes] resposta:", {
        status: resposta.status,
        dados,
      });

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.error ||
            `Erro ao carregar avaliações. Status ${resposta.status}.`
        );
      }

      if (Array.isArray(dados)) {
        setAvaliacoes(dados);
        return;
      }

      if (Array.isArray(dados?.avaliacoes)) {
        setAvaliacoes(dados.avaliacoes);
        return;
      }

      setAvaliacoes([]);
    } catch (error) {
      console.error(
        "[avaliacoes] Erro ao carregar:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar avaliações."
      );
    } finally {
      setCarregando(false);
    }
  }

  // =====================================================
  // ABRIR EDIÇÃO
  // =====================================================

  function abrirEdicao(avaliacao: Avaliacao) {
    setAvaliacaoEditando(avaliacao);

    setFormulario({
      nome: avaliacao.nome || "",
      email: avaliacao.email || "",
      nota: String(avaliacao.nota || 5),
      comentario: avaliacao.comentario || "",
      aprovado: Boolean(avaliacao.aprovado),
      ativo: Boolean(avaliacao.ativo),
    });

    setErro("");
    setMensagem("");
    setModalAberto(true);
  }

  // =====================================================
  // FECHAR MODAL
  // =====================================================

  function fecharModal() {
    if (salvando) {
      return;
    }

    setModalAberto(false);
    setAvaliacaoEditando(null);
    setFormulario(formularioInicial);
    setErro("");
  }

  // =====================================================
  // ALTERAR CAMPO
  // =====================================================

  function alterarCampo(
    campo: keyof FormularioAvaliacao,
    valor: string | boolean
  ) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  // =====================================================
  // SALVAR EDIÇÃO
  // =====================================================

  async function salvarAvaliacao(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!avaliacaoEditando) {
      setErro("Nenhuma avaliação selecionada.");
      return;
    }

    setErro("");
    setMensagem("");

    const nome = formulario.nome.trim();
    const email = formulario.email.trim();
    const comentario = formulario.comentario.trim();
    const nota = Number(formulario.nota);

    // ===================================================
    // VALIDAÇÕES
    // ===================================================

    if (!nome) {
      setErro("Informe o nome do cliente.");
      return;
    }

    if (nome.length < 2) {
      setErro(
        "O nome deve ter pelo menos 2 caracteres."
      );
      return;
    }

    if (
      !Number.isInteger(nota) ||
      nota < 1 ||
      nota > 5
    ) {
      setErro("A nota deve estar entre 1 e 5.");
      return;
    }

    // ===================================================
    // PAYLOAD
    // ===================================================

    const payload = {
      nome,
      email: email || null,
      nota,
      comentario: comentario || null,
      aprovado: formulario.aprovado,
      ativo: formulario.ativo,
    };

    try {
      setSalvando(true);

      const url =
        `${API_URL}/api/avaliacoes/` +
        avaliacaoEditando.id;

      console.log("[avaliacoes] PUT:", {
        url,
        payload,
      });

      const resposta = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const dados = await lerResposta(resposta);

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.error ||
            `Erro ao atualizar avaliação. Status ${resposta.status}.`
        );
      }

      setMensagem(
        "Avaliação atualizada com sucesso."
      );

      setModalAberto(false);
      setAvaliacaoEditando(null);
      setFormulario(formularioInicial);

      await carregarAvaliacoes();
    } catch (error) {
      console.error(
        "[avaliacoes] Erro ao salvar:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao salvar avaliação."
      );
    } finally {
      setSalvando(false);
    }
  }

  // =====================================================
  // APROVAR / REPROVAR
  // =====================================================

  async function alterarAprovacao(
    avaliacao: Avaliacao
  ) {
    try {
      setErro("");
      setMensagem("");

      const url =
        `${API_URL}/api/avaliacoes/` +
        `${avaliacao.id}/aprovacao`;

      const resposta = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          aprovado: !avaliacao.aprovado,
        }),
      });

      const dados = await lerResposta(resposta);

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.error ||
            `Erro ao alterar aprovação. Status ${resposta.status}.`
        );
      }

      setMensagem(
        avaliacao.aprovado
          ? "Avaliação reprovada."
          : "Avaliação aprovada com sucesso."
      );

      await carregarAvaliacoes();
    } catch (error) {
      console.error(
        "[avaliacoes] Erro ao alterar aprovação:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao alterar aprovação."
      );
    }
  }

  // =====================================================
  // ATIVAR / DESATIVAR
  // =====================================================

  async function alterarStatus(
    avaliacao: Avaliacao
  ) {
    try {
      setErro("");
      setMensagem("");

      const url =
        `${API_URL}/api/avaliacoes/` +
        `${avaliacao.id}/status`;

      const resposta = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ativo: !avaliacao.ativo,
        }),
      });

      const dados = await lerResposta(resposta);

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.error ||
            `Erro ao alterar status. Status ${resposta.status}.`
        );
      }

      setMensagem(
        avaliacao.ativo
          ? "Avaliação desativada."
          : "Avaliação ativada."
      );

      await carregarAvaliacoes();
    } catch (error) {
      console.error(
        "[avaliacoes] Erro ao alterar status:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao alterar status."
      );
    }
  }

  // =====================================================
  // EXCLUIR
  // =====================================================

  async function excluirAvaliacao(
    avaliacao: Avaliacao
  ) {
    const confirmar = window.confirm(
      `Deseja realmente excluir a avaliação de "${avaliacao.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro("");
      setMensagem("");

      const url =
        `${API_URL}/api/avaliacoes/` +
        avaliacao.id;

      const resposta = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const dados = await lerResposta(resposta);

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.error ||
            `Erro ao excluir avaliação. Status ${resposta.status}.`
        );
      }

      setMensagem(
        "Avaliação excluída com sucesso."
      );

      await carregarAvaliacoes();
    } catch (error) {
      console.error(
        "[avaliacoes] Erro ao excluir:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao excluir avaliação."
      );
    }
  }

  // =====================================================
  // FORMATAR DATA
  // =====================================================

  function formatarData(dataString?: string) {
    if (!dataString) {
      return "Data não informada";
    }

    const data = new Date(dataString);

    if (Number.isNaN(data.getTime())) {
      return "Data inválida";
    }

    return data.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // =====================================================
  // ESTRELAS
  // =====================================================

  function renderizarEstrelas(nota: number) {
    const notaSegura = Math.max(
      0,
      Math.min(5, Number(nota) || 0)
    );

    return (
      <span
        className="tracking-wide text-[#e58b6f]"
        aria-label={`Nota ${notaSegura} de 5`}
      >
        {"★".repeat(notaSegura)}
        <span className="text-[#eadfd6]">
          {"★".repeat(5 - notaSegura)}
        </span>
      </span>
    );
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {
    localStorage.removeItem("mimo_admin");
    router.replace("/admin/login");
  }

  // =====================================================
  // RESUMOS
  // =====================================================

  const totalAvaliacoes = avaliacoes.length;

  const aprovadas = avaliacoes.filter(
    (avaliacao) =>
      avaliacao.aprovado && avaliacao.ativo
  ).length;

  const pendentes = avaliacoes.filter(
    (avaliacao) => !avaliacao.aprovado
  ).length;

  const somaNotas = avaliacoes.reduce(
    (total, avaliacao) =>
      total + Number(avaliacao.nota || 0),
    0
  );

  const notaMedia =
    totalAvaliacoes > 0
      ? somaNotas / totalAvaliacoes
      : 0;

  // =====================================================
  // CARREGANDO
  // =====================================================

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf5]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eadfd6] border-t-[#e58b6f]" />

          <p className="mt-4 text-sm font-medium text-[#756f69]">
            Carregando avaliações...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#fffaf5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* CABEÇALHO */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-[#e58b6f] transition hover:text-[#c96d53]"
            >
              ← Voltar ao painel
            </Link>

            <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-[#e58b6f]">
              Mimo Quatro Patas
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#2d2a26] md:text-4xl">
              Avaliações
            </h1>

            <p className="mt-2 text-[#756f69]">
              Gerencie as avaliações e comentários dos clientes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#e58b6f] px-5 py-3 text-sm font-semibold text-[#e58b6f] transition hover:bg-[#fff4ec]"
            >
              Painel
            </Link>

            <button
              type="button"
              onClick={carregarAvaliacoes}
              disabled={carregando}
              className="inline-flex items-center justify-center rounded-full border-2 border-[#eadfd6] bg-white px-5 py-3 text-sm font-semibold text-[#756f69] transition hover:bg-[#fffaf5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↻ Atualizar
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-full bg-[#2d2a26] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#45413c]"
            >
              Sair
            </button>
          </div>
        </div>

        {/* MENSAGENS */}

        {mensagem && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
            {mensagem}
          </div>
        )}

        {erro && !modalAberto && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {erro}
          </div>
        )}

        {/* RESUMO */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4ec] text-2xl">
              ⭐
            </div>

            <p className="mt-4 text-sm text-[#756f69]">
              Total de avaliações
            </p>

            <p className="mt-1 text-3xl font-bold text-[#2d2a26]">
              {totalAvaliacoes}
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-2xl">
              ✓
            </div>

            <p className="mt-4 text-sm text-[#756f69]">
              Aprovadas
            </p>

            <p className="mt-1 text-3xl font-bold text-[#2d2a26]">
              {aprovadas}
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-2xl">
              ⏳
            </div>

            <p className="mt-4 text-sm text-[#756f69]">
              Pendentes
            </p>

            <p className="mt-1 text-3xl font-bold text-[#2d2a26]">
              {pendentes}
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4ec] text-2xl">
              ★
            </div>

            <p className="mt-4 text-sm text-[#756f69]">
              Nota média
            </p>

            <p className="mt-1 text-3xl font-bold text-[#2d2a26]">
              {notaMedia.toFixed(1)}
              <span className="ml-1 text-base font-medium text-[#a39a92]">
                / 5
              </span>
            </p>
          </div>

        </section>

        {/* LISTA */}

        <section className="mt-8">
          <div className="rounded-3xl border border-[#eadfd6] bg-white shadow-sm">

            <div className="border-b border-[#eadfd6] px-6 py-5">
              <h2 className="text-xl font-bold text-[#2d2a26]">
                Avaliações cadastradas
              </h2>

              <p className="mt-1 text-sm text-[#756f69]">
                Aprove, edite, ative ou remova avaliações.
              </p>
            </div>

            {avaliacoes.length === 0 ? (
              <div className="px-6 py-16 text-center">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#fff4ec] text-4xl">
                  ⭐
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#2d2a26]">
                  Nenhuma avaliação cadastrada
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756f69]">
                  Quando os clientes enviarem avaliações dos produtos,
                  elas aparecerão aqui para gerenciamento.
                </p>

              </div>
            ) : (
              <div className="divide-y divide-[#eadfd6]">

                {avaliacoes.map((avaliacao) => (
                  <div
                    key={avaliacao.id}
                    className="p-6 transition hover:bg-[#fffaf5]"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      {/* CONTEÚDO */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-lg font-bold text-[#2d2a26]">
                            {avaliacao.nome}
                          </h3>

                          <span
                            className={
                              avaliacao.aprovado
                                ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"
                                : "rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700"
                            }
                          >
                            {avaliacao.aprovado
                              ? "Aprovada"
                              : "Pendente"}
                          </span>

                          <span
                            className={
                              avaliacao.ativo
                                ? "rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                                : "rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500"
                            }
                          >
                            {avaliacao.ativo
                              ? "Ativa"
                              : "Inativa"}
                          </span>

                        </div>

                        <div className="mt-2">
                          {renderizarEstrelas(
                            avaliacao.nota
                          )}
                        </div>

                        {avaliacao.produto && (
                          <div className="mt-3">
                            <span className="text-xs font-bold uppercase tracking-wide text-[#a39a92]">
                              Produto
                            </span>

                            <p className="mt-1 font-semibold text-[#2d2a26]">
                              {avaliacao.produto.nome}
                            </p>
                          </div>
                        )}

                        {avaliacao.comentario && (
                          <div className="mt-4 rounded-2xl bg-[#fffaf5] p-4">
                            <p className="text-sm leading-6 text-[#756f69]">
                              “{avaliacao.comentario}”
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#a39a92]">

                          {avaliacao.email && (
                            <span>
                              {avaliacao.email}
                            </span>
                          )}

                          <span>
                            {formatarData(
                              avaliacao.createdAt
                            )}
                          </span>

                          <span>
                            ID #{avaliacao.id}
                          </span>

                        </div>

                      </div>

                      {/* AÇÕES */}

                      <div className="flex flex-wrap gap-2 lg:w-[330px] lg:justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            abrirEdicao(avaliacao)
                          }
                          className="rounded-full border border-[#eadfd6] px-4 py-2 text-sm font-semibold text-[#2d2a26] transition hover:bg-[#fff4ec]"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            alterarAprovacao(avaliacao)
                          }
                          className={
                            avaliacao.aprovado
                              ? "rounded-full bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700 transition hover:bg-yellow-100"
                              : "rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-200"
                          }
                        >
                          {avaliacao.aprovado
                            ? "Reprovar"
                            : "Aprovar"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            alterarStatus(avaliacao)
                          }
                          className={
                            avaliacao.ativo
                              ? "rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                              : "rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-200"
                          }
                        >
                          {avaliacao.ativo
                            ? "Desativar"
                            : "Ativar"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            excluirAvaliacao(avaliacao)
                          }
                          className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Excluir
                        </button>

                      </div>

                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>
        </section>

        {/* RODAPÉ */}

        <div className="mt-10 border-t border-[#eadfd6] pt-6 text-center">
          <p className="text-sm text-[#a39a92]">
            Mimo Quatro Patas • Gerenciamento de Avaliações
          </p>
        </div>

      </div>

      {/* MODAL */}

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* CABEÇALHO */}

            <div className="flex items-center justify-between border-b border-[#eadfd6] px-6 py-5">

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#e58b6f]">
                  Editar avaliação
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#2d2a26]">
                  {avaliacaoEditando?.nome ||
                    "Avaliação"}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fffaf5] text-xl text-[#756f69] transition hover:bg-[#fff4ec]"
              >
                ×
              </button>

            </div>

            {/* FORMULÁRIO */}

            <form
              onSubmit={salvarAvaliacao}
              className="space-y-6 p-6"
            >

              {erro && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                  {erro}
                </div>
              )}

              {/* NOME */}

              <div>
                <label
                  htmlFor="nome"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  Nome do cliente
                </label>

                <input
                  id="nome"
                  type="text"
                  value={formulario.nome}
                  onChange={(event) =>
                    alterarCampo(
                      "nome",
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  E-mail
                  <span className="ml-1 font-normal text-[#a39a92]">
                    (opcional)
                  </span>
                </label>

                <input
                  id="email"
                  type="email"
                  value={formulario.email}
                  onChange={(event) =>
                    alterarCampo(
                      "email",
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20"
                />
              </div>

              {/* NOTA */}

              <div>
                <label
                  htmlFor="nota"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  Nota
                </label>

                <select
                  id="nota"
                  value={formulario.nota}
                  onChange={(event) =>
                    alterarCampo(
                      "nota",
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20"
                >
                  <option value="1">
                    1 estrela
                  </option>
                  <option value="2">
                    2 estrelas
                  </option>
                  <option value="3">
                    3 estrelas
                  </option>
                  <option value="4">
                    4 estrelas
                  </option>
                  <option value="5">
                    5 estrelas
                  </option>
                </select>
              </div>

              {/* COMENTÁRIO */}

              <div>
                <label
                  htmlFor="comentario"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  Comentário
                </label>

                <textarea
                  id="comentario"
                  value={formulario.comentario}
                  onChange={(event) =>
                    alterarCampo(
                      "comentario",
                      event.target.value
                    )
                  }
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20"
                />
              </div>

              {/* APROVAÇÃO */}

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#eadfd6] bg-[#fffaf5] p-4">

                <div>
                  <p className="font-semibold text-[#2d2a26]">
                    Avaliação aprovada
                  </p>

                  <p className="mt-1 text-xs text-[#756f69]">
                    Avaliações aprovadas poderão ser exibidas aos clientes.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={formulario.aprovado}
                  onChange={(event) =>
                    alterarCampo(
                      "aprovado",
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 accent-[#e58b6f]"
                />

              </label>

              {/* STATUS */}

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#eadfd6] bg-[#fffaf5] p-4">

                <div>
                  <p className="font-semibold text-[#2d2a26]">
                    Avaliação ativa
                  </p>

                  <p className="mt-1 text-xs text-[#756f69]">
                    Permite que a avaliação seja considerada ativa na loja.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={formulario.ativo}
                  onChange={(event) =>
                    alterarCampo(
                      "ativo",
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 accent-[#e58b6f]"
                />

              </label>

              {/* AÇÕES */}

              <div className="flex flex-col-reverse gap-3 border-t border-[#eadfd6] pt-6 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  className="rounded-full border-2 border-[#eadfd6] px-6 py-3 text-sm font-semibold text-[#756f69] transition hover:bg-[#fffaf5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-full bg-[#e58b6f] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {salvando
                    ? "Salvando..."
                    : "Salvar alterações"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </main>
  );
}