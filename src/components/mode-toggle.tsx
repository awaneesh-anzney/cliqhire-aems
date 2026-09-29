"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = (resolvedTheme ?? theme) === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80" disabled>
        <Sun className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80" onClick={toggle}>
      {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </Button>
  );
}
