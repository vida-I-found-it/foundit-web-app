import { alertMessages as t } from "./messages";

// Largos de DEC-20 y topes de ALE-2 / SUB-1 / US-02-01-AC14. El backend es la autoridad: aquí solo UX.
export const MAX_URLS = 10;
export const MAX_EMAILS = 5;
export const MAX_NOTES = 500;
export const MAX_URL_LENGTH = 2048;
export const MAX_EMAIL_LENGTH = 254;

export type AlertMode = "url" | "keyword";

export interface AlertFormValues {
  urls: string[];
  emails: string[];
  notes: string;
}

export interface FormErrors {
  /** Error por posición en la lista de entradas del formulario (incluye filas vacías). */
  urls: (string | undefined)[];
  emails: (string | undefined)[];
  /** Avisos que no bloquean: el servidor guarda una sola de las repetidas (AC5, AC11). */
  urlWarnings: (string | undefined)[];
  emailWarnings: (string | undefined)[];
  urlsGeneral?: string;
  emailsGeneral?: string;
  notes?: string;
}

/**
 * Misma regla que el backend (decisión del 2026-11-24): esquema y host en minúsculas, sin fragmento
 * y sin "/" final; NO se quitan parámetros de consulta. Devuelve null si no es una URL http(s).
 * Solo se usa para avisar de repetidas: al servidor se envía la URL escrita.
 */
export function normalizeUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const path = url.pathname.replace(/\/+$/, "");
  return `${url.protocol}//${url.host}${path}${url.search}`;
}

/** trim, NFC y minúsculas (US-02-01-AC9). */
export function normalizeEmail(raw: string): string {
  return raw.trim().normalize("NFC").toLowerCase();
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Enmascarado `a***@dominio.com` (decisión del 2026-11-24, RNF-4). Cadena vacía si no hay arroba. */
export function maskEmail(raw: string): string {
  const email = normalizeEmail(raw);
  const at = email.lastIndexOf("@");
  if (at < 1) return "";
  const first = Array.from(email.slice(0, at))[0];
  return `${first}***${email.slice(at)}`;
}

/** Quita filas vacías y conserva la primera aparición de cada repetida, en el orden escrito. */
export function dedupeBy(values: string[], key: (v: string) => string | null): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const value = raw.trim();
    if (!value) continue;
    const k = key(value) ?? value;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(value);
  }
  return out;
}

export function validateForm(values: AlertFormValues): FormErrors {
  const errors: FormErrors = { urls: [], emails: [], urlWarnings: [], emailWarnings: [] };

  const seenUrls = new Map<string, number>();
  let urlCount = 0;
  values.urls.forEach((raw, i) => {
    const value = raw.trim();
    if (!value) return;
    urlCount += 1;
    const norm = normalizeUrl(value);
    if (norm === null) errors.urls[i] = t.errors.urlInvalid;
    else if (value.length > MAX_URL_LENGTH) errors.urls[i] = t.errors.urlTooLong(MAX_URL_LENGTH);
    else if (seenUrls.has(norm)) errors.urlWarnings[i] = t.errors.urlDuplicate(seenUrls.get(norm)! + 1);
    else seenUrls.set(norm, i);
  });
  if (urlCount === 0) errors.urlsGeneral = t.errors.urlsRequired;
  else if (urlCount > MAX_URLS) errors.urlsGeneral = t.errors.urlsTooMany(MAX_URLS);

  const seenEmails = new Map<string, number>();
  let emailCount = 0;
  values.emails.forEach((raw, i) => {
    const value = raw.trim();
    if (!value) return;
    emailCount += 1;
    const norm = normalizeEmail(value);
    if (norm.length > MAX_EMAIL_LENGTH) errors.emails[i] = t.errors.emailTooLong(MAX_EMAIL_LENGTH);
    else if (!EMAIL_SHAPE.test(norm)) errors.emails[i] = t.errors.emailInvalid;
    else if (seenEmails.has(norm)) errors.emailWarnings[i] = t.errors.emailDuplicate(seenEmails.get(norm)! + 1);
    else seenEmails.set(norm, i);
  });
  if (emailCount === 0) errors.emailsGeneral = t.errors.emailsRequired;
  else if (emailCount > MAX_EMAILS) errors.emailsGeneral = t.errors.emailsTooMany(MAX_EMAILS);

  if (values.notes.length > MAX_NOTES) errors.notes = t.errors.notesTooLong(MAX_NOTES);
  return errors;
}

export function hasErrors(e: FormErrors): boolean {
  return Boolean(e.urlsGeneral || e.emailsGeneral || e.notes || e.urls.some(Boolean) || e.emails.some(Boolean));
}

export interface BuiltRequest {
  urls: string[];
  emails: string[];
  notes?: string;
  /** Posición en el formulario de cada URL / correo enviado: traduce el `index` de un 422 a su fila. */
  urlRows: number[];
  emailRows: number[];
}

/** Arma lo que se envía: sin filas vacías, sin repetidas (primera aparición, orden escrito). */
export function buildRequest(values: AlertFormValues): BuiltRequest {
  const seenUrls = new Set<string>();
  const urls: string[] = [];
  const urlRows: number[] = [];
  values.urls.forEach((raw, i) => {
    const value = raw.trim();
    if (!value) return;
    const key = normalizeUrl(value) ?? value;
    if (seenUrls.has(key)) return;
    seenUrls.add(key);
    urls.push(value);
    urlRows.push(i);
  });
  const seenEmails = new Set<string>();
  const emails: string[] = [];
  const emailRows: number[] = [];
  values.emails.forEach((raw, i) => {
    const value = normalizeEmail(raw);
    if (!value || seenEmails.has(value)) return;
    seenEmails.add(value);
    emails.push(value);
    emailRows.push(i);
  });
  const notes = values.notes.trim();
  return { urls, emails, urlRows, emailRows, ...(notes ? { notes } : {}) };
}
