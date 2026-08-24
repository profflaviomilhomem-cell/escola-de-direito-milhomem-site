import {
  _resetarCacheDoSdk,
  carregarStreamSdk,
} from "@/lib/lessons/cloudflare-stream";

/**
 * O SDK do Stream é script de terceiro, e o teste que mais importa aqui é o do
 * fracasso: se ele não carregar, a AULA NÃO PODE QUEBRAR. Quem toca o vídeo é o
 * iframe do Cloudflare; o SDK serve só para ler o tempo assistido. Perder
 * telemetria é aceitável — perder a aula, não.
 */

const URL_SDK = "https://embed.cloudflarestream.com/embed/sdk.latest.js";

function scriptInjetado(): HTMLScriptElement | null {
  return document.querySelector<HTMLScriptElement>(`script[src="${URL_SDK}"]`);
}

beforeEach(() => {
  _resetarCacheDoSdk();
  document.head.innerHTML = "";
  delete (window as { Stream?: unknown }).Stream;
});

describe("carregarStreamSdk", () => {
  it("injeta o script oficial uma única vez", async () => {
    const p1 = carregarStreamSdk();
    const p2 = carregarStreamSdk();
    expect(document.querySelectorAll(`script[src="${URL_SDK}"]`)).toHaveLength(
      1,
    );

    const fabrica = jest.fn();
    (window as { Stream?: unknown }).Stream = fabrica;
    scriptInjetado()!.dispatchEvent(new Event("load"));

    expect(await p1).toBe(fabrica);
    expect(await p2).toBe(fabrica);
  });

  it("resolve null quando o script falha — e NÃO rejeita", async () => {
    const p = carregarStreamSdk();
    scriptInjetado()!.dispatchEvent(new Event("error"));
    // Rejeitar aqui viraria erro não tratado dentro do player.
    await expect(p).resolves.toBeNull();
  });

  it("resolve null se o script carrega mas não expõe a fábrica", async () => {
    const p = carregarStreamSdk();
    scriptInjetado()!.dispatchEvent(new Event("load"));
    await expect(p).resolves.toBeNull();
  });

  it("devolve a fábrica na hora quando o SDK já está na página", async () => {
    const fabrica = jest.fn();
    (window as { Stream?: unknown }).Stream = fabrica;
    await expect(carregarStreamSdk()).resolves.toBe(fabrica);
    // Nada a injetar: já estava lá.
    expect(scriptInjetado()).toBeNull();
  });

  it("aproveita um script já presente no documento sem duplicar", async () => {
    const existente = document.createElement("script");
    existente.src = URL_SDK;
    document.head.appendChild(existente);

    const p = carregarStreamSdk();
    expect(document.querySelectorAll(`script[src="${URL_SDK}"]`)).toHaveLength(
      1,
    );

    const fabrica = jest.fn();
    (window as { Stream?: unknown }).Stream = fabrica;
    existente.dispatchEvent(new Event("load"));
    await expect(p).resolves.toBe(fabrica);
  });
});
