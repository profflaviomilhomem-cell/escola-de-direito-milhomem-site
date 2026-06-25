/**
 * Diploma visual do certificado — placeholder editorial enquanto a arte
 * oficial do design não chega. Renderiza em fundo claro (papel) com tinta
 * navy + dourado, independente do tema do site, para ficar legível na tela
 * e imprimir/salvar em PDF com fidelidade (ver regras `@media print` e a
 * seção `.fm-cert` em globals.css).
 *
 * Componente puramente apresentacional: recebe só strings já formatadas.
 * Escala por container queries (`cqw`) — a mesma marcação serve do card na
 * tela à folha A4 paisagem na impressão.
 */
type CertificateDiplomaProps = {
  /** Nome do aluno (titular). */
  userName: string;
  /** Nome do curso concluído. */
  productName: string;
  /** Data de emissão já formatada (ex.: "24 de junho de 2026"). */
  issuedAtLabel: string;
  /** Código público de validação (hash). */
  hash: string;
  /** URL de validação para exibição (sem protocolo). */
  validateUrl: string;
  /** Assinante institucional (professor/direção). */
  professorName: string;
  /** SVG (markup) do QR code da URL de validação. Opcional. */
  qrSvg?: string;
};

export function CertificateDiploma({
  userName,
  productName,
  issuedAtLabel,
  hash,
  validateUrl,
  professorName,
  qrSvg,
}: CertificateDiplomaProps) {
  return (
    <div
      className="fm-cert"
      role="img"
      aria-label={`Certificado de conclusão de ${userName} no curso ${productName}, emitido em ${issuedAtLabel}.`}
    >
      <div className="fm-cert__frame">
        <div className="fm-cert__inner">
          {/* eslint-disable-next-line @next/next/no-img-element -- print fidelity: <img> simples evita o pipeline do next/image na impressão */}
          <img
            src="/images/brand/logo-stacked-gold.png"
            alt="Escola Flávio Milhomem"
            className="fm-cert__logo"
          />

          <p className="fm-cert__eyebrow">Certificado de Conclusão</p>

          <p className="fm-cert__lead">A Escola Flávio Milhomem certifica que</p>
          <p className="fm-cert__name">{userName}</p>
          <span className="fm-cert__rule" aria-hidden="true" />

          <p className="fm-cert__body">concluiu com aproveitamento o curso</p>
          <p className="fm-cert__course">{productName}</p>

          <p className="fm-cert__date">Emitido em {issuedAtLabel}</p>

          <div className="fm-cert__foot">
            <div className="fm-cert__sign">
              <span className="fm-cert__sign-name">{professorName}</span>
              <span className="fm-cert__sign-srule" aria-hidden="true" />
              <span className="fm-cert__sign-role">
                Professor · Direção acadêmica
              </span>
            </div>
            <div className="fm-cert__valid">
              {qrSvg ? (
                <span
                  className="fm-cert__qr"
                  aria-hidden="true"
                  // SVG gerado no servidor a partir da URL de validação.
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : null}
              <span className="fm-cert__valid-text">
                <span className="fm-cert__valid-label">Validação pública</span>
                <span className="fm-cert__valid-code">{hash}</span>
                <span className="fm-cert__valid-url">{validateUrl}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
