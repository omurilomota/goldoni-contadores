import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/actions/auth";
import { LogoMark } from "./brand";
import { SidebarNav, type NavItem } from "./client-ui";
import { Icon } from "./icons";

export function AppShell({
  title,
  subtitle,
  nav,
  userName,
  userDetail,
  headerNote,
  children,
  sidebarExtra,
}: {
  title: string;
  subtitle: string;
  nav: NavItem[];
  userName: string;
  userDetail: string;
  headerNote?: ReactNode;
  children: ReactNode;
  sidebarExtra?: ReactNode;
}) {
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="bg-navy-950 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <Link href="/" className="flex items-center gap-3" title="Voltar ao site">
            <LogoMark className="h-10 w-10" />
            <span className="leading-tight">
              <span className="block font-serif text-[16px] font-bold text-white">{title}</span>
              <span className="block text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gold-300">{subtitle}</span>
            </span>
          </Link>
          <form action={logoutAction} className="lg:hidden">
            <button className="grid h-9 w-9 place-items-center rounded-lg text-navy-100 ring-1 ring-white/15" aria-label="Sair">
              <Icon name="logout" className="h-4 w-4" />
            </button>
          </form>
        </div>
        <div className="px-3 pb-3 lg:flex-1">
          <SidebarNav items={nav} />
          {sidebarExtra && <div className="mt-6 hidden lg:block">{sidebarExtra}</div>}
        </div>
        <div className="hidden border-t border-white/10 p-4 lg:block">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-500 text-sm font-bold text-navy-950">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{userName}</p>
              <p className="truncate text-xs text-navy-200">{userDetail}</p>
            </div>
            <form action={logoutAction}>
              <button
                className="grid h-9 w-9 place-items-center rounded-lg text-navy-200 transition hover:bg-white/10 hover:text-white"
                aria-label="Sair"
                title="Sair"
              >
                <Icon name="logout" className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <div className="min-w-0 truncate text-sm text-slate-500">{headerNote}</div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 sm:inline-flex"
              >
                <Icon name="external" className="h-3.5 w-3.5" /> Ver site
              </Link>
              <span className="rounded-lg bg-gold-50 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gold-700 ring-1 ring-gold-200">
                Demo
              </span>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
