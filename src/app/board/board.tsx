import { ButtonLink } from "@/components/ui/button";
import { boardHref } from "@/lib/paths";
import { BoardLayout } from "./board-layout";
import { DEFAULT_FEATURE, boardFeatures } from "./features";

/** Aplicación ("board"): resuelve la ruta contra el registro y pinta el feature dentro del layout. */
export function Board({ path }: { path: string }) {
  const home = path === "" || path === "/";
  const match = boardFeatures.find((f) => f.status === "ready" && f.path === path);
  const active = match?.status === "ready" ? match : home && DEFAULT_FEATURE?.status === "ready" ? DEFAULT_FEATURE : null;

  return (
    <BoardLayout active={active}>
      {active?.status === "ready" ? (
        <active.component />
      ) : (
        <section aria-labelledby="nf-title">
          <h1 id="nf-title" className="text-3xl font-semibold tracking-tight">
            Página no encontrada
          </h1>
          <p className="mt-2 text-muted">Esta sección del board no existe.</p>
          <ButtonLink href={boardHref()} className="mt-6">
            Ir al board
          </ButtonLink>
        </section>
      )}
    </BoardLayout>
  );
}
