// Utilitários de formatação compartilhados entre servidor e cliente (pt-BR / America/Sao_Paulo).

export const TZ = "America/Sao_Paulo";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

/** Data de hoje (YYYY-MM-DD) no fuso de São Paulo. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Diferença em dias entre duas datas ISO (to - from). */
export function diffDays(fromISO: string, toISO: string): number {
  const a = Date.UTC(+fromISO.slice(0, 4), +fromISO.slice(5, 7) - 1, +fromISO.slice(8, 10));
  const b = Date.UTC(+toISO.slice(0, 4), +toISO.slice(5, 7) - 1, +toISO.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

export function shiftCompetence(comp: string, delta: number): string {
  let y = +comp.slice(0, 4);
  let m = +comp.slice(5, 7) + delta;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return `${y}-${String(m).padStart(2, "0")}`;
}

/** Competência de trabalho = mês anterior ao atual (fechamento do movimento). */
export function currentCompetence(): string {
  return shiftCompetence(todayISO().slice(0, 7), -1);
}

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function competenceLabel(comp: string, capitalize = false): string {
  const label = `${MONTHS[+comp.slice(5, 7) - 1] ?? comp}/${comp.slice(0, 4)}`;
  return capitalize ? label.charAt(0).toUpperCase() + label.slice(1) : label;
}

export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function formatDateTimeBR(value: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatMoney(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function formatBRL(value: number, digits = 0): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export function timeAgo(value: Date | string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} dia${d === 1 ? "" : "s"}`;
}

export function dueInfo(iso: string): { text: string; tone: Tone; days: number } {
  const days = diffDays(todayISO(), iso);
  if (days < 0) return { text: `atrasado há ${-days} dia${days === -1 ? "" : "s"}`, tone: "danger", days };
  if (days === 0) return { text: "vence hoje", tone: "warning", days };
  if (days <= 3) return { text: `vence em ${days} dia${days === 1 ? "" : "s"}`, tone: "warning", days };
  return { text: `vence em ${days} dias`, tone: "neutral", days };
}

export function certStatus(expiresAt: string, irregular: boolean): { label: string; tone: Tone; days: number } {
  const days = diffDays(todayISO(), expiresAt);
  if (irregular) return { label: "Irregular", tone: "danger", days };
  if (days < 0) return { label: "Vencida", tone: "danger", days };
  if (days <= 15) return { label: "Vencendo", tone: "warning", days };
  return { label: "Regular", tone: "success", days };
}

export function protocolo(id: number, createdAt: Date | string): string {
  return `GC-${new Date(createdAt).getFullYear()}-${String(id).padStart(4, "0")}`;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function waLink(phone: string, text: string): string {
  const digits = onlyDigits(phone);
  const full = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

export const DOC_STATUS: Record<string, { label: string; tone: Tone }> = {
  pendente: { label: "Pendente", tone: "warning" },
  enviado: { label: "Em análise", tone: "info" },
  aprovado: { label: "Aprovado", tone: "success" },
  rejeitado: { label: "Reenviar", tone: "danger" },
};

export const TICKET_STATUS: Record<string, { label: string; staffLabel: string; tone: Tone }> = {
  aberta: { label: "Aberta", staffLabel: "Nova", tone: "info" },
  em_andamento: { label: "Em andamento", staffLabel: "Em andamento", tone: "brand" },
  aguardando_cliente: { label: "Aguardando você", staffLabel: "Aguardando cliente", tone: "warning" },
  concluida: { label: "Concluída", staffLabel: "Concluída", tone: "success" },
};

export const LEAD_STATUS: Record<string, { label: string; tone: Tone }> = {
  novo: { label: "Novo", tone: "info" },
  em_contato: { label: "Em contato", tone: "brand" },
  proposta: { label: "Proposta enviada", tone: "warning" },
  ganho: { label: "Cliente fechado", tone: "success" },
  perdido: { label: "Perdido", tone: "neutral" },
};

export function deliverableStatus(kind: string, status: string, dueDate: string | null): { label: string; tone: Tone } {
  if (kind === "guia") {
    if (status === "pago") return { label: "Pago", tone: "success" };
    if (dueDate && diffDays(todayISO(), dueDate) < 0) return { label: "Em atraso", tone: "danger" };
    return { label: "A pagar", tone: "warning" };
  }
  return status === "visualizado" ? { label: "Visualizado", tone: "neutral" } : { label: "Novo", tone: "info" };
}

export const TICKET_CATEGORIES = [
  "Certidões",
  "Departamento pessoal",
  "Fiscal",
  "Contábil",
  "Abertura e alterações",
  "Jurídico",
  "Outros",
];
