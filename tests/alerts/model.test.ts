// Requiere Vitest (propuesto, no instalado). Cubre la lógica pura de validación del alta (CU-02).
import { describe, expect, it } from "vitest";
import {
  MAX_EMAIL_LENGTH,
  MAX_NOTES,
  MAX_URL_LENGTH,
  buildRequest,
  hasErrors,
  maskEmail,
  normalizeEmail,
  normalizeUrl,
  validateForm,
} from "@/features/alerts/model";

const ok = { urls: ["https://tienda-a.example/p/1"], emails: ["ana@correo.com"], notes: "" };

describe("US-02-01 validación en cliente", () => {
  it("AC1: 1 URL y 1 correo válidos no tienen errores", () => {
    expect(hasErrors(validateForm(ok))).toBe(false);
  });

  it("AC2: 10 URLs distintas son válidas", () => {
    const urls = Array.from({ length: 10 }, (_, i) => `https://tienda.example/p/${i}`);
    expect(hasErrors(validateForm({ ...ok, urls }))).toBe(false);
    expect(buildRequest({ ...ok, urls }).urls).toHaveLength(10);
  });

  it("AC3: 11 URLs distintas se rechazan", () => {
    const urls = Array.from({ length: 11 }, (_, i) => `https://tienda.example/p/${i}`);
    expect(validateForm({ ...ok, urls }).urlsGeneral).toBeDefined();
  });

  it("AC3 (tope sobre la lista cruda): 11 URLs que quedan en 10 tras deduplicar también se rechazan", () => {
    const urls = [...Array.from({ length: 10 }, (_, i) => `https://tienda.example/p/${i}`), "https://tienda.example/p/0"];
    expect(validateForm({ ...ok, urls }).urlsGeneral).toBeDefined();
  });

  it("AC4: 0 URLs (o solo filas vacías) se rechazan", () => {
    expect(validateForm({ ...ok, urls: ["", "  "] }).urlsGeneral).toBeDefined();
  });

  it("AC5: repetidas tras normalizar avisan y se envía la primera, en orden", () => {
    const values = {
      ...ok,
      urls: ["https://B.example/x/", "https://a.example/y", "HTTPS://b.example/x#frag"],
    };
    const errors = validateForm(values);
    expect(errors.urlWarnings[2]).toBeDefined();
    expect(hasErrors(errors)).toBe(false);
    expect(buildRequest(values).urls).toEqual(["https://B.example/x/", "https://a.example/y"]);
  });

  it("no quita parámetros de consulta al comparar (decisión 2026-11-24)", () => {
    expect(normalizeUrl("https://a.example/p?id=1")).not.toBe(normalizeUrl("https://a.example/p?id=2"));
    expect(normalizeUrl("HTTP://A.Example/p/#x")).toBe("http://a.example/p");
  });

  it("rechaza esquemas que no son http(s), texto suelto y URLs de más de 2048", () => {
    const bad = ["ftp://a.example/x", "no es una url", `https://a.example/${"a".repeat(MAX_URL_LENGTH)}`];
    bad.forEach((u) => expect(validateForm({ ...ok, urls: [u] }).urls[0]).toBeDefined());
  });

  it("acepta URLs con unicode y con espacios alrededor", () => {
    expect(hasErrors(validateForm({ ...ok, urls: ["  https://tienda.example/camión  "] }))).toBe(false);
  });

  it("AC8: lista de correos vacía, formato inválido o enorme se rechazan", () => {
    expect(validateForm({ ...ok, emails: [""] }).emailsGeneral).toBeDefined();
    expect(validateForm({ ...ok, emails: ["sin-arroba"] }).emails[0]).toBeDefined();
    const huge = `${"a".repeat(MAX_EMAIL_LENGTH)}@correo.com`;
    expect(validateForm({ ...ok, emails: [huge] }).emails[0]).toBeDefined();
  });

  it("AC9: el correo se normaliza (trim, NFC, minúsculas)", () => {
    expect(normalizeEmail("  Ana@Correo.COM ")).toBe("ana@correo.com");
    expect(normalizeEmail("café@x.com")).toBe("café@x.com");
  });

  it("AC10: 3 correos distintos son válidos", () => {
    const emails = ["a@x.com", "b@x.com", "c@x.com"];
    expect(hasErrors(validateForm({ ...ok, emails }))).toBe(false);
    expect(buildRequest({ ...ok, emails }).emails).toHaveLength(3);
  });

  it("AC11: correos repetidos tras normalizar avisan y se envía uno", () => {
    const values = { ...ok, emails: ["Ana@x.com", " ana@X.com"] };
    expect(validateForm(values).emailWarnings[1]).toBeDefined();
    expect(buildRequest(values).emails).toEqual(["ana@x.com"]);
  });

  it("AC12 (tope sobre la lista cruda): 6 correos con un repetido se rechazan", () => {
    const emails = ["a@x.com", "A@x.com", "b@x.com", "c@x.com", "d@x.com", "e@x.com"];
    expect(validateForm({ ...ok, emails }).emailsGeneral).toBeDefined();
  });

  it("AC12: 6 correos distintos se rechazan", () => {
    const emails = Array.from({ length: 6 }, (_, i) => `u${i}@x.com`);
    expect(validateForm({ ...ok, emails }).emailsGeneral).toBeDefined();
  });

  it("AC13/AC14: nota de 500 pasa y de 501 se rechaza; sin nota no se envía el campo", () => {
    expect(validateForm({ ...ok, notes: "n".repeat(MAX_NOTES) }).notes).toBeUndefined();
    expect(validateForm({ ...ok, notes: "n".repeat(MAX_NOTES + 1) }).notes).toBeDefined();
    expect("notes" in buildRequest(ok)).toBe(false);
  });
});

describe("US-02-05-AC1 enmascarado", () => {
  it("a***@dominio.com", () => {
    expect(maskEmail("Ana@Correo.com")).toBe("a***@correo.com");
    expect(maskEmail("😀x@y.com")).toBe("😀***@y.com");
    expect(maskEmail("sin-arroba")).toBe("");
  });
});
