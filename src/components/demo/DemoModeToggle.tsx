"use client";

import { useDemoMode } from "@/components/demo/DemoModeContext";

export function DemoModeToggle() {
  const { enabled, toggle } = useDemoMode();

  return (
    <button
      onClick={toggle}
      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
        enabled
          ? "border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
          : "border-black/20 text-black/60 hover:bg-black/5 dark:border-white/20 dark:text-white/60 dark:hover:bg-white/10"
      }`}
    >
      Modo Demo {enabled ? "ON" : "OFF"}
    </button>
  );
}
