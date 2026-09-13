"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

type Categoria = {
  id: number;
  nome: string;
  ativo?: boolean;
};

type Fornecedor = {
  id: number;
  nome: string;
  ativo?: boolean;
};

type ProdutoExistente = {
  id?: number;
  nome: string;
};

type ProdutoLote = {
  id: string;
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
};

type ResultadoCadastro = {
  nome: string;
  sucesso: boolean;
  mensagem: string;
};

function criarProdutoVazio(): ProdutoLote {
  return {
    id: `${Date.now()}-${Math.random()}`,
    nome: "",
    descricao: "",
    preco: "",
    precoPromo: "",
    estoque: "0",
    categoriaId: "",
    fornecedorId: "",
    skuFornecedor: "",
    custoFornecedor: "",
    linkFornecedor: "",
    destaque: false,
    oferta: false,
    ativo: true,
  };
}

async function lerResposta(response: Response): Promise<unknown> {
  const texto = await response.text();

  if (!texto) {
    return null;
  }

  try {
    return JSON.parse(texto);
  } catch {
    throw new Error(
      `A API retornou uma resposta inválida. Status: ${response.status} ${response.statusText}`
    );
  }
}

function obterMensagemErro(data: unknown, mensagemPadrao: string) {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  return mensagemPadrao;
}

export default function CadastroProdutosLotePage() {
  const router = useRouter();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [produtosExistentes, setProdutosExistentes] = useState<string[]>([]);

  const [produtoAtual, setProdutoAtual] =
    useState<ProdutoLote>(criarProdutoVazio());

  const [produtos, setProdutos] = useState<ProdutoLote[]>([]);

  const [carregandoDados, setCarregandoDados] = useState(true);
  const [cadastrando, setCadastrando] = useState(false);

  const [resultados, setResultados] = useState<ResultadoCadastro[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregandoDados(true);
      setErro("");

      console.log("[Cadastro em lote] API:", API_URL);

      const [
        categoriasResponse,
        fornecedoresResponse,
        produtosResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/categorias`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/fornecedores`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/produtos`, {
          cache: "no-store",
        }),
      ]);

      const [
        categoriasData,
        fornecedoresData,
        produtosData,
      ] = await Promise.all([
        lerResposta(categoriasResponse),
        lerResposta(fornecedoresResponse),
        lerResposta(produtosResponse),
      ]);

      if (!categoriasResponse.ok) {
        throw new Error(
          obterMensagemErro(
            categoriasData,
            "Não foi possível carregar as categorias."
          )
        );
      }

      if (!fornecedoresResponse.ok) {
        throw new Error(
          obterMensagemErro(
            fornecedoresData,
            "Não foi possível carregar os fornecedores."
          )
        );
      }

      if (!produtosResponse.ok) {
        throw new Error(
          obterMensagemErro(
            produtosData,
            "Não foi possível carregar os produtos."
          )
        );
      }

      const listaCategorias: Categoria[] = Array.isArray(categoriasData)
        ? categoriasData
        : typeof categoriasData === "object" &&
          categoriasData !== null &&
          "categorias" in categoriasData &&
          Array.isArray(categoriasData.categorias)
        ? categoriasData.categorias
        : [];

      const listaFornecedores: Fornecedor[] = Array.isArray(
        fornecedoresData
      )
        ? fornecedoresData
        : typeof fornecedoresData === "object" &&
          fornecedoresData !== null &&
          "fornecedores" in fornecedoresData &&
          Array.isArray(fornecedoresData.fornecedores)
        ? fornecedoresData.fornecedores
        : [];

      const listaProdutos: ProdutoExistente[] = Array.isArray(
        produtosData
      )
        ? produtosData
        : typeof produtosData === "object" &&
          produtosData !== null &&
          "produtos" in produtosData &&
          Array.isArray(produtosData.produtos)
        ? produtosData.produtos
        : [];

      setCategorias(
        listaCategorias.filter(
          (categoria) => categoria.ativo !== false
        )
      );

      setFornecedores(
        listaFornecedores.filter(
          (fornecedor) => fornecedor.ativo !== false
        )
      );

      setProdutosExistentes(
        listaProdutos
          .filter(
            (produto) =>
              produto &&
              typeof produto.nome === "string"
          )
          .map((produto) =>
            produto.nome.trim().toLowerCase()
          )
      );
    } catch (error) {
      console.error(
        "[Cadastro em lote] Erro ao carregar dados:",
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

  function atualizarProdutoAtual(
    campo: keyof ProdutoLote,
    valor: string | boolean
  ) {
    setProdutoAtual((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    if (erro) {
      setErro("");
    }

    if (mensagem) {
      setMensagem("");
    }
  }

  function adicionarProduto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    const nome = produtoAtual.nome.trim();
    const preco = Number(produtoAtual.preco);
    const precoPromo = produtoAtual.precoPromo
      ? Number(produtoAtual.precoPromo)
      : 0;
    const estoque = Number(produtoAtual.estoque);
    const custoFornecedor = produtoAtual.custoFornecedor
      ? Number(produtoAtual.custoFornecedor)
      : 0;

    if (!nome) {
      setErro("Informe o nome do produto.");
      return;
    }

    if (!produtoAtual.preco || !Number.isFinite(preco) || preco <= 0) {
      setErro("Informe um preço válido.");
      return;
    }

    if (
      produtoAtual.precoPromo &&
      (!Number.isFinite(precoPromo) || precoPromo < 0)
    ) {
      setErro("Informe um preço promocional válido.");
      return;
    }

    if (
      produtoAtual.precoPromo &&
      precoPromo >= preco
    ) {
      setErro(
        "O preço promocional deve ser menor que o preço normal."
      );
      return;
    }

    if (
      !Number.isFinite(estoque) ||
      estoque < 0 ||
      !Number.isInteger(estoque)
    ) {
      setErro("Informe um estoque válido.");
      return;
    }

    if (!produtoAtual.categoriaId) {
      setErro("Selecione uma categoria.");
      return;
    }

    if (
      produtoAtual.custoFornecedor &&
      (!Number.isFinite(custoFornecedor) || custoFornecedor < 0)
    ) {
      setErro("Informe um custo de fornecedor válido.");
      return;
    }

    const categoriaExiste = categorias.some(
      (categoria) =>
        categoria.id === Number(produtoAtual.categoriaId)
    );

    if (!categoriaExiste) {
      setErro(
        "A categoria selecionada não está disponível."
      );
      return;
    }

    if (produtoAtual.fornecedorId) {
      const fornecedorExiste = fornecedores.some(
        (fornecedor) =>
          fornecedor.id === Number(produtoAtual.fornecedorId)
      );

      if (!fornecedorExiste) {
        setErro(
          "O fornecedor selecionado não está disponível."
        );
        return;
      }
    }

    const nomeNormalizado = nome.toLowerCase();

    const jaNoLote = produtos.some(
      (produto) =>
        produto.nome.trim().toLowerCase() === nomeNormalizado
    );

    if (jaNoLote) {
      setErro(
        "Este produto já foi adicionado ao lote."
      );
      return;
    }

    setProdutos((anterior) => [
      ...anterior,
      {
        ...produtoAtual,
        nome,
        descricao: produtoAtual.descricao.trim(),
        preco: produtoAtual.preco.trim(),
        precoPromo: produtoAtual.precoPromo.trim(),
        estoque: String(estoque),
        skuFornecedor:
          produtoAtual.skuFornecedor.trim(),
        custoFornecedor:
          produtoAtual.custoFornecedor.trim(),
        linkFornecedor:
          produtoAtual.linkFornecedor.trim(),
      },
    ]);

    setProdutoAtual(criarProdutoVazio());

    setMensagem("Produto adicionado ao lote.");
  }

  function removerProduto(id: string) {
    setProdutos((anterior) =>
      anterior.filter(
        (produto) => produto.id !== id
      )
    );

    setMensagem("Produto removido do lote.");
    setErro("");
  }

  function editarProduto(id: string) {
    const produto = produtos.find(
      (item) => item.id === id
    );

    if (!produto) {
      return;
    }

    setProdutoAtual(produto);

    setProdutos((anterior) =>
      anterior.filter(
        (item) => item.id !== id
      )
    );

    setMensagem(
      "Produto carregado para edição."
    );

    setErro("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function limparFormulario() {
    setProdutoAtual(criarProdutoVazio());
    setErro("");
    setMensagem("");
  }

  function limparLote() {
    if (cadastrando || produtos.length === 0) {
      return;
    }

    setProdutos([]);
    setResultados([]);
    setErro("");
    setMensagem("Lote limpo.");
  }

  const produtosDuplicados = useMemo(() => {
    return produtos.filter((produto) =>
      produtosExistentes.includes(
        produto.nome.trim().toLowerCase()
      )
    );
  }, [produtos, produtosExistentes]);

  const produtosPendentes = useMemo(() => {
    return produtos.filter(
      (produto) =>
        !produtosExistentes.includes(
          produto.nome.trim().toLowerCase()
        )
    );
  }, [produtos, produtosExistentes]);

  const valorTotalLote = useMemo(() => {
    return produtosPendentes.reduce(
      (total, produto) => {
        const preco =
          produto.precoPromo &&
          Number(produto.precoPromo) > 0 &&
          Number(produto.precoPromo) <
            Number(produto.preco)
            ? Number(produto.precoPromo)
            : Number(produto.preco);

        return (
          total +
          (Number.isFinite(preco) ? preco : 0)
        );
      },
      0
    );
  }, [produtosPendentes]);

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function cadastrarTodos() {
    if (cadastrando) {
      return;
    }

    if (produtos.length === 0) {
      setErro(
        "Adicione pelo menos um produto ao lote."
      );
      return;
    }

    if (produtosPendentes.length === 0) {
      setErro(
        "Todos os produtos deste lote já existem no cadastro."
      );
      return;
    }

    setCadastrando(true);
    setResultados([]);
    setErro("");
    setMensagem("");

    const novosResultados: ResultadoCadastro[] = [];

    for (const produto of produtosPendentes) {
      try {
        const formData = new FormData();

        formData.append(
          "nome",
          produto.nome.trim()
        );

        formData.append(
          "descricao",
          produto.descricao.trim()
        );

        formData.append(
          "preco",
          produto.preco
        );

        if (produto.precoPromo.trim()) {
          formData.append(
            "precoPromo",
            produto.precoPromo
          );
        }

        formData.append(
          "estoque",
          produto.estoque || "0"
        );

        formData.append(
          "categoriaId",
          produto.categoriaId
        );

        if (produto.fornecedorId) {
          formData.append(
            "fornecedorId",
            produto.fornecedorId
          );
        }

        if (produto.skuFornecedor.trim()) {
          formData.append(
            "skuFornecedor",
            produto.skuFornecedor.trim()
          );
        }

        if (produto.custoFornecedor.trim()) {
          formData.append(
            "custoFornecedor",
            produto.custoFornecedor.trim()
          );
        }

        if (produto.linkFornecedor.trim()) {
          formData.append(
            "linkFornecedor",
            produto.linkFornecedor.trim()
          );
        }

        formData.append(
          "destaque",
          String(produto.destaque)
        );

        formData.append(
          "oferta",
          String(produto.oferta)
        );

        formData.append(
          "ativo",
          String(produto.ativo)
        );

        const response = await fetch(
          `${API_URL}/api/produtos`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await lerResposta(response);

        if (!response.ok) {
          throw new Error(
            obterMensagemErro(
              data,
              "Não foi possível cadastrar o produto."
            )
          );
        }

        novosResultados.push({
          nome: produto.nome,
          sucesso: true,
          mensagem:
            "Produto cadastrado com sucesso.",
        });
      } catch (error) {
        console.error(
          `[Cadastro em lote] Erro no produto "${produto.nome}":`,
          error
        );

        novosResultados.push({
          nome: produto.nome,
          sucesso: false,
          mensagem:
            error instanceof Error
              ? error.message
              : "Erro ao cadastrar o produto.",
        });
      }

      setResultados([...novosResultados]);
    }

    const quantidadeSucesso =
      novosResultados.filter(
        (resultado) => resultado.sucesso
      ).length;

    const quantidadeErro =
      novosResultados.filter(
        (resultado) => !resultado.sucesso
      ).length;

    setResultados(novosResultados);

    if (quantidadeErro === 0) {
      setMensagem(
        `${quantidadeSucesso} produto(s) cadastrado(s) com sucesso.`
      );

      setProdutos([]);
    } else {
      setMensagem(
        `${quantidadeSucesso} cadastrado(s) e ${quantidadeErro} com erro.`
      );

      const nomesComErro = novosResultados
        .filter(
          (resultado) => !resultado.sucesso
        )
        .map((resultado) => resultado.nome);

      setProdutos((anterior) =>
        anterior.filter((produto) =>
          nomesComErro.includes(produto.nome)
        )
      );
    }

    await carregarDados();

    setCadastrando(false);
  }

  if (carregandoDados) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-white p-8 shadow">
            <p className="text-gray-600">
              Carregando categorias, fornecedores e produtos...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Cadastro de produtos em lote
            </h1>

            <p className="mt-1 text-gray-600">
              Monte vários produtos e cadastre todos de uma vez.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/produtos")
            }
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100"
          >
            ← Voltar para produtos
          </button>
        </div>

        {/* Mensagens */}
        {erro && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {mensagem}
          </div>
        )}

        {/* Formulário */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Adicionar produto ao lote
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Preencha os dados e clique em
              {" "}
              "Adicionar ao lote".
            </p>
          </div>

          <form
            onSubmit={adicionarProduto}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Nome */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nome do produto *
                </label>

                <input
                  type="text"
                  value={produtoAtual.nome}
                  onChange={(event) =>
                    atualizarProdutoAtual(
                      "nome",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Cama Confortável para Pets"
                  disabled={cadastrando}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Descrição
                </label>

                <textarea
                  value={produtoAtual.descricao}
                  onChange={(event) =>
                    atualizarProdutoAtual(
                      "descricao",
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Descrição do produto..."
                  disabled={cadastrando}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              {/* Preço */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Preço *
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={produtoAtual.preco}
                  onChange={(event) =>
                    atualizarProdutoAtual(
                      "preco",
                      event.target.value
                    )
                  }
                  placeholder="89.90"
                  disabled={cadastrando}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              {/* Promo */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Preço promocional
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={produtoAtual.precoPromo}
                  onChange={(event) =>
                    atualizarProdutoAtual(
                      "precoPromo",
                      event.target.value
                    )
                  }
                  placeholder="69.90"
                  disabled={cadastrando}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              {/* Estoque */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Estoque
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={produtoAtual.estoque}
                  onChange={(event) =>
                    atualizarProdutoAtual(
                      "estoque",
                      event.target.value
                    )
                  }
                  disabled={cadastrando}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Categoria *
                </label>

                <select
                  value={produtoAtual.categoriaId}
                  onChange={(event) =>
                    atualizarProdutoAtual(
                      "categoriaId",
                      event.target.value
                    )
                  }
                  disabled={cadastrando}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                >
                  <option value="">
                    Selecione uma categoria
                  </option>

                  {categorias.map((categoria) => (
                    <option
                      key={categoria.id}
                      value={categoria.id}
                    >
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fornecedor */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Fornecedor
                </label>

                <select
                  value={produtoAtual.fornecedorId}
                  onChange={(event) =>
                    atualizarProdutoAtual(
                      "fornecedorId",
                      event.target.value
                    )
                  }
                  disabled={cadastrando}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                >
                  <option value="">
                    Sem fornecedor
                  </option>

                  {fornecedores.map((fornecedor) => (
                    <option
                      key={fornecedor.id}
                      value={fornecedor.id}
                    >
                      {fornecedor.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* SKU */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  SKU fornecedor
                </label>

                <input
                  type="text"
                  value={produtoAtual.skuFornecedor}
                  onChange={(event) =>
                    atualizarProdutoAtual(
                      "skuFornecedor",
                      event.target.value
                    )
                  }
                  placeholder="PM-CAM-001"
                  disabled={cadastrando}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              {/* Custo */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Custo fornecedor
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={produtoAtual.custoFornecedor}
                  onChange={(event) =>
                    atualizarProdutoAtual(
                      "custoFornecedor",
                      event.target.value
                    )
                  }
                  placeholder="42.00"
                  disabled={cadastrando}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              {/* Link */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Link do fornecedor
                </label>

                <input
                  type="url"
                  value={produtoAtual.linkFornecedor}
                  onChange={(event) =>
                    atualizarProdutoAtual(
                      "linkFornecedor",
                      event.target.value
                    )
                  }
                  placeholder="https://..."
                  disabled={cadastrando}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-6 border-t pt-5">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={produtoAtual.destaque}
                  onChange={(event) =>
                    atualizarProdutoAtual(
                      "destaque",
                      event.target.checked
                    )
                  }
                  disabled={cadastrando}
                  className="h-4 w-4"
                />

                <span className="text-sm text-gray-700">
                  Produto em destaque
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={produtoAtual.oferta}
                  onChange={(event) =>
                    atualizarProdutoAtual(
                      "oferta",
                      event.target.checked
                    )
                  }
                  disabled={cadastrando}
                  className="h-4 w-4"
                />

                <span className="text-sm text-gray-700">
                  Produto em oferta
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={produtoAtual.ativo}
                  onChange={(event) =>
                    atualizarProdutoAtual(
                      "ativo",
                      event.target.checked
                    )
                  }
                  disabled={cadastrando}
                  className="h-4 w-4"
                />

                <span className="text-sm text-gray-700">
                  Produto ativo
                </span>
              </label>
            </div>

            {/* Botões */}
            <div className="flex flex-wrap gap-3 border-t pt-5">
              <button
                type="submit"
                disabled={cadastrando}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                + Adicionar ao lote
              </button>

              <button
                type="button"
                onClick={limparFormulario}
                disabled={cadastrando}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                Limpar
              </button>
            </div>
          </form>
        </section>

        {/* Resumo */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              No lote
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900">
              {produtos.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Prontos para cadastro
            </p>

            <p className="mt-1 text-3xl font-bold text-green-600">
              {produtosPendentes.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Já existentes
            </p>

            <p className="mt-1 text-3xl font-bold text-orange-500">
              {produtosDuplicados.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Categorias
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900">
              {categorias.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Valor do lote
            </p>

            <p className="mt-1 text-xl font-bold text-blue-600">
              {formatarMoeda(valorTotalLote)}
            </p>
          </div>
        </section>

        {/* Produtos do lote */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Produtos no lote
              </h2>

              <p className="text-sm text-gray-500">
                Revise os produtos antes de cadastrar.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {produtos.length > 0 && (
                <button
                  type="button"
                  onClick={limparLote}
                  disabled={cadastrando}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  Limpar lote
                </button>
              )}

              <button
                type="button"
                onClick={cadastrarTodos}
                disabled={
                  cadastrando ||
                  produtosPendentes.length === 0
                }
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {cadastrando
                  ? "Cadastrando..."
                  : `Cadastrar ${produtosPendentes.length} produto(s)`}
              </button>
            </div>
          </div>

          {produtos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
              <p className="font-medium text-gray-600">
                Nenhum produto adicionado ao lote.
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Preencha o formulário acima para começar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {produtos.map((produto, index) => {
                const categoria = categorias.find(
                  (item) =>
                    item.id ===
                    Number(produto.categoriaId)
                );

                const fornecedor = fornecedores.find(
                  (item) =>
                    item.id ===
                    Number(produto.fornecedorId)
                );

                const jaExiste =
                  produtosExistentes.includes(
                    produto.nome
                      .trim()
                      .toLowerCase()
                  );

                return (
                  <div
                    key={produto.id}
                    className={`rounded-xl border p-5 ${
                      jaExiste
                        ? "border-orange-200 bg-orange-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700">
                            #{index + 1}
                          </span>

                          <h3 className="text-lg font-semibold text-gray-900">
                            {produto.nome}
                          </h3>

                          {jaExiste && (
                            <span className="rounded-full bg-orange-200 px-2.5 py-1 text-xs font-semibold text-orange-800">
                              Já cadastrado
                            </span>
                          )}

                          {produto.oferta && (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                              Oferta
                            </span>
                          )}

                          {produto.destaque && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              Destaque
                            </span>
                          )}
                        </div>

                        {produto.descricao && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                            {produto.descricao}
                          </p>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                          <div>
                            <span className="text-gray-500">
                              Preço
                            </span>

                            <p className="font-semibold text-gray-900">
                              R${" "}
                              {Number(
                                produto.preco
                              ).toFixed(2)}
                            </p>
                          </div>

                          <div>
                            <span className="text-gray-500">
                              Promoção
                            </span>

                            <p className="font-semibold text-gray-900">
                              {produto.precoPromo
                                ? `R$ ${Number(
                                    produto.precoPromo
                                  ).toFixed(2)}`
                                : "—"}
                            </p>
                          </div>

                          <div>
                            <span className="text-gray-500">
                              Estoque
                            </span>

                            <p className="font-semibold text-gray-900">
                              {produto.estoque}
                            </p>
                          </div>

                          <div>
                            <span className="text-gray-500">
                              Categoria
                            </span>

                            <p className="font-semibold text-gray-900">
                              {categoria?.nome ||
                                "—"}
                            </p>
                          </div>

                          <div>
                            <span className="text-gray-500">
                              Fornecedor
                            </span>

                            <p className="font-semibold text-gray-900">
                              {fornecedor?.nome ||
                                "—"}
                            </p>
                          </div>

                          <div>
                            <span className="text-gray-500">
                              SKU
                            </span>

                            <p className="font-semibold text-gray-900">
                              {produto.skuFornecedor ||
                                "—"}
                            </p>
                          </div>

                          <div>
                            <span className="text-gray-500">
                              Custo
                            </span>

                            <p className="font-semibold text-gray-900">
                              {produto.custoFornecedor
                                ? `R$ ${Number(
                                    produto.custoFornecedor
                                  ).toFixed(2)}`
                                : "—"}
                            </p>
                          </div>

                          <div>
                            <span className="text-gray-500">
                              Status
                            </span>

                            <p className="font-semibold text-gray-900">
                              {produto.ativo
                                ? "Ativo"
                                : "Inativo"}
                            </p>
                          </div>
                        </div>

                        {produto.linkFornecedor && (
                          <div className="mt-3">
                            <span className="text-xs text-gray-500">
                              Link fornecedor
                            </span>

                            <p className="truncate text-sm font-medium text-blue-600">
                              {produto.linkFornecedor}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            editarProduto(
                              produto.id
                            )
                          }
                          disabled={cadastrando}
                          className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removerProduto(
                              produto.id
                            )
                          }
                          disabled={cadastrando}
                          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Resultados */}
        {resultados.length > 0 && (
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Resultado do cadastro
            </h2>

            <div className="space-y-2">
              {resultados.map(
                (resultado, index) => (
                  <div
                    key={`${resultado.nome}-${index}`}
                    className={`rounded-lg border p-4 ${
                      resultado.sucesso
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <span className="font-medium text-gray-900">
                        {resultado.nome}
                      </span>

                      <span
                        className={
                          resultado.sucesso
                            ? "text-sm font-medium text-green-700"
                            : "text-sm font-medium text-red-700"
                        }
                      >
                        {resultado.mensagem}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}