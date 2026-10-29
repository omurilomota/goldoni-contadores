import { and, asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addDocumentRequest,
  logReminder,
  publishDeliverable,
  renewCertificate,
  reviewDocument,
} from "@/app/actions/staff";
import { SubmitButton, WhatsAppChargeButton } from "@/components/client-ui";
import { Icon } from "@/components/icons";
import { Badge, Card, CardHeader, EmptyState, ProgressBar, progressTone } from "@/components/ui";
import { db } from "@/db";
import { certificates, clients, deliverables, documentRequests, files, reminders, tickets } from "@/db/schema";
import { requireStaff } from "@/lib/auth";
import {
  DOC_STATUS,
  TICKET_STATUS,
  addDaysISO,
  certStatus,
  competenceLabel,
  currentCompetence,
  deliverableStatus,
  dueInfo,
  formatDateBR,
  formatDateTimeBR,
  formatMoney,
  protocolo,
  timeAgo,
  todayISO,
  waLink,
} from "@/lib/format";
import { SITE_URL } from "@/lib/site";

const fieldClass =
  "mt-1 block w-full rounded-lg border-0 px-3 py-2 text-sm shadow-sm ring-1 ring-inset ring-slate-300 outline-none focus:ring-2 focus:ring-navy-600";

export default async function ClienteDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  const { id } = await params;
  const clientId = Number(id);
  if (!Number.isInteger(clientId) || clientId <= 0) notFound();

  const [client] = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
  if (!client) notFound();

  const comp = currentCompetence();
  const docs = await db
    .select({
      id: documentRequests.id,
      title: documentRequests.title,
      category: documentRequests.category,
      status: documentRequests.status,
      dueDate: documentRequests.dueDate,
      note: documentRequests.note,
      submittedAt: documentRequests.submittedAt,
      fileId: documentRequests.fileId,
      fileName: files.name,
    })
    .from(documentRequests)
    .leftJoin(files, eq(documentRequests.fileId, files.id))
    .where(and(eq(documentRequests.clientId, clientId), eq(documentRequests.competence, comp)))
    .orderBy(asc(documentRequests.dueDate));
  const published = await db
    .select()
    .from(deliverables)
    .where(eq(deliverables.clientId, clientId))
    .orderBy(desc(deliverables.createdAt));
  const certs = await db.select().from(certificates).where(eq(certificates.clientId, clientId)).orderBy(asc(certificates.expiresAt));
  const clientTickets = await db.select().from(tickets).where(eq(tickets.clientId, clientId)).orderBy(desc(tickets.updatedAt));
  const history = await db
    .select()
    .from(reminders)
    .where(eq(reminders.clientId, clientId))
    .orderBy(desc(reminders.createdAt))
    .limit(5);

  const delivered = docs.filter((d) => d.status === "enviado" || d.status === "aprovado").length;
  const pct = docs.length ? (delivered / docs.length) * 100 : 0;
  const pending = docs.filter((d) => d.status === "pendente" || d.status === "rejeitado");
  const contactFirst = client.contactName.replace(/^Dra?\.\s*/, "").split(" ")[0];
  const message = `Olá, ${contactFirst}! Aqui é ${user.name.split(" ")[0]}, da Goldoni Contadores.\n\nPara fecharmos o movimento de ${competenceLabel(comp)} da ${client.tradeName}, ainda faltam:\n${pending.map((p) => `• ${p.title}`).join("\n")}\n\nVocê pode enviar direto pela Central Goldoni: ${SITE_URL}/portal/documentos\n\nQualquer dúvida, é só responder aqui. Obrigada!`;

  return (
    <>
      <Link href="/equipe" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-800">
        <Icon name="arrowLeft" className="h-4 w-4" /> Visão geral
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">{client.segment}</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-navy-950">{client.tradeName}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {client.legalName} · CNPJ {client.cnpj} · {client.regime} · {client.employees} funcionário
            {client.employees === 1 ? "" : "s"} · cliente desde {client.clientSince}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Contato: {client.contactName} · {client.contactPhone} · {client.contactEmail}
          </p>
        </div>
        {pending.length > 0 && (
          <WhatsAppChargeButton
            link={waLink(client.contactPhone, message)}
            message={message}
            clientName={client.tradeName}
            logAction={logReminder}
            clientId={client.id}
            competence={comp}
            lastReminder={history[0] ? timeAgo(history[0].createdAt) : null}
          />
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader
              icon="folder"
              title={`Checklist de ${competenceLabel(comp)}`}
              subtitle={`${delivered} de ${docs.length} entregues`}
            />
            <div className="px-5 pt-4">
              <ProgressBar value={pct} tone={progressTone(pct)} />
            </div>
            <form action={addDocumentRequest} className="mx-5 mt-4 grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_140px_120px_auto]">
              <input type="hidden" name="clientId" value={client.id} />
              <input name="title" required placeholder="Novo item do checklist" className="rounded-lg border-0 px-3 py-2 text-sm ring-1 ring-inset ring-slate-300" />
              <select name="category" className="rounded-lg border-0 px-3 py-2 text-sm ring-1 ring-inset ring-slate-300">
                <option>Fiscal</option>
                <option>Contábil</option>
                <option>Pessoal</option>
              </select>
              <input type="date" name="dueDate" defaultValue={addDaysISO(todayISO(), 5)} className="rounded-lg border-0 px-3 py-2 text-sm ring-1 ring-inset ring-slate-300" />
              <SubmitButton size="sm" pendingText="…">
                <Icon name="plus" className="h-3.5 w-3.5" /> Incluir
              </SubmitButton>
            </form>
            <ul className="divide-y divide-slate-100">
              {docs.map((d) => {
                const st = DOC_STATUS[d.status] ?? DOC_STATUS.pendente;
                const due = dueInfo(d.dueDate);
                return (
                  <li key={d.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{d.title}</p>
                        <p className="text-xs text-slate-500">
                          {d.category} · prazo {formatDateBR(d.dueDate)}
                          {d.submittedAt && ` · enviado ${timeAgo(d.submittedAt)}`}
                        </p>
                        {d.fileId && (
                          <a
                            href={`/api/arquivos/${d.fileId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-navy-700 hover:text-navy-900"
                          >
                            <Icon name="file" className="h-3.5 w-3.5" /> {d.fileName}
                          </a>
                        )}
                        {d.note && d.status === "rejeitado" && (
                          <p className="mt-1.5 text-xs text-rose-600">Motivo enviado: {d.note}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {(d.status === "pendente" || d.status === "rejeitado") && <Badge tone={due.tone}>{due.text}</Badge>}
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </div>
                    </div>
                    {d.status === "enviado" && (
                      <form action={reviewDocument} className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
                        <input type="hidden" name="id" value={d.id} />
                        <input
                          name="note"
                          placeholder="Motivo da rejeição (opcional)"
                          className="min-w-[200px] flex-1 rounded-lg border-0 px-3 py-1.5 text-xs shadow-sm ring-1 ring-inset ring-slate-300 outline-none focus:ring-2 focus:ring-navy-600"
                        />
                        <SubmitButton name="decision" value="rejeitar" variant="danger" size="sm" pendingText="…">
                          Rejeitar
                        </SubmitButton>
                        <SubmitButton name="decision" value="aprovar" variant="success" size="sm" pendingText="…">
                          <Icon name="check" className="h-3.5 w-3.5" /> Aprovar
                        </SubmitButton>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <CardHeader icon="upload" title="Publicar guia ou relatório no portal" subtitle="O cliente é avisado na hora" />
            <form action={publishDeliverable} className="grid gap-4 p-5 sm:grid-cols-2">
              <input type="hidden" name="clientId" value={client.id} />
              <label className="text-sm font-medium text-slate-700">
                Tipo
                <select name="kind" className={fieldClass} defaultValue="guia">
                  <option value="guia">Guia de pagamento</option>
                  <option value="relatorio">Relatório / documento</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Título
                <input name="title" required list="deliverable-titles" placeholder="Ex.: DAS – Simples Nacional" className={fieldClass} />
                <datalist id="deliverable-titles">
                  {[
                    "DAS – Simples Nacional",
                    "FGTS Digital (GFD)",
                    "DARF Previdenciário (DCTFWeb)",
                    "DARF PIS/Cofins",
                    "Holerites e resumo da folha",
                    "Balancete mensal",
                    "Recibo de pró-labore",
                    "Certidão negativa (PDF)",
                  ].map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Competência
                <input type="month" name="competence" defaultValue={comp} className={fieldClass} />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Vencimento (guias)
                <input type="date" name="dueDate" defaultValue={addDaysISO(todayISO(), 10)} className={fieldClass} />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Valor (guias)
                <input name="amount" inputMode="decimal" placeholder="1.234,56" className={fieldClass} />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Arquivo (opcional)
                <input type="file" name="file" className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-navy-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-navy-800" />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                <p className="text-xs text-slate-500">Sem arquivo, um PDF de demonstração é gerado automaticamente.</p>
                <SubmitButton pendingText="Publicando…">
                  <Icon name="send" className="h-4 w-4" /> Publicar no portal
                </SubmitButton>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader icon="receipt" title="Guias e relatórios publicados" />
            <ul className="divide-y divide-slate-100">
              {published.map((p) => {
                const st = deliverableStatus(p.kind, p.status, p.dueDate);
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                      <p className="text-xs text-slate-500">
                        {competenceLabel(p.competence, true)}
                        {p.dueDate && ` · vence ${formatDateBR(p.dueDate)}`}
                        {p.amountCents != null && ` · ${formatMoney(p.amountCents)}`} · publicado {timeAgo(p.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={st.tone}>{st.label}</Badge>
                      {p.fileId && (
                        <a href={`/api/arquivos/${p.fileId}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-navy-700">
                          PDF
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader icon="shield" title="Certidões" subtitle="Renove com um clique (simulação)" />
            <ul className="divide-y divide-slate-100">
              {certs.map((c) => {
                const st = certStatus(c.expiresAt, c.irregular);
                return (
                  <li key={c.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{c.kind}</p>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500">Validade: {formatDateBR(c.expiresAt)}</p>
                      {st.tone !== "success" && (
                        <form action={renewCertificate}>
                          <input type="hidden" name="id" value={c.id} />
                          <SubmitButton variant="secondary" size="sm" pendingText="Emitindo…">
                            <Icon name="refresh" className="h-3.5 w-3.5" /> Emitir nova
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <CardHeader icon="message" title="Solicitações" />
            {clientTickets.length === 0 ? (
              <EmptyState title="Nenhuma solicitação" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {clientTickets.map((t) => {
                  const st = TICKET_STATUS[t.status] ?? TICKET_STATUS.aberta;
                  return (
                    <li key={t.id}>
                      <Link href={`/equipe/solicitacoes/${t.id}`} className="block px-5 py-3 hover:bg-slate-50">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">{t.subject}</p>
                          <Badge tone={st.tone}>{st.staffLabel}</Badge>
                        </div>
                        <p className="text-xs text-slate-500">{protocolo(t.id, t.createdAt)} · {timeAgo(t.updatedAt)}</p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader icon="whatsapp" title="Histórico de cobranças" />
            {history.length === 0 ? (
              <EmptyState title="Nenhuma cobrança enviada" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {history.map((h) => (
                  <li key={h.id} className="px-5 py-3">
                    <p className="text-xs font-semibold text-emerald-700">WhatsApp · {formatDateTimeBR(h.createdAt)}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{h.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
