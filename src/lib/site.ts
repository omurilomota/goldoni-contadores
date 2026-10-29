// Conteúdo institucional do site Goldoni Contadores (protótipo).

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.goldoni.exemplo.com.br").replace(/\/$/, "");

export const COMPANY = {
  name: "Goldoni Contadores",
  legalName: "Líder & Goldoni Contadores Ltda",
  cnpj: "00.000.000/0001-00",
  tagline: "Contabilidade & Direito",
  slogan: "Tradição de mais de 50 anos com visão estratégica",
  street: "Rua das Palmeiras, 250",
  district: "Centro",
  city: "Junqueirópolis",
  state: "SP",
  phone: "(18) 0000-0104",
  phoneHref: "tel:+551800000104",
  whatsapp: "(18) 99999-0104",
  whatsappDigits: "5518999990104",
  email: "contato@exemplo.com",
  instagram: "https://www.instagram.com/",
  instagramHandle: "@demonstracao",
  partners: ["Ana Beatriz Ferreira", "Carlos Eduardo Lima"],
  hours: "Segunda a sexta · 8h às 18h",
  mapsEmbed:
    "https://www.google.com/maps?q=Rua+Quinzinho+da+Cunha,+1040,+Centro,+Junqueir%C3%B3polis+-+SP&output=embed",
  mapsLink: "https://www.google.com/maps/search/?api=1&query=Rua+Quinzinho+da+Cunha,+1040,+Junqueir%C3%B3polis+SP",
};

export function whatsappUrl(text = "Olá! Vim pelo site e gostaria de falar com a Goldoni Contadores.") {
  return `https://wa.me/${COMPANY.whatsappDigits}?text=${encodeURIComponent(text)}`;
}

export type IconName =
  | "building"
  | "rocket"
  | "chart"
  | "users"
  | "receipt"
  | "scale";

export type Service = {
  slug: string;
  icon: IconName;
  name: string;
  short: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  bullets: string[];
  faqs: { q: string; a: string }[];
};

export const SERVICES: Service[] = [
  {
    slug: "contabilidade-em-junqueiropolis",
    icon: "building",
    name: "Contabilidade completa",
    short: "Contábil, fiscal e pessoal em um só lugar, com atendimento no Centro de Junqueirópolis e online.",
    h1: "Contabilidade em Junqueirópolis com mais de 50 anos de tradição",
    metaTitle: "Contabilidade em Junqueirópolis/SP | Goldoni Contadores",
    metaDescription:
      "Escritório de contabilidade em Junqueirópolis/SP há mais de 50 anos. Mais de 500 empresas assessoradas: fiscal, contábil, departamento pessoal e assessoria jurídica.",
    intro: [
      "A Goldoni Contadores atende empresas de Junqueirópolis e de toda a Nova Alta Paulista com contabilidade completa: fiscal, contábil, departamento pessoal e assessoria jurídica empresarial.",
      "São mais de 500 empresas assessoradas — do comércio do Centro às indústrias e produtores rurais da região. Você é atendido por quem conhece a cidade, com a praticidade de um portal digital para enviar documentos e baixar guias.",
    ],
    bullets: [
      "Escrituração contábil e balancetes mensais",
      "Apuração de impostos no Simples Nacional, Lucro Presumido e Lucro Real",
      "Folha de pagamento, eSocial e FGTS Digital",
      "Certidões negativas e regularização de pendências",
      "Atendimento presencial e pela Central Goldoni (portal do cliente)",
      "Troca de contador sem burocracia — cuidamos de tudo",
    ],
    faqs: [
      {
        q: "Vocês atendem empresas de cidades vizinhas?",
        a: "Sim. Além de Junqueirópolis, atendemos empresas de toda a região. Com a Central Goldoni, o envio de documentos, a retirada de guias e as solicitações são 100% online.",
      },
      {
        q: "Como funciona a troca de contador?",
        a: "Você nos autoriza e nós cuidamos do contato com o escritório anterior, da transferência dos arquivos e das procurações eletrônicas. Sua empresa não para nenhum dia.",
      },
      {
        q: "Quanto custa a contabilidade da minha empresa?",
        a: "Os honorários dependem do regime tributário, do faturamento, do número de funcionários e do volume de notas. Enviamos uma proposta personalizada em até 1 dia útil.",
      },
    ],
  },
  {
    slug: "abertura-de-empresa",
    icon: "rocket",
    name: "Abertura de empresa",
    short: "Do CNPJ ao alvará: escolhemos o melhor formato e regime para você começar pagando o justo.",
    h1: "Abrir empresa em Junqueirópolis: do CNPJ ao alvará, sem dor de cabeça",
    metaTitle: "Abrir empresa em Junqueirópolis/SP | Goldoni Contadores",
    metaDescription:
      "Abertura de empresa em Junqueirópolis com quem conhece a cidade: tipo societário, regime tributário, CNPJ, inscrições, alvará e emissor de notas configurado.",
    intro: [
      "Abrir uma empresa é uma das decisões mais importantes da sua vida profissional — e as escolhas do primeiro dia (tipo societário, atividades e regime tributário) definem quanto imposto você vai pagar nos próximos anos.",
      "Na Goldoni, cada abertura começa com uma conversa e uma simulação de impostos. Depois, cuidamos de todo o processo nos órgãos públicos e entregamos a empresa pronta para faturar.",
    ],
    bullets: [
      "Análise do melhor formato: MEI, Empresário Individual, SLU ou Ltda",
      "Escolha do regime tributário com simulação de impostos",
      "Registro na Junta Comercial e emissão do CNPJ",
      "Inscrições estadual e municipal, alvará e licenças",
      "Certificado digital e emissor de notas fiscais configurado",
      "Transformação de MEI em ME quando o faturamento crescer",
    ],
    faqs: [
      {
        q: "Quanto tempo leva para abrir uma empresa?",
        a: "Com a documentação completa, boa parte das aberturas é concluída em poucos dias úteis. Atividades que exigem licenças específicas, como vigilância sanitária, podem levar mais — acompanhamos cada etapa e avisamos você.",
      },
      {
        q: "Posso começar como MEI?",
        a: "Depende da atividade, do faturamento previsto e de ter ou não sócios. O MEI tem teto de faturamento anual e lista restrita de atividades; se sua previsão for maior, simulamos as alternativas no Simples Nacional.",
      },
      {
        q: "Preciso ir ao escritório?",
        a: "Não necessariamente: a coleta de documentos e as assinaturas podem ser digitais pela Central Goldoni. Mas a casa é sua — estamos na Rua das Palmeiras, 250, no Centro.",
      },
    ],
  },
  {
    slug: "planejamento-tributario",
    icon: "chart",
    name: "Planejamento tributário",
    short: "Pague menos impostos dentro da lei, com revisão de regime, enquadramento e pró-labore.",
    h1: "Planejamento tributário: pague menos impostos, dentro da lei",
    metaTitle: "Planejamento tributário em Junqueirópolis/SP | Goldoni Contadores",
    metaDescription:
      "Planejamento tributário para empresas de Junqueirópolis e região: comparativo de regimes, Fator R, recuperação de créditos e preparação para a Reforma Tributária.",
    intro: [
      "Muitas empresas pagam mais imposto do que deveriam simplesmente porque nunca revisaram o regime tributário, o enquadramento das atividades ou a forma de remuneração dos sócios.",
      "Unindo contabilidade e direito, analisamos os números da sua empresa e mostramos, em reais, quanto cada alternativa custa — antes de qualquer mudança.",
    ],
    bullets: [
      "Comparativo Simples Nacional × Lucro Presumido × Lucro Real",
      "Revisão de enquadramento, anexos e Fator R",
      "Recuperação de créditos e de impostos pagos a maior",
      "Equilíbrio entre pró-labore e distribuição de lucros",
      "Preparação para a Reforma Tributária (CBS e IBS)",
      "Holding familiar e planejamento sucessório com apoio jurídico",
    ],
    faqs: [
      {
        q: "Planejamento tributário é legal?",
        a: "Sim. É usar as opções que a própria legislação oferece — regime, enquadramento, forma de remuneração dos sócios — para reduzir a carga tributária. É o oposto de sonegação.",
      },
      {
        q: "Com que frequência devo revisar meu regime?",
        a: "Pelo menos uma vez por ano, antes de janeiro, quando normalmente é feita a opção pelo regime. Mudanças de faturamento, de folha ou de atividade também pedem revisão.",
      },
      {
        q: "Como a Reforma Tributária afeta minha empresa?",
        a: "A transição começa em 2026, em caráter de teste, e avança até 2033, substituindo PIS, Cofins, ICMS e ISS pela CBS e pelo IBS. Simulamos o impacto no seu preço e no seu regime com antecedência.",
      },
    ],
  },
  {
    slug: "departamento-pessoal",
    icon: "users",
    name: "Departamento pessoal",
    short: "Folha, admissões, férias, rescisões, eSocial e FGTS Digital sempre em dia.",
    h1: "Departamento pessoal: folha, eSocial e FGTS sem atrasos",
    metaTitle: "Departamento pessoal e folha de pagamento em Junqueirópolis | Goldoni",
    metaDescription:
      "Folha de pagamento, admissões, férias, 13º, rescisões, eSocial e FGTS Digital para empresas de Junqueirópolis e região. Holerites disponíveis no portal.",
    intro: [
      "Funcionário bem pago, no prazo e com tudo registrado é sinônimo de empresa protegida. Erros na folha viram multas, passivos trabalhistas e desgaste com a equipe.",
      "Nosso departamento pessoal cuida da rotina completa e deixa os holerites, recibos e guias disponíveis na Central Goldoni assim que a folha é fechada.",
    ],
    bullets: [
      "Admissões, férias, 13º salário e rescisões",
      "Folha de pagamento e pró-labore mensais",
      "eSocial, DCTFWeb e FGTS Digital",
      "Controle de ponto, horas extras e banco de horas",
      "Holerites e recibos disponíveis no portal",
      "Orientação trabalhista preventiva com apoio jurídico",
    ],
    faqs: [
      {
        q: "Até quando preciso enviar as informações da folha?",
        a: "Faltas, horas extras e comissões devem ser enviadas até a data do seu checklist na Central Goldoni — assim a folha fecha a tempo de os salários serem pagos até o 5º dia útil.",
      },
      {
        q: "Vocês ajudam na contratação do primeiro funcionário?",
        a: "Sim. Orientamos sobre exame admissional, contrato, registro no eSocial e todos os encargos antes da contratação, para você saber o custo real do funcionário.",
      },
    ],
  },
  {
    slug: "assessoria-fiscal",
    icon: "receipt",
    name: "Fiscal e notas fiscais",
    short: "Emissor de notas configurado, apuração de impostos e obrigações acessórias sem multas.",
    h1: "Assessoria fiscal e emissão de notas fiscais sem erros",
    metaTitle: "Assessoria fiscal e emissão de notas em Junqueirópolis | Goldoni",
    metaDescription:
      "Configuração de emissor de NF-e, NFC-e e NFS-e, apuração de ICMS, ISS, PIS e Cofins, SPED e certidões negativas para empresas de Junqueirópolis e região.",
    intro: [
      "Uma nota fiscal emitida com a tributação errada vira imposto pago a mais — ou autuação no futuro. A área fiscal é onde os detalhes custam caro.",
      "Configuramos seu emissor corretamente, conferimos as notas de entrada e saída todos os meses e cuidamos das obrigações acessórias para sua empresa ficar regular.",
    ],
    bullets: [
      "Configuração do emissor de NF-e, NFC-e e NFS-e",
      "Apuração de ICMS, ISS, PIS e Cofins",
      "SPED Fiscal, EFD-Contribuições e demais obrigações acessórias",
      "Conferência dos XMLs de entrada e saída",
      "Regularização de pendências na Receita, na Sefaz e na prefeitura",
      "Emissão e monitoramento de certidões negativas",
    ],
    faqs: [
      {
        q: "Vocês emitem as notas por mim?",
        a: "Podemos configurar o emissor e treinar sua equipe, ou assumir a emissão em casos específicos. O mais comum é a empresa emitir e nós conferirmos tudo na apuração mensal.",
      },
      {
        q: "O que acontece se eu perder um prazo?",
        a: "Obrigações em atraso geram multas e podem bloquear suas certidões. Na Central Goldoni você vê todos os prazos e recebe alertas antes do vencimento.",
      },
    ],
  },
  {
    slug: "direito-empresarial",
    icon: "scale",
    name: "Assessoria jurídica",
    short: "Contabilidade e Direito juntos: contratos, sociedades, sucessão e defesa administrativa.",
    h1: "Contabilidade e Direito: segurança jurídica para a sua empresa",
    metaTitle: "Assessoria jurídica empresarial em Junqueirópolis | Goldoni Contadores",
    metaDescription:
      "Contabilidade e Direito no mesmo escritório: contratos sociais, acordos de sócios, holding familiar, prevenção trabalhista e defesas administrativas em Junqueirópolis.",
    intro: [
      "As decisões de uma empresa são, ao mesmo tempo, contábeis e jurídicas: um contrato mal escrito vira imposto, um passivo trabalhista vira prejuízo, uma sociedade sem acordo vira conflito.",
      "Por isso a Goldoni une as duas visões. Você decide com os números e com a segurança jurídica na mesma mesa.",
    ],
    bullets: [
      "Contratos sociais, alterações e acordos de sócios",
      "Revisão de contratos com clientes e fornecedores",
      "Holding familiar e planejamento sucessório",
      "Prevenção de passivos trabalhistas",
      "Defesas administrativas em autuações fiscais",
      "Negociação e parcelamento de débitos",
    ],
    faqs: [
      {
        q: "Por que unir contabilidade e direito?",
        a: "Porque toda decisão importante — entrada de sócio, sucessão, contrato relevante, autuação — tem impacto tributário e jurídico. Com as duas áreas juntas, nada fica sem análise.",
      },
      {
        q: "Atendem pessoas físicas?",
        a: "Sim, principalmente sócios e famílias empresárias: planejamento sucessório, holding familiar e Imposto de Renda.",
      },
    ],
  },
];

export function getService(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}

export const STATS = [
  { value: "500+", label: "empresas assessoradas" },
  { value: "50+", label: "anos de história" },
  { value: "2", label: "áreas integradas: contábil e jurídica" },
  { value: "24h", label: "de acesso à Central Goldoni" },
];

export const DIFFERENTIALS = [
  {
    title: "Economia Real de Impostos",
    text: "Revisão tributária contínua para enquadrar sua empresa na menor alíquota permitida por lei, protegendo o seu lucro.",
  },
  {
    title: "Contabilidade + Direito Integrados",
    text: "Decisões societárias, contratos e redução de passivos trabalhistas tratados com segurança contábil e jurídica.",
  },
  {
    title: "Central Goldoni 24h no Celular",
    text: "Checklist mensal, guias para pagamento e relatórios gerenciais disponíveis a qualquer hora sem depender de horário comercial.",
  },
  {
    title: "Zero Multas & Alertas Proativos",
    text: "Monitoramento antecipado de vencimentos e certidões para sua empresa nunca travar financiamentos ou sofrer autuações.",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "Mudei a padaria de regime depois de uma simulação da equipe e a economia já pagou a contabilidade do ano inteiro.",
    author: "Empresária do setor de alimentação",
    detail: "Cliente há 12 anos",
  },
  {
    quote:
      "Antes eu vivia procurando guia no WhatsApp. Agora está tudo no portal, com aviso antes de vencer.",
    author: "Proprietário de comércio no Centro",
    detail: "Cliente há 8 anos",
  },
  {
    quote:
      "Quando precisei de certidões para uma licitação, saiu tudo em dois dias. Isso é ter contador de verdade.",
    author: "Sócio de transportadora da região",
    detail: "Cliente há 15 anos",
  },
];

export type PostSection = { heading?: string; paragraphs?: string[]; items?: string[] };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingMinutes: number;
  sections: PostSection[];
  callout: string;
};

export const POSTS: Post[] = [
  {
    slug: "reforma-tributaria-2026-o-que-muda",
    title: "Reforma Tributária: o que muda para a sua empresa em 2026",
    excerpt:
      "2026 é o ano de teste da CBS e do IBS. Entenda o cronograma até 2033 e o que fazer agora para não ser pego de surpresa.",
    category: "Reforma Tributária",
    date: "2026-01-12",
    readingMinutes: 5,
    sections: [
      {
        paragraphs: [
          "A Reforma Tributária do consumo (Emenda Constitucional 132/2023, regulamentada pela Lei Complementar 214/2025) começa a sair do papel em 2026. A boa notícia: este é um ano de testes. O alerta: quem deixar para se preparar em 2027 vai correr atrás do prejuízo.",
        ],
      },
      {
        heading: "O que acontece em 2026",
        items: [
          "As notas fiscais passam a destacar a CBS (federal) com alíquota de teste de 0,9% e o IBS (estados e municípios) com 0,1%.",
          "Para quem cumpre as obrigações acessórias, esses valores não representam custo adicional — servem para calibrar o novo sistema.",
          "Os emissores de NF-e, NFC-e e NFS-e precisam estar atualizados com os novos campos e códigos de classificação tributária.",
        ],
      },
      {
        heading: "O cronograma até 2033",
        items: [
          "2027: a CBS substitui PIS e Cofins, e começa a cobrança do Imposto Seletivo.",
          "2029 a 2032: ICMS e ISS são reduzidos gradualmente enquanto o IBS aumenta.",
          "2033: o novo modelo passa a valer por completo, com a extinção do ICMS e do ISS.",
        ],
      },
      {
        heading: "E quem é do Simples Nacional?",
        paragraphs: [
          "O Simples Nacional continua existindo. A novidade é que a empresa do Simples poderá optar por recolher CBS e IBS fora do DAS, pelo regime regular, para transferir créditos integrais aos clientes que são empresas. Para quem vende para outras empresas, essa escolha pode decidir contratos — e precisa de simulação caso a caso.",
        ],
      },
      {
        heading: "O que fazer agora",
        items: [
          "Confirme com o fornecedor do seu sistema se o emissor de notas já está preparado.",
          "Revise contratos de longo prazo: eles precisam prever a mudança de tributos.",
          "Mapeie custos e fornecedores para entender quais créditos poderá aproveitar.",
          "Agende com seu contador uma simulação do impacto no seu preço de venda.",
        ],
      },
    ],
    callout: "Clientes Goldoni recebem a simulação de impacto da reforma diretamente na Central Goldoni.",
  },
  {
    slug: "calendario-fiscal-do-empresario",
    title: "Calendário fiscal: os prazos que todo empresário precisa conhecer",
    excerpt:
      "Salários, DAS, FGTS, INSS, PIS/Cofins, DEFIS e IRPF: um guia direto dos vencimentos mensais e anuais mais importantes.",
    category: "Prazos e obrigações",
    date: "2026-02-02",
    readingMinutes: 4,
    sections: [
      {
        paragraphs: [
          "Perder um prazo fiscal custa multa, juros e, em muitos casos, o bloqueio das certidões negativas — que você vai precisar justamente quando surgir um financiamento ou uma licitação. Veja os vencimentos mais comuns.",
        ],
      },
      {
        heading: "Prazos mensais mais comuns",
        items: [
          "Até o 5º dia útil: pagamento dos salários dos funcionários.",
          "Dia 15: eventos periódicos do eSocial e EFD-Reinf referentes ao mês anterior.",
          "Dia 20: DAS do Simples Nacional e do MEI.",
          "Dia 20: FGTS, recolhido pelo FGTS Digital.",
          "Dia 20: contribuições previdenciárias (INSS) apuradas na DCTFWeb.",
          "Dia 25: PIS e Cofins das empresas do Lucro Presumido e do Lucro Real.",
          "ICMS e ISS: datas definidas pela Sefaz-SP e pela prefeitura, conforme a atividade.",
        ],
      },
      {
        heading: "Prazos trimestrais e anuais",
        items: [
          "IRPJ e CSLL do Lucro Presumido: último dia útil do mês seguinte ao fim de cada trimestre.",
          "DEFIS (Simples Nacional): até 31 de março.",
          "DASN-SIMEI (declaração anual do MEI): até 31 de maio.",
          "Imposto de Renda Pessoa Física: geralmente entre março e maio.",
          "13º salário: 1ª parcela até 30 de novembro e 2ª parcela até 20 de dezembro.",
        ],
      },
      {
        heading: "Atenção a feriados e fins de semana",
        paragraphs: [
          "Quando o vencimento cai em dia sem expediente bancário, alguns tributos antecipam (como FGTS, INSS e PIS/Cofins) e outros prorrogam (como o DAS). Na dúvida, pague antes.",
        ],
      },
    ],
    callout: "Na Central Goldoni, cada guia já aparece com a data exata de vencimento — e você recebe um aviso antes.",
  },
  {
    slug: "irpf-checklist-de-documentos",
    title: "Imposto de Renda: checklist de documentos para declarar sem estresse",
    excerpt:
      "Rendimentos, despesas dedutíveis, bens e dívidas: a lista completa para separar antes de falar com o seu contador.",
    category: "Imposto de Renda",
    date: "2026-02-18",
    readingMinutes: 4,
    sections: [
      {
        paragraphs: [
          "A declaração do Imposto de Renda Pessoa Física fica muito mais rápida — e com menos risco de malha fina — quando os documentos estão organizados com antecedência. Use esta lista como roteiro.",
        ],
      },
      {
        heading: "Rendimentos",
        items: [
          "Informes de rendimentos do empregador, de aposentadoria ou pensão",
          "Informes de bancos, corretoras e fundos de investimento",
          "Pró-labore e lucros distribuídos pelas empresas em que você é sócio",
          "Aluguéis recebidos e rendimentos dos dependentes",
        ],
      },
      {
        heading: "Despesas dedutíveis",
        items: [
          "Despesas médicas, odontológicas e plano de saúde (recibos com CPF/CNPJ do profissional)",
          "Educação: escola, faculdade e pós-graduação, dentro do limite legal",
          "Previdência privada PGBL e INSS de autônomos ou empregados domésticos",
          "Pensão alimentícia determinada judicialmente",
        ],
      },
      {
        heading: "Bens, direitos e dívidas",
        items: [
          "Documentos de compra e venda de imóveis e veículos",
          "Saldos de contas e investimentos em 31 de dezembro",
          "Contratos de financiamentos e empréstimos",
          "Participações em empresas (quotas de capital)",
        ],
      },
      {
        heading: "Dados cadastrais",
        items: [
          "CPF de todos os dependentes",
          "Recibo da declaração do ano anterior",
          "Dados bancários para restituição — de preferência chave Pix CPF",
          "Conta gov.br nível prata ou ouro para usar a declaração pré-preenchida",
        ],
      },
    ],
    callout: "Sócios das empresas clientes podem enviar os documentos do IRPF direto pela Central Goldoni.",
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

export const LEAD_SERVICES = [
  "Troca de contador",
  "Abertura de empresa",
  "Planejamento tributário",
  "Departamento pessoal",
  "Fiscal e notas fiscais",
  "Assessoria jurídica",
  "Imposto de Renda (IRPF)",
  "Outro assunto",
];
