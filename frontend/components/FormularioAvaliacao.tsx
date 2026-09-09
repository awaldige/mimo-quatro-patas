
"use client";

import { FormEvent, useState } from "react";

interface FormularioAvaliacaoProps {
  produtoId: number;
}

export default function FormularioAvaliacao({
  produtoId,
}: FormularioAvaliacaoProps) {
  const [nome, setNome] = useState("");
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function enviarAvaliacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagem("");
    setErro("");

    if (!nome.trim()) {
      setErro("Digite seu nome.");
      return;
    }

    if (nota < 1 || nota > 5) {
      setErro("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    if (!comentario.trim()) {
      setErro("Digite um comentário sobre o produto.");
      return;
    }

    setEnviando(true);

    try {
      const apiUrl = (
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:3001/api"
      ).replace(/\/+$/, "");

      const resposta = await fetch(`${apiUrl}/avaliacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          nota,
          comentario: comentario.trim(),
          produtoId,
        }),
      });

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.erro ||
            "Não foi possível enviar sua avaliação."
        );
      }

      setNome("");
      setNota(0);
      setComentario("");

      setMensagem(
        "Avaliação enviada com sucesso! Ela será publicada após aprovação."
      );
    } catch (error) {
      console.error("[FormularioAvaliacao] Erro:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar sua avaliação."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mt-10 rounded-[2rem] border border-[#eadfd6] bg-[#fffaf5] p-6 md:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e58b6f]">
          Sua opinião
        </p>

        <h3 className="mt-2 text-2xl font-bold text-[#2d2a26]">
          Avalie este produto
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#756f69]">
          Conte para outros clientes o que você achou deste produto.
        </p>
      </div>

      <form
        onSubmit={enviarAvaliacao}
        className="mt-6 space-y-5"
      >
        {/* NOME */}

        <div>
          <label
            htmlFor="nome-avaliacao"
            className="mb-2 block text-sm font-semibold text-[#2d2a26]"
          >
            Seu nome
          </label>

          <input
            id="nome-avaliacao"
            type="text"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            placeholder="Digite seu nome"
            maxLength={100}
            disabled={enviando}
            className="w-full rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 text-sm text-[#2d2a26] outline-none transition placeholder:text-[#a39a92] focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* NOTA */}

        <div>
          <span className="mb-2 block text-sm font-semibold text-[#2d2a26]">
            Sua nota
          </span>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((estrela) => (
              <button
                key={estrela}
                type="button"
                onClick={() => setNota(estrela)}
                disabled={enviando}
                aria-label={`Dar ${estrela} ${
                  estrela === 1 ? "estrela" : "estrelas"
                }`}
                className="text-3xl transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  className={
                    estrela <= nota
                      ? "text-[#e58b6f]"
                      : "text-[#eadfd6]"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>

          <p className="mt-1 text-xs text-[#a39a92]">
            {nota === 0
              ? "Selecione uma nota"
              : `${nota} de 5 estrelas`}
          </p>
        </div>

        {/* COMENTÁRIO */}

        <div>
          <label
            htmlFor="comentario-avaliacao"
            className="mb-2 block text-sm font-semibold text-[#2d2a26]"
          >
            Comentário
          </label>

          <textarea
            id="comentario-avaliacao"
            value={comentario}
            onChange={(event) =>
              setComentario(event.target.value)
            }
            placeholder="Conte o que você achou do produto..."
            maxLength={1000}
            rows={5}
            disabled={enviando}
            className="w-full resize-none rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 text-sm leading-6 text-[#2d2a26] outline-none transition placeholder:text-[#a39a92] focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/20 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="mt-1 text-right text-xs text-[#a39a92]">
            {comentario.length}/1000
          </p>
        </div>

        {/* MENSAGEM DE ERRO */}

        {erro && (
          <div
            role="alert"
            className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
          >
            {erro}
          </div>
        )}

        {/* MENSAGEM DE SUCESSO */}

        {mensagem && (
          <div
            role="status"
            className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium leading-6 text-green-700"
          >
            ✓ {mensagem}
          </div>
        )}

        {/* BOTÃO */}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-full bg-[#e58b6f] px-6 py-4 font-semibold text-white shadow-sm transition hover:bg-[#c96d53] focus:outline-none focus:ring-2 focus:ring-[#e58b6f] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando
            ? "Enviando avaliação..."
            : "Enviar avaliação"}
        </button>
      </form>
    </div>
  );
}
