import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type NoticeProps = {
  icon: LucideIcon;
  children: ReactNode;
  /** "status" anuncia el aviso sin interrumpir ni mover el foco; por defecto es una nota estática. */
  role?: "note" | "status";
};

export function Notice({ icon: Icon, children, role = "note" }: NoticeProps) {
  return (
    <div role={role} className="flex gap-3 border border-border bg-surface p-4 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden />
      <p>{children}</p>
    </div>
  );
}
