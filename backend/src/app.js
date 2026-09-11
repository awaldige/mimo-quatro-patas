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

const origensPermitidas = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://mimo-quatro-patas.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requisições sem Origin, como testes diretos,
      // ferramentas do backend e algumas requisições do servidor.
      if (!origin) {
        return callback(null, true);
      }

      if (origensPermitidas.includes(origin)) {
        return callback(null, true);
      }

      console.warn("Origem bloqueada pelo CORS:", origin);

      return callback(
        new Error("Origem não autorizada pelo CORS.")
      );
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
    ],
    credentials: false,
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
// TRATAMENTO DE ERROS
// =====================================================

app.use((error, req, res, next) => {
  console.error(
    "Erro na API:",
    error
  );

  if (
    error.message ===
    "Origem não autorizada pelo CORS."
  ) {
    return res.status(403).json({
      success: false,
      message: "Origem não autorizada.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Erro interno do servidor.",
  });
});

// =====================================================
// EXPORTAR APP
// =====================================================

module.exports = app;