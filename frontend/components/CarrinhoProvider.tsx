"use client";

import {

  createContext,

  useContext,

  useEffect,

  useState,

  ReactNode,

} from "react";

import { Produto } from "@/services/api";

export interface ItemCarrinho {

  produto: Produto;

  quantidade: number;

}

interface CarrinhoContextType {

  itens: ItemCarrinho[];

  quantidadeTotal: number;

  valorTotal: number;

  adicionarAoCarrinho: (produto: Produto) => void;

  removerDoCarrinho: (produtoId: number) => void;

  alterarQuantidade: (produtoId: number, quantidade: number) => void;

  limparCarrinho: () => void;

}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(

  undefined

);

interface CarrinhoProviderProps {

  children: ReactNode;

}

const CHAVE_CARRINHO = "mimo-quatro-patas-carrinho";

export function CarrinhoProvider({

  children,

}: CarrinhoProviderProps) {

  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  const [carregado, setCarregado] = useState(false);

  // =====================================================

  // CARREGAR CARRINHO

  // =====================================================

  useEffect(() => {

    try {

      const carrinhoSalvo = localStorage.getItem(CHAVE_CARRINHO);

      if (carrinhoSalvo) {

        const dados = JSON.parse(carrinhoSalvo);

        if (Array.isArray(dados)) {

          setItens(dados);

        }

      }

    } catch (error) {

      console.error("Erro ao carregar carrinho:", error);

      setItens([]);

    } finally {

      setCarregado(true);

    }

  }, []);

  // =====================================================

  // SALVAR CARRINHO

  // =====================================================

  useEffect(() => {

    if (!carregado) {

      return;

    }

    try {

      localStorage.setItem(

        CHAVE_CARRINHO,

        JSON.stringify(itens)

      );

    } catch (error) {

      console.error("Erro ao salvar carrinho:", error);

    }

  }, [itens, carregado]);

  // =====================================================

  // ADICIONAR PRODUTO

  // =====================================================

  function adicionarAoCarrinho(produto: Produto) {

    if (!produto.ativo) {

      return;

    }

    if (produto.estoque <= 0) {

      return;

    }

    setItens((itensAtuais) => {

      const itemExistente = itensAtuais.find(

        (item) => item.produto.id === produto.id

      );

      // Produto já está no carrinho

      if (itemExistente) {

        const novaQuantidade =

          itemExistente.quantidade + 1;

        // Não ultrapassar estoque

        if (novaQuantidade > produto.estoque) {

          return itensAtuais;

        }

        return itensAtuais.map((item) =>

          item.produto.id === produto.id

            ? {

                ...item,

                produto,

                quantidade: novaQuantidade,

              }

            : item

        );

      }

      // Produto ainda não está no carrinho

      return [

        ...itensAtuais,

        {

          produto,

          quantidade: 1,

        },

      ];

    });

  }

  // =====================================================

  // REMOVER PRODUTO

  // =====================================================

  function removerDoCarrinho(produtoId: number) {

    setItens((itensAtuais) =>

      itensAtuais.filter(

        (item) => item.produto.id !== produtoId

      )

    );

  }

  // =====================================================

  // ALTERAR QUANTIDADE

  // =====================================================

  function alterarQuantidade(

    produtoId: number,

    quantidade: number

  ) {

    if (quantidade <= 0) {

      removerDoCarrinho(produtoId);

      return;

    }

    setItens((itensAtuais) =>

      itensAtuais.map((item) => {

        if (item.produto.id !== produtoId) {

          return item;

        }

        const estoque = item.produto.estoque;

        const quantidadeFinal = Math.min(

          quantidade,

          estoque

        );

        if (quantidadeFinal <= 0) {

          return item;

        }

        return {

          ...item,

          quantidade: quantidadeFinal,

        };

      })

    );

  }

  // =====================================================

  // LIMPAR CARRINHO

  // =====================================================

  function limparCarrinho() {

    setItens([]);

  }

  // =====================================================

  // QUANTIDADE TOTAL

  // =====================================================

  const quantidadeTotal = itens.reduce(

    (total, item) => total + item.quantidade,

    0

  );

  // =====================================================

  // VALOR TOTAL

  // =====================================================

  const valorTotal = itens.reduce(

    (total, item) => {

      const precoPromocional = Number(

        item.produto.precoPromo

      );

      const precoOriginal = Number(

        item.produto.preco

      );

      const possuiOferta =

        precoPromocional > 0 &&

        precoPromocional < precoOriginal;

      const preco = possuiOferta

        ? precoPromocional

        : precoOriginal;

      return total + preco * item.quantidade;

    },

    0

  );

  return (

    <CarrinhoContext.Provider

      value={{

        itens,

        quantidadeTotal,

        valorTotal,

        adicionarAoCarrinho,

        removerDoCarrinho,

        alterarQuantidade,

        limparCarrinho,

      }}

    >

      {children}

    </CarrinhoContext.Provider>

  );

}

// =====================================================

// HOOK

// =====================================================

export function useCarrinho() {

  const contexto = useContext(CarrinhoContext);

  if (!contexto) {

    throw new Error(

      "useCarrinho deve ser usado dentro de CarrinhoProvider"

    );

  }

  return contexto;

}