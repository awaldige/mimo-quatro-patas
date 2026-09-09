"use client";

import { FormEvent, useState } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export default function FormularioAvaliacaoLoja() {
  const [nome, setNome] = useState("");
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  async function enviarAvaliacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setSucesso(false);

    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }

    if (!comentario.trim()) {
      setErro("Escreva um comentário.");
      return;
    }

    if (nota < 1 || nota > 5) {
      setErro("Selecione uma nota entre 1 e 5 estrelas.");
      return;
    }

    try {
      setEnviando(true);

      const resposta = await fetch(`${API_URL}/api/avaliacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          nota,
          comentario: comentario.trim(),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados?.message || "Não foi possível enviar sua avaliação."
        );
      }

      setSucesso(true);

      setNome("");
      setNota(5);
      setComentario("");
    } catch (error) {
      console.error(
        "[FormularioAvaliacaoLoja] Erro:",
        error
      );

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
    <div className="mx-auto mt-12 max-w-2xl">
      <div className="rounded-[2rem] border border-[#eadfd6] bg-[#fffaf5] p-6 shadow-sm md:p-8">
        <div className="text-center">
          <span className="text-3xl">🐾</span>

          <h3 className="mt-3 text-2xl font-bold text-[#2d2a26]">
            Conte para nós como foi sua experiência
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#756f69]">
            Sua opinião ajuda a Mimo Quatro Patas a oferecer uma
            experiência cada vez melhor.
          </p>
        </div>

        {sucesso && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-center text-sm font-medium text-green-700">
            Obrigado pela sua avaliação! 🐾
            <br />
            Ela será publicada após aprovação.
          </div>
        )}

        {erro && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm font-medium text-red-700">
            {erro}
          </div>
        )}

        <form
          onSubmit={enviarAvaliacao}
          className="mt-7 space-y-5"
        >
          {/* NOME */}

          <div>
            <label
              htmlFor="nome-avaliacao-loja"
              className="mb-2 block text-sm font-semibold text-[#2d2a26]"
            >
              Seu nome
            </label>

            <input
              id="nome-avaliacao-loja"
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Digite seu nome"
              maxLength={100}
              disabled={enviando}
              className="w-full rounded-xl border border-[#eadfd6] bg-white px-4 py-3 text-sm text-[#2d2a26] outline-none transition placeholder:text-[#a39a92] focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* NOTA */}

          <div>
            <p className="mb-2 block text-sm font-semibold text-[#2d2a26]">
              Como você avalia nossa loja?
            </p>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <button
                  key={estrela}
                  type="button"
                  onClick={() => setNota(estrela)}
                  disabled={enviando}
                  aria-label={`${estrela} estrelas`}
                  className="text-3xl transition hover:scale-110 disabled:cursor-not-allowed"
                >
                  <span
                    className={
                      estrela <= nota
                        ? "text-[#f6c85f]"
                        : "text-[#eadfd6]"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}

              <span className="ml-3 text-sm font-semibold text-[#756f69]">
                {nota} {nota === 1 ? "estrela" : "estrelas"}
              </span>
            </div>
          </div>

          {/* COMENTÁRIO */}

          <div>
            <label
              htmlFor="comentario-avaliacao-loja"
              className="mb-2 block text-sm font-semibold text-[#2d2a26]"
            >
              Sua avaliação
            </label>

            <textarea
              id="comentario-avaliacao-loja"
              value={comentario}
              onChange={(event) =>
                setComentario(event.target.value)
              }
              placeholder="Conte como foi sua experiência com a Mimo Quatro Patas..."
              maxLength={500}
              rows={5}
              disabled={enviando}
              className="w-full resize-none rounded-xl border border-[#eadfd6] bg-white px-4 py-3 text-sm leading-6 text-[#2d2a26] outline-none transition placeholder:text-[#a39a92] focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/10 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-1 text-right text-xs text-[#a39a92]">
              {comentario.length}/500
            </p>
          </div>

          {/* BOTÃO */}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-xl bg-[#e58b6f] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#d9785d] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando
              ? "Enviando avaliação..."
              : "Enviar minha avaliação"}
          </button>
        </form>
      </div>
    </div>
  );
}