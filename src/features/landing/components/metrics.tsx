import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";

const metrics = [
  { value: 184000, suffix: "", decimals: 0, label: "Precios registrados al día" },
  { value: 23, suffix: "%", decimals: 0, label: "Ahorro medio en ofertas" },
  { value: 90, suffix: " días", decimals: 0, label: "De historial por producto" },
  { value: 1200, suffix: "", decimals: 0, label: "Tiendas y proveedores" },
];

export function Metrics() {
  return (
    <section id="metricas" aria-labelledby="metricas-titulo" className="mx-auto max-w-6xl px-5 py-24">
      <h2 id="metricas-titulo" className="sr-only">
        Métricas clave
      </h2>
      <dl className="m-0 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border md:grid-cols-4">
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.08} className="flex flex-col-reverse bg-surface p-6 md:p-8">
            <dt className="mt-2 text-sm text-muted">{m.label}</dt>
            <dd className="m-0 text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">
              <CountUp to={m.value} suffix={m.suffix} decimals={m.decimals} />
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
