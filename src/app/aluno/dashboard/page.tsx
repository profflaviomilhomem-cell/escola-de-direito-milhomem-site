/**
 * Dashboard pós-login (blueprint Seção 9 do guia).
 * Saudação personalizada, progresso do curso, próxima aula sugerida,
 * atividade recente do fórum, anúncios institucionais.
 */
export default function DashboardPage() {
  return (
    <section className="mx-auto max-w-(--container-narrow) px-gutter py-stack">
      <h1 className="font-serif text-heading-1 text-tinta-700">
        Seu painel
      </h1>
      <p className="text-slate-700 mt-2">
        Dashboard placeholder · cards de progresso, próxima aula e fórum
        recente serão renderizados aqui.
      </p>
    </section>
  );
}
