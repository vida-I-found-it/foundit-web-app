import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  /** Se llama al pedir cerrar (Escape). Ignorado mientras `locked`. */
  onClose: () => void;
  /** Bloquea el cierre por Escape (p. ej. mientras se envía una petición). */
  locked?: boolean;
  titleId: string;
  descriptionId?: string;
  /** "alertdialog" para confirmaciones que exigen respuesta. */
  role?: "dialog" | "alertdialog";
  className?: string;
  children: ReactNode;
}

/**
 * Diálogo modal sobre <dialog> nativo con showModal(): trampa de foco, fondo inerte, Escape y
 * devolución del foco al elemento que lo abrió los aporta el navegador.
 */
export function Dialog({ open, onClose, locked, titleId, descriptionId, role = "dialog", className, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(e) => {
        e.preventDefault(); // el cierre lo decide el estado del padre, no el navegador
        if (!locked) onClose();
      }}
      className={cn("m-auto w-[min(92vw,30rem)] border border-border bg-surface p-6 text-fg backdrop:bg-black/50", className)}
    >
      {children}
    </dialog>
  );
}
