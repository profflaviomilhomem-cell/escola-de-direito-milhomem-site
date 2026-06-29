import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Reembolso",
  description:
    "Política de Reembolso da Escola Flávio Milhomem — 15 dias incondicionais e regras pós-prazo.",
  alternates: { canonical: "/reembolso" },
};

/**
 * Política de Reembolso — calibrada para a persona Mariana (Cap 8.4
 * do livro-guia). Texto final passa pela assessoria jurídica.
 */
export default function ReembolsoPage() {
  return (
    <LegalPage
      eyebrow="Política institucional"
      title="Política de Reembolso"
      lastUpdated="08 de maio de 2026"
      draftNotice="Documento em revisão pela assessoria jurídica. A redação final pode ajustar termos sem alterar as garantias abaixo."
      sections={[
        {
          id: "garantia-15-dias",
          number: 1,
          title: "15 dias incondicionais",
          body: (
            <>
              <p>
                Você tem 15 dias corridos a partir da matrícula para solicitar
                reembolso integral, sem precisar justificar. Esse prazo combina
                a garantia do art. 49 do Código de Defesa do Consumidor com a
                política institucional da Escola.
              </p>
              <p className="mt-4">
                Nesse período, qualquer aluno pode cancelar e receber 100% do
                valor pago de volta — pelo mesmo meio do pagamento.
              </p>
            </>
          ),
        },
        {
          id: "apos-15-dias",
          number: 2,
          title: "Após 15 dias",
          body: (
            <>
              <p>
                Entre o 16º e o 90º dia, oferecemos reembolso proporcional ao
                conteúdo ainda não entregue, descontados os módulos já
                liberados. A regra padrão da Edição Lançamento é:
              </p>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li>até 30% do conteúdo entregue: reembolso de 70%;</li>
                <li>entre 30% e 60% do conteúdo: reembolso de 40%;</li>
                <li>
                  acima de 60% do conteúdo: sem reembolso, mas mantemos seu
                  acesso até o fim do programa.
                </li>
              </ul>
              <p className="mt-4">
                Após 90 dias, o reembolso é avaliado caso a caso (mudança de
                quadro de saúde, transferência funcional etc.).
              </p>
            </>
          ),
        },
        {
          id: "como-solicitar",
          number: 3,
          title: "Como solicitar",
          body: (
            <p>
              Envie e-mail para{" "}
              <a
                className="text-amber underline-offset-2 hover:underline"
                href={`mailto:${siteConfig.contact.email}`}
              >
                {siteConfig.contact.email}
              </a>{" "}
              com o assunto <em>“Reembolso · [seu nome]”</em>, informando o
              e-mail usado na matrícula e a forma de pagamento original. Não
              precisa anexar comprovante — localizamos pelo Pagar.me.
            </p>
          ),
        },
        {
          id: "prazo-devolucao",
          number: 4,
          title: "Prazo de devolução",
          body: (
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Cartão de crédito</strong>: estorno em até 2 ciclos da
                fatura, conforme a operadora (até 60 dias).
              </li>
              <li>
                <strong>PIX</strong>: devolução em até 5 dias úteis na chave
                cadastrada na compra.
              </li>
              <li>
                <strong>Boleto</strong>: depósito em conta indicada por você em
                até 7 dias úteis após o envio dos dados bancários.
              </li>
            </ul>
          ),
        },
        {
          id: "casos-excepcionais",
          number: 5,
          title: "Casos não reembolsáveis",
          body: (
            <p>
              Não cabe reembolso em casos de violação destes Termos
              (compartilhamento de credenciais, distribuição não autorizada do
              conteúdo, fraude no pagamento). Decisões nesse sentido são
              comunicadas por escrito e podem ser revisadas mediante novo
              contraditório.
            </p>
          ),
        },
        {
          id: "duvidas",
          number: 6,
          title: "Dúvidas",
          body: (
            <p>
              Em caso de dúvida sobre prazos, valores ou aplicação desta
              política, escreva para{" "}
              <a
                className="text-amber underline-offset-2 hover:underline"
                href={`mailto:${siteConfig.contact.email}`}
              >
                {siteConfig.contact.email}
              </a>
              . Respondemos em até dois dias úteis.
            </p>
          ),
        },
      ]}
    />
  );
}
