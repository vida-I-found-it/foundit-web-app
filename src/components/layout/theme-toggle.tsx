import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function currentTheme(): "light" | "dark" {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);
  const next = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage no disponible: el tema solo dura la sesión */
    }
    setTheme(next);
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={`Cambiar a tema ${next === "dark" ? "oscuro" : "claro"}`}>
      {theme === "dark" ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
    </Button>
  );
}
