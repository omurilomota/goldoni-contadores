import { and, asc, desc, eq } from "drizzle-orm";
import { uploadDocument } from "@/app/actions/portal";
import { AutoUploadForm } from "@/components/client-ui";
import { Icon } from "@/components/icons";
import { Badge, Card, CardHeader, EmptyState, PageHeader, ProgressBar, progressTone } from "@/components/ui";
import { db } from "@/db";
import { documentRequests, files } from "@/db/schema";
import { requireClient } from "@/lib/auth";
import {
  DOC_STATUS,
  competenceLabel,
  currentCompetence,
  dueInfo,
  formatBytes,
  formatDateBR,
  formatDateTimeBR,
} from "@/lib/format";

const CATEGORY_ORDER = ["Contábil", "Fiscal", "Pessoal"];

export default async function DocumentosPage() {
  const user = await requireClient();
  const comp = currentCompetence();

  const docs = await db
    .select({
      id: documentRequests.id,
      title: documentRequests.title,
      description: documentRequests.description,
      category: documentRequests.category,
      dueDate: documentRequests.dueDate,
      status: documentRequests.status,
      note: documentRequests.note,
      submittedAt: documentRequests.submittedAt,
      fileId: documentRequests.fileId,
      fileName: files.name,
    })
    .from(documentRequests)
    .leftJoin(files, eq(documentRequests.fileId, files.id))
    .where(and(eq(documentRequests.clientId, user.clientId), eq(documentRequests.competence, comp)))
    .orderBy(asc(documentRequests.dueDate));

  const history = await db
    .select({ id: files.id, name: files.name, size: files.size, createdAt: files.createdAt })
    .from(files)
    .where(and(eq(files.clientId, user.clientId), eq(files.uploadedBy, "cliente")))
    .orderBy(desc(files.createdAt))
    .limit(8);

  const delivered = docs.filter((d) => d.status === "enviado" || d.status === "aprovado").length;
  const pct = docs.length ? (delivered / docs.length) * 100 : 0;
  const categories = CATEGORY_ORDER.filter((c) => docs.some((d) => d.category === c));

  return (
    <>
      <PageHeader
        eyebrow="Checklist mensal"
        title={`Documentos de ${competenceLabel(comp)}`}
        description="Envie cada arquivo até a data indicada. Assim que chegar, nossa equipe confere e você acompanha o status por aqui."
      />

      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            <strong className="text-slate-900">{delivered} de {docs.length}</strong> documentos entregues
          </p>
          <span className="text-sm font-semibold text-navy-700">{Math.round(pct)}%</span>
        </div>
        <div className="mt-3">
          <ProgressBar value={pct} tone={progressTone(pct)} />
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Icon name="lock" className="h-3.5 w-3.5" /> PDF, XML, OFX, planilhas ou fotos nítidas · até 8 MB por arquivo ·
          armazenamento criptografado
        </p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {categories.map((category) => (
            <Card key={category}>
              <CardHeader
                icon={category === "Pessoal" ? "users" : category === "Fiscal" ? "receipt" : "chart"}
                title={category === "Pessoal" ? "Departamento pessoal" : category}
              />
              <ul className="divide-y divide-slate-100">
                {docs
                  .filter((d) => d.category === category)
                  .map((d) => {
                    const st = DOC_STATUS[d.status] ?? DOC_STATUS.pendente;
                    const due = dueInfo(d.dueDate);
                    const open = d.status === "pendente" || d.status === "rejeitado";
                    return (
                      <li key={d.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <span
                            className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                              d.status === "aprovado"
                                ? "bg-emerald-50 text-emerald-600"
                                : d.status === "enviado"
                                  ? "bg-sky-50 text-sky-600"
                                  : d.status === "rejeitado"
                                    ? "bg-rose-50 text-rose-600"
                                    : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            <Icon name={open ? "file" : "checkCircle"} className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{d.title}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{d.description}</p>
                            <p className="mt-1 text-xs text-slate-500">Prazo: {formatDateBR(d.dueDate)}</p>
                            {d.note && d.status === "rejeitado" && (
                              <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                                Equipe Goldoni: {d.note}
                              </p>
                            )}
                            {d.fileId && (
                              <a
                                href={`/api/arquivos/${d.fileId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate text-xs font-medium text-navy-700 hover:text-navy-900"
                              >
                                <Icon name="file" className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{d.fileName}</span>
                                {d.submittedAt && <span className="text-slate-400">· {formatDateTimeBR(d.submittedAt)}</span>}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                          <div className="flex gap-2">
                            {open && <Badge tone={due.tone}>{due.text}</Badge>}
                            <Badge tone={st.tone}>{st.label}</Badge>
                          </div>
                          {d.status !== "aprovado" && (
                            <AutoUploadForm
                              action={uploadDocument}
                              fields={{ requestId: d.id }}
                              label={d.status === "pendente" ? "Enviar" : d.status === "rejeitado" ? "Reenviar" : "Substituir"}
                              variant={open ? "primary" : "secondary"}
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="bg-navy-950 p-5 text-white">
            <p className="flex items-center gap-2 text-sm font-semibold text-gold-300">
              <Icon name="sparkles" className="h-4 w-4" /> Dica para fechar mais rápido
            </p>
            <p className="mt-2 text-sm leading-relaxed text-navy-100">
              Exporte os XMLs direto do seu emissor e os extratos em OFX pelo internet banking. Arquivos digitais são
              conferidos em minutos — fotos e PDFs escaneados levam mais tempo.
            </p>
          </Card>
          <Card>
            <CardHeader icon="inbox" title="Seus últimos envios" />
            {history.length === 0 ? (
              <EmptyState title="Nenhum arquivo enviado ainda" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {history.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <a
                        href={`/api/arquivos/${f.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-sm font-medium text-slate-800 hover:text-navy-700"
                      >
                        {f.name}
                      </a>
                      <p className="text-xs text-slate-500">
                        {formatBytes(f.size)} · {formatDateTimeBR(f.createdAt)}
                      </p>
                    </div>
                    <Icon name="download" className="h-4 w-4 shrink-0 text-slate-400" />
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
