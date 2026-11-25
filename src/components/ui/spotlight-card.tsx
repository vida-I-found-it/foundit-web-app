import type { HTMLAttributes, PointerEvent } from "react";
import { cn } from "@/lib/utils";

/** Tarjeta con un halo sutil que sigue al cursor. Solo decorativo: sin cursor no cambia nada. */
export function SpotlightCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  function onMove(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      onPointerMove={onMove}
      className={cn(
        "group relative overflow-hidden rounded-card border border-border bg-surface p-6",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--x, 50%) var(--y, 50%), color-mix(in oklab, var(--accent) 16%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
