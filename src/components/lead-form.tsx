"use client";

import { usePathname } from "next/navigation";
import { useActionState } from "react";
import { submitLead, type LeadState } from "@/app/actions/lead";
import { LEAD_SERVICES } from "@/lib/site";
import { Icon } from "./icons";

const initialState: LeadState = { status: "idle" };

const inputClass =
  "mt-1.5 block w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-navy-600 outline-none";

export function LeadForm({ defaultService = "Troca de contador", dark = false }: { defaultService?: string; dark?: boolean }) {
  const pathname = usePathname();
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const labelClass = `block text-sm font-medium ${dark ? "text-navy-100" : "text-slate-700"}`;

  if (state.status === "success") {
    return (
      <div className={`rounded-2xl p-6 text-center ${dark ? "bg-white/10" : "bg-emerald-50"}`}>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white">
          <Icon name="check" className="h-6 w-6" />
        </span>
        <h3 className={`mt-4 text-lg font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
          Recebemos seu pedido{state.firstName ? `, ${state.firstName}` : ""}!
        </h3>
        <p className={`mt-1 text-sm ${dark ? "text-navy-100" : "text-slate-600"}`}>
          Nossa equipe retorna em até 1 dia útil. Se preferir, adiante a conversa agora pelo WhatsApp.
        </p>
        <a
          href={state.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1FAF54] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1a9a4a]"
        >
          <Icon name="whatsapp" className="h-4 w-4" /> Continuar no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2" noValidate>
      <input type="hidden" name="sourcePage" value={pathname} />
      <div className="hidden" aria-hidden="true">
        <label>
          Site <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div>
        <label htmlFor="lead-name" className={labelClass}>Nome *</label>
        <input id="lead-name" name="name" required placeholder="Seu nome" className={inputClass} autoComplete="name" />
        {state.errors?.name && <p className="mt-1 text-xs font-medium text-rose-500">{state.errors.name}</p>}
      </div>
      <div>
        <label htmlFor="lead-phone" className={labelClass}>WhatsApp *</label>
        <input id="lead-phone" name="phone" required inputMode="tel" placeholder="(18) 99999-9999" className={inputClass} autoComplete="tel" />
        {state.errors?.phone && <p className="mt-1 text-xs font-medium text-rose-500">{state.errors.phone}</p>}
      </div>
      <div>
        <label htmlFor="lead-company" className={labelClass}>Empresa</label>
        <input id="lead-company" name="company" placeholder="Nome da empresa (se houver)" className={inputClass} autoComplete="organization" />
      </div>
      <div>
        <label htmlFor="lead-email" className={labelClass}>E-mail</label>
        <input id="lead-email" name="email" type="email" placeholder="voce@exemplo.com" className={inputClass} autoComplete="email" />
        {state.errors?.email && <p className="mt-1 text-xs font-medium text-rose-500">{state.errors.email}</p>}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="lead-service" className={labelClass}>Como podemos ajudar?</label>
        <select id="lead-service" name="service" defaultValue={defaultService} className={inputClass}>
          {LEAD_SERVICES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="lead-message" className={labelClass}>Mensagem</label>
        <textarea
          id="lead-message"
          name="message"
          rows={3}
          placeholder="Conte rapidamente sobre sua empresa: atividade, faturamento aproximado, nº de funcionários…"
          className={inputClass}
        />
      </div>
      {state.status === "error" && state.message && (
        <p className="sm:col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{state.message}</p>
      )}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-xs ${dark ? "text-navy-200" : "text-slate-500"}`}>
          <Icon name="lock" className="mr-1 inline h-3.5 w-3.5" />
          Seus dados são usados apenas para o contato (LGPD).
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 shadow-sm transition hover:bg-gold-400 disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Quero minha proposta"}
          {!pending && <Icon name="arrowRight" className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}
