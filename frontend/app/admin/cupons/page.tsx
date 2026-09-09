
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Cupom {
  id: number;
  codigo: string;
  tipo: string;
  valor: string | number;
  valorMinimo?: string | number | null;
  validade?: string | null;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface FormularioCupom {
  codigo: string;
  tipo: "PERCENTUAL" | "FIXO";
  valor: string;
  valorMinimo: string;
  validade: string;
  ativo: boolean;
}

/*
 * Aceita as duas configurações:
 *
 * NEXT_PUBLIC_API_URL=http://localhost:3001
 *
 * ou:
 *
 * NEXT_PUBLIC_API_URL=http://localhost:3001/api
 *
 * O /api é normalizado para evitar:
 *
 * /api/api/cupons
 */
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

const API_BASE = API_URL.endsWith("/api")
  ? API_URL
  : `${API_URL}/api`;

const formularioInicial: FormularioCupom = {
  codigo: "",
  tipo: "PERCENTUAL",
  valor: "",
  valorMinimo: "",
  validade: "",
  ativo: true,
};

export default function CuponsPage() {
  const router = useRouter();

  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [cupomEditando, setCupomEditando] = useState<Cupom | null>(null);

  const [formulario, setFormulario] =
    useState<FormularioCupom>(formularioInicial);

  // =====================================================
  // LER RESPOSTA DA API COM SEGURANÇA
  // =====================================================

  async function lerResposta(resposta: Response) {
    const texto = await resposta.text();

    if (!texto) {
      return null;
    }

    try {
      return JSON.parse(texto);
    } catch {
      console.error(
        "[cupons] Resposta não JSON:",
        texto.substring(0, 500)
      );

      throw new Error(
        `A API retornou uma resposta que não é JSON. ` +
          `Status: ${resposta.status} ${resposta.statusText}.`
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

    carregarCupons();
  }, [router]);

  // =====================================================
  // CARREGAR CUPONS
  // =====================================================

  async function carregarCupons() {
    try {
      setCarregando(true);
      setErro("");

      const url = `${API_BASE}/cupons`;

      console.log("[cupons] API_BASE:", API_BASE);
      console.log("[cupons] GET:", url);

      const resposta = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const dados = await lerResposta(resposta);

      console.log("[cupons] resposta:", {
        status: resposta.status,
        dados,
      });

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.error ||
            `Erro ao carregar cupons. Status ${resposta.status}.`
        );
      }

      if (Array.isArray(dados)) {
        setCupons(dados);
      } else if (Array.isArray(dados?.cupons)) {
        setCupons(dados.cupons);
      } else {
        setCupons([]);
      }
    } catch (error) {
      console.error("Erro ao carregar cupons:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar cupons."
      );
    } finally {
      setCarregando(false);
    }
  }

  // =====================================================
  // ABRIR NOVO CUPOM
  // =====================================================

  function abrirNovoCupom() {
    setCupomEditando(null);
    setFormulario(formularioInicial);
    setErro("");
    setMensagem("");
    setModalAberto(true);
  }

  // =====================================================
  // ABRIR EDIÇÃO
  // =====================================================

  function abrirEdicao(cupom: Cupom) {
    setCupomEditando(cupom);

    let validade = "";

    if (cupom.validade) {
      const data = new Date(cupom.validade);

      if (!Number.isNaN(data.getTime())) {
        /*
         * datetime-local precisa do formato:
         *
         * YYYY-MM-DDTHH:mm
         *
         * Usamos os valores locais para evitar problemas
         * de conversão de fuso horário.
         */
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");
        const hora = String(data.getHours()).padStart(2, "0");
        const minuto = String(data.getMinutes()).padStart(2, "0");

        validade = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
      }
    }

    setFormulario({
      codigo: cupom.codigo,
      tipo: cupom.tipo === "FIXO" ? "FIXO" : "PERCENTUAL",
      valor: String(cupom.valor),
      valorMinimo:
        cupom.valorMinimo !== null &&
        cupom.valorMinimo !== undefined
          ? String(cupom.valorMinimo)
          : "",
      validade,
      ativo: cupom.ativo,
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
    setCupomEditando(null);
    setFormulario(formularioInicial);
    setErro("");
  }

  // =====================================================
  // ALTERAR FORMULÁRIO
  // =====================================================

  function alterarCampo(
    campo: keyof FormularioCupom,
    valor: string | boolean
  ) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  // =====================================================
  // SALVAR CUPOM
  // =====================================================

  async function salvarCupom(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    const codigo = formulario.codigo.trim().toUpperCase();

    const valor = Number(
      formulario.valor.replace(",", ".")
    );

    const valorMinimo =
      formulario.valorMinimo.trim() !== ""
        ? Number(
            formulario.valorMinimo.replace(",", ".")
          )
        : null;

    // ===================================================
    // VALIDAÇÕES
    // ===================================================

    if (!codigo) {
      setErro("Informe o código do cupom.");
      return;
    }

    if (codigo.length < 3) {
      setErro(
        "O código deve ter pelo menos 3 caracteres."
      );
      return;
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      setErro(
        "Informe um valor de desconto válido."
      );
      return;
    }

    if (
      formulario.tipo === "PERCENTUAL" &&
      valor > 100
    ) {
      setErro(
        "O desconto percentual não pode ser maior que 100%."
      );
      return;
    }

    if (
      valorMinimo !== null &&
      (!Number.isFinite(valorMinimo) ||
        valorMinimo < 0)
    ) {
      setErro("Informe um valor mínimo válido.");
      return;
    }

    // ===================================================
    // VALIDAR DATA
    // ===================================================

    let validade: string | null = null;

    if (formulario.validade) {
      const data = new Date(formulario.validade);

      if (Number.isNaN(data.getTime())) {
        setErro("Informe uma data de validade válida.");
        return;
      }

      validade = data.toISOString();
    }

    // ===================================================
    // SALVAR
    // ===================================================

    try {
      setSalvando(true);

      const payload = {
        codigo,
        tipo: formulario.tipo,
        valor,
        valorMinimo,
        validade,
        ativo: formulario.ativo,
      };

      const url = cupomEditando
        ? `${API_BASE}/cupons/${cupomEditando.id}`
        : `${API_BASE}/cupons`;

      const metodo = cupomEditando ? "PUT" : "POST";

      console.log("[cupons] SALVAR:", {
        metodo,
        url,
        payload,
      });

      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const dados = await lerResposta(resposta);

      console.log("[cupons] resposta salvar:", {
        status: resposta.status,
        dados,
      });

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.error ||
            `Erro ao salvar cupom. Status ${resposta.status}.`
        );
      }

      setMensagem(
        cupomEditando
          ? "Cupom atualizado com sucesso."
          : "Cupom criado com sucesso."
      );

      setModalAberto(false);
      setCupomEditando(null);
      setFormulario(formularioInicial);

      await carregarCupons();
    } catch (error) {
      console.error("Erro ao salvar cupom:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao salvar cupom."
      );
    } finally {
      setSalvando(false);
    }
  }

  // =====================================================
  // ALTERAR STATUS
  // =====================================================

  async function alterarStatus(cupom: Cupom) {
    try {
      setErro("");
      setMensagem("");

      const url = `${API_BASE}/cupons/${cupom.id}/status`;

      console.log("[cupons] STATUS:", url);

      /*
       * O controller atual alterna o status sozinho:
       *
       * ativo: !cupom.ativo
       *
       * Portanto não precisamos enviar o campo ativo.
       */
      const resposta = await fetch(url, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
        },
      });

      const dados = await lerResposta(resposta);

      console.log("[cupons] resposta status:", {
        status: resposta.status,
        dados,
      });

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.error ||
            `Erro ao alterar status. Status ${resposta.status}.`
        );
      }

      setMensagem(
        cupom.ativo
          ? "Cupom desativado."
          : "Cupom ativado."
      );

      await carregarCupons();
    } catch (error) {
      console.error(
        "Erro ao alterar status:",
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
  // EXCLUIR CUPOM
  // =====================================================

  async function excluirCupom(cupom: Cupom) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o cupom "${cupom.codigo}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro("");
      setMensagem("");

      const url = `${API_BASE}/cupons/${cupom.id}`;

      console.log("[cupons] DELETE:", url);

      const resposta = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const dados = await lerResposta(resposta);

      console.log("[cupons] resposta excluir:", {
        status: resposta.status,
        dados,
      });

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.error ||
            `Erro ao excluir cupom. Status ${resposta.status}.`
        );
      }

      setMensagem(
        "Cupom excluído com sucesso."
      );

      await carregarCupons();
    } catch (error) {
      console.error(
        "Erro ao excluir cupom:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao excluir cupom."
      );
    }
  }

  // =====================================================
  // FORMATAR MOEDA
  // =====================================================

  function formatarMoeda(
    valor: string | number
  ) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      return "R$ 0,00";
    }

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // =====================================================
  // FORMATAR VALIDADE
  // =====================================================

  function formatarValidade(
    validade?: string | null
  ) {
    if (!validade) {
      return "Sem validade";
    }

    const data = new Date(validade);

    if (Number.isNaN(data.getTime())) {
      return "Data inválida";
    }

    return data.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // =====================================================
  // VERIFICAR VALIDADE
  // =====================================================

  function cupomExpirado(
    validade?: string | null
  ) {
    if (!validade) {
      return false;
    }

    const data = new Date(validade);

    if (Number.isNaN(data.getTime())) {
      return false;
    }

    return data.getTime() < Date.now();
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {
    localStorage.removeItem("mimo_admin");
    router.replace("/admin/login");
  }

  // =====================================================
  // CARREGANDO
  // =====================================================

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf5]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eadfd6] border-t-[#e58b6f]" />

          <p className="mt-4 text-sm font-medium text-[#756f69]">
            Carregando cupons...
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

        {/* =====================================================
            CABEÇALHO
        ===================================================== */}

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
              Cupons de desconto
            </h1>

            <p className="mt-2 text-[#756f69]">
              Crie e gerencie os cupons de desconto da loja.
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
              onClick={abrirNovoCupom}
              className="inline-flex items-center justify-center rounded-full bg-[#e58b6f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c96d53]"
            >
              + Novo cupom
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

        {/* =====================================================
            MENSAGENS
        ===================================================== */}

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

        {/* =====================================================
            RESUMO
        ===================================================== */}

        <section className="mt-8 grid gap-5 sm:grid-cols-3">

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4ec] text-2xl">
              🎟️
            </div>

            <p className="mt-4 text-sm text-[#756f69]">
              Total de cupons
            </p>

            <p className="mt-1 text-3xl font-bold text-[#2d2a26]">
              {cupons.length}
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-2xl">
              ✓
            </div>

            <p className="mt-4 text-sm text-[#756f69]">
              Cupons ativos
            </p>

            <p className="mt-1 text-3xl font-bold text-[#2d2a26]">
              {
                cupons.filter(
                  (cupom) =>
                    cupom.ativo &&
                    !cupomExpirado(cupom.validade)
                ).length
              }
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-2xl">
              ⏱️
            </div>

            <p className="mt-4 text-sm text-[#756f69]">
              Expirados
            </p>

            <p className="mt-1 text-3xl font-bold text-[#2d2a26]">
              {
                cupons.filter((cupom) =>
                  cupomExpirado(cupom.validade)
                ).length
              }
            </p>
          </div>

        </section>

        {/* =====================================================
            LISTA DE CUPONS
        ===================================================== */}

        <section className="mt-8">

          <div className="rounded-3xl border border-[#eadfd6] bg-white shadow-sm">

            <div className="border-b border-[#eadfd6] px-6 py-5">
              <h2 className="text-xl font-bold text-[#2d2a26]">
                Cupons cadastrados
              </h2>

              <p className="mt-1 text-sm text-[#756f69]">
                Gerencie os descontos disponíveis para os clientes.
              </p>
            </div>

            {cupons.length === 0 ? (
              <div className="px-6 py-16 text-center">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#fff4ec] text-4xl">
                  🎟️
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#2d2a26]">
                  Nenhum cupom cadastrado
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756f69]">
                  Crie seu primeiro cupom de desconto para começar a oferecer promoções aos clientes.
                </p>

                <button
                  type="button"
                  onClick={abrirNovoCupom}
                  className="mt-6 rounded-full bg-[#e58b6f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c96d53]"
                >
                  + Criar primeiro cupom
                </button>

              </div>
            ) : (
              <div className="divide-y divide-[#eadfd6]">

                {cupons.map((cupom) => {
                  const expirado =
                    cupomExpirado(cupom.validade);

                  return (
                    <div
                      key={cupom.id}
                      className="p-6 transition hover:bg-[#fffaf5]"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        {/* CUPOM */}

                        <div className="flex min-w-0 items-start gap-4">

                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff4ec] text-2xl">
                            🎟️
                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="text-lg font-bold uppercase text-[#2d2a26]">
                                {cupom.codigo}
                              </h3>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  cupom.ativo &&
                                  !expirado
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {expirado
                                  ? "Expirado"
                                  : cupom.ativo
                                    ? "Ativo"
                                    : "Inativo"}
                              </span>

                            </div>

                            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#756f69]">

                              <span>
                                <strong className="text-[#2d2a26]">
                                  Desconto:
                                </strong>{" "}
                                {cupom.tipo ===
                                "PERCENTUAL"
                                  ? `${cupom.valor}%`
                                  : formatarMoeda(
                                      cupom.valor
                                    )}
                              </span>

                              <span>
                                <strong className="text-[#2d2a26]">
                                  Mínimo:
                                </strong>{" "}
                                {cupom.valorMinimo !==
                                  null &&
                                cupom.valorMinimo !==
                                  undefined
                                  ? formatarMoeda(
                                      cupom.valorMinimo
                                    )
                                  : "Sem mínimo"}
                              </span>

                              <span>
                                <strong className="text-[#2d2a26]">
                                  Validade:
                                </strong>{" "}
                                {formatarValidade(
                                  cupom.validade
                                )}
                              </span>

                            </div>

                          </div>
                        </div>

                        {/* AÇÕES */}

                        <div className="flex flex-wrap gap-2 lg:justify-end">

                          <button
                            type="button"
                            onClick={() =>
                              abrirEdicao(cupom)
                            }
                            className="rounded-full border border-[#eadfd6] px-4 py-2 text-sm font-semibold text-[#2d2a26] transition hover:bg-[#fff4ec]"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              alterarStatus(cupom)
                            }
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                              cupom.ativo
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {cupom.ativo
                              ? "Desativar"
                              : "Ativar"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              excluirCupom(cupom)
                            }
                            className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            Excluir
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </section>

        {/* =====================================================
            RODAPÉ
        ===================================================== */}

        <div className="mt-10 border-t border-[#eadfd6] pt-6 text-center">
          <p className="text-sm text-[#a39a92]">
            Mimo Quatro Patas • Gerenciamento de Cupons
          </p>
        </div>

      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* CABEÇALHO MODAL */}

            <div className="flex items-center justify-between border-b border-[#eadfd6] px-6 py-5">

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#e58b6f]">
                  {cupomEditando
                    ? "Editar cupom"
                    : "Novo cupom"}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#2d2a26]">
                  {cupomEditando
                    ? cupomEditando.codigo
                    : "Criar cupom"}
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
              onSubmit={salvarCupom}
              className="space-y-6 p-6"
            >

              {erro && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                  {erro}
                </div>
              )}

              {/* CÓDIGO */}

              <div>
                <label
                  htmlFor="codigo"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  Código do cupom
                </label>

                <input
                  id="codigo"
                  type="text"
                  value={formulario.codigo}
                  onChange={(event) =>
                    alterarCampo(
                      "codigo",
                      event.target.value
                        .toUpperCase()
                        .replace(/\s/g, "")
                    )
                  }
                  placeholder="EX: MIMO10"
                  maxLength={30}
                  className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 font-semibold uppercase text-[#2d2a26] outline-none transition focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20"
                />

                <p className="mt-2 text-xs text-[#a39a92]">
                  Use um código simples, como MIMO10 ou PET20.
                </p>
              </div>

              {/* TIPO + VALOR */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="tipo"
                    className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                  >
                    Tipo de desconto
                  </label>

                  <select
                    id="tipo"
                    value={formulario.tipo}
                    onChange={(event) =>
                      alterarCampo(
                        "tipo",
                        event.target.value as
                          | "PERCENTUAL"
                          | "FIXO"
                      )
                    }
                    className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20"
                  >
                    <option value="PERCENTUAL">
                      Percentual (%)
                    </option>

                    <option value="FIXO">
                      Valor fixo (R$)
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="valor"
                    className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                  >
                    Valor do desconto
                  </label>

                  <div className="relative">

                    <input
                      id="valor"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formulario.valor}
                      onChange={(event) =>
                        alterarCampo(
                          "valor",
                          event.target.value
                        )
                      }
                      placeholder={
                        formulario.tipo ===
                        "PERCENTUAL"
                          ? "10"
                          : "10,00"
                      }
                      className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 pr-14 text-[#2d2a26] outline-none transition focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#756f69]">
                      {formulario.tipo ===
                      "PERCENTUAL"
                        ? "%"
                        : "R$"}
                    </span>

                  </div>
                </div>

              </div>

              {/* VALOR MÍNIMO */}

              <div>
                <label
                  htmlFor="valorMinimo"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  Valor mínimo da compra

                  <span className="ml-1 font-normal text-[#a39a92]">
                    (opcional)
                  </span>
                </label>

                <div className="relative">

                  <input
                    id="valorMinimo"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formulario.valorMinimo}
                    onChange={(event) =>
                      alterarCampo(
                        "valorMinimo",
                        event.target.value
                      )
                    }
                    placeholder="0,00"
                    className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 pr-14 text-[#2d2a26] outline-none transition focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#756f69]">
                    R$
                  </span>

                </div>
              </div>

              {/* VALIDADE */}

              <div>
                <label
                  htmlFor="validade"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  Data de validade

                  <span className="ml-1 font-normal text-[#a39a92]">
                    (opcional)
                  </span>
                </label>

                <input
                  id="validade"
                  type="datetime-local"
                  value={formulario.validade}
                  onChange={(event) =>
                    alterarCampo(
                      "validade",
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20"
                />
              </div>

              {/* CHECKBOX ATIVO */}

              <div className="flex items-center gap-3">

                <input
                  id="ativo"
                  type="checkbox"
                  checked={formulario.ativo}
                  onChange={(event) =>
                    alterarCampo(
                      "ativo",
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 rounded-md border-[#eadfd6] text-[#e58b6f] focus:ring-[#e58b6f]"
                />

                <label
                  htmlFor="ativo"
                  className="text-sm font-semibold text-[#2d2a26]"
                >
                  Cupom ativo para uso
                </label>

              </div>

              {/* BOTÕES MODAL */}

              <div className="flex justify-end gap-3 border-t border-[#eadfd6] pt-4">

                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  className="rounded-full border border-[#eadfd6] px-6 py-3 text-sm font-semibold text-[#2d2a26] transition hover:bg-[#fff4ec] disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-full bg-[#e58b6f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c96d53] disabled:opacity-50"
                >
                  {salvando
                    ? "Salvando..."
                    : cupomEditando
                      ? "Atualizar Cupom"
                      : "Criar Cupom"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}

