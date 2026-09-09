
const prisma = require("../config/prisma");

// =====================================================
// HELPERS
// =====================================================

function normalizarCodigo(codigo) {
  return String(codigo || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function converterNumero(valor) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return null;
  }

  const numero = Number(
    String(valor).replace(",", ".")
  );

  return Number.isFinite(numero)
    ? numero
    : null;
}

function converterBooleano(valor, padrao = true) {
  if (valor === undefined || valor === null) {
    return padrao;
  }

  if (typeof valor === "boolean") {
    return valor;
  }

  if (typeof valor === "string") {
    return valor.toLowerCase() === "true";
  }

  return Boolean(valor);
}

function converterData(valor) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return null;
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return data;
}

function validarTipo(tipo) {
  const tipoNormalizado = String(tipo || "")
    .trim()
    .toUpperCase();

  if (
    !["PERCENTUAL", "FIXO"].includes(
      tipoNormalizado
    )
  ) {
    return null;
  }

  return tipoNormalizado;
}

// =====================================================
// LISTAR CUPONS
// =====================================================

async function listarCupons(req, res) {
  try {
    const cupons = await prisma.cupom.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            pedidos: true,
          },
        },
      },
    });

    return res.json(cupons);
  } catch (error) {
    console.error(
      "[cupons] Erro ao listar:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erro ao listar cupons.",
    });
  }
}

// =====================================================
// BUSCAR CUPOM POR ID
// =====================================================

async function buscarCupom(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID do cupom inválido.",
      });
    }

    const cupom = await prisma.cupom.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            pedidos: true,
          },
        },
      },
    });

    if (!cupom) {
      return res.status(404).json({
        success: false,
        message: "Cupom não encontrado.",
      });
    }

    return res.json(cupom);
  } catch (error) {
    console.error(
      "[cupons] Erro ao buscar:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar cupom.",
    });
  }
}

// =====================================================
// CRIAR CUPOM
// =====================================================

async function criarCupom(req, res) {
  try {
    const {
      codigo,
      tipo,
      valor,
      valorMinimo,
      validade,
      ativo,
    } = req.body;

    // -------------------------------------------------
    // CÓDIGO
    // -------------------------------------------------

    const codigoNormalizado =
      normalizarCodigo(codigo);

    if (!codigoNormalizado) {
      return res.status(400).json({
        success: false,
        message:
          "O código do cupom é obrigatório.",
      });
    }

    if (codigoNormalizado.length < 3) {
      return res.status(400).json({
        success: false,
        message:
          "O código deve ter pelo menos 3 caracteres.",
      });
    }

    if (codigoNormalizado.length > 30) {
      return res.status(400).json({
        success: false,
        message:
          "O código pode ter no máximo 30 caracteres.",
      });
    }

    // -------------------------------------------------
    // TIPO
    // -------------------------------------------------

    const tipoNormalizado =
      validarTipo(tipo);

    if (!tipoNormalizado) {
      return res.status(400).json({
        success: false,
        message:
          "O tipo do cupom deve ser PERCENTUAL ou FIXO.",
      });
    }

    // -------------------------------------------------
    // VALOR
    // -------------------------------------------------

    const valorNumerico =
      converterNumero(valor);

    if (
      valorNumerico === null ||
      valorNumerico <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "O valor do cupom deve ser maior que zero.",
      });
    }

    if (
      tipoNormalizado === "PERCENTUAL" &&
      valorNumerico > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "O desconto percentual não pode ser maior que 100%.",
      });
    }

    // -------------------------------------------------
    // VALOR MÍNIMO
    // -------------------------------------------------

    let valorMinimoNumerico = null;

    if (
      valorMinimo !== undefined &&
      valorMinimo !== null &&
      valorMinimo !== ""
    ) {
      valorMinimoNumerico =
        converterNumero(valorMinimo);

      if (
        valorMinimoNumerico === null ||
        valorMinimoNumerico < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "O valor mínimo deve ser um número válido.",
        });
      }
    }

    // -------------------------------------------------
    // VALIDADE
    // -------------------------------------------------

    let validadeData = null;

    if (validade) {
      validadeData = converterData(validade);

      if (!validadeData) {
        return res.status(400).json({
          success: false,
          message:
            "A data de validade é inválida.",
        });
      }
    }

    // -------------------------------------------------
    // VERIFICAR CÓDIGO EXISTENTE
    // -------------------------------------------------

    const cupomExistente =
      await prisma.cupom.findUnique({
        where: {
          codigo: codigoNormalizado,
        },
      });

    if (cupomExistente) {
      return res.status(409).json({
        success: false,
        message:
          "Já existe um cupom com esse código.",
      });
    }

    // -------------------------------------------------
    // CRIAR CUPOM
    // -------------------------------------------------

    const cupom =
      await prisma.cupom.create({
        data: {
          codigo: codigoNormalizado,
          tipo: tipoNormalizado,
          valor: valorNumerico,
          valorMinimo: valorMinimoNumerico,
          validade: validadeData,
          ativo: converterBooleano(
            ativo,
            true
          ),
        },
      });

    return res.status(201).json({
      success: true,
      message: "Cupom criado com sucesso.",
      cupom,
    });
  } catch (error) {
    console.error(
      "[cupons] Erro ao criar:",
      error
    );

    // Prisma Unique Constraint
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "Já existe um cupom com esse código.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erro ao criar cupom.",
    });
  }
}

// =====================================================
// ATUALIZAR CUPOM
// =====================================================

async function atualizarCupom(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID do cupom inválido.",
      });
    }

    const {
      codigo,
      tipo,
      valor,
      valorMinimo,
      validade,
      ativo,
    } = req.body;

    // -------------------------------------------------
    // VERIFICAR CUPOM
    // -------------------------------------------------

    const cupomExistente =
      await prisma.cupom.findUnique({
        where: {
          id,
        },
      });

    if (!cupomExistente) {
      return res.status(404).json({
        success: false,
        message: "Cupom não encontrado.",
      });
    }

    const dados = {};

    // -------------------------------------------------
    // CÓDIGO
    // -------------------------------------------------

    if (codigo !== undefined) {
      const codigoNormalizado =
        normalizarCodigo(codigo);

      if (!codigoNormalizado) {
        return res.status(400).json({
          success: false,
          message:
            "O código do cupom não pode ficar vazio.",
        });
      }

      if (codigoNormalizado.length < 3) {
        return res.status(400).json({
          success: false,
          message:
            "O código deve ter pelo menos 3 caracteres.",
        });
      }

      if (codigoNormalizado.length > 30) {
        return res.status(400).json({
          success: false,
          message:
            "O código pode ter no máximo 30 caracteres.",
        });
      }

      const outroCupom =
        await prisma.cupom.findFirst({
          where: {
            codigo: codigoNormalizado,
            NOT: {
              id,
            },
          },
        });

      if (outroCupom) {
        return res.status(409).json({
          success: false,
          message:
            "Já existe outro cupom com esse código.",
        });
      }

      dados.codigo = codigoNormalizado;
    }

    // -------------------------------------------------
    // TIPO
    // -------------------------------------------------

    if (tipo !== undefined) {
      const tipoNormalizado =
        validarTipo(tipo);

      if (!tipoNormalizado) {
        return res.status(400).json({
          success: false,
          message:
            "O tipo do cupom deve ser PERCENTUAL ou FIXO.",
        });
      }

      dados.tipo = tipoNormalizado;
    }

    // -------------------------------------------------
    // VALOR
    // -------------------------------------------------

    if (
      valor !== undefined &&
      valor !== null &&
      valor !== ""
    ) {
      const valorNumerico =
        converterNumero(valor);

      if (
        valorNumerico === null ||
        valorNumerico <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "O valor do cupom deve ser maior que zero.",
        });
      }

      const tipoAtual =
        dados.tipo ||
        cupomExistente.tipo;

      if (
        tipoAtual === "PERCENTUAL" &&
        valorNumerico > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "O desconto percentual não pode ser maior que 100%.",
        });
      }

      dados.valor = valorNumerico;
    }

    // -------------------------------------------------
    // VALIDAR TIPO + VALOR EXISTENTE
    // -------------------------------------------------

    if (
      dados.tipo === "PERCENTUAL" &&
      dados.valor === undefined &&
      Number(cupomExistente.valor) > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "O desconto percentual não pode ser maior que 100%.",
      });
    }

    // -------------------------------------------------
    // VALOR MÍNIMO
    // -------------------------------------------------

    if (valorMinimo !== undefined) {
      if (
        valorMinimo === null ||
        valorMinimo === ""
      ) {
        dados.valorMinimo = null;
      } else {
        const valorMinimoNumerico =
          converterNumero(valorMinimo);

        if (
          valorMinimoNumerico === null ||
          valorMinimoNumerico < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "O valor mínimo deve ser um número válido.",
          });
        }

        dados.valorMinimo =
          valorMinimoNumerico;
      }
    }

    // -------------------------------------------------
    // VALIDADE
    // -------------------------------------------------

    if (validade !== undefined) {
      if (
        validade === null ||
        validade === ""
      ) {
        dados.validade = null;
      } else {
        const validadeData =
          converterData(validade);

        if (!validadeData) {
          return res.status(400).json({
            success: false,
            message:
              "A data de validade é inválida.",
          });
        }

        dados.validade = validadeData;
      }
    }

    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------

    if (ativo !== undefined) {
      dados.ativo =
        converterBooleano(
          ativo,
          cupomExistente.ativo
        );
    }

    // -------------------------------------------------
    // ATUALIZAR
    // -------------------------------------------------

    const cupom =
      await prisma.cupom.update({
        where: {
          id,
        },
        data: dados,
      });

    return res.json({
      success: true,
      message:
        "Cupom atualizado com sucesso.",
      cupom,
    });
  } catch (error) {
    console.error(
      "[cupons] Erro ao atualizar:",
      error
    );

    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "Já existe outro cupom com esse código.",
      });
    }

    if (error?.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Cupom não encontrado.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Erro ao atualizar cupom.",
    });
  }
}

// =====================================================
// ATIVAR / DESATIVAR CUPOM
// =====================================================

async function alterarStatusCupom(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID do cupom inválido.",
      });
    }

    const cupom =
      await prisma.cupom.findUnique({
        where: {
          id,
        },
      });

    if (!cupom) {
      return res.status(404).json({
        success: false,
        message: "Cupom não encontrado.",
      });
    }

    // -------------------------------------------------
    // Se o frontend enviar "ativo", respeitar o valor.
    // Caso contrário, alternar automaticamente.
    // -------------------------------------------------

    let novoStatus;

    if (req.body?.ativo !== undefined) {
      novoStatus = converterBooleano(
        req.body.ativo,
        cupom.ativo
      );
    } else {
      novoStatus = !cupom.ativo;
    }

    const cupomAtualizado =
      await prisma.cupom.update({
        where: {
          id,
        },
        data: {
          ativo: novoStatus,
        },
      });

    return res.json({
      success: true,
      message: cupomAtualizado.ativo
        ? "Cupom ativado com sucesso."
        : "Cupom desativado com sucesso.",
      cupom: cupomAtualizado,
    });
  } catch (error) {
    console.error(
      "[cupons] Erro ao alterar status:",
      error
    );

    if (error?.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Cupom não encontrado.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Erro ao alterar status do cupom.",
    });
  }
}

// =====================================================
// EXCLUIR CUPOM
// =====================================================

async function excluirCupom(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID do cupom inválido.",
      });
    }

    const cupom =
      await prisma.cupom.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              pedidos: true,
            },
          },
        },
      });

    if (!cupom) {
      return res.status(404).json({
        success: false,
        message: "Cupom não encontrado.",
      });
    }

    // -------------------------------------------------
    // CUPOM JÁ UTILIZADO
    // -------------------------------------------------

    if (cupom._count.pedidos > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Este cupom já foi utilizado em pedidos e não pode ser excluído. Desative o cupom em vez disso.",
      });
    }

    await prisma.cupom.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message:
        "Cupom excluído com sucesso.",
    });
  } catch (error) {
    console.error(
      "[cupons] Erro ao excluir:",
      error
    );

    if (error?.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Cupom não encontrado.",
      });
    }

    if (error?.code === "P2003") {
      return res.status(400).json({
        success: false,
        message:
          "Este cupom possui registros relacionados e não pode ser excluído.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Erro ao excluir cupom.",
    });
  }
}

// =====================================================
// VALIDAR CUPOM
// =====================================================

async function validarCupom(req, res) {
  try {
    const {
      codigo,
      subtotal,
    } = req.body;

    // -------------------------------------------------
    // CÓDIGO
    // -------------------------------------------------

    const codigoNormalizado =
      normalizarCodigo(codigo);

    if (!codigoNormalizado) {
      return res.status(400).json({
        success: false,
        message:
          "Informe o código do cupom.",
      });
    }

    // -------------------------------------------------
    // BUSCAR
    // -------------------------------------------------

    const cupom =
      await prisma.cupom.findUnique({
        where: {
          codigo: codigoNormalizado,
        },
      });

    if (!cupom) {
      return res.status(404).json({
        success: false,
        message:
          "Cupom não encontrado.",
      });
    }

    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------

    if (!cupom.ativo) {
      return res.status(400).json({
        success: false,
        message:
          "Este cupom está inativo.",
      });
    }

    // -------------------------------------------------
    // VALIDADE
    // -------------------------------------------------

    if (
      cupom.validade &&
      new Date(cupom.validade).getTime() <=
        Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Este cupom está expirado.",
      });
    }

    // -------------------------------------------------
    // SUBTOTAL
    // -------------------------------------------------

    const subtotalNumerico =
      converterNumero(subtotal);

    if (
      subtotalNumerico === null ||
      subtotalNumerico < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Subtotal inválido.",
      });
    }

    // -------------------------------------------------
    // VALOR MÍNIMO
    // -------------------------------------------------

    if (
      cupom.valorMinimo !== null &&
      subtotalNumerico <
        Number(cupom.valorMinimo)
    ) {
      return res.status(400).json({
        success: false,
        message: `Este cupom exige um pedido mínimo de R$ ${Number(
          cupom.valorMinimo
        )
          .toFixed(2)
          .replace(".", ",")}.`,
      });
    }

    // -------------------------------------------------
    // CALCULAR DESCONTO
    // -------------------------------------------------

    let desconto = 0;

    if (cupom.tipo === "PERCENTUAL") {
      desconto =
        subtotalNumerico *
        (Number(cupom.valor) / 100);
    }

    if (cupom.tipo === "FIXO") {
      desconto = Number(cupom.valor);
    }

    // Nunca permitir desconto maior
    // que o próprio subtotal.

    desconto = Math.min(
      desconto,
      subtotalNumerico
    );

    const total =
      subtotalNumerico - desconto;

    // -------------------------------------------------
    // RESPOSTA
    // -------------------------------------------------

    return res.json({
      success: true,

      cupom: {
        id: cupom.id,
        codigo: cupom.codigo,
        tipo: cupom.tipo,
        valor: Number(cupom.valor),
        valorMinimo:
          cupom.valorMinimo !== null
            ? Number(cupom.valorMinimo)
            : null,
        validade: cupom.validade,
        ativo: cupom.ativo,
      },

      subtotal: Number(
        subtotalNumerico.toFixed(2)
      ),

      desconto: Number(
        desconto.toFixed(2)
      ),

      total: Number(
        total.toFixed(2)
      ),
    });
  } catch (error) {
    console.error(
      "[cupons] Erro ao validar:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Erro ao validar cupom.",
    });
  }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  listarCupons,
  buscarCupom,
  criarCupom,
  atualizarCupom,
  alterarStatusCupom,
  excluirCupom,
  validarCupom,
};

