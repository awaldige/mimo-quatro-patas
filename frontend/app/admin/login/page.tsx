"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Informe o e-mail e a senha.");
      return;
    }

    try {
      setCarregando(true);

      const url = `${API_URL.replace(/\/$/, "")}/admin/login`;

      console.log("Tentando login em:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          senha,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("Resposta inválida do servidor.");
      }

      console.log("Resposta do login:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "E-mail ou senha inválidos."
        );
      }

      if (!data.admin) {
        throw new Error(
          "Administrador não retornado pela API."
        );
      }

      // Salva o administrador autenticado
      localStorage.setItem(
        "mimo_admin",
        JSON.stringify(data.admin)
      );

      console.log("Login realizado com sucesso.");

      // Vai diretamente para o painel
      router.replace("/admin/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);

      if (error instanceof TypeError) {
        setErro(
          "Não foi possível conectar ao servidor. Verifique se o backend está funcionando."
        );
      } else {
        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao realizar login."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-10">
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <div className="w-full max-w-md">

          {/* Cabeçalho */}
          <div className="mb-8 text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#e58b6f]">
              Mimo Quatro Patas
            </span>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2d2a26]">
              Painel Administrativo
            </h1>

            <p className="mt-2 text-[#756f69]">
              Entre para gerenciar sua loja.
            </p>
          </div>

          {/* Card de login */}
          <div className="rounded-3xl border border-[#eadfd6] bg-white p-8 shadow-lg">

            <h2 className="text-xl font-bold text-[#2d2a26]">
              Entrar
            </h2>

            <p className="mt-1 text-sm text-[#756f69]">
              Informe seus dados de administrador.
            </p>

            {/* Mensagem de erro */}
            {erro && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <strong>Erro:</strong> {erro}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              {/* E-mail */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="seu@email.com"
                  autoComplete="email"
                  disabled={carregando}
                  required
                  className="w-full rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 text-[#2d2a26] outline-none transition placeholder:text-[#a39a92] focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/10 disabled:bg-gray-50"
                />
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="senha"
                  className="mb-2 block text-sm font-semibold text-[#2d2a26]"
                >
                  Senha
                </label>

                <input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(event) =>
                    setSenha(event.target.value)
                  }
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  disabled={carregando}
                  required
                  className="w-full rounded-2xl border border-[#eadfd6] bg-white px-4 py-3 text-[#2d2a26] outline-none transition placeholder:text-[#a39a92] focus:border-[#e58b6f] focus:ring-2 focus:ring-[#e58b6f]/10 disabled:bg-gray-50"
                />
              </div>

              {/* Botão */}
              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-2xl bg-[#e58b6f] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {carregando
                  ? "Entrando..."
                  : "Entrar no painel"}
              </button>
            </form>

            {/* Voltar para loja */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => router.replace("/")}
                className="text-sm font-semibold text-[#e58b6f] transition hover:text-[#c96d53]"
              >
                ← Voltar para a loja
              </button>
            </div>
          </div>

          {/* Rodapé */}
          <p className="mt-6 text-center text-xs text-[#a39a92]">
            Mimo Quatro Patas • Área administrativa
          </p>
        </div>
      </div>
    </main>
  );
}