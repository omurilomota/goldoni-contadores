import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand";
import { Icon } from "@/components/icons";
import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_CLIENT_EMAIL, DEMO_PASSWORD, DEMO_STAFF_EMAIL } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Central Goldoni — Acesso",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "equipe" ? "/equipe" : "/portal");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy-950 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-gold-500/15 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-3">
          <LogoMark className="h-11 w-11" />
          <span className="leading-tight">
            <span className="block font-serif text-lg font-bold text-white">Goldoni Contadores</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-300">Contabilidade & Direito</span>
          </span>
        </Link>
        <div className="relative max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-300">Central Goldoni</p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-white">
            Sua contabilidade organizada, a qualquer hora.
          </h1>
          <ul className="mt-8 space-y-4 text-navy-100">
            {[
              "Checklist mensal de documentos com prazos",
              "Guias, holerites e balancetes em PDF",
              "Solicitações com protocolo e histórico",
              "Alertas de certidões e vencimentos",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <Icon name="checkCircle" className="h-5 w-5 text-gold-300" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative flex items-center gap-2 text-xs text-navy-200">
          <Icon name="lock" className="h-4 w-4" /> Conexão protegida · dados tratados conforme a LGPD
        </p>
      </div>

      <div className="flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-800">
            <Icon name="arrowLeft" className="h-4 w-4" /> Voltar ao site
          </Link>
          <div className="mt-6 rounded-[28px] bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <LogoMark className="h-10 w-10" />
              <span className="font-serif text-lg font-bold text-navy-900">Central Goldoni</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-navy-950">Entrar</h2>
            <p className="mt-1 text-sm text-slate-500">Área do cliente e painel da equipe.</p>
            <div className="mt-6">
              <LoginForm clientEmail={DEMO_CLIENT_EMAIL} staffEmail={DEMO_STAFF_EMAIL} password={DEMO_PASSWORD} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
