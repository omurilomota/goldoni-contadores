import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { LeadForm } from "@/components/lead-form";
import { formatDateBR } from "@/lib/format";
import { COMPANY, DIFFERENTIALS, POSTS, SERVICES, SITE_URL, STATS, TESTIMONIALS, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AccountingService",
  "@id": `${SITE_URL}/#empresa`,
  name: COMPANY.name,
  legalName: COMPANY.legalName,
  url: SITE_URL,
  image: `${SITE_URL}/images/hero-escritorio.jpg`,
  telephone: "+55 18 0000-0104",
  email: COMPANY.email,
  taxID: COMPANY.cnpj,
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY.street,
    addressLocality: COMPANY.city,
    addressRegion: COMPANY.state,
    addressCountry: "BR",
  },
  sameAs: [COMPANY.instagram],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden bg-navy-950">
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">
              Junqueirópolis/SP · Contabilidade & Direito
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.1] text-white sm:text-5xl">
              Pague menos impostos. Lucre com segurança.
            </h1>
            <p className="mt-4 max-w-lg text-navy-100/90">
              Planejamento tributário, folha, fiscal e jurídico para 500+ empresas. Proposta em 1 dia útil.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="#contato"
                className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400"
              >
                Pedir proposta <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Icon name="whatsapp" className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl ring-1 ring-white/10">
            <Image
              src="/images/hero-escritorio.jpg"
              alt="Mesa de trabalho com relatórios e notebook"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 92vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="px-6 py-5">
                <p className="font-serif text-3xl font-bold text-gold-300">{s.value}</p>
                <p className="mt-0.5 text-sm text-navy-100/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="servicos" className="scroll-mt-24 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl font-bold text-navy-950">Serviços</h2>
            <p className="hidden text-sm text-slate-500 sm:block">Do CNPJ ao planejamento sucessório.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                href={`/servicos/${s.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-navy-300 hover:shadow-md"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-50 text-navy-700 group-hover:bg-navy-900 group-hover:text-gold-300">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{s.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.short}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="sobre" className="scroll-mt-24 bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div className="relative aspect-[5/4] overflow-hidden rounded-3xl">
            <Image
              src="/images/tradicao-tecnologia.jpg"
              alt="Livro contábil e tablet"
              fill
              sizes="(min-width: 1024px) 560px, 92vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold text-navy-950">Defesa do caixa. Crescimento seguro.</h2>
            <p className="mt-3 text-slate-600">
              Imposto mal planejado e passivo oculto corroem o lucro. {COMPANY.partners[0]} e {COMPANY.partners[1]} unem
              contabilidade e direito para proteger o patrimônio da sua empresa.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {DIFFERENTIALS.map((d) => (
                <div key={d.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="font-semibold text-slate-900">{d.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{d.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="central" className="scroll-mt-24 bg-navy-900 py-14 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">Central Goldoni</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Portal 24h: guias, checklist e protocolos</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-sm">
              {["Checklist com prazo", "Guias e balancetes em PDF", "Solicitações com protocolo", "Alerta de certidões"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Icon name="checkCircle" className="h-4 w-4 text-gold-300" /> {t}
                  </li>
                ),
              )}
            </ul>
            <Link
              href="/portal/login"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400"
            >
              Entrar na Central <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white text-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">Documentos do mês</p>
                <p className="font-semibold">Padaria Pão Dourado</p>
              </div>
              <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-bold text-navy-700">57%</span>
            </div>
            <ul className="divide-y divide-slate-100 px-5">
              {[
                ["Extratos bancários", "Aprovado", "text-emerald-700"],
                ["Notas de entrada (XML)", "Em análise", "text-sky-700"],
                ["Relatório de vendas", "Vence em 2 dias", "text-amber-700"],
                ["Variáveis da folha", "Atrasado", "text-rose-700"],
              ].map(([t, s, c]) => (
                <li key={t} className="flex items-center justify-between py-3 text-sm">
                  <span>{t}</span>
                  <span className={`font-semibold ${c}`}>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-serif text-3xl font-bold text-navy-950">Troca de contador em 3 passos</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Diagnóstico", "Revisamos impostos e mostramos onde dá para economizar."],
              ["02", "Transição", "Cuidamos do escritório anterior, arquivos e procurações."],
              ["03", "Portal em 24h", "Acesso à Central com checklist, guias e canal direto."],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl border border-slate-200 p-6">
                <p className="font-serif text-3xl font-bold text-gold-500">{n}</p>
                <h3 className="mt-2 font-semibold text-slate-900">{t}</h3>
                <p className="mt-1 text-sm text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-serif text-3xl font-bold text-navy-950">Resultados na prática</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.author} className="rounded-2xl border border-slate-200 bg-white p-6">
                <blockquote className="text-sm leading-relaxed text-slate-800">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-xs text-slate-500">
                  <span className="font-semibold text-slate-900">{t.author}</span> · {t.detail}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl font-bold text-navy-950">Conteúdos</h2>
            <Link href="/conteudos" className="text-sm font-semibold text-navy-700">
              Ver todos →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {POSTS.map((p) => (
              <Link key={p.slug} href={`/conteudos/${p.slug}`} className="rounded-2xl border border-slate-200 p-5 hover:border-navy-300">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">{p.category}</p>
                <h3 className="mt-2 font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-3 text-xs text-slate-400">
                  {formatDateBR(p.date)} · {p.readingMinutes} min
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="scroll-mt-24 bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-navy-950 p-7 text-white sm:p-8">
            <h2 className="font-serif text-2xl font-bold">Peça sua proposta</h2>
            <p className="mt-1 text-sm text-navy-100/80">Retorno em 1 dia útil — ou fale agora no WhatsApp.</p>
            <div className="mt-6">
              <LeadForm dark />
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="font-serif text-xl font-bold text-navy-950">Escritório</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex gap-3">
                  <Icon name="pin" className="h-5 w-5 shrink-0 text-gold-600" />
                  <a href={COMPANY.mapsLink} target="_blank" rel="noopener noreferrer">
                    {COMPANY.street} – {COMPANY.district}, {COMPANY.city}/{COMPANY.state}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Icon name="phone" className="h-5 w-5 shrink-0 text-gold-600" />
                  <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>
                </li>
                <li className="flex gap-3">
                  <Icon name="whatsapp" className="h-5 w-5 shrink-0 text-gold-600" />
                  <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                    {COMPANY.whatsapp}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Icon name="mail" className="h-5 w-5 shrink-0 text-gold-600" />
                  <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                </li>
                <li className="flex gap-3">
                  <Icon name="clock" className="h-5 w-5 shrink-0 text-gold-600" />
                  {COMPANY.hours}
                </li>
              </ul>
            </div>
            <div className="min-h-[220px] overflow-hidden rounded-3xl border border-slate-200">
              <iframe
                title="Mapa — Goldoni Contadores"
                src={COMPANY.mapsEmbed}
                className="h-full min-h-[220px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
