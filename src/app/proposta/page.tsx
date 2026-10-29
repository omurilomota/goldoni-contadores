import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand";
import { Icon } from "@/components/icons";
import { RoiCalculator } from "@/components/roi-calculator";

export const metadata: Metadata = {
  title: "Proposta Comercial — Goldoni Contadores",
  robots: { index: false, follow: false },
};

const LOSSES = [
  { n: "R$ 36–72 mil/ano", t: "Clientes novos no Google", d: "Sem site, a busca da cidade vai para a concorrência." },
  { n: "250 h/mês", t: "Retrabalho da equipe", d: "Extrato e guia no WhatsApp. ≈ R$ 8.750/mês na folha." },
  { n: "@terra.com.br", t: "Credibilidade", d: "E-mail legado trava empresa de maior ticket." },
  { n: "+R$ 100–250/mês", t: "Upsell parado", d: "Certidões cobradas na correria, não como serviço." },
];

const PHASES = [
  {
    tag: "Fase 1",
    title: "Captação",
    time: "4–6 sem.",
    price: "R$ 4.500–7.000",
    rec: "+ R$ 250–400/mês",
    items: ["Domínio + e-mails Google", "Site SEO local", "Google Meu Negócio", "WhatsApp + leads no painel"],
    href: "/",
    cta: "Ver site",
  },
  {
    tag: "Fase 2",
    title: "Portal",
    time: "8–12 sem.",
    price: "R$ 12–20 mil",
    rec: "ou SaaS R$ 900–1.500/mês",
    items: ["Checklist com upload", "Guias 24h", "Protocolos", "Painel: quem não entregou"],
    href: "/portal/login",
    cta: "Abrir Central",
  },
  {
    tag: "Fase 3",
    title: "Automação",
    time: "contínuo",
    price: "R$ 1.200–2.500/mês",
    rec: "evolução",
    items: ["Robô WhatsApp", "Monitor de CNDs", "Onboarding 24h", "API do sistema contábil"],
    href: "/equipe",
    cta: "Ver equipe",
  },
];

export default function PropostaPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <LogoMark className="h-8 w-8" />
            <p className="font-serif text-sm font-bold text-navy-950">Proposta Goldoni</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="rounded-xl bg-navy-900 px-4 py-2 text-xs font-bold text-white">
              Protótipo
            </Link>
            <Link href="/portal/login" className="rounded-xl px-4 py-2 text-xs font-bold text-navy-900 ring-1 ring-navy-200">
              Portal
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-navy-950 py-12 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">Eduardo Goldoni · Fabrício Pedrini</p>
          <h1 className="mt-3 max-w-3xl font-serif text-3xl font-bold sm:text-5xl">
            1 cliente novo/mês paga o projeto. 250h da equipe voltam para o caixa.
          </h1>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["500+", "empresas na base"],
              ["0", "site no Google"],
              ["250h", "perdidas / mês"],
              ["1 cliente", "paga a Fase 1"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <p className="font-serif text-2xl font-bold text-gold-300">{v}</p>
                <p className="text-xs text-navy-100">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-serif text-2xl font-bold text-navy-950">Onde perde dinheiro hoje</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LOSSES.map((x) => (
              <div key={x.t} className="rounded-2xl border border-slate-200 p-5">
                <p className="font-serif text-xl font-bold text-rose-600">{x.n}</p>
                <p className="mt-2 font-semibold text-slate-900">{x.t}</p>
                <p className="mt-1 text-sm text-slate-600">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-serif text-2xl font-bold text-navy-950">Antes × depois</h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Processo</th>
                  <th className="px-5 py-3 text-rose-700">Hoje</th>
                  <th className="px-5 py-3 text-emerald-700">Com o projeto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ["Captação", "Indicação e porta", "Google + WhatsApp"],
                  ["Documentos", "E-mail / Zap / motoboy", "Checklist com prazo"],
                  ["Guias", "Reenvio um a um", "Self-service 24h"],
                  ["Cobrança", "Ligação manual", "Robô WhatsApp"],
                  ["E-mail", "@terra.com.br", "@goldoni.exemplo.com.br"],
                ].map(([a, b, c]) => (
                  <tr key={a}>
                    <td className="px-5 py-3 font-semibold">{a}</td>
                    <td className="px-5 py-3 text-rose-800">{b}</td>
                    <td className="px-5 py-3 text-emerald-800">
                      <Icon name="checkCircle" className="mr-1 inline h-4 w-4" />
                      {c}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-serif text-2xl font-bold text-navy-950">Preço, prazo, entrega</h2>
          <p className="mt-1 text-sm text-slate-600">Fase 2 só começa se a Fase 1 provar valor.</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {PHASES.map((p, i) => (
              <div key={p.tag} className={`flex flex-col rounded-2xl p-6 ${i === 0 ? "bg-navy-950 text-white" : "border border-slate-200"}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={`rounded-full px-2.5 py-1 font-bold ${i === 0 ? "bg-gold-500 text-navy-950" : "bg-navy-50 text-navy-800"}`}>
                    {p.tag}
                  </span>
                  <span className={i === 0 ? "text-navy-200" : "text-slate-500"}>{p.time}</span>
                </div>
                <h3 className="mt-4 font-serif text-xl font-bold">{p.title}</h3>
                <p className={`mt-2 text-2xl font-bold ${i === 0 ? "text-gold-300" : "text-navy-950"}`}>{p.price}</p>
                <p className={`text-xs ${i === 0 ? "text-navy-200" : "text-slate-500"}`}>{p.rec}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <Icon name="check" className={`mt-0.5 h-4 w-4 shrink-0 ${i === 0 ? "text-gold-300" : "text-emerald-600"}`} />
                      {it}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={`mt-6 rounded-xl px-4 py-2.5 text-center text-sm font-bold ${i === 0 ? "bg-gold-500 text-navy-950" : "bg-navy-900 text-white"}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-950 py-12 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-serif text-2xl font-bold">ROI — simule com os números do escritório</h2>
          <p className="mt-1 text-sm text-navy-100/80">1 cliente a R$ 650/mês = R$ 39 mil em 5 anos.</p>
          <div className="mt-8">
            <RoiCalculator />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="font-serif text-2xl font-bold text-navy-950">Roteiro de 15 min</h2>
            <ol className="mt-4 space-y-3 text-sm">
              {[
                ["0–3 min", "Abrir o Google: “abrir empresa em Junqueirópolis”. Goldoni não aparece."],
                ["4–8 min", "Mostrar o site e a Central no tablet. Sem slide."],
                ["9–12 min", "Conta: 1 cliente novo paga a Fase 1. 250h liberadas."],
                ["13–15 min", "Começar só a Fase 1. Domínio hoje. Foto da fachada."],
              ].map(([t, d]) => (
                <li key={t} className="grid grid-cols-[88px_1fr] gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-600">{t}</span>
                  <span className="text-slate-700">{d}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl bg-navy-950 p-6 text-white">
            <h2 className="font-serif text-2xl font-bold">Fechar hoje</h2>
            <ul className="mt-4 space-y-3 text-sm text-navy-100">
              <li>
                <strong className="text-gold-300">1.</strong> Autorizar o domínio goldoni.exemplo.com.br (R$ 40/ano).
              </li>
              <li>
                <strong className="text-gold-300">2.</strong> Foto da fachada (Rua das Palmeiras, 250) e da equipe.
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/" className="rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-bold text-navy-950">
                Abrir site
              </Link>
              <Link href="/portal/login" className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold">
                Abrir portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
