import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  certificates,
  clients,
  deliverables,
  documentRequests,
  files,
  leads,
  notices,
  reminders,
  ticketMessages,
  tickets,
  users,
} from "@/db/schema";
import {
  addDaysISO,
  competenceLabel,
  currentCompetence,
  formatDateBR,
  formatMoney,
  shiftCompetence,
  todayISO,
} from "./format";
import { hashPassword } from "./password";
import { buildPdf, type PdfLine } from "./pdf";

export const DEMO_PASSWORD = "goldoni2026";
export const DEMO_CLIENT_EMAIL = "cliente@paodourado.com.br";
export const DEMO_STAFF_EMAIL = "equipe@exemplo.com";
export const STAFF_NAME = "Ana Paula Ribeiro";
export const STAFF_SIGNATURE = "Equipe Goldoni · Demonstração";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type ClientSeed = {
  legalName: string;
  tradeName: string;
  cnpj: string;
  regime: string;
  segment: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  employees: number;
  clientSince: number;
  completion: number;
};

// Empresas fictícias usadas apenas para demonstração.
const CLIENT_SEEDS: ClientSeed[] = [
  { legalName: "Padaria Pão Dourado Ltda", tradeName: "Pão Dourado", cnpj: "12.345.678/0001-90", regime: "Simples Nacional", segment: "Padaria e confeitaria", contactName: "Marina Souza", contactPhone: "(18) 99100-0001", contactEmail: DEMO_CLIENT_EMAIL, employees: 9, clientSince: 2012, completion: 0.5 },
  { legalName: "Acerola Vale Verde Agroindustrial Ltda", tradeName: "Acerola Vale Verde", cnpj: "23.456.789/0001-01", regime: "Lucro Presumido", segment: "Agroindústria", contactName: "Roberto Tanaka", contactPhone: "(18) 99100-0002", contactEmail: "financeiro@valeverde.com.br", employees: 24, clientSince: 2009, completion: 1 },
  { legalName: "Auto Peças Nova Alta Paulista Ltda", tradeName: "Auto Peças NAP", cnpj: "34.567.890/0001-12", regime: "Simples Nacional", segment: "Comércio de autopeças", contactName: "Carlos Menezes", contactPhone: "(18) 99100-0003", contactEmail: "carlos@autopecasnap.com.br", employees: 6, clientSince: 2015, completion: 0.3 },
  { legalName: "Clínica Odontológica Sorriso Pleno Ltda", tradeName: "Sorriso Pleno", cnpj: "45.678.901/0001-23", regime: "Lucro Presumido", segment: "Saúde", contactName: "Dra. Fernanda Lima", contactPhone: "(18) 99100-0004", contactEmail: "adm@sorrisopleno.com.br", employees: 5, clientSince: 2018, completion: 0.85 },
  { legalName: "Mercado Bom Preço Junqueirópolis Ltda", tradeName: "Mercado Bom Preço", cnpj: "56.789.012/0001-34", regime: "Simples Nacional", segment: "Supermercado", contactName: "Antônio Ferreira", contactPhone: "(18) 99100-0005", contactEmail: "compras@mercadobompreco.com.br", employees: 18, clientSince: 2007, completion: 0.5 },
  { legalName: "Transportadora Rota Oeste Ltda", tradeName: "Rota Oeste", cnpj: "67.890.123/0001-45", regime: "Lucro Presumido", segment: "Transporte de cargas", contactName: "Juliano Ribeiro", contactPhone: "(18) 99100-0006", contactEmail: "juliano@rotaoeste.com.br", employees: 14, clientSince: 2011, completion: 0 },
  { legalName: "JR Construções e Reformas Ltda", tradeName: "JR Construções", cnpj: "78.901.234/0001-56", regime: "Simples Nacional", segment: "Construção civil", contactName: "José Roberto Alves", contactPhone: "(18) 99100-0007", contactEmail: "jr@jrconstrucoes.com.br", employees: 11, clientSince: 2016, completion: 0.6 },
  { legalName: "Farmácia Vida & Saúde Ltda", tradeName: "Farmácia Vida & Saúde", cnpj: "89.012.345/0001-67", regime: "Simples Nacional", segment: "Farmácia", contactName: "Patrícia Nogueira", contactPhone: "(18) 99100-0008", contactEmail: "patricia@vidaesaude.com.br", employees: 7, clientSince: 2013, completion: 1 },
  { legalName: "Agropecuária Três Irmãos Ltda", tradeName: "Agropecuária Três Irmãos", cnpj: "90.123.456/0001-78", regime: "Lucro Real", segment: "Agropecuária", contactName: "Luiz Henrique Batista", contactPhone: "(18) 99100-0009", contactEmail: "luiz@tresirmaos.agr.br", employees: 32, clientSince: 2006, completion: 0.7 },
  { legalName: "Camila Rocha Estética", tradeName: "Studio Bella Estética", cnpj: "41.234.567/0001-89", regime: "MEI", segment: "Estética", contactName: "Camila Rocha", contactPhone: "(18) 99100-0010", contactEmail: "camila@studiobella.com.br", employees: 0, clientSince: 2021, completion: 0 },
  { legalName: "Escola Infantil Primeiros Passos Ltda", tradeName: "Primeiros Passos", cnpj: "52.345.678/0001-90", regime: "Simples Nacional", segment: "Educação infantil", contactName: "Sueli Martins", contactPhone: "(18) 99100-0011", contactEmail: "direcao@primeirospassos.com.br", employees: 8, clientSince: 2014, completion: 0.4 },
  { legalName: "Oficina Mecânica Zé Motor Ltda", tradeName: "Zé Motor", cnpj: "63.456.789/0001-01", regime: "Simples Nacional", segment: "Oficina mecânica", contactName: "José Carlos Pereira", contactPhone: "(18) 99100-0012", contactEmail: "contato@zemotor.com.br", employees: 3, clientSince: 2019, completion: 0.15 },
];

type ChecklistItem = { title: string; description: string; category: string };
type DocPlan = { status: string; offset: number; note?: string };

const DEMO_DOC_PLAN: DocPlan[] = [
  { status: "aprovado", offset: -3 },
  { status: "enviado", offset: -1 },
  { status: "pendente", offset: 2 },
  {
    status: "rejeitado",
    offset: 1,
    note: "O extrato veio incompleto: faltaram as vendas no crédito de 16 a 31. Pode reenviar o arquivo completo?",
  },
  { status: "pendente", offset: 5 },
  { status: "pendente", offset: -1 },
  { status: "aprovado", offset: 3 },
];
const OTHER_OFFSETS = [-4, -2, -1, 1, 3, 5, 6];

const CERT_KINDS = [
  "CND Federal (Receita/PGFN)",
  "CRF – FGTS",
  "CND Estadual (Sefaz-SP)",
  "CND Municipal",
  "CNDT – Trabalhista",
];
const DEMO_CERT_OFFSETS = [52, 6, 88, -3, 120];

function rng(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function checklistFor(seed: ClientSeed): ChecklistItem[] {
  if (seed.regime === "MEI") {
    return [
      { title: "Relatório mensal de receitas brutas", description: "Total vendido no mês, com e sem nota fiscal.", category: "Fiscal" },
      { title: "Notas fiscais emitidas e recebidas", description: "XML ou PDF das notas do mês.", category: "Fiscal" },
    ];
  }
  const items: ChecklistItem[] = [
    { title: "Extratos bancários de todas as contas", description: "PDF ou OFX do mês completo, inclusive aplicações.", category: "Contábil" },
    { title: "Notas fiscais de entrada (XML)", description: "Compras de mercadorias, insumos e serviços tomados.", category: "Fiscal" },
    { title: "Relatório de vendas / notas de saída", description: "Relatório do emissor com o total faturado no mês.", category: "Fiscal" },
    { title: "Extrato das maquininhas de cartão e Pix", description: "Vendas no débito, crédito e Pix, por operadora.", category: "Fiscal" },
    { title: "Comprovantes de despesas e pagamentos", description: "Aluguel, energia, fornecedores, tarifas e empréstimos.", category: "Contábil" },
  ];
  if (seed.employees > 0) {
    items.push(
      { title: "Variáveis da folha (horas extras, faltas, comissões)", description: "Planilha ou espelho de ponto de todos os funcionários.", category: "Pessoal" },
      { title: "Admissões, demissões e atestados do mês", description: "Documentos de novos funcionários e atestados médicos.", category: "Pessoal" },
    );
  }
  return items;
}

function guiaDue(day: number): string {
  const t = todayISO();
  const month = +t.slice(8, 10) <= 18 ? t.slice(0, 7) : shiftCompetence(t.slice(0, 7), 1);
  return `${month}-${String(day).padStart(2, "0")}`;
}

function barcode(rand: () => number): string {
  const block = (n: number) => Array.from({ length: n }, () => Math.floor(rand() * 10)).join("");
  return `858${block(8)} ${block(1)} ${block(11)} ${block(1)} ${block(11)} ${block(1)} ${block(11)} ${block(1)}`;
}

type DeliverablePlan = {
  kind: "guia" | "relatorio";
  title: string;
  competence: string;
  dueDate: string | null;
  amountCents: number | null;
  fileName: string;
  lines: PdfLine[];
};

function deliverablesFor(seed: ClientSeed, comp: string, rand: () => number): DeliverablePlan[] {
  const list: DeliverablePlan[] = [];
  const header: PdfLine[] = [{ text: `Contribuinte: ${seed.legalName}` }, { text: `CNPJ: ${seed.cnpj}` }];
  const muted: [number, number, number] = [0.35, 0.38, 0.45];

  const guia = (title: string, due: string, amountCents: number, fileBase: string) => {
    list.push({
      kind: "guia",
      title,
      competence: comp,
      dueDate: due,
      amountCents,
      fileName: `${fileBase}-${comp}.pdf`,
      lines: [
        ...header,
        { text: `Competência: ${competenceLabel(comp, true)}` },
        { text: `Vencimento: ${formatDateBR(due)}` },
        { text: `Valor a pagar: ${formatMoney(amountCents)}`, bold: true, size: 15, gap: 34 },
        { text: "Linha digitável (ilustrativa):", gap: 36 },
        { text: barcode(rand), bold: true, size: 11 },
        { text: "Pague pelo aplicativo do seu banco até o vencimento para evitar multa e juros.", gap: 36, color: muted },
      ],
    });
  };

  if (seed.regime === "MEI") {
    guia("DAS-MEI", guiaDue(20), 8205 + Math.round(rand() * 500), "das-mei");
  } else if (seed.regime === "Simples Nacional") {
    guia("DAS – Simples Nacional", guiaDue(20), 80000 + Math.round(rand() * 520000), "das-simples");
  } else {
    guia("DARF PIS/Cofins", guiaDue(25), 150000 + Math.round(rand() * 750000), "darf-pis-cofins");
  }

  if (seed.employees > 0) {
    guia("FGTS Digital (GFD)", guiaDue(20), seed.employees * (17000 + Math.round(rand() * 6000)), "fgts-digital");
    guia("DARF Previdenciário (DCTFWeb)", guiaDue(20), seed.employees * (21000 + Math.round(rand() * 9000)), "darf-dctfweb");
    const gross = seed.employees * (210000 + Math.round(rand() * 90000));
    list.push({
      kind: "relatorio",
      title: "Holerites e resumo da folha",
      competence: comp,
      dueDate: null,
      amountCents: null,
      fileName: `folha-${comp}.pdf`,
      lines: [
        ...header,
        { text: `Competência: ${competenceLabel(comp, true)}` },
        { text: `Funcionários: ${seed.employees}`, gap: 30 },
        { text: `Total de proventos: ${formatMoney(gross)}` },
        { text: `Descontos (INSS, IRRF e benefícios): ${formatMoney(Math.round(gross * 0.11))}` },
        { text: `Líquido a pagar: ${formatMoney(Math.round(gross * 0.89))}`, bold: true },
        { text: `FGTS do mês: ${formatMoney(Math.round(gross * 0.08))}` },
        { text: "Holerites individuais prontos para impressão ou envio aos funcionários.", gap: 34, color: muted },
      ],
    });
  }

  const balComp = shiftCompetence(comp, -1);
  const revenue = 4_000_000 + Math.round(rand() * 26_000_000);
  const costs = Math.round(revenue * (0.45 + rand() * 0.2));
  const expenses = Math.round(revenue * (0.15 + rand() * 0.1));
  list.push({
    kind: "relatorio",
    title: "Balancete mensal",
    competence: balComp,
    dueDate: null,
    amountCents: null,
    fileName: `balancete-${balComp}.pdf`,
    lines: [
      ...header,
      { text: `Período: ${competenceLabel(balComp, true)}` },
      { text: `Receita bruta: ${formatMoney(revenue)}`, gap: 30 },
      { text: `(-) Custos: ${formatMoney(costs)}` },
      { text: `(-) Despesas operacionais: ${formatMoney(expenses)}` },
      { text: `(=) Resultado do período: ${formatMoney(revenue - costs - expenses)}`, bold: true },
      { text: "Relatório resumido para acompanhamento gerencial.", gap: 34, color: muted },
    ],
  });
  return list;
}

type TicketSeed = {
  client: number;
  subject: string;
  category: string;
  status: string;
  messages: { author: "cliente" | "equipe"; body: string; daysAgo: number; hoursAgo?: number }[];
};

const TICKET_SEEDS: TicketSeed[] = [
  {
    client: 0,
    subject: "Certidões para licitação da Prefeitura",
    category: "Certidões",
    status: "em_andamento",
    messages: [
      { author: "cliente", daysAgo: 2, hoursAgo: 3, body: "Bom dia! A Prefeitura abriu licitação para fornecimento de pães para a merenda e pediu as certidões federal, estadual, municipal, FGTS e trabalhista. Conseguem até sexta?" },
      { author: "equipe", daysAgo: 1, hoursAgo: 6, body: "Bom dia, Marina! A federal, a estadual e a trabalhista já estão regulares. A municipal venceu e já pedimos a renovação; o CRF do FGTS vence nos próximos dias e vamos reemitir junto. Aviso aqui assim que estiver tudo no portal." },
    ],
  },
  {
    client: 0,
    subject: "Admissão de nova balconista",
    category: "Departamento pessoal",
    status: "aguardando_cliente",
    messages: [
      { author: "cliente", daysAgo: 3, hoursAgo: 5, body: "Vamos contratar uma balconista no começo do mês que vem. O que vocês precisam?" },
      { author: "equipe", daysAgo: 3, hoursAgo: 2, body: "Ótimo! Precisamos de: RG e CPF, comprovante de residência, carteira de trabalho digital, título de eleitor, dados bancários e o ASO do exame admissional. Pode anexar as fotos ou responder por aqui." },
    ],
  },
  {
    client: 0,
    subject: "DAS do mês veio mais alto que o normal",
    category: "Fiscal",
    status: "concluida",
    messages: [
      { author: "cliente", daysAgo: 9, hoursAgo: 4, body: "O DAS deste mês veio mais alto que o normal. Está certo?" },
      { author: "equipe", daysAgo: 9, hoursAgo: 1, body: "Está sim, Marina. O faturamento dos últimos 12 meses mudou de faixa, então a alíquota efetiva subiu um pouco. Preparamos uma simulação para os próximos meses — quer marcar uma conversa rápida?" },
      { author: "cliente", daysAgo: 8, body: "Quero sim, obrigada pela explicação!" },
    ],
  },
  {
    client: 2,
    subject: "Alteração de endereço da empresa",
    category: "Abertura e alterações",
    status: "aberta",
    messages: [
      { author: "cliente", daysAgo: 0, hoursAgo: 3, body: "Vamos mudar a loja para a avenida no mês que vem. O que precisa para alterar o endereço no CNPJ e na prefeitura?" },
    ],
  },
  {
    client: 3,
    subject: "Declaração de faturamento para financiamento",
    category: "Contábil",
    status: "aberta",
    messages: [
      { author: "cliente", daysAgo: 1, hoursAgo: 2, body: "O banco pediu a declaração de faturamento dos últimos 12 meses assinada pelo contador, para o financiamento do novo equipamento." },
    ],
  },
  {
    client: 5,
    subject: "Rescisão de motorista",
    category: "Departamento pessoal",
    status: "em_andamento",
    messages: [
      { author: "cliente", daysAgo: 2, hoursAgo: 8, body: "Um motorista pediu demissão, último dia na sexta. Como fica o aviso prévio?" },
      { author: "equipe", daysAgo: 1, hoursAgo: 4, body: "Juliano, como foi pedido de demissão, ele cumpre o aviso de 30 dias ou vocês podem dispensá-lo. Estamos calculando a rescisão nos dois cenários para você decidir." },
    ],
  },
  {
    client: 4,
    subject: "Parcelamento de débito de ICMS",
    category: "Fiscal",
    status: "aguardando_cliente",
    messages: [
      { author: "cliente", daysAgo: 4, hoursAgo: 1, body: "Recebemos notificação da Sefaz sobre ICMS em atraso. Dá para parcelar?" },
      { author: "equipe", daysAgo: 3, hoursAgo: 5, body: "Dá sim, Antônio. Simulamos três cenários de parcelamento. Precisamos que você escolha a opção e envie o extrato bancário atualizado para confirmarmos o fluxo de caixa." },
    ],
  },
  {
    client: 8,
    subject: "Planejamento sucessório – holding familiar",
    category: "Jurídico",
    status: "em_andamento",
    messages: [
      { author: "cliente", daysAgo: 6, body: "Meu pai quer organizar a sucessão das fazendas. Vocês fazem a holding?" },
      { author: "equipe", daysAgo: 5, body: "Fazemos sim, Luiz. A área jurídica preparou um roteiro inicial; vamos agendar uma reunião com a família para apresentar o comparativo entre inventário e holding." },
    ],
  },
];

async function insertPdfFile(
  tx: Tx,
  clientId: number,
  name: string,
  title: string,
  lines: PdfLine[],
  uploadedBy: "cliente" | "equipe",
  createdAt: Date,
) {
  const data = buildPdf(title, lines);
  const [row] = await tx
    .insert(files)
    .values({ clientId, name, mimeType: "application/pdf", size: data.length, data, uploadedBy, createdAt })
    .returning({ id: files.id });
  return row.id;
}

async function ensureStaff(tx: Tx) {
  await tx
    .insert(users)
    .values({ name: STAFF_NAME, email: DEMO_STAFF_EMAIL, passwordHash: hashPassword(DEMO_PASSWORD), role: "equipe" })
    .onConflictDoNothing({ target: users.email });
}

async function seedPortalData(tx: Tx) {
  const now = Date.now();
  const ago = (days: number, hours = 0) => new Date(now - days * 86_400_000 - hours * 3_600_000);
  const comp = currentCompetence();
  const today = todayISO();

  const inserted = await tx
    .insert(clients)
    .values(CLIENT_SEEDS.map(({ completion: _completion, ...rest }) => rest))
    .returning({ id: clients.id });
  const ids = inserted.map((c) => c.id);

  await tx.insert(users).values({
    name: "Marina Souza",
    email: DEMO_CLIENT_EMAIL,
    passwordHash: hashPassword(DEMO_PASSWORD),
    role: "cliente",
    clientId: ids[0],
  });

  for (let i = 0; i < CLIENT_SEEDS.length; i++) {
    const seed = CLIENT_SEEDS[i];
    const clientId = ids[i];
    const rand = rng(1000 + i * 7919);
    const items = checklistFor(seed);
    const deliveredCount = Math.round(seed.completion * items.length);

    // Checklist mensal
    for (let j = 0; j < items.length; j++) {
      const item = items[j];
      const plan: DocPlan =
        i === 0
          ? DEMO_DOC_PLAN[j] ?? { status: "pendente", offset: 4 }
          : {
              status: j < deliveredCount ? (rand() < 0.6 ? "aprovado" : "enviado") : "pendente",
              offset: OTHER_OFFSETS[j % OTHER_OFFSETS.length],
            };
      let fileId: number | null = null;
      let submittedAt: Date | null = null;
      if (plan.status !== "pendente") {
        submittedAt = ago(1 + Math.floor(rand() * 4), Math.floor(rand() * 8));
        fileId = await insertPdfFile(
          tx,
          clientId,
          `${slugify(item.title)}-${comp}.pdf`,
          item.title,
          [
            { text: `Empresa: ${seed.legalName}` },
            { text: `Competência: ${competenceLabel(comp, true)}` },
            { text: "Arquivo enviado pelo cliente pela Central Goldoni (demonstração).", gap: 30, color: [0.35, 0.38, 0.45] },
          ],
          "cliente",
          submittedAt,
        );
      }
      await tx.insert(documentRequests).values({
        clientId,
        competence: comp,
        title: item.title,
        description: item.description,
        category: item.category,
        dueDate: addDaysISO(today, plan.offset),
        status: plan.status,
        fileId,
        note: plan.note ?? null,
        submittedAt,
      });
    }

    // Guias e relatórios do escritório
    const plans = deliverablesFor(seed, comp, rand);
    for (let k = 0; k < plans.length; k++) {
      const d = plans[k];
      const createdAt = ago(2 + k, 3);
      const fileId = await insertPdfFile(tx, clientId, d.fileName, d.title, d.lines, "equipe", createdAt);
      let status = "disponivel";
      let paidAt: Date | null = null;
      let viewedAt: Date | null = null;
      if (i === 0) {
        if (d.title.includes("DCTFWeb")) {
          status = "pago";
          paidAt = ago(1);
        }
        if (d.title.startsWith("Balancete")) {
          status = "visualizado";
          viewedAt = ago(5);
        }
      } else if (d.kind === "guia" && rand() < 0.45) {
        status = "pago";
        paidAt = ago(1);
      } else if (d.kind === "relatorio" && rand() < 0.5) {
        status = "visualizado";
        viewedAt = ago(1);
      }
      await tx.insert(deliverables).values({
        clientId,
        kind: d.kind,
        title: d.title,
        competence: d.competence,
        dueDate: d.dueDate,
        amountCents: d.amountCents,
        status,
        fileId,
        paidAt,
        viewedAt,
        createdAt,
      });
    }

    // Certidões monitoradas
    await tx.insert(certificates).values(
      CERT_KINDS.map((kind, idx) => ({
        clientId,
        kind,
        expiresAt: addDaysISO(today, i === 0 ? DEMO_CERT_OFFSETS[idx] : Math.round(rand() * 175) - 12),
        irregular: i === 4 && idx === 2,
        checkedAt: ago(0, 6 + idx),
      })),
    );
  }

  // Solicitações (protocolos)
  for (const t of TICKET_SEEDS) {
    const times = t.messages.map((m) => ago(m.daysAgo, m.hoursAgo ?? 0));
    const [ticket] = await tx
      .insert(tickets)
      .values({
        clientId: ids[t.client],
        subject: t.subject,
        category: t.category,
        status: t.status,
        createdAt: times[0],
        updatedAt: times[times.length - 1],
      })
      .returning({ id: tickets.id });
    await tx.insert(ticketMessages).values(
      t.messages.map((m, idx) => ({
        ticketId: ticket.id,
        author: m.author,
        authorName: m.author === "cliente" ? CLIENT_SEEDS[t.client].contactName : STAFF_SIGNATURE,
        body: m.body,
        createdAt: times[idx],
      })),
    );
  }

  // Avisos
  await tx.insert(notices).values([
    {
      clientId: null,
      title: "Reforma Tributária: 2026 é o ano de teste da CBS e do IBS",
      body: "As notas fiscais passam a destacar CBS e IBS em caráter de teste. Nossa equipe está revisando o emissor de todos os clientes — se você usa um sistema próprio, fale conosco.",
      createdAt: ago(6),
    },
    {
      clientId: null,
      title: "Imposto de Renda: comece a separar seus documentos",
      body: "Sócios e familiares podem enviar os documentos do IRPF pela Central Goldoni. Veja o checklist completo na área de conteúdos do site.",
      createdAt: ago(12),
    },
    {
      clientId: ids[0],
      title: "Sua certidão municipal venceu",
      body: "Já pedimos a renovação junto à prefeitura. Você será avisado aqui quando a nova certidão estiver disponível.",
      createdAt: ago(1, 2),
    },
  ]);

  // Histórico de cobrança via WhatsApp
  await tx.insert(reminders).values({
    clientId: ids[2],
    competence: comp,
    channel: "whatsapp",
    message: `Olá, Carlos! Para fecharmos o movimento de ${competenceLabel(comp)} ainda faltam alguns documentos. Envie pela Central Goldoni.`,
    createdAt: ago(2, 1),
  });
}

async function seedLeads(tx: Tx) {
  const now = Date.now();
  const ago = (days: number, hours = 0) => new Date(now - days * 86_400_000 - hours * 3_600_000);
  await tx.insert(leads).values([
    {
      name: "Rafael Mendes",
      company: "Mendes Hortifruti",
      email: "rafael@mendeshortifruti.com.br",
      phone: "(18) 99812-3456",
      service: "Abertura de empresa",
      message: "Sou MEI e o faturamento cresceu. Quero abrir uma ME e entender quanto vou pagar de imposto.",
      sourcePage: "/servicos/abertura-de-empresa",
      status: "novo",
      createdAt: ago(0, 4),
    },
    {
      name: "Luciana Prado",
      company: "Prado Moda Feminina",
      email: "luciana@pradomoda.com.br",
      phone: "(18) 99654-7788",
      service: "Troca de contador",
      message: "Sinto que pago muito imposto e não tenho retorno do contador atual.",
      sourcePage: "/servicos/contabilidade-em-junqueiropolis",
      status: "em_contato",
      createdAt: ago(2, 2),
    },
    {
      name: "Paulo Henrique Dias",
      company: "Clínica Veterinária Amigo Fiel",
      email: "paulo@amigofiel.vet.br",
      phone: "(18) 99777-1020",
      service: "Planejamento tributário",
      message: "Quero avaliar se vale a pena sair do Simples Nacional.",
      sourcePage: "/servicos/planejamento-tributario",
      status: "proposta",
      createdAt: ago(5, 1),
    },
  ]);
}

/** Popula o banco vazio com dados de demonstração. */
export async function seedAll() {
  await db.transaction(async (tx) => {
    await ensureStaff(tx);
    await seedPortalData(tx);
    const [row] = await tx.select({ count: sql<number>`count(*)::int` }).from(leads);
    if (!row || row.count === 0) await seedLeads(tx);
  });
}

/** Restaura os dados do portal (mantém leads e a conta da equipe). */
export async function resetDemoData() {
  await db.transaction(async (tx) => {
    await tx.delete(clients);
    await tx.delete(notices);
    await ensureStaff(tx);
    await seedPortalData(tx);
  });
}
