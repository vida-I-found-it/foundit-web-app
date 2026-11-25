// Requiere Vitest + Testing Library + jsdom (propuestos, no instalados).
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Board } from "@/app/board";
import { boardFeatures } from "@/app/board/features";
import { isBoardHash } from "@/app/board/router";

describe("board", () => {
  it("la portada del board muestra el feature de crear alerta y lo marca como página actual", async () => {
    render(<Board path="" />);
    expect(await screen.findByRole("heading", { name: "Crear alerta" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Crear alerta" })).toHaveAttribute("aria-current", "page");
  });

  // US-07-06-AC15: «Alertas» dejó de ser «próximamente»; ahora es un enlace activo del board.
  it("la entrada «Alertas» está activa y enlaza a la consulta de alertas (US-07-06-AC15)", () => {
    render(<Board path="/alerts/new" />);
    const alerts = boardFeatures.find((f) => f.label === "Alertas");
    expect(alerts?.status).toBe("ready");
    const link = screen.getByRole("link", { name: /^Alertas/ });
    expect(link).toHaveAttribute("href", "#/board/alerts");
    expect(link.closest("[aria-disabled='true']")).toBeNull();
  });

  it("una ruta desconocida muestra «Página no encontrada»", () => {
    render(<Board path="/no-existe" />);
    expect(screen.getByRole("heading", { name: "Página no encontrada" })).toBeInTheDocument();
  });

  it("isBoardHash distingue board de landing", () => {
    expect(isBoardHash("#/board")).toBe(true);
    expect(isBoardHash("#/board/alerts/new")).toBe(true);
    expect(isBoardHash("#/boardx")).toBe(false);
    expect(isBoardHash("#cta")).toBe(false);
  });

  it("los paths de features listos son únicos", () => {
    const paths = boardFeatures.flatMap((f) => (f.status === "ready" ? [f.path] : []));
    expect(new Set(paths).size).toBe(paths.length);
  });
});
