import { asc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { logReminder } from "@/app/actions/staff";
import { WhatsAppChargeButton } from "@/components/client-ui";
import { Icon } from "@/components/icons";
import { Badge, Card, CardHeader, EmptyState, PageHeader, ProgressBar, StatCard, progressTone } from "@/components/ui";
import { db } from "@/db";
import { certificates, clients, documentRequests, leads, reminders, tickets } from "@/db/schema";
import { requireStaff } from "@/lib/auth";
import {
  certStatus,
  competenceLabel,
  currentCompetence,
  diffDays,
  formatDateBR,
  timeAgo,
  todayISO,
  waLink,
} from "@/lib/format";
import { SITE_URL } from "@/lib/site";

export default async function EquipeHome({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireStaff();
  const sp = await searchParams;
  const comp = currentCompetence();
  const today = todayISO();
  const staffFirstName = user.name.split(" ").slice(0, 2).join(" ");

  const allClients = await db.select().from(clients).orderBy(asc(clients.tradeName));
  const docs = await db
    .select({
      id: documentRequests.id,
      clientId: documentRequests.clientId,
      title: documentRequests.title,
      status: documentRequests.status,
      dueDate: documentRequests.dueDate,
      submittedAt: documentRequests.submittedAt,
    })
    .from(documentRequests)
    .where(eq(documentRequests.competence, comp));
  const lastReminders = await db
    .select({ clientId: reminders.clientId, last: sql<string>`max(${reminders.createdAt})` })
    .from(reminders)
    .where(eq(reminders.competence, comp))
    .groupBy(reminders.clientId);
  const ticketCounts = await db
    .select({ status: tickets.status, count: sql<number>`count(*)::int` })
    .from(tickets)
    .groupBy(tickets.status);
  const [newLeads] = await db.select({ count: sql<number>`count(*)::int` }).from(leads).where(eq(leads.status, "novo"));
  const certRows = await db
    .select({
      id: certificates.id,
      clientId: certificates.clientId,
      kind: certificates.kind,
      expiresAt: certificates.expiresAt,
      irregular: certificates.irregular,
      tradeName: clients.tradeName,
    })
    .from(certificates)
    .innerJoin(clients, eq(certificates.clientId, clients.id));

  const reminderMap = new Map(lastReminders.map((r) => [r.clientId, r.last]));
  const clientName = new Map(allClients.map((c) => [c.id, c.tradeName]));

  const rows = allClients
    .map((c) => {
      const cd = docs.filter((d) => d.clientId === c.id);
      const delivered = cd.filter((d) => d.status === "enviado" || d.status === "aprovado").length;
      const pending = cd.filter((d) => d.status === "pendente" || d.status === "rejeitado");
      const overdue = pending.filter((d) => diffDays(today, d.dueDate) < 0).length;
      const pct = cd.length ? (delivered / cd.length) * 100 : 100;
      return { c, total: cd.length, delivered, pending, overdue, pct, last: reminderMap.get(c.id) ?? null };
    })
    .sort((a, b) => a.pct - b.pct || b.overdue - a.overdue);

  const totalDocs = docs.length;
  const deliveredDocs = docs.filter((d) => d.status === "enviado" || d.status === "aprovado").length;
  const overallPct = totalDocs ? (deliveredDocs / totalDocs) * 100 : 0;
  const complete = rows.filter((r) => r.pct >= 100).length;
  const reviewQueue = docs
    .filter((d) => d.status === "enviado")
    .sort((a, b) => new Date(a.submittedAt ?? 0).getTime() - new Date(b.submittedAt ?? 0).getTime());
  const openTickets = ticketCounts.filter((t) => t.status !== "concluida").reduce((s, t) => s + t.count, 0);
  const newTickets = ticketCounts.find((t) => t.status === "aberta")?.count ?? 0;
  const certAlerts = certRows
    .map((c) => ({ ...c, st: certStatus(c.expiresAt, c.irregular) }))
    .filter((c) => c.st.tone !== "success")
    .sort((a, b) => a.st.days - b.st.days);

  const chargeMessage = (contact: string, company: string, titles: string[]) =>
    `Olá, ${contact.replace(/^Dra?\.\s*/, "").split(" ")[0]}! Aqui é ${staffFirstName.split(" ")[0]}, da Goldoni Contadores.\n\nPara fecharmos o movimento de ${competenceLabel(comp)} da ${company}, ainda faltam:\n${titles.map((t) => `• ${t}`).join("\n")}\n\nVocê pode enviar direto pela Central Goldoni: ${SITE_URL}/portal/documentos\n\nQualquer dúvida, é só responder aqui. Obrigada!`;

  return (
    <>
      {sp.restaurado && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800">
          <Icon name="checkCircle" className="h-5 w-5" /> Dados de demonstração restaurados com as datas de hoje.
        </div>
      )}
      <PageHeader
        eyebrow="Painel da equipe"
        title={`Fechamento de ${competenceLabel(comp)}`}
        description="Quem já entregou, quem está atrasado e o que precisa de conferência — tudo em uma tela, sem caçar documento no WhatsApp."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Movimento entregue"
          value={`${Math.round(overallPct)}%`}
          hint={`${complete} de ${rows.length} empresas completas`}
          icon="folder"
          tone={progressTone(overallPct)}
        />
        <StatCard
          label="Aguardando conferência"
          value={reviewQueue.length}
          hint="documentos enviados pelos clientes"
          icon="inbox"
          tone={reviewQueue.length ? "info" : "success"}
        />
        <StatCard
          label="Solicitações abertas"
          value={openTickets}
          hint={`${newTickets} novas sem resposta`}
          icon="message"
          tone={newTickets ? "warning" : "brand"}
          href="/equipe/solicitacoes"
        />
        <StatCard
          label="Leads novos do site"
          value={newLeads?.count ?? 0}
          hint="pedidos de proposta"
          icon="target"
          tone="brand"
          href="/equipe/leads"
        />
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader
            icon="users"
            title={`Movimento de ${competenceLabel(comp)} por empresa`}
            subtitle="Ordenado por quem está mais atrasado"
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-semibold">Empresa</th>
                  <th className="px-5 py-3 font-semibold">Entrega</th>
                  <th className="px-5 py-3 font-semibold">Faltando</th>
                  <th className="px-5 py-3 font-semibold">Última cobrança</th>
                  <th className="px-5 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => {
                  const titles = r.pending.map((p) => p.title);
                  const message = chargeMessage(r.c.contactName, r.c.tradeName, titles);
                  return (
                    <tr key={r.c.id} className="align-top">
                      <td className="px-5 py-4">
                        <Link href={`/equipe/clientes/${r.c.id}`} className="font-semibold text-slate-900 hover:text-navy-700">
                          {r.c.tradeName}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {r.c.regime} · {r.c.contactName}
                        </p>
                      </td>
                      <td className="w-48 px-5 py-4">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>
                            {r.delivered}/{r.total}
                          </span>
                          <span className="font-semibold text-slate-700">{Math.round(r.pct)}%</span>
                        </div>
                        <div className="mt-1.5">
                          <ProgressBar value={r.pct} tone={progressTone(r.pct)} />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {r.pending.length === 0 ? (
                          <Badge tone="success">Completo</Badge>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap gap-1.5">
                              <Badge tone="warning">{r.pending.length} pendente{r.pending.length > 1 ? "s" : ""}</Badge>
                              {r.overdue > 0 && <Badge tone="danger">{r.overdue} em atraso</Badge>}
                            </div>
                            <p className="max-w-xs truncate text-xs text-slate-500" title={titles.join(", ")}>
                              {titles.join(", ")}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">{r.last ? timeAgo(r.last) : "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {r.pending.length > 0 && (
                            <WhatsAppChargeButton
                              link={waLink(r.c.contactPhone, message)}
                              message={message}
                              clientName={r.c.tradeName}
                              logAction={logReminder}
                              clientId={r.c.id}
                              competence={comp}
                              lastReminder={r.last ? timeAgo(r.last) : null}
                            />
                          )}
                          <Link
                            href={`/equipe/clientes/${r.c.id}`}
                            className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                          >
                            Abrir <Icon name="arrowRight" className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader icon="inbox" title="Fila de conferência" subtitle="Mais antigos primeiro" />
            {reviewQueue.length === 0 ? (
              <EmptyState icon="checkCircle" title="Nada para conferir" text="Todos os envios já foram analisados." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {reviewQueue.slice(0, 8).map((d) => (
                  <li key={d.id}>
                    <Link href={`/equipe/clientes/${d.clientId}`} className="block px-5 py-3 hover:bg-slate-50">
                      <p className="text-sm font-semibold text-slate-900">{clientName.get(d.clientId)}</p>
                      <p className="truncate text-xs text-slate-500">
                        {d.title} · {d.submittedAt ? timeAgo(d.submittedAt) : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader
              icon="shield"
              title="Certidões em alerta"
              action={
                <Link href="/equipe/certidoes" className="text-sm font-semibold text-navy-700 hover:text-navy-900">
                  Monitor →
                </Link>
              }
            />
            {certAlerts.length === 0 ? (
              <EmptyState icon="checkCircle" title="Todas as certidões regulares" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {certAlerts.slice(0, 7).map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{c.tradeName}</p>
                      <p className="truncate text-xs text-slate-500">
                        {c.kind} · {formatDateBR(c.expiresAt)}
                      </p>
                    </div>
                    <Badge tone={c.st.tone}>{c.st.label}</Badge>
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
