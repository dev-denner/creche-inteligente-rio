"use client";

import { useState } from "react";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

const PONTOS = [
  { nome: "CRE 2ª — Polo Tijuca", info: "Rua Conde de Bonfim, 100 · seg-sex 8h-17h" },
  { nome: "EDI Machado de Assis", info: "Rua das Acácias, 123 · seg-sex 8h-16h" },
  { nome: "Clínica da Família Vila Isabel", info: "Av. 28 de Setembro, 500 · seg-sex 9h-18h" },
];

export function HelpButton({ label = "Preciso de ajuda" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border-2 px-4 py-2 text-sm font-medium"
        style={{ borderColor: "var(--azul7)", color: "var(--azul7)" }}
      >
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[88vh] w-full max-w-[560px] overflow-auto rounded-lg bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 font-semibold" style={{ color: "var(--azul9)" }}>
              Encontrar unidade de atendimento presencial
            </h3>
            <div className="mb-2 flex items-center gap-2">
              <ProvenanceBadge kind="demonstracao" />
            </div>
            <p className="mb-3 text-sm text-black/70">
              Você pode fazer ou acompanhar a inscrição com apoio humano nestes pontos
              (demonstrativos):
            </p>
            <ul className="flex flex-col gap-2">
              {PONTOS.map((p) => (
                <li key={p.nome} className="rounded-md bg-[var(--c0)] p-3 text-sm">
                  <strong>{p.nome}</strong>
                  <br />
                  <span className="text-xs text-black/50">{p.info}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-black/50">
              Leve documento com foto. O atendimento presencial permanece disponível em todas as
              etapas.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "var(--azul7)" }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
