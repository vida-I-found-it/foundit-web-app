// US-07-06 (frontend) AC15 a AC24. Se simula `fetch` (la forma HTTP real del cliente tipado).
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Board } from "@/app/board";
import { AlertLookupPage } from "@/features/alerts";
import { CreateAlertPage } from "@/features/alerts";

const detail = (over: Record<string, unknown> = {}) => ({
  id: 7,
  status: "active",
  urls: [{ id: 1, url: "https://tienda-a.example/p/1", domain: "tienda-a.example" }],
  subscriptions: [
    { email_masked: "a***@correo.com", status: "active" },
    { email_masked: "a***@correo.com", status: "unsubscribed" },
  ],
  created_at: "2026-03-04T10:30:00Z",
  ...over,
});

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const errorBody = (code: string) => ({ error: { code, message: "x", details: [] } });

const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  window.location.hash = "";
});
afterEach(() => vi.unstubAllGlobals());

describe("US-07-06-AC15 entrada «Alertas» del board", () => {
  it("está activa (enlace) y abre una vista donde se escribe un número", async () => {
    render(<Board path="/alerts" />);
    const link = screen.getByRole("link", { name: "Alertas" });
    expect(link).toHaveAttribute("href", "#/board/alerts");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(await screen.findByLabelText("Número de alerta")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("al enviar un número navega a la ruta con ese número; vacío muestra un aviso", async () => {
    const user = userEvent.setup();
    render(<AlertLookupPage />);
    await user.click(screen.getByRole("button", { name: "Consultar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Escribe el número de la alerta.");
    expect(screen.getByLabelText("Número de alerta")).toHaveAttribute("aria-invalid", "true");
    await user.type(screen.getByLabelText("Número de alerta"), "42{Enter}");
    expect(window.location.hash).toBe("#/board/alerts/42");
  });
});

describe("US-07-06-AC16 «Ver alerta» desde la pantalla de éxito", () => {
  it("enlaza al detalle con el número real devuelto", async () => {
    const user = userEvent.setup();
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute("open");
    };
    fetchMock.mockResolvedValueOnce(json(201, { id: 123, status: "active", urls: ["https://tienda-a.example/p/1"], created_at: "2026-03-04T10:30:00Z" }));
    render(<CreateAlertPage />);
    await user.type(screen.getByLabelText("Página 1"), "https://tienda-a.example/p/1");
    await user.type(screen.getByLabelText("Correo 1"), "ana@correo.com");
    await user.click(screen.getByRole("button", { name: "Guardar alerta" }));
    await user.click(await screen.findByRole("button", { name: "Crear alerta" }));
    const link = await screen.findByRole("link", { name: "Ver alerta" });
    expect(link).toHaveAttribute("href", "#/board/alerts/123");
  });
});

describe("US-07-06-AC17 cargando", () => {
  it("muestra un estado de carga visible y ningún dato", async () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    render(<AlertLookupPage param="7" />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando la alerta…");
    expect(screen.queryByRole("heading", { name: /Alerta 7/ })).not.toBeInTheDocument();
  });
});

describe("US-07-06-AC18 / AC23 datos desde la API", () => {
  it("pide GET /api/alerts/{id} y muestra número, estado, páginas, correos enmascarados y fecha", async () => {
    fetchMock.mockImplementation(async () => json(200, detail()));
    render(<AlertLookupPage param="7" />);
    expect(await screen.findByRole("heading", { name: "Alerta 7" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/alerts/7");
    expect(screen.getByText("Activa", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("tienda-a.example")).toBeInTheDocument();
    expect(screen.getByText("https://tienda-a.example/p/1")).toBeInTheDocument();
    // Dos correos con la misma inicial y dominio: dos entradas, cada una con su estado.
    expect(screen.getAllByText("a***@correo.com")).toHaveLength(2);
    expect(screen.getByText("Dada de baja")).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alerta 7" })).toHaveFocus();
  });

  it("un nuevo montaje (recarga) vuelve a pedir a la API", async () => {
    fetchMock.mockImplementation(async () => json(200, detail()));
    const first = render(<AlertLookupPage param="7" />);
    await screen.findByRole("heading", { name: "Alerta 7" });
    first.unmount();
    render(<AlertLookupPage param="7" />);
    await screen.findByRole("heading", { name: "Alerta 7" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("el Board entrega a la vista el número de la ruta", async () => {
    fetchMock.mockImplementation(async () => json(200, detail({ id: 55 })));
    render(<Board path="/alerts/55" />);
    expect(await screen.findByRole("heading", { name: "Alerta 55" })).toBeInTheDocument();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/alerts/55");
  });

  it("listas vacías: avisos en lugar de error", async () => {
    fetchMock.mockImplementation(async () => json(200, detail({ urls: [], subscriptions: [] })));
    render(<AlertLookupPage param="7" />);
    expect(await screen.findByText("Esta alerta no tiene páginas activas.")).toBeInTheDocument();
    expect(screen.getByText("Esta alerta no tiene correos.")).toBeInTheDocument();
  });
});

describe("US-07-06-AC19 no existe", () => {
  it("muestra «La alerta no existe.» como alerta anunciada y enfocada", async () => {
    fetchMock.mockImplementation(async () => json(404, errorBody("alert_not_found")));
    render(<AlertLookupPage param="999" />);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("La alerta no existe.");
    expect(alert).toHaveFocus();
  });
});

describe("US-07-06-AC20 número inválido", () => {
  it("el 422 muestra un aviso de número inválido", async () => {
    fetchMock.mockImplementation(async () => json(422, errorBody("validation_error")));
    render(<AlertLookupPage param="abc" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("El número no es válido");
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/alerts/abc");
  });
});

describe("US-07-06-AC21 sin conexión", () => {
  it.each([
    ["fetch falla", () => fetchMock.mockRejectedValue(new TypeError("down"))],
    ["5xx", () => fetchMock.mockImplementation(async () => json(503, {}))],
  ])("%s: muestra aviso y reintentar vuelve a pedir", async (_n, arrange) => {
    arrange();
    const user = userEvent.setup();
    render(<AlertLookupPage param="7" />);
    const retry = await screen.findByRole("button", { name: "Reintentar" });
    expect(screen.queryByRole("heading", { name: "Alerta 7" })).not.toBeInTheDocument();
    fetchMock.mockImplementation(async () => json(200, detail()));
    await user.click(retry);
    expect(await screen.findByRole("heading", { name: "Alerta 7" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("timeout: se trata como sin conexión", async () => {
    vi.useFakeTimers();
    try {
      fetchMock.mockImplementation(
        (_u, init) => new Promise((_res, rej) => init?.signal?.addEventListener("abort", () => rej(new DOMException("a", "AbortError")))),
      );
      render(<AlertLookupPage param="7" />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10_001);
      });
      expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("US-07-06-AC22 cambiar de alerta no deja ver datos anteriores", () => {
  it("mientras B carga, no existe o falla no se ve nada de A", async () => {
    fetchMock.mockResolvedValueOnce(json(200, detail({ id: 1, urls: [{ id: 1, url: "https://a.example/x", domain: "a.example" }] })));
    const view = render(<AlertLookupPage param="1" />);
    expect(await screen.findByText("a.example")).toBeInTheDocument();

    fetchMock.mockReturnValueOnce(new Promise(() => {}));
    view.rerender(<AlertLookupPage param="2" />);
    expect(screen.queryByText("a.example")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Alerta 1" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();

    fetchMock.mockResolvedValueOnce(json(404, errorBody("alert_not_found")));
    view.rerender(<AlertLookupPage param="3" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("La alerta no existe.");
    expect(screen.queryByText("a.example")).not.toBeInTheDocument();

    fetchMock.mockRejectedValueOnce(new TypeError("down"));
    view.rerender(<AlertLookupPage param="4" />);
    await screen.findByRole("button", { name: "Reintentar" });
    expect(screen.queryByText("a.example")).not.toBeInTheDocument();
  });

  it("dos consultas casi a la vez: solo la última define lo que se ve", async () => {
    let resolveA!: (r: Response) => void;
    fetchMock.mockReturnValueOnce(new Promise((r) => (resolveA = r)));
    const view = render(<AlertLookupPage param="1" />);
    fetchMock.mockResolvedValueOnce(json(200, detail({ id: 2 })));
    view.rerender(<AlertLookupPage param="2" />);
    expect(await screen.findByRole("heading", { name: "Alerta 2" })).toBeInTheDocument();
    resolveA(json(200, detail({ id: 1 })));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Alerta 1" })).not.toBeInTheDocument());
  });
});

describe("US-07-06-AC24 texto, no HTML", () => {
  it("dominio, URL y correo enmascarado con forma de HTML o unicode se muestran tal cual", async () => {
    fetchMock.mockResolvedValue(
      json(
        200,
        detail({
          urls: [{ id: 1, url: "https://ñandú.example/<b>x</b>", domain: "<b>x</b>.example" }],
          subscriptions: [{ email_masked: "<i>é</i>***@día.com", status: "active" }],
        }),
      ),
    );
    const { container } = render(<AlertLookupPage param="7" />);
    expect(await screen.findByText("<b>x</b>.example")).toBeInTheDocument();
    expect(screen.getByText("https://ñandú.example/<b>x</b>")).toBeInTheDocument();
    expect(screen.getByText("<i>é</i>***@día.com")).toBeInTheDocument();
    expect(container.querySelector("b, i")).toBeNull();
  });
});
