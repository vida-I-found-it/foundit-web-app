import { Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RepeatableRow {
  id: number;
  value: string;
}

interface Props {
  /** Prefijo único para ids de DOM. */
  name: string;
  label: string;
  rows: RepeatableRow[];
  max: number;
  counter: string;
  type: "url" | "email";
  placeholder: string;
  icon: ReactNode;
  itemLabel: (n: number) => string;
  removeLabel: (n: number) => string;
  addLabel: string;
  help?: string;
  generalError?: string;
  errors: (string | undefined)[];
  warnings: (string | undefined)[];
  disabled?: boolean;
  onChange: (id: number, value: string) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}

/** Lista repetible de campos de texto (URLs o correos). Cada fila lleva su error asociado por aria-describedby. */
export function RepeatableField(p: Props) {
  const groupId = `${p.name}-group`;
  const generalId = `${p.name}-error`;
  const helpId = `${p.name}-help`;
  return (
    <fieldset className="min-w-0" aria-describedby={[p.generalError ? generalId : null, p.help ? helpId : null].filter(Boolean).join(" ") || undefined}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <legend id={groupId} className="text-sm font-medium">
          {p.label}
        </legend>
        <span className="font-mono text-xs text-muted" aria-live="polite">
          {p.counter}
        </span>
      </div>
      <div className="space-y-2">
        {p.rows.map((row, i) => {
          const inputId = `${p.name}-${row.id}`;
          const error = p.errors[i];
          const warning = p.warnings[i];
          const messageId = `${inputId}-msg`;
          return (
            <div key={row.id}>
              <div
                className={cn(
                  "flex items-center gap-2 border bg-surface pl-3",
                  error ? "border-red-600 dark:border-red-400" : "border-border",
                )}
              >
                <span aria-hidden className="text-muted">
                  {p.icon}
                </span>
                <input
                  id={inputId}
                  name={inputId}
                  type={p.type}
                  inputMode={p.type === "email" ? "email" : "url"}
                  autoComplete="off"
                  spellCheck={false}
                  value={row.value}
                  placeholder={p.placeholder}
                  disabled={p.disabled}
                  aria-label={p.itemLabel(i + 1)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error || warning ? messageId : undefined}
                  onChange={(e) => p.onChange(row.id, e.target.value)}
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-offset-4 placeholder:text-muted/70"
                />
                {p.rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={p.removeLabel(i + 1)}
                    disabled={p.disabled}
                    onClick={() => p.onRemove(row.id)}
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                )}
              </div>
              {(error || warning) && (
                <p id={messageId} className={cn("mt-1 text-sm", error ? "text-red-700 dark:text-red-300" : "text-muted")}>
                  {error ?? warning}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {p.generalError && (
        <p id={generalId} className="mt-2 text-sm text-red-700 dark:text-red-300">
          {p.generalError}
        </p>
      )}
      {p.help && (
        <p id={helpId} className="mt-2 text-sm text-muted">
          {p.help}
        </p>
      )}
      {p.rows.length < p.max && (
        <Button type="button" variant="ghost" size="sm" className="mt-2 -ml-4" disabled={p.disabled} onClick={p.onAdd}>
          <Plus className="size-4" aria-hidden />
          {p.addLabel}
        </Button>
      )}
    </fieldset>
  );
}
