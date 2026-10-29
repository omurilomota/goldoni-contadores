import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { formatDateBR } from "@/lib/format";
import { COMPANY, POSTS, SITE_URL, getPost, whatsappUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/conteudos/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.date },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    inLanguage: "pt-BR",
    mainEntityOfPage: `${SITE_URL}/conteudos/${post.slug}`,
    author: { "@type": "Organization", name: COMPANY.name },
    publisher: { "@type": "Organization", name: COMPANY.name, "@id": `${SITE_URL}/#empresa` },
  };

  const others = POSTS.filter((p) => p.slug !== post.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Link href="/conteudos" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-navy-900">
          <Icon name="arrowLeft" className="h-4 w-4" /> Todos os conteúdos
        </Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">{post.category}</p>
        <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-navy-950">{post.title}</h1>
        <p className="mt-4 text-sm text-slate-500">
          {formatDateBR(post.date)} · {post.readingMinutes} min de leitura · Equipe Goldoni Contadores
        </p>
        <div className="prose-goldoni mt-8">
          {post.sections.map((section, i) => (
            <div key={i}>
              {section.heading && <h2>{section.heading}</h2>}
              {section.paragraphs?.map((p) => <p key={p}>{p}</p>)}
              {section.items && (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-gold-200 bg-gold-50 p-5 text-sm font-medium text-gold-700">
          <Icon name="sparkles" className="mr-2 inline h-4 w-4" />
          {post.callout}
        </div>
        <p className="mt-6 text-xs text-slate-400">
          Conteúdo informativo. As regras tributárias mudam com frequência — confirme a aplicação ao seu caso com a equipe.
        </p>

        <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-[28px] bg-navy-950 p-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-serif text-xl font-bold text-white">Ficou com dúvida sobre a sua empresa?</p>
            <p className="mt-1 text-sm text-navy-100/80">Fale com a equipe Goldoni — respondemos rapidinho.</p>
          </div>
          <a
            href={whatsappUrl(`Olá! Li o artigo "${post.title}" e tenho uma dúvida.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1FAF54] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1a9a4a]"
          >
            <Icon name="whatsapp" className="h-4 w-4" /> Chamar no WhatsApp
          </a>
        </div>
      </article>
      <section className="border-t border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-serif text-xl font-bold text-navy-950">Continue lendo</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {others.map((p) => (
              <Link key={p.slug} href={`/conteudos/${p.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-navy-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">{p.category}</span>
                <p className="mt-2 font-semibold text-slate-900">{p.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
