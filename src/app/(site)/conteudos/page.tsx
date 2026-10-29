import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { formatDateBR } from "@/lib/format";
import { POSTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conteúdos: prazos, impostos e Reforma Tributária",
  description:
    "Artigos da Goldoni Contadores sobre calendário fiscal, Reforma Tributária, Imposto de Renda e gestão para empresas de Junqueirópolis e região.",
  alternates: { canonical: "/conteudos" },
};

export default function ConteudosPage() {
  const [featured, ...rest] = POSTS;
  return (
    <>
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-600">Conteúdos</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-navy-950">Prazos, impostos e novidades</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Informação clara para o empresário de Junqueirópolis e região tomar decisões melhores — escrita por quem
            vive a contabilidade todos os dias.
          </p>
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <Link
            href={`/conteudos/${featured.slug}`}
            className="group relative flex flex-col justify-end overflow-hidden rounded-[28px] bg-navy-950 p-9 lg:row-span-2"
          >
            <div className="bg-grid absolute inset-0" />
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" />
            <div className="relative">
              <span className="rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-navy-950">{featured.category}</span>
              <h2 className="mt-5 font-serif text-3xl font-bold leading-tight text-white group-hover:text-gold-200">
                {featured.title}
              </h2>
              <p className="mt-3 text-navy-100/85">{featured.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-300">
                Ler artigo <Icon name="arrowRight" className="h-4 w-4" />
              </span>
            </div>
          </Link>
          {rest.map((p) => (
            <Link
              key={p.slug}
              href={`/conteudos/${p.slug}`}
              className="group rounded-[28px] border border-slate-200 p-8 transition hover:border-navy-200 hover:shadow-lg"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">{p.category}</span>
              <h2 className="mt-3 text-xl font-semibold text-slate-900 group-hover:text-navy-700">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.excerpt}</p>
              <span className="mt-5 block text-xs text-slate-400">
                {formatDateBR(p.date)} · {p.readingMinutes} min de leitura
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
