"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type NewChildOption = {
  unidade: number | null;
  nome_unidade: string;
  bairro: string | null;
  grupamento: string;
  horario: string;
  comp: "Alta" | "Média" | "Baixa";
};

export type NewChild = {
  id: string;
  name: string;
  cpfChild: string;
  group: string;
  protocol: string;
  options: NewChildOption[];
  vulnCriteria: string[];
  vulnPts: number;
  createdAt: number;
};

export type AuditEntry = { ts: string; tipo: string; desc: string; origin: string };

type StoredFamilyState = {
  loggedIn: boolean;
  children: NewChild[];
  audit: AuditEntry[];
};

type FamilyState = StoredFamilyState & {
  login: () => void;
  logout: () => void;
  addChild: (c: NewChild) => void;
  addAudit: (e: AuditEntry) => void;
};

const KEY = "creche-inteligente-rio:family";

function loadInitial(): StoredFamilyState {
  if (typeof window === "undefined") return { loggedIn: false, children: [], audit: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as StoredFamilyState;
  } catch {
    // ignore corrupt storage
  }
  return { loggedIn: false, children: [], audit: [] };
}

const FamilyCtx = createContext<FamilyState | null>(null);

export function FamilyStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredFamilyState>(loadInitial);

  function updateState(updater: (prev: StoredFamilyState) => StoredFamilyState) {
    setState((prev) => {
      const next = updater(prev);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      }
      return next;
    });
  }

  const value: FamilyState = {
    loggedIn: state.loggedIn,
    children: state.children,
    audit: state.audit,
    login: () => updateState((prev) => ({ ...prev, loggedIn: true })),
    logout: () => updateState((prev) => ({ ...prev, loggedIn: false })),
    addChild: (c) => updateState((prev) => ({ ...prev, children: [...prev.children, c] })),
    addAudit: (e) => updateState((prev) => ({ ...prev, audit: [e, ...prev.audit] })),
  };

  return <FamilyCtx.Provider value={value}>{children}</FamilyCtx.Provider>;
}

export function useFamilyStore(): FamilyState {
  const ctx = useContext(FamilyCtx);
  if (!ctx) throw new Error("useFamilyStore must be used within FamilyStoreProvider");
  return ctx;
}
