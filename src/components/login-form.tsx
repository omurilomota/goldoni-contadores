"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { Icon } from "./icons";

const initial: LoginState = {};

const inputClass =
  "mt-1.5 block w-full rounded-xl border-0 px-3.5 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-navy-600";

export function LoginForm({ clientEmail, staffEmail, password }: { clientEmail: string; staffEmail: string; password: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">E-mail</label>
          <input id="email" name="email" type="email" required defaultValue={state.email} placeholder="voce@exemplo.com" className={inputClass} autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">Senha</label>
          <input id="password" name="password" type="password" required placeholder="••••••••" className={inputClass} autoComplete="current-password" />
        </div>
        {state.error && (
          <p className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            <Icon name="alert" className="h-4 w-4" /> {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800 disabled:opacity-60"
        >
          {pending ? "Entrando…" : "Entrar"}
          {!pending && <Icon name="arrowRight" className="h-4 w-4" />}
        </button>
      </form>

      <div className="mt-8 rounded-2xl border border-dashed border-gold-300 bg-gold-50/70 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-gold-700">
          <Icon name="sparkles" className="h-4 w-4" /> Acesso de demonstração
        </p>
        <p className="mt-1 text-xs text-slate-600">Entre com um clique para apresentar o portal na reunião.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <form action={formAction}>
            <input type="hidden" name="email" value={clientEmail} />
            <input type="hidden" name="password" value={password} />
            <button
              disabled={pending}
              className="flex w-full flex-col items-start rounded-xl bg-white px-4 py-3 text-left shadow-sm ring-1 ring-slate-200 transition hover:ring-navy-300 disabled:opacity-60"
            >
              <span className="text-sm font-semibold text-navy-900">Sou cliente</span>
              <span className="text-xs text-slate-500">Padaria Pão Dourado</span>
            </button>
          </form>
          <form action={formAction}>
            <input type="hidden" name="email" value={staffEmail} />
            <input type="hidden" name="password" value={password} />
            <button
              disabled={pending}
              className="flex w-full flex-col items-start rounded-xl bg-navy-900 px-4 py-3 text-left shadow-sm transition hover:bg-navy-800 disabled:opacity-60"
            >
              <span className="text-sm font-semibold text-white">Sou da equipe</span>
              <span className="text-xs text-navy-200">Painel Goldoni</span>
            </button>
          </form>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
          Cliente: {clientEmail} · Equipe: {staffEmail} · Senha: {password}
        </p>
      </div>
    </div>
  );
}
