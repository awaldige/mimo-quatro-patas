const prisma = require("../config/prisma");

// ======================================================
// LISTAR PRODUTOS
// ======================================================

async function listarProdutos(req, res) {
  try {
    const produtos = await prisma.produto.findMany({
      where: {
        ativo: true,
      },
      include: {
        categoria: true,
        fornecedor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao listar produtos.",
    });
  }
}

// ======================================================
// BUSCAR PRODUTO POR ID
// ======================================================

async function buscarProduto(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID do produto inválido.",
      });
    }

    const produto = await prisma.produto.findUnique({
      where: {
        id,
      },
      include: {
        categoria: true,
        fornecedor: true,
      },
    });

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: "Produto não encontrado.",
      });
    }

    res.json(produto);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao buscar produto.",
    });
  }
}

// ======================================================
// CRIAR PRODUTO
// ======================================================

async function criarProduto(req, res) {
  try {
    const {
      nome,
      descricao,
      preco,
      precoPromo,
      estoque,
      destaque,
      oferta,
      categoriaId,
      fornecedorId,
      skuFornecedor,
      custoFornecedor,
      linkFornecedor,
    } = req.body;

    // --------------------------------------------------
    // VALIDAÇÕES
    // --------------------------------------------------

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        success: false,
        message: "O nome do produto é obrigatório.",
      });
    }

    if (
      preco === undefined ||
      preco === null ||
      preco === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "O preço do produto é obrigatório.",
      });
    }

    const precoNumerico = Number(
      String(preco).replace(",", ".")
    );

    if (
      Number.isNaN(precoNumerico) ||
      precoNumerico < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "O preço informado é inválido.",
      });
    }

    let precoPromoNumerico = null;

    if (
      precoPromo !== undefined &&
      precoPromo !== null &&
      precoPromo !== ""
    ) {
      precoPromoNumerico = Number(
        String(precoPromo).replace(",", ".")
      );

      if (
        Number.isNaN(precoPromoNumerico) ||
        precoPromoNumerico < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "O preço promocional informado é inválido.",
        });
      }
    }

    if (!categoriaId) {
      return res.status(400).json({
        success: false,
        message: "A categoria do produto é obrigatória.",
      });
    }

    const categoriaIdNumerico = Number(categoriaId);

    if (
      !Number.isInteger(categoriaIdNumerico) ||
      categoriaIdNumerico <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Categoria inválida.",
      });
    }

    // --------------------------------------------------
    // FORNECEDOR
    // --------------------------------------------------

    let fornecedorIdNumerico = null;

    if (
      fornecedorId !== undefined &&
      fornecedorId !== null &&
      fornecedorId !== ""
    ) {
      fornecedorIdNumerico = Number(fornecedorId);

      if (
        !Number.isInteger(fornecedorIdNumerico) ||
        fornecedorIdNumerico <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Fornecedor inválido.",
        });
      }
    }

    // --------------------------------------------------
    // ESTOQUE
    // --------------------------------------------------

    const estoqueNumerico =
      estoque !== undefined &&
      estoque !== null &&
      estoque !== ""
        ? Number(estoque)
        : 0;

    if (
      Number.isNaN(estoqueNumerico) ||
      estoqueNumerico < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "O estoque informado é inválido.",
      });
    }

    // --------------------------------------------------
    // SKU DO FORNECEDOR
    // --------------------------------------------------

    const skuFornecedorNormalizado =
      skuFornecedor !== undefined &&
      skuFornecedor !== null &&
      String(skuFornecedor).trim()
        ? String(skuFornecedor).trim()
        : null;

    // --------------------------------------------------
    // CUSTO DO FORNECEDOR
    // --------------------------------------------------

    let custoFornecedorNumerico = null;

    if (
      custoFornecedor !== undefined &&
      custoFornecedor !== null &&
      custoFornecedor !== ""
    ) {
      custoFornecedorNumerico = Number(
        String(custoFornecedor).replace(",", ".")
      );

      if (
        Number.isNaN(custoFornecedorNumerico) ||
        custoFornecedorNumerico < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "O custo do fornecedor informado é inválido.",
        });
      }
    }

    // --------------------------------------------------
    // LINK DO FORNECEDOR
    // --------------------------------------------------

    const linkFornecedorNormalizado =
      linkFornecedor !== undefined &&
      linkFornecedor !== null &&
      String(linkFornecedor).trim()
        ? String(linkFornecedor).trim()
        : null;

    // --------------------------------------------------
    // IMAGEM
    // --------------------------------------------------

    const imagem = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    // --------------------------------------------------
    // CRIAÇÃO
    // --------------------------------------------------

    const produto = await prisma.produto.create({
      data: {
        nome: nome.trim(),

        descricao:
          descricao && descricao.trim()
            ? descricao.trim()
            : null,

        preco: precoNumerico,

        precoPromo:
          precoPromoNumerico !== null
            ? precoPromoNumerico
            : null,

        imagem,

        estoque: estoqueNumerico,

        destaque:
          destaque === true ||
          destaque === "true",

        oferta:
          oferta === true ||
          oferta === "true",

        skuFornecedor:
          skuFornecedorNormalizado,

        custoFornecedor:
          custoFornecedorNumerico,

        linkFornecedor:
          linkFornecedorNormalizado,

        categoria: {
          connect: {
            id: categoriaIdNumerico,
          },
        },

        ...(fornecedorIdNumerico
          ? {
              fornecedor: {
                connect: {
                  id: fornecedorIdNumerico,
                },
              },
            }
          : {}),
      },

      include: {
        categoria: true,
        fornecedor: true,
      },
    });

    res.status(201).json(produto);
  } catch (error) {
    console.error("Erro ao criar produto:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao criar produto.",
      error: error.message,
    });
  }
}

// ======================================================
// ATUALIZAR PRODUTO
// ======================================================

async function atualizarProduto(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID do produto inválido.",
      });
    }

    const {
      nome,
      descricao,
      preco,
      precoPromo,
      estoque,
      destaque,
      oferta,
      ativo,
      categoriaId,
      fornecedorId,
      skuFornecedor,
      custoFornecedor,
      linkFornecedor,
    } = req.body;

    const dados = {};

    // --------------------------------------------------
    // NOME
    // --------------------------------------------------

    if (nome !== undefined) {
      if (!nome.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "O nome do produto não pode ficar vazio.",
        });
      }

      dados.nome = nome.trim();
    }

    // --------------------------------------------------
    // DESCRIÇÃO
    // --------------------------------------------------

    if (descricao !== undefined) {
      dados.descricao =
        descricao && descricao.trim()
          ? descricao.trim()
          : null;
    }

    // --------------------------------------------------
    // PREÇO
    // --------------------------------------------------

    if (preco !== undefined) {
      const precoNumerico = Number(
        String(preco).replace(",", ".")
      );

      if (
        Number.isNaN(precoNumerico) ||
        precoNumerico < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "O preço informado é inválido.",
        });
      }

      dados.preco = precoNumerico;
    }

    // --------------------------------------------------
    // PREÇO PROMOCIONAL
    // --------------------------------------------------

    if (precoPromo !== undefined) {
      if (
        precoPromo === null ||
        precoPromo === ""
      ) {
        dados.precoPromo = null;
      } else {
        const precoPromoNumerico = Number(
          String(precoPromo).replace(",", ".")
        );

        if (
          Number.isNaN(precoPromoNumerico) ||
          precoPromoNumerico < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "O preço promocional informado é inválido.",
          });
        }

        dados.precoPromo = precoPromoNumerico;
      }
    }

    // --------------------------------------------------
    // ESTOQUE
    // --------------------------------------------------

    if (estoque !== undefined) {
      const estoqueNumerico = Number(estoque);

      if (
        Number.isNaN(estoqueNumerico) ||
        estoqueNumerico < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "O estoque informado é inválido.",
        });
      }

      dados.estoque = estoqueNumerico;
    }

    // --------------------------------------------------
    // DESTAQUE
    // --------------------------------------------------

    if (destaque !== undefined) {
      dados.destaque =
        destaque === true ||
        destaque === "true";
    }

    // --------------------------------------------------
    // OFERTA
    // --------------------------------------------------

    if (oferta !== undefined) {
      dados.oferta =
        oferta === true ||
        oferta === "true";
    }

    // --------------------------------------------------
    // STATUS
    // --------------------------------------------------

    if (ativo !== undefined) {
      dados.ativo =
        ativo === true ||
        ativo === "true";
    }

    // --------------------------------------------------
    // IMAGEM
    // --------------------------------------------------

    if (req.file) {
      dados.imagem =
        `/uploads/${req.file.filename}`;
    }

    // --------------------------------------------------
    // CATEGORIA
    // --------------------------------------------------

    if (categoriaId !== undefined) {
      const categoriaIdNumerico =
        Number(categoriaId);

      if (
        !Number.isInteger(categoriaIdNumerico) ||
        categoriaIdNumerico <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Categoria inválida.",
        });
      }

      dados.categoria = {
        connect: {
          id: categoriaIdNumerico,
        },
      };
    }

    // --------------------------------------------------
    // FORNECEDOR
    // --------------------------------------------------

    if (fornecedorId !== undefined) {
      if (
        fornecedorId === null ||
        fornecedorId === ""
      ) {
        dados.fornecedor = {
          disconnect: true,
        };
      } else {
        const fornecedorIdNumerico =
          Number(fornecedorId);

        if (
          !Number.isInteger(fornecedorIdNumerico) ||
          fornecedorIdNumerico <= 0
        ) {
          return res.status(400).json({
            success: false,
            message: "Fornecedor inválido.",
          });
        }

        dados.fornecedor = {
          connect: {
            id: fornecedorIdNumerico,
          },
        };
      }
    }

    // --------------------------------------------------
    // SKU DO FORNECEDOR
    // --------------------------------------------------

    if (skuFornecedor !== undefined) {
      dados.skuFornecedor =
        skuFornecedor !== null &&
        String(skuFornecedor).trim()
          ? String(skuFornecedor).trim()
          : null;
    }

    // --------------------------------------------------
    // CUSTO DO FORNECEDOR
    // --------------------------------------------------

    if (custoFornecedor !== undefined) {
      if (
        custoFornecedor === null ||
        custoFornecedor === ""
      ) {
        dados.custoFornecedor = null;
      } else {
        const custoFornecedorNumerico =
          Number(
            String(custoFornecedor).replace(",", ".")
          );

        if (
          Number.isNaN(custoFornecedorNumerico) ||
          custoFornecedorNumerico < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "O custo do fornecedor informado é inválido.",
          });
        }

        dados.custoFornecedor =
          custoFornecedorNumerico;
      }
    }

    // --------------------------------------------------
    // LINK DO FORNECEDOR
    // --------------------------------------------------

    if (linkFornecedor !== undefined) {
      dados.linkFornecedor =
        linkFornecedor !== null &&
        String(linkFornecedor).trim()
          ? String(linkFornecedor).trim()
          : null;
    }

    // --------------------------------------------------
    // ATUALIZAÇÃO
    // --------------------------------------------------

    const produto = await prisma.produto.update({
      where: {
        id,
      },

      data: dados,

      include: {
        categoria: true,
        fornecedor: true,
      },
    });

    res.json(produto);
  } catch (error) {
    console.error(
      "Erro ao atualizar produto:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Erro ao atualizar produto.",
      error: error.message,
    });
  }
}

// ======================================================
// EXCLUIR PRODUTO
// ======================================================

async function excluirProduto(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID do produto inválido.",
      });
    }

    // --------------------------------------------------
    // EXCLUSÃO LÓGICA
    // --------------------------------------------------

    const produto = await prisma.produto.update({
      where: {
        id,
      },

      data: {
        ativo: false,
      },
    });

    res.json({
      success: true,
      message: "Produto desativado com sucesso.",
      produto,
    });
  } catch (error) {
    console.error(
      "Erro ao excluir produto:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Erro ao desativar produto.",
    });
  }
}

// ======================================================
// EXPORTAÇÕES
// ======================================================

module.exports = {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  excluirProduto,
};