"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { useCarrinho } from "../../components/CarrinhoProvider";

const VALOR_MINIMO_FRETE_GRATIS = 100;

type FormaPagamento = "PIX" | "CARTAO" | "BOLETO";

interface FormularioCheckout {
  nomeCliente: string;
  email: string;
  telefone: string;
  cep: string;
  estado: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  pagamento: FormaPagamento;
}

interface ItemCarrinho {
  quantidade: number;
  produto: {
    id: number | string;
    nome: string;
    preco: number | string;
    precoPromo?: number | string | null;
  };
}

interface CupomAplicado {
  id: number;
  codigo: string;
  tipo: string;
  valor: number;
  valorMinimo: number;
}

// =====================================================
// FORMATAÇÃO
// =====================================================

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarCep(valor: string) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, "$1-$2");
}

function formatarTelefone(valor: string) {
  const numeros = valor
    .replace(/\D/g, "")
    .slice(0, 11);

  if (numeros.length <= 10) {
    return numeros.replace(
      /^(\d{2})(\d{4})(\d{0,4})/,
      "($1) $2-$3"
    );
  }

  return numeros.replace(
    /^(\d{2})(\d{5})(\d{0,4})/,
    "($1) $2-$3"
  );
}

// =====================================================
// PREÇO DO PRODUTO
// =====================================================

function obterPrecoProduto(
  produto: ItemCarrinho["produto"]
) {
  const preco = Number(produto.preco);
  const precoPromo = Number(produto.precoPromo);

  if (
    precoPromo > 0 &&
    precoPromo < preco
  ) {
    return precoPromo;
  }

  return preco;
}

// =====================================================
// FRETE
// =====================================================

function calcularFretePorCep(
  cep: string,
  subtotal: number
): number | null {
  if (
    subtotal >= VALOR_MINIMO_FRETE_GRATIS
  ) {
    return 0;
  }

  const cepNumerico = cep.replace(/\D/g, "");

  if (cepNumerico.length !== 8) {
    return null;
  }

  const primeiroDigito = Number(
    cepNumerico.charAt(0)
  );

  if (
    primeiroDigito === 0 ||
    primeiroDigito === 1
  ) {
    return 9.9;
  }

  if (
    primeiroDigito === 2 ||
    primeiroDigito === 3
  ) {
    return 14.9;
  }

  if (
    primeiroDigito === 4 ||
    primeiroDigito === 5
  ) {
    return 19.9;
  }

  if (
    primeiroDigito === 6 ||
    primeiroDigito === 7
  ) {
    return 24.9;
  }

  return 29.9;
}

// =====================================================
// API
// =====================================================

function obterApiUrl() {
  const rawApiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001";

  return rawApiUrl
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");
}

// =====================================================
// PÁGINA
// =====================================================

export default function CheckoutPage() {
  const router = useRouter();

  const {
    itens,
    limparCarrinho,
  } = useCarrinho();

  const [
    formulario,
    setFormulario,
  ] = useState<FormularioCheckout>({
    nomeCliente: "",
    email: "",
    telefone: "",
    cep: "",
    estado: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    pagamento: "PIX",
  });

  const [
    codigoCupom,
    setCodigoCupom,
  ] = useState("");

  const [
    cupomAplicado,
    setCupomAplicado,
  ] = useState<CupomAplicado | null>(
    null
  );

  const [
    erroCupom,
    setErroCupom,
  ] = useState("");

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  const [
    erro,
    setErro,
  ] = useState("");

  const [
    finalizando,
    setFinalizando,
  ] = useState(false);

  const [
    aplicandoCupom,
    setAplicandoCupom,
  ] = useState(false);

  // =====================================================
  // SUBTOTAL
  // =====================================================

  const subtotal = useMemo(() => {
    return itens.reduce(
      (
        total: number,
        item: ItemCarrinho
      ) => {
        const preco =
          obterPrecoProduto(item.produto);

        return (
          total +
          preco * Number(item.quantidade)
        );
      },
      0
    );
  }, [itens]);

  // =====================================================
  // FRETE
  // =====================================================

  const frete = useMemo(() => {
    return calcularFretePorCep(
      formulario.cep,
      subtotal
    );
  }, [formulario.cep, subtotal]);

  // =====================================================
  // DESCONTO
  // =====================================================

  const desconto = useMemo(() => {
    if (!cupomAplicado) {
      return 0;
    }

    let valor = 0;

    if (
      cupomAplicado.tipo ===
      "PERCENTUAL"
    ) {
      valor =
        subtotal *
        (cupomAplicado.valor / 100);
    }

    if (
      cupomAplicado.tipo === "FIXO"
    ) {
      valor = cupomAplicado.valor;
    }

    return Math.min(
      Math.max(valor, 0),
      subtotal
    );
  }, [cupomAplicado, subtotal]);

  // =====================================================
  // TOTAL
  // =====================================================

  const total = useMemo(() => {
    return Math.max(
      subtotal +
        (frete ?? 0) -
        desconto,
      0
    );
  }, [subtotal, frete, desconto]);

  // =====================================================
  // CARRINHO VAZIO
  // =====================================================

  useEffect(() => {
    if (itens.length === 0) {
      router.replace("/carrinho");
    }
  }, [itens.length, router]);

  // =====================================================
  // ATUALIZAR CAMPO
  // =====================================================

  function atualizarCampo(
    campo: keyof FormularioCheckout,
    valor: string
  ) {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));

    setErro("");
    setMensagem("");
  }

  // =====================================================
  // APLICAR CUPOM
  // =====================================================

  async function aplicarCupom() {
    setErroCupom("");
    setMensagem("");

    const codigo =
      codigoCupom
        .trim()
        .toUpperCase();

    if (!codigo) {
      setErroCupom(
        "Digite um código de cupom."
      );
      return;
    }

    if (aplicandoCupom) {
      return;
    }

    setAplicandoCupom(true);

    try {
      const apiUrl = obterApiUrl();

      const response = await fetch(
        `${apiUrl}/api/cupons/validar`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            codigo,
            subtotal,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      console.log(
        "RESPOSTA DA VALIDAÇÃO DO CUPOM:",
        data
      );

      if (
        !response.ok ||
        !data?.success
      ) {
        setCupomAplicado(null);

        setErroCupom(
          data?.message ||
            "Cupom inválido ou não encontrado."
        );

        return;
      }

      const cupom = data.cupom;

      if (!cupom) {
        setCupomAplicado(null);

        setErroCupom(
          "Não foi possível validar o cupom."
        );

        return;
      }

      const idCupom = Number(cupom.id);

      const valorCupom = Number(
        cupom.valor
      );

      if (
        !Number.isInteger(idCupom) ||
        idCupom <= 0
      ) {
        setCupomAplicado(null);

        setErroCupom(
          "O cupom retornado pela API possui um ID inválido."
        );

        return;
      }

      if (
        !Number.isFinite(valorCupom) ||
        valorCupom < 0
      ) {
        setCupomAplicado(null);

        setErroCupom(
          "O valor do cupom é inválido."
        );

        return;
      }

      const valorMinimo =
        cupom.valorMinimo !== null &&
        cupom.valorMinimo !== undefined
          ? Number(cupom.valorMinimo)
          : 0;

      setCupomAplicado({
        id: idCupom,
        codigo: String(
          cupom.codigo || codigo
        ),
        tipo: String(cupom.tipo),
        valor: valorCupom,
        valorMinimo:
          Number.isFinite(valorMinimo) &&
          valorMinimo > 0
            ? valorMinimo
            : 0,
      });

      setCodigoCupom(
        String(
          cupom.codigo || codigo
        ).toUpperCase()
      );

      setMensagem(
        `Cupom ${
          cupom.codigo || codigo
        } aplicado com sucesso.`
      );
    } catch (error) {
      console.error(
        "Erro ao aplicar cupom:",
        error
      );

      setCupomAplicado(null);

      setErroCupom(
        "Não foi possível validar o cupom. Verifique se o servidor está funcionando."
      );
    } finally {
      setAplicandoCupom(false);
    }
  }

  // =====================================================
  // REMOVER CUPOM
  // =====================================================

  function removerCupom() {
    setCupomAplicado(null);
    setCodigoCupom("");
    setErroCupom("");
    setMensagem("");
  }

  // =====================================================
  // FINALIZAR PEDIDO
  // =====================================================

  async function finalizarPedido(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    if (itens.length === 0) {
      setErro(
        "Seu carrinho está vazio."
      );
      return;
    }

    const cepNumerico =
      formulario.cep.replace(/\D/g, "");

    if (cepNumerico.length !== 8) {
      setErro(
        "Informe um CEP válido com 8 dígitos."
      );
      return;
    }

    const freteCalculado =
      calcularFretePorCep(
        formulario.cep,
        subtotal
      );

    if (freteCalculado === null) {
      setErro(
        "Não foi possível calcular o frete."
      );
      return;
    }

    setFinalizando(true);

    try {
      const apiUrl = obterApiUrl();

      const itensPedido = itens.map(
        (item: ItemCarrinho) => ({
          produtoId: Number(
            item.produto.id
          ),
          quantidade: Number(
            item.quantidade
          ),
        })
      );

      const payload = {
        nomeCliente:
          formulario.nomeCliente.trim(),

        email:
          formulario.email.trim(),

        telefone:
          formulario.telefone.trim(),

        cep: cepNumerico,

        estado:
          formulario.estado.trim(),

        endereco:
          formulario.endereco.trim(),

        numero:
          formulario.numero.trim(),

        complemento:
          formulario.complemento.trim(),

        bairro:
          formulario.bairro.trim(),

        cidade:
          formulario.cidade.trim(),

        pagamento:
          formulario.pagamento,

        cupomId:
          cupomAplicado?.id ||
          undefined,

        codigoCupom:
          cupomAplicado?.codigo ||
          undefined,

        itens: itensPedido,
      };

      console.log(
        "ENVIANDO PEDIDO:",
        payload
      );

      const response = await fetch(
        `${apiUrl}/api/pedidos`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      console.log(
        "RESPOSTA DO PEDIDO:",
        data
      );

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Não foi possível registrar o pedido."
        );
      }

      const pedido =
        data.pedido;

      const numeroPedido =
        pedido?.id;

      if (!numeroPedido) {
        throw new Error(
          "Pedido registrado, mas o número do pedido não foi retornado pela API."
        );
      }

      // =================================================
      // PEDIDO REGISTRADO COM SUCESSO
      // =================================================

      console.log(
        `Pedido #${numeroPedido} registrado com sucesso.`
      );

      // Limpa o carrinho somente depois
      // que o pedido foi registrado.
      limparCarrinho();

      // Limpa cupom aplicado.
      setCupomAplicado(null);
      setCodigoCupom("");

      // Mostra confirmação.
      setMensagem(
        `Pedido #${numeroPedido} registrado com sucesso!`
      );

      // =================================================
      // REDIRECIONAMENTO
      // =================================================

      setTimeout(() => {
        router.push(
          `/pedido-confirmado?id=${numeroPedido}`
        );
      }, 800);
    } catch (error) {
      console.error(
        "ERRO AO FINALIZAR PEDIDO:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível finalizar o pedido."
      );
    } finally {
      setFinalizando(false);
    }
  }

  // =====================================================
  // CARRINHO VAZIO
  // =====================================================

  if (itens.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf5] px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Carrinho vazio
          </h1>

          <p className="mt-2 text-gray-600">
            Adicione produtos ao carrinho
            para continuar.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="mt-6 rounded-lg bg-[#8b5e3c] px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Voltar para a loja
          </button>
        </div>
      </main>
    );
  }

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#fffaf5] py-10">
      <div className="mx-auto max-w-6xl px-4">

        {/* CABEÇALHO */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              router.push("/carrinho")
            }
            className="mb-4 text-sm font-medium text-[#8b5e3c] hover:underline"
          >
            ← Voltar ao carrinho
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Finalizar pedido
          </h1>

          <p className="mt-2 text-gray-600">
            Preencha seus dados para concluir
            seu pedido.
          </p>
        </div>

        {/* MENSAGENS */}

        {mensagem && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {erro}
          </div>
        )}

        <form
          onSubmit={finalizarPedido}
          className="grid gap-8 lg:grid-cols-[1fr_380px]"
        >

          {/* COLUNA PRINCIPAL */}

          <div className="space-y-6">

            {/* DADOS PESSOAIS */}

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Dados pessoais
              </h2>

              <div className="grid gap-4 md:grid-cols-2">

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nome completo *
                  </label>

                  <input
                    required
                    type="text"
                    value={
                      formulario.nomeCliente
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "nomeCliente",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#8b5e3c]"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    E-mail *
                  </label>

                  <input
                    required
                    type="email"
                    value={
                      formulario.email
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "email",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#8b5e3c]"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Telefone *
                  </label>

                  <input
                    required
                    type="tel"
                    value={
                      formulario.telefone
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "telefone",
                        formatarTelefone(
                          event.target.value
                        )
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#8b5e3c]"
                    placeholder="(11) 99999-9999"
                  />
                </div>

              </div>
            </section>

            {/* ENDEREÇO */}

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Endereço de entrega
              </h2>

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    CEP *
                  </label>

                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    value={
                      formulario.cep
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "cep",
                        formatarCep(
                          event.target.value
                        )
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#8b5e3c]"
                    placeholder="00000-000"
                  />

                  {frete !== null && (
                    <p className="mt-2 text-sm text-gray-600">
                      Frete:{" "}
                      <strong>
                        {frete === 0
                          ? "Grátis"
                          : formatarMoeda(
                              frete
                            )}
                      </strong>
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Estado *
                  </label>

                  <input
                    required
                    type="text"
                    maxLength={2}
                    value={
                      formulario.estado
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "estado",
                        event.target.value
                          .toUpperCase()
                          .slice(0, 2)
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 uppercase outline-none transition focus:border-[#8b5e3c]"
                    placeholder="SP"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Endereço *
                  </label>

                  <input
                    required
                    type="text"
                    value={
                      formulario.endereco
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "endereco",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#8b5e3c]"
                    placeholder="Rua, avenida..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Número *
                  </label>

                  <input
                    required
                    type="text"
                    value={
                      formulario.numero
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "numero",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#8b5e3c]"
                    placeholder="123"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Complemento
                  </label>

                  <input
                    type="text"
                    value={
                      formulario.complemento
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "complemento",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#8b5e3c]"
                    placeholder="Apto, bloco..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Bairro *
                  </label>

                  <input
                    required
                    type="text"
                    value={
                      formulario.bairro
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "bairro",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#8b5e3c]"
                    placeholder="Seu bairro"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Cidade *
                  </label>

                  <input
                    required
                    type="text"
                    value={
                      formulario.cidade
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "cidade",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#8b5e3c]"
                    placeholder="Sua cidade"
                  />
                </div>

              </div>
            </section>

            {/* PAGAMENTO */}

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Forma de pagamento
              </h2>

              <div className="grid gap-3">

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-[#8b5e3c]">
                  <input
                    type="radio"
                    name="pagamento"
                    value="PIX"
                    checked={
                      formulario.pagamento ===
                      "PIX"
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "pagamento",
                        event.target.value
                      )
                    }
                  />

                  <div>
                    <strong className="block">
                      PIX
                    </strong>

                    <span className="text-sm text-gray-500">
                      Pagamento demonstrativo
                    </span>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-[#8b5e3c]">
                  <input
                    type="radio"
                    name="pagamento"
                    value="CARTAO"
                    checked={
                      formulario.pagamento ===
                      "CARTAO"
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "pagamento",
                        event.target.value
                      )
                    }
                  />

                  <div>
                    <strong className="block">
                      Cartão
                    </strong>

                    <span className="text-sm text-gray-500">
                      Pagamento demonstrativo
                    </span>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-[#8b5e3c]">
                  <input
                    type="radio"
                    name="pagamento"
                    value="BOLETO"
                    checked={
                      formulario.pagamento ===
                      "BOLETO"
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "pagamento",
                        event.target.value
                      )
                    }
                  />

                  <div>
                    <strong className="block">
                      Boleto
                    </strong>

                    <span className="text-sm text-gray-500">
                      Pagamento demonstrativo
                    </span>
                  </div>
                </label>

              </div>
            </section>

          </div>

          {/* RESUMO */}

          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-6">

            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Resumo do pedido
            </h2>

            {/* PRODUTOS */}

            <div className="space-y-4 border-b border-gray-200 pb-5">

              {itens.map(
                (item: ItemCarrinho) => {
                  const preco =
                    obterPrecoProduto(
                      item.produto
                    );

                  return (
                    <div
                      key={String(
                        item.produto.id
                      )}
                      className="flex justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {
                            item.produto
                              .nome
                          }
                        </p>

                        <p className="text-xs text-gray-500">
                          Quantidade:{" "}
                          {
                            item.quantidade
                          }
                        </p>
                      </div>

                      <span className="whitespace-nowrap text-sm font-semibold text-gray-800">
                        {formatarMoeda(
                          preco *
                            Number(
                              item.quantidade
                            )
                        )}
                      </span>
                    </div>
                  );
                }
              )}

            </div>

            {/* CUPOM */}

            <div className="border-b border-gray-200 py-5">

              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Cupom de desconto
              </label>

              {!cupomAplicado ? (
                <div className="flex gap-2">

                  <input
                    type="text"
                    value={
                      codigoCupom
                    }
                    onChange={(event) =>
                      setCodigoCupom(
                        event.target.value
                          .toUpperCase()
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        event.preventDefault();

                        aplicarCupom();
                      }
                    }}
                    placeholder="CÓDIGO"
                    disabled={
                      aplicandoCupom ||
                      finalizando
                    }
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-[#8b5e3c] disabled:bg-gray-100"
                  />

                  <button
                    type="button"
                    onClick={
                      aplicarCupom
                    }
                    disabled={
                      aplicandoCupom ||
                      finalizando
                    }
                    className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {aplicandoCupom
                      ? "Validando..."
                      : "Aplicar"}
                  </button>

                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-3">

                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      {
                        cupomAplicado.codigo
                      }
                    </p>

                    <p className="text-xs text-green-600">
                      Desconto de{" "}
                      {formatarMoeda(
                        desconto
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removerCupom
                    }
                    disabled={
                      finalizando
                    }
                    className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                  >
                    Remover
                  </button>

                </div>
              )}

              {erroCupom && (
                <p className="mt-2 text-xs text-red-600">
                  {erroCupom}
                </p>
              )}

            </div>

            {/* TOTAIS */}

            <div className="space-y-3 py-5">

              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Subtotal
                </span>

                <span>
                  {formatarMoeda(
                    subtotal
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Frete
                </span>

                <span>
                  {frete === null
                    ? "Informe o CEP"
                    : frete === 0
                    ? "Grátis"
                    : formatarMoeda(
                        frete
                      )}
                </span>
              </div>

              {desconto > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>
                    Desconto
                  </span>

                  <span>
                    -{" "}
                    {formatarMoeda(
                      desconto
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-900">
                <span>
                  Total
                </span>

                <span>
                  {formatarMoeda(
                    total
                  )}
                </span>
              </div>

            </div>

            {/* FINALIZAR */}

            <button
              type="submit"
              disabled={
                finalizando ||
                aplicandoCupom ||
                frete === null
              }
              className="w-full rounded-xl bg-[#8b5e3c] px-5 py-4 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {finalizando
                ? "Registrando pedido..."
                : aplicandoCupom
                ? "Validando cupom..."
                : "Finalizar pedido"}
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">
              O pagamento é fictício e serve
              apenas para demonstração da
              plataforma.
            </p>

          </aside>

        </form>
      </div>
    </main>
  );
}