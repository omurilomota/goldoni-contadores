import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { deliverables, files } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const INLINE_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Não autorizado", { status: 401 });

  const { id } = await params;
  const fileId = Number(id);
  if (!Number.isInteger(fileId) || fileId <= 0) return new Response("Arquivo inválido", { status: 400 });

  const [file] = await db.select().from(files).where(eq(files.id, fileId)).limit(1);
  if (!file || (user.role !== "equipe" && file.clientId !== user.clientId)) {
    return new Response("Arquivo não encontrado", { status: 404 });
  }

  // Cliente abriu um relatório: marca como visualizado.
  if (user.role === "cliente") {
    await db
      .update(deliverables)
      .set({ status: "visualizado", viewedAt: new Date() })
      .where(and(eq(deliverables.fileId, file.id), eq(deliverables.kind, "relatorio"), eq(deliverables.status, "disponivel")));
  }

  const safeInline = INLINE_TYPES.has(file.mimeType) && request.nextUrl.searchParams.get("download") !== "1";
  const contentType = INLINE_TYPES.has(file.mimeType) ? file.mimeType : "application/octet-stream";

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(file.data.length),
      "Content-Disposition": `${safeInline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox",
    },
  });
}
