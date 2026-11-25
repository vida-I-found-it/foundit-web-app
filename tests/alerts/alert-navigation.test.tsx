// Navegar por hash entre varios números sin recargar: un solo formulario, input = ruta, sin datos viejos.
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/app/App";

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const detail = (id: number) => ({
  id,
  status: "active",
  urls: [{ id: 1, url: `https://tienda-${id}.example/p`, domain: `tienda-${id}.example` }],
  subscriptions: [],
  created_at: "2026-03-04T10:30:00Z",
});
const fetchMock = vi.fn<typeof fetch>();

async function go(hash: string) {
  await act(async () => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
}
const forms = () => document.querySelectorAll("main form");
const input = () => screen.getByLabelText("Número de alerta") as HTMLInputElement;

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (url) => {
    const id = String(url).split("/").pop();
    if (id === "1001") return json(200, detail(1001));
    if (id === "500") return json(200, detail(500));
    if (id === "abc") return json(422, { error: { code: "validation_error", message: "x", details: [] } });
    return json(404, { error: { code: "alert_not_found", message: "x", details: [] } });
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  window.location.hash = "";
});

describe("US-07-06 navegación por hash entre alertas sin recargar", () => {
  it("mantiene un solo formulario, el input igual a la ruta y nada de la alerta anterior", async () => {
    window.location.hash = "#/board/alerts/1001";
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Alerta 1001" })).toBeInTheDocument();
    expect(forms()).toHaveLength(1);
    expect(input().value).toBe("1001");

    await go("#/board/alerts/999999");
    expect(await screen.findByText("La alerta no existe.")).toBeInTheDocument();
    expect(forms()).toHaveLength(1);
    expect(input().value).toBe("999999");
    expect(screen.queryByText("tienda-1001.example")).not.toBeInTheDocument();

    await go("#/board/alerts/abc");
    expect(await screen.findByText(/El número no es válido/)).toBeInTheDocument();
    expect(forms()).toHaveLength(1);
    expect(input().value).toBe("abc");

    await go("#/board/alerts/500");
    expect(await screen.findByRole("heading", { name: "Alerta 500" })).toBeInTheDocument();
    expect(forms()).toHaveLength(1);
    expect(input().value).toBe("500");
    expect(screen.queryByText("tienda-1001.example")).not.toBeInTheDocument();
  });
});
