import { desc, eq } from "drizzle-orm";
import { markGuidePaid } from "@/app/actions/portal";
import { SubmitButton } from "@/components/client-ui";
import { Icon } from "@/components/icons";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { db } from "@/db";
import { deliverables } from "@/db/schema";
import { requireClient } from "@/lib/auth";
import {
  competenceLabel,
  deliverableStatus,
  dueInfo,
  formatDateBR,
  formatDateTimeBR,
  formatMoney,
} from "@/lib/format";

export default async function GuiasPage() {
  const user = await requireClient();
  const items = await db
    .select()
    .from(deliverables)
    .where(eq(deliverables.clientId, user.clientId))
    .orderBy(desc(deliverables.createdAt));

  const guias = items
    .filter((i) => i.kind === "guia")
    .sort((a, b) => {
      if ((a.status === "pago") !== (b.status === "pago")) return a.status === "pago" ? 1 : -1;
      return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
    });
  const reports = items.filter((i) => i.kind === "relatorio");
  const open = guias.filter((g) => g.status !== "pago");
  const total = open.reduce((s, g) => s + (g.amountCents ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Do escritório para você"
        title="Guias e relatórios"
        description="Todas as guias de impostos, holerites e balancetes publicados pela equipe Goldoni, com aviso antes do vencimento."
        actions={
          <div className="rounded-xl bg-white px-4 py-2.5 text-sm shadow-sm ring-1 ring-slate-200">
            Total em aberto: <strong className="text-navy-900">{formatMoney(total)}</strong>
          </div>
        }
      />

      <Card>
        <CardHeader icon="receipt" title="Guias para pagamento" subtitle={`${open.length} em aberto · ${guias.length - open.length} pagas`} />
        {guias.length === 0 ? (
          <EmptyState title="Nenhuma guia publicada" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-semibold">Guia</th>
                  <th className="px-5 py-3 font-semibold">Vencimento</th>
                  <th className="px-5 py-3 font-semibold">Valor</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guias.map((g) => {
                  const st = deliverableStatus(g.kind, g.status, g.dueDate);
                  const due = g.dueDate ? dueInfo(g.dueDate) : null;
                  return (
                    <tr key={g.id} className="align-middle">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{g.title}</p>
                        <p className="text-xs text-slate-500">Competência {competenceLabel(g.competence)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-800">{formatDateBR(g.dueDate)}</p>
                        {g.status !== "pago" && due && <p className={`text-xs ${due.tone === "danger" ? "text-rose-600" : due.tone === "warning" ? "text-amber-700" : "text-slate-500"}`}>{due.text}</p>}
                        {g.status === "pago" && g.paidAt && <p className="text-xs text-slate-500">pago em {formatDateTimeBR(g.paidAt)}</p>}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{formatMoney(g.amountCents)}</td>
                      <td className="px-5 py-4">
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {g.fileId && (
                            <a
                              href={`/api/arquivos/${g.fileId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-navy-800 ring-1 ring-inset ring-navy-200 hover:bg-navy-50"
                            >
                              <Icon name="download" className="h-3.5 w-3.5" /> PDF
                            </a>
                          )}
                          {g.status !== "pago" && (
                            <form action={markGuidePaid}>
                              <input type="hidden" name="id" value={g.id} />
                              <SubmitButton variant="success" size="sm" pendingText="Salvando…">
                                <Icon name="check" className="h-3.5 w-3.5" /> Já paguei
                              </SubmitButton>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <h2 className="mb-4 mt-10 font-serif text-xl font-bold text-navy-950">Relatórios e documentos</h2>
      {reports.length === 0 ? (
        <Card>
          <EmptyState title="Nenhum relatório publicado" />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reports.map((r) => {
            const st = deliverableStatus(r.kind, r.status, r.dueDate);
            return (
              <Card key={r.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-50 text-navy-700">
                    <Icon name={r.title.startsWith("Balancete") ? "chart" : "users"} className="h-5 w-5" />
                  </span>
                  <Badge tone={st.tone}>{st.label}</Badge>
                </div>
                <p className="mt-4 font-semibold text-slate-900">{r.title}</p>
                <p className="text-sm text-slate-500">{competenceLabel(r.competence, true)}</p>
                <p className="mt-1 text-xs text-slate-400">Publicado em {formatDateTimeBR(r.createdAt)}</p>
                {r.fileId && (
                  <a
                    href={`/api/arquivos/${r.fileId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
                  >
                    <Icon name="eye" className="h-4 w-4" /> Abrir PDF
                  </a>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
