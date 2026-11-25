/**
 * Único módulo que conoce la forma HTTP de `POST /api/alerts`. Si core-service ajusta el cuerpo o
 * el formato de error, el cambio queda aquí.
 *
 * 💡 propuesta, sin aprobar (contrato entregado por core-service, pendiente de aprobación del usuario):
 *   petición: { mode?: "url", urls: string[], emails: string[], notes?: string }; campo desconocido => 422
 *   201: { id, status, urls: string[] (normalizadas, sin duplicados, en orden), created_at }
 *   error (422, 413, 500): { error: { code, message, details: [{ field, index?, code, message }] } }
 *     `index` es base 0 y solo aparece en errores de un elemento de lista (urls / emails).
 */
import type { AlertMode } from "../model";

export interface CreateAlertRequest {
  mode?: AlertMode;
  urls: string[];
  emails: string[];
  notes?: string;
}

/** Nunca trae el correo en claro. */
export interface CreatedAlert {
  id: number | string;
  status: string;
  urls: string[];
  created_at: string;
}

export type ApiErrorKind = "validation" | "network" | "server";
export type DetailField = "urls" | "emails" | "notes" | "mode" | "body";

export interface ApiErrorDetail {
  field: DetailField | string;
  /** Posición base 0 dentro de la lista enviada (urls o emails), si aplica. */
  index: number | null;
  code: string;
}

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    readonly status: number | null,
    readonly code: string | null,
    readonly details: ApiErrorDetail[] = [],
    /** Texto fijo del servidor: solo se muestra si el `code` no se conoce en messages.ts. */
    readonly serverMessage: string | null = null,
  ) {
    // Mensaje fijo: nunca se copia al error texto del servidor ni datos del usuario (RNF-4).
    super(`create alert failed: ${kind}${status ? ` ${status}` : ""}`);
    this.name = "ApiError";
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function readError(body: unknown): { code: string | null; message: string | null; details: ApiErrorDetail[] } {
  const error = asRecord(asRecord(body)?.error);
  if (!error) return { code: null, message: null, details: [] };
  const details = Array.isArray(error.details)
    ? error.details.flatMap((raw): ApiErrorDetail[] => {
        const d = asRecord(raw);
        if (!d || typeof d.code !== "string" || typeof d.field !== "string") return [];
        const index = typeof d.index === "number" && Number.isInteger(d.index) ? d.index : null;
        return [{ field: d.field, index, code: d.code }];
      })
    : [];
  return {
    code: typeof error.code === "string" ? error.code : null,
    message: typeof error.message === "string" ? error.message : null,
    details,
  };
}

export async function createAlert(request: CreateAlertRequest, signal?: AbortSignal): Promise<CreatedAlert> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(request),
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiError("network", null, null);
  }

  if (response.status === 201) return (await response.json()) as CreatedAlert;

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    /* cuerpo vacío o no JSON: se trata como error genérico */
  }
  const { code, message, details } = readError(body);
  const kind: ApiErrorKind = response.status >= 400 && response.status < 500 ? "validation" : "server";
  throw new ApiError(kind, response.status, code, details, message);
}
