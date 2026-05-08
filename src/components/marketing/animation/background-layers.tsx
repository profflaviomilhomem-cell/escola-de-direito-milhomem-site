/**
 * Camadas decorativas globais — pintadas em todas as páginas (marketing
 * + aluno) para criar uma atmosfera contínua.
 *
 * Ordem de pintura (do mais ao fundo para o mais à frente):
 *   1. fm-bg-mesh  — gradient navy + radials mostarda (luz ambiente)
 *   2. fm-bg-grid  — malha amber sutil (textura editorial)
 *   3. fm-bg-noise — granulado overlay (profundidade táctil)
 *
 * Conteúdo das páginas usa `relative z-10` para ficar acima dessas camadas.
 */
export function BackgroundLayers() {
  return (
    <>
      <div className="fm-bg-mesh" aria-hidden="true" />
      <div className="fm-bg-grid" aria-hidden="true" />
      <div className="fm-bg-noise" aria-hidden="true" />
    </>
  );
}
