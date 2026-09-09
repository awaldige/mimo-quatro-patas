const prisma = require("../config/prisma");

function inicioDoDia(data) {
  const resultado = new Date(data);
  resultado.setHours(0, 0, 0, 0);
  return resultado;
}

function fimDoDia(data) {
  const resultado = new Date(data);
  resultado.setHours(23, 59, 59, 999);
  return resultado;
}

function numero(valor) {
  return Number(valor || 0);
}

async function obterRelatorios(req, res) {
  try {
    const hoje = new Date();

    const inicioParametro = req.query.inicio;
    const fimParametro = req.query.fim;

    const inicio = inicioParametro
      ? inicioDoDia(inicioParametro)
      : new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          hoje.getDate() - 29,
          0,
          0,
          0,
          0
        );

    const fim = fimParametro
      ? fimDoDia(fimParametro)
      : fimDoDia(hoje);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
      return res.status(400).json({
        message: "Período informado é inválido.",
      });
    }

    if (inicio > fim) {
      return res.status(400).json({
        message: "A data inicial não pode ser maior que a data final.",
      });
    }

    const pedidos = await prisma.pedido.findMany({
      where: {
        createdAt: {
          gte: inicio,
          lte: fim,
        },
      },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const pedidosValidos = pedidos.filter(
      (pedido) => pedido.status !== "CANCELADO"
    );

    const pedidosCancelados = pedidos.filter(
      (pedido) => pedido.status === "CANCELADO"
    );

    // =========================
    // RESUMO
    // =========================

    const faturamento = pedidosValidos.reduce(
      (total, pedido) => total + numero(pedido.total),
      0
    );

    const subtotal = pedidosValidos.reduce(
      (total, pedido) => total + numero(pedido.subtotal),
      0
    );

    const descontos = pedidosValidos.reduce(
      (total, pedido) => total + numero(pedido.desconto),
      0
    );

    const frete = pedidosValidos.reduce(
      (total, pedido) => total + numero(pedido.frete),
      0
    );

    const ticketMedio =
      pedidosValidos.length > 0
        ? faturamento / pedidosValidos.length
        : 0;

    const quantidadeItensVendidos = pedidosValidos.reduce(
      (total, pedido) => {
        return (
          total +
          pedido.itens.reduce(
            (soma, item) => soma + Number(item.quantidade || 0),
            0
          )
        );
      },
      0
    );

    // =========================
    // VENDAS POR DIA
    // =========================

    const vendasPorDiaMap = {};

    pedidosValidos.forEach((pedido) => {
      const data = new Date(pedido.createdAt);

      const chave =
        `${data.getFullYear()}-` +
        `${String(data.getMonth() + 1).padStart(2, "0")}-` +
        `${String(data.getDate()).padStart(2, "0")}`;

      if (!vendasPorDiaMap[chave]) {
        vendasPorDiaMap[chave] = {
          data: chave,
          pedidos: 0,
          faturamento: 0,
        };
      }

      vendasPorDiaMap[chave].pedidos += 1;
      vendasPorDiaMap[chave].faturamento += numero(pedido.total);
    });

    const vendasPorDia = Object.values(vendasPorDiaMap).map((item) => ({
      ...item,
      faturamento: Number(item.faturamento.toFixed(2)),
    }));

    // =========================
    // PRODUTOS MAIS VENDIDOS
    // =========================

    const produtosMap = {};

    pedidosValidos.forEach((pedido) => {
      pedido.itens.forEach((item) => {
        const produtoId = item.produtoId;

        if (!produtosMap[produtoId]) {
          produtosMap[produtoId] = {
            produtoId,
            nome: item.nomeProduto,
            quantidade: 0,
            faturamento: 0,
          };
        }

        produtosMap[produtoId].quantidade += Number(
          item.quantidade || 0
        );

        produtosMap[produtoId].faturamento +=
          numero(item.preco) * Number(item.quantidade || 0);
      });
    });

    const produtosMaisVendidos = Object.values(produtosMap)
      .map((produto) => ({
        ...produto,
        faturamento: Number(produto.faturamento.toFixed(2)),
      }))
      .sort((a, b) => {
        if (b.quantidade !== a.quantidade) {
          return b.quantidade - a.quantidade;
        }

        return b.faturamento - a.faturamento;
      })
      .slice(0, 10);

    // =========================
    // VENDAS POR PAGAMENTO
    // =========================

    const pagamentosMap = {};

    pedidosValidos.forEach((pedido) => {
      const pagamento = pedido.pagamento || "OUTRO";

      if (!pagamentosMap[pagamento]) {
        pagamentosMap[pagamento] = {
          pagamento,
          pedidos: 0,
          faturamento: 0,
        };
      }

      pagamentosMap[pagamento].pedidos += 1;
      pagamentosMap[pagamento].faturamento += numero(pedido.total);
    });

    const vendasPorPagamento = Object.values(pagamentosMap).map(
      (item) => ({
        ...item,
        faturamento: Number(item.faturamento.toFixed(2)),
      })
    );

    // =========================
    // PEDIDOS POR STATUS
    // =========================

    const statusMap = {};

    pedidos.forEach((pedido) => {
      const status = pedido.status || "PENDENTE";

      if (!statusMap[status]) {
        statusMap[status] = {
          status,
          quantidade: 0,
          valor: 0,
        };
      }

      statusMap[status].quantidade += 1;
      statusMap[status].valor += numero(pedido.total);
    });

    const pedidosPorStatus = Object.values(statusMap).map((item) => ({
      ...item,
      valor: Number(item.valor.toFixed(2)),
    }));

    // =========================
    // ESTOQUE
    // =========================

    const produtosEstoque = await prisma.produto.findMany({
      where: {
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        estoque: true,
        preco: true,
        precoPromo: true,
        categoria: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        estoque: "asc",
      },
    });

    const estoque = produtosEstoque.map((produto) => ({
      id: produto.id,
      nome: produto.nome,
      estoque: produto.estoque,
      preco: numero(produto.preco),
      precoPromo: produto.precoPromo
        ? numero(produto.precoPromo)
        : null,
      categoria: produto.categoria?.nome || null,
    }));

    const produtosSemEstoque = estoque.filter(
      (produto) => produto.estoque <= 0
    ).length;

    const produtosEstoqueBaixo = estoque.filter(
      (produto) => produto.estoque > 0 && produto.estoque <= 5
    ).length;

    const valorEstoque = estoque.reduce(
      (total, produto) =>
        total + produto.estoque * (produto.precoPromo || produto.preco),
      0
    );

    // =========================
    // RESPOSTA
    // =========================

    return res.json({
      periodo: {
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
      },

      resumo: {
        pedidos: pedidos.length,
        pedidosValidos: pedidosValidos.length,
        pedidosCancelados: pedidosCancelados.length,

        faturamento: Number(faturamento.toFixed(2)),
        subtotal: Number(subtotal.toFixed(2)),
        descontos: Number(descontos.toFixed(2)),
        frete: Number(frete.toFixed(2)),

        ticketMedio: Number(ticketMedio.toFixed(2)),
        quantidadeItensVendidos,
      },

      vendasPorDia,

      produtosMaisVendidos,

      vendasPorPagamento,

      pedidosPorStatus,

      estoque: {
        totalProdutos: estoque.length,
        produtosSemEstoque,
        produtosEstoqueBaixo,
        valorEstimado: Number(valorEstoque.toFixed(2)),
        produtos: estoque,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar relatórios:", error);

    return res.status(500).json({
      message: "Erro ao gerar relatórios.",
    });
  }
}

module.exports = {
  obterRelatorios,
};