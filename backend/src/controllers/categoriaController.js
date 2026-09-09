const prisma = require("../config/prisma");

// ============================================================
// LISTAR CATEGORIAS
// ============================================================

async function listarCategorias(req, res) {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nome: "asc",
      },
    });

    return res.json(categorias);
  } catch (error) {
    console.error("[Categorias] Erro ao listar:", error);

    return res.status(500).json({
      error: "Erro ao listar categorias.",
    });
  }
}

// ============================================================
// CRIAR CATEGORIA
// ============================================================

async function criarCategoria(req, res) {
  try {
    const { nome, descricao } = req.body;

    const nomeNormalizado = nome?.trim();

    if (!nomeNormalizado) {
      return res.status(400).json({
        error: "O nome da categoria é obrigatório.",
      });
    }

    const categoriaExistente = await prisma.categoria.findUnique({
      where: {
        nome: nomeNormalizado,
      },
    });

    if (categoriaExistente) {
      return res.status(409).json({
        error: "Já existe uma categoria com este nome.",
      });
    }

    // Se foi enviada uma imagem, salva o caminho gerado pelo Multer.
    const imagem = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.imagem?.trim() || null;

    const categoria = await prisma.categoria.create({
      data: {
        nome: nomeNormalizado,
        descricao: descricao?.trim() || null,
        imagem,
        ativo: true,
      },
    });

    console.log("[Categorias] Categoria criada:", {
      id: categoria.id,
      nome: categoria.nome,
      imagem: categoria.imagem,
    });

    return res.status(201).json(categoria);
  } catch (error) {
    console.error("[Categorias] Erro ao criar:", error);

    return res.status(500).json({
      error: "Erro ao criar categoria.",
    });
  }
}

// ============================================================
// ATUALIZAR CATEGORIA
// ============================================================

async function atualizarCategoria(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "ID da categoria inválido.",
      });
    }

    const { nome, descricao, ativo } = req.body;

    const nomeNormalizado = nome?.trim();

    if (!nomeNormalizado) {
      return res.status(400).json({
        error: "O nome da categoria é obrigatório.",
      });
    }

    const categoriaAtual = await prisma.categoria.findUnique({
      where: {
        id,
      },
    });

    if (!categoriaAtual) {
      return res.status(404).json({
        error: "Categoria não encontrada.",
      });
    }

    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        nome: nomeNormalizado,
        NOT: {
          id,
        },
      },
    });

    if (categoriaExistente) {
      return res.status(409).json({
        error: "Já existe outra categoria com este nome.",
      });
    }

    const dadosAtualizacao = {
      nome: nomeNormalizado,
      descricao: descricao?.trim() || null,
    };

    if (typeof ativo !== "undefined") {
      dadosAtualizacao.ativo =
        ativo === true ||
        ativo === "true" ||
        ativo === 1 ||
        ativo === "1";
    }

    // Só substitui a imagem quando uma nova imagem foi enviada.
    if (req.file) {
      dadosAtualizacao.imagem = `/uploads/${req.file.filename}`;
    } else if (typeof req.body.imagem !== "undefined") {
      dadosAtualizacao.imagem =
        req.body.imagem?.trim() || null;
    }

    const categoria = await prisma.categoria.update({
      where: {
        id,
      },
      data: dadosAtualizacao,
    });

    console.log("[Categorias] Categoria atualizada:", {
      id: categoria.id,
      nome: categoria.nome,
      imagem: categoria.imagem,
    });

    return res.json(categoria);
  } catch (error) {
    console.error("[Categorias] Erro ao atualizar:", error);

    return res.status(500).json({
      error: "Erro ao atualizar categoria.",
    });
  }
}

// ============================================================
// EXCLUIR CATEGORIA
// ============================================================

async function excluirCategoria(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "ID da categoria inválido.",
      });
    }

    const categoria = await prisma.categoria.findUnique({
      where: {
        id,
      },
      include: {
        produtos: true,
      },
    });

    if (!categoria) {
      return res.status(404).json({
        error: "Categoria não encontrada.",
      });
    }

    if (categoria.produtos.length > 0) {
      return res.status(400).json({
        error:
          "Não é possível excluir esta categoria porque existem produtos vinculados a ela.",
      });
    }

    await prisma.categoria.delete({
      where: {
        id,
      },
    });

    console.log("[Categorias] Categoria excluída:", id);

    return res.json({
      success: true,
      message: "Categoria excluída com sucesso.",
    });
  } catch (error) {
    console.error("[Categorias] Erro ao excluir:", error);

    return res.status(500).json({
      error: "Erro ao excluir categoria.",
    });
  }
}

module.exports = {
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria,
};