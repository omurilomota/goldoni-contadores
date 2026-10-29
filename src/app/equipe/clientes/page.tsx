import { and, asc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import Link from "next/link";
import { createClient } from "@/app/actions/staff";
import { SubmitButton } from "@/components/client-ui";
import { Icon } from "@/components/icons";
import { Badge, Card, CardHeader, EmptyState, PageHeader, ProgressBar, progressTone } from "@/components/ui";
import { db } from "@/db";
import { clients, documentRequests } from "@/db/schema";
import { requireStaff } from "@/lib/auth";
import { currentCompetence } from "@/lib/format";

const fieldClass =
  "mt-1 block w-full rounded-lg border-0 px-3 py-2 text-sm shadow-sm ring-1 ring-inset ring-slate-300 outline-none focus:ring-2 focus:ring-navy-600";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStaff();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const regime = typeof sp.regime === "string" ? sp.regime : "";
  const comp = currentCompetence();

  const filters: SQL[] = [];
  if (q) {
    const like = `%${q}%`;
    const search = or(
      ilike(clients.tradeName, like),
      ilike(clients.legalName, like),
      ilike(clients.cnpj, like),
      ilike(clients.contactName, like),
    );
    if (search) filters.push(search);
  }
  if (regime) filters.push(eq(clients.regime, regime));

  const list = await db
    .select()
    .from(clients)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(asc(clients.tradeName));

  const docs = await db
    .select({
      clientId: documentRequests.clientId,
      status: documentRequests.status,
      count: sql<number>`count(*)::int`,
    })
    .from(documentRequests)
    .where(eq(documentRequests.competence, comp))
    .groupBy(documentRequests.clientId, documentRequests.status);

  const progress = new Map<number, { total: number; done: number }>();
  for (const d of docs) {
    const row = progress.get(d.clientId) ?? { total: 0, done: 0 };
    row.total += d.count;
    if (d.status === "enviado" || d.status === "aprovado") row.done += d.count;
    progress.set(d.clientId, row);
  }

  return (
    <>
      <PageHeader
        eyebrow="Carteira"
        title="Empresas clientes"
        description="Busque, cadastre e abra a ficha. Novo cliente já entra com checklist e certidões do mês."
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_380px]">
        <div>
          <form className="mb-4 flex flex-wrap gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Nome, CNPJ ou contato…"
              className="min-w-[200px] flex-1 rounded-xl border-0 px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-inset ring-slate-300 outline-none focus:ring-2 focus:ring-navy-600"
            />
            <select name="regime" defaultValue={regime} className="rounded-xl border-0 px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300">
              <option value="">Todos os regimes</option>
              {["MEI", "Simples Nacional", "Lucro Presumido", "Lucro Real"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white">
              <Icon name="search" className="h-4 w-4" /> Buscar
            </button>
          </form>

          <Card>
            <CardHeader icon="users" title={`${list.length} empresas`} subtitle={q ? `Filtro: “${q}”` : "Ordenado por nome"} />
            {list.length === 0 ? (
              <EmptyState title="Nenhuma empresa encontrada" text="Ajuste a busca ou cadastre à direita." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {list.map((c) => {
                  const p = progress.get(c.id) ?? { total: 0, done: 0 };
                  const pct = p.total ? (p.done / p.total) * 100 : 0;
                  return (
                    <li key={c.id}>
                      <Link href={`/equipe/clientes/${c.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{c.tradeName}</p>
                          <p className="text-xs text-slate-500">
                            {c.cnpj} · {c.contactName} · {c.contactPhone}
                          </p>
                        </div>
                        <div className="flex w-48 items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between text-[11px] text-slate-500">
                              <span>
                                {p.done}/{p.total}
                              </span>
                              <span>{Math.round(pct)}%</span>
                            </div>
                            <ProgressBar value={pct} tone={progressTone(pct)} />
                          </div>
                          <Badge tone="neutral">{c.regime}</Badge>
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
          <CardHeader icon="plus" title="Cadastrar empresa" subtitle={`Senha inicial do portal: goldoni2026`} />
          <form action={createClient} className="grid gap-3 p-5">
            <label className="text-sm font-medium text-slate-700">
              Razão social *
              <input name="legalName" required className={fieldClass} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Nome fantasia
              <input name="tradeName" className={fieldClass} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              CNPJ *
              <input name="cnpj" required placeholder="00.000.000/0001-00" className={fieldClass} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium text-slate-700">
                Regime
                <select name="regime" defaultValue="Simples Nacional" className={fieldClass}>
                  {["MEI", "Simples Nacional", "Lucro Presumido", "Lucro Real"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Funcionários
                <input name="employees" type="number" min={0} defaultValue={0} className={fieldClass} />
              </label>
            </div>
            <label className="text-sm font-medium text-slate-700">
              Segmento
              <input name="segment" placeholder="Comércio, indústria…" className={fieldClass} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Contato *
              <input name="contactName" required className={fieldClass} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              WhatsApp *
              <input name="contactPhone" required placeholder="(18) 99999-9999" className={fieldClass} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              E-mail (acesso ao portal)
              <input name="contactEmail" type="email" className={fieldClass} />
            </label>
            <SubmitButton className="mt-1 w-full" pendingText="Cadastrando…">
              <Icon name="plus" className="h-4 w-4" /> Cadastrar e abrir ficha
            </SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
