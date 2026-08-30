"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type DemoModeState = {
  enabled: boolean;
  toggle: () => void;
  step: number;
  setStep: (n: number) => void;
};

const DemoModeCtx = createContext<DemoModeState | null>(null);

const STORAGE_KEY = "creche-inteligente-rio:demo-mode";

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "1",
  );
  const [step, setStep] = useState(0);

  function toggle() {
    setEnabled((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      if (!next) setStep(0);
      return next;
    });
  }

  return (
    <DemoModeCtx.Provider value={{ enabled, toggle, step, setStep }}>{children}</DemoModeCtx.Provider>
  );
}

export function useDemoMode(): DemoModeState {
  const ctx = useContext(DemoModeCtx);
  if (!ctx) throw new Error("useDemoMode must be used within DemoModeProvider");
  return ctx;
}
