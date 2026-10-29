import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { LeadForm } from "@/components/lead-form";
import { COMPANY, DIFFERENTIALS, SERVICES, SITE_URL, getService, whatsappUrl } from "@/lib/site";

export const dynamicParams = false;

const LEAD_DEFAULT: Record<string, string> = {
  "contabilidade-em-junqueiropolis": "Troca de contador",
  "abertura-de-empresa": "Abertura de empresa",
  "planejamento-tributario": "Planejamento tributário",
  "departamento-pessoal": "Departamento pessoal",
  "assessoria-fiscal": "Fiscal e notas fiscais",
  "direito-empresarial": "Assessoria jurídica",
};

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: { absolute: service.metaTitle },
    description: service.metaDescription,
    alternates: { canonical: `/servicos/${service.slug}` },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: `/servicos/${service.slug}`,
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const url = `${SITE_URL}/servicos/${service.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.name,
      description: service.metaDescription,
      url,
      areaServed: { "@type": "City", name: "Junqueirópolis" },
      provider: { "@id": `${SITE_URL}/#empresa`, "@type": "AccountingService", name: COMPANY.name },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: service.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: service.name, item: url },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden bg-navy-950">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-navy-600/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <nav className="flex items-center gap-2 text-xs text-navy-200" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Início</Link>
            <span>/</span>
            <Link href="/#servicos" className="hover:text-white">Serviços</Link>
            <span>/</span>
            <span className="text-gold-300">{service.name}</span>
          </nav>
          <div className="mt-6 flex items-start gap-5">
            <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-gold-300 sm:grid">
              <Icon name={service.icon} className="h-7 w-7" />
            </span>
            <div className="max-w-3xl">
              <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-5xl">{service.h1}</h1>
              <p className="mt-5 text-lg leading-relaxed text-navy-100/90">{service.intro[0]}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#proposta"
                  className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400"
                >
                  Pedir proposta <Icon name="arrowRight" className="h-4 w-4" />
                </a>
                <a
                  href={whatsappUrl(`Olá! Vim pelo site e quero saber mais sobre: ${service.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <Icon name="whatsapp" className="h-4 w-4" /> Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {service.intro.slice(1).map((p) => (
              <p key={p} className="text-lg leading-relaxed text-slate-700">{p}</p>
            ))}

            <h2 className="mt-12 font-serif text-2xl font-bold text-navy-950">O que está incluído</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {service.bullets.map((b) => (
                <li key={b} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  <Icon name="checkCircle" className="h-5 w-5 shrink-0 text-emerald-600" />
                  {b}
                </li>
              ))}
            </ul>

            <h2 className="mt-14 font-serif text-2xl font-bold text-navy-950">Por que a Goldoni</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {DIFFERENTIALS.map((d) => (
                <div key={d.title} className="rounded-2xl bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">{d.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{d.text}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-14 font-serif text-2xl font-bold text-navy-950">Perguntas frequentes</h2>
            <div className="mt-6 space-y-3">
              {service.faqs.map((f) => (
                <details key={f.q} className="group rounded-2xl border border-slate-200 p-5" open>
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-slate-900">
                    {f.q}
                    <Icon name="plus" className="h-5 w-5 shrink-0 text-navy-600 transition group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>

          <aside id="proposta" className="scroll-mt-28">
            <div className="sticky top-24 rounded-[28px] border border-slate-200 bg-white p-7 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">Proposta em até 1 dia útil</p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-navy-950">Fale com um especialista</h2>
              <p className="mt-2 text-sm text-slate-600">
                Atendimento em {COMPANY.city} e região — presencial no Centro ou 100% online.
              </p>
              <div className="mt-6">
                <LeadForm defaultService={LEAD_DEFAULT[service.slug]} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-serif text-xl font-bold text-navy-950">Outros serviços</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {SERVICES.filter((s) => s.slug !== service.slug).map((s) => (
              <Link
                key={s.slug}
                href={`/servicos/${s.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-navy-300 hover:text-navy-800"
              >
                <Icon name={s.icon} className="h-4 w-4 text-navy-600" /> {s.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
