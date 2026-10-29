import Link from "next/link";
import { LogoMark } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <LogoMark className="mx-auto h-14 w-14" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-gold-600">Erro 404</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-navy-950">Página não encontrada</h1>
        <p className="mt-3 text-slate-600">O endereço pode ter mudado. Que tal voltar ao início?</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800">
            Ir para o site
          </Link>
          <Link href="/portal/login" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-navy-200 hover:bg-white">
            Área do cliente
          </Link>
        </div>
      </div>
    </div>
  );
}
