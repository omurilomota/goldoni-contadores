"use server";

import { db } from "@/db";
import { leads } from "@/db/schema";
import { ensureDatabase } from "@/lib/bootstrap";
import { LEAD_SERVICES, whatsappUrl } from "@/lib/site";

export type LeadState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "phone" | "email", string>>;
  whatsapp?: string;
  firstName?: string;
};

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim();
  const name = get("name").slice(0, 120);
  const phone = get("phone").slice(0, 40);
  const company = get("company").slice(0, 160);
  const email = get("email").slice(0, 160);
  const message = get("message").slice(0, 2000);
  const sourcePage = get("sourcePage").slice(0, 200) || "/";
  const serviceRaw = get("service");
  const service = LEAD_SERVICES.includes(serviceRaw) ? serviceRaw : "Outro assunto";

  // Honeypot anti-spam: bots preenchem o campo invisível.
  if (get("website")) {
    return { status: "success", whatsapp: whatsappUrl(), firstName: name.split(" ")[0] };
  }

  const errors: LeadState["errors"] = {};
  if (name.length < 2) errors.name = "Informe seu nome.";
  if (phone.replace(/\D/g, "").length < 10) errors.phone = "Informe um telefone com DDD.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "E-mail inválido.";
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, message: "Confira os campos destacados." };
  }

  try {
    await ensureDatabase();
    await db.insert(leads).values({
      name,
      phone,
      company: company || null,
      email: email || null,
      service,
      message: message || null,
      sourcePage,
    });
  } catch (error) {
    console.error("Erro ao salvar lead", error);
    return {
      status: "error",
      message: "Não foi possível enviar agora. Tente novamente ou fale direto pelo WhatsApp.",
    };
  }

  const text = `Olá! Sou ${name}${company ? `, da ${company},` : ""} e acabei de pedir uma proposta pelo site (${service}).`;
  return { status: "success", whatsapp: whatsappUrl(text), firstName: name.split(" ")[0] };
}
