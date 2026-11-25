import { BellRing, ChartLine, Eye, Store } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const features = [
  { icon: ChartLine, title: "Historial de precios", text: "Cada cambio de precio queda guardado. Míralo en el tiempo y compáralo con su media.", span: "md:col-span-2" },
  { icon: Store, title: "Comparación entre tiendas", text: "El mismo producto o servicio en varios vendedores, lado a lado.", span: "" },
  { icon: BellRing, title: "Alertas de ofertas", text: "Te avisamos cuando el precio cae por debajo de lo habitual.", span: "" },
  { icon: Eye, title: "Accesible desde el diseño", text: "Teclado, lectores de pantalla, contraste AA y gráficos con alternativa en tabla.", span: "md:col-span-2" },
];

export function Features() {
  return (
    <section id="funciones" aria-labelledby="funciones-titulo" className="mx-auto max-w-6xl px-5 pb-24">
      <Reveal>
        <h2 id="funciones-titulo" className="text-3xl font-semibold tracking-tight md:text-4xl">
          Simple por fuera, preciso por dentro.
        </h2>
      </Reveal>
      <ul className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-3">
        {features.map((f, i) => (
          <li key={f.title} className={f.span}>
            <Reveal delay={i * 0.07} className="h-full">
              <SpotlightCard className="h-full">
                <f.icon className="size-6 text-accent-text" aria-hidden />
                <h3 className="mt-5 text-lg font-medium">{f.title}</h3>
                <p className="mt-2 text-muted">{f.text}</p>
              </SpotlightCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
