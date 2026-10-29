"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Icon, type IconKey } from "./icons";

const VARIANTS = {
  primary: "bg-navy-900 text-white hover:bg-navy-800 focus-visible:outline-navy-700",
  gold: "bg-gold-500 text-navy-950 hover:bg-gold-400 focus-visible:outline-gold-600",
  secondary: "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50",
  success: "bg-emerald-600 text-white hover:bg-emerald-500",
  danger: "bg-white text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-50",
  whatsapp: "bg-[#1FAF54] text-white hover:bg-[#1a9a4a]",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

export function buttonClass(variant: ButtonVariant = "primary", size: "sm" | "md" = "md") {
  const sizing = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  return `inline-flex items-center justify-center gap-2 rounded-xl font-semibold shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${sizing} ${VARIANTS[variant]}`;
}

export function SubmitButton({
  children,
  pendingText = "Enviando…",
  variant = "primary",
  size = "md",
  className = "",
  name,
  value,
  confirmMessage,
}: {
  children: ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  className?: string;
  name?: string;
  value?: string;
  confirmMessage?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) e.preventDefault();
      }}
      className={`${buttonClass(variant, size)} ${className}`}
    >
      {pending ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

function UploadInner({ label, accept, variant }: { label: string; accept?: string; variant: ButtonVariant }) {
  const { pending } = useFormStatus();
  return (
    <label className={`${buttonClass(variant, "sm")} cursor-pointer ${pending ? "pointer-events-none opacity-70" : ""}`}>
      {pending ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          Enviando…
        </>
      ) : (
        <>
          <Icon name="upload" className="h-3.5 w-3.5" />
          {label}
        </>
      )}
      <input
        type="file"
        name="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const input = e.currentTarget;
          const file = input.files?.[0];
          if (!file) return;
          if (file.size > 8 * 1024 * 1024) {
            window.alert("O arquivo tem mais de 8 MB. Compacte ou divida o arquivo e tente novamente.");
            input.value = "";
            return;
          }
          input.form?.requestSubmit();
        }}
      />
    </label>
  );
}

/** Formulário de upload que envia automaticamente ao escolher o arquivo. */
export function AutoUploadForm({
  action,
  fields,
  label = "Enviar arquivo",
  accept = ".pdf,.png,.jpg,.jpeg,.xml,.ofx,.xls,.xlsx,.csv,.zip,.txt,.doc,.docx",
  variant = "primary",
}: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string | number>;
  label?: string;
  accept?: string;
  variant?: ButtonVariant;
}) {
  return (
    <form action={action}>
      {Object.entries(fields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <UploadInner label={label} accept={accept} variant={variant} />
    </form>
  );
}

/** Fecha o <details> pai (menu mobile) quando um link interno é clicado. */
export function DetailsCloser({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={className}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) {
          e.currentTarget.closest("details")?.removeAttribute("open");
        }
      }}
    >
      {children}
    </div>
  );
}

export type NavItem = { href: string; label: string; icon: IconKey; exact?: boolean; badge?: number };

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-white/12 text-white shadow-inner" : "text-navy-100/80 hover:bg-white/6 hover:text-white"
            }`}
          >
            <Icon name={item.icon} className={`h-[18px] w-[18px] ${active ? "text-gold-300" : ""}`} />
            <span>{item.label}</span>
            {item.badge ? (
              <span className="ml-auto rounded-full bg-gold-500 px-2 py-0.5 text-[11px] font-bold text-navy-950">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

/** Pré-visualização + disparo da cobrança de documentos via WhatsApp (Fase 3). */
export function WhatsAppChargeButton({
  link,
  message,
  clientName,
  logAction,
  clientId,
  competence,
  lastReminder,
}: {
  link: string;
  message: string;
  clientName: string;
  logAction: (formData: FormData) => Promise<void>;
  clientId: number;
  competence: string;
  lastReminder?: string | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className={buttonClass("whatsapp", "sm")}>
        <Icon name="whatsapp" className="h-3.5 w-3.5" />
        Cobrar
      </button>
      <dialog
        ref={dialogRef}
        className="m-auto w-[min(92vw,520px)] rounded-2xl p-0 shadow-2xl backdrop:bg-navy-950/50 backdrop:backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Cobrança automática · WhatsApp</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{clientName}</h3>
          {lastReminder && <p className="mt-0.5 text-xs text-slate-500">Última cobrança: {lastReminder}</p>}
        </div>
        <div className="bg-[#ECE5DD] px-5 py-5">
          <div className="ml-auto max-w-[90%] whitespace-pre-line rounded-2xl rounded-tr-sm bg-[#DCF8C6] px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-sm">
            {message}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
          <p className="text-xs text-slate-500">Na Fase 3, o robô envia isso sozinho via WhatsApp Cloud API.</p>
          <div className="flex gap-2">
            <button
              type="button"
              className={buttonClass("secondary", "sm")}
              onClick={async () => {
                await navigator.clipboard.writeText(message).catch(() => undefined);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
            >
              {copied ? "Copiado!" : "Copiar"}
            </button>
            <form
              action={async (fd) => {
                window.open(link, "_blank", "noopener,noreferrer");
                await logAction(fd);
                dialogRef.current?.close();
              }}
            >
              <input type="hidden" name="clientId" value={clientId} />
              <input type="hidden" name="competence" value={competence} />
              <input type="hidden" name="message" value={message} />
              <SubmitButton variant="whatsapp" size="sm" pendingText="Registrando…">
                <Icon name="send" className="h-3.5 w-3.5" />
                Abrir no WhatsApp
              </SubmitButton>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
