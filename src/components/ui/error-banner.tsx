import type { Ref } from "react";
import { cn } from "@/lib/utils";

interface Props {
  message: string | null;
  /** Para enfocarlo tras un fallo: el lector de pantalla lo anuncia. */
  ref?: Ref<HTMLDivElement>;
}

/** Región de alerta siempre presente (role=alert anuncia los cambios); solo se ve con mensaje. */
export function ErrorBanner({ message, ref }: Props) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className={cn(message && "border border-red-600 p-3 text-red-700 dark:border-red-400 dark:text-red-300")}
    >
      {message}
    </div>
  );
}
