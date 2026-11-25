// Vitest + Testing Library + jsdom. Se consulta por rol y etiqueta.
// Red simulada con vi.mock del cliente tipado (un solo módulo); con MSW se interceptaría fetch.
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, createAlert } from "@/features/alerts/api/alerts-client";
import { CreateAlertPage } from "@/features/alerts";

vi.mock("@/features/alerts/api/alerts-client", async (original) => ({
  ...(await original<typeof import("@/features/alerts/api/alerts-client")>()),
  createAlert: vi.fn(),
}));
const createAlertMock = vi.mocked(createAlert);

beforeAll(() => {
  // jsdom no implementa <dialog>.showModal(): se emula lo mínimo (open + close).
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});

// Con llaves: un beforeEach que devuelve una función la usa como limpieza (vitest llamaría al mock tras el test).
beforeEach(() => {
  createAlertMock.mockReset();
});

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Página 1"), "https://tienda-a.example/p/1");
  await user.type(screen.getByLabelText("Correo 1"), "ana@correo.com");
}

describe("US-02-04-AC1 selector de modo", () => {
  it("«URL directa» activo y «Palabra clave» deshabilitado con «Próximamente»", () => {
    render(<CreateAlertPage />);
    expect(screen.getByRole("button", { name: /URL directa/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Palabra clave/ })).toBeDisabled();
    expect(screen.getByText("Próximamente")).toBeInTheDocument();
  });
});

describe("validación visible (US-02-01-AC3, AC4, AC8, AC12, AC14)", () => {
  it("0 URLs: muestra el error, lo anuncia y no abre el modal", async () => {
    const user = userEvent.setup();
    render(<CreateAlertPage />);
    await user.click(screen.getByRole("button", { name: "Guardar alerta" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Revisa los campos");
    expect(screen.getByText("Agrega al menos una página del producto.")).toBeVisible();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(createAlertMock).not.toHaveBeenCalled();
  });

  it("correo inválido: el campo queda aria-invalid y asociado a su mensaje", async () => {
    const user = userEvent.setup();
    render(<CreateAlertPage />);
    await user.type(screen.getByLabelText("Página 1"), "https://tienda-a.example/p/1");
    await user.type(screen.getByLabelText("Correo 1"), "no-es-correo");
    await user.click(screen.getByRole("button", { name: "Guardar alerta" }));
    const field = screen.getByLabelText("Correo 1");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(/correo válido/);
  });

  it("no permite agregar más de 10 páginas ni más de 5 correos", async () => {
    const user = userEvent.setup();
    render(<CreateAlertPage />);
    for (let i = 0; i < 12; i++) {
      screen.queryByRole("button", { name: "Agregar otra página" }) &&
        (await user.click(screen.getByRole("button", { name: "Agregar otra página" })));
    }
    expect(screen.getAllByLabelText(/^Página \d+$/)).toHaveLength(10);
    for (let i = 0; i < 6; i++) {
      screen.queryByRole("button", { name: "Agregar otro correo" }) &&
        (await user.click(screen.getByRole("button", { name: "Agregar otro correo" })));
    }
    expect(screen.getAllByLabelText(/^Correo \d+$/)).toHaveLength(5);
  });

  it("nota de más de 500 caracteres: error visible", async () => {
    const user = userEvent.setup();
    render(<CreateAlertPage />);
    await fillValid(user);
    await user.click(screen.getByLabelText("Nota (opcional)"));
    await user.paste("n".repeat(501));
    await user.click(screen.getByRole("button", { name: "Guardar alerta" }));
    expect(screen.getByText("La nota supera 500 caracteres.")).toBeVisible();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});

describe("US-02-03 confirmación", () => {
  it("AC1: «Guardar» abre el modal con el correo enmascarado, sin enviar nada", async () => {
    const user = userEvent.setup();
    render(<CreateAlertPage />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Guardar alerta" }));
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent("Es definitiva");
    expect(dialog).toHaveTextContent("a***@correo.com");
    expect(dialog).not.toHaveTextContent("ana@correo.com");
    expect(createAlertMock).not.toHaveBeenCalled();
  });

  it("AC2: «Volver a editar» cierra el modal y no envía nada", async () => {
    const user = userEvent.setup();
    render(<CreateAlertPage />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Guardar alerta" }));
    await user.click(screen.getByRole("button", { name: "Volver a editar" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(createAlertMock).not.toHaveBeenCalled();
  });

  it("AC2 (borde): Escape cierra el modal sin enviar", async () => {
    const user = userEvent.setup();
    render(<CreateAlertPage />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Guardar alerta" }));
    // jsdom no dispara 'cancel' con Escape: se emite el evento que lanza el navegador.
    screen.getByRole("alertdialog").dispatchEvent(new Event("cancel", { cancelable: true }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(createAlertMock).not.toHaveBeenCalled();
  });

  it("AC3: doble clic en «Crear alerta» hace una sola petición y deshabilita el botón", async () => {
    const user = userEvent.setup();
    let resolve!: (v: Awaited<ReturnType<typeof createAlert>>) => void;
    createAlertMock.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<CreateAlertPage />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Guardar alerta" }));
    const confirm = within(screen.getByRole("alertdialog")).getByRole("button", { name: "Crear alerta" });
    await user.dblClick(confirm);
    expect(createAlertMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Creando…" })).toBeDisabled();
    resolve({ id: "a1", status: "active", urls: [{}], created_at: "2026-11-24T00:00:00Z" });
    await screen.findByRole("heading", { name: "Alerta creada" });
  });
});

describe("US-02-01-AC1 / AC5 envío y éxito", () => {
  it("envía URLs sin repetidas y correo normalizado; el éxito muestra solo el correo enmascarado (US-02-05-AC1)", async () => {
    const user = userEvent.setup();
    createAlertMock.mockResolvedValue({ id: "a1", status: "active", urls: [{}], created_at: "2026-11-24T00:00:00Z" });
    render(<CreateAlertPage />);
    await user.type(screen.getByLabelText("Página 1"), "https://Tienda-A.example/p/1/");
    await user.click(screen.getByRole("button", { name: "Agregar otra página" }));
    await user.type(screen.getByLabelText("Página 2"), "https://tienda-a.example/p/1#x");
    await user.type(screen.getByLabelText("Correo 1"), " Ana@Correo.com ");
    await user.click(screen.getByRole("button", { name: "Guardar alerta" }));
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Crear alerta" }));
    const heading = await screen.findByRole("heading", { name: "Alerta creada" });
    expect(createAlertMock).toHaveBeenCalledWith({
      mode: "url",
      urls: ["https://Tienda-A.example/p/1/"],
      emails: ["ana@correo.com"],
      notes: undefined,
    });
    expect(heading).toHaveFocus();
    expect(document.body).toHaveTextContent("a***@correo.com");
    expect(document.body).not.toHaveTextContent("ana@correo.com");
  });
});

describe("estados de error del servidor", () => {
  it("422 con índice: marca la URL rechazada y anuncia el error; no muestra éxito", async () => {
    const user = userEvent.setup();
    createAlertMock.mockRejectedValue(new ApiError("validation", 422, "validation_error", [{ field: "urls", index: 1, code: "url_host_not_allowed" }], "texto"));
    render(<CreateAlertPage />);
    await user.type(screen.getByLabelText("Página 1"), "https://tienda-a.example/p/1");
    await user.click(screen.getByRole("button", { name: "Agregar otra página" }));
    await user.type(screen.getByLabelText("Página 2"), "http://localhost/x");
    await user.type(screen.getByLabelText("Correo 1"), "ana@correo.com");
    await user.click(screen.getByRole("button", { name: "Guardar alerta" }));
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Crear alerta" }));
    await waitFor(() => expect(screen.getByLabelText("Página 2")).toHaveAttribute("aria-invalid", "true"));
    expect(screen.getByLabelText("Página 1")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByLabelText("Página 2")).toHaveAccessibleDescription(/red no permitida/);
    expect(screen.getByRole("alert")).toHaveTextContent("rechazó");
    expect(screen.queryByRole("heading", { name: "Alerta creada" })).not.toBeInTheDocument();
  });

  it("fallo de red: mensaje accionable y el formulario conserva lo escrito", async () => {
    const user = userEvent.setup();
    createAlertMock.mockRejectedValue(new ApiError("network", null, null));
    render(<CreateAlertPage />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Guardar alerta" }));
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Crear alerta" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("No pudimos conectar"));
    expect(screen.getByLabelText("Correo 1")).toHaveValue("ana@correo.com");
  });
});

describe("US-03-05 aviso de la primera captura en segundo plano", () => {
  const ok = { id: "a1", status: "active", urls: [{}], created_at: "2026-11-24T00:00:00Z" };

  async function submit(user: ReturnType<typeof userEvent.setup>) {
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Guardar alerta" }));
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Crear alerta" }));
  }

  it("AC1 y AC3: tras crear con éxito se avisa del segundo plano y de recargar; sin campos nuevos ni error de schedule", async () => {
    const user = userEvent.setup();
    createAlertMock.mockResolvedValue(ok); // mismo cuerpo {id, status, urls, created_at}, aunque schedule haya fallado
    render(<CreateAlertPage />);
    await submit(user);
    const heading = await screen.findByRole("heading", { name: "Alerta creada" });
    const notice = screen.getByRole("status");
    expect(notice).toHaveTextContent("segundo plano");
    expect(notice).toHaveTextContent("Recarga la página");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/schedule/i);
    expect(heading).toHaveFocus(); // AC5: el aviso no roba el foco del título
  });

  it("AC2 (DEC-31): no hace polling ni abre SSE ni WebSocket", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const wsSpy = vi.fn();
    const esSpy = vi.fn();
    vi.stubGlobal("WebSocket", wsSpy);
    vi.stubGlobal("EventSource", esSpy);
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      createAlertMock.mockResolvedValue(ok);
      render(<CreateAlertPage />);
      await submit(user);
      await screen.findByRole("status");
      await vi.advanceTimersByTimeAsync(5 * 60_000);
      expect(createAlertMock).toHaveBeenCalledTimes(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(wsSpy).not.toHaveBeenCalled();
      expect(esSpy).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
      vi.unstubAllGlobals();
      fetchSpy.mockRestore();
    }
  });

  it.each([
    ["422", new ApiError("validation", 422, "validation_error", [], "texto")],
    ["5xx", new ApiError("server", 500, "internal_error", [], "texto")],
    ["sin red", new ApiError("network", null, null)],
  ])("AC4: una creación fallida (%s) no muestra el aviso", async (_name, error) => {
    const user = userEvent.setup();
    createAlertMock.mockRejectedValue(error);
    render(<CreateAlertPage />);
    await submit(user);
    await screen.findByRole("alert");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText(/segundo plano/)).not.toBeInTheDocument();
  });

  it("AC5 y borde: el aviso usa role=status, es un solo aviso y el teclado sigue hasta «Crear otra alerta»", async () => {
    const user = userEvent.setup();
    let resolve!: (v: typeof ok) => void;
    createAlertMock.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<CreateAlertPage />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Guardar alerta" }));
    await user.dblClick(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Crear alerta" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument(); // sin respuesta no hay aviso
    resolve(ok);
    await screen.findByRole("status");
    expect(screen.getAllByRole("status")).toHaveLength(1);
    await user.tab();
    expect(screen.getByRole("button", { name: "Crear otra alerta" })).toHaveFocus();
  });
});
