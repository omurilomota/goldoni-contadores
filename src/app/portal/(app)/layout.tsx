import { and, eq, inArray, sql } from "drizzle-orm";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { db } from "@/db";
import { clients, documentRequests, tickets } from "@/db/schema";
import { requireClient } from "@/lib/auth";
import { competenceLabel, currentCompetence } from "@/lib/format";
import { whatsappUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await requireClient();
  const comp = currentCompetence();

  const [client] = await db
    .select({ tradeName: clients.tradeName, legalName: clients.legalName })
    .from(clients)
    .where(eq(clients.id, user.clientId))
    .limit(1);
  const [pending] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(documentRequests)
    .where(
      and(
        eq(documentRequests.clientId, user.clientId),
        eq(documentRequests.competence, comp),
        inArray(documentRequests.status, ["pendente", "rejeitado"]),
      ),
    );
  const [waiting] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tickets)
    .where(and(eq(tickets.clientId, user.clientId), eq(tickets.status, "aguardando_cliente")));

  return (
    <AppShell
      title="Central Goldoni"
      subtitle="Área do cliente"
      userName={user.name}
      userDetail={client?.tradeName ?? ""}
      headerNote={
        <>
          Competência em aberto: <strong className="text-slate-700">{competenceLabel(comp, true)}</strong>
          <span className="hidden sm:inline"> · {client?.legalName}</span>
        </>
      }
      nav={[
        { href: "/portal", label: "Visão geral", icon: "home", exact: true },
        { href: "/portal/documentos", label: "Documentos do mês", icon: "folder", badge: pending?.count ?? 0 },
        { href: "/portal/guias", label: "Guias e relatórios", icon: "receipt" },
        { href: "/portal/certidoes", label: "Certidões", icon: "shield" },
        { href: "/portal/solicitacoes", label: "Solicitações", icon: "message", badge: waiting?.count ?? 0 },
      ]}
      sidebarExtra={
        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <p className="text-sm font-semibold text-white">Precisa de ajuda?</p>
          <p className="mt-1 text-xs leading-relaxed text-navy-200">
            Sua analista é a Ana Paula (Fiscal). Abra uma solicitação ou chame no WhatsApp.
          </p>
          <a
            href={whatsappUrl(`Olá! Sou da ${client?.tradeName ?? "empresa"} e preciso de ajuda.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#1FAF54] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Icon name="whatsapp" className="h-3.5 w-3.5" /> WhatsApp do escritório
          </a>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
