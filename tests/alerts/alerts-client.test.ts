// Requiere Vitest (propuesto, no instalado). Contrato de POST /api/alerts (ver supuestos en alerts-client.ts).
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, createAlert } from "@/features/alerts/api/alerts-client";

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const request = { urls: ["https://a.example/p"], emails: ["ana@correo.com"] };

afterEach(() => vi.unstubAllGlobals());

describe("createAlert", () => {
  it("201: devuelve {id, status, urls, created_at} y envía JSON por POST", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(201, { id: 1, status: "active", urls: ["https://a.example/p"], created_at: "t" }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(createAlert(request)).resolves.toMatchObject({ id: 1, status: "active" });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toMatch(/\/api\/alerts$/);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual(request);
  });

  it("422 con details[]: ApiError con código, campo, índice y texto del servidor; sin copiar datos al mensaje", async () => {
    const body = {
      error: {
        code: "validation_error",
        message: "Datos inválidos",
        details: [{ field: "urls", index: 1, code: "url_scheme_not_allowed", message: "x" }, { field: "notes", code: "notes_too_long" }, { bad: true }],
      },
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(422, body)));
    const error = await createAlert(request).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: "validation", status: 422, code: "validation_error", serverMessage: "Datos inválidos" });
    expect((error as ApiError).details).toEqual([
      { field: "urls", index: 1, code: "url_scheme_not_allowed" },
      { field: "notes", index: null, code: "notes_too_long" },
    ]);
    expect((error as Error).message).not.toContain("ana@correo.com");
  });

  it("413 payload_too_large: validation con ese código", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(413, { error: { code: "payload_too_large", message: "m", details: [] } })));
    await expect(createAlert(request)).rejects.toMatchObject({ status: 413, code: "payload_too_large" });
  });

  it("modo keyword: 422 mode_not_available", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(422, { error: { code: "mode_not_available", message: "m", details: [] } })));
    await expect(createAlert(request)).rejects.toMatchObject({ code: "mode_not_available", details: [] });
  });

  it("500 sin JSON: ApiError server", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("boom", { status: 500 })));
    await expect(createAlert(request)).rejects.toMatchObject({ kind: "server", status: 500 });
  });

  it("fetch que falla: ApiError network", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("failed")));
    await expect(createAlert(request)).rejects.toMatchObject({ kind: "network" });
  });
});
