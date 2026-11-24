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
      /** Carga diferida: cada feature va en su propio chunk. */
      component: ComponentType;
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
  // Marcador de lo que viene (CU-07): sin funcionalidad todavía.
  { id: "alerts-list", label: "Alertas", icon: ListChecks, status: "soon" },
];

export const DEFAULT_FEATURE = boardFeatures.find((f) => f.status === "ready");
