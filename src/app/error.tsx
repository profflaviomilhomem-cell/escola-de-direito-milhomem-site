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
    // TODO: encaminhar para Sentry quando configurado.
    console.error("Erro de aplicação:", error);
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
