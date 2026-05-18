/**
 * Camadas decorativas globais — marketing, aluno, professor e auth.
 *
 * `position: fixed` → o fundo fica fixo no viewport enquanto o conteúdo rola
 * (parece “seguir” o scroll, mas é overlay estático).
 *
 * Por defeito: só `fm-bg-mesh` (gradiente navy + luz mostarda).
 * Grid + noise desligados — textura granulada / malha (globals.css).
 *
 * Reativar texturas: `NEXT_PUBLIC_FM_BG_TEXTURE=1` em `.env.local`
 */
export function BackgroundLayers() {
  const textures = process.env.NEXT_PUBLIC_FM_BG_TEXTURE === "1";

  return (
    <>
      <div className="fm-bg-mesh" aria-hidden="true" />
      {textures ? (
        <>
          <div className="fm-bg-grid" aria-hidden="true" />
          <div className="fm-bg-noise" aria-hidden="true" />
        </>
      ) : null}
    </>
  );
}
