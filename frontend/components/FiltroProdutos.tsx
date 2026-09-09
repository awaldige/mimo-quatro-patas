"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Categoria,
  Produto,
  getCategorias,
} from "@/services/api";

interface FiltroProdutosProps {
  produtos: Produto[];
  categoriaInicial?: string;
}

export default function FiltroProdutos({
  produtos,
  categoriaInicial = "todas",
}: FiltroProdutosProps) {
  const router = useRouter();

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [ordenacao, setOrdenacao] = useState("padrao");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregandoCategorias, setCarregandoCategorias] =
    useState(true);

  /*
   * =====================================================
   * CATEGORIAS
   * =====================================================
   */

  useEffect(() => {
    let ativo = true;

    async function carregarCategorias() {
      try {
        const dados = await getCategorias();

        if (ativo) {
          setCategorias(
            dados
              .filter((item) => item.ativo)
              .sort((a, b) =>
                a.nome.localeCompare(b.nome, "pt-BR")
              )
          );
        }
      } catch (error) {
        console.error(
          "Erro ao carregar categorias:",
          error
        );

        /*
         * Fallback usando as categorias dos produtos.
         */

        if (ativo) {
          const mapa = new Map<number, string>();

          produtos.forEach((produto) => {
            if (produto.categoria) {
              mapa.set(
                produto.categoria.id,
                produto.categoria.nome
              );
            }
          });

          setCategorias(
            Array.from(mapa.entries())
              .map(([id, nome]) => ({
                id,
                nome,
                ativo: true,
              }))
              .sort((a, b) =>
                a.nome.localeCompare(b.nome, "pt-BR")
              )
          );
        }
      } finally {
        if (ativo) {
          setCarregandoCategorias(false);
        }
      }
    }

    carregarCategorias();

    return () => {
      ativo = false;
    };
  }, [produtos]);

  /*
   * =====================================================
   * SINCRONIZA CATEGORIA COM A URL
   * =====================================================
   */

  useEffect(() => {
    setCategoria(categoriaInicial);
  }, [categoriaInicial]);

  /*
   * =====================================================
   * ALTERAR CATEGORIA
   * =====================================================
   */

  function alterarCategoria(
    novaCategoria: string
  ) {
    setCategoria(novaCategoria);

    const params = new URLSearchParams(
      window.location.search
    );

    if (novaCategoria === "todas") {
      params.delete("categoria");
    } else {
      params.set("categoria", novaCategoria);
    }

    const queryString = params.toString();

    router.push(
      queryString
        ? `/produtos?${queryString}`
        : "/produtos"
    );
  }

  /*
   * =====================================================
   * PRODUTOS FILTRADOS
   * =====================================================
   */

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const resultado = produtos.filter((produto) => {
      const nome =
        produto.nome?.toLowerCase() ?? "";

      const descricao =
        produto.descricao?.toLowerCase() ?? "";

      const correspondeBusca =
        termo === "" ||
        nome.includes(termo) ||
        descricao.includes(termo);

      const correspondeCategoria =
        categoria === "todas" ||
        String(produto.categoria?.id) ===
          String(categoria);

      return (
        correspondeBusca &&
        correspondeCategoria
      );
    });

    return [...resultado].sort((a, b) => {
      const precoA =
        a.precoPromo &&
        Number(a.precoPromo) > 0 &&
        Number(a.precoPromo) < Number(a.preco)
          ? Number(a.precoPromo)
          : Number(a.preco);

      const precoB =
        b.precoPromo &&
        Number(b.precoPromo) > 0 &&
        Number(b.precoPromo) < Number(b.preco)
          ? Number(b.precoPromo)
          : Number(b.preco);

      if (ordenacao === "menor-preco") {
        return precoA - precoB;
      }

      if (ordenacao === "maior-preco") {
        return precoB - precoA;
      }

      if (ordenacao === "nome") {
        return a.nome.localeCompare(
          b.nome,
          "pt-BR"
        );
      }

      if (ordenacao === "ofertas") {
        return Number(b.oferta) - Number(a.oferta);
      }

      return 0;
    });
  }, [
    produtos,
    busca,
    categoria,
    ordenacao,
  ]);

  /*
   * =====================================================
   * LIMPAR FILTROS
   * =====================================================
   */

  function limparFiltros() {
    setBusca("");
    setCategoria("todas");
    setOrdenacao("padrao");

    router.push("/produtos");
  }

  const possuiFiltros =
    busca !== "" ||
    categoria !== "todas" ||
    ordenacao !== "padrao";

  return (
    <div className="mb-10">
      <div className="rounded-3xl border border-[#eadfd6] bg-[#fffaf5] p-5">

        <div className="grid gap-4 md:grid-cols-[1fr_220px_220px]">

          {/* BUSCA */}

          <div>
            <label
              htmlFor="busca-produtos"
              className="mb-2 block text-sm font-semibold text-[#2d2a26]"
            >
              Buscar produtos
            </label>

            <div className="relative">
              <input
                id="busca-produtos"
                type="search"
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
                placeholder="Digite o nome do produto..."
                className="w-full rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 pr-11 text-[#2d2a26] outline-none transition placeholder:text-[#a39a92] focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/10"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg">
                🔎
              </span>
            </div>
          </div>

          {/* CATEGORIA */}

          <div>
            <label
              htmlFor="filtro-categoria"
              className="mb-2 block text-sm font-semibold text-[#2d2a26]"
            >
              Categoria
            </label>

            <select
              id="filtro-categoria"
              value={categoria}
              onChange={(event) =>
                alterarCategoria(
                  event.target.value
                )
              }
              disabled={carregandoCategorias}
              className="w-full rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/10 disabled:cursor-wait disabled:opacity-70"
            >
              <option value="todas">
                {carregandoCategorias
                  ? "Carregando categorias..."
                  : "Todas as categorias"}
              </option>

              {categorias.map((item) => (
                <option
                  key={item.id}
                  value={String(item.id)}
                >
                  {item.nome}
                </option>
              ))}
            </select>
          </div>

          {/* ORDENAÇÃO */}

          <div>
            <label
              htmlFor="ordenacao-produtos"
              className="mb-2 block text-sm font-semibold text-[#2d2a26]"
            >
              Ordenar por
            </label>

            <select
              id="ordenacao-produtos"
              value={ordenacao}
              onChange={(event) =>
                setOrdenacao(event.target.value)
              }
              className="w-full rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/10"
            >
              <option value="padrao">
                Mais relevantes
              </option>

              <option value="menor-preco">
                Menor preço
              </option>

              <option value="maior-preco">
                Maior preço
              </option>

              <option value="nome">
                Nome: A–Z
              </option>

              <option value="ofertas">
                Ofertas primeiro
              </option>
            </select>
          </div>
        </div>

        {/* RESULTADO */}

        <div className="mt-4 flex flex-col justify-between gap-3 border-t border-[#eadfd6] pt-4 sm:flex-row sm:items-center">

          <p className="text-sm text-[#756f69]">
            <strong className="text-[#2d2a26]">
              {produtosFiltrados.length}
            </strong>{" "}
            {produtosFiltrados.length === 1
              ? "produto encontrado"
              : "produtos encontrados"}
          </p>

          {possuiFiltros && (
            <button
              type="button"
              onClick={limparFiltros}
              className="text-sm font-semibold text-[#e58b6f] transition hover:text-[#c96d53]"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
}