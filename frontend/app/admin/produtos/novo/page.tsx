
"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api";

interface Categoria {
  id: number;
  nome: string;
  ativo?: boolean;
}

interface Fornecedor {
  id: number;
  nome: string;
  empresa?: string | null;
  email?: string | null;
  telefone?: string | null;
  site?: string | null;
  ativo?: boolean;
}

interface FormularioProduto {
  nome: string;
  descricao: string;
  preco: string;
  precoPromo: string;
  estoque: string;
  categoriaId: string;
  fornecedorId: string;
  skuFornecedor: string;
  custoFornecedor: string;
  linkFornecedor: string;
  destaque: boolean;
  oferta: boolean;
  ativo: boolean;
}

function extrairArray<T>(
  data: unknown,
  chaves: string[] = []
): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (data && typeof data === "object") {
    const objeto = data as Record<string, unknown>;

    for (const chave of chaves) {
      if (Array.isArray(objeto[chave])) {
        return objeto[chave] as T[];
      }
    }

    if (Array.isArray(objeto.data)) {
      return objeto.data as T[];
    }
  }

  return [];
}

export default function NovoProdutoPage() {
  const router = useRouter();

  const [categorias, setCategorias] = useState<Categoria[]>(
    []
  );

  const [fornecedores, setFornecedores] = useState<
    Fornecedor[]
  >([]);

  const [formulario, setFormulario] =
    useState<FormularioProduto>({
      nome: "",
      descricao: "",
      preco: "",
      precoPromo: "",
      estoque: "",
      categoriaId: "",
      fornecedorId: "",
      skuFornecedor: "",
      custoFornecedor: "",
      linkFornecedor: "",
      destaque: false,
      oferta: false,
      ativo: true,
    });

  const [novaImagem, setNovaImagem] =
    useState<File | null>(null);

  const [previewImagem, setPreviewImagem] =
    useState<string | null>(null);

  const [carregandoDados, setCarregandoDados] =
    useState(true);

  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");

  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregandoDados(true);
        setErro("");

        const [
          categoriasResponse,
          fornecedoresResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/categorias`, {
            cache: "no-store",
          }),

          fetch(`${API_URL}/fornecedores`, {
            cache: "no-store",
          }),
        ]);

        const categoriasData =
          categoriasResponse.ok
            ? await categoriasResponse.json()
            : [];

        const fornecedoresData =
          fornecedoresResponse.ok
            ? await fornecedoresResponse.json()
            : [];

        if (!categoriasResponse.ok) {
          throw new Error(
            "Não foi possível carregar as categorias."
          );
        }

        if (!fornecedoresResponse.ok) {
          throw new Error(
            "Não foi possível carregar os fornecedores."
          );
        }

        const categoriasCarregadas =
          extrairArray<Categoria>(
            categoriasData,
            ["categorias"]
          );

        const fornecedoresCarregados =
          extrairArray<Fornecedor>(
            fornecedoresData,
            ["fornecedores"]
          );

        setCategorias(categoriasCarregadas);

        setFornecedores(fornecedoresCarregados);
      } catch (error) {
        console.error(
          "[Admin Novo Produto] Erro ao carregar dados:",
          error
        );

        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao carregar os dados."
        );
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarDados();
  }, []);

  function atualizarCampo(
    campo: keyof FormularioProduto,
    valor: string | boolean
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function selecionarImagem(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) {
      return;
    }

    const tiposPermitidos = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      setErro(
        "Formato de imagem não permitido. Use JPG, PNG ou WEBP."
      );

      event.target.value = "";

      return;
    }

    const tamanhoMaximo =
      5 * 1024 * 1024;

    if (arquivo.size > tamanhoMaximo) {
      setErro(
        "A imagem deve ter no máximo 5 MB."
      );

      event.target.value = "";

      return;
    }

    setErro("");

    setNovaImagem(arquivo);

    if (previewImagem) {
      URL.revokeObjectURL(previewImagem);
    }

    const url = URL.createObjectURL(arquivo);

    setPreviewImagem(url);
  }

  function removerImagem() {
    if (previewImagem) {
      URL.revokeObjectURL(previewImagem);
    }

    setNovaImagem(null);

    setPreviewImagem(null);
  }

  async function salvarProduto(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      const nome = formulario.nome.trim();

      const descricao =
        formulario.descricao.trim();

      const preco = Number(
        formulario.preco
      );

      const precoPromo =
        formulario.precoPromo.trim()
          ? Number(formulario.precoPromo)
          : null;

      const estoque = Number(
        formulario.estoque
      );

      if (!nome) {
        throw new Error(
          "Informe o nome do produto."
        );
      }

      if (
        !formulario.preco.trim() ||
        Number.isNaN(preco) ||
        preco <= 0
      ) {
        throw new Error(
          "Informe um preço válido."
        );
      }

      if (
        precoPromo !== null &&
        (Number.isNaN(precoPromo) ||
          precoPromo <= 0)
      ) {
        throw new Error(
          "Informe um preço promocional válido."
        );
      }

      if (
        precoPromo !== null &&
        precoPromo >= preco
      ) {
        throw new Error(
          "O preço promocional deve ser menor que o preço normal."
        );
      }

      if (
        formulario.estoque.trim() === "" ||
        Number.isNaN(estoque) ||
        estoque < 0
      ) {
        throw new Error(
          "Informe um estoque válido."
        );
      }

      if (!formulario.categoriaId) {
        throw new Error(
          "Selecione uma categoria."
        );
      }

      if (
        formulario.custoFornecedor.trim() &&
        Number.isNaN(
          Number(formulario.custoFornecedor)
        )
      ) {
        throw new Error(
          "Informe um custo de fornecedor válido."
        );
      }

      if (
        formulario.linkFornecedor.trim()
      ) {
        try {
          new URL(
            formulario.linkFornecedor.trim()
          );
        } catch {
          throw new Error(
            "Informe um link de fornecedor válido."
          );
        }
      }

      const dados = new FormData();

      dados.append("nome", nome);

      dados.append(
        "descricao",
        descricao
      );

      dados.append(
        "preco",
        formulario.preco
      );

      if (
        formulario.precoPromo.trim()
      ) {
        dados.append(
          "precoPromo",
          formulario.precoPromo
        );
      }

      dados.append(
        "estoque",
        formulario.estoque
      );

      dados.append(
        "destaque",
        formulario.destaque
          ? "true"
          : "false"
      );

      dados.append(
        "oferta",
        formulario.oferta
          ? "true"
          : "false"
      );

      dados.append(
        "ativo",
        formulario.ativo
          ? "true"
          : "false"
      );

      dados.append(
        "categoriaId",
        formulario.categoriaId
      );

      if (
        formulario.fornecedorId
      ) {
        dados.append(
          "fornecedorId",
          formulario.fornecedorId
        );
      }

      if (
        formulario.skuFornecedor.trim()
      ) {
        dados.append(
          "skuFornecedor",
          formulario.skuFornecedor.trim()
        );
      }

      if (
        formulario.custoFornecedor.trim()
      ) {
        dados.append(
          "custoFornecedor",
          formulario.custoFornecedor.trim()
        );
      }

      if (
        formulario.linkFornecedor.trim()
      ) {
        dados.append(
          "linkFornecedor",
          formulario.linkFornecedor.trim()
        );
      }

      if (novaImagem) {
        dados.append(
          "imagem",
          novaImagem
        );
      }

      const response = await fetch(
        `${API_URL}/produtos`,
        {
          method: "POST",
          body: dados,
        }
      );

      const resultado =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          resultado?.message ||
            resultado?.erro ||
            "Não foi possível cadastrar o produto."
        );
      }

      setMensagem(
        "Produto cadastrado com sucesso."
      );

      setTimeout(() => {
        router.push("/admin/produtos");
        router.refresh();
      }, 800);
    } catch (error) {
      console.error(
        "[Admin Novo Produto] Erro ao salvar:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao cadastrar o produto."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregandoDados) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <div className="text-5xl">
              🐾
            </div>

            <p className="mt-4 text-gray-600">
              Carregando dados...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (erro && categorias.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
              {erro}
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/produtos"
                )
              }
              className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Voltar para produtos
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* Cabeçalho */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/produtos"
                )
              }
              className="mb-3 text-sm text-gray-500 transition hover:text-gray-900"
            >
              ← Voltar para produtos
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              Novo produto
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Cadastre um novo produto na
              Mimo Quatro Patas.
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            Novo cadastro
          </span>
        </div>

        {/* Mensagens */}

        {erro && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {mensagem}
          </div>
        )}

        <form
          onSubmit={salvarProduto}
        >
          <div className="grid gap-6 lg:grid-cols-3">

            {/* Coluna principal */}

            <div className="space-y-6 lg:col-span-2">

              {/* Informações */}

              <section className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                  Informações do produto
                </h2>

                <div className="space-y-5">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Nome do produto *
                    </label>

                    <input
                      type="text"
                      value={formulario.nome}
                      onChange={(event) =>
                        atualizarCampo(
                          "nome",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                      placeholder="Ex.: Cama Confortável para Cachorros"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Descrição
                    </label>

                    <textarea
                      value={
                        formulario.descricao
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "descricao",
                          event.target.value
                        )
                      }
                      rows={6}
                      className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                      placeholder="Descreva as principais características do produto..."
                    />
                  </div>

                </div>
              </section>

              {/* Preços */}

              <section className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                  Preço e estoque
                </h2>

                <div className="grid gap-5 md:grid-cols-3">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Preço *
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        formulario.preco
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "preco",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                      placeholder="89.90"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Preço promocional
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        formulario.precoPromo
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "precoPromo",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                      placeholder="69.90"
                    />

                    <p className="mt-1 text-xs text-gray-500">
                      Opcional. Deve ser menor que o preço.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Estoque *
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        formulario.estoque
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "estoque",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                      placeholder="20"
                      required
                    />
                  </div>

                </div>
              </section>

              {/* Categoria */}

              <section className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                  Categoria
                </h2>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Categoria *
                </label>

                <select
                  value={
                    formulario.categoriaId
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "categoriaId",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                  required
                >
                  <option value="">
                    Selecione uma categoria
                  </option>

                  {categorias.map(
                    (categoria) => (
                      <option
                        key={categoria.id}
                        value={categoria.id}
                      >
                        {categoria.nome}
                      </option>
                    )
                  )}
                </select>

                {categorias.length === 0 && (
                  <p className="mt-3 text-sm text-red-600">
                    Nenhuma categoria cadastrada.
                  </p>
                )}
              </section>

              {/* Dropshipping */}

              <section className="rounded-xl bg-white p-6 shadow-sm">

                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Dropshipping
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Informações utilizadas no
                    encaminhamento dos pedidos ao
                    fornecedor.
                  </p>
                </div>

                <div className="space-y-5">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Fornecedor
                    </label>

                    <select
                      value={
                        formulario.fornecedorId
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "fornecedorId",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                    >
                      <option value="">
                        Sem fornecedor
                      </option>

                      {fornecedores.map(
                        (fornecedor) => (
                          <option
                            key={fornecedor.id}
                            value={
                              fornecedor.id
                            }
                          >
                            {fornecedor.nome}

                            {fornecedor.empresa
                              ? ` — ${fornecedor.empresa}`
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        SKU do fornecedor
                      </label>

                      <input
                        type="text"
                        value={
                          formulario.skuFornecedor
                        }
                        onChange={(event) =>
                          atualizarCampo(
                            "skuFornecedor",
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                        placeholder="SKU-001"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Custo do fornecedor
                      </label>

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={
                          formulario.custoFornecedor
                        }
                        onChange={(event) =>
                          atualizarCampo(
                            "custoFornecedor",
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                        placeholder="45.00"
                      />
                    </div>

                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Link do fornecedor
                    </label>

                    <input
                      type="url"
                      value={
                        formulario.linkFornecedor
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "linkFornecedor",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                      placeholder="https://..."
                    />

                    <p className="mt-1 text-xs text-gray-500">
                      Link interno para localizar o produto no fornecedor.
                    </p>
                  </div>

                </div>
              </section>

              {/* Configurações */}

              <section className="rounded-xl bg-white p-6 shadow-sm">

                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                  Configurações
                </h2>

                <div className="space-y-4">

                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={
                        formulario.destaque
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "destaque",
                          event.target.checked
                        )
                      }
                      className="mt-1 h-4 w-4"
                    />

                    <span>
                      <span className="block text-sm font-medium text-gray-900">
                        Produto em destaque
                      </span>

                      <span className="block text-xs text-gray-500">
                        Exibe o produto nas áreas de destaque da loja.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={
                        formulario.oferta
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "oferta",
                          event.target.checked
                        )
                      }
                      className="mt-1 h-4 w-4"
                    />

                    <span>
                      <span className="block text-sm font-medium text-gray-900">
                        Produto em oferta
                      </span>

                      <span className="block text-xs text-gray-500">
                        Marca o produto como uma oferta especial.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={
                        formulario.ativo
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "ativo",
                          event.target.checked
                        )
                      }
                      className="mt-1 h-4 w-4"
                    />

                    <span>
                      <span className="block text-sm font-medium text-gray-900">
                        Produto ativo
                      </span>

                      <span className="block text-xs text-gray-500">
                        Produtos inativos não ficam disponíveis na loja.
                      </span>
                    </span>
                  </label>

                </div>
              </section>

            </div>

            {/* Coluna lateral */}

            <div className="space-y-6">

              {/* Imagem */}

              <section className="rounded-xl bg-white p-6 shadow-sm">

                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                  Imagem
                </h2>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">

                  {previewImagem ? (
                    <img
                      src={previewImagem}
                      alt="Pré-visualização do produto"
                      className="h-64 w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-64 flex-col items-center justify-center text-gray-400">
                      <span className="text-5xl">
                        🐾
                      </span>

                      <span className="mt-2 text-sm">
                        Nenhuma imagem selecionada
                      </span>
                    </div>
                  )}

                </div>

                <label className="mt-4 block cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-4 text-center transition hover:border-gray-500 hover:bg-gray-50">

                  <span className="block text-sm font-medium text-gray-700">
                    Selecionar imagem
                  </span>

                  <span className="mt-1 block text-xs text-gray-500">
                    JPG, PNG ou WEBP — máximo 5 MB
                  </span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={
                      selecionarImagem
                    }
                    className="hidden"
                  />

                </label>

                {novaImagem && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3">

                    <p className="break-all text-xs text-gray-600">
                      {novaImagem.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {(
                        novaImagem.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </p>

                    <button
                      type="button"
                      onClick={
                        removerImagem
                      }
                      className="mt-2 text-xs font-semibold text-red-600 hover:text-red-800"
                    >
                      Remover imagem
                    </button>

                  </div>
                )}

              </section>

              {/* Resumo */}

              <section className="rounded-xl bg-white p-6 shadow-sm">

                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                  Resumo
                </h2>

                <div className="space-y-4 text-sm">

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Status
                    </span>

                    <span className="font-medium text-green-600">
                      {formulario.ativo
                        ? "Ativo"
                        : "Inativo"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Categoria
                    </span>

                    <span className="text-right font-medium text-gray-900">
                      {formulario.categoriaId
                        ? categorias.find(
                            (categoria) =>
                              String(
                                categoria.id
                              ) ===
                              formulario.categoriaId
                          )?.nome ||
                          "Selecionada"
                        : "Não selecionada"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Fornecedor
                    </span>

                    <span className="text-right font-medium text-gray-900">
                      {formulario.fornecedorId
                        ? fornecedores.find(
                            (fornecedor) =>
                              String(
                                fornecedor.id
                              ) ===
                              formulario.fornecedorId
                          )?.nome ||
                          "Selecionado"
                        : "Sem fornecedor"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Estoque
                    </span>

                    <span className="font-medium text-gray-900">
                      {formulario.estoque ||
                        "0"}
                    </span>
                  </div>

                </div>
              </section>

              {/* Ações */}

              <section className="rounded-xl bg-white p-6 shadow-sm">

                <div className="space-y-3">

                  <button
                    type="submit"
                    disabled={salvando}
                    className="w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {salvando
                      ? "Cadastrando..."
                      : "Cadastrar produto"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/produtos"
                      )
                    }
                    disabled={salvando}
                    className="w-full rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                </div>

              </section>

            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

