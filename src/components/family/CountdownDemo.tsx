"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "00d 00h 00m";
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return `${String(days).padStart(2, "0")}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}

export function CountdownDemo({ durationMs }: { durationMs: number }) {
  const [target] = useState(() => Date.now() + durationMs);
  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold tabular-nums">{formatRemaining(remaining)}</span>
        <span className="text-xs text-black/50 dark:text-white/50">prazo demonstrativo</span>
      </div>
      <p className="max-w-sm text-xs text-black/50 dark:text-white/50">
        A duração e a regra de contagem deverão seguir a parametrização oficial da SME.
      </p>
    </div>
  );
}
