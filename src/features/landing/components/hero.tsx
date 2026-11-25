import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { PointerEvent } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Radar } from "./radar";

const words = ["Compra", "cuando", "el", "precio", "baja."];

export function Hero() {
  function onMove(e: PointerEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <section id="top" onPointerMove={onMove} className="relative overflow-hidden">
      <div aria-hidden className="bg-grid absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx, 70%) var(--my, 30%), color-mix(in oklab, var(--accent) 14%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-32">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-control border border-border bg-surface px-3 py-1 font-mono text-xs text-muted"
          >
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            Seguimiento de precios y ofertas
          </motion.p>

          <h1 className="text-5xl leading-[1.05] font-semibold tracking-tight text-balance md:text-7xl">
            {words.map((w, i) => (
              <motion.span
                key={w + i}
                className={`mr-[0.25em] inline-block ${i > 2 ? "text-gradient" : ""}`}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-6 max-w-md text-lg text-muted"
          >
            Compara el precio de productos y servicios a lo largo del tiempo y detecta ofertas reales antes de que se acaben.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <ButtonLink href="#cta">
              Seguir un precio <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="#datos" variant="outline">
              Ver el historial
            </ButtonLink>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Radar />
        </motion.div>
      </div>
    </section>
  );
}
