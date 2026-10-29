import { and, eq, sql } from "drizzle-orm";
import type { ReactNode } from "react";
import { resetDemo } from "@/app/actions/staff";
import { AppShell } from "@/components/app-shell";
import { SubmitButton } from "@/components/client-ui";
import { Icon } from "@/components/icons";
import { db } from "@/db";
import { documentRequests, leads, tickets } from "@/db/schema";
import { requireStaff } from "@/lib/auth";
import { competenceLabel, currentCompetence } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EquipeLayout({ children }: { children: ReactNode }) {
  const user = await requireStaff();
  const comp = currentCompetence();

  const [newLeads] = await db.select({ count: sql<number>`count(*)::int` }).from(leads).where(eq(leads.status, "novo"));
  const [newTickets] = await db.select({ count: sql<number>`count(*)::int` }).from(tickets).where(eq(tickets.status, "aberta"));
  const [toReview] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(documentRequests)
    .where(and(eq(documentRequests.competence, comp), eq(documentRequests.status, "enviado")));

  return (
    <AppShell
      title="Painel Goldoni"
      subtitle="Equipe interna"
      userName={user.name}
      userDetail="Equipe Fiscal"
      headerNote={
        <>
          Fechamento de <strong className="text-slate-700">{competenceLabel(comp, true)}</strong> ·{" "}
          {toReview?.count ?? 0} documentos aguardando conferência
        </>
      }
      nav={[
        { href: "/equipe", label: "Visão geral", icon: "dashboard", exact: true },
        { href: "/equipe/clientes", label: "Empresas", icon: "users" },
        { href: "/equipe/solicitacoes", label: "Solicitações", icon: "message", badge: newTickets?.count ?? 0 },
        { href: "/equipe/certidoes", label: "Certidões", icon: "shield" },
        { href: "/equipe/leads", label: "Leads do site", icon: "target", badge: newLeads?.count ?? 0 },
      ]}
      sidebarExtra={
        <div className="space-y-3">
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <Icon name="sparkles" className="h-4 w-4 text-gold-300" /> Modo apresentação
            </p>
            <p className="mt-1 text-xs leading-relaxed text-navy-200">
              Restaure os dados de demonstração antes da reunião (os leads reais são mantidos).
            </p>
            <form action={resetDemo} className="mt-3">
              <SubmitButton variant="gold" size="sm" pendingText="Restaurando…" confirmMessage="Restaurar os dados de demonstração do portal?">
                <Icon name="refresh" className="h-3.5 w-3.5" /> Restaurar demo
              </SubmitButton>
            </form>
          </div>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
