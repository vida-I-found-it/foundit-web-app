import { Header } from "@/components/layout/header";
import { Cta } from "./components/cta";
import { DataSection } from "./components/data-section";
import { Features } from "./components/features";
import { Hero } from "./components/hero";
import { Marquee } from "./components/marquee";
import { Metrics } from "./components/metrics";

export function LandingPage() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-control focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <Hero />
        <Marquee />
        <Metrics />
        <DataSection />
        <Features />
        <Cta />
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        I Found It · Demo de landing con datos ficticios
      </footer>
    </>
  );
}
