import { and, asc, desc, eq, isNull, ne, or } from "drizzle-orm";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, Card, CardHeader, EmptyState, PageHeader, ProgressBar, StatCard, progressTone } from "@/components/ui";
import { db } from "@/db";
import { certificates, clients, deliverables, documentRequests, notices, tickets } from "@/db/schema";
import { requireClient } from "@/lib/auth";
import {
  DOC_STATUS,
  TICKET_STATUS,
  certStatus,
  competenceLabel,
  currentCompetence,
  deliverableStatus,
  diffDays,
  dueInfo,
  formatDateBR,
  formatMoney,
  protocolo,
  timeAgo,
  todayISO,
} from "@/lib/format";

export default async function PortalHome() {
  const user = await requireClient();
  const comp = currentCompetence();
  const today = todayISO();

  const [client] = await db.select().from(clients).where(eq(clients.id, user.clientId)).limit(1);
  const docs = await db
    .select({ id: documentRequests.id, title: documentRequests.title, status: documentRequests.status, dueDate: documentRequests.dueDate })
    .from(documentRequests)
    .where(and(eq(documentRequests.clientId, user.clientId), eq(documentRequests.competence, comp)))
    .orderBy(asc(documentRequests.dueDate));
  const guias = await db
    .select()
    .from(deliverables)
    .where(and(eq(deliverables.clientId, user.clientId), eq(deliverables.kind, "guia"), ne(deliverables.status, "pago")))
    .orderBy(asc(deliverables.dueDate));
  const openTickets = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.clientId, user.clientId), ne(tickets.status, "concluida")))
    .orderBy(desc(tickets.updatedAt));
  const certs = await db
    .select()
    .from(certificates)
    .where(eq(certificates.clientId, user.clientId))
    .orderBy(asc(certificates.expiresAt));
  const notes = await db
    .select()
    .from(notices)
    .where(or(isNull(notices.clientId), eq(notices.clientId, user.clientId)))
    .orderBy(desc(notices.createdAt))
    .limit(4);

  const delivered = docs.filter((d) => d.status === "enviado" || d.status === "aprovado").length;
  const pct = docs.length ? (delivered / docs.length) * 100 : 0;
  const overdue = docs.filter((d) => d.status === "pendente" && diffDays(today, d.dueDate) < 0);
  const rejected = docs.filter((d) => d.status === "rejeitado");
  const totalToPay = guias.reduce((sum, g) => sum + (g.amountCents ?? 0), 0);
  const certIssues = certs.filter((c) => certStatus(c.expiresAt, c.irregular).tone !== "success");
  const waiting = openTickets.filter((t) => t.status === "aguardando_cliente").length;
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow="Visão geral"
        title={`Olá, ${firstName}!`}
        description={
          <>
            {client?.legalName} · CNPJ {client?.cnpj} · {client?.regime}
          </>
        }
        actions={
          <Link
            href="/portal/documentos"
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-800"
          >
            <Icon name="upload" className="h-4 w-4" /> Enviar documentos
          </Link>
        }
      />

      {(overdue.length > 0 || rejected.length > 0) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
          <p className="flex items-center gap-3 text-sm text-rose-800">
            <Icon name="alert" className="h-5 w-5 shrink-0" />
            <span>
              <strong>Atenção:</strong>{" "}
              {overdue.length > 0 && `${overdue.length} documento${overdue.length > 1 ? "s" : ""} em atraso`}
              {overdue.length > 0 && rejected.length > 0 && " e "}
              {rejected.length > 0 && `${rejected.length} para reenviar`}. Isso pode atrasar o fechamento de{" "}
              {competenceLabel(comp)}.
            </span>
          </p>
          <Link href="/portal/documentos" className="text-sm font-semibold text-rose-700 underline underline-offset-2">
            Resolver agora →
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Documentos de ${competenceLabel(comp)}`}
          value={`${delivered}/${docs.length}`}
          hint={`${Math.round(pct)}% entregue`}
          icon="folder"
          tone={progressTone(pct)}
          href="/portal/documentos"
        />
        <StatCard
          label="Guias a pagar"
          value={guias.length}
          hint={`Total: ${formatMoney(totalToPay)}`}
          icon="receipt"
          tone={guias.length ? "warning" : "success"}
          href="/portal/guias"
        />
        <StatCard
          label="Solicitações abertas"
          value={openTickets.length}
          hint={waiting ? `${waiting} aguardando sua resposta` : "Nenhuma pendência sua"}
          icon="message"
          tone={waiting ? "warning" : "brand"}
          href="/portal/solicitacoes"
        />
        <StatCard
          label="Certidões regulares"
          value={`${certs.length - certIssues.length}/${certs.length}`}
          hint={certIssues.length ? `${certIssues.length} exigem atenção` : "Tudo em dia"}
          icon="shield"
          tone={certIssues.length ? "danger" : "success"}
          href="/portal/certidoes"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader
              icon="folder"
              title={`Checklist de ${competenceLabel(comp)}`}
              subtitle="O que precisamos para fechar o mês da sua empresa"
              action={
                <Link href="/portal/documentos" className="text-sm font-semibold text-navy-700 hover:text-navy-900">
                  Ver tudo →
                </Link>
              }
            />
            <div className="px-5 pt-4">
              <ProgressBar value={pct} tone={progressTone(pct)} />
            </div>
            <ul className="divide-y divide-slate-100 px-5 pb-2">
              {docs.map((d) => {
                const st = DOC_STATUS[d.status] ?? DOC_STATUS.pendente;
                const due = dueInfo(d.dueDate);
                const open = d.status === "pendente" || d.status === "rejeitado";
                return (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <span className="flex min-w-0 items-center gap-3 text-sm text-slate-700">
                      <Icon name={open ? "clock" : "checkCircle"} className={`h-4 w-4 shrink-0 ${open ? "text-amber-500" : "text-emerald-500"}`} />
                      <span className="truncate">{d.title}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {open && <Badge tone={due.tone}>{due.text}</Badge>}
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <CardHeader
              icon="receipt"
              title="Próximas guias"
              subtitle="Pague até o vencimento para evitar multa e juros"
              action={
                <Link href="/portal/guias" className="text-sm font-semibold text-navy-700 hover:text-navy-900">
                  Guias e relatórios →
                </Link>
              }
            />
            {guias.length === 0 ? (
              <EmptyState icon="checkCircle" title="Nenhuma guia em aberto" text="Tudo pago por aqui. 👏" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {guias.map((g) => {
                  const st = deliverableStatus(g.kind, g.status, g.dueDate);
                  return (
                    <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{g.title}</p>
                        <p className="text-xs text-slate-500">
                          {competenceLabel(g.competence, true)} · vence {formatDateBR(g.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-900">{formatMoney(g.amountCents)}</span>
                        <Badge tone={st.tone}>{st.label}</Badge>
                        {g.fileId && (
                          <a
                            href={`/api/arquivos/${g.fileId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:text-navy-900"
                          >
                            <Icon name="download" className="h-3.5 w-3.5" /> PDF
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader
              icon="message"
              title="Solicitações em andamento"
              action={
                <Link href="/portal/solicitacoes" className="text-sm font-semibold text-navy-700 hover:text-navy-900">
                  Nova solicitação →
                </Link>
              }
            />
            {openTickets.length === 0 ? (
              <EmptyState title="Nenhuma solicitação aberta" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {openTickets.map((t) => {
                  const st = TICKET_STATUS[t.status] ?? TICKET_STATUS.aberta;
                  return (
                    <li key={t.id}>
                      <Link href={`/portal/solicitacoes/${t.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{t.subject}</p>
                          <p className="text-xs text-slate-500">
                            {protocolo(t.id, t.createdAt)} · {t.category} · atualizado {timeAgo(t.updatedAt)}
                          </p>
                        </div>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader icon="bell" title="Avisos do escritório" />
            <ul className="divide-y divide-slate-100">
              {notes.map((n) => (
                <li key={n.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    {n.clientId && <Badge tone="brand">Para você</Badge>}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{n.body}</p>
                  <p className="mt-1.5 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader icon="shield" title="Certidões monitoradas" subtitle="Verificadas automaticamente todos os dias" />
            <ul className="divide-y divide-slate-100">
              {certs.map((c) => {
                const st = certStatus(c.expiresAt, c.irregular);
                return (
                  <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{c.kind}</p>
                      <p className="text-xs text-slate-500">
                        {c.irregular
                          ? "Pendência identificada — a equipe já está tratando"
                          : st.days < 0
                            ? `Venceu em ${formatDateBR(c.expiresAt)}`
                            : `Válida até ${formatDateBR(c.expiresAt)}`}
                      </p>
                    </div>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
