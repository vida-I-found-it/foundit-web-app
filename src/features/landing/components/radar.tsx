import type { CSSProperties } from "react";

/** Debe coincidir con el periodo de .radar-sweep en styles/index.css */
const SWEEP_SECONDS = 6;

// Ángulo en grados desde arriba, en sentido horario; radio como % del radio total.
const blips = [
  { label: "Laptop −18%", angle: 38, radius: 62 },
  { label: "Vuelo −24%", angle: 118, radius: 78 },
  { label: "Cámara −31%", angle: 205, radius: 48 },
  { label: "Seguro −12%", angle: 292, radius: 70 },
];

function position(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    left: `${50 + (radius / 2) * Math.sin(rad)}%`,
    top: `${50 - (radius / 2) * Math.cos(rad)}%`,
  };
}

/** Delay negativo: el destello queda sincronizado con el momento exacto en que el barrido pasa por el ángulo. */
function hitDelay(angle: number): CSSProperties {
  return { animationDelay: `${-(1 - angle / 360) * SWEEP_SECONDS}s` };
}

/** Radar decorativo: el barrido "detecta" cada oferta, que destella y muestra su etiqueta. */
export function Radar() {
  return (
    <div aria-hidden className="relative mx-auto aspect-square w-full max-w-md select-none">
      {/* Anillos fijos */}
      {[100, 72, 44].map((size) => (
        <div
          key={size}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border"
          style={{ width: `${size}%`, height: `${size}%` }}
        />
      ))}

      {/* Ondas que salen del centro */}
      {[0, 1.5, 3].map((delay) => (
        <div
          key={delay}
          className="radar-ripple absolute inset-0 rounded-full border border-accent"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}

      {/* Anillo de marcas que gira despacio en sentido contrario */}
      <svg viewBox="0 0 100 100" className="radar-spin-reverse absolute inset-[-4%] size-[108%]">
        <circle cx="50" cy="50" r="49" fill="none" stroke="var(--muted)" strokeWidth="0.5" strokeDasharray="0.6 2.4" opacity="0.7" />
        <circle cx="50" cy="50" r="46.5" fill="none" stroke="var(--border)" strokeWidth="0.4" strokeDasharray="8 6" />
      </svg>

      {/* Cruz de ejes */}
      <div className="absolute top-1/2 left-0 h-px w-full bg-border" />
      <div className="absolute top-0 left-1/2 h-full w-px bg-border" />

      {/* Barrido: estela cónica + línea guía en el borde delantero */}
      <div className="radar-sweep absolute inset-0 rounded-full">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 240deg, color-mix(in oklab, var(--accent) 38%, transparent) 360deg)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 h-1/2 w-px -translate-x-1/2"
          style={{ background: "linear-gradient(to top, var(--accent), transparent)" }}
        />
      </div>

      {/* Ofertas detectadas */}
      {blips.map((b) => {
        const pos = position(b.angle, b.radius);
        const labelLeft = b.angle > 180;
        return (
          <div key={b.label} className="absolute size-3 -translate-x-1/2 -translate-y-1/2" style={pos}>
            <span className="radar-lock absolute -inset-2 rounded-full border border-accent" style={hitDelay(b.angle)} />
            <span className="radar-hit absolute inset-0 rounded-full bg-accent" style={hitDelay(b.angle)} />
            <span
              className={`radar-label absolute top-1/2 -translate-y-1/2 rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[10px] whitespace-nowrap text-fg ${
                labelLeft ? "right-5" : "left-5"
              }`}
              style={hitDelay(b.angle)}
            >
              {b.label}
            </span>
          </div>
        );
      })}

      {/* Centro */}
      <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg" />
    </div>
  );
}
