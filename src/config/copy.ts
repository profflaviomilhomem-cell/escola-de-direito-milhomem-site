/**
 * Copy e tom de voz — fonte única para textos institucionais.
 *
 * Tom: Sábio + Cuidador (Livro-Guia 1.7–1.8) — erudito acessível, concreto,
 * em segunda pessoa quando fala com o aluno, sem jargão de infomarketing.
 *
 * Estratégia: a Escola aparece em primeiro plano; Flávio como professor,
 * autor e voz do programa (identidade visível, sem explorar cargo institucional
 * na captação). Vínculo com o MPDFT e trajetória completa ficam em /sobre.
 *
 * DNA: `docs/adr/livro-guia-flavio.md` (Caps. 1, 1.5, 1.8, 9).
 */

export const copy = {
  legal: {
    marketingFootnote:
      "A Escola Flávio Milhomem é um projeto educacional privado. Não representa o Ministério Público e não utiliza cargo institucional para captação de alunos. O magistério é exercido em conformidade com a legislação aplicável.",
    sobreEscola:
      "As atividades da Escola são distintas da função institucional. Sobre vínculo com o MPDFT, formação e cargos, veja esta página em caráter biográfico.",
  },

  /** Variantes do guia 1.5 / 1.11 — uso por canal (redes, footer, biografia) */
  guia: {
    taglineInstitucional: "A Escola do Promotor.",
    taglineAlternativa: "Direito Penal pela perspectiva da acusação.",
    /** Uso externo (Instagram, materiais onde o MP já é contexto público) */
    bioInstagram:
      "Professor de Direito Penal · Perspectiva da acusação · Autor e docente há 25 anos",
    /** Referência interna — não usar no hero de captação */
    heroPvuInstitucional:
      "Direito Penal ensinado por quem está no Ministério Público — o lado que decide o que vira denúncia.",
  },

  site: {
    tagline: "Direito Penal pela perspectiva da acusação",
    pvuShort:
      "Cohorts com método, leitura de fontes e linguagem de tribunal — o ângulo da acusação explicado por quem leciona e publica no tema há 25 anos.",
    description:
      "Escola Flávio Milhomem — Direito Penal e Processo Penal pela perspectiva da acusação. Programas conduzidos por Flávio Milhomem, professor e autor, com formação na Universidade Católica Portuguesa e na École Nationale de la Magistrature.",
  },

  professor: {
    fullName: "Flávio Milhomem",
    marketingTitle: "Professor de Direito Penal e Processo Penal",
    marketingBioShort:
      "Professor, autor e docente há 25 anos. Obras em direito penal, processo penal e justiça militar; formação em Portugal e na França.",
    schemaJobTitle: "Professor de Direito Penal",
    bioRoleLine:
      "Promotor de Justiça do MPDFT desde 1996. Professor de Direito Penal há 25 anos.",
    careerYears: 30,
    teachingYears: 25,
    education: [
      {
        institution: "Universidade Católica Portuguesa",
        program: "Mestrado em Ciências Jurídico-Criminais",
      },
      {
        institution: "École Nationale de la Magistrature (França)",
        program: "Especialização",
      },
    ] as const,
  },

  home: {
    hero: {
      eyebrow: "Edição Lançamento · 11 de agosto · Brasília",
      titleLine1: "A",
      titleEmphasis1: "Escola",
      titleLine2: "de Direito",
      titleEmphasis2: "Penal",
      tagline:
        "Direito Penal pela perspectiva da acusação — com o rigor de quem ensina em sala e em tribunal, com método e leitura de fontes.",
      bio: "A Escola é conduzida por Flávio Milhomem, professor e autor, com 25 anos de docência e quatro obras na área criminal. Você estuda com método; a trajetória completa está na biografia.",
      ctaPrimary: "Conhecer a edição",
      ctaSecondary: "Receber o boletim",
    },
    stats: [
      { val: "30", label: "Anos de prática jurídica" },
      { val: "25", label: "Anos de docência superior" },
      { val: "IV", label: "Obras publicadas" },
      { val: "24k", label: "Seguidores na comunidade jurídica" },
    ] as const,
    manifesto: {
      title: "Por que a",
      titleEmphasis: "acusação",
      titleEnd: "importa no seu estudo.",
      body:
        "Grande parte do mercado ensina a defesa ou permanece no nível da apostila. Se você prepara concurso criminal, atua na advocacia ou quer entender como a denúncia se constrói, sabe que falta um recorte claro: a acusação, com precedentes, artigos e estratégia — sem atalhos vazios e sem promessas vazias.",
      linkLabel: "Ler a proposta da Escola",
    },
    programa: {
      sectionTitle: "O que você vai estudar",
      sectionEmphasis: "no programa",
      ctaLabel: "Ver ementa da edição",
    },
    modules: [
      {
        id: "01",
        title: "Teoria da Acusação",
        desc: "Como se estrutura a denúncia, onde a tipicidade é discutida na ótica acusatória e como a jurisprudência recente do STF e do STJ orienta a peça.",
      },
      {
        id: "02",
        title: "Tribunal do Júri",
        desc: "Plenário, réplica e tréplica: tese, ordem de argumentos e linguagem forense em crimes dolosos contra a vida.",
      },
      {
        id: "03",
        title: "Prova Penal",
        desc: "Cadeia de custódia, prova digital e valoração — o que a acusação precisa demonstrar e como sustentar no processo.",
      },
      {
        id: "04",
        title: "Direito Penal Militar",
        desc: "Competência da Justiça Militar e ritos específicos, com base nas publicações e na prática docente do professor.",
      },
      {
        id: "05",
        title: "Dosimetria",
        desc: "Aplicação trifásica na prática: cálculo, fundamentação e sustentação em plenário, com referência ao Código Penal e à jurisprudência.",
      },
      {
        id: "06",
        title: "Investigação e Compliance",
        desc: "Responsabilidade penal da pessoa jurídica, integridade e investigação sob o crivo da acusação contemporânea.",
      },
    ] as const,
    professorSection: {
      eyebrow: "Quem conduz a Escola",
      titleLine1: "Flávio",
      titleEmphasis: "Milhomem",
      lead:
        "Flávio Milhomem leciona Direito Penal e Processo Penal há 25 anos, é autor de obras adotadas em graduação e concurso, e formou-se academicamente na Universidade Católica Portuguesa e na École Nationale de la Magistrature.",
      body:
        "Você não recebe apenas videoaulas: recebe método, referências e espaço para dúvida — no formato de cohort, com fórum e encontros ao vivo na cadência do programa. Se a preparação pesa, a turma existe para sustentar o ritmo; a trajetória na carreira pública e os vínculos institucionais estão descritos com transparência na biografia.",
      ctaLabel: "Biografia e credenciais",
    },
    cohort: {
      eyebrow: "Edição Lançamento",
      title: "Cohort inaugural",
      titleEmphasis: "2026",
      priceDisplay: "1.997",
      priceSuffix: ",00",
      note: "Turma com acompanhamento no fórum e em encontros ao vivo — vagas limitadas para manter escala humana e resposta em até 72 horas.",
      cta: "Entrar na lista da edição",
      chips: [
        "Aulas em trilha semanal",
        "Fórum com resposta em até 72h",
        "Certificado de carga horária",
      ] as const,
    },
  },

  newsletter: {
    eyebrow: "Bastidor da Acusação",
    title: "Boletim quinzenal pelo",
    titleEmphasis: "ângulo da acusação",
    lead:
      "A cada quinze dias, na sua caixa de entrada: comentário a informativos do STJ e do STF em matéria penal, leitura recomendada e o que importa na Escola. Sem filler. Sem spam.",
  },

  dossie: {
    coverTitle1: "A Escola de",
    coverTitleEmphasis: "Direito Penal",
    coverSubtitle: "Programa inaugural · Brasília · 2026",
    sealLabel: "FM",
  },

  edicaoLancamento: {
    eyebrow: "Cohort inaugural · turma fundadora",
    title: "Edição Lançamento — Direito Penal pela",
    titleEmphasis: "perspectiva da acusação",
    lead:
      "Doze semanas em cohort, com trilha semanal, fórum por aula e encontros ao vivo. A Escola é conduzida por Flávio Milhomem — professor, autor e docente com 25 anos em sala. Sobre formação, obras e trajetória profissional, veja a",
    leadLinkLabel: "página Sobre",
    ctaInvestimento: "Ver investimento",
    ctaLista: "Entrar na lista de espera",
    videoNote:
      "Em breve: vídeo de abertura do professor, com a apresentação da edição e da metodologia.",
    pilaresTitle: "Por que esta edição",
    pilares: [
      {
        title: "Perspectiva da acusação",
        body: "O conteúdo parte de como a denúncia se forma, como a prova é produzida e como a tese se sustenta — recorte que raramente aparece com densidade em cursos generalistas.",
      },
      {
        title: "Cohort, não videoteca",
        body: "Turma com início e fim definidos, fórum por aula e encontros ao vivo. Você estuda com outros alunos e com acesso ao professor na cadência prevista.",
      },
      {
        title: "Trilha de doze semanas",
        body: "Seis módulos de duas semanas, entre 60 e 80 horas de carga, com certificado ao cumprir os requisitos da trilha.",
      },
    ] as const,
    paraQuemTitle: "Para quem é",
    paraQuemLead:
      "Concurseiros da área criminal e advogados em formação que querem dominar a construção da acusação, a prova e a sustentação em tribunal — com rigor e linguagem de banca.",
    paraQuemSim:
      "É para você se busca método aplicável, aceita dedicação semanal consistente e valoriza turma com acesso ao professor.",
    paraQuemNao:
      "Não é para você se espera videoteca passiva, sem participação no fórum, ou promessa de aprovação em concurso.",
    ementaTitle: "Ementa por módulo",
    cronogramaTitle: "Cronograma",
    cronogramaItems: [
      "Início previsto: 1º de setembro de 2026",
      "Duração: 12 semanas",
      "Carga estimada: 60–80 horas",
      "Marco presencial: 11 de agosto de 2026, Brasília (Dia do Advogado)",
    ] as const,
    comoFuncionaTitle: "Como funciona",
    comoFuncionaItems: [
      "Aulas gravadas liberadas semanalmente",
      "Fórum por aula, com resposta do professor em até 72 horas",
      "Quatro encontros ao vivo ao longo do cohort",
      "Acesso à plataforma por 12 meses após o encerramento da turma",
    ] as const,
    investimentoTitle: "Investimento · edição fundadora",
    investimentoPriceMain: "R$ 1.997",
    investimentoPriceInstallments: "12× de R$ 199 no cartão",
    investimentoPriceLead: "à vista ou",
    investimentoCheckoutNote:
      "PIX com 10% de desconto: R$ 1.797 · valores de referência do programa; checkout online em implementação.",
    investimentoPix:
      "PIX à vista com 10% de desconto: R$ 1.797. Inscrições online serão abertas após o evento de agosto.",
    investimentoSelo: "Turma fundadora · até 50 alunos",
    investimentoGarantia:
      "Garantia de 15 dias incondicionais, conforme política publicada em /reembolso.",
    investimentoCta: "Entrar na lista de espera",
    faqTitle: "Perguntas frequentes",
    faq: [
      {
        q: "Quando começa a turma?",
        a: "A previsão é 1º de setembro de 2026, cerca de três semanas após o evento de 11 de agosto em Brasília. A data final depende da abertura das inscrições.",
      },
      {
        q: "Quanto tempo por semana?",
        a: "Entre cinco e sete horas, somando aulas gravadas, leitura de materiais, fórum e encontros ao vivo.",
      },
      {
        q: "Como funciona o reembolso?",
        a: "Você tem 15 dias após a compra para solicitar reembolso integral, nos termos do Código de Defesa do Consumidor e da política da Escola.",
      },
      {
        q: "Há certificado?",
        a: "Sim — certificado de carga horária da Escola ao concluir os requisitos da trilha (percentual mínimo de aulas e participação previstos no regulamento da turma).",
      },
      {
        q: "O programa substitui preparatório de concurso?",
        a: "Não. A Edição aprofunda Direito Penal e Processo Penal pela ótica da acusação; pode complementar, mas não substitui, um preparatório generalista.",
      },
    ] as const,
    fechamentoTitle: "Entrar na Edição Lançamento",
    fechamentoNote: "Turma inaugural da Escola Flávio Milhomem",
    fechamentoCta: "Garantir prioridade na lista",
  },

  sobre: {
    metaDescription:
      "Escola Flávio Milhomem e biografia de Flávio Milhomem — docência, obras e trajetória no Direito Penal. Credenciais acadêmicas e informações institucionais.",
    introLead:
      "A Escola Flávio Milhomem reúne programas de Direito Penal e Processo Penal pela perspectiva da acusação. Nesta página você conhece a proposta institucional e a trajetória de Flávio Milhomem — professor, autor e docente.",
    introBody:
      "Se você estuda para concurso criminal, atua na advocacia ou busca formação continuada, aqui encontra método, fontes e linguagem de tribunal. O conteúdo é oferecido em caráter educacional privado, em separação da atuação oficial no Ministério Público.",
    portraitCaption: "Professor e autor · Docência e obras",
    credentialsLead:
      "Na carreira pública, Flávio Milhomem é Promotor de Justiça do Ministério Público do Distrito Federal e Territórios (MPDFT) desde 1996. Na docência, leciona Direito Penal e Processo Penal há 25 anos, com mestrado pela Universidade Católica Portuguesa e especialização pela École Nationale de la Magistrature francesa.",
    propostaClosing:
      "A Escola existe para transmitir, com rigor e ética, o modo de pensar a acusação — em cohort, com materiais densos e espaço para dúvida. O magistério privado não se confunde com a função institucional.",
  },
} as const;

export type SiteCopy = typeof copy;
