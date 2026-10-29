import { asc, eq } from "drizzle-orm";
import { Icon } from "@/components/icons";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { db } from "@/db";
import { certificates } from "@/db/schema";
import { requireClient } from "@/lib/auth";
import { certStatus, formatDateBR, timeAgo } from "@/lib/format";
import { whatsappUrl } from "@/lib/site";

export default async function PortalCertidoes() {
  const user = await requireClient();
  const list = await db
    .select()
    .from(certificates)
    .where(eq(certificates.clientId, user.clientId))
    .orderBy(asc(certificates.expiresAt));

  const alerts = list.filter((c) => certStatus(c.expiresAt, c.irregular).tone !== "success");

  return (
    <>
      <PageHeader
        eyebrow="Regularidade"
        title="Certidões monitoradas"
        description="CND Federal, FGTS, Estadual, Municipal e Trabalhista. A equipe avisa antes de vencer."
        actions={
          alerts.length > 0 ? (
            <a
              href={whatsappUrl("Olá! Vi uma certidão vencendo na Central e preciso da renovação.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1FAF54] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Icon name="whatsapp" className="h-4 w-4" /> Pedir renovação
            </a>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Regulares", list.length - alerts.length, "text-emerald-600"],
          ["Atenção", alerts.length, "text-rose-600"],
        ].map(([l, v, c]) => (
          <Card key={String(l)} className="p-5">
            <p className="text-sm text-slate-500">{l}</p>
            <p className={`mt-1 text-3xl font-bold ${c}`}>{v as number}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader icon="shield" title="Suas certidões" subtitle={`${list.length} monitoradas`} />
        {list.length === 0 ? (
          <EmptyState title="Nenhuma certidão cadastrada" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map((c) => {
              const st = certStatus(c.expiresAt, c.irregular);
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">{c.kind}</p>
                    <p className="text-xs text-slate-500">
                      {c.irregular
                        ? "Pendência identificada — a equipe já está tratando"
                        : st.days < 0
                          ? `Venceu em ${formatDateBR(c.expiresAt)}`
                          : `Válida até ${formatDateBR(c.expiresAt)}`}
                      {" · "}verificada {timeAgo(c.checkedAt)}
                    </p>
                  </div>
                  <Badge tone={st.tone}>{st.label}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
