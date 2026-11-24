/**
 * Router mínimo por hash. Es el ÚNICO módulo (junto con lib/paths.ts) que sabe que el ruteo usa
 * hash: para pasar a React Router basta reimplementar `useBoardPath` y los enlaces.
 */
import { useSyncExternalStore } from "react";
import { BOARD_BASE } from "@/lib/paths";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function isBoardHash(hash: string): boolean {
  return hash === BOARD_BASE || hash.startsWith(`${BOARD_BASE}/`);
}

/** Ruta actual relativa al board ("" para la portada del board), o null si no estamos en el board. */
function readBoardPath(): string | null {
  const hash = window.location.hash;
  return isBoardHash(hash) ? hash.slice(BOARD_BASE.length).replace(/\/+$/, "") : null;
}

export function useBoardPath(): string | null {
  return useSyncExternalStore(subscribe, readBoardPath);
}
