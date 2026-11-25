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

  it("los features «próximamente» aparecen deshabilitados y sin enlace", () => {
    render(<Board path="/alerts/new" />);
    const soon = boardFeatures.filter((f) => f.status === "soon");
    expect(soon.length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /^Alertas/ })).not.toBeInTheDocument();
    expect(screen.getByText("Alertas").closest("[aria-disabled='true']")).not.toBeNull();
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
