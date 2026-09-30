const items = [
  "Audífonos inalámbricos · −31% vs. media 90 días",
  "Vuelo Bogotá–Madrid · −24%",
  "Laptop 14″ · −18%",
  "Suscripción de streaming · −15%",
  "Cámara compacta · −31%",
  "Hosting anual · −12%",
  "Monitor 27″ · −22%",
  "Seguro de viaje · −12%",
];

/** Cinta de ofertas recientes. Se pausa al pasar el cursor o enfocar; la copia duplicada está oculta a lectores de pantalla. */
export function Marquee() {
  return (
    <section aria-label="Ofertas detectadas recientemente" className="border-y border-border bg-surface/50 py-4">
      <div className="marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
        <ul className="marquee-track m-0 flex w-max list-none gap-3 p-0">
          {[...items, ...items].map((item, i) => (
            <li
              key={item + i}
              aria-hidden={i >= items.length}
              className="rounded-control border border-border bg-bg px-4 py-1.5 font-mono text-sm whitespace-nowrap text-muted"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
