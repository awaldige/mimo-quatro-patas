const express = require("express");

const {
  obterRelatorios,
} = require("../controllers/relatorioController");

const router = express.Router();

router.get("/", obterRelatorios);

module.exports = router;