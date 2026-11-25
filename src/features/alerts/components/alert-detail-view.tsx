import { AlertCircle, CheckCircle2, Loader2, WifiOff } from "lucide-react";
import { type ReactNode, type Ref, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AlertDetail } from "../api/get-alert";
import { alertMessages } from "../messages";
import { useAlertDetail } from "../use-alert-detail";

const t = alertMessages.lookup;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : new Intl.DateTimeFormat("es", { dateStyle: "long", timeStyle: "short" }).format(d);
}

/** Todo texto del servidor se pinta como texto de React (escapado); nunca como HTML ni como enlace. */
function Detail({ alert, headingRef }: { alert: AlertDetail; headingRef: Ref<HTMLHeadingElement> }) {
  return (
    <article aria-labelledby="alert-title" className="space-y-6 border border-border bg-surface p-6">
      <div>
        <h2 id="alert-title" ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight">
          {t.detail.title(alert.id)}
        </h2>
        <p className="mt-2 inline-flex items-center gap-2 text-sm">
          <CheckCircle2 className="size-4 text-accent-text" aria-hidden />
          <span>
            {t.detail.status}: <strong>{t.statusLabel[alert.status]}</strong>
          </span>
        </p>
        <p className="mt-1 text-sm text-muted">
          {t.detail.createdAt}: <time dateTime={alert.createdAt}>{formatDate(alert.createdAt)}</time>
        </p>
      </div>

      <section aria-labelledby="alert-urls">
        <h3 id="alert-urls" className="text-sm font-medium">
          {t.detail.urls}
        </h3>
        {alert.urls.length === 0 ? (
          <p className="mt-1 text-sm text-muted">{t.detail.noUrls}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {alert.urls.map((u) => (
              <li key={u.id} className="break-all border border-border p-3 text-sm">
                <span className="font-medium">{u.domain}</span>
                <span className="block text-muted">{u.url}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="alert-subs">
        <h3 id="alert-subs" className="text-sm font-medium">
          {t.detail.subscriptions}
        </h3>
        {alert.subscriptions.length === 0 ? (
          <p className="mt-1 text-sm text-muted">{t.detail.noSubscriptions}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {alert.subscriptions.map((s, i) => (
              // Sin id en el contrato: dos correos con la misma inicial y dominio son dos entradas.
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 border border-border p-3 text-sm">
                <span className="break-all font-mono">{s.emailMasked}</span>
                <span className="border border-border px-2 text-xs">{t.subscriptionLabel[s.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}

function Problem({
  icon: Icon,
  children,
  problemRef,
  actions,
}: {
  icon: typeof AlertCircle;
  children: string;
  problemRef: Ref<HTMLDivElement>;
  actions?: ReactNode;
}) {
  // role=alert anuncia el mensaje; el icono y el texto evitan depender solo del color.
  return (
    <div
      ref={problemRef}
      tabIndex={-1}
      role="alert"
      className="flex gap-3 border border-red-600 p-4 text-red-700 dark:border-red-400 dark:text-red-300"
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="space-y-3">
        <p>{children}</p>
        {actions}
      </div>
    </div>
  );
}

/** Se monta con `key={alertId}`: al cambiar de alerta no sobrevive nada de la anterior (AC22). */
export function AlertDetailView({ alertId }: { alertId: string }) {
  const [attempt, setAttempt] = useState(0);
  const state = useAlertDetail(alertId, attempt);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);

  // Al terminar la carga, el foco va al resultado para que el lector de pantalla lo anuncie.
  useEffect(() => {
    if (state.kind === "data") headingRef.current?.focus();
    else if (state.kind === "error") problemRef.current?.focus();
  }, [state]);

  if (state.kind === "loading") {
    return (
      <p role="status" className="flex items-center gap-2 text-muted">
        <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
        {t.loading}
      </p>
    );
  }
  if (state.kind === "data") return <Detail alert={state.alert} headingRef={headingRef} />;

  switch (state.error) {
    case "not_found":
      return (
        <Problem icon={AlertCircle} problemRef={problemRef}>
          {t.notFound}
        </Problem>
      );
    case "invalid":
      return (
        <Problem icon={AlertCircle} problemRef={problemRef}>
          {t.invalid}
        </Problem>
      );
    default:
      return (
        <Problem
          icon={WifiOff}
          problemRef={problemRef}
          actions={
            <Button variant="outline" size="sm" onClick={() => setAttempt((n) => n + 1)}>
              {t.retry}
            </Button>
          }
        >
          {state.error === "server" ? t.server : t.offline}
        </Problem>
      );
  }
}
