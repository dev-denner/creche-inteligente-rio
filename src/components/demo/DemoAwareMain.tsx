"use client";

import type { ReactNode } from "react";
import { useDemoMode } from "@/components/demo/DemoModeContext";

export function DemoAwareMain({ children }: { children: ReactNode }) {
  const { enabled } = useDemoMode();
  return <main className={`flex flex-1 flex-col ${enabled ? "pb-32" : ""}`}>{children}</main>;
}
