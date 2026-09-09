const express = require("express");

const {
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria,
} = require("../controllers/categoriaController");

const upload = require("../config/upload");

const router = express.Router();

router.get("/", listarCategorias);

router.post(
  "/",
  upload.single("imagem"),
  criarCategoria
);

router.put(
  "/:id",
  upload.single("imagem"),
  atualizarCategoria
);

router.delete("/:id", excluirCategoria);

module.exports = router;