const prisma = require("../config/prisma");

// Listar fornecedores
async function listarFornecedores(req, res) {
  try {
    const fornecedores = await prisma.fornecedor.findMany({
      where: {
        ativo: true,
      },
      include: {
        _count: {
          select: {
            produtos: true,
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    res.json(fornecedores);
  } catch (error) {
    console.error("Erro ao listar fornecedores:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao listar fornecedores.",
    });
  }
}

// Buscar fornecedor por ID
async function buscarFornecedor(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "ID do fornecedor inválido.",
      });
    }

    const fornecedor = await prisma.fornecedor.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            produtos: true,
          },
        },
      },
    });

    if (!fornecedor) {
      return res.status(404).json({
        success: false,
        message: "Fornecedor não encontrado.",
      });
    }

    res.json(fornecedor);
  } catch (error) {
    console.error("Erro ao buscar fornecedor:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao buscar fornecedor.",
    });
  }
}

// Criar fornecedor
async function criarFornecedor(req, res) {
  try {
    const {
      nome,
      empresa,
      email,
      telefone,
      site,
    } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        success: false,
        message: "O nome do fornecedor é obrigatório.",
      });
    }

    const fornecedor = await prisma.fornecedor.create({
      data: {
        nome: nome.trim(),
        empresa: empresa?.trim() || null,
        email: email?.trim() || null,
        telefone: telefone?.trim() || null,
        site: site?.trim() || null,
      },
      include: {
        _count: {
          select: {
            produtos: true,
          },
        },
      },
    });

    res.status(201).json(fornecedor);
  } catch (error) {
    console.error("=================================");
    console.error("ERRO AO CRIAR FORNECEDOR:");
    console.error(error);
    console.error("=================================");

    res.status(500).json({
      success: false,
      message: "Erro ao criar fornecedor.",
      error: error.message,
    });
  }
}

// Atualizar fornecedor
async function atualizarFornecedor(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "ID do fornecedor inválido.",
      });
    }

    const {
      nome,
      empresa,
      email,
      telefone,
      site,
      ativo,
    } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        success: false,
        message: "O nome do fornecedor é obrigatório.",
      });
    }

    const fornecedorExistente =
      await prisma.fornecedor.findUnique({
        where: {
          id,
        },
      });

    if (!fornecedorExistente) {
      return res.status(404).json({
        success: false,
        message: "Fornecedor não encontrado.",
      });
    }

    const fornecedor = await prisma.fornecedor.update({
      where: {
        id,
      },
      data: {
        nome: nome.trim(),
        empresa: empresa?.trim() || null,
        email: email?.trim() || null,
        telefone: telefone?.trim() || null,
        site: site?.trim() || null,
        ...(typeof ativo === "boolean" && {
          ativo,
        }),
      },
      include: {
        _count: {
          select: {
            produtos: true,
          },
        },
      },
    });

    res.json(fornecedor);
  } catch (error) {
    console.error("=================================");
    console.error("ERRO AO ATUALIZAR FORNECEDOR:");
    console.error(error);
    console.error("=================================");

    res.status(500).json({
      success: false,
      message: "Erro ao atualizar fornecedor.",
      error: error.message,
    });
  }
}

// Excluir fornecedor
async function excluirFornecedor(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "ID do fornecedor inválido.",
      });
    }

    const fornecedorExistente =
      await prisma.fornecedor.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              produtos: true,
            },
          },
        },
      });

    if (!fornecedorExistente) {
      return res.status(404).json({
        success: false,
        message: "Fornecedor não encontrado.",
      });
    }

    const fornecedor = await prisma.fornecedor.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });

    res.json({
      success: true,
      message: "Fornecedor desativado com sucesso.",
      fornecedor,
    });
  } catch (error) {
    console.error("Erro ao excluir fornecedor:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao excluir fornecedor.",
    });
  }
}

module.exports = {
  listarFornecedores,
  buscarFornecedor,
  criarFornecedor,
  atualizarFornecedor,
  excluirFornecedor,
};