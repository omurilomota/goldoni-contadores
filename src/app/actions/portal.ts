"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { deliverables, documentRequests, files, ticketMessages, tickets } from "@/db/schema";
import { getCurrentUser, requireClient } from "@/lib/auth";
import { TICKET_CATEGORIES } from "@/lib/format";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const STAFF_STATUSES = ["aberta", "em_andamento", "aguardando_cliente", "concluida"];

/** Cliente envia o arquivo de um item do checklist mensal. */
export async function uploadDocument(formData: FormData) {
  const user = await requireClient();
  const requestId = Number(formData.get("requestId"));
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_FILE_BYTES) return;

  const [request] = await db
    .select({ id: documentRequests.id })
    .from(documentRequests)
    .where(and(eq(documentRequests.id, requestId), eq(documentRequests.clientId, user.clientId)))
    .limit(1);
  if (!request) return;

  const data = Buffer.from(await file.arrayBuffer());
  const [saved] = await db
    .insert(files)
    .values({
      clientId: user.clientId,
      name: file.name.slice(0, 200) || "arquivo",
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      data,
      uploadedBy: "cliente",
    })
    .returning({ id: files.id });

  await db
    .update(documentRequests)
    .set({ status: "enviado", fileId: saved.id, submittedAt: new Date(), note: null })
    .where(eq(documentRequests.id, request.id));

  revalidatePath("/portal", "layout");
  revalidatePath("/equipe", "layout");
}

export async function markGuidePaid(formData: FormData) {
  const user = await requireClient();
  const id = Number(formData.get("id"));
  await db
    .update(deliverables)
    .set({ status: "pago", paidAt: new Date() })
    .where(and(eq(deliverables.id, id), eq(deliverables.clientId, user.clientId), eq(deliverables.kind, "guia")));
  revalidatePath("/portal", "layout");
}

export async function createTicket(formData: FormData) {
  const user = await requireClient();
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 160);
  const categoryRaw = String(formData.get("category") ?? "");
  const category = TICKET_CATEGORIES.includes(categoryRaw) ? categoryRaw : "Outros";
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  if (subject.length < 3 || body.length < 3) return;

  const [ticket] = await db
    .insert(tickets)
    .values({ clientId: user.clientId, subject, category, status: "aberta" })
    .returning({ id: tickets.id });
  await db.insert(ticketMessages).values({ ticketId: ticket.id, author: "cliente", authorName: user.name, body });

  revalidatePath("/portal", "layout");
  revalidatePath("/equipe", "layout");
  redirect(`/portal/solicitacoes/${ticket.id}`);
}

/** Resposta em uma solicitação — usada pelo cliente e pela equipe. */
export async function replyTicket(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/portal/login");

  const ticketId = Number(formData.get("ticketId"));
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId)).limit(1);
  if (!ticket) return;

  const isStaff = user.role === "equipe";
  if (!isStaff && ticket.clientId !== user.clientId) return;

  if (body) {
    await db.insert(ticketMessages).values({
      ticketId,
      author: isStaff ? "equipe" : "cliente",
      authorName: isStaff ? `${user.name.split(" ")[0]} · Goldoni Contadores` : user.name,
      body,
    });
  }

  let nextStatus = ticket.status;
  if (isStaff) {
    const requested = String(formData.get("status") ?? "");
    if (STAFF_STATUSES.includes(requested)) nextStatus = requested;
    else if (body && ticket.status === "aberta") nextStatus = "em_andamento";
  } else if (body && (ticket.status === "aguardando_cliente" || ticket.status === "concluida")) {
    nextStatus = "em_andamento";
  }

  await db.update(tickets).set({ status: nextStatus, updatedAt: new Date() }).where(eq(tickets.id, ticketId));
  revalidatePath("/portal", "layout");
  revalidatePath("/equipe", "layout");
}
