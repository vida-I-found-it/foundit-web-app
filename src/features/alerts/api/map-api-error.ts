import { alertMessages as t } from "../messages";
import type { BuiltRequest, FormErrors } from "../model";
import { ApiError } from "./alerts-client";

const known = (code: string | null) => (code && t.errors.byCode[code]) || null;

export interface MappedError {
  banner: string;
  errors: FormErrors;
}

/** Traduce el error del cliente a texto propio por `code` y a errores por fila del formulario. */
export function mapApiError(error: unknown, sent: BuiltRequest): MappedError {
  const errors: FormErrors = { urls: [], emails: [], urlWarnings: [], emailWarnings: [] };
  if (!(error instanceof ApiError)) return { banner: t.errors.server, errors };
  if (error.kind === "network") return { banner: t.errors.network, errors };

  for (const d of error.details) {
    const text = known(d.code) ?? t.errors.validation;
    const list = d.field === "urls" ? errors.urls : d.field === "emails" ? errors.emails : null;
    const rows = d.field === "urls" ? sent.urlRows : sent.emailRows;
    if (list && d.index !== null) {
      const row = rows[d.index];
      if (row !== undefined) list[row] = text;
    } else if (d.field === "urls") errors.urlsGeneral = text;
    else if (d.field === "emails") errors.emailsGeneral = text;
    else if (d.field === "notes") errors.notes = text;
  }

  const banner =
    known(error.code) ??
    // Código desconocido: se usa el texto fijo del servidor, que no lleva datos del usuario.
    error.serverMessage ??
    (error.kind === "server" ? t.errors.server : t.errors.validation);
  return { banner, errors };
}
