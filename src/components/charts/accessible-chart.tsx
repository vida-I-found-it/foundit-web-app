import { Table2 } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { Button } from "@/components/ui/button";

interface Column {
  key: string;
  label: string;
}

interface AccessibleChartProps {
  title: string;
  description: string;
  columns: Column[];
  rows: Record<string, string | number>[];
  children: ReactNode;
}

/**
 * Envuelve un gráfico con título, descripción textual y una alternativa en tabla.
 * Regla del proyecto: ningún gráfico se muestra sin este wrapper.
 */
export function AccessibleChart({
  title,
  description,
  columns,
  rows,
  children,
}: AccessibleChartProps) {
  const [asTable, setAsTable] = useState(false);
  const descId = useId();
  const regionId = useId();

  return (
    <figure aria-labelledby={`${regionId}-t`} aria-describedby={descId} className="m-0">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <figcaption id={`${regionId}-t`} className="text-lg font-medium">
            {title}
          </figcaption>
          <p id={descId} className="mt-1 max-w-prose text-sm text-muted">
            {description}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          aria-pressed={asTable}
          aria-controls={regionId}
          onClick={() => setAsTable((v) => !v)}
        >
          <Table2 className="size-4" aria-hidden />
          {asTable ? "Ver gráfico" : "Ver como tabla"}
        </Button>
      </div>

      <div id={regionId}>
        {asTable ? (
          <div className="overflow-x-auto rounded-card border border-border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{title}</caption>
              <thead className="bg-bg text-muted">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} scope="col" className="px-4 py-2.5 font-medium">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={String(row[columns[0].key])} className="border-t border-border">
                    {columns.map((c, i) =>
                      i === 0 ? (
                        <th key={c.key} scope="row" className="px-4 py-2.5 font-medium">
                          {row[c.key]}
                        </th>
                      ) : (
                        <td key={c.key} className="px-4 py-2.5 tabular-nums">
                          {row[c.key]}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </figure>
  );
}
