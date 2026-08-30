"use client";

import { useState } from "react";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function ValidationSources() {
  const [govBrOpen, setGovBrOpen] = useState(false);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <h3 className="font-medium">Fontes de validação e integrações</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          onClick={() => setGovBrOpen(true)}
          className="flex flex-col items-start gap-1 rounded-lg border border-black/10 p-3 text-left text-sm hover:bg-black/[.03] dark:border-white/10 dark:hover:bg-white/[.05]"
        >
          <span className="font-medium">gov.br</span>
          <ProvenanceBadge kind="proposta" />
          <span className="text-xs text-black/50 dark:text-white/50">Proposta de integração</span>
        </button>
        <div className="flex flex-col items-start gap-1 rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
          <span className="font-medium">CadÚnico</span>
          <ProvenanceBadge kind="pendente-sme" />
          <span className="text-xs text-black/50 dark:text-white/50">Integração institucional necessária</span>
        </div>
        <div className="flex flex-col items-start gap-1 rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
          <span className="font-medium">Bolsa Família</span>
          <ProvenanceBadge kind="pendente-sme" />
          <span className="text-xs text-black/50 dark:text-white/50">Integração institucional necessária</span>
        </div>
      </div>
      <p className="text-xs text-black/50 dark:text-white/50">
        O cadastro da própria inscrição já está disponível nesta demonstração. Nenhuma consulta a
        gov.br, CadÚnico ou Bolsa Família foi realizada.
      </p>

      {govBrOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setGovBrOpen(false)}
        >
          <div
            className="flex max-w-sm flex-col gap-3 rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-950"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold">Entrar com gov.br</h3>
            <p className="text-sm text-black/70 dark:text-white/70">
              Integração prevista para autenticação institucional. Depende de validação técnica e
              institucional.
            </p>
            <button
              onClick={() => setGovBrOpen(false)}
              className="w-fit rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
