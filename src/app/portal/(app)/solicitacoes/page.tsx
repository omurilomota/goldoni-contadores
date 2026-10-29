import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { createTicket } from "@/app/actions/portal";
import { SubmitButton } from "@/components/client-ui";
import { Icon } from "@/components/icons";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { db } from "@/db";
import { ticketMessages, tickets } from "@/db/schema";
import { requireClient } from "@/lib/auth";
import { TICKET_CATEGORIES, TICKET_STATUS, protocolo, timeAgo } from "@/lib/format";

const fieldClass =
  "mt-1.5 block w-full rounded-xl border-0 px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-inset ring-slate-300 outline-none focus:ring-2 focus:ring-navy-600";

export default async function SolicitacoesPage() {
  const user = await requireClient();
  const list = await db
    .select({
      id: tickets.id,
      subject: tickets.subject,
      category: tickets.category,
      status: tickets.status,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      messages: sql<number>`(select count(*)::int from ${ticketMessages} where ${ticketMessages.ticketId} = ${tickets.id})`,
    })
    .from(tickets)
    .where(eq(tickets.clientId, user.clientId))
    .orderBy(desc(tickets.updatedAt));

  return (
    <>
      <PageHeader
        eyebrow="Atendimento"
        title="Solicitações"
        description="Peça certidões, admissões, alterações ou tire dúvidas. Cada pedido recebe um protocolo e fica registrado."
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader icon="message" title="Seus protocolos" subtitle={`${list.length} solicitações`} />
            {list.length === 0 ? (
              <EmptyState title="Nenhuma solicitação ainda" text="Use o formulário ao lado para abrir a primeira." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {list.map((t) => {
                  const st = TICKET_STATUS[t.status] ?? TICKET_STATUS.aberta;
                  return (
                    <li key={t.id}>
                      <Link href={`/portal/solicitacoes/${t.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-slate-50">
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-semibold text-gold-700">{protocolo(t.id, t.createdAt)}</p>
                          <p className="mt-0.5 font-semibold text-slate-900">{t.subject}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {t.category} · {t.messages} mensage{t.messages === 1 ? "m" : "ns"} · atualizado {timeAgo(t.updatedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge tone={st.tone}>{st.label}</Badge>
                          <Icon name="arrowRight" className="h-4 w-4 text-slate-400" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader icon="plus" title="Nova solicitação" subtitle="Resposta da equipe em até 1 dia útil" />
          <form action={createTicket} className="space-y-4 p-5">
            <div>
              <label htmlFor="subject" className="text-sm font-medium text-slate-700">Assunto</label>
              <input id="subject" name="subject" required minLength={3} placeholder="Ex.: Certidão negativa para licitação" className={fieldClass} />
            </div>
            <div>
              <label htmlFor="category" className="text-sm font-medium text-slate-700">Categoria</label>
              <select id="category" name="category" className={fieldClass} defaultValue="Certidões">
                {TICKET_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="body" className="text-sm font-medium text-slate-700">Descreva o que precisa</label>
              <textarea id="body" name="body" required minLength={3} rows={5} placeholder="Quanto mais detalhes, mais rápido resolvemos." className={fieldClass} />
            </div>
            <SubmitButton className="w-full" pendingText="Abrindo protocolo…">
              <Icon name="send" className="h-4 w-4" /> Abrir solicitação
            </SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
