const express = require("express");

const prisma = require("../config/prisma");

const router = express.Router();

// =====================================================
// LISTAR AVALIAÇÕES
// GET /api/avaliacoes
// =====================================================

router.get("/", async (req, res) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      include: {
        produto: {
          select: {
            id: true,
            nome: true,
            imagem: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(avaliacoes);
  } catch (error) {
    console.error("Erro ao listar avaliações:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao listar avaliações.",
    });
  }
});

// =====================================================
// LISTAR AVALIAÇÕES DA LOJA
// GET /api/avaliacoes/loja
// =====================================================

router.get("/loja", async (req, res) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        produtoId: null,
        aprovado: true,
        ativo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(avaliacoes);
  } catch (error) {
    console.error("Erro ao listar avaliações da loja:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao listar avaliações da loja.",
    });
  }
});

// =====================================================
// LISTAR AVALIAÇÕES DE UM PRODUTO
// GET /api/avaliacoes/produto/:produtoId
// =====================================================

router.get("/produto/:produtoId", async (req, res) => {
  try {
    const produtoId = Number(req.params.produtoId);

    if (!Number.isInteger(produtoId)) {
      return res.status(400).json({
        success: false,
        message: "ID do produto inválido.",
      });
    }

    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        produtoId,
        aprovado: true,
        ativo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(avaliacoes);
  } catch (error) {
    console.error("Erro ao listar avaliações do produto:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao listar avaliações do produto.",
    });
  }
});

// =====================================================
// BUSCAR AVALIAÇÃO
// GET /api/avaliacoes/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "ID da avaliação inválido.",
      });
    }

    const avaliacao = await prisma.avaliacao.findUnique({
      where: {
        id,
      },
      include: {
        produto: {
          select: {
            id: true,
            nome: true,
            imagem: true,
          },
        },
      },
    });

    if (!avaliacao) {
      return res.status(404).json({
        success: false,
        message: "Avaliação não encontrada.",
      });
    }

    return res.json(avaliacao);
  } catch (error) {
    console.error("Erro ao buscar avaliação:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar avaliação.",
    });
  }
});

// =====================================================
// CRIAR AVALIAÇÃO
// POST /api/avaliacoes
//
// produtoId preenchido = avaliação de produto
// produtoId null       = avaliação da loja
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      nome,
      email,
      nota,
      comentario,
      produtoId,
    } = req.body;

    // ---------------------------------------------------
    // VALIDAR NOME
    // ---------------------------------------------------

    if (!nome || !String(nome).trim()) {
      return res.status(400).json({
        success: false,
        message: "Informe o nome.",
      });
    }

    // ---------------------------------------------------
    // VALIDAR NOTA
    // ---------------------------------------------------

    const notaNumero = Number(nota);

    if (
      !Number.isInteger(notaNumero) ||
      notaNumero < 1 ||
      notaNumero > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "A nota deve estar entre 1 e 5.",
      });
    }

    // ---------------------------------------------------
    // NORMALIZAR PRODUTO
    // ---------------------------------------------------

    let produtoIdNumero = null;

    if (
      produtoId !== undefined &&
      produtoId !== null &&
      produtoId !== ""
    ) {
      produtoIdNumero = Number(produtoId);

      if (!Number.isInteger(produtoIdNumero)) {
        return res.status(400).json({
          success: false,
          message: "Produto inválido.",
        });
      }

      // -------------------------------------------------
      // VERIFICAR SE O PRODUTO EXISTE
      // -------------------------------------------------

      const produto = await prisma.produto.findUnique({
        where: {
          id: produtoIdNumero,
        },
      });

      if (!produto) {
        return res.status(404).json({
          success: false,
          message: "Produto não encontrado.",
        });
      }
    }

    // ---------------------------------------------------
    // CRIAR AVALIAÇÃO
    // ---------------------------------------------------

    const avaliacao = await prisma.avaliacao.create({
      data: {
        nome: String(nome).trim(),

        email: email
          ? String(email).trim()
          : null,

        nota: notaNumero,

        comentario: comentario
          ? String(comentario).trim()
          : null,

        produtoId: produtoIdNumero,

        // Toda avaliação precisa ser aprovada
        aprovado: false,

        ativo: true,
      },

      include: {
        produto: {
          select: {
            id: true,
            nome: true,
            imagem: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,

      message:
        produtoIdNumero === null
          ? "Avaliação da loja enviada com sucesso e aguardando aprovação."
          : "Avaliação do produto enviada com sucesso e aguardando aprovação.",

      avaliacao,
    });
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao criar avaliação.",
    });
  }
});

// =====================================================
// EDITAR AVALIAÇÃO
// PUT /api/avaliacoes/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "ID da avaliação inválido.",
      });
    }

    const existente = await prisma.avaliacao.findUnique({
      where: {
        id,
      },
    });

    if (!existente) {
      return res.status(404).json({
        success: false,
        message: "Avaliação não encontrada.",
      });
    }

    const {
      nome,
      email,
      nota,
      comentario,
      aprovado,
      ativo,
      produtoId,
    } = req.body;

    const dados = {};

    // ---------------------------------------------------
    // NOME
    // ---------------------------------------------------

    if (nome !== undefined) {
      if (!String(nome).trim()) {
        return res.status(400).json({
          success: false,
          message: "Informe o nome.",
        });
      }

      dados.nome = String(nome).trim();
    }

    // ---------------------------------------------------
    // EMAIL
    // ---------------------------------------------------

    if (email !== undefined) {
      dados.email = email
        ? String(email).trim()
        : null;
    }

    // ---------------------------------------------------
    // NOTA
    // ---------------------------------------------------

    if (nota !== undefined) {
      const notaNumero = Number(nota);

      if (
        !Number.isInteger(notaNumero) ||
        notaNumero < 1 ||
        notaNumero > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "A nota deve estar entre 1 e 5.",
        });
      }

      dados.nota = notaNumero;
    }

    // ---------------------------------------------------
    // COMENTÁRIO
    // ---------------------------------------------------

    if (comentario !== undefined) {
      dados.comentario = comentario
        ? String(comentario).trim()
        : null;
    }

    // ---------------------------------------------------
    // APROVAÇÃO
    // ---------------------------------------------------

    if (aprovado !== undefined) {
      dados.aprovado = Boolean(aprovado);
    }

    // ---------------------------------------------------
    // STATUS
    // ---------------------------------------------------

    if (ativo !== undefined) {
      dados.ativo = Boolean(ativo);
    }

    // ---------------------------------------------------
    // PRODUTO
    // ---------------------------------------------------

    if (produtoId !== undefined) {
      let novoProdutoId = null;

      if (
        produtoId !== null &&
        produtoId !== ""
      ) {
        novoProdutoId = Number(produtoId);

        if (!Number.isInteger(novoProdutoId)) {
          return res.status(400).json({
            success: false,
            message: "Produto inválido.",
          });
        }

        const produto = await prisma.produto.findUnique({
          where: {
            id: novoProdutoId,
          },
        });

        if (!produto) {
          return res.status(404).json({
            success: false,
            message: "Produto não encontrado.",
          });
        }
      }

      dados.produtoId = novoProdutoId;
    }

    // ---------------------------------------------------
    // ATUALIZAR
    // ---------------------------------------------------

    const avaliacao = await prisma.avaliacao.update({
      where: {
        id,
      },

      data: dados,

      include: {
        produto: {
          select: {
            id: true,
            nome: true,
            imagem: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Avaliação atualizada com sucesso.",
      avaliacao,
    });
  } catch (error) {
    console.error("Erro ao atualizar avaliação:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar avaliação.",
    });
  }
});

// =====================================================
// APROVAR / REPROVAR
// PATCH /api/avaliacoes/:id/aprovacao
// =====================================================

router.patch("/:id/aprovacao", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "ID da avaliação inválido.",
      });
    }

    const { aprovado } = req.body;

    if (typeof aprovado !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Informe aprovado como true ou false.",
      });
    }

    const existente = await prisma.avaliacao.findUnique({
      where: {
        id,
      },
    });

    if (!existente) {
      return res.status(404).json({
        success: false,
        message: "Avaliação não encontrada.",
      });
    }

    const avaliacao = await prisma.avaliacao.update({
      where: {
        id,
      },

      data: {
        aprovado,
      },
    });

    return res.json({
      success: true,

      message: aprovado
        ? "Avaliação aprovada com sucesso."
        : "Avaliação reprovada.",

      avaliacao,
    });
  } catch (error) {
    console.error(
      "Erro ao alterar aprovação:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erro ao alterar aprovação.",
    });
  }
});

// =====================================================
// ATIVAR / DESATIVAR
// PATCH /api/avaliacoes/:id/status
// =====================================================

router.patch("/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "ID da avaliação inválido.",
      });
    }

    const { ativo } = req.body;

    if (typeof ativo !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Informe ativo como true ou false.",
      });
    }

    const existente = await prisma.avaliacao.findUnique({
      where: {
        id,
      },
    });

    if (!existente) {
      return res.status(404).json({
        success: false,
        message: "Avaliação não encontrada.",
      });
    }

    const avaliacao = await prisma.avaliacao.update({
      where: {
        id,
      },

      data: {
        ativo,
      },
    });

    return res.json({
      success: true,

      message: ativo
        ? "Avaliação ativada com sucesso."
        : "Avaliação desativada.",

      avaliacao,
    });
  } catch (error) {
    console.error(
      "Erro ao alterar status da avaliação:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erro ao alterar status da avaliação.",
    });
  }
});

// =====================================================
// EXCLUIR AVALIAÇÃO
// DELETE /api/avaliacoes/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "ID da avaliação inválido.",
      });
    }

    const existente = await prisma.avaliacao.findUnique({
      where: {
        id,
      },
    });

    if (!existente) {
      return res.status(404).json({
        success: false,
        message: "Avaliação não encontrada.",
      });
    }

    await prisma.avaliacao.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message: "Avaliação excluída com sucesso.",
    });
  } catch (error) {
    console.error(
      "Erro ao excluir avaliação:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erro ao excluir avaliação.",
    });
  }
});

module.exports = router;