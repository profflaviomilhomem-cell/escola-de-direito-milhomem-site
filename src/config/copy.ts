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
    taglineAlternativa: "Direito criminal pela perspectiva da acusação.",
    /** Uso externo (Instagram, materiais onde o MP já é contexto público) */
    bioInstagram:
      "Professor de Direito Penal · Perspectiva da acusação · Autor e docente há 25 anos",
    /** Referência interna — não usar no hero de captação */
    heroPvuInstitucional:
      "Direito criminal ensinado por quem está no Ministério Público — o lado que decide o que vira denúncia.",
  },

  site: {
    tagline: "Direito criminal pela perspectiva da acusação",
    pvuShort:
      "Cohorts com método, leitura de fontes e linguagem de tribunal — o ângulo da acusação explicado por quem leciona e publica no tema há 25 anos.",
    description:
      "Escola Flávio Milhomem — escola de direito criminal. Programas de direito penal e processo penal pela perspectiva da acusação, conduzidos por Flávio Milhomem, professor e autor, com formação na Universidade Católica Portuguesa e na École Nationale de la Magistrature.",
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
      titleLine2: "de direito",
      titleEmphasis2: "criminal",
      tagline:
        "Direito criminal pela perspectiva da acusação — com o rigor de quem ensina em sala e em tribunal, com método e leitura de fontes.",
      bio: "A Escola é conduzida por Flávio Milhomem, professor e autor, com 25 anos de docência e quatro obras na área criminal. Você estuda com método; a trajetória completa está na biografia.",
      ctaPrimary: "Conhecer a edição",
      ctaSecondary: "Receber o boletim",
      ctaCalculadora: "Calculadora de pena",
    },
    /** Depoimentos: ver `src/data/turma-fundadora-avaliacoes.ts` */
    testimonials: {
      eyebrow: "Turma fundadora",
      title: "Avaliações da",
      titleEmphasis: "turma fundadora",
    },
    calculadoraBand: {
      eyebrow: "Ferramenta gratuita",
      title: "Calculadora de",
      titleEmphasis: "pena",
      lead: "Simule regime, progressão e detração com base na legislação vigente — útil para estudo e revisão de casos.",
      cta: "Abrir calculadora",
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
      sectionEmphasis: "no curso",
      courseName: "Prova Digital no Processo Penal",
      ctaLabel: "Ver ementa completa",
    },
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
      priceDisplay: "297",
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
    coverTitleEmphasis: "direito criminal",
    coverSubtitle: "Programa inaugural · Brasília · 2026",
    sealLabel: "FM",
    gyroHint: "Toque para ativar o movimento",
  },

  edicaoLancamento: {
    eyebrow: "Cohort inaugural · turma fundadora",
    title: "Edição Lançamento — direito criminal pela",
    titleEmphasis: "perspectiva da acusação",
    lead:
      "Doze semanas em cohort, com trilha semanal, fórum por aula e encontros ao vivo. A Escola é conduzida por Flávio Milhomem — professor, autor e docente com 25 anos em sala. Sobre formação, obras e trajetória profissional, veja a",
    leadLinkLabel: "página Sobre",
    ctaInvestimento: "Ver investimento",
    ctaLista: "Entrar na lista de espera",
    videoNote:
      "Vídeo do professor no YouTube: metodologia de estudo com videoaulas e materiais em PDF — base da trilha em cohort.",
    videoTitle:
      "Como usar videoaulas e PDFs para memorizar Direito — Professor Flávio Milhomem",
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
        title: "Conteúdo gravado",
        body: "10 aulas em 2 módulos (cadeia de custódia e prova digital no processo), com vídeo editado e slides — a mesma ementa publicada na vitrine do curso.",
      },
    ] as const,
    paraQuemTitle: "Para quem é",
    paraQuemLead:
      "Concurseiros da área criminal e advogados em formação que querem dominar a construção da acusação, a prova e a sustentação em tribunal — com rigor e linguagem de banca.",
    paraQuemSim:
      "É para você se busca método aplicável, aceita dedicação semanal consistente e valoriza turma com acesso ao professor.",
    paraQuemNao:
      "Não é para você se espera videoteca passiva, sem participação no fórum, ou promessa de aprovação em concurso.",
    ementaTitle: "Ementa do curso (10 aulas)",
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
    investimentoPriceMain: "R$ 297,00",
    investimentoPriceInstallments: "",
    investimentoPriceLead: "",
    investimentoCheckoutNote:
      "Valor único da turma fundadora. Checkout online em implementação.",
    investimentoPix: "",
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
    depoimentosTitle: "Avaliações da turma fundadora",
    depoimentosLead:
      "Relatos de alunos da edição inaugural — publicados com autorização.",
    materiaisInclusosTitle: "Materiais inclusos",
    materiaisInclusos: [
      "Apostila densa por módulo (PDF)",
      "Mapa mental do programa",
      "Caderno de questões comentadas",
      "Decisões anotadas em PDF",
      "Certificado de 60–80h ao concluir a trilha",
    ] as const,
    faqExtra: [
      {
        q: "Posso assistir no celular?",
        a: "Sim. As aulas gravadas e o fórum funcionam no navegador mobile; recomendamos desktop para leitura de PDFs extensos.",
      },
      {
        q: "Há encontro presencial obrigatório?",
        a: "Não. O marco de 11 de agosto em Brasília é opcional e aberto a inscritos no evento; o cohort é predominantemente online.",
      },
    ] as const,
  },

  contato: {
    eyebrow: "Fale com a Escola",
    title: "Contato",
    lead: "Dúvidas sobre a Edição Lançamento, parcerias acadêmicas ou imprensa. Respondemos em até três dias úteis.",
    responseNote: "Prazo de resposta: até 3 dias úteis.",
    formTitle: "Enviar mensagem",
    formSuccess: "Mensagem recebida. Retornaremos em breve no e-mail informado.",
  },

  evento: {
    eyebrow: "11 · ago · 2026 · Brasília",
    title: "Dia do Advogado",
    titleEmphasis: "Abertura oficial",
    lead: "Painel sobre Direito Penal contemporâneo, aula inaugural de Flávio Milhomem e abertura formal das inscrições da Edição Lançamento. Vagas presenciais limitadas; transmissão online aberta.",
    agendaTitle: "Programação prevista",
    agenda: [
      "Credenciamento e café",
      "Painel: Direito Penal contemporâneo",
      "Aula inaugural — perspectiva da acusação",
      "Abertura das inscrições da Edição Lançamento",
    ] as const,
    rsvpTitle: "Inscrição gratuita",
    rsvpLead: "Garanta sua vaga presencial ou o link da transmissão. Você receberá confirmação por e-mail.",
    rsvpCta: "Confirmar presença",
    rsvpSuccess: "Inscrição registrada. Em breve você receberá os detalhes por e-mail.",
  },

  materiais: {
    bySlug: {
      "mapa-da-acusacao": {
        title: "Mapa da acusação",
        lead: "Visão geral em uma página: etapas da denúncia, prova e sustentação em tribunal — material de apoio ao estudo.",
      },
      "checklist-inquerito": {
        title: "Checklist do inquérito",
        lead: "Pontos de atenção na fase investigatória pela ótica acusatória — para revisão de casos e prova.",
      },
    },
  },

  sobre: {
    metaDescription:
      "Escola Flávio Milhomem — escola de direito criminal. Biografia de Flávio Milhomem: docência, obras e trajetória. Credenciais acadêmicas e informações institucionais.",
    introLead:
      "A Escola Flávio Milhomem é uma escola de direito criminal: programas de direito penal e processo penal pela perspectiva da acusação. Nesta página você conhece a proposta institucional e a trajetória de Flávio Milhomem — professor, autor e docente.",
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
