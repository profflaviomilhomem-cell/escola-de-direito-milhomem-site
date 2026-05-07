/**
 * Camadas decorativas globais (grid sutil + noise overlay).
 * Server component — só renderiza divs com classes CSS.
 */
export function BackgroundLayers() {
  return (
    <>
      <div className="fm-bg-grid" aria-hidden="true" />
      <div className="fm-bg-noise" aria-hidden="true" />
    </>
  );
}
