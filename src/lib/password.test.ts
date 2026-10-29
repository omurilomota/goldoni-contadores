import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("gera hash com salt e formato salt:hash", () => {
    const stored = hashPassword("senha-segura");
    expect(stored).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
  });

  it("gera salts diferentes para a mesma senha", () => {
    expect(hashPassword("mesma-senha")).not.toBe(hashPassword("mesma-senha"));
  });

  it("valida a senha correta", () => {
    const stored = hashPassword("Goldoni@2026");
    expect(verifyPassword("Goldoni@2026", stored)).toBe(true);
  });

  it("rejeita senha incorreta", () => {
    const stored = hashPassword("Goldoni@2026");
    expect(verifyPassword("goldoni@2026", stored)).toBe(false);
    expect(verifyPassword("", stored)).toBe(false);
  });

  it("rejeita hash malformado sem lançar exceção", () => {
    expect(verifyPassword("qualquer", "sem-separador")).toBe(false);
    expect(verifyPassword("qualquer", "")).toBe(false);
  });
});
