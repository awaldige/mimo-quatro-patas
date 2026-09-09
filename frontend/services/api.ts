// =====================================================
// MIMO QUATRO PATAS
// services/api.ts
// =====================================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api"
).replace(/\/+$/, "");

// =====================================================
// TIPOS
// =====================================================

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string | null;
  imagem?: string | null;
  ativo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Produto {
  id: number;
  nome: string;
  descricao?: string | null;
  preco: number | string;
  precoPromo?: number | string | null;
  imagem?: string | null;
  estoque: number;
  ativo: boolean;
  destaque: boolean;
  categoriaId?: number | null;
  categoria?: Categoria | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Avaliacao {
  id: number;
  nome: string;
  email?: string | null;
  nota: number;
  comentario?: string | null;
  aprovado: boolean;
  ativo: boolean;
  produtoId: number;
  produto?: {
    id: number;
    nome: string;
    imagem?: string | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiError {
  success?: boolean;
  message?: string;
  error?: string;
}

// =====================================================
// RESPOSTAS
// =====================================================

export interface ProdutosResponse {
  produtos: Produto[];
}

export interface CategoriasResponse {
  categorias: Categoria[];
}

export interface AvaliacoesResponse {
  avaliacoes: Avaliacao[];
}

// =====================================================
// URL DA API
// =====================================================

export function getApiUrl(): string {
  return API_URL;
}

// =====================================================
// URL BASE DO BACKEND
// =====================================================

function getBackendUrl(): string {
  return API_URL.replace(/\/api\/?$/, "");
}

// =====================================================
// URL DE IMAGEM
// =====================================================

export function getImagemUrl(
  imagem?: string | null
): string | null {
  if (!imagem) {
    return null;
  }

  const valor = String(imagem).trim();

  if (!valor) {
    return null;
  }

  const backendUrl = getBackendUrl();

  // ---------------------------------------------------
  // URL externa
  // ---------------------------------------------------

  if (
    valor.startsWith("http://") ||
    valor.startsWith("https://")
  ) {
    // Se for uma URL do próprio backend usando
    // /api/uploads, corrige para /uploads.
    if (
      valor.startsWith(`${backendUrl}/api/uploads/`)
    ) {
      return valor.replace(
        `${backendUrl}/api/uploads/`,
        `${backendUrl}/uploads/`
      );
    }

    // Também corrige caso exista /api/api/uploads.
    if (
      valor.startsWith(`${backendUrl}/api/api/uploads/`)
    ) {
      return valor.replace(
        `${backendUrl}/api/api/uploads/`,
        `${backendUrl}/uploads/`
      );
    }

    return valor;
  }

  // ---------------------------------------------------
  // Corrigir:
  //
  // /api/uploads/produto.jpg
  //
  // para:
  //
  // /uploads/produto.jpg
  // ---------------------------------------------------

  if (valor.startsWith("/api/uploads/")) {
    const caminho = valor.replace(
      /^\/api\/uploads\//,
      "/uploads/"
    );

    return `${backendUrl}${caminho}`;
  }

  // ---------------------------------------------------
  // Corrigir:
  //
  // api/uploads/produto.jpg
  // ---------------------------------------------------

  if (valor.startsWith("api/uploads/")) {
    const caminho = valor.replace(
      /^api\/uploads\//,
      "/uploads/"
    );

    return `${backendUrl}${caminho}`;
  }

  // ---------------------------------------------------
  // Upload correto:
  //
  // /uploads/produto.jpg
  // ---------------------------------------------------

  if (valor.startsWith("/uploads/")) {
    return `${backendUrl}${valor}`;
  }

  // ---------------------------------------------------
  // Upload sem barra inicial:
  //
  // uploads/produto.jpg
  // ---------------------------------------------------

  if (valor.startsWith("uploads/")) {
    return `${backendUrl}/${valor}`;
  }

  // ---------------------------------------------------
  // Imagem local do Next.js
  //
  // Exemplo:
  // /produtos/cama.jpg
  // ---------------------------------------------------

  if (valor.startsWith("/produtos/")) {
    return valor;
  }

  // ---------------------------------------------------
  // Outros caminhos absolutos
  // ---------------------------------------------------

  if (valor.startsWith("/")) {
    return `${backendUrl}${valor}`;
  }

  // ---------------------------------------------------
  // Nome simples do arquivo
  //
  // Exemplo:
  // produto.jpg
  // ---------------------------------------------------

  return `${backendUrl}/uploads/${valor}`;
}

// =====================================================
// LEITURA SEGURA DA RESPOSTA
// =====================================================

async function lerResposta<T>(
  resposta: Response
): Promise<T> {
  const texto = await resposta.text();

  if (!texto) {
    if (!resposta.ok) {
      throw new Error(
        `Erro na API. Status ${resposta.status} ${resposta.statusText}.`
      );
    }

    return null as T;
  }

  let dados: unknown;

  try {
    dados = JSON.parse(texto);
  } catch {
    console.error(
      "[API] Resposta não JSON:",
      texto.substring(0, 500)
    );

    throw new Error(
      `A API retornou uma resposta inválida. Status: ${resposta.status} ${resposta.statusText}.`
    );
  }

  if (!resposta.ok) {
    const erro = dados as ApiError;

    throw new Error(
      erro?.message ||
        erro?.error ||
        `Erro na API. Status ${resposta.status}.`
    );
  }

  return dados as T;
}

// =====================================================
// FETCH PADRÃO
// =====================================================

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const caminho = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_URL}${caminho}`;

  console.log(
    "[API]",
    options?.method || "GET",
    url
  );

  const resposta = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",

      ...(options?.body
        ? {
            "Content-Type": "application/json",
          }
        : {}),

      ...options?.headers,
    },
  });

  return lerResposta<T>(resposta);
}

// =====================================================
// PRODUTOS
// =====================================================

// -----------------------------------------------------
// LISTAR PRODUTOS
// GET /api/produtos
// -----------------------------------------------------

export async function getProdutos(): Promise<Produto[]> {
  const dados = await apiFetch<
    Produto[] | ProdutosResponse
  >("/produtos");

  if (Array.isArray(dados)) {
    return dados;
  }

  if (
    dados &&
    typeof dados === "object" &&
    "produtos" in dados &&
    Array.isArray(dados.produtos)
  ) {
    return dados.produtos;
  }

  return [];
}

// -----------------------------------------------------
// BUSCAR PRODUTO POR ID
// GET /api/produtos/:id
// -----------------------------------------------------

export async function getProdutoById(
  id: number
): Promise<Produto> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID do produto inválido.");
  }

  const dados = await apiFetch<
    Produto | { produto: Produto }
  >(`/produtos/${id}`);

  if (
    dados &&
    typeof dados === "object" &&
    "produto" in dados
  ) {
    return dados.produto;
  }

  return dados as Produto;
}

// -----------------------------------------------------
// CRIAR PRODUTO
// POST /api/produtos
// -----------------------------------------------------

export async function criarProduto(
  produto: Partial<Produto>
): Promise<Produto> {
  const dados = await apiFetch<
    Produto | { produto: Produto }
  >("/produtos", {
    method: "POST",
    body: JSON.stringify(produto),
  });

  if (
    dados &&
    typeof dados === "object" &&
    "produto" in dados
  ) {
    return dados.produto;
  }

  return dados as Produto;
}

// -----------------------------------------------------
// ATUALIZAR PRODUTO
// PUT /api/produtos/:id
// -----------------------------------------------------

export async function atualizarProduto(
  id: number,
  produto: Partial<Produto>
): Promise<Produto> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID do produto inválido.");
  }

  const dados = await apiFetch<
    Produto | { produto: Produto }
  >(`/produtos/${id}`, {
    method: "PUT",
    body: JSON.stringify(produto),
  });

  if (
    dados &&
    typeof dados === "object" &&
    "produto" in dados
  ) {
    return dados.produto;
  }

  return dados as Produto;
}

// -----------------------------------------------------
// EXCLUIR PRODUTO
// DELETE /api/produtos/:id
// -----------------------------------------------------

export async function excluirProduto(
  id: number
): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID do produto inválido.");
  }

  await apiFetch<void>(`/produtos/${id}`, {
    method: "DELETE",
  });
}

// =====================================================
// CATEGORIAS
// =====================================================

// -----------------------------------------------------
// LISTAR CATEGORIAS
// GET /api/categorias
// -----------------------------------------------------

export async function getCategorias(): Promise<Categoria[]> {
  const dados = await apiFetch<
    Categoria[] | CategoriasResponse
  >("/categorias");

  if (Array.isArray(dados)) {
    return dados;
  }

  if (
    dados &&
    typeof dados === "object" &&
    "categorias" in dados &&
    Array.isArray(dados.categorias)
  ) {
    return dados.categorias;
  }

  return [];
}

// -----------------------------------------------------
// BUSCAR CATEGORIA POR ID
// GET /api/categorias/:id
// -----------------------------------------------------

export async function getCategoriaById(
  id: number
): Promise<Categoria> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID da categoria inválido.");
  }

  const dados = await apiFetch<
    Categoria | { categoria: Categoria }
  >(`/categorias/${id}`);

  if (
    dados &&
    typeof dados === "object" &&
    "categoria" in dados
  ) {
    return dados.categoria;
  }

  return dados as Categoria;
}

// =====================================================
// AVALIAÇÕES
// =====================================================

// -----------------------------------------------------
// LISTAR TODAS AS AVALIAÇÕES
// GET /api/avaliacoes
// -----------------------------------------------------

export async function getAvaliacoes(): Promise<Avaliacao[]> {
  const dados = await apiFetch<
    Avaliacao[] | AvaliacoesResponse
  >("/avaliacoes");

  if (Array.isArray(dados)) {
    return dados;
  }

  if (
    dados &&
    typeof dados === "object" &&
    "avaliacoes" in dados &&
    Array.isArray(dados.avaliacoes)
  ) {
    return dados.avaliacoes;
  }

  return [];
}

// -----------------------------------------------------
// LISTAR AVALIAÇÕES DE UM PRODUTO
// GET /api/avaliacoes?produtoId=:id
// -----------------------------------------------------

export async function getAvaliacoesByProduto(
  produtoId: number
): Promise<Avaliacao[]> {
  if (
    !Number.isInteger(produtoId) ||
    produtoId <= 0
  ) {
    throw new Error("ID do produto inválido.");
  }

  const dados = await apiFetch<
    Avaliacao[] | AvaliacoesResponse
  >(
    `/avaliacoes?produtoId=${encodeURIComponent(
      produtoId
    )}`
  );

  let lista: Avaliacao[] = [];

  if (Array.isArray(dados)) {
    lista = dados;
  } else if (
    dados &&
    typeof dados === "object" &&
    "avaliacoes" in dados &&
    Array.isArray(dados.avaliacoes)
  ) {
    lista = dados.avaliacoes;
  }

  return lista.filter(
    (avaliacao) =>
      Number(avaliacao.produtoId) === produtoId
  );
}

// -----------------------------------------------------
// BUSCAR AVALIAÇÃO POR ID
// GET /api/avaliacoes/:id
// -----------------------------------------------------

export async function getAvaliacaoById(
  id: number
): Promise<Avaliacao> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID da avaliação inválido.");
  }

  const dados = await apiFetch<
    Avaliacao | { avaliacao: Avaliacao }
  >(`/avaliacoes/${id}`);

  if (
    dados &&
    typeof dados === "object" &&
    "avaliacao" in dados
  ) {
    return dados.avaliacao;
  }

  return dados as Avaliacao;
}

// -----------------------------------------------------
// CRIAR AVALIAÇÃO
// POST /api/avaliacoes
// -----------------------------------------------------

export async function criarAvaliacao(data: {
  nome: string;
  email?: string | null;
  nota: number;
  comentario?: string | null;
  produtoId: number;
}): Promise<Avaliacao> {
  const dados = await apiFetch<
    Avaliacao | {
      success?: boolean;
      message?: string;
      avaliacao: Avaliacao;
    }
  >("/avaliacoes", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (
    dados &&
    typeof dados === "object" &&
    "avaliacao" in dados
  ) {
    return dados.avaliacao;
  }

  return dados as Avaliacao;
}

// -----------------------------------------------------
// ATUALIZAR AVALIAÇÃO
// PUT /api/avaliacoes/:id
// -----------------------------------------------------

export async function atualizarAvaliacao(
  id: number,
  data: {
    nome?: string;
    email?: string | null;
    nota?: number;
    comentario?: string | null;
    aprovado?: boolean;
    ativo?: boolean;
    produtoId?: number;
  }
): Promise<Avaliacao> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID da avaliação inválido.");
  }

  const dados = await apiFetch<
    Avaliacao | { avaliacao: Avaliacao }
  >(`/avaliacoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (
    dados &&
    typeof dados === "object" &&
    "avaliacao" in dados
  ) {
    return dados.avaliacao;
  }

  return dados as Avaliacao;
}

// -----------------------------------------------------
// ALTERAR APROVAÇÃO
// PATCH /api/avaliacoes/:id/aprovacao
// -----------------------------------------------------

export async function alterarAprovacaoAvaliacao(
  id: number,
  aprovado: boolean
): Promise<Avaliacao> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID da avaliação inválido.");
  }

  const dados = await apiFetch<
    Avaliacao | { avaliacao: Avaliacao }
  >(`/avaliacoes/${id}/aprovacao`, {
    method: "PATCH",
    body: JSON.stringify({
      aprovado,
    }),
  });

  if (
    dados &&
    typeof dados === "object" &&
    "avaliacao" in dados
  ) {
    return dados.avaliacao;
  }

  return dados as Avaliacao;
}

// -----------------------------------------------------
// ALTERAR STATUS
// PATCH /api/avaliacoes/:id/status
// -----------------------------------------------------

export async function alterarStatusAvaliacao(
  id: number,
  ativo: boolean
): Promise<Avaliacao> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID da avaliação inválido.");
  }

  const dados = await apiFetch<
    Avaliacao | { avaliacao: Avaliacao }
  >(`/avaliacoes/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      ativo,
    }),
  });

  if (
    dados &&
    typeof dados === "object" &&
    "avaliacao" in dados
  ) {
    return dados.avaliacao;
  }

  return dados as Avaliacao;
}

// -----------------------------------------------------
// EXCLUIR AVALIAÇÃO
// DELETE /api/avaliacoes/:id
// -----------------------------------------------------

export async function excluirAvaliacao(
  id: number
): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID da avaliação inválido.");
  }

  await apiFetch<void>(`/avaliacoes/${id}`, {
    method: "DELETE",
  });
}

// =====================================================
// STATUS DA API
// =====================================================

// GET /api/status

export async function getApiStatus(): Promise<{
  success: boolean;
  message: string;
  database: string;
}> {
  return apiFetch("/status");
}

// =====================================================
// EXPORT DEFAULT
// =====================================================

const api = {
  getApiUrl,
  getImagemUrl,
  getProdutos,
  getProdutoById,
  criarProduto,
  atualizarProduto,
  excluirProduto,
  getCategorias,
  getCategoriaById,
  getAvaliacoes,
  getAvaliacoesByProduto,
  getAvaliacaoById,
  criarAvaliacao,
  atualizarAvaliacao,
  alterarAprovacaoAvaliacao,
  alterarStatusAvaliacao,
  excluirAvaliacao,
  getApiStatus,
};

export default api;