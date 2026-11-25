import { type FormEvent, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { boardHref } from "@/lib/paths";
import { AlertDetailView } from "./components/alert-detail-view";
import { alertMessages } from "./messages";

const t = alertMessages.lookup;

/** Ruta del detalle: el número va en la dirección, así recargar vuelve a pedirlo a la API (AC23). */
export const alertDetailPath = (id: number | string) => `/alerts/${encodeURIComponent(String(id))}`;

/** `param` es el número que viene en la ruta (`/alerts/:param`); sin él solo se muestra el formulario. */
export function AlertLookupPage({ param }: { param?: string }) {
  const [typed, setTyped] = useState(param ?? "");
  const [error, setError] = useState<string | null>(null);
  // El campo refleja siempre el número de la ruta: al cambiar por navegación se reinicia (sin efecto).
  const [syncedParam, setSyncedParam] = useState(param);
  if (syncedParam !== param) {
    setSyncedParam(param);
    setTyped(param ?? "");
    setError(null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (typed.trim() === "") {
      setError(t.required);
      return;
    }
    setError(null);
    // El valor se envía tal cual: la validez la decide el backend (422 => aviso de número inválido).
    window.location.hash = boardHref(alertDetailPath(typed.trim()));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={t.title} titleId="lookup-title" description={t.intro} />
      {/* key con prefijo: al cambiar la ruta el campo se re-sincroniza. Debe diferir de la del detalle: dos hermanos con la misma key se duplican. */}
      <form key={`form-${param ?? ""}`} noValidate onSubmit={handleSubmit} aria-labelledby="lookup-title" className="space-y-3">
        <label htmlFor="alert-number" className="block text-sm font-medium">
          {t.field}
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            id="alert-number"
            name="alert-number"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "alert-number-error" : undefined}
            className="h-11 w-48 rounded-control border border-border bg-surface px-3"
          />
          <Button type="submit">{t.submit}</Button>
        </div>
        {error && (
          <p id="alert-number-error" role="alert" className="text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
      </form>
      {param !== undefined && param !== "" && <AlertDetailView key={`detail-${param}`} alertId={param} />}
    </div>
  );
}
