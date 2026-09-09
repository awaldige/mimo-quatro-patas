const prisma = require("../config/prisma");

// =====================================================
// CONFIGURAÇÕES DO PEDIDO
// =====================================================

const VALOR_MINIMO_FRETE_GRATIS = 100;

const STATUS_PERMITIDOS = [
  "PENDENTE",
  "PAGO",
  "PROCESSANDO",
  "ENVIADO",
  "ENTREGUE",
  "CANCELADO",
];

const STATUS_FORNECEDOR_PERMITIDOS = [
  "AGUARDANDO_FORNECEDOR",
  "ENCAMINHADO_FORNECEDOR",
  "PEDIDO_FORNECEDOR_REALIZADO",
  "AGUARDANDO_ENVIO",
  "ENVIADO",
  "ENTREGUE",
];

const PAGAMENTOS_PERMITIDOS = [
  "PIX",
  "CARTAO",
  "BOLETO",
];

// =====================================================
// CALCULAR FRETE PELO CEP
// =====================================================

function calcularFretePorCep(cep, subtotal) {
  // Frete grátis acima do valor mínimo
  if (subtotal >= VALOR_MINIMO_FRETE_GRATIS) {
    return 0;
  }

  const cepNumerico = String(cep).replace(/\D/g, "");

  if (cepNumerico.length !== 8) {
    throw new Error("CEP inválido.");
  }

  const primeiroDigito = Number(
    cepNumerico.charAt(0)
  );

  if (primeiroDigito === 0 || primeiroDigito === 1) {
    return 9.9;
  }

  if (primeiroDigito === 2 || primeiroDigito === 3) {
    return 14.9;
  }

  if (primeiroDigito === 4 || primeiroDigito === 5) {
    return 19.9;
  }

  if (primeiroDigito === 6 || primeiroDigito === 7) {
    return 24.9;
  }

  return 29.9;
}

// =====================================================
// LISTAR PEDIDOS
// =====================================================

async function listarPedidos(req, res) {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cupom: true,

        itens: {
          include: {
            produto: true,
            fornecedor: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      pedidos,
    });
  } catch (error) {
    console.error("ERRO AO LISTAR PEDIDOS:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao listar pedidos.",
      error: error.message,
    });
  }
}

// =====================================================
// CRIAR PEDIDO
// =====================================================

async function criarPedido(req, res) {
  try {
    const {
      nomeCliente,
      email,
      telefone,
      cep,
      estado,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      pagamento,
      cupomId,
      codigoCupom,
      itens,
    } = req.body;

    // ===================================================
    // VALIDAÇÃO DOS DADOS OBRIGATÓRIOS
    // ===================================================

    if (
      !nomeCliente ||
      !email ||
      !telefone ||
      !cep ||
      !estado ||
      !endereco ||
      !numero ||
      !bairro ||
      !cidade ||
      !pagamento
    ) {
      return res.status(400).json({
        success: false,
        message: "Preencha todos os dados obrigatórios.",
      });
    }

    // ===================================================
    // VALIDAR CEP
    // ===================================================

    const cepNormalizado = String(cep).replace(/\D/g, "");

    if (cepNormalizado.length !== 8) {
      return res.status(400).json({
        success: false,
        message:
          "CEP inválido. Informe um CEP com 8 dígitos.",
      });
    }

    // ===================================================
    // VALIDAR ITENS
    // ===================================================

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "O pedido precisa ter pelo menos um produto.",
      });
    }

    // ===================================================
    // PAGAMENTO
    // ===================================================

    const pagamentoNormalizado = String(pagamento)
      .trim()
      .toUpperCase();

    if (
      !PAGAMENTOS_PERMITIDOS.includes(
        pagamentoNormalizado
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Forma de pagamento inválida.",
      });
    }

    // ===================================================
    // NORMALIZAR ITENS
    // ===================================================

    const itensNormalizados = itens.map((item) => ({
      produtoId: Number(item.produtoId),
      quantidade: Number(item.quantidade),
    }));

    for (const item of itensNormalizados) {
      if (
        !Number.isInteger(item.produtoId) ||
        !Number.isInteger(item.quantidade) ||
        item.produtoId <= 0 ||
        item.quantidade <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Produto ou quantidade inválida.",
        });
      }
    }

    // ===================================================
    // AGRUPAR PRODUTOS REPETIDOS
    // ===================================================

    const itensAgrupados = new Map();

    for (const item of itensNormalizados) {
      const quantidadeAtual =
        itensAgrupados.get(item.produtoId) || 0;

      itensAgrupados.set(
        item.produtoId,
        quantidadeAtual + item.quantidade
      );
    }

    const itensFinais = Array.from(
      itensAgrupados.entries()
    ).map(([produtoId, quantidade]) => ({
      produtoId,
      quantidade,
    }));

    // ===================================================
    // TRANSAÇÃO
    // ===================================================

    const resultado = await prisma.$transaction(
      async (tx) => {
        const produtoIds = itensFinais.map(
          (item) => item.produtoId
        );

        // =================================================
        // BUSCAR PRODUTOS
        // =================================================

        const produtos = await tx.produto.findMany({
          where: {
            id: {
              in: produtoIds,
            },
            ativo: true,
          },

          include: {
            fornecedor: true,
            categoria: true,
          },
        });

        if (produtos.length !== produtoIds.length) {
          throw new Error(
            "Um ou mais produtos não foram encontrados ou estão inativos."
          );
        }

        // =================================================
        // CALCULAR SUBTOTAL
        // =================================================

        let subtotal = 0;

        const itensPedido = [];

        for (const item of itensFinais) {
          const produto = produtos.find(
            (produtoAtual) =>
              produtoAtual.id === item.produtoId
          );

          if (!produto) {
            throw new Error(
              `Produto ${item.produtoId} não encontrado.`
            );
          }

          // ===============================================
          // VALIDAR ESTOQUE
          // ===============================================

          if (produto.estoque < item.quantidade) {
            throw new Error(
              `Estoque insuficiente para o produto "${produto.nome}".`
            );
          }

          // ===============================================
          // PREÇO ORIGINAL
          // ===============================================

          const precoOriginal = Number(
            produto.preco
          );

          if (
            !Number.isFinite(precoOriginal) ||
            precoOriginal < 0
          ) {
            throw new Error(
              `Preço inválido para o produto "${produto.nome}".`
            );
          }

          // ===============================================
          // PREÇO PROMOCIONAL
          // ===============================================

          const precoPromocional =
            produto.precoPromo !== null
              ? Number(produto.precoPromo)
              : null;

          const precoProduto =
            precoPromocional !== null &&
            Number.isFinite(precoPromocional) &&
            precoPromocional > 0 &&
            precoPromocional < precoOriginal
              ? precoPromocional
              : precoOriginal;

          // ===============================================
          // SUBTOTAL
          // ===============================================

          subtotal +=
            precoProduto * item.quantidade;

          // ===============================================
          // DADOS DO FORNECEDOR
          // ===============================================

          const fornecedorId =
            produto.fornecedorId || null;

          const fornecedorNome =
            produto.fornecedor
              ? produto.fornecedor.nome
              : null;

          const skuFornecedor =
            produto.skuFornecedor || null;

          const custoFornecedor =
            produto.custoFornecedor !== null
              ? Number(produto.custoFornecedor)
              : null;

          const linkFornecedor =
            produto.linkFornecedor || null;

          // ===============================================
          // ITEM DO PEDIDO
          // ===============================================

          itensPedido.push({
            produtoId: produto.id,
            nomeProduto: produto.nome,
            preco: precoProduto,
            quantidade: item.quantidade,

            // Dados congelados do fornecedor
            fornecedorId,
            fornecedorNome,
            skuFornecedor,
            custoFornecedor,
            linkFornecedor,

            // Fluxo inicial de dropshipping
            statusFornecedor:
              "AGUARDANDO_FORNECEDOR",

            numeroPedidoFornecedor: null,

            dataEncaminhamento: null,
            dataPedidoFornecedor: null,
            dataEnvioFornecedor: null,
            dataEntregaFornecedor: null,
          });
        }

        // =================================================
        // FRETE
        // =================================================

        const frete = calcularFretePorCep(
          cepNormalizado,
          subtotal
        );

        // =================================================
        // CUPOM
        // =================================================

        let cupom = null;
        let desconto = 0;

        const codigoCupomNormalizado =
          codigoCupom &&
          String(codigoCupom).trim() !== ""
            ? String(codigoCupom)
                .trim()
                .toUpperCase()
            : null;

        const cupomIdNormalizado =
          cupomId !== undefined &&
          cupomId !== null &&
          String(cupomId).trim() !== ""
            ? Number(cupomId)
            : null;

        // =================================================
        // LOCALIZAR CUPOM
        // =================================================

        if (
          codigoCupomNormalizado ||
          cupomIdNormalizado !== null
        ) {
          if (
            cupomIdNormalizado !== null &&
            (!Number.isInteger(cupomIdNormalizado) ||
              cupomIdNormalizado <= 0)
          ) {
            throw new Error("Cupom inválido.");
          }

          if (codigoCupomNormalizado) {
            cupom = await tx.cupom.findUnique({
              where: {
                codigo: codigoCupomNormalizado,
              },
            });
          } else {
            cupom = await tx.cupom.findUnique({
              where: {
                id: cupomIdNormalizado,
              },
            });
          }

          // ===============================================
          // CUPOM NÃO ENCONTRADO
          // ===============================================

          if (!cupom) {
            throw new Error("Cupom não encontrado.");
          }

          // ===============================================
          // CUPOM INATIVO
          // ===============================================

          if (!cupom.ativo) {
            throw new Error(
              "Este cupom está inativo."
            );
          }

          // ===============================================
          // VALIDADE
          // ===============================================

          if (
            cupom.validade &&
            new Date(cupom.validade) < new Date()
          ) {
            throw new Error(
              "Este cupom está expirado."
            );
          }

          // ===============================================
          // LIMITE DE USOS
          // ===============================================

          if (
            cupom.limiteUsos !== null &&
            cupom.usosAtual >= cupom.limiteUsos
          ) {
            throw new Error(
              "Este cupom atingiu o limite de utilizações."
            );
          }

          // ===============================================
          // VALOR MÍNIMO
          // ===============================================

          const valorMinimo =
            cupom.valorMinimo !== null
              ? Number(cupom.valorMinimo)
              : 0;

          if (
            Number.isFinite(valorMinimo) &&
            subtotal < valorMinimo
          ) {
            throw new Error(
              `Este cupom exige uma compra mínima de R$ ${valorMinimo
                .toFixed(2)
                .replace(".", ",")}.`
            );
          }

          // ===============================================
          // VALOR DO CUPOM
          // ===============================================

          const valorCupom = Number(
            cupom.valor
          );

          if (
            !Number.isFinite(valorCupom) ||
            valorCupom <= 0
          ) {
            throw new Error(
              "O valor do cupom é inválido."
            );
          }

          // ===============================================
          // TIPO DO CUPOM
          // ===============================================

          if (cupom.tipo === "PERCENTUAL") {
            desconto =
              subtotal * (valorCupom / 100);
          } else if (cupom.tipo === "FIXO") {
            desconto = valorCupom;
          } else {
            throw new Error(
              "Tipo de cupom inválido."
            );
          }

          // ===============================================
          // LIMITAR DESCONTO
          // ===============================================

          desconto = Math.min(
            Math.max(desconto, 0),
            subtotal
          );
        }

        // =================================================
        // TOTAL
        // =================================================

        const total = Math.max(
          subtotal + frete - desconto,
          0
        );

        // =================================================
        // CRIAR PEDIDO
        // =================================================

        const pedido = await tx.pedido.create({
          data: {
            nomeCliente: String(
              nomeCliente
            ).trim(),

            email: String(email).trim(),

            telefone: String(
              telefone
            ).trim(),

            cep: cepNormalizado,

            estado: String(estado)
              .trim()
              .toUpperCase(),

            endereco: String(
              endereco
            ).trim(),

            numero: String(numero).trim(),

            complemento:
              complemento &&
              String(complemento).trim() !== ""
                ? String(complemento).trim()
                : null,

            bairro: String(
              bairro
            ).trim(),

            cidade: String(
              cidade
            ).trim(),

            subtotal,
            frete,
            desconto,
            total,

            pagamento:
              pagamentoNormalizado,

            status: "PENDENTE",

            cupom: cupom
              ? {
                  connect: {
                    id: cupom.id,
                  },
                }
              : undefined,

            itens: {
              create: itensPedido,
            },
          },

          include: {
            cupom: true,

            itens: {
              include: {
                produto: true,
                fornecedor: true,
              },
            },
          },
        });

        // =================================================
        // ATUALIZAR ESTOQUE
        // =================================================

        for (const item of itensFinais) {
          const resultadoEstoque =
            await tx.produto.updateMany({
              where: {
                id: item.produtoId,
                ativo: true,
                estoque: {
                  gte: item.quantidade,
                },
              },

              data: {
                estoque: {
                  decrement: item.quantidade,
                },
              },
            });

          if (resultadoEstoque.count !== 1) {
            throw new Error(
              "O estoque do produto foi alterado. Atualize o carrinho e tente novamente."
            );
          }
        }

        // =================================================
        // ATUALIZAR USO DO CUPOM
        // =================================================

        if (cupom) {
          await tx.cupom.update({
            where: {
              id: cupom.id,
            },

            data: {
              usosAtual: {
                increment: 1,
              },
            },
          });
        }

        return pedido;
      }
    );

    // ===================================================
    // RESPOSTA
    // ===================================================

    return res.status(201).json({
      success: true,
      message: "Pedido criado com sucesso.",
      pedido: resultado,
    });
  } catch (error) {
    console.error(
      "ERRO AO CRIAR PEDIDO:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro ao criar pedido.",
    });
  }
}

// =====================================================
// BUSCAR PEDIDO POR ID
// =====================================================

async function buscarPedidoPorId(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID do pedido inválido.",
      });
    }

    const pedido =
      await prisma.pedido.findUnique({
        where: {
          id,
        },

        include: {
          cupom: true,

          itens: {
            include: {
              produto: true,
              fornecedor: true,
            },
          },
        },
      });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado.",
      });
    }

    return res.json({
      success: true,
      pedido,
    });
  } catch (error) {
    console.error(
      "ERRO AO BUSCAR PEDIDO:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar pedido.",
      error: error.message,
    });
  }
}

// =====================================================
// ATUALIZAR STATUS DO PEDIDO
// =====================================================

async function atualizarStatusPedido(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID do pedido inválido.",
      });
    }

    const { status } = req.body || {};

    if (
      !status ||
      !String(status).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "O status do pedido é obrigatório.",
      });
    }

    const statusNormalizado = String(status)
      .trim()
      .toUpperCase();

    if (
      !STATUS_PERMITIDOS.includes(
        statusNormalizado
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status do pedido inválido.",
      });
    }

    const pedidoExistente =
      await prisma.pedido.findUnique({
        where: {
          id,
        },
      });

    if (!pedidoExistente) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado.",
      });
    }

    const pedido =
      await prisma.pedido.update({
        where: {
          id,
        },

        data: {
          status: statusNormalizado,
        },

        include: {
          cupom: true,

          itens: {
            include: {
              produto: true,
              fornecedor: true,
            },
          },
        },
      });

    return res.json({
      success: true,
      message:
        "Status do pedido atualizado com sucesso.",
      pedido,
    });
  } catch (error) {
    console.error(
      "ERRO AO ATUALIZAR STATUS DO PEDIDO:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Erro ao atualizar status do pedido.",
      error: error.message,
    });
  }
}

// =====================================================
// ATUALIZAR STATUS DO FORNECEDOR DO ITEM
// =====================================================

async function atualizarStatusFornecedorItem(
  req,
  res
) {
  try {
    // =================================================
    // ID DO ITEM
    // =================================================

    const itemId = Number(
      req.params.itemId
    );

    if (
      !Number.isInteger(itemId) ||
      itemId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "ID do item do pedido inválido.",
      });
    }

    // =================================================
    // DADOS RECEBIDOS
    // =================================================

    const body = req.body || {};

    /*
     * O frontend envia:
     *
     * {
     *   status: "ENCAMINHADO_FORNECEDOR",
     *   numeroPedidoFornecedor: null
     * }
     *
     * Mantemos também statusFornecedor como
     * compatibilidade caso algum frontend antigo
     * ainda utilize esse nome.
     */

    const statusRecebido =
      body.status ??
      body.statusFornecedor;

    const numeroPedidoFornecedor =
      body.numeroPedidoFornecedor;

    console.log(
      "[Dropshipping] Body recebido:",
      body
    );

    console.log(
      "[Dropshipping] Status recebido:",
      statusRecebido
    );

    // =================================================
    // VALIDAR STATUS
    // =================================================

    if (
      !statusRecebido ||
      !String(statusRecebido).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "O status do fornecedor é obrigatório.",
      });
    }

    const statusNormalizado =
      String(statusRecebido)
        .trim()
        .toUpperCase();

    if (
      !STATUS_FORNECEDOR_PERMITIDOS.includes(
        statusNormalizado
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status do fornecedor inválido.",
        statusRecebido: statusNormalizado,
        statusPermitidos:
          STATUS_FORNECEDOR_PERMITIDOS,
      });
    }

    // =================================================
    // BUSCAR ITEM
    // =================================================

    const itemExistente =
      await prisma.pedidoItem.findUnique({
        where: {
          id: itemId,
        },

        include: {
          produto: true,
          fornecedor: true,
          pedido: true,
        },
      });

    if (!itemExistente) {
      return res.status(404).json({
        success: false,
        message:
          "Item do pedido não encontrado.",
      });
    }

    // =================================================
    // VALIDAR FORNECEDOR
    // =================================================

    /*
     * Um item sem fornecedor ainda pode permanecer
     * como AGUARDANDO_FORNECEDOR.
     *
     * Porém, para avançar no fluxo de dropshipping,
     * é necessário existir fornecedor cadastrado.
     */

    const statusExigeFornecedor = [
      "ENCAMINHADO_FORNECEDOR",
      "PEDIDO_FORNECEDOR_REALIZADO",
      "AGUARDANDO_ENVIO",
      "ENVIADO",
      "ENTREGUE",
    ].includes(statusNormalizado);

    if (
      statusExigeFornecedor &&
      !itemExistente.fornecedorId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Este produto não possui fornecedor cadastrado.",
      });
    }

    // =================================================
    // VALIDAR NÚMERO DO PEDIDO DO FORNECEDOR
    // =================================================

    const numeroFornecedorNormalizado =
      numeroPedidoFornecedor !== undefined &&
      numeroPedidoFornecedor !== null
        ? String(
            numeroPedidoFornecedor
          ).trim()
        : "";

    /*
     * Quando o status for
     * PEDIDO_FORNECEDOR_REALIZADO,
     * recomendamos registrar o número do pedido.
     *
     * Não bloqueamos o fluxo caso o fornecedor
     * ainda não tenha fornecido esse número.
     */

    // =================================================
    // PREPARAR ATUALIZAÇÃO
    // =================================================

    const agora = new Date();

    const dadosAtualizacao = {
      statusFornecedor:
        statusNormalizado,
    };

    // =================================================
    // ENCAMINHADO AO FORNECEDOR
    // =================================================

    if (
      statusNormalizado ===
      "ENCAMINHADO_FORNECEDOR"
    ) {
      /*
       * Só registra a primeira data de encaminhamento.
       * Se o status for salvo novamente, não perde
       * a data original.
       */

      dadosAtualizacao.dataEncaminhamento =
        itemExistente.dataEncaminhamento ||
        agora;
    }

    // =================================================
    // PEDIDO REALIZADO NO FORNECEDOR
    // =================================================

    if (
      statusNormalizado ===
      "PEDIDO_FORNECEDOR_REALIZADO"
    ) {
      dadosAtualizacao.dataPedidoFornecedor =
        itemExistente.dataPedidoFornecedor ||
        agora;

      /*
       * Se foi enviado um número, atualiza.
       * Se não foi enviado, mantém o número existente.
       */

      if (
        numeroFornecedorNormalizado
      ) {
        dadosAtualizacao.numeroPedidoFornecedor =
          numeroFornecedorNormalizado;
      }
    }

    // =================================================
    // AGUARDANDO ENVIO
    // =================================================

    if (
      statusNormalizado ===
      "AGUARDANDO_ENVIO"
    ) {
      /*
       * Não possui data específica no schema.
       * A data do pedido do fornecedor permanece
       * registrada.
       */
    }

    // =================================================
    // ENVIADO
    // =================================================

    if (
      statusNormalizado === "ENVIADO"
    ) {
      dadosAtualizacao.dataEnvioFornecedor =
        itemExistente.dataEnvioFornecedor ||
        agora;
    }

    // =================================================
    // ENTREGUE
    // =================================================

    if (
      statusNormalizado === "ENTREGUE"
    ) {
      dadosAtualizacao.dataEntregaFornecedor =
        itemExistente.dataEntregaFornecedor ||
        agora;
    }

    // =================================================
    // SE FOI INFORMADO NÚMERO DO PEDIDO
    // =================================================

    /*
     * Permite atualizar o número do pedido do
     * fornecedor independentemente do status atual.
     */

    if (
      numeroFornecedorNormalizado
    ) {
      dadosAtualizacao.numeroPedidoFornecedor =
        numeroFornecedorNormalizado;
    }

    // =================================================
    // ATUALIZAR ITEM
    // =================================================

    const itemAtualizado =
      await prisma.pedidoItem.update({
        where: {
          id: itemId,
        },

        data: dadosAtualizacao,

        include: {
          produto: true,
          fornecedor: true,
          pedido: true,
        },
      });

    // =================================================
    // LOG
    // =================================================

    console.log(
      "[Dropshipping] Item atualizado:",
      {
        itemId,
        pedidoId:
          itemAtualizado.pedidoId,
        produtoId:
          itemAtualizado.produtoId,
        fornecedorId:
          itemAtualizado.fornecedorId,
        statusFornecedor:
          itemAtualizado.statusFornecedor,
        numeroPedidoFornecedor:
          itemAtualizado.numeroPedidoFornecedor,
      }
    );

    // =================================================
    // RESPOSTA
    // =================================================

    return res.json({
      success: true,
      message:
        "Status do fornecedor atualizado com sucesso.",
      item: itemAtualizado,
    });
  } catch (error) {
    console.error(
      "ERRO AO ATUALIZAR STATUS DO FORNECEDOR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Erro ao atualizar status do fornecedor.",
      error: error.message,
    });
  }
}

// =====================================================
// EXPORTAR
// =====================================================

module.exports = {
  listarPedidos,
  criarPedido,
  buscarPedidoPorId,
  atualizarStatusPedido,
  atualizarStatusFornecedorItem,
};