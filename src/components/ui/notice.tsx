import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function Notice({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div role="note" className="flex gap-3 border border-border bg-surface p-4 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden />
      <p>{children}</p>
    </div>
  );
}
