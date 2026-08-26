/**
 * Spinner de carregamento das áreas logadas.
 *
 * Vivia em `src/app/loading.tsx`, na raiz — e ali custava caro: um
 * `loading.tsx` na raiz abre um Suspense que faz o Next despachar o shell
 * **com status 200** antes de a página resolver. Depois disso, `notFound()`
 * consegue trocar o corpo, mas não o status.
 *
 * O efeito, medido em produção em 26/08/2026: `/blog/<slug-inexistente>`,
 * `/cursos/<slug-inexistente>`, `/checkout/<slug-inexistente>` e
 * `/checkout/resultado/<id-falso>` respondiam **200** exibindo a página de
 * "não encontrada" — soft 404 clássico, com 79 artigos de blog no ar. Só o
 * catch-all estático devolvia 404 de verdade.
 *
 * Por isso o skeleton passou a viver apenas em `/aluno`, `/professor` e
 * `/admin`: áreas logadas, `noindex`, onde a espera é real e o status HTTP não
 * conversa com buscador nenhum.
 */
export function LoadingSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div
        className="border-tinta-200 border-t-dourado-500 h-12 w-12 animate-spin rounded-full border-4"
        role="status"
        aria-label="Carregando"
      />
    </div>
  );
}
