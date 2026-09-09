const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const prisma = require("./config/prisma");

const categoriaRoutes = require("./routes/categoriaRoutes");
const produtoRoutes = require("./routes/produtoRoutes");
const fornecedorRoutes = require("./routes/fornecedorRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cupomRoutes = require("./routes/cupomRoutes");
const avaliacaoRoutes = require("./routes/avaliacaoRoutes");
const relatorioRoutes = require("./routes/relatorioRoutes");

const app = express();

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
  })
);

// =====================================================
// JSON
// =====================================================

app.use(express.json());

// =====================================================
// ARQUIVOS DE UPLOAD
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

// =====================================================
// ROTAS DA API
// =====================================================

app.use(
  "/api/categorias",
  categoriaRoutes
);

app.use(
  "/api/produtos",
  produtoRoutes
);

app.use(
  "/api/fornecedores",
  fornecedorRoutes
);

app.use(
  "/api/pedidos",
  pedidoRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/cupons",
  cupomRoutes
);

app.use(
  "/api/avaliacoes",
  avaliacaoRoutes
);

app.use(
  "/api/relatorios",
  relatorioRoutes
);

// =====================================================
// STATUS DA API
// =====================================================

app.get("/api/status", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.json({
      success: true,
      message: "API Mimo Quatro Patas funcionando!",
      database: "connected",
    });
  } catch (error) {
    console.error(
      "Erro ao conectar ao banco:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "API funcionando, mas o banco não está conectado.",
      database: "disconnected",
    });
  }
});

// =====================================================
// EXPORTAR APP
// =====================================================

module.exports = app;