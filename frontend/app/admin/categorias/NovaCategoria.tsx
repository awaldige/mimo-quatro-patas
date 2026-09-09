"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const TAMANHO_MAXIMO = 5 * 1024 * 1024;

export default function NovaCategoria() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  // ============================================================
  // PREVIEW DA IMAGEM
  // ============================================================

  useEffect(() => {
    if (!imagem) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(imagem);

    setPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imagem]);

  // ============================================================
  // SELECIONAR IMAGEM
  // ============================================================

  function handleImagemChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = event.target.files?.[0];

    setErro("");
    setMensagem("");

    if (!arquivo) {
      setImagem(null);
      return;
    }

    const tiposPermitidos = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      setImagem(null);

      event.target.value = "";

      setErro(
        "Formato não permitido. Escolha uma imagem JPG, PNG ou WEBP."
      );

      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO) {
      setImagem(null);

      event.target.value = "";

      setErro(
        "A imagem é muito grande. O tamanho máximo permitido é 5 MB."
      );

      return;
    }

    setImagem(arquivo);
  }

  // ============================================================
  // ENVIAR FORMULÁRIO
  // ============================================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagem("");
    setErro("");

    if (!nome.trim()) {
      setErro("Informe o nome da categoria.");
      return;
    }

    try {
      setSalvando(true);

      const formData = new FormData();

      formData.append("nome", nome.trim());

      if (descricao.trim()) {
        formData.append("descricao", descricao.trim());
      }

      if (imagem) {
        formData.append("imagem", imagem);
      }

      const response = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível criar a categoria."
        );
      }

      setMensagem("Categoria criada com sucesso!");

      setNome("");
      setDescricao("");
      setImagem(null);
      setPreview("");

      const inputImagem = document.getElementById(
        "imagem-categoria"
      ) as HTMLInputElement | null;

      if (inputImagem) {
        inputImagem.value = "";
      }
    } catch (error) {
      console.error("[Categorias] Erro ao criar:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao criar categoria."
      );
    } finally {
      setSalvando(false);
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label
          htmlFor="nome"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Nome da categoria
        </label>

        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          placeholder="Ex.: Casa & Conforto"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="descricao"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Descrição
        </label>

        <textarea
          id="descricao"
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          placeholder="Descreva brevemente esta categoria..."
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="imagem-categoria"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Imagem da categoria
        </label>

        <input
          id="imagem-categoria"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImagemChange}
          className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
        />

        <p className="mt-2 text-xs text-gray-500">
          Formatos aceitos: JPG, PNG e WEBP. Tamanho máximo: 5 MB.
        </p>
      </div>

      {preview && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">
            Prévia da imagem
          </p>

          <div className="flex justify-center">
            <img
              src={preview}
              alt="Prévia da imagem da categoria"
              className="h-48 w-full max-w-md rounded-lg object-cover"
            />
          </div>

          {imagem && (
            <p className="mt-3 text-center text-xs text-gray-500">
              {imagem.name} ·{" "}
              {(imagem.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      )}

      {mensagem && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Criar categoria"}
        </button>
      </div>
    </form>
  );
}