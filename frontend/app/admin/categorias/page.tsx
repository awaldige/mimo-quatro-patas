"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

interface Categoria {
  id: number;
  nome: string;
  descricao?: string | null;
  imagem?: string | null;
  ativo: boolean;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024;

const TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export default function CategoriasAdminPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [categoriaEditando, setCategoriaEditando] =
    useState<Categoria | null>(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [imagem, setImagem] = useState<File | null>(null);
  const [previewImagem, setPreviewImagem] = useState("");

  const [ativo, setAtivo] = useState(true);

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // ============================================================
  // CARREGAR CATEGORIAS
  // ============================================================

  async function carregarCategorias() {
    try {
      setCarregando(true);
      setErro("");

      const response = await fetch(`${API_URL}/categorias`);

      if (!response.ok) {
        throw new Error("Erro ao carregar categorias.");
      }

      const data = await response.json();

      setCategorias(data);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar as categorias.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  // ============================================================
  // LIMPAR IMAGEM
  // ============================================================

  function limparImagem() {
    setImagem(null);
    setPreviewImagem("");

    const input = document.getElementById(
      "imagem"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  // ============================================================
  // SELECIONAR IMAGEM
  // ============================================================

  function selecionarImagem(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = event.target.files?.[0];

    setMensagem("");
    setErro("");

    if (!arquivo) {
      setImagem(null);
      setPreviewImagem("");
      return;
    }

    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
      event.target.value = "";
      setImagem(null);
      setPreviewImagem("");

      setMensagem(
        "Formato de imagem não permitido. Use JPG, PNG ou WEBP."
      );

      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
      event.target.value = "";
      setImagem(null);
      setPreviewImagem("");

      setMensagem(
        "A imagem é muito grande. O tamanho máximo permitido é 5 MB."
      );

      return;
    }

    setImagem(arquivo);

    const url = URL.createObjectURL(arquivo);

    setPreviewImagem(url);
  }

  // ============================================================
  // NOVA CATEGORIA
  // ============================================================

  function abrirFormulario() {
    setCategoriaEditando(null);

    setNome("");
    setDescricao("");

    limparImagem();

    setAtivo(true);
    setMensagem("");
    setErro("");

    setMostrarFormulario(true);
  }

  // ============================================================
  // EDITAR CATEGORIA
  // ============================================================

  function abrirEdicao(categoria: Categoria) {
    setCategoriaEditando(categoria);

    setNome(categoria.nome);
    setDescricao(categoria.descricao || "");

    setImagem(null);
    setPreviewImagem(categoria.imagem || "");

    setAtivo(categoria.ativo);

    setMensagem("");
    setErro("");
    setMostrarFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ============================================================
  // FECHAR FORMULÁRIO
  // ============================================================

  function fecharFormulario() {
    if (salvando) return;

    setMostrarFormulario(false);
    setCategoriaEditando(null);

    setNome("");
    setDescricao("");

    limparImagem();

    setAtivo(true);
    setMensagem("");
    setErro("");
  }

  // ============================================================
  // SALVAR CATEGORIA
  // ============================================================

  async function salvarCategoria(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMensagem("");
    setErro("");

    if (!nome.trim()) {
      setMensagem("Informe o nome da categoria.");
      return;
    }

    try {
      setSalvando(true);

      const editando = Boolean(categoriaEditando);

      const url = editando
        ? `${API_URL}/categorias/${categoriaEditando!.id}`
        : `${API_URL}/categorias`;

      const formData = new FormData();

      formData.append("nome", nome.trim());
      formData.append(
        "descricao",
        descricao.trim()
      );
      formData.append(
        "ativo",
        String(ativo)
      );

      // Nova imagem somente se o usuário selecionou um arquivo.
      if (imagem) {
        formData.append("imagem", imagem);
      }

      const response = await fetch(url, {
        method: editando ? "PUT" : "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            (editando
              ? "Não foi possível atualizar a categoria."
              : "Não foi possível criar a categoria.")
        );
      }

      setMensagem(
        editando
          ? "Categoria atualizada com sucesso!"
          : "Categoria criada com sucesso!"
      );

      await carregarCategorias();

      setTimeout(() => {
        fecharFormulario();
      }, 1000);
    } catch (error) {
      console.error(error);

      setMensagem(
        error instanceof Error
          ? error.message
          : "Erro ao salvar categoria."
      );
    } finally {
      setSalvando(false);
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Cabeçalho */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-sm font-semibold text-[#e58b6f] transition hover:text-[#c96d53]"
            >
              ← Voltar para o dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-[#2d2a26]">
              Categorias
            </h1>

            <p className="mt-2 text-[#756f69]">
              Gerencie as categorias dos produtos da loja.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirFormulario}
            className="rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53]"
          >
            + Nova categoria
          </button>
        </div>

        {/* Formulário */}
        {mostrarFormulario && (
          <section className="mt-8 rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#2d2a26]">
                  {categoriaEditando
                    ? "Editar categoria"
                    : "Nova categoria"}
                </h2>

                <p className="mt-1 text-sm text-[#756f69]">
                  {categoriaEditando
                    ? "Atualize os dados da categoria."
                    : "Cadastre uma nova categoria para organizar os produtos."}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharFormulario}
                disabled={salvando}
                className="text-sm font-semibold text-[#756f69] transition hover:text-[#c96d53]"
              >
                Fechar
              </button>
            </div>

            <form
              onSubmit={salvarCategoria}
              className="mt-6 grid gap-5 md:grid-cols-2"
            >
              {/* Nome */}
              <div>
                <label
                  htmlFor="nome"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  Nome da categoria *
                </label>

                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(event) =>
                    setNome(event.target.value)
                  }
                  placeholder="Ex.: Cachorros"
                  disabled={salvando}
                  className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f]"
                />
              </div>

              {/* Imagem */}
              <div>
                <label
                  htmlFor="imagem"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  Imagem da categoria
                </label>

                <input
                  id="imagem"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={selecionarImagem}
                  disabled={salvando}
                  className="w-full cursor-pointer rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-sm text-[#2d2a26] file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-[#fff0e8] file:px-4 file:py-2 file:font-semibold file:text-[#c96d53] hover:file:bg-[#ffe5d8]"
                />

                <p className="mt-2 text-xs text-[#756f69]">
                  JPG, PNG ou WEBP • máximo de 5 MB
                </p>

                {/* Preview */}
                {previewImagem && (
                  <div className="mt-4">
                    <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-[#eadfd6] bg-[#fffaf5]">
                      <img
                        src={previewImagem}
                        alt={
                          imagem
                            ? "Prévia da imagem selecionada"
                            : `Imagem atual da categoria ${nome}`
                        }
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {imagem && (
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="truncate text-xs text-[#756f69]">
                          {imagem.name}
                        </p>

                        <button
                          type="button"
                          onClick={limparImagem}
                          disabled={salvando}
                          className="shrink-0 text-xs font-semibold text-red-500 transition hover:text-red-700"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label
                  htmlFor="descricao"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  Descrição
                </label>

                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(event) =>
                    setDescricao(event.target.value)
                  }
                  placeholder="Produtos especiais para cães."
                  rows={4}
                  disabled={salvando}
                  className="w-full resize-none rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f]"
                />
              </div>

              {/* Status */}
              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={(event) =>
                      setAtivo(event.target.checked)
                    }
                    disabled={salvando}
                    className="h-5 w-5 accent-[#e58b6f]"
                  />

                  <span className="text-sm font-semibold text-[#2d2a26]">
                    Categoria ativa
                  </span>
                </label>

                <p className="mt-1 text-xs text-[#756f69]">
                  Categorias inativas não aparecem na loja.
                </p>
              </div>

              {/* Mensagem */}
              {mensagem && (
                <div className="md:col-span-2">
                  <div className="rounded-2xl bg-[#fff4ec] px-4 py-3 text-sm font-semibold text-[#c96d53]">
                    {mensagem}
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {salvando
                    ? "Salvando..."
                    : categoriaEditando
                    ? "Salvar alterações"
                    : "Salvar categoria"}
                </button>

                <button
                  type="button"
                  onClick={fecharFormulario}
                  disabled={salvando}
                  className="rounded-full border border-[#eadfd6] px-6 py-3 font-semibold text-[#2d2a26] transition hover:bg-[#fff4ec]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Lista */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-[#eadfd6] bg-white shadow-sm">
          {carregando ? (
            <div className="px-6 py-12 text-center text-[#756f69]">
              Carregando categorias...
            </div>
          ) : erro ? (
            <div className="px-6 py-12 text-center">
              <p className="font-semibold text-red-500">
                {erro}
              </p>

              <button
                type="button"
                onClick={carregarCategorias}
                className="mt-4 rounded-full bg-[#e58b6f] px-5 py-2 font-semibold text-white"
              >
                Tentar novamente
              </button>
            </div>
          ) : categorias.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-6xl">🐾</div>

              <h2 className="mt-4 text-xl font-bold text-[#2d2a26]">
                Nenhuma categoria cadastrada
              </h2>

              <p className="mt-2 text-[#756f69]">
                Crie a primeira categoria para começar a
                organizar os produtos.
              </p>

              <button
                type="button"
                onClick={abrirFormulario}
                className="mt-6 rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53]"
              >
                + Criar primeira categoria
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="border-b border-[#eadfd6] bg-[#fffaf5]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2d2a26]">
                      Categoria
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2d2a26]">
                      Descrição
                    </th>

                    <th className="px-6 py-4 text-center text-sm font-bold text-[#2d2a26]">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-bold text-[#2d2a26]">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categorias.map((categoria) => (
                    <tr
                      key={categoria.id}
                      className="border-b border-[#eadfd6] last:border-0"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#fff4ec]">
                            {categoria.imagem ? (
                              <img
                                src={
                                  categoria.imagem.startsWith(
                                    "http"
                                  )
                                    ? categoria.imagem
                                    : `${API_URL.replace(
                                        /\/api\/?$/,
                                        ""
                                      )}${categoria.imagem}`
                                }
                                alt={categoria.nome}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl">
                                🐾
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="font-bold text-[#2d2a26]">
                              {categoria.nome}
                            </p>

                            <p className="text-xs text-[#756f69]">
                              ID: {categoria.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-[#756f69]">
                        {categoria.descricao ||
                          "Sem descrição"}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            categoria.ativo
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {categoria.ativo
                            ? "Ativa"
                            : "Inativa"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              abrirEdicao(categoria)
                            }
                            className="rounded-full border border-[#eadfd6] px-4 py-2 text-sm font-semibold text-[#2d2a26] transition hover:bg-[#fff4ec]"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            disabled
                            title="Exclusão será implementada depois"
                            className="cursor-not-allowed rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-300"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}