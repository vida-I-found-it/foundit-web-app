/**
 * REGISTRO DE FEATURES DEL BOARD: el único lugar donde se da de alta una pantalla nueva.
 * Cada feature vive en src/features/<feature>/ y expone su pantalla por su `index.ts`.
 */
import { type LucideIcon, ListChecks, PlusCircle } from "lucide-react";
import { type ComponentType, lazy } from "react";

export type BoardFeature =
  | {
      id: string;
      label: string;
      icon: LucideIcon;
      status: "ready";
      /** Ruta relativa al board, p. ej. "/alerts/new". */
      path: string;
      /** Si es true, también atiende `<path>/<parámetro>` y se lo entrega al componente como `param`. */
      withParam?: boolean;
      /** Carga diferida: cada feature va en su propio chunk. */
      component: ComponentType<{ param?: string }>;
    }
  | { id: string; label: string; icon: LucideIcon; status: "soon" };

export const boardFeatures: BoardFeature[] = [
  {
    id: "alerts-create",
    label: "Crear alerta",
    icon: PlusCircle,
    status: "ready",
    path: "/alerts/new",
    component: lazy(() => import("@/features/alerts").then((m) => ({ default: m.CreateAlertPage }))),
  },
  // US-07-06: consulta de una alerta por su número (`/alerts/:número`). La lista llega con US-07-01.
  {
    id: "alerts-lookup",
    label: "Alertas",
    icon: ListChecks,
    status: "ready",
    path: "/alerts",
    withParam: true,
    component: lazy(() => import("@/features/alerts").then((m) => ({ default: m.AlertLookupPage }))),
  },
];

export const DEFAULT_FEATURE = boardFeatures.find((f) => f.status === "ready");
