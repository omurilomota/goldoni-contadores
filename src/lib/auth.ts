import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { ensureDatabase } from "./bootstrap";

const COOKIE_NAME = "gc_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  clientId: number | null;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Cria a sessão e grava o cookie (usar apenas em Server Actions / Route Handlers). */
export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + MAX_AGE_SECONDS * 1000);
  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });
  const requestHeaders = await headers();
  const secure = requestHeaders.get("x-forwarded-proto") === "https";
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  }
  jar.delete(COOKIE_NAME);
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  await ensureDatabase();
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      clientId: users.clientId,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
});

export async function requireClient(): Promise<SessionUser & { clientId: number }> {
  await ensureDatabase();
  const user = await getCurrentUser();
  if (!user) redirect("/portal/login");
  const clientId = user.clientId;
  if (user.role !== "cliente" || clientId === null) redirect("/equipe");
  return { ...user, clientId };
}

export async function requireStaff(): Promise<SessionUser> {
  await ensureDatabase();
  const user = await getCurrentUser();
  if (!user) redirect("/portal/login");
  if (user.role !== "equipe") redirect("/portal");
  return user;
}
