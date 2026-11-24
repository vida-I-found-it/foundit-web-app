import { Search } from "lucide-react";
import { type ReactNode, Suspense } from "react";
import { SkipLink } from "@/components/layout/skip-link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { HOME_HASH, boardHref } from "@/lib/paths";
import { type BoardFeature, boardFeatures } from "./features";

const soonLabel = "Próximamente";

/** Layout del board: cabecera con navegación generada desde el registro y zona de contenido. */
export function BoardLayout({ active, children }: { active: BoardFeature | null; children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SkipLink href="#contenido">Saltar al contenido</SkipLink>
      <header className="border-b border-border/60 bg-bg">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-2">
          <a href={boardHref()} className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-control bg-accent text-accent-fg">
              <Search className="size-4" aria-hidden />
            </span>
            I Found It
          </a>
          <nav aria-label="Board" className="flex-1">
            <ul className="flex flex-wrap items-center gap-1">
              {boardFeatures.map((f) => (
                <li key={f.id}>
                  {f.status === "ready" ? (
                    <a
                      href={boardHref(f.path)}
                      aria-current={active?.id === f.id ? "page" : undefined}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted transition-colors hover:text-fg aria-[current=page]:font-medium aria-[current=page]:text-fg aria-[current=page]:underline aria-[current=page]:underline-offset-8"
                    >
                      <f.icon className="size-4" aria-hidden />
                      {f.label}
                    </a>
                  ) : (
                    <span aria-disabled="true" className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted/70">
                      <f.icon className="size-4" aria-hidden />
                      {f.label}
                      <span className="border border-border px-1.5 text-xs">{soonLabel}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
          <ButtonLink href={HOME_HASH} variant="ghost" size="sm">
            Inicio
          </ButtonLink>
        </div>
      </header>
      <main id="contenido" className="mx-auto max-w-6xl px-5 py-10">
        <Suspense fallback={<p role="status" className="text-muted">Cargando…</p>}>{children}</Suspense>
      </main>
    </div>
  );
}
