import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}

/** Cuenta desde 0 hasta `to` al entrar en pantalla. Con reduced-motion muestra el valor final. */
export function CountUp({ to, decimals = 0, suffix = "", duration = 1.6 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce) {
      setValue(to);
      return;
    }
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  const formatted = value.toLocaleString("es", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  );
}
