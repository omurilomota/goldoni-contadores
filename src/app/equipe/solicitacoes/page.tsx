import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { db } from "@/db";
import { clients, tickets } from "@/db/schema";
import { requireStaff } from "@/lib/auth";
import { TICKET_STATUS, protocolo, timeAgo } from "@/lib/format";

const TABS = [
  { key: "", label: "Todas" },
  { key: "aberta", label: "Novas" },
  { key: "em_andamento", label: "Em andamento" },
  { key: "aguardando_cliente", label: "Aguardando cliente" },
  { key: "concluida", label: "Concluídas" },
];

export default async function EquipeSolicitacoes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStaff();
  const sp = await searchParams;
  const filter = typeof sp.status === "string" ? sp.status : "";

  const all = await db
    .select({
      id: tickets.id,
      subject: tickets.subject,
      category: tickets.category,
      status: tickets.status,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      tradeName: clients.tradeName,
    })
    .from(tickets)
    .innerJoin(clients, eq(tickets.clientId, clients.id))
    .orderBy(desc(tickets.updatedAt));
  const list = filter ? all.filter((t) => t.status === filter) : all;

  return (
    <>
      <PageHeader
        eyebrow="Atendimento"
        title="Solicitações dos clientes"
        description="Todos os protocolos em um só lugar, com histórico e status visível para o cliente."
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const count = tab.key ? all.filter((t) => t.status === tab.key).length : all.length;
          const active = tab.key === filter;
          return (
            <Link
              key={tab.key || "todas"}
              href={tab.key ? `/equipe/solicitacoes?status=${tab.key}` : "/equipe/solicitacoes"}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                active ? "bg-navy-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-2 text-xs ${active ? "bg-white/20" : "bg-slate-100"}`}>{count}</span>
            </Link>
          );
        })}
      </div>
      <Card>
        {list.length === 0 ? (
          <EmptyState title="Nenhuma solicitação neste filtro" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map((t) => {
              const st = TICKET_STATUS[t.status] ?? TICKET_STATUS.aberta;
              return (
                <li key={t.id}>
                  <Link href={`/equipe/solicitacoes/${t.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold text-gold-700">
                        {protocolo(t.id, t.createdAt)} · {t.tradeName}
                      </p>
                      <p className="mt-0.5 font-semibold text-slate-900">{t.subject}</p>
                      <p className="text-xs text-slate-500">
                        {t.category} · atualizado {timeAgo(t.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={st.tone}>{st.staffLabel}</Badge>
                      <Icon name="arrowRight" className="h-4 w-4 text-slate-400" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
