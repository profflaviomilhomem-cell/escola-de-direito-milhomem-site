import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade da Escola Flávio Milhomem em conformidade com a LGPD (Lei 13.709/2018).",
  alternates: { canonical: "/privacidade" },
};

/**
 * Política de Privacidade — esqueleto LGPD. Texto final passa pela
 * assessoria jurídica antes de ir ao ar; manter os títulos/numeração
 * para que o jurídico apenas substitua o conteúdo de cada seção.
 */
export default function PrivacidadePage() {
  return (
    <LegalPage
      eyebrow="LGPD · Lei 13.709/2018"
      title="Política de Privacidade"
      lastUpdated="08 de maio de 2026"
      draftNotice="Documento em revisão pela assessoria jurídica. A redação final pode ajustar termos sem alterar a estrutura abaixo."
      sections={[
        {
          id: "controlador",
          number: 1,
          title: "Quem é o controlador dos seus dados",
          body: (
            <>
              <p>
                A {siteConfig.name} é o controlador dos dados pessoais tratados
                neste site, conforme art. 5º, VI, da LGPD. Operações de
                tratamento são realizadas em nome do professor Flávio Milhomem
                (CNPJ a ser informado), com endereço institucional em Brasília
                · DF.
              </p>
              <p className="mt-4">
                Para qualquer assunto envolvendo proteção de dados, escreva
                para{" "}
                <a
                  className="text-amber underline-offset-2 hover:underline"
                  href={`mailto:${siteConfig.contact.privacyEmail}`}
                >
                  {siteConfig.contact.privacyEmail}
                </a>
                . O prazo de resposta é de até 15 dias.
              </p>
            </>
          ),
        },
        {
          id: "dados-coletados",
          number: 2,
          title: "Quais dados coletamos",
          body: (
            <>
              <p>Coletamos o mínimo necessário para o serviço solicitado:</p>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li>
                  <strong>Identificação</strong>: nome e e-mail (newsletter,
                  cadastro de aluno, formulário de contato).
                </li>
                <li>
                  <strong>Pagamento</strong>: dados de cartão e CPF/CNPJ
                  tratados pela Pagar.me; só recebemos identificadores de
                  transação.
                </li>
                <li>
                  <strong>Navegação</strong>: páginas visitadas, origem
                  (UTM/refer), Web Vitals, eventos de produto (tudo agregado).
                </li>
                <li>
                  <strong>Conteúdo do aluno</strong>: progresso, comentários no
                  fórum, certificados emitidos.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "bases-legais",
          number: 3,
          title: "Finalidades e bases legais",
          body: (
            <>
              <p>
                Tratamos dados conforme o art. 7º da LGPD, com as seguintes
                bases:
              </p>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li>
                  <strong>Consentimento</strong> (newsletter, marketing) — você
                  pode revogar a qualquer momento.
                </li>
                <li>
                  <strong>Execução de contrato</strong> (matrícula, acesso ao
                  curso, pagamento, certificado).
                </li>
                <li>
                  <strong>Cumprimento de obrigação legal</strong> (emissão
                  fiscal, prazos tributários).
                </li>
                <li>
                  <strong>Legítimo interesse</strong> (segurança, prevenção a
                  fraude, melhoria didática anônima).
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "compartilhamento",
          number: 4,
          title: "Compartilhamento com terceiros",
          body: (
            <>
              <p>
                Não vendemos dados. Operadores que recebem dados estritamente
                para entregar o serviço:
              </p>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li>Pagar.me — processamento de pagamento (CNPJ próprio).</li>
                <li>Resend — envio de e-mail transacional e newsletter.</li>
                <li>Vercel — hospedagem da aplicação.</li>
                <li>Neon — banco de dados gerenciado.</li>
                <li>Cloudflare — entrega de vídeo e proteção de borda.</li>
                <li>
                  PostHog (auto-hospedado) e Google Analytics 4 — analytics
                  agregado.
                </li>
              </ul>
              <p className="mt-4">
                Cada operador tem contrato dedicado de tratamento de dados.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          number: 5,
          title: "Cookies e tecnologias similares",
          body: (
            <p>
              Usamos cookies necessários (sessão de aluno, preferências) e
              cookies analíticos (somente após consentimento via banner). O
              banner permite aceitar, recusar ou personalizar a escolha por
              categoria; sua decisão é registrada e pode ser alterada a
              qualquer momento na página de preferências.
            </p>
          ),
        },
        {
          id: "retencao",
          number: 6,
          title: "Tempo de retenção",
          body: (
            <ul className="ml-6 list-disc space-y-2">
              <li>
                Lead em newsletter: enquanto a inscrição estiver ativa; até 30
                dias após o cancelamento.
              </li>
              <li>
                Conta de aluno: durante o relacionamento e por 5 anos após o
                encerramento (prazo prescricional consumerista).
              </li>
              <li>
                Dados fiscais: pelo prazo legal (mínimo 5 anos, conforme CTN).
              </li>
              <li>Logs de segurança: 6 meses.</li>
            </ul>
          ),
        },
        {
          id: "seguranca",
          number: 7,
          title: "Segurança",
          body: (
            <p>
              Aplicamos medidas técnicas e administrativas razoáveis:
              criptografia em trânsito (TLS), senhas com hash (bcrypt),
              controle de acesso por papéis, auditoria de operações
              administrativas e revisão periódica de dependências. Em caso de
              incidente de segurança que possa gerar risco relevante,
              comunicamos a ANPD e os titulares afetados nos prazos legais.
            </p>
          ),
        },
        {
          id: "direitos",
          number: 8,
          title: "Seus direitos como titular",
          body: (
            <>
              <p>Você pode, a qualquer tempo, exercer:</p>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li>confirmação da existência de tratamento;</li>
                <li>acesso aos dados;</li>
                <li>correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>
                  anonimização, bloqueio ou eliminação de dados desnecessários;
                </li>
                <li>portabilidade;</li>
                <li>eliminação dos dados tratados com base no consentimento;</li>
                <li>revogação do consentimento.</li>
              </ul>
              <p className="mt-4">
                Pedidos por e-mail para{" "}
                <a
                  className="text-amber underline-offset-2 hover:underline"
                  href={`mailto:${siteConfig.contact.privacyEmail}`}
                >
                  {siteConfig.contact.privacyEmail}
                </a>
                . Para autenticidade, podemos pedir confirmação de identidade.
              </p>
            </>
          ),
        },
        {
          id: "dpo",
          number: 9,
          title: "Encarregado pelo tratamento (DPO)",
          body: (
            <p>
              O DPO é um advogado externo nomeado especificamente para esta
              função. Identificação completa, registro profissional e canais
              serão publicados aqui assim que a designação for finalizada
              (Fase 0.3 do checklist operacional).
            </p>
          ),
        },
        {
          id: "atualizacoes",
          number: 10,
          title: "Atualizações desta política",
          body: (
            <p>
              Esta política pode ser revisada para refletir novas leis, novos
              produtos ou novos operadores. A data de Última atualização sempre
              fica visível no topo, e mudanças relevantes são comunicadas por
              e-mail aos titulares ativos.
            </p>
          ),
        },
      ]}
    />
  );
}
