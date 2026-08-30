"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useFamilyStore } from "@/lib/family-store";
import { DemoModeToggle } from "@/components/demo/DemoModeToggle";

export function NavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { loggedIn, logout } = useFamilyStore();
  const isCre = pathname?.startsWith("/cre");
  const isLogin = pathname === "/login";

  if (isLogin) return null;

  return (
    <>
      <header style={{ background: "var(--azul9)" }} className="text-white">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <span
              style={{ background: "var(--amarelo)", color: "var(--azul9)" }}
              className="rounded-md px-2.5 py-1 text-sm font-extrabold"
            >
              Rio
            </span>
            <div>
              <h1 className="text-sm font-semibold">Matrícula Digital · Creches</h1>
              <p className="text-xs opacity-85">Prefeitura do Rio · SME — Inscrição Creche 2027</p>
            </div>
          </div>
          {loggedIn && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-0.5 rounded-full bg-white/10 p-0.5">
                <Link
                  href="/"
                  className="rounded-full px-3 py-1.5 text-sm"
                  style={
                    !isCre
                      ? { background: "#fff", color: "var(--azul9)", fontWeight: 700 }
                      : { color: "#fff" }
                  }
                >
                  Portal do Candidato
                </Link>
                <Link
                  href="/cre"
                  className="rounded-full px-3 py-1.5 text-sm"
                  style={
                    isCre
                      ? { background: "#fff", color: "var(--azul9)", fontWeight: 700 }
                      : { color: "#fff" }
                  }
                >
                  Painel CRE/SME
                </Link>
              </div>
              <DemoModeToggle />
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="text-sm text-white underline"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </header>
      <div
        style={{ background: "var(--amarelo)", color: "var(--azul9)" }}
        className="px-2 py-1.5 text-center text-xs font-semibold"
      >
        PROTÓTIPO — Hackathon SME-Rio + Claude Impact Lab 2026 · Time 6 · Dados reais de 2025 +
        cenários demonstrativos · Integrações gov.br/CadÚnico/Bolsa Família simuladas · Regras
        marcadas como proposta dependem de validação SME
      </div>
    </>
  );
}
