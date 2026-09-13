const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string | null;
  imagem?: string | null;
  ativo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Fornecedor {
  id: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  site?: string | null;
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
  oferta: boolean;
  categoriaId?: number | null;
  categoria?: Categoria | null;
  fornecedorId?: number | null;
  fornecedor?: Fornecedor | null;
  custoFornecedor?: number | string | null;
  skuFornecedor?: string | null;
  linkFornecedor?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cupom {
  id: number;
  codigo: string;
  tipo: string;
  valor: number | string;
  valorMinimo?: number | string | null;
  validade?: string | null;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Avaliacao {
  id: number;
  nome: string;
  nota: number;
  comentario: string;
  produtoId: number;
  aprovado: boolean;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PedidoItem {
  id: number;
  produtoId: number;
  produto?: Produto | null;
  nomeProduto?: string | null;
  quantidade: number;
  precoUnitario: number | string;
  subtotal?: number | string;
  fornecedorId?: number | null;
  fornecedorNome?: string | null;
  skuFornecedor?: string | null;
  custoFornecedor?: number | string | null;
  linkFornecedor?: string | null;
  statusFornecedor?: string | null;
  numeroPedidoFornecedor?: string | null;
  dataEncaminhamento?: string | null;
  dataPedidoFornecedor?: string | null;
  dataEnvioFornecedor?: string | null;
  dataEntregaFornecedor?: string | null;
}

export interface Pedido {
  id: number;
  nomeCliente: string;
  emailCliente: string;
  telefoneCliente?: string | null;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  subtotal: number | string;
  frete: number | string;
  desconto: number | string;
  total: number | string;
  formaPagamento: string;
  status: string;
  cupomId?: number | null;
  codigoCupom?: string | null;
  itens?: PedidoItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UsuarioAdmin {
  id: number;
  nome?: string | null;
  email: string;
  ativo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Converte valores numéricos vindos da API.
 */
export function converterNumero(
  valor: number | string | null | undefined
): number {
  if (valor === null || valor === undefined || valor === "") {
    return 0;
  }

  const numero =
    typeof valor === "number"
      ? valor
      : Number(String(valor).replace(",", "."));

  return Number.isFinite(numero) ? numero : 0;
}

/**
 * Retorna a URL completa de uma imagem.
 */
export function getImagemUrl(
  imagem: string | null | undefined
): string {
  if (!imagem) {
    return "/imagem/placeholder-produto.png";
  }

  const imagemNormalizada = String(imagem).trim();

  if (!imagemNormalizada) {
    return "/imagem/placeholder-produto.png";
  }

  // URL externa completa
  if (
    imagemNormalizada.startsWith("http://") ||
    imagemNormalizada.startsWith("https://")
  ) {
    return imagemNormalizada;
  }

  // Imagens públicas do frontend
  if (
    imagemNormalizada.startsWith("/imagem/") ||
    imagemNormalizada.startsWith("/images/") ||
    imagemNormalizada.startsWith("/produtos/")
  ) {
    return imagemNormalizada;
  }

  // Uploads armazenados no backend
  if (imagemNormalizada.startsWith("/uploads/")) {
    return `${API_URL}${imagemNormalizada}`;
  }

  // Caso venha apenas o nome do arquivo
  if (!imagemNormalizada.startsWith("/")) {
    return `${API_URL}/uploads/${imagemNormalizada}`;
  }

  return imagemNormalizada;
}

/**
 * Retorna a URL base da API.
 */
export function getApiUrl(): string {
  return API_URL;
}

/**
 * Busca todos os produtos.
 */
export async function getProdutos(): Promise<Produto[]> {
  const response = await fetch(`${API_URL}/api/produtos`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar produtos.");
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.produtos)) {
    return data.produtos;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

/**
 * Busca um produto pelo ID.
 */
export async function getProdutoById(
  id: number | string
): Promise<Produto | null> {
  const response = await fetch(`${API_URL}/api/produtos/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Erro ao buscar produto.");
  }

  const data = await response.json();

  if (data?.produto) {
    return data.produto;
  }

  if (data?.data) {
    return data.data;
  }

  return data;
}

/**
 * Busca todas as categorias.
 */
export async function getCategorias(): Promise<Categoria[]> {
  const url = `${API_URL}/api/categorias`;

  console.log("[API] Buscando categorias:", url);

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar categorias. Status: ${response.status}`
    );
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.categorias)) {
    return data.categorias;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

/**
 * Busca uma categoria pelo ID.
 */
export async function getCategoriaById(
  id: number | string
): Promise<Categoria | null> {
  const response = await fetch(`${API_URL}/api/categorias/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Erro ao buscar categoria.");
  }

  const data = await response.json();

  if (data?.categoria) {
    return data.categoria;
  }

  if (data?.data) {
    return data.data;
  }

  return data;
}

/**
 * Busca fornecedores.
 */
export async function getFornecedores(): Promise<Fornecedor[]> {
  const response = await fetch(`${API_URL}/api/fornecedores`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar fornecedores.");
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.fornecedores)) {
    return data.fornecedores;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

/**
 * Busca pedidos.
 */
export async function getPedidos(): Promise<Pedido[]> {
  const response = await fetch(`${API_URL}/api/pedidos`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar pedidos.");
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.pedidos)) {
    return data.pedidos;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

/**
 * Busca um pedido pelo ID.
 */
export async function getPedidoById(
  id: number | string
): Promise<Pedido | null> {
  const response = await fetch(`${API_URL}/api/pedidos/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Erro ao buscar pedido.");
  }

  const data = await response.json();

  if (data?.pedido) {
    return data.pedido;
  }

  if (data?.data) {
    return data.data;
  }

  return data;
}

/**
 * Busca avaliações de um produto.
 */
export async function getAvaliacoesByProduto(
  produtoId: number | string
): Promise<Avaliacao[]> {
  const response = await fetch(
    `${API_URL}/api/avaliacoes?produtoId=${produtoId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar avaliações.");
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.avaliacoes)) {
    return data.avaliacoes;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

/**
 * Valida um cupom.
 *
 * O backend espera:
 * POST /api/cupons/validar
 * {
 *   codigo,
 *   subtotal
 * }
 */
export async function validarCupom(
  codigo: string,
  subtotal: number
) {
  const response = await fetch(`${API_URL}/api/cupons/validar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      codigo: codigo.trim().toUpperCase(),
      subtotal,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Cupom inválido."
    );
  }

  return data;
}

/**
 * Formata um preço para Real brasileiro.
 */
export function formatarPreco(
  valor: number | string | null | undefined
): string {
  return converterNumero(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Verifica se o produto possui preço promocional válido.
 */
export function temPrecoPromocional(
  produto: Produto
): boolean {
  const preco = converterNumero(produto.preco);
  const precoPromo = converterNumero(produto.precoPromo);

  return precoPromo > 0 && precoPromo < preco;
}

/**
 * Retorna o preço atual do produto.
 */
export function getPrecoAtual(
  produto: Produto
): number {
  if (temPrecoPromocional(produto)) {
    return converterNumero(produto.precoPromo);
  }

  return converterNumero(produto.preco);
}

/**
 * Calcula o percentual de desconto.
 */
export function calcularDescontoProduto(
  produto: Produto
): number {
  const preco = converterNumero(produto.preco);
  const precoPromo = converterNumero(produto.precoPromo);

  if (
    preco <= 0 ||
    precoPromo <= 0 ||
    precoPromo >= preco
  ) {
    return 0;
  }

  return Math.round(
    ((preco - precoPromo) / preco) * 100
  );
}

export { API_URL };