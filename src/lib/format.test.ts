import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addDaysISO,
  certStatus,
  competenceLabel,
  currentCompetence,
  diffDays,
  dueInfo,
  formatBRL,
  formatDateBR,
  formatMoney,
  onlyDigits,
  protocolo,
  shiftCompetence,
  todayISO,
  waLink,
} from "./format";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-10T15:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("datas", () => {
  it("usa o fuso de São Paulo para o dia atual", () => {
    expect(todayISO()).toBe("2026-03-10");
  });

  it("soma e subtrai dias sem erro de fuso", () => {
    expect(addDaysISO("2026-03-10", 5)).toBe("2026-03-15");
    expect(addDaysISO("2026-02-27", 2)).toBe("2026-03-01");
    expect(addDaysISO("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("calcula a diferença em dias", () => {
    expect(diffDays("2026-03-01", "2026-03-10")).toBe(9);
    expect(diffDays("2026-03-10", "2026-03-09")).toBe(-1);
  });

  it("formata data brasileira e trata vazio", () => {
    expect(formatDateBR("2026-03-10")).toBe("10/03/2026");
    expect(formatDateBR(null)).toBe("—");
  });
});

describe("competência", () => {
  it("avança e retrocede meses virando o ano", () => {
    expect(shiftCompetence("2026-01", -1)).toBe("2025-12");
    expect(shiftCompetence("2026-12", 1)).toBe("2027-01");
    expect(shiftCompetence("2026-03", -2)).toBe("2026-01");
  });

  it("usa o mês anterior como competência de fechamento", () => {
    expect(currentCompetence()).toBe("2026-02");
  });

  it("escreve o nome do mês em português", () => {
    expect(competenceLabel("2026-03")).toBe("março/2026");
    expect(competenceLabel("2026-03", true)).toBe("Março/2026");
  });
});

describe("dinheiro e telefone", () => {
  it("formata centavos e valores em reais", () => {
    const plain = (value: string) => value.replace(/\u00a0/g, " ");
    expect(plain(formatMoney(123456))).toBe("R$ 1.234,56");
    expect(formatMoney(null)).toBe("—");
    expect(plain(formatBRL(1234.5))).toBe("R$ 1.235");
    expect(plain(formatBRL(1234.5, 2))).toBe("R$ 1.234,50");
  });

  it("limpa e prefixa o telefone no link do WhatsApp", () => {
    expect(onlyDigits("(18) 99999-0199")).toBe("18999990199");
    expect(waLink("(18) 99999-0199", "Olá")).toBe(
      "https://wa.me/5518999990199?text=Ol%C3%A1",
    );
    expect(waLink("5518999990199", "Oi")).toBe(
      "https://wa.me/5518999990199?text=Oi",
    );
  });

  it("não duplica o DDI 55", () => {
    expect(waLink("5518999990199", "Oi").match(/55/g)).toHaveLength(1);
  });
});

describe("status", () => {
  it("descreve vencimento com tom adequado", () => {
    expect(dueInfo("2026-03-08")).toMatchObject({ tone: "danger", days: -2 });
    expect(dueInfo("2026-03-10")).toMatchObject({ tone: "warning", days: 0 });
    expect(dueInfo("2026-03-12")).toMatchObject({ tone: "warning", days: 2 });
    expect(dueInfo("2026-04-10")).toMatchObject({ tone: "neutral", days: 31 });
  });

  it("classifica certidões por validade e irregularidade", () => {
    expect(certStatus("2027-03-10", false)).toMatchObject({ label: "Regular", tone: "success" });
    expect(certStatus("2026-03-20", false)).toMatchObject({ label: "Vencendo", tone: "warning" });
    expect(certStatus("2026-03-01", false)).toMatchObject({ label: "Vencida", tone: "danger" });
    expect(certStatus("2027-03-10", true)).toMatchObject({ label: "Irregular", tone: "danger" });
  });

  it("gera protocolo com ano e sequência", () => {
    expect(protocolo(7, "2026-03-10T12:00:00Z")).toBe("GC-2026-0007");
    expect(protocolo(1234, new Date("2025-12-01T12:00:00Z"))).toBe("GC-2025-1234");
  });
});
