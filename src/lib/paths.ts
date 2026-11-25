/**
 * Rutas por hash compartidas entre la landing y el board. Viven en lib/ para que la landing pueda
 * enlazar al board sin importar de app/. Al cambiar a React Router solo se toca este módulo y
 * app/board/router.ts.
 */
export const HOME_HASH = "#/";
export const BOARD_BASE = "#/board";

export function boardHref(path = ""): string {
  return `${BOARD_BASE}${path}`;
}
