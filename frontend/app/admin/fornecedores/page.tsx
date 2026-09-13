"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Fornecedor {
id: number;
nome: string;
empresa?: string | null;
email?: string | null;
telefone?: string | null;
site?: string | null;
ativo: boolean;
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

async function lerResposta(response: Response) {
const texto = await response.text();

if (!texto) {
return null;
}

try {
return JSON.parse(texto);
} catch {
throw new Error(
`A API retornou uma resposta inválida. Status: ${response.status} ${response.statusText}`
);
}
}

function obterMensagemErro(
data: any,
mensagemPadrao: string
): string {
if (data?.message) {
return data.message;
}

if (data?.error) {
return data.error;
}

return mensagemPadrao;
}

export default function FornecedoresAdminPage() {
const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
const [carregando, setCarregando] = useState(true);
const [erro, setErro] = useState("");

const [mostrarFormulario, setMostrarFormulario] = useState(false);
const [editandoId, setEditandoId] = useState<number | null>(null);

const [nome, setNome] = useState("");
const [empresa, setEmpresa] = useState("");
const [email, setEmail] = useState("");
const [telefone, setTelefone] = useState("");
const [site, setSite] = useState("");
const [ativo, setAtivo] = useState(true);

const [salvando, setSalvando] = useState(false);
const [mensagem, setMensagem] = useState("");

async function carregarFornecedores() {
try {
setCarregando(true);
setErro("");


  const url = `${API_URL}/api/fornecedores`;

  console.log("[Fornecedores] Carregando:", url);

  const response = await fetch(url, {
    cache: "no-store",
  });

  const data = await lerResposta(response);

  if (!response.ok) {
    throw new Error(
      obterMensagemErro(
        data,
        "Erro ao carregar fornecedores."
      )
    );
  }

  const lista = Array.isArray(data)
    ? data
    : Array.isArray(data?.fornecedores)
    ? data.fornecedores
    : Array.isArray(data?.data)
    ? data.data
    : [];

  setFornecedores(lista);
} catch (error) {
  console.error("[Fornecedores] Erro:", error);

  setErro(
    error instanceof Error
      ? error.message
      : "Não foi possível carregar os fornecedores."
  );
} finally {
  setCarregando(false);
}


}

useEffect(() => {
carregarFornecedores();
}, []);

function limparFormulario() {
setNome("");
setEmpresa("");
setEmail("");
setTelefone("");
setSite("");
setAtivo(true);
setEditandoId(null);
setMensagem("");
}

function abrirFormulario() {
limparFormulario();
setErro("");
setMostrarFormulario(true);
}

function fecharFormulario() {
if (salvando) return;


setMostrarFormulario(false);
limparFormulario();


}

function editarFornecedor(fornecedor: Fornecedor) {
setEditandoId(fornecedor.id);
setNome(fornecedor.nome);
setEmpresa(fornecedor.empresa || "");
setEmail(fornecedor.email || "");
setTelefone(fornecedor.telefone || "");
setSite(fornecedor.site || "");
setAtivo(fornecedor.ativo);
setMensagem("");
setErro("");
setMostrarFormulario(true);


window.scrollTo({
  top: 0,
  behavior: "smooth",
});


}

async function salvarFornecedor(
event: React.FormEvent<HTMLFormElement>
) {
event.preventDefault();


if (!nome.trim()) {
  setMensagem("Informe o nome do fornecedor.");
  return;
}

try {
  setSalvando(true);
  setMensagem("");
  setErro("");

  const metodo = editandoId ? "PUT" : "POST";

  const url = editandoId
    ? `${API_URL}/api/fornecedores/${editandoId}`
    : `${API_URL}/api/fornecedores`;

  console.log("[Fornecedores] Salvando:", url);

  const response = await fetch(url, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      nome: nome.trim(),
      empresa: empresa.trim() || null,
      email: email.trim() || null,
      telefone: telefone.trim() || null,
      site: site.trim() || null,
      ativo,
    }),
  });

  const data = await lerResposta(response);

  if (!response.ok) {
    throw new Error(
      obterMensagemErro(
        data,
        editandoId
          ? "Não foi possível atualizar o fornecedor."
          : "Não foi possível criar o fornecedor."
      )
    );
  }

  setMensagem(
    editandoId
      ? "Fornecedor atualizado com sucesso!"
      : "Fornecedor criado com sucesso!"
  );

  await carregarFornecedores();

  setTimeout(() => {
    setMostrarFormulario(false);
    limparFormulario();
  }, 1000);
} catch (error) {
  console.error("[Fornecedores] Erro ao salvar:", error);

  setMensagem(
    error instanceof Error
      ? error.message
      : "Erro ao salvar fornecedor."
  );
} finally {
  setSalvando(false);
}


}

async function excluirFornecedor(fornecedor: Fornecedor) {
const confirmar = window.confirm(
`Deseja realmente desativar o fornecedor "${fornecedor.nome}"?`
);


if (!confirmar) return;

try {
  const url = `${API_URL}/api/fornecedores/${fornecedor.id}`;

  console.log("[Fornecedores] Excluindo:", url);

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await lerResposta(response);

  if (!response.ok) {
    throw new Error(
      obterMensagemErro(
        data,
        "Não foi possível excluir o fornecedor."
      )
    );
  }

  await carregarFornecedores();
} catch (error) {
  console.error("[Fornecedores] Erro ao excluir:", error);

  alert(
    error instanceof Error
      ? error.message
      : "Erro ao excluir fornecedor."
  );
}


}

return ( <main className="min-h-screen bg-[#fffaf5] px-6 py-10"> <div className="mx-auto max-w-7xl"> <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"> <div> <Link
           href="/admin/dashboard"
           className="text-sm font-semibold text-[#e58b6f] transition hover:text-[#c96d53]"
         >
← Voltar para o dashboard </Link>


        <h1 className="mt-3 text-3xl font-bold text-[#2d2a26]">
          Fornecedores
        </h1>

        <p className="mt-2 text-[#756f69]">
          Gerencie os fornecedores dos produtos da loja.
        </p>
      </div>

      <button
        type="button"
        onClick={abrirFormulario}
        className="rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53]"
      >
        + Novo fornecedor
      </button>
    </div>

    {mostrarFormulario && (
      <section className="mt-8 rounded-3xl border border-[#eadfd6] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#2d2a26]">
              {editandoId
                ? "Editar fornecedor"
                : "Novo fornecedor"}
            </h2>

            <p className="mt-1 text-sm text-[#756f69]">
              {editandoId
                ? "Atualize os dados do fornecedor."
                : "Cadastre um novo fornecedor para a loja."}
            </p>
          </div>

          <button
            type="button"
            onClick={fecharFormulario}
            disabled={salvando}
            className="text-sm font-semibold text-[#756f69] transition hover:text-[#c96d53]"
          >
            Fechar
          </button>
        </div>

        <form
          onSubmit={salvarFornecedor}
          className="mt-6 grid gap-5 md:grid-cols-2"
        >
          <div>
            <label
              htmlFor="nome"
              className="mb-2 block text-sm font-semibold text-[#2d2a26]"
            >
              Nome do fornecedor *
            </label>

            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(event) =>
                setNome(event.target.value)
              }
              placeholder="Ex.: Pet Distribuidora"
              disabled={salvando}
              className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f]"
            />
          </div>

          <div>
            <label
              htmlFor="empresa"
              className="mb-2 block text-sm font-semibold text-[#2d2a26]"
            >
              Empresa
            </label>

            <input
              id="empresa"
              type="text"
              value={empresa}
              onChange={(event) =>
                setEmpresa(event.target.value)
              }
              placeholder="Nome da empresa"
              disabled={salvando}
              className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f]"
            />
          </div>

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
              placeholder="contato@empresa.com"
              disabled={salvando}
              className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f]"
            />
          </div>

          <div>
            <label
              htmlFor="telefone"
              className="mb-2 block text-sm font-semibold text-[#2d2a26]"
            >
              Telefone
            </label>

            <input
              id="telefone"
              type="tel"
              value={telefone}
              onChange={(event) =>
                setTelefone(event.target.value)
              }
              placeholder="(11) 99999-9999"
              disabled={salvando}
              className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f]"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="site"
              className="mb-2 block text-sm font-semibold text-[#2d2a26]"
            >
              Site
            </label>

            <input
              id="site"
              type="url"
              value={site}
              onChange={(event) =>
                setSite(event.target.value)
              }
              placeholder="https://www.empresa.com.br"
              disabled={salvando}
              className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf5] px-4 py-3 text-[#2d2a26] outline-none transition focus:border-[#e58b6f]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(event) =>
                  setAtivo(event.target.checked)
                }
                disabled={salvando}
                className="h-5 w-5 accent-[#e58b6f]"
              />

              <span className="text-sm font-semibold text-[#2d2a26]">
                Fornecedor ativo
              </span>
            </label>
          </div>

          {mensagem && (
            <div className="md:col-span-2">
              <div className="rounded-2xl bg-[#fff4ec] px-4 py-3 text-sm font-semibold text-[#c96d53]">
                {mensagem}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {salvando
                ? "Salvando..."
                : editandoId
                ? "Atualizar fornecedor"
                : "Salvar fornecedor"}
            </button>

            <button
              type="button"
              onClick={fecharFormulario}
              disabled={salvando}
              className="rounded-full border border-[#eadfd6] px-6 py-3 font-semibold text-[#2d2a26] transition hover:bg-[#fff4ec]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </section>
    )}

    <section className="mt-8 overflow-hidden rounded-3xl border border-[#eadfd6] bg-white shadow-sm">
      {carregando ? (
        <div className="px-6 py-12 text-center text-[#756f69]">
          Carregando fornecedores...
        </div>
      ) : erro ? (
        <div className="px-6 py-12 text-center">
          <p className="font-semibold text-red-500">
            {erro}
          </p>

          <button
            type="button"
            onClick={carregarFornecedores}
            className="mt-4 rounded-full bg-[#e58b6f] px-5 py-2 font-semibold text-white"
          >
            Tentar novamente
          </button>
        </div>
      ) : fornecedores.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="text-6xl">🚚</div>

          <h2 className="mt-4 text-xl font-bold text-[#2d2a26]">
            Nenhum fornecedor cadastrado
          </h2>

          <p className="mt-2 text-[#756f69]">
            Cadastre o primeiro fornecedor para começar.
          </p>

          <button
            type="button"
            onClick={abrirFormulario}
            className="mt-6 rounded-full bg-[#e58b6f] px-6 py-3 font-semibold text-white transition hover:bg-[#c96d53]"
          >
            + Criar primeiro fornecedor
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-[#eadfd6] bg-[#fffaf5]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-[#2d2a26]">
                  Fornecedor
                </th>

                <th className="px-6 py-4 text-left text-sm font-bold text-[#2d2a26]">
                  Contato
                </th>

                <th className="px-6 py-4 text-left text-sm font-bold text-[#2d2a26]">
                  Site
                </th>

                <th className="px-6 py-4 text-center text-sm font-bold text-[#2d2a26]">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-sm font-bold text-[#2d2a26]">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {fornecedores.map((fornecedor) => (
                <tr
                  key={fornecedor.id}
                  className="border-b border-[#eadfd6] last:border-0"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff4ec] text-2xl">
                        🚚
                      </div>

                      <div>
                        <p className="font-bold text-[#2d2a26]">
                          {fornecedor.nome}
                        </p>

                        <p className="text-xs text-[#756f69]">
                          {fornecedor.empresa ||
                            "Empresa não informada"}
                        </p>

                        <p className="text-xs text-[#a39a92]">
                          ID: {fornecedor.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-sm text-[#756f69]">
                    <div>
                      {fornecedor.email && (
                        <p>{fornecedor.email}</p>
                      )}

                      {fornecedor.telefone && (
                        <p className="mt-1">
                          {fornecedor.telefone}
                        </p>
                      )}

                      {!fornecedor.email &&
                        !fornecedor.telefone && (
                          <span>
                            Sem contato informado
                          </span>
                        )}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-sm">
                    {fornecedor.site ? (
                      <a
                        href={fornecedor.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#e58b6f] hover:text-[#c96d53]"
                      >
                        Visitar site →
                      </a>
                    ) : (
                      <span className="text-[#756f69]">
                        Não informado
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        fornecedor.ativo
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {fornecedor.ativo
                        ? "Ativo"
                        : "Inativo"}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          editarFornecedor(fornecedor)
                        }
                        className="rounded-full border border-[#eadfd6] px-4 py-2 text-sm font-semibold text-[#2d2a26] transition hover:bg-[#fff4ec]"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          excluirFornecedor(fornecedor)
                        }
                        disabled={!fornecedor.ativo}
                        className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Desativar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  </div>
</main>


);
}
