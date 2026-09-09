"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface Categoria {
  id: number;
  nome: string;
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

interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  precoPromo: number | null;
  estoque: number;
  destaque: boolean;
  oferta: boolean;
  ativo: boolean;
  imagem: string | null;
  categoriaId: number | null;
  fornecedorId: number | null;
  skuFornecedor: string | null;
  custoFornecedor: number | null;
  linkFornecedor: string | null;
  categoria?: Categoria | null;
  fornecedor?: Fornecedor | null;
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

function formatarImagem(imagem: string | null) {
  if (!imagem) {
    return null;
  }

  if (
    imagem.startsWith("http://") ||
    imagem.startsWith("https://") ||
    imagem.startsWith("data:")
  ) {
    return imagem;
  }

  const baseUrl = API_URL.replace(/\/api\/?$/, "");

  if (imagem.startsWith("/")) {
    return `${baseUrl}${imagem}`;
  }

  return `${baseUrl}/${imagem}`;
}

export default function EditarProdutoPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [produto, setProduto] = useState<Produto | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

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

  const [imagemAtual, setImagemAtual] =
    useState<string | null>(null);

  const [novaImagem, setNovaImagem] =
    useState<File | null>(null);

  const [previewImagem, setPreviewImagem] =
    useState<string | null>(null);

  const [carregando, setCarregando] = useState(true);

  const [salvando, setSalvando] = useState(false);

  const [excluindo, setExcluindo] = useState(false);

  const [erro, setErro] = useState("");

  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const [
          produtoResponse,
          categoriasResponse,
          fornecedoresResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/produtos/${id}`),
          fetch(`${API_URL}/categorias`),
          fetch(`${API_URL}/fornecedores`),
        ]);

        if (!produtoResponse.ok) {
          throw new Error(
            "Não foi possível carregar o produto."
          );
        }

        const produtoData =
          await produtoResponse.json();

        const categoriasData =
          categoriasResponse.ok
            ? await categoriasResponse.json()
            : [];

        const fornecedoresData =
          fornecedoresResponse.ok
            ? await fornecedoresResponse.json()
            : [];

        const produtoCarregado: Produto =
          produtoData?.produto ?? produtoData;

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

        setProduto(produtoCarregado);

        setCategorias(categoriasCarregadas);

        setFornecedores(fornecedoresCarregados);

        setFormulario({
          nome: produtoCarregado.nome ?? "",

          descricao:
            produtoCarregado.descricao ?? "",

          preco:
            produtoCarregado.preco?.toString() ?? "",

          precoPromo:
            produtoCarregado.precoPromo?.toString() ?? "",

          estoque:
            produtoCarregado.estoque?.toString() ?? "0",

          categoriaId:
            produtoCarregado.categoriaId?.toString() ?? "",

          fornecedorId:
            produtoCarregado.fornecedorId?.toString() ?? "",

          skuFornecedor:
            produtoCarregado.skuFornecedor ?? "",

          custoFornecedor:
            produtoCarregado.custoFornecedor?.toString() ?? "",

          linkFornecedor:
            produtoCarregado.linkFornecedor ?? "",

          destaque:
            Boolean(produtoCarregado.destaque),

          oferta:
            Boolean(produtoCarregado.oferta),

          ativo:
            produtoCarregado.ativo !== false,
        });

        setImagemAtual(
          produtoCarregado.imagem ?? null
        );
      } catch (error) {
        console.error(
          "[Admin Produtos] Erro:",
          error
        );

        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao carregar o produto."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [id]);

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

    setNovaImagem(arquivo);

    const url = URL.createObjectURL(arquivo);

    setPreviewImagem(url);
  }

  async function salvarProduto(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!produto) {
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      if (!formulario.nome.trim()) {
        throw new Error(
          "Informe o nome do produto."
        );
      }

      if (
        !formulario.preco ||
        Number(formulario.preco) <= 0
      ) {
        throw new Error(
          "Informe um preço válido."
        );
      }

      if (Number(formulario.estoque) < 0) {
        throw new Error(
          "O estoque não pode ser negativo."
        );
      }

      const dados = new FormData();

      dados.append(
        "nome",
        formulario.nome.trim()
      );

      dados.append(
        "descricao",
        formulario.descricao.trim()
      );

      dados.append(
        "preco",
        formulario.preco
      );

      dados.append(
        "precoPromo",
        formulario.precoPromo.trim()
      );

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

      if (formulario.categoriaId) {
        dados.append(
          "categoriaId",
          formulario.categoriaId
        );
      }

      if (formulario.fornecedorId) {
        dados.append(
          "fornecedorId",
          formulario.fornecedorId
        );
      }

      if (formulario.skuFornecedor.trim()) {
        dados.append(
          "skuFornecedor",
          formulario.skuFornecedor.trim()
        );
      }

      if (formulario.custoFornecedor.trim()) {
        dados.append(
          "custoFornecedor",
          formulario.custoFornecedor.trim()
        );
      }

      if (formulario.linkFornecedor.trim()) {
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
        `${API_URL}/produtos/${produto.id}`,
        {
          method: "PUT",
          body: dados,
        }
      );

      const resultado =
        await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          resultado?.message ||
            resultado?.erro ||
            "Não foi possível atualizar o produto."
        );
      }

      const produtoAtualizado: Produto =
        resultado?.produto ?? resultado;

      setProduto(produtoAtualizado);

      setImagemAtual(
        produtoAtualizado.imagem ??
          imagemAtual
      );

      setNovaImagem(null);

      setPreviewImagem(null);

      setMensagem(
        "Produto atualizado com sucesso."
      );

      setTimeout(() => {
        router.push("/admin/produtos");
      }, 900);
    } catch (error) {
      console.error(
        "[Admin Produtos] Erro ao salvar:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao salvar o produto."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function desativarProduto() {
    if (!produto) {
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente desativar o produto "${produto.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setExcluindo(true);
      setErro("");
      setMensagem("");

      const response = await fetch(
        `${API_URL}/produtos/${produto.id}`,
        {
          method: "DELETE",
        }
      );

      const resultado =
        await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          resultado?.message ||
            resultado?.erro ||
            "Não foi possível desativar o produto."
        );
      }

      setMensagem(
        "Produto desativado com sucesso."
      );

      setTimeout(() => {
        router.push("/admin/produtos");
      }, 800);
    } catch (error) {
      console.error(
        "[Admin Produtos] Erro ao desativar:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao desativar o produto."
      );
    } finally {
      setExcluindo(false);
    }
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <p className="text-gray-600">
              Carregando produto...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (erro && !produto) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
              {erro}
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/admin/produtos")
              }
              className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Voltar para produtos
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!produto) {
    return null;
  }

  const imagemExibida =
    previewImagem ||
    formatarImagem(imagemAtual);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* Cabeçalho */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push("/admin/produtos")
              }
              className="mb-3 text-sm text-gray-500 hover:text-gray-900"
            >
              ← Voltar para produtos
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              Editar produto
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Produto #{produto.id}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${
              formulario.ativo
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {formulario.ativo
              ? "Ativo"
              : "Inativo"}
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

        <form onSubmit={salvarProduto}>
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
                      Nome do produto
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                      placeholder="Nome do produto"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Descrição
                    </label>

                    <textarea
                      value={formulario.descricao}
                      onChange={(event) =>
                        atualizarCampo(
                          "descricao",
                          event.target.value
                        )
                      }
                      rows={6}
                      className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                      placeholder="Descrição do produto"
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
                      Preço
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formulario.preco}
                      onChange={(event) =>
                        atualizarCampo(
                          "preco",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
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
                      value={formulario.precoPromo}
                      onChange={(event) =>
                        atualizarCampo(
                          "precoPromo",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                      placeholder="Opcional"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Estoque
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={formulario.estoque}
                      onChange={(event) =>
                        atualizarCampo(
                          "estoque",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                    />
                  </div>
                </div>
              </section>

              {/* Categoria */}

              <section className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                  Categoria
                </h2>

                <select
                  value={formulario.categoriaId}
                  onChange={(event) =>
                    atualizarCampo(
                      "categoriaId",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
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
              </section>

              {/* Dropshipping */}

              <section className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Dropshipping
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Informações utilizadas para
                    encaminhamento do pedido ao fornecedor.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Fornecedor
                    </label>

                    <select
                      value={formulario.fornecedorId}
                      onChange={(event) =>
                        atualizarCampo(
                          "fornecedorId",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
                    >
                      <option value="">
                        Sem fornecedor
                      </option>

                      {fornecedores.map(
                        (fornecedor) => (
                          <option
                            key={fornecedor.id}
                            value={fornecedor.id}
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
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                        placeholder="SKU"
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
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                        placeholder="0,00"
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </section>

              {/* Configurações */}

              <section className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-gray-900">
                  Configurações
                </h2>

                <div className="space-y-4">
                  <label className="flex cursor-pointer items-center gap-3">
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
                      className="h-4 w-4"
                    />

                    <span>
                      <span className="block text-sm font-medium text-gray-900">
                        Produto em destaque
                      </span>

                      <span className="block text-xs text-gray-500">
                        Exibe o produto nas áreas de destaque.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3">
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
                      className="h-4 w-4"
                    />

                    <span>
                      <span className="block text-sm font-medium text-gray-900">
                        Produto em oferta
                      </span>

                      <span className="block text-xs text-gray-500">
                        Marca o produto como oferta.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3">
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
                      className="h-4 w-4"
                    />

                    <span>
                      <span className="block text-sm font-medium text-gray-900">
                        Produto ativo
                      </span>

                      <span className="block text-xs text-gray-500">
                        Produtos inativos não ficam disponíveis
                        para venda.
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
                  {imagemExibida ? (
                    <img
                      src={imagemExibida}
                      alt={produto.nome}
                      className="h-64 w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center text-sm text-gray-400">
                      Sem imagem
                    </div>
                  )}
                </div>

                <label className="mt-4 block cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-4 text-center hover:border-gray-500">
                  <span className="text-sm font-medium text-gray-700">
                    Selecionar nova imagem
                  </span>

                  <span className="mt-1 block text-xs text-gray-500">
                    PNG, JPG ou WEBP
                  </span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={selecionarImagem}
                    className="hidden"
                  />
                </label>

                {novaImagem && (
                  <p className="mt-3 break-all text-xs text-gray-500">
                    Nova imagem: {novaImagem.name}
                  </p>
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
                      ID
                    </span>

                    <span className="font-medium text-gray-900">
                      #{produto.id}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Categoria
                    </span>

                    <span className="text-right font-medium text-gray-900">
                      {produto.categoria?.nome ||
                        "Sem categoria"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Fornecedor
                    </span>

                    <span className="text-right font-medium text-gray-900">
                      {produto.fornecedor?.nome ||
                        "Sem fornecedor"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Estoque
                    </span>

                    <span className="font-medium text-gray-900">
                      {produto.estoque}
                    </span>
                  </div>
                </div>
              </section>

              {/* Ações */}

              <section className="rounded-xl bg-white p-6 shadow-sm">
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={
                      salvando ||
                      excluindo
                    }
                    className="w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {salvando
                      ? "Salvando..."
                      : "Salvar alterações"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/produtos"
                      )
                    }
                    disabled={
                      salvando ||
                      excluindo
                    }
                    className="w-full rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={desativarProduto}
                    disabled={
                      salvando ||
                      excluindo ||
                      !formulario.ativo
                    }
                    className="w-full rounded-lg border border-red-200 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {excluindo
                      ? "Desativando..."
                      : "Desativar produto"}
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