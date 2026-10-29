"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  users,
} from "@/db/schema";
import { requireStaff } from "@/lib/auth";
import { addDaysISO, competenceLabel, currentCompetence, formatDateBR, formatMoney, todayISO } from "@/lib/format";
import { hashPassword } from "@/lib/password";
import { buildPdf } from "@/lib/pdf";
import { DEMO_PASSWORD, resetDemoData } from "@/lib/seed";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const LEAD_STATUSES = ["novo", "em_contato", "proposta", "ganho", "perdido"];

function refresh() {
  revalidatePath("/equipe", "layout");
  revalidatePath("/portal", "layout");
}

export async function reviewDocument(formData: FormData) {
  await requireStaff();
  const id = Number(formData.get("id"));
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  if (decision === "aprovar") {
    await db.update(documentRequests).set({ status: "aprovado", note: null }).where(eq(documentRequests.id, id));
  } else if (decision === "rejeitar") {
    await db
      .update(documentRequests)
      .set({ status: "rejeitado", note: note || "Arquivo ilegível ou incompleto. Por favor, reenvie." })
      .where(eq(documentRequests.id, id));
  }
  refresh();
}

export async function publishDeliverable(formData: FormData) {
  await requireStaff();
  const clientId = Number(formData.get("clientId"));
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  const kind = formData.get("kind") === "relatorio" ? "relatorio" : "guia";
  const compRaw = String(formData.get("competence") ?? "");
  const competence = /^\d{4}-\d{2}$/.test(compRaw) ? compRaw : currentCompetence();
  const dueRaw = String(formData.get("dueDate") ?? "");
  const dueDate = kind === "guia" && /^\d{4}-\d{2}-\d{2}$/.test(dueRaw) ? dueRaw : null;
  const amountRaw = String(formData.get("amount") ?? "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const amountParsed = amountRaw ? Math.round(parseFloat(amountRaw) * 100) : NaN;
  const amountCents = kind === "guia" && Number.isFinite(amountParsed) ? amountParsed : null;
  if (!title || !clientId) return;

  const [client] = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
  if (!client) return;

  const upload = formData.get("file");
  let fileRow: { name: string; mimeType: string; data: Buffer };
  if (upload instanceof File && upload.size > 0 && upload.size <= MAX_FILE_BYTES) {
    fileRow = {
      name: upload.name.slice(0, 200),
      mimeType: upload.type || "application/octet-stream",
      data: Buffer.from(await upload.arrayBuffer()),
    };
  } else {
    fileRow = {
      name: `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}-${competence}.pdf`,
      mimeType: "application/pdf",
      data: buildPdf(title, [
        { text: `Contribuinte: ${client.legalName}` },
        { text: `CNPJ: ${client.cnpj}` },
        { text: `Competência: ${competenceLabel(competence, true)}` },
        ...(dueDate ? [{ text: `Vencimento: ${formatDateBR(dueDate)}` }] : []),
        ...(amountCents != null ? [{ text: `Valor: ${formatMoney(amountCents)}`, bold: true, size: 14, gap: 30 }] : []),
      ]),
    };
  }

  const [saved] = await db
    .insert(files)
    .values({ clientId, ...fileRow, size: fileRow.data.length, uploadedBy: "equipe" })
    .returning({ id: files.id });

  await db.insert(deliverables).values({
    clientId,
    kind,
    title,
    competence,
    dueDate,
    amountCents,
    status: "disponivel",
    fileId: saved.id,
  });

  await db.insert(notices).values({
    clientId,
    title: kind === "guia" ? `Nova guia disponível: ${title}` : `Novo documento disponível: ${title}`,
    body:
      kind === "guia" && dueDate
        ? `Competência ${competenceLabel(competence)} · vencimento em ${formatDateBR(dueDate)}${amountCents != null ? ` · ${formatMoney(amountCents)}` : ""}.`
        : `Competência ${competenceLabel(competence)}. Acesse Guias e relatórios para baixar.`,
  });

  refresh();
}

export async function updateLeadStatus(formData: FormData) {
  await requireStaff();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!LEAD_STATUSES.includes(status)) return;
  await db.update(leads).set({ status }).where(eq(leads.id, id));
  revalidatePath("/equipe", "layout");
}

export async function logReminder(formData: FormData) {
  await requireStaff();
  const clientId = Number(formData.get("clientId"));
  const competence = String(formData.get("competence") ?? currentCompetence());
  const message = String(formData.get("message") ?? "").slice(0, 2000);
  if (!clientId || !message) return;
  await db.insert(reminders).values({ clientId, competence, channel: "whatsapp", message });
  revalidatePath("/equipe", "layout");
}

const VALIDITY_DAYS: Record<string, number> = {
  "CND Federal (Receita/PGFN)": 180,
  "CRF – FGTS": 30,
  "CND Estadual (Sefaz-SP)": 90,
  "CND Municipal": 90,
  "CNDT – Trabalhista": 180,
};

export async function renewCertificate(formData: FormData) {
  await requireStaff();
  const id = Number(formData.get("id"));
  const [cert] = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
  if (!cert) return;
  const expiresAt = addDaysISO(todayISO(), VALIDITY_DAYS[cert.kind] ?? 90);
  await db
    .update(certificates)
    .set({ expiresAt, irregular: false, checkedAt: new Date() })
    .where(eq(certificates.id, id));
  await db.insert(notices).values({
    clientId: cert.clientId,
    title: `${cert.kind} renovada`,
    body: `A nova certidão é válida até ${formatDateBR(expiresAt)}. Se precisar do PDF, abra uma solicitação.`,
  });
  refresh();
}

export async function resetDemo() {
  await requireStaff();
  await resetDemoData();
  revalidatePath("/", "layout");
  redirect("/equipe?restaurado=1");
}

const DEFAULT_DOCS = [
  { title: "Extratos bancários de todas as contas", description: "PDF ou OFX do mês completo.", category: "Contábil" },
  { title: "Notas fiscais de entrada (XML)", description: "Compras e serviços tomados.", category: "Fiscal" },
  { title: "Relatório de vendas / notas de saída", description: "Total faturado no mês.", category: "Fiscal" },
  { title: "Extrato das maquininhas e Pix", description: "Vendas por operadora.", category: "Fiscal" },
  { title: "Comprovantes de despesas", description: "Aluguel, energia, fornecedores.", category: "Contábil" },
];

const DEFAULT_CERTS = [
  "CND Federal (Receita/PGFN)",
  "CRF – FGTS",
  "CND Estadual (Sefaz-SP)",
  "CND Municipal",
  "CNDT – Trabalhista",
];

async function seedNewClient(clientId: number) {
  const today = todayISO();
  await db.insert(documentRequests).values(
    DEFAULT_DOCS.map((item, i) => ({
      clientId,
      competence: currentCompetence(),
      title: item.title,
      description: item.description,
      category: item.category,
      dueDate: addDaysISO(today, 3 + i),
      status: "pendente",
    })),
  );
  await db.insert(certificates).values(
    DEFAULT_CERTS.map((kind) => ({
      clientId,
      kind,
      expiresAt: addDaysISO(today, VALIDITY_DAYS[kind] ?? 90),
      irregular: false,
    })),
  );
}

export async function createClient(formData: FormData) {
  await requireStaff();
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const legalName = get("legalName").slice(0, 160);
  const tradeName = get("tradeName").slice(0, 120) || legalName;
  const cnpj = get("cnpj").slice(0, 20);
  const contactName = get("contactName").slice(0, 120);
  const contactPhone = get("contactPhone").slice(0, 40);
  const contactEmail = get("contactEmail").slice(0, 160).toLowerCase();
  if (!legalName || !cnpj || !contactName || !contactPhone) return;

  const [client] = await db
    .insert(clients)
    .values({
      legalName,
      tradeName,
      cnpj,
      regime: get("regime") || "Simples Nacional",
      segment: get("segment") || "Comércio",
      contactName,
      contactPhone,
      contactEmail: contactEmail || `${contactName.split(" ")[0].toLowerCase()}@empresa.com.br`,
      employees: Number(get("employees")) || 0,
      clientSince: new Date().getFullYear(),
    })
    .returning({ id: clients.id });

  await seedNewClient(client.id);

  if (contactEmail) {
    await db
      .insert(users)
      .values({
        name: contactName,
        email: contactEmail,
        passwordHash: hashPassword(DEMO_PASSWORD),
        role: "cliente",
        clientId: client.id,
      })
      .onConflictDoNothing({ target: users.email });
  }

  refresh();
  redirect(`/equipe/clientes/${client.id}`);
}

export async function addDocumentRequest(formData: FormData) {
  await requireStaff();
  const clientId = Number(formData.get("clientId"));
  const title = String(formData.get("title") ?? "").trim().slice(0, 160);
  const description = String(formData.get("description") ?? "").trim().slice(0, 300);
  const category = String(formData.get("category") ?? "Fiscal").slice(0, 40);
  const dueRaw = String(formData.get("dueDate") ?? "");
  const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(dueRaw) ? dueRaw : addDaysISO(todayISO(), 5);
  if (!clientId || !title) return;

  await db.insert(documentRequests).values({
    clientId,
    competence: currentCompetence(),
    title,
    description,
    category,
    dueDate,
    status: "pendente",
  });
  refresh();
}

export async function convertLeadToClient(formData: FormData) {
  await requireStaff();
  const id = Number(formData.get("id"));
  const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) return;

  const tradeName = (lead.company || lead.name).slice(0, 120);
  const [client] = await db
    .insert(clients)
    .values({
      legalName: tradeName,
      tradeName,
      cnpj: "00.000.000/0001-00",
      regime: "Simples Nacional",
      segment: lead.service || "A definir",
      contactName: lead.name,
      contactPhone: lead.phone,
      contactEmail: lead.email || `${lead.name.split(" ")[0].toLowerCase()}@cliente.com.br`,
      employees: 0,
      clientSince: new Date().getFullYear(),
    })
    .returning({ id: clients.id });

  await seedNewClient(client.id);
  if (lead.email) {
    await db
      .insert(users)
      .values({
        name: lead.name,
        email: lead.email.toLowerCase(),
        passwordHash: hashPassword(DEMO_PASSWORD),
        role: "cliente",
        clientId: client.id,
      })
      .onConflictDoNothing({ target: users.email });
  }
  await db.update(leads).set({ status: "ganho" }).where(eq(leads.id, id));
  refresh();
  redirect(`/equipe/clientes/${client.id}`);
}
