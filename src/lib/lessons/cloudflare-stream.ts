/**
 * Carregador do SDK do player do Cloudflare Stream.
 *
 * O embed do Stream é um `<iframe>`: de fora dele não há `onTimeUpdate` nem
 * `onEnded`. O SDK oficial abre essa porta — recebe o elemento do iframe e
 * devolve um objeto com os mesmos eventos e propriedades de um `<video>`.
 *
 * Documentação: https://developers.cloudflare.com/stream/viewing-videos/using-the-player-api/
 *
 * DEGRADA COM ELEGÂNCIA, de propósito. É script de terceiro: pode estar
 * bloqueado, fora do ar ou barrado por CSP no futuro. Se não carregar, o vídeo
 * continua tocando normalmente (quem toca é o iframe, não o SDK) — o aluno só
 * perde o progresso automático e usa o botão "marcar como concluída". Nunca
 * quebrar a aula por causa de telemetria.
 */

const URL_SDK = "https://embed.cloudflarestream.com/embed/sdk.latest.js";

/** Subconjunto da API do player que de fato usamos. */
export type StreamPlayer = {
  addEventListener: (evento: string, ouvinte: () => void) => void;
  removeEventListener?: (evento: string, ouvinte: () => void) => void;
  readonly currentTime: number;
  readonly duration: number;
};

type FabricaStream = (el: HTMLIFrameElement) => StreamPlayer;

declare global {
  interface Window {
    Stream?: FabricaStream;
  }
}

let pendente: Promise<FabricaStream | null> | null = null;

/**
 * Carrega o SDK uma vez por página e devolve a fábrica `Stream`.
 * Resolve `null` quando não dá para carregar — nunca rejeita.
 */
export function carregarStreamSdk(): Promise<FabricaStream | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.Stream) return Promise.resolve(window.Stream);
  if (pendente) return pendente;

  pendente = new Promise<FabricaStream | null>((resolver) => {
    const existente = document.querySelector<HTMLScriptElement>(
      `script[src="${URL_SDK}"]`,
    );
    const finalizar = () => resolver(window.Stream ?? null);

    if (existente) {
      existente.addEventListener("load", finalizar, { once: true });
      existente.addEventListener("error", () => resolver(null), { once: true });
      // Já carregado antes deste componente montar.
      if (window.Stream) finalizar();
      return;
    }

    const script = document.createElement("script");
    script.src = URL_SDK;
    script.async = true;
    script.addEventListener("load", finalizar, { once: true });
    script.addEventListener("error", () => resolver(null), { once: true });
    document.head.appendChild(script);
  });

  return pendente;
}

/** Só para teste: esquece o carregamento em andamento. */
export function _resetarCacheDoSdk(): void {
  pendente = null;
}
