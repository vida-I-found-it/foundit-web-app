// Requiere Vitest (propuesto, no instalado). Traducción de errores del servidor a texto propio y filas.
import { describe, expect, it } from "vitest";
import { ApiError } from "@/features/alerts/api/alerts-client";
import { mapApiError } from "@/features/alerts/api/map-api-error";
import { buildRequest } from "@/features/alerts/model";

const sent = buildRequest({
  urls: ["https://a.example/1", "", "https://b.example/2"],
  emails: ["a@x.com", "", "b@x.com"],
  notes: "",
});

describe("mapApiError", () => {
  it("lleva details[].index de la lista enviada a la fila del formulario (urls y emails)", () => {
    const error = new ApiError("validation", 422, "validation_error", [
      { field: "urls", index: 1, code: "url_port_not_allowed" },
      { field: "emails", index: 1, code: "email_invalid" },
    ]);
    const { errors } = mapApiError(error, sent);
    expect(errors.urls[2]).toMatch(/puertos 80 y 443/);
    expect(errors.emails[2]).toMatch(/correo válido/);
    expect(errors.urls[1]).toBeUndefined();
  });

  it("usa el texto propio por código y el message del servidor solo si el código es desconocido", () => {
    expect(mapApiError(new ApiError("validation", 422, "mode_not_available", [], "otro"), sent).banner).toMatch(/URL directa/);
    expect(mapApiError(new ApiError("validation", 422, "codigo_nuevo", [], "Texto del servidor"), sent).banner).toBe("Texto del servidor");
  });

  it("errores de campo sin índice (notes) y red", () => {
    const e = new ApiError("validation", 422, "validation_error", [{ field: "notes", index: null, code: "notes_too_long" }]);
    expect(mapApiError(e, sent).errors.notes).toMatch(/500/);
    expect(mapApiError(new ApiError("network", null, null), sent).banner).toMatch(/conectar/);
  });
});
