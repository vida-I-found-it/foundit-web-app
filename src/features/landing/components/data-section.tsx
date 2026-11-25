import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AccessibleChart } from "@/components/charts/accessible-chart";
import { Reveal } from "@/components/motion/reveal";

// Datos ficticios para el demo.
const data = [
  { mes: "Ene", precio: 499, media: 480 },
  { mes: "Feb", precio: 489, media: 480 },
  { mes: "Mar", precio: 499, media: 480 },
  { mes: "Abr", precio: 479, media: 480 },
  { mes: "May", precio: 459, media: 480 },
  { mes: "Jun", precio: 499, media: 480 },
  { mes: "Jul", precio: 379, media: 480 },
  { mes: "Ago", precio: 449, media: 480 },
];

const columns = [
  { key: "mes", label: "Mes" },
  { key: "precio", label: "Precio ($)" },
  { key: "media", label: "Media histórica ($)" },
];

export function DataSection() {
  return (
    <section id="datos" aria-labelledby="datos-titulo" className="mx-auto max-w-6xl px-5 pb-24">
      <Reveal>
        <h2 id="datos-titulo" className="text-3xl font-semibold tracking-tight md:text-4xl">
          Sabe cuándo comprar.
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          Compara el precio actual con su historial y detecta cuándo cae por debajo de lo habitual.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 rounded-card border border-border bg-surface p-6 md:p-8">
        <AccessibleChart
          title="Precio de un portátil, de enero a agosto"
          description="Gráfico de áreas: el precio ronda los 480 dólares de media. En julio cae a 379, un 21% por debajo de esa media: una oferta real."
          columns={columns}
          rows={data}
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} accessibilityLayer margin={{ top: 16, right: 16, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g-precio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-found)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-found)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--muted)" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="var(--muted)"
                  tickLine={false}
                  axisLine={false}
                  domain={[320, 540]}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip
                  formatter={(v) => `$${v}`}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 0,
                    color: "var(--fg)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="media"
                  name="Media histórica"
                  stroke="var(--chart-lost)"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fill="none"
                  animationDuration={1400}
                />
                <Area
                  type="monotone"
                  dataKey="precio"
                  name="Precio"
                  stroke="var(--chart-found)"
                  strokeWidth={2}
                  fill="url(#g-precio)"
                  animationDuration={1400}
                />
                <ReferenceDot
                  x="Jul"
                  y={379}
                  r={6}
                  fill="var(--accent)"
                  stroke="var(--fg)"
                  strokeWidth={1.5}
                  label={{ value: "Oferta −21%", position: "bottom", fill: "var(--fg)", fontSize: 12 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <ul className="m-0 mt-4 flex list-none gap-6 p-0 text-sm text-muted">
            <li className="flex items-center gap-2">
              <span aria-hidden className="h-0.5 w-6 bg-[var(--chart-found)]" /> Precio (línea continua)
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="w-6 border-t-2 border-dashed border-[var(--chart-lost)]" /> Media histórica (línea punteada)
            </li>
          </ul>
        </AccessibleChart>
      </Reveal>
    </section>
  );
}
