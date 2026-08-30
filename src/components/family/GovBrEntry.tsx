"use client";

import { useState } from "react";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function GovBrEntry() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-black/20 px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
      >
        Entrar com gov.br
        <ProvenanceBadge kind="proposta" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setOpen(false)}
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
              onClick={() => setOpen(false)}
              className="w-fit rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
