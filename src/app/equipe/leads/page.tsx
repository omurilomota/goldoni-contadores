import { desc } from "drizzle-orm";
import { convertLeadToClient, updateLeadStatus } from "@/app/actions/staff";
import { SubmitButton } from "@/components/client-ui";
import { Icon } from "@/components/icons";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { requireStaff } from "@/lib/auth";
import { LEAD_STATUS, formatDateTimeBR, waLink } from "@/lib/format";

export default async function LeadsPage() {
  await requireStaff();
  const list = await db.select().from(leads).orderBy(desc(leads.createdAt));
  const won = list.filter((l) => l.status === "ganho").length;
  const conversion = list.length ? Math.round((won / list.length) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Captação"
        title="Leads do site"
        description="Pedido do site vira cliente na Central com um clique."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Object.entries(LEAD_STATUS).map(([key, s]) => (
          <Card key={key} className="p-4">
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{list.filter((l) => l.status === key).length}</p>
          </Card>
        ))}
        <Card className="bg-navy-950 p-4">
          <p className="text-xs font-medium text-navy-200">Conversão</p>
          <p className="mt-1 text-2xl font-bold text-gold-300">{conversion}%</p>
        </Card>
      </div>

      <Card>
        <CardHeader icon="target" title="Pedidos de proposta" subtitle={`${list.length} no total`} />
        {list.length === 0 ? (
          <EmptyState title="Nenhum lead ainda" text="Envie o formulário do site para testar." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map((l) => {
              const st = LEAD_STATUS[l.status] ?? LEAD_STATUS.novo;
              return (
                <li key={l.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.2fr_1.6fr_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{l.name}</p>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{l.company ?? "Pessoa física / sem empresa"}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTimeBR(l.createdAt)} · origem: <span className="font-mono">{l.sourcePage ?? "/"}</span>
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-800">{l.service}</p>
                    {l.message && <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{l.message}</p>}
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs">
                      <a
                        href={waLink(l.phone, `Olá, ${l.name.split(" ")[0]}! Aqui é da Goldoni Contadores. Recebemos seu pedido de proposta pelo site (${l.service}).`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-emerald-700"
                      >
                        <Icon name="whatsapp" className="h-3.5 w-3.5" /> {l.phone}
                      </a>
                      {l.email && (
                        <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 text-slate-600 hover:text-navy-700">
                          <Icon name="mail" className="h-3.5 w-3.5" /> {l.email}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <form action={updateLeadStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={l.id} />
                      <select name="status" defaultValue={l.status} className="rounded-lg border-0 px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300">
                        {Object.entries(LEAD_STATUS).map(([key, s]) => (
                          <option key={key} value={key}>{s.label}</option>
                        ))}
                      </select>
                      <SubmitButton variant="secondary" size="sm" pendingText="…">
                        Salvar
                      </SubmitButton>
                    </form>
                    {l.status !== "ganho" && l.status !== "perdido" && (
                      <form action={convertLeadToClient}>
                        <input type="hidden" name="id" value={l.id} />
                        <SubmitButton variant="success" size="sm" pendingText="Criando…" confirmMessage="Virar este lead em cliente na Central Goldoni?">
                          Virar cliente
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
