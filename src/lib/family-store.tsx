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

type FamilyState = {
  loggedIn: boolean;
  children: NewChild[];
  audit: AuditEntry[];
  login: () => void;
  logout: () => void;
  addChild: (c: NewChild) => void;
  addAudit: (e: AuditEntry) => void;
};

const KEY = "creche-inteligente-rio:family";

function loadInitial(): { loggedIn: boolean; children: NewChild[]; audit: AuditEntry[] } {
  if (typeof window === "undefined") return { loggedIn: false, children: [], audit: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return { loggedIn: false, children: [], audit: [] };
}

const FamilyCtx = createContext<FamilyState | null>(null);

export function FamilyStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadInitial);

  function persist(next: typeof state) {
    setState(next);
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  }

  const value: FamilyState = {
    loggedIn: state.loggedIn,
    children: state.children,
    audit: state.audit,
    login: () => persist({ ...state, loggedIn: true }),
    logout: () => persist({ ...state, loggedIn: false }),
    addChild: (c) => persist({ ...state, children: [...state.children, c] }),
    addAudit: (e) => persist({ ...state, audit: [e, ...state.audit] }),
  };

  return <FamilyCtx.Provider value={value}>{children}</FamilyCtx.Provider>;
}

export function useFamilyStore(): FamilyState {
  const ctx = useContext(FamilyCtx);
  if (!ctx) throw new Error("useFamilyStore must be used within FamilyStoreProvider");
  return ctx;
}
