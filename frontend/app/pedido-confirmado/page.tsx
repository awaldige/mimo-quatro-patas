import Link from "next/link";

interface PedidoConfirmadoPageProps {
searchParams: Promise<{
id?: string;
}>;
}

export default async function PedidoConfirmadoPage({
searchParams,
}: PedidoConfirmadoPageProps) {
const params = await searchParams;
const pedidoId = params.id;

return ( <main className="min-h-screen bg-gray-50 px-4 py-12"> <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center"> <div className="w-full rounded-2xl bg-white p-8 text-center shadow-lg"> <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"> <span className="text-4xl text-green-600">✓</span> </div>


      <h1 className="text-3xl font-bold text-gray-900">
        Pedido realizado com sucesso!
      </h1>

      <p className="mt-4 text-gray-600">
        Obrigado pela sua compra na Mimo Quatro Patas.
      </p>

      {pedidoId && (
        <div className="mt-6 rounded-xl bg-gray-50 p-5">
          <p className="text-sm text-gray-500">
            Número do pedido
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            #{pedidoId}
          </p>
        </div>
      )}

      <p className="mt-6 text-sm text-gray-500">
        Seu pedido foi registrado com sucesso e será processado
        pela nossa equipe.
      </p>

      <div className="mt-8">
        <Link
          href="/produtos"
          className="inline-flex rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Continuar comprando
        </Link>
      </div>
    </div>
  </div>
</main>


);
}
