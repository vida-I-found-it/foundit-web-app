/**
 * Único módulo que conoce la forma HTTP de `GET /api/alerts/{alert_id}` (US-07-06).
 * La respuesta nunca trae el correo completo: solo `email_masked`. Todo se trata como dato no
 * confiable: se valida la forma y los textos se pintan siempre como texto.
 */
export type SubscriptionStatus = "active" | "unsubscribed";

export interface AlertDetail {
  id: number;
  status: "active" | "inactive";
  urls: { id: number; url: string; domain: string }[];
  subscriptions: { emailMasked: string; status: SubscriptionStatus }[];
  createdAt: string;
}

/** not_found = 404, invalid = 422, network = sin respuesta o timeout, server = 5xx o cuerpo inesperado. */
export type AlertLookupErrorKind = "not_found" | "invalid" | "network" | "server";

export class AlertLookupError extends Error {
  constructor(readonly kind: AlertLookupErrorKind) {
    // Mensaje fijo: nunca se copia texto del servidor ni el número consultado a los registros.
    super(`get alert failed: ${kind}`);
    this.name = "AlertLookupError";
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
export const LOOKUP_TIMEOUT_MS = 10_000;

const rec = (v: unknown): Record<string, unknown> | null =>
  typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;

function parseDetail(body: unknown): AlertDetail | null {
  const b = rec(body);
  if (!b || typeof b.id !== "number" || typeof b.created_at !== "string") return null;
  if (b.status !== "active" && b.status !== "inactive") return null;
  if (!Array.isArray(b.urls) || !Array.isArray(b.subscriptions)) return null;
  const urls: AlertDetail["urls"] = [];
  for (const raw of b.urls) {
    const u = rec(raw);
    if (!u || typeof u.id !== "number" || typeof u.url !== "string" || typeof u.domain !== "string") return null;
    urls.push({ id: u.id, url: u.url, domain: u.domain });
  }
  const subscriptions: AlertDetail["subscriptions"] = [];
  for (const raw of b.subscriptions) {
    const s = rec(raw);
    if (!s || typeof s.email_masked !== "string" || (s.status !== "active" && s.status !== "unsubscribed")) return null;
    subscriptions.push({ emailMasked: s.email_masked, status: s.status });
  }
  return { id: b.id, status: b.status, urls, subscriptions, createdAt: b.created_at };
}

export async function getAlert(alertId: string, signal?: AbortSignal): Promise<AlertDetail> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), LOOKUP_TIMEOUT_MS);
  const onAbort = () => timeout.abort();
  signal?.addEventListener("abort", onAbort);
  try {
    let response: Response;
    try {
      response = await fetch(`${baseUrl}/api/alerts/${encodeURIComponent(alertId)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: timeout.signal,
      });
    } catch (cause) {
      // Cancelación pedida por quien llama: se propaga; un timeout propio cuenta como «sin conexión».
      if (signal?.aborted) throw cause;
      throw new AlertLookupError("network");
    }
    if (response.status === 404) throw new AlertLookupError("not_found");
    if (response.status === 422) throw new AlertLookupError("invalid");
    if (!response.ok) throw new AlertLookupError("server");
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new AlertLookupError("server");
    }
    const detail = parseDetail(body);
    if (!detail) throw new AlertLookupError("server");
    return detail;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}
