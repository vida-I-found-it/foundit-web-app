import { MotionConfig } from "motion/react";
import { LandingPage } from "@/features/landing/landing-page";

export function App() {
  // "user": respeta prefers-reduced-motion en todas las animaciones de Motion.
  return (
    <MotionConfig reducedMotion="user">
      <LandingPage />
    </MotionConfig>
  );
}
