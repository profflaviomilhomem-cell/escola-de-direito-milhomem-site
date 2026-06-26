import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/marketing/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de Uso da Escola Flávio Milhomem — regras de matrícula, conteúdo, pagamento e responsabilidades.",
  alternates: { canonical: "/termos" },
};

/**
 * Termos de Uso — esqueleto. O texto final é redigido pela assessoria
 * jurídica e ajustado conforme decisões da Fase 0 (CNPJ, política de
 * reembolso, contrato de assinatura).
 */
export default function TermosPage() {
  return (
    <LegalPage
      eyebrow="Contrato de uso"
      title="Termos de Uso"
      lastUpdated="08 de maio de 2026"
      draftNotice="Documento em revisão pela assessoria jurídica. A redação final pode ajustar termos sem alterar a estrutura abaixo."
      sections={[
        {
          id: "aceitacao",
          number: 1,
          title: "Aceitação dos termos",
          body: (
            <p>
              Ao se cadastrar, contratar curso, baixar material ou interagir com
              qualquer recurso da {siteConfig.name}, você declara ter lido e
              concordar com estes Termos. Se não concordar, encerre o uso
              imediatamente — não há prejuízo decorrente da não aceitação.
            </p>
          ),
        },
        {
          id: "cadastro",
          number: 2,
          title: "Cadastro e conta",
          body: (
            <p>
              Você é responsável por manter seus dados de acesso atualizados e
              em sigilo. O compartilhamento de credenciais é vedado e pode gerar
              bloqueio da conta sem reembolso. A conta é pessoal e
              intransferível.
            </p>
          ),
        },
        {
          id: "conteudo",
          number: 3,
          title: "Acesso ao conteúdo",
          body: (
            <p>
              O acesso ao conteúdo (aulas, materiais, fórum, certificado) é
              concedido durante o período da edição contratada. Aulas gravadas
              ficam disponíveis pelo prazo informado na página de cada produto.
              Encontros ao vivo são parte indissociável do programa cohort —
              ausências eventuais não geram reembolso isolado.
            </p>
          ),
        },
        {
          id: "pagamento",
          number: 4,
          title: "Pagamentos e assinaturas",
          body: (
            <p>
              Os pagamentos são processados pela Pagar.me e podem ser feitos em
              cartão de crédito, PIX ou boleto. Assinaturas mensais são
              renovadas automaticamente até cancelamento; o aluno pode cancelar
              a qualquer momento na página{" "}
              <Link
                href="/aluno/minha-conta"
                className="text-amber underline-offset-2 hover:underline"
              >
                Minha Conta
              </Link>
              . Falhas de pagamento geram retentativas em 3 ciclos com 3 dias de
              intervalo antes da suspensão.
            </p>
          ),
        },
        {
          id: "reembolso",
          number: 5,
          title: "Cancelamento e reembolso",
          body: (
            <p>
              Reembolso integral é garantido em até 15 dias da matrícula (CDC,
              art. 49 e prática institucional). Após esse prazo, regras
              específicas se aplicam — leia a{" "}
              <Link
                href="/reembolso"
                className="text-amber underline-offset-2 hover:underline"
              >
                Política de Reembolso
              </Link>{" "}
              para detalhes.
            </p>
          ),
        },
        {
          id: "propriedade",
          number: 6,
          title: "Direitos autorais e propriedade intelectual",
          body: (
            <>
              <p>
                Todo conteúdo (aulas, ementas, materiais, identidade visual,
                marcas) é de titularidade da {siteConfig.name} e/ou de seus
                autores. O acesso concedido é pessoal e não transfere
                propriedade.
              </p>
              <p className="mt-4">
                É vedado: gravar, redistribuir, retransmitir, publicar trechos,
                treinar modelos com o conteúdo, ou usar o material em curso
                concorrente. Violação caracteriza ilícito civil (Lei 9.610/98) e
                penal (CP, art. 184).
              </p>
            </>
          ),
        },
        {
          id: "conduta",
          number: 7,
          title: "Conduta no fórum e canais",
          body: (
            <p>
              Esperamos diálogo técnico e respeito entre alunos. Não toleramos
              ofensa pessoal, discurso de ódio, divulgação de dados de terceiros
              ou conteúdo ilegal. Mensagens fora do escopo são moderadas;
              reincidência leva a suspensão sem reembolso.
            </p>
          ),
        },
        {
          id: "responsabilidade",
          number: 8,
          title: "Limitação de responsabilidade",
          body: (
            <p>
              O conteúdo educacional não substitui consulta jurídica
              individualizada. A {siteConfig.name} responde pela qualidade
              didática do material, mas não responde pelo resultado de
              concursos, peças, decisões judiciais ou estratégias adotadas a
              partir do estudo. A calculadora de pena hipotética é didática e
              determinística, não constitui parecer.
            </p>
          ),
        },
        {
          id: "foro",
          number: 9,
          title: "Foro e legislação aplicável",
          body: (
            <p>
              Estes Termos são regidos pela legislação brasileira. Fica eleito o
              foro da comarca de Brasília · DF para dirimir controvérsias, salvo
              direito do consumidor de ajuizar no foro de seu domicílio (CDC,
              art. 101).
            </p>
          ),
        },
      ]}
    />
  );
}
