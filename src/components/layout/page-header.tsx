import type { ReactNode } from "react";

/** Título (h1) y bajada de una pantalla del board. `titleId` permite enlazarlo con aria-labelledby. */
export function PageHeader({ title, titleId, description }: { title: string; titleId?: string; description?: ReactNode }) {
  return (
    <div>
      <h1 id={titleId} className="text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      {description && <p className="mt-2 text-muted">{description}</p>}
    </div>
  );
}
