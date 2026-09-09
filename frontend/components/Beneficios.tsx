
const beneficios = [
  {
    titulo: "Compra segura",
    descricao:
      "Uma experiência de compra simples e segura para você comprar com tranquilidade.",
    emoji: "🔒",
  },
  {
    titulo: "Produtos selecionados",
    descricao:
      "Produtos escolhidos pensando no conforto, diversão e bem-estar dos pets.",
    emoji: "❤️",
  },
  {
    titulo: "Para cães e gatos",
    descricao:
      "Uma seleção especial de produtos para os diferentes momentos da vida do seu pet.",
    emoji: "🐶",
  },
  {
    titulo: "Atendimento próximo",
    descricao:
      "Conte com a Mimo Quatro Patas para tirar dúvidas e receber suporte quando precisar.",
    emoji: "💬",
  },
];

export default function Beneficios() {
  return (
    <section className="bg-[#fffaf5] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-[#e58b6f]/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.15em] text-[#e58b6f]">
            Por que escolher a Mimo?
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#2d2a26] md:text-4xl">
            Cuidar do seu pet pode ser ainda mais especial
          </h2>

          <p className="mt-4 leading-7 text-[#756f69]">
            Criamos uma experiência pensada para quem considera seu pet
            parte da família.
          </p>
        </div>

        {/* Benefícios */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {beneficios.map((beneficio) => (
            <article
              key={beneficio.titulo}
              className="group relative overflow-hidden rounded-[2rem] border border-[#eadfd6] bg-white p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e58b6f]/40 hover:shadow-xl"
            >
              {/* Decoração */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#f6c85f]/10 transition duration-500 group-hover:scale-150" />

              {/* Ícone */}
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f6c85f]/20 text-4xl transition duration-300 group-hover:scale-110 group-hover:bg-[#f6c85f]/30">
                {beneficio.emoji}
              </div>

              {/* Título */}
              <h3 className="relative mt-6 text-lg font-bold text-[#2d2a26]">
                {beneficio.titulo}
              </h3>

              {/* Descrição */}
              <p className="relative mt-3 min-h-[96px] text-sm leading-6 text-[#756f69]">
                {beneficio.descricao}
              </p>

              {/* Indicador */}
              <div className="relative mx-auto mt-5 h-1 w-10 rounded-full bg-[#e58b6f]/30 transition-all duration-300 group-hover:w-16 group-hover:bg-[#e58b6f]" />
            </article>
          ))}
        </div>

        {/* Mensagem final */}
        <div className="mt-12 rounded-[2rem] border border-[#eadfd6] bg-white px-6 py-8 text-center shadow-sm md:px-10">
          <div className="text-3xl">🐾 ❤️ 🐾</div>

          <h3 className="mt-3 text-xl font-bold text-[#2d2a26]">
            Tudo pensado para quem ama pets
          </h3>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#756f69]">
            Na Mimo Quatro Patas, cada detalhe é pensado para tornar
            a experiência de cuidar do seu pet mais simples, especial
            e cheia de carinho.
          </p>
        </div>
      </div>
    </section>
  );
}
