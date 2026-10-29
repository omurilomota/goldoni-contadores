import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { replyTicket } from "@/app/actions/portal";
import { SubmitButton } from "@/components/client-ui";
import { Icon } from "@/components/icons";
import { TicketThread } from "@/components/ticket-thread";
import { Badge, Card } from "@/components/ui";
import { db } from "@/db";
import { clients, ticketMessages, tickets } from "@/db/schema";
import { requireStaff } from "@/lib/auth";
import { TICKET_STATUS, formatDateTimeBR, protocolo } from "@/lib/format";

export default async function EquipeSolicitacao({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const ticketId = Number(id);
  if (!Number.isInteger(ticketId) || ticketId <= 0) notFound();

  const [row] = await db
    .select({ ticket: tickets, client: clients })
    .from(tickets)
    .innerJoin(clients, eq(tickets.clientId, clients.id))
    .where(eq(tickets.id, ticketId))
    .limit(1);
  if (!row) notFound();
  const { ticket, client } = row;

  const messages = await db
    .select()
    .from(ticketMessages)
    .where(eq(ticketMessages.ticketId, ticket.id))
    .orderBy(asc(ticketMessages.createdAt));
  const st = TICKET_STATUS[ticket.status] ?? TICKET_STATUS.aberta;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/equipe/solicitacoes" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-800">
        <Icon name="arrowLeft" className="h-4 w-4" /> Solicitações
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold text-gold-700">{protocolo(ticket.id, ticket.createdAt)}</p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-navy-950">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-slate-500">
            <Link href={`/equipe/clientes/${client.id}`} className="font-semibold text-navy-700 hover:text-navy-900">
              {client.tradeName}
            </Link>{" "}
            · {ticket.category} · aberta em {formatDateTimeBR(ticket.createdAt)}
          </p>
        </div>
        <Badge tone={st.tone}>{st.staffLabel}</Badge>
      </div>

      <Card className="mt-6 p-5 sm:p-6">
        <TicketThread messages={messages} perspective="equipe" />
      </Card>

      <Card className="mt-4 p-5">
        <form action={replyTicket} className="space-y-3">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <label htmlFor="reply" className="text-sm font-medium text-slate-700">Responder ao cliente</label>
          <textarea
            id="reply"
            name="body"
            rows={4}
            placeholder="A resposta aparece na Central Goldoni do cliente…"
            className="block w-full rounded-xl border-0 px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-inset ring-slate-300 outline-none focus:ring-2 focus:ring-navy-600"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Status após responder:
              <select
                name="status"
                defaultValue={ticket.status === "aberta" ? "em_andamento" : ticket.status}
                className="rounded-lg border-0 px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300"
              >
                <option value="em_andamento">Em andamento</option>
                <option value="aguardando_cliente">Aguardando cliente</option>
                <option value="concluida">Concluída</option>
                <option value="aberta">Nova</option>
              </select>
            </label>
            <SubmitButton pendingText="Enviando…">
              <Icon name="send" className="h-4 w-4" /> Salvar
            </SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
