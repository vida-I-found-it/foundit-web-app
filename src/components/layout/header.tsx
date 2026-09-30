import { Search } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "#metricas", label: "Métricas" },
  { href: "#datos", label: "Datos" },
  { href: "#funciones", label: "Funciones" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-control bg-accent text-accent-fg">
            <Search className="size-4" aria-hidden />
          </span>
          I Found It
        </a>
        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-control px-4 py-2 text-sm text-muted transition-colors hover:text-fg">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink href="#cta" size="sm">
            Empezar
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
