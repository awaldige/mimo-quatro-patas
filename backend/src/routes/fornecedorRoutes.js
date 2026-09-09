const express = require("express");

const {
  listarFornecedores,
  buscarFornecedor,
  criarFornecedor,
  atualizarFornecedor,
  excluirFornecedor,
} = require("../controllers/fornecedorController");

const router = express.Router();

router.get("/", listarFornecedores);

router.get("/:id", buscarFornecedor);

router.post("/", criarFornecedor);

router.put("/:id", atualizarFornecedor);

router.delete("/:id", excluirFornecedor);

module.exports = router;