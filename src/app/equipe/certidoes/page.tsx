import { eq } from "drizzle-orm";
import Link from "next/link";
import { renewCertificate } from "@/app/actions/staff";
import { SubmitButton } from "@/components/client-ui";
import { Icon } from "@/components/icons";
import { Badge, Card, CardHeader, PageHeader } from "@/components/ui";
import { db } from "@/db";
import { certificates, clients } from "@/db/schema";
import { requireStaff } from "@/lib/auth";
import { certStatus, formatDateBR, timeAgo } from "@/lib/format";

const SEVERITY: Record<string, number> = { Irregular: 0, Vencida: 1, Vencendo: 2, Regular: 3 };

export default async function CertidoesPage() {
  await requireStaff();
  const rows = await db
    .select({
      id: certificates.id,
      kind: certificates.kind,
      expiresAt: certificates.expiresAt,
      irregular: certificates.irregular,
      checkedAt: certificates.checkedAt,
      clientId: clients.id,
      tradeName: clients.tradeName,
    })
    .from(certificates)
    .innerJoin(clients, eq(certificates.clientId, clients.id));

  const list = rows
    .map((r) => ({ ...r, st: certStatus(r.expiresAt, r.irregular) }))
    .sort((a, b) => SEVERITY[a.st.label] - SEVERITY[b.st.label] || a.st.days - b.st.days);
  const count = (label: string) => list.filter((r) => r.st.label === label).length;

  return (
    <>
      <PageHeader
        eyebrow="Fase 3 · serviço premium"
        title="Monitor de certidões"
        description="Acompanhamento de CND Federal, FGTS, Estadual, Municipal e Trabalhista de todos os clientes. Na versão final, as consultas aos órgãos são automáticas e o cliente é avisado antes do vencimento."
      />
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Regular", tone: "text-emerald-600" },
          { label: "Vencendo", tone: "text-amber-600" },
          { label: "Vencida", tone: "text-rose-600" },
          { label: "Irregular", tone: "text-rose-700" },
        ].map((k) => (
          <Card key={k.label} className="p-5">
            <p className="text-sm font-medium text-slate-500">{k.label === "Vencendo" ? "Vencendo (≤ 15 dias)" : `${k.label}s`}</p>
            <p className={`mt-1 text-3xl font-bold ${k.tone}`}>{count(k.label)}</p>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader icon="shield" title="Todas as certidões" subtitle={`${list.length} monitoradas`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-semibold">Empresa</th>
                <th className="px-5 py-3 font-semibold">Certidão</th>
                <th className="px-5 py-3 font-semibold">Validade</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Verificada</th>
                <th className="px-5 py-3 text-right font-semibold">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3">
                    <Link href={`/equipe/clientes/${r.clientId}`} className="font-semibold text-slate-900 hover:text-navy-700">
                      {r.tradeName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{r.kind}</td>
                  <td className="px-5 py-3 text-slate-700">
                    {formatDateBR(r.expiresAt)}
                    <span className="block text-xs text-slate-500">
                      {r.st.days < 0 ? `venceu há ${-r.st.days} dias` : `${r.st.days} dias restantes`}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={r.st.tone}>{r.st.label}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{timeAgo(r.checkedAt)}</td>
                  <td className="px-5 py-3 text-right">
                    {r.st.tone !== "success" ? (
                      <form action={renewCertificate} className="inline-block">
                        <input type="hidden" name="id" value={r.id} />
                        <SubmitButton variant="secondary" size="sm" pendingText="Emitindo…">
                          <Icon name="refresh" className="h-3.5 w-3.5" /> Emitir nova
                        </SubmitButton>
                      </form>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
