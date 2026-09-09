const express = require("express");

const {
  listarPedidos,
  criarPedido,
  buscarPedidoPorId,
  atualizarStatusPedido,
  atualizarStatusFornecedorItem,
} = require("../controllers/pedidoController");

const router = express.Router();

// =====================================================
// LISTAR PEDIDOS
// =====================================================

router.get("/", listarPedidos);

// =====================================================
// CRIAR PEDIDO
// =====================================================

router.post("/", criarPedido);

// =====================================================
// ATUALIZAR STATUS DO FORNECEDOR DO ITEM
// =====================================================

router.patch(
  "/item/:itemId/fornecedor-status",
  atualizarStatusFornecedorItem
);

// =====================================================
// BUSCAR PEDIDO POR ID
// =====================================================

router.get(
  "/:id",
  buscarPedidoPorId
);

// =====================================================
// ATUALIZAR STATUS DO PEDIDO
// =====================================================

router.patch(
  "/:id/status",
  atualizarStatusPedido
);

module.exports = router;