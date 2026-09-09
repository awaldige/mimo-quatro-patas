const express = require("express");

const {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  excluirProduto,
} = require("../controllers/produtoController");

const prisma = require("../config/prisma");
const upload = require("../config/upload");

const router = express.Router();

// ========================================
// PRODUTOS
// ========================================

// ========================================
// Produtos mais vendidos
// GET /api/produtos/mais-vendidos
// ========================================

router.get("/mais-vendidos", async (req, res) => {
  try {
    const limiteSolicitado = Number(req.query.limite) || 6;

    const limite = Math.min(
      Math.max(limiteSolicitado, 1),
      20
    );

    // Busca os produtos que mais foram vendidos,
    // considerando pedidos que não foram cancelados.
    const itensVendidos = await prisma.pedidoItem.groupBy({
      by: ["produtoId"],

      where: {
        pedido: {
          status: {
            not: "CANCELADO",
          },
        },
      },

      _sum: {
        quantidade: true,
      },

      orderBy: {
        _sum: {
          quantidade: "desc",
        },
      },

      take: limite,
    });

    // Nenhuma venda registrada
    if (itensVendidos.length === 0) {
      return res.json([]);
    }

    // IDs dos produtos encontrados no ranking
    const produtoIds = itensVendidos.map(
      (item) => item.produtoId
    );

    // Busca os dados atuais dos produtos
    const produtos = await prisma.produto.findMany({
      where: {
        id: {
          in: produtoIds,
        },
        ativo: true,
      },

      include: {
        categoria: true,
      },
    });

    // Monta o ranking mantendo a ordem
    // definida pela quantidade vendida.
    const ranking = itensVendidos
      .map((item) => {
        const produto = produtos.find(
          (produto) => produto.id === item.produtoId
        );

        if (!produto) {
          return null;
        }

        return {
          ...produto,
          quantidadeVendida:
            item._sum.quantidade || 0,
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          b.quantidadeVendida -
          a.quantidadeVendida
      );

    return res.json(ranking);
  } catch (error) {
    console.error(
      "Erro ao buscar produtos mais vendidos:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Erro ao carregar produtos mais vendidos.",
    });
  }
});

// ========================================
// Listar produtos
// GET /api/produtos
// ========================================

router.get("/", listarProdutos);

// ========================================
// Buscar produto por ID
// GET /api/produtos/:id
// ========================================

router.get("/:id", buscarProduto);

// ========================================
// Criar produto com imagem
// POST /api/produtos
// ========================================

router.post(
  "/",
  upload.single("imagem"),
  criarProduto
);

// ========================================
// Atualizar produto com imagem
// PUT /api/produtos/:id
// ========================================

router.put(
  "/:id",
  upload.single("imagem"),
  atualizarProduto
);

// ========================================
// Desativar produto
// DELETE /api/produtos/:id
// ========================================

router.delete(
  "/:id",
  excluirProduto
);

// ========================================
// EXPORTAÇÃO
// ========================================

module.exports = router;