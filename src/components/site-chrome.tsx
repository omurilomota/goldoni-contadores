import Link from "next/link";
import { COMPANY, SERVICES, whatsappUrl } from "@/lib/site";
import { Logo } from "./brand";
import { DetailsCloser } from "./client-ui";
import { Icon } from "./icons";

const NAV = [
  { href: "/#servicos", label: "Serviços" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/#central", label: "Central Goldoni" },
  { href: "/conteudos", label: "Conteúdos" },
  { href: "/#contato", label: "Contato" },
];

export function DemoBanner() {
  return (
    <div className="bg-gold-500 text-navy-950">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-1.5 text-center text-xs font-medium">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="sparkles" className="h-3.5 w-3.5" />
          Protótipo · dados ilustrativos.
        </span>
        <Link href="/proposta" className="font-bold underline underline-offset-2 hover:no-underline">
          Ver proposta →
        </Link>
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Goldoni Contadores — início">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-navy-50 hover:text-navy-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/portal/login"
            className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-navy-900 ring-1 ring-inset ring-navy-200 transition hover:bg-navy-50"
          >
            <Icon name="lock" className="h-4 w-4" />
            Área do cliente
          </Link>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800"
          >
            <Icon name="whatsapp" className="h-4 w-4" />
            {COMPANY.whatsapp}
          </a>
        </div>
        <details className="group relative lg:hidden">
          <summary className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl ring-1 ring-slate-200">
            <Icon name="menu" className="h-5 w-5 group-open:hidden" />
            <Icon name="x" className="hidden h-5 w-5 group-open:block" />
          </summary>
          <DetailsCloser className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-navy-50">
                {item.label}
              </Link>
            ))}
            <div className="my-2 border-t border-slate-100" />
            <Link href="/portal/login" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-navy-900 hover:bg-navy-50">
              Área do cliente
            </Link>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-2 rounded-lg bg-navy-900 px-3 py-2.5 text-sm font-semibold text-white">
              <Icon name="whatsapp" className="h-4 w-4" /> Falar no WhatsApp
            </a>
          </DetailsCloser>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-950 text-navy-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-navy-200/80">
            {COMPANY.slogan}. Mais de 500 empresas assessoradas em Junqueirópolis e região.
          </p>
          <a
            href={COMPANY.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-gold-300"
          >
            <Icon name="instagram" className="h-4 w-4" /> {COMPANY.instagramHandle}
          </a>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gold-300">Serviços</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/servicos/${s.slug}`} className="text-navy-200/90 hover:text-white">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gold-300">Institucional</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/#sobre" className="text-navy-200/90 hover:text-white">Sobre o escritório</Link></li>
            <li><Link href="/conteudos" className="text-navy-200/90 hover:text-white">Conteúdos e prazos</Link></li>
            <li><Link href="/portal/login" className="text-navy-200/90 hover:text-white">Central Goldoni (área do cliente)</Link></li>
            <li><Link href="/#contato" className="text-navy-200/90 hover:text-white">Solicitar proposta</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gold-300">Contato</p>
          <ul className="mt-4 space-y-3 text-sm text-navy-200/90">
            <li className="flex gap-2.5">
              <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
              <span>
                {COMPANY.street} – {COMPANY.district}
                <br />
                {COMPANY.city}/{COMPANY.state}
              </span>
            </li>
            <li className="flex gap-2.5">
              <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
              <a href={COMPANY.phoneHref} className="hover:text-white">{COMPANY.phone}</a>
            </li>
            <li className="flex gap-2.5">
              <Icon name="whatsapp" className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-white">{COMPANY.whatsapp}</a>
            </li>
            <li className="flex gap-2.5">
              <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
              <a href={`mailto:${COMPANY.email}`} className="hover:text-white">{COMPANY.email}</a>
            </li>
            <li className="flex gap-2.5">
              <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
              <span>{COMPANY.hours}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-navy-200/70 sm:px-6">
          <p>
            © {year} {COMPANY.legalName} · CNPJ {COMPANY.cnpj}
          </p>
          <p>Protótipo desenvolvido por Murilo · Next.js + PostgreSQL</p>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Goldoni Contadores no WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2"
    >
      <span className="hidden rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-lg ring-1 ring-slate-200 transition group-hover:inline-block">
        Fale com a gente
      </span>
      <span className="grid h-14 w-14 place-items-center rounded-full bg-[#1FAF54] text-white shadow-xl shadow-emerald-900/25 ring-4 ring-white transition group-hover:scale-105">
        <Icon name="whatsapp" className="h-7 w-7" />
      </span>
    </a>
  );
}
