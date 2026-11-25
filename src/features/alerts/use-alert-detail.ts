import { useEffect, useState } from "react";
import { type AlertDetail, AlertLookupError, type AlertLookupErrorKind, getAlert } from "./api/get-alert";

export type AlertDetailState =
  | { kind: "loading" }
  | { kind: "data"; alert: AlertDetail }
  | { kind: "error"; error: AlertLookupErrorKind };

/**
 * Pide la alerta a la API en cada cambio de número o de reintento (nada se lee de memoria local, AC23).
 * El resultado guarda la clave que lo produjo: si no coincide con la actual se devuelve «cargando»,
 * así nunca se ve un dato de la alerta anterior, ni un instante (AC17, AC22).
 */
export function useAlertDetail(alertId: string, attempt: number): AlertDetailState {
  const key = `${attempt}:${alertId}`;
  const [settled, setSettled] = useState<{ key: string; state: AlertDetailState } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getAlert(alertId, controller.signal).then(
      (alert) => setSettled({ key, state: { kind: "data", alert } }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        const kind = error instanceof AlertLookupError ? error.kind : "network";
        setSettled({ key, state: { kind: "error", error: kind } });
      },
    );
    return () => controller.abort();
  }, [alertId, key]);

  return settled?.key === key ? settled.state : { kind: "loading" };
}
