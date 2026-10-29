import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { replyTicket } from "@/app/actions/portal";
import { SubmitButton } from "@/components/client-ui";
import { Icon } from "@/components/icons";
import { TicketThread } from "@/components/ticket-thread";
import { Badge, Card } from "@/components/ui";
import { db } from "@/db";
import { ticketMessages, tickets } from "@/db/schema";
import { requireClient } from "@/lib/auth";
import { TICKET_STATUS, formatDateTimeBR, protocolo } from "@/lib/format";

export default async function SolicitacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireClient();
  const { id } = await params;
  const ticketId = Number(id);
  if (!Number.isInteger(ticketId) || ticketId <= 0) notFound();

  const [ticket] = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.id, ticketId), eq(tickets.clientId, user.clientId)))
    .limit(1);
  if (!ticket) notFound();

  const messages = await db
    .select()
    .from(ticketMessages)
    .where(eq(ticketMessages.ticketId, ticket.id))
    .orderBy(asc(ticketMessages.createdAt));
  const st = TICKET_STATUS[ticket.status] ?? TICKET_STATUS.aberta;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/portal/solicitacoes" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-800">
        <Icon name="arrowLeft" className="h-4 w-4" /> Todas as solicitações
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold text-gold-700">{protocolo(ticket.id, ticket.createdAt)}</p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-navy-950">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {ticket.category} · aberta em {formatDateTimeBR(ticket.createdAt)}
          </p>
        </div>
        <Badge tone={st.tone}>{st.label}</Badge>
      </div>

      {ticket.status === "aguardando_cliente" && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Icon name="clock" className="h-5 w-5 shrink-0" /> A equipe Goldoni está aguardando sua resposta para continuar.
        </div>
      )}

      <Card className="mt-6 p-5 sm:p-6">
        <TicketThread messages={messages} perspective="cliente" />
      </Card>

      <Card className="mt-4 p-5">
        <form action={replyTicket} className="space-y-3">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <label htmlFor="reply" className="text-sm font-medium text-slate-700">
            {ticket.status === "concluida" ? "Responder reabre esta solicitação" : "Sua resposta"}
          </label>
          <textarea
            id="reply"
            name="body"
            required
            rows={4}
            placeholder="Escreva sua mensagem…"
            className="block w-full rounded-xl border-0 px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-inset ring-slate-300 outline-none focus:ring-2 focus:ring-navy-600"
          />
          <div className="flex justify-end">
            <SubmitButton pendingText="Enviando…">
              <Icon name="send" className="h-4 w-4" /> Enviar resposta
            </SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
