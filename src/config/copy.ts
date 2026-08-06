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
      "Professor de Direito Penal · Perspectiva da acusação · Autor e docente há 30 anos",
    /** Referência interna — não usar no hero de captação */
    heroPvuInstitucional:
      "Direito criminal ensinado por quem está no Ministério Público — o lado que decide o que vira denúncia.",
  },

  site: {
    tagline: "Direito criminal pela perspectiva da acusação",
    pvuShort:
      "Cohorts com método, leitura de fontes e linguagem de tribunal — o ângulo da acusação explicado por quem leciona e publica no tema há 30 anos.",
    description:
      "Escola Flávio Milhomem — escola de direito criminal. Programas de direito penal e processo penal pela perspectiva da acusação, conduzidos por Flávio Milhomem, professor e autor, com formação na Universidade Católica Portuguesa e na École Nationale de la Magistrature.",
  },

  professor: {
    fullName: "Flávio Milhomem",
    marketingTitle: "Professor de Direito Penal e Processo Penal",
    marketingBioShort:
      "Professor, autor e docente há 30 anos. Obras em direito penal, processo penal e justiça militar; formação em Portugal e na França.",
    schemaJobTitle: "Professor de Direito Penal",
    bioRoleLine:
      "Promotor de Justiça do MPDFT desde 1996. Professor de Direito Penal há 30 anos.",
    careerYears: 30,
    teachingYears: 30,
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
      // 06/08/2026: era "Edição Lançamento · 11 de agosto · Brasília". O site
      // entra no ar em 17/08 — o texto mais visível da home anunciava o
      // lançamento numa data já vencida para quem chega. Agora o eyebrow diz o
      // que o visitante pode fazer HOJE (se inscrever) e quando a turma começa,
      // que é a distinção que faltava na página inteira.
      eyebrow:
        "Edição Lançamento · inscrições abertas · turma começa 1º de setembro",
      titleLine1: "A",
      titleEmphasis1: "Escola",
      titleLine2: "de direito",
      titleEmphasis2: "criminal",
      tagline:
        "Direito criminal pela perspectiva da acusação — com o rigor de quem ensina em sala e aplica no tribunal, com método e leitura de fontes.",
      bio: "A maioria dos cursos de direito criminal ensina para a prova. Este foi construído para a prática.",
      ctaPrimary: "Conhecer o curso",
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
      { val: "30", label: "Anos de docência superior" },
      { val: "IV", label: "Obras publicadas" },
      { val: "24k", label: "Seguidores na comunidade jurídica" },
    ] as const,
    manifesto: {
      title: "Feito para a",
      titleEmphasis: "prática",
      titleEnd: "forense.",
      paragraphs: [
        "A maioria dos cursos de direito criminal ensina para a prova. Este foi construído para a prática.",
        "Se você atua na advocacia criminal, ou quer começar a atuar com consistência, já percebeu que falta algo nos cursos do mercado: a visão de quem está do outro lado.",
        "Não basta dominar a teoria. Para defender bem, é preciso entender como a acusação pensa, como constrói sua estratégia e quais precedentes utiliza para sustentar uma denúncia ou um recurso.",
        "É exatamente isso que você vai encontrar aqui.",
        "Conteúdo produzido por um Promotor de Justiça em atividade, com mais de três décadas de atuação no sistema de justiça criminal, sem apostila reciclada, sem promessa vaga, sem atalho que não existe.",
      ] as const,
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
      lead: "Flávio Milhomem leciona Direito Penal e Processo Penal há 30 anos, é autor de obras adotadas em graduação e concurso, e formou-se academicamente na Universidade Católica Portuguesa e na École Nationale de la Magistrature.",
      body: "Você não recebe apenas videoaulas: recebe método, referências e espaço para dúvida — no formato de cohort, com fórum e encontros ao vivo na cadência do programa. Se a preparação pesa, a turma existe para sustentar o ritmo; a trajetória na carreira pública e os vínculos institucionais estão descritos com transparência na biografia.",
      ctaLabel: "Biografia e credenciais",
    },
    cohort: {
      eyebrow: "Edição Lançamento · turma fundadora",
      title: "Prova Digital no",
      titleEmphasis: "Processo Penal",
      priceDisplay: "297",
      priceSuffix: ",00",
      note: "Turma com acompanhamento no fórum e em encontros ao vivo — vagas limitadas para manter escala humana e resposta em até 72 horas.",
      cta: "Entrar na lista da edição",
      chips: [
        "Aulas em trilha semanal",
        "Fórum com resposta em até 72h",
        "Certificado de conclusão",
      ] as const,
    },
  },

  newsletter: {
    eyebrow: "Bastidor da Acusação",
    title: "Boletim quinzenal pelo",
    titleEmphasis: "ângulo da acusação",
    lead: "A cada quinze dias, na sua caixa de entrada: comentário a informativos do STJ e do STF em matéria penal, leitura recomendada e o que importa na Escola. Sem filler. Sem spam.",
  },

  dossie: {
    coverTitle1: "A Escola de",
    coverTitleEmphasis: "direito criminal",
    coverSubtitle: "Programa inaugural · Brasília · 2026",
    sealLabel: "FM",
    gyroHint: "Toque para ativar o movimento",
  },

  edicaoLancamento: {
    eyebrow: "Edição Lançamento · cohort inaugural · turma fundadora",
    title: "Prova Digital no",
    titleEmphasis: "Processo Penal",
    lead: "O curso da Edição Lançamento da Escola: prova digital e cadeia de custódia pela perspectiva da acusação, em doze semanas de cohort com trilha semanal, fórum por aula e encontros ao vivo. Conduzido por Flávio Milhomem — professor, autor e docente com 30 anos em sala. Sobre formação, obras e trajetória profissional, veja a",
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
      "Público profissional: advogados criminalistas, delegados, membros do Ministério Público e magistrados que lidam com prova digital no processo penal — e quem quer dominar a construção da acusação, a prova e a sustentação em tribunal.",
    paraQuemSim:
      "É para você se atua (ou quer atuar) no processo penal, busca método aplicável e valoriza turma com acesso ao professor.",
    paraQuemNao:
      // Referência ao "Direito Penal em Questões, na Eduzz" removida em 04/08/2026:
      // produto inativo (conta do professor restrita). Ver `data/produtos-escola.ts`.
      "Não é para você se espera videoteca passiva, sem participação no fórum, ou promessa de aprovação em concurso — esta edição é sobre método de trabalho no processo penal, não sobre preparação para provas objetivas.",
    ementaTitle: "Ementa do curso (10 aulas)",
    cronogramaTitle: "Cronograma",
    // Reordenado em 06/08/2026. O cronograma começava pelo início da turma e
    // nunca dizia quando as inscrições abriam — quem chegasse no dia 17 não
    // tinha como saber que estava comprando vaga numa turma que só começa em
    // setembro. A sequência abaixo torna essa distinção explícita, que é o
    // ponto do art. 30 do CDC: a oferta veiculada vincula, então ela precisa
    // dizer o que o comprador recebe e quando.
    cronogramaItems: [
      "Inscrições abertas: 17 de agosto de 2026",
      "Início da turma: 1º de setembro de 2026",
      "Duração: 12 semanas — encerramento previsto para 23 de novembro de 2026",
      // Carga horária real, medida nos arquivos de vídeo em 04/08/2026 (2h47min37s
      // somando as 10 aulas). O texto anterior anunciava "60–80 horas", número que
      // não corresponde a nada medido — carga inflada em peça assinada por Promotor
      // de Justiça em atividade é o risco que o cap. 9 do Livro-Guia existe para
      // evitar. Se o professor quiser declarar carga de estudo maior (somando
      // slides, materiais e questões), o número precisa vir de um plano de estudos
      // escrito, e esta linha muda junto com a do certificado.
      "Conteúdo gravado: 10 aulas · 2h47",
      // Removido em 06/08/2026: "Marco presencial: 11 de agosto de 2026, Brasília
      // (Dia do Advogado)". O site entra no ar em 17/08 — a data já teria passado
      // quando o primeiro visitante lesse a linha, e um cronograma de curso que
      // abre com um marco vencido queima a credibilidade do resto da página.
      // Se o evento acontecer e o professor quiser citá-lo, o lugar é a seção de
      // autoridade, no passado ("participou de"), nunca o cronograma da turma.
    ] as const,
    comoFuncionaTitle: "Como funciona",
    // Cada linha aqui é oferta veiculada — art. 30 do CDC vincula o fornecedor
    // ao que anunciou, e o público é de advogados. Só entra o que a Escola
    // consegue cumprir. Duas observações de 06/08/2026:
    //
    // 1. "Liberadas semanalmente" depende de alguém publicar cada aula no
    //    painel do professor: `Lesson.publishedAt` é liga/desliga, não há
    //    liberação por data no código. São 12 publicações manuais ao longo da
    //    turma. Se isso virar risco operacional, ou se automatiza, ou a linha
    //    muda para "todas as aulas disponíveis desde o início".
    // 2. As datas dos quatro encontros ainda não existem. Enquanto não vierem
    //    do professor, a linha promete os encontros (que é o que vincula) sem
    //    inventar calendário. Quando as datas chegarem, elas entram aqui e no
    //    cronograma — e aí a cláusula de "parte indissociável" em /termos passa
    //    a ter data publicada para se apoiar.
    comoFuncionaItems: [
      "Aulas gravadas liberadas semanalmente ao longo das 12 semanas",
      "Fórum por aula, com resposta do professor em até 72 horas",
      "Quatro encontros ao vivo ao longo do cohort — datas divulgadas na abertura da turma",
      "Acesso à plataforma por 12 meses após o encerramento da turma",
    ] as const,
    investimentoTitle: "Investimento · edição fundadora",
    investimentoPriceMain: "R$ 297,00",
    investimentoPriceInstallments: "",
    investimentoPriceLead: "",
    investimentoCheckoutNote:
      "Valor único da turma fundadora. Pagamento via PIX ou boleto (Pagar.me).",
    investimentoSelo: "Turma fundadora · até 50 alunos",
    investimentoGarantia:
      "Garantia de 15 dias incondicionais, conforme política publicada em /reembolso.",
    investimentoCta: "Garantir minha vaga",
    faqTitle: "Perguntas frequentes",
    faq: [
      {
        q: "Quando começa a turma?",
        // Reescrito em 06/08/2026. A resposta anterior ancorava a data no "evento
        // de 11 de agosto em Brasília" — evento anterior à entrada do site no ar
        // (17/08), que o leitor encontraria já vencido.
        a: "A turma começa em 1º de setembro de 2026 e vai até 23 de novembro. As inscrições abrem em 17 de agosto — quem garante a vaga agora recebe os acessos e o calendário completo por e-mail antes do primeiro dia.",
      },
      {
        q: "Quanto tempo por semana?",
        // Reescrito em 06/08/2026. A resposta anterior dizia "entre cinco e sete
        // horas" por semana — vezes 12 semanas, são 60 a 84 horas, exatamente a
        // carga inflada que a linha do cronograma corrigiu em 04/08 (o conteúdo
        // gravado tem 2h47 no total, medido nos arquivos). O número tinha voltado
        // pela porta dos fundos, expresso por semana em vez de no total.
        // Regra desta página: só entra número que alguém mediu. Tempo de estudo do
        // aluno não foi medido e por isso não é anunciado como se tivesse sido.
        a: "O conteúdo gravado soma 2h47, distribuídas em 10 aulas ao longo da turma — cerca de 15 minutos de vídeo por semana. O tempo total de dedicação depende de quanto você aprofundar nos materiais, no fórum e nas leituras indicadas.",
      },
      {
        q: "Como funciona o reembolso?",
        a: "Você tem 15 dias após a compra para solicitar reembolso integral, nos termos do Código de Defesa do Consumidor e da política da Escola.",
      },
      {
        q: "Há certificado?",
        // O texto anterior condicionava o certificado a "percentual mínimo de aulas
        // e participação previstos no regulamento da turma" — regulamento que NÃO
        // existe. O critério real está em `lib/certificates.ts`: 100% das aulas
        // concluídas. Descrever o critério que o código aplica, e só ele.
        a: "Sim — certificado de conclusão da Escola, emitido automaticamente ao concluir as 10 aulas da trilha, com código de validação pública.",
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
      "Certificado de conclusão ao concluir as 10 aulas",
    ] as const,
    // Bloco 3 — Sobre o professor (mini-bio, compliance-safe)
    sobreTitle: "Quem conduz a Edição",
    sobreParagraphs: [
      "Flávio Milhomem é professor de Direito Penal e Processo Penal há 30 anos e autor de obras adotadas em graduação e em preparação para concursos.",
      "Formou-se academicamente na Universidade Católica Portuguesa (mestrado em Ciências Jurídico-Criminais) e na École Nationale de la Magistrature, na França, somando três décadas de prática no sistema de justiça criminal.",
      "A trajetória completa, com credenciais verificáveis e os vínculos institucionais descritos com transparência, está na página Sobre.",
    ] as const,
    sobrePhotoAlt: "Retrato do professor Flávio Milhomem",
    sobreCtaLabel: "Biografia e credenciais",
    // Bloco 13 — Garantia risco zero
    garantiaTitle: "Garantia de risco zero",
    garantiaBody:
      "Você tem 15 dias após a compra para conhecer a turma por dentro — aulas, fórum e materiais. Se concluir que não é o caminho certo agora, basta pedir: devolvemos o valor integral, sem letras miúdas, conforme a política publicada em /reembolso.",
    faqExtra: [
      {
        q: "Posso assistir no celular?",
        a: "Sim. As aulas gravadas e o fórum funcionam no navegador mobile; recomendamos desktop para leitura de PDFs extensos.",
      },
      {
        q: "Há encontro presencial obrigatório?",
        // 06/08/2026: a resposta anterior falava do marco de 11 de agosto no
        // futuro ("é opcional e aberto a inscritos no evento"). O evento
        // acontece em 11/08 e o site entra no ar em 17/08 — para quem lê, já
        // passou. Reescrito no passado, e o evento sai da posição de item do
        // curso para virar contexto de origem da Escola.
        a: "Não. O cohort é inteiramente online — as doze semanas acontecem na plataforma, entre aulas gravadas, fórum e os quatro encontros ao vivo. A Escola foi aberta publicamente no Dia do Advogado, em 11 de agosto de 2026, em Brasília, mas nada do curso depende de presença física.",
      },
      {
        q: "Qual é o investimento?",
        a: "{preco} em valor único da turma fundadora, com pagamento via PIX ou boleto (Pagar.me) e garantia incondicional de 15 dias, conforme a política publicada em /reembolso.",
      },
      {
        q: "Por quanto tempo terei acesso ao conteúdo?",
        a: "O acesso à plataforma permanece por 12 meses após o encerramento da turma — você pode rever aulas, materiais e o histórico do fórum nesse período.",
      },
      {
        q: "Para quem é a Edição Lançamento?",
        // Idem: menção à Eduzz removida em 04/08/2026 (produto inativo).
        a: "Para o público profissional do processo penal — advogados criminalistas, delegados, membros do Ministério Público e magistrados — que busca método aplicável e turma com acesso ao professor. Não é indicada para quem espera videoteca passiva.",
      },
    ] as const,
  },

  contato: {
    eyebrow: "Fale com a Escola",
    title: "Contato",
    lead: "Dúvidas sobre a Edição Lançamento, parcerias acadêmicas ou imprensa. Respondemos em até três dias úteis.",
    responseNote: "Prazo de resposta: até 3 dias úteis.",
    formTitle: "Enviar mensagem",
    formSuccess:
      "Mensagem recebida. Retornaremos em breve no e-mail informado.",
  },

  /**
   * FAQ institucional — /faq (guia Apêndice F.1: "perguntas frequentes sobre
   * a Escola, sobre o Flávio, sobre os cursos, sobre o regime de magistério").
   * Tom compliance-safe: transparência factual sem usar o cargo como isca.
   * Respostas em 2-4 frases diretas (AEO, guia 6.7).
   */
  faqInstitucional: {
    eyebrow: "Perguntas frequentes",
    title: "FAQ",
    titleEmphasis: "institucional",
    lead: "Respostas diretas sobre a Escola, o professor, os cursos e o regime de magistério. Dúvidas sobre a Edição Lançamento têm seção própria na página do programa.",
    items: [
      {
        q: "O que é a Escola Flávio Milhomem?",
        a: "É uma escola digital de Direito Penal e Processo Penal que ensina pela perspectiva da acusação — como a denúncia se forma, como a prova é produzida e como a tese se sustenta nos tribunais. Os programas funcionam em formato de cohort: turmas com início e fim definidos, fórum por aula e encontros ao vivo.",
      },
      {
        q: "Quem é Flávio Milhomem?",
        a: "Professor de Direito Penal e Processo Penal com 30 anos de docência superior e 30 anos de prática jurídica, autor de obras adotadas em graduação e concursos. Formou-se academicamente na Universidade Católica Portuguesa (mestrado) e na École Nationale de la Magistrature, na França. A trajetória completa, com credenciais verificáveis, está na página Sobre.",
      },
      {
        q: "O que significa ensinar pela “perspectiva da acusação”?",
        a: "Significa partir do raciocínio de quem constrói a acusação: por que cada linha da denúncia é escrita daquela forma, quais precedentes a sustentam e como a prova é estruturada. Esse recorte raramente aparece com densidade nos cursos generalistas, voltados à teoria ou ao ângulo da defesa.",
      },
      {
        q: "Membro do Ministério Público pode lecionar?",
        a: "Sim. O exercício do magistério é prerrogativa constitucional do membro do Ministério Público (art. 128, §5º, II, “a”, da Constituição Federal), exercido sem prejuízo da função institucional. A Escola opera em estrita observância das normas aplicáveis, com separação rigorosa entre a atividade docente e a função pública.",
      },
      {
        q: "A Escola presta consultoria ou atua em casos concretos?",
        a: "Não. A Escola é exclusivamente educacional: não presta consultoria individual sobre caso concreto, não atua em representação de partes e não emite parecer em litígio específico. Também não mantém patrocínio ou parceria comercial com escritórios de advocacia.",
      },
      {
        q: "Quais cursos a Escola oferece?",
        a: "O programa principal é a Edição Lançamento — cohort inaugural de 12 semanas sobre cadeia de custódia e prova digital no processo penal, com início previsto para setembro de 2026. O catálogo completo, com ementas, está na página de cursos.",
      },
      {
        q: "Os cursos emitem certificado?",
        // Mesmo ajuste do FAQ do curso: o critério é 100% das aulas concluídas, e o
        // "regulamento da turma" citado antes não existe.
        a: "Sim. Ao concluir todas as aulas da trilha, o aluno recebe certificado de conclusão da Escola, com autenticação verificável por código.",
      },
      {
        q: "Qual é a política de reembolso?",
        a: "Garantia incondicional de 15 dias a partir da compra, com reembolso integral — prazo superior ao mínimo legal de 7 dias do Código de Defesa do Consumidor. A política completa está publicada na página de reembolso.",
      },
      {
        q: "Que conteúdo gratuito a Escola mantém?",
        a: "Um blog editorial com análises de decisões do STJ e do STF em matéria penal, um boletim quinzenal por e-mail (Bastidor da Acusação), a Calculadora de Pena Hipotética — ferramenta didática gratuita — e aulas abertas no canal do YouTube.",
      },
      {
        q: "Como entrar em contato com a Escola?",
        // Endereço repetido à mão de propósito: `site.ts` importa este arquivo,
        // então importar `siteConfig` aqui criaria ciclo. Se o e-mail oficial
        // mudar, mudar nos dois lugares (`site.ts` → contact.email).
        a: "Pelo formulário da página de contato ou pelo e-mail prof.flaviomilhomem@gmail.com. O prazo de resposta é de até 3 dias úteis.",
      },
    ] as const,
  },

  /**
   * Evento de abertura — 11/08/2026, Brasília.
   *
   * Reescrito no PASSADO em 06/08/2026. O evento acontece em 11/08 e o site
   * entra no ar em 17/08: todo visitante desta página chega depois. O texto
   * anterior estava no futuro e a página oferecia um formulário "Confirmar
   * presença" — e ela está no `sitemap.ts`, ou seja, é submetida ao Google.
   * Convite para confirmar presença em evento vencido é quebra de confiança
   * com o público que a Escola quer (advogados), logo na primeira visita.
   *
   * A captura de lead foi mantida, mas com a promessa trocada: em vez de vaga
   * num evento que já ocorreu, o registro dá acesso ao material do painel.
   * A página deixa de ser convite e passa a ser prova de autoridade.
   */
  evento: {
    eyebrow: "Aconteceu · 11 · ago · 2026 · Brasília",
    title: "Dia do Advogado",
    titleEmphasis: "Abertura oficial",
    lead: "A Escola foi aberta publicamente no Dia do Advogado, em Brasília: painel sobre Direito Penal contemporâneo e aula inaugural de Flávio Milhomem pela perspectiva da acusação. Foi ali que a Edição Lançamento — o cohort inaugural — foi apresentada ao público.",
    agendaTitle: "O que aconteceu",
    agenda: [
      "Painel: Direito Penal contemporâneo",
      "Aula inaugural — perspectiva da acusação",
      "Apresentação da Edição Lançamento, o cohort inaugural da Escola",
    ] as const,
    rsvpTitle: "Não esteve presente?",
    rsvpLead:
      "Deixe seu e-mail para receber o material da aula inaugural e acompanhar as próximas turmas da Escola.",
    rsvpCta: "Quero receber",
    rsvpSuccess: "Registrado. Em breve você receberá o material por e-mail.",
  },

  /**
   * Iscas de topo de funil.
   *
   * Os títulos vêm do Livro-Guia (cap. 3.9, "Gancho editorial por persona"), que
   * define uma isca por persona e elege Mariana e Rafael como as duas prioritárias
   * do lançamento — exatamente os dois slots desta vitrine.
   *
   * Antes daqui existiam "Mapa da acusação" e "Checklist do inquérito", que não
   * constam do Livro-Guia em lugar nenhum: o site tinha divergido da especificação.
   * Corrigido em 03/08/2026, por decisão do Carlos.
   *
   * ⚠️ Nenhum dos dois PDFs existe ainda (a tabela `LeadMagnet` em produção está
   * vazia). O conteúdo é jurisprudência real e precisa ser conferido pelo Flávio
   * antes de publicar — julgado inventado em site assinado por Promotor de Justiça
   * em atividade é erro sem volta.
   */
  materiais: {
    bySlug: {
      "20-decisoes-stj-acusacao": {
        title:
          "As 20 decisões do STJ que a acusação cita mais e o que a defesa precisa saber sobre elas",
        lead: "As decisões que aparecem com mais frequência na fundamentação do Ministério Público, comentadas pelo lado que as invoca — e o que elas exigem de quem precisa enfrentá-las.",
      },
      "dez-pontos-defesa-acusacao-ataca": {
        title: "Guia prático: dez pontos da defesa que a acusação mais ataca",
        lead: "O que o Promotor procura antes de oferecer denúncia: as dez fragilidades recorrentes da tese defensiva, na ordem em que costumam ser exploradas.",
      },
    },
  },

  sobre: {
    metaDescription:
      "Escola Flávio Milhomem — escola de direito criminal. Biografia de Flávio Milhomem: docência, obras e trajetória. Credenciais acadêmicas e informações institucionais.",
    introLead:
      "A maioria dos cursos de direito criminal ensina para a prova. Este foi construído para a prática.",
    introBody:
      "Se você atua na advocacia criminal, ou quer começar a atuar com consistência, já percebeu que falta algo nos cursos do mercado: a visão de quem está do outro lado. Não basta dominar a teoria — é preciso entender como a acusação pensa, como constrói sua estratégia e quais precedentes utiliza para sustentar uma denúncia ou um recurso. Conteúdo produzido por um Promotor de Justiça em atividade, com mais de três décadas de atuação no sistema de justiça criminal, sem apostila reciclada, sem promessa vaga, sem atalho que não existe.",
    portraitCaption: "Professor e autor · Docência e obras",
    credentialsLead:
      "Na carreira pública, Flávio Milhomem é Promotor de Justiça do Ministério Público do Distrito Federal e Territórios (MPDFT) desde 1996. Na docência, leciona Direito Penal e Processo Penal há 30 anos, com mestrado pela Universidade Católica Portuguesa e especialização pela École Nationale de la Magistrature francesa.",
    propostaClosing:
      "A Escola existe para transmitir, com rigor e ética, o modo de pensar a acusação — em cohort, com materiais densos e espaço para dúvida. O magistério privado não se confunde com a função institucional.",
  },
} as const;
