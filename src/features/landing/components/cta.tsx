import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";

export function Cta() {
  return (
    <section id="cta" aria-labelledby="cta-titulo" className="mx-auto max-w-6xl px-5 pb-24">
      <Reveal className="relative overflow-hidden rounded-card border border-border bg-surface px-6 py-16 text-center md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(500px circle at 50% 120%, color-mix(in oklab, var(--accent) 28%, transparent), transparent 70%)",
          }}
        />
        <div className="relative">
          <h2 id="cta-titulo" className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-5xl">
            ¿Listo para pagar menos?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">Sigue un producto o servicio y te avisamos cuando su precio baje.</p>
          <ButtonLink href="#top" size="md" className="mt-8">
            Empezar a seguir precios <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
