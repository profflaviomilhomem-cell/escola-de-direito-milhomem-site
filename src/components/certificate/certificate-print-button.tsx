"use client";

/**
 * Botão "Baixar / Imprimir" do certificado. Dispara o diálogo nativo de
 * impressão do navegador (que inclui "Salvar como PDF"). As regras
 * `@media print` em globals.css escondem o cromo do site e deixam só o
 * diploma na folha A4 paisagem.
 */
export function CertificatePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border-amber text-paper hover:bg-amber hover:text-carbon fm-mono inline-block border px-5 py-2.5 text-[11px] tracking-[0.18em] uppercase transition-colors"
    >
      Baixar / Imprimir
    </button>
  );
}
