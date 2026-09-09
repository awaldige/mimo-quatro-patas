
const express = require("express");

const {
  listarCupons,
  buscarCupom,
  criarCupom,
  atualizarCupom,
  alterarStatusCupom,
  excluirCupom,
  validarCupom,
} = require("../controllers/cupomController");

const router = express.Router();

// =====================================================
// VALIDAR CUPOM
// POST /api/cupons/validar
// =====================================================

router.post("/validar", validarCupom);

// =====================================================
// LISTAR CUPONS
// GET /api/cupons
// =====================================================

router.get("/", listarCupons);

// =====================================================
// BUSCAR CUPOM POR ID
// GET /api/cupons/:id
// =====================================================

router.get("/:id", buscarCupom);

// =====================================================
// CRIAR CUPOM
// POST /api/cupons
// =====================================================

router.post("/", criarCupom);

// =====================================================
// ATUALIZAR CUPOM
// PUT /api/cupons/:id
// =====================================================

router.put("/:id", atualizarCupom);

// =====================================================
// ATIVAR / DESATIVAR CUPOM
// PATCH /api/cupons/:id/status
// =====================================================

router.patch("/:id/status", alterarStatusCupom);

// =====================================================
// EXCLUIR CUPOM
// DELETE /api/cupons/:id
// =====================================================

router.delete("/:id", excluirCupom);

module.exports = router;

