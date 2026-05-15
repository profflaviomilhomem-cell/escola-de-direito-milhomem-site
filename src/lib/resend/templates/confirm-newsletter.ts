/**
 * Template do e-mail de confirmação (duplo opt-in) da newsletter
 * "Bastidor da Acusação". Mantém a paleta navy/mostarda e tipografia
 * sóbria — clientes de e-mail aceitam pouco CSS, então o markup usa
 * tabela e estilo inline.
 */

export type ConfirmNewsletterEmail = {
  confirmUrl: string;
  name?: string;
};

export function renderConfirmNewsletterEmail(
  opts: ConfirmNewsletterEmail,
): { subject: string; html: string; text: string } {
  const safeName = opts.name?.trim() || "Olá";
  const subject = "Confirme sua inscrição — Bastidor da Acusação";

  const text = [
    `${safeName},`,
    ``,
    `Falta um clique para confirmar sua inscrição na newsletter Bastidor da Acusação,`,
    `da Escola Flávio Milhomem.`,
    ``,
    `Confirme aqui: ${opts.confirmUrl}`,
    ``,
    `Sem este passo a inscrição não é válida (LGPD).`,
    `Se você não solicitou, pode ignorar este e-mail — nenhum dado fica retido.`,
    ``,
    `— Equipe Editorial · Escola Flávio Milhomem`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#030024;color:#e0e0e0;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#030024;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#0b1f3d;border:1px solid rgba(241, 187, 65,0.25);">
            <tr>
              <td style="padding:32px 40px 16px 40px;font-family:Georgia,'Times New Roman',serif;color:#e0e0e0;">
                <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#f1bb41;">Escola Flávio Milhomem</p>
                <h1 style="margin:0;font-size:28px;line-height:1.2;color:#e0e0e0;">
                  Confirme sua inscrição na <em style="color:#f1bb41;font-style:italic;">Bastidor da Acusação</em>.
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 0 40px;font-size:16px;line-height:1.7;color:rgba(224, 224, 224,0.85);">
                <p style="margin:0 0 16px 0;">${escapeHtml(safeName)},</p>
                <p style="margin:0 0 16px 0;">
                  Falta um clique para validar sua inscrição. Sem essa confirmação, seu e-mail
                  não entra na lista (LGPD).
                </p>
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:24px 40px 8px 40px;">
                <a href="${opts.confirmUrl}"
                   style="display:inline-block;background:#f1bb41;color:#030024;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;padding:14px 22px;border-radius:2px;">
                  Confirmar inscrição
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 32px 40px;font-size:13px;line-height:1.6;color:rgba(224, 224, 224,0.55);">
                <p style="margin:16px 0 0 0;">
                  Se o botão não funcionar, copie este endereço no navegador:<br/>
                  <span style="word-break:break-all;color:rgba(224, 224, 224,0.75);">${escapeHtml(opts.confirmUrl)}</span>
                </p>
                <p style="margin:24px 0 0 0;">
                  Você não pediu essa inscrição? Apenas ignore este e-mail — nenhum dado fica retido.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px 40px;border-top:1px solid rgba(241, 187, 65,0.18);">
                <p style="margin:24px 0 0 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(224, 224, 224,0.55);">
                  Equipe Editorial · Brasília
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
