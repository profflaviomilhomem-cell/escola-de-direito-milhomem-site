"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 26/08/2026: aqui havia um `// TODO: encaminhar para Sentry` e um
    // console.error — que escreve no console DO VISITANTE. Quando a aplicação
    // quebrava para um aluno, ninguém do lado de cá ficava sabendo.
    // Agora o erro também vai para `/api/client-error`, que registra no log da
    // função. Não é Sentry; é o projeto saindo do zero de observabilidade.
    console.error("Erro de aplicação:", error);

    // `keepalive` para o envio sobreviver a uma navegação imediata; falha
    // silenciosa porque uma tela de erro não pode gerar um segundo erro.
    void fetch("/api/client-error", {
      method: "POST",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        path: typeof window === "undefined" ? "" : window.location.pathname,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <main className="fm-site-page py-page flex max-w-prose flex-1 flex-col items-center justify-center text-center">
      <p className="text-overline text-alerta-500">Erro inesperado</p>
      <h1 className="text-display-2 text-tinta-700 mt-3 font-serif">
        Algo saiu do trilho
      </h1>
      <p className="mt-stack max-w-md text-slate-700">
        Tentamos processar sua solicitação, mas encontramos um erro. Você pode
        tentar de novo ou voltar à home.
      </p>
      <button
        onClick={reset}
        className="bg-tinta-600 hover:bg-tinta-700 mt-stack inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium text-white transition-colors"
      >
        Tentar novamente
      </button>
    </main>
  );
}
