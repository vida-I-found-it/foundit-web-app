import { MotionConfig } from "motion/react";
import { Board, useBoardPath } from "@/app/board";
import { LandingPage } from "@/features/landing/landing-page";

export function App() {
  // Dos zonas separadas: el board (#/board/...) y la landing (todo lo demás).
  const boardPath = useBoardPath();
  // "user": respeta prefers-reduced-motion en todas las animaciones de Motion.
  return (
    <MotionConfig reducedMotion="user">{boardPath === null ? <LandingPage /> : <Board path={boardPath} />}</MotionConfig>
  );
}
