"use client";

import { useState } from "react";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

type CaseItem = {
  id: number;
  titulo: string;
  descricao: string;
};

const CASOS: CaseItem[] = [
  {
    id: 1,
    titulo: "Estados incompatíveis",
    descricao: "Uma opção aparece como \"Confirmado\" e \"Cancelado\" no mesmo dia, em registros diferentes.",
  },
  {
    id: 2,
    titulo: "Opção que deveria ter sido encerrada",
    descricao: "Opção segue em \"Lista de espera\" mesmo após a família confirmar outra unidade.",
  },
  {
    id: 3,
    titulo: "Eventos concorrentes",
    descricao: "Duas mudanças de status para a mesma inscrição registradas no mesmo timestamp.",
  },
  {
    id: 4,
    titulo: "Combinação fora da matriz permitida",
    descricao: "Grupamento \"Berçário\" registrado para uma criança fora da faixa etária esperada.",
  },
];

export function Inconsistencies({ onResolved }: { onResolved: (titulo: string) => void }) {
  const [resolved, setResolved] = useState<Set<number>>(new Set());

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center gap-2">
        <h3 className="font-medium">Inconsistências</h3>
        <ProvenanceBadge kind="demonstracao" />
      </div>
      <p className="text-xs text-black/50 dark:text-white/50">
        Casos ilustrativos do tipo de inconsistência que uma triagem automatizada poderia sinalizar --
        não são casos reais extraídos do dataset.
      </p>

      <div className="flex flex-col gap-3">
        {CASOS.map((caso) => {
          const isResolved = resolved.has(caso.id);
          return (
            <div key={caso.id} className="rounded-lg border border-black/10 p-3 dark:border-white/10">
              <p className="font-medium">{caso.titulo}</p>
              <p className="text-sm text-black/70 dark:text-white/70">{caso.descricao}</p>
              <ol className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <li className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                  Inconsistência detectada
                </li>
                <span className="text-black/30 dark:text-white/30">→</span>
                <li className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                  IA/regra sinaliza
                </li>
                <span className="text-black/30 dark:text-white/30">→</span>
                <li
                  className={`rounded-full px-2.5 py-1 ${
                    isResolved
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-black/[.05] dark:bg-white/[.08]"
                  }`}
                >
                  Servidor analisa
                </li>
                <span className="text-black/30 dark:text-white/30">→</span>
                <li
                  className={`rounded-full px-2.5 py-1 ${
                    isResolved
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-black/[.05] dark:bg-white/[.08]"
                  }`}
                >
                  Decisão registrada
                </li>
              </ol>
              {!isResolved ? (
                <button
                  onClick={() => {
                    setResolved((prev) => new Set(prev).add(caso.id));
                    onResolved(caso.titulo);
                  }}
                  className="mt-2 rounded-md border border-black/20 px-3 py-1.5 text-xs font-medium dark:border-white/20"
                >
                  Servidor analisou -- registrar decisão
                </button>
              ) : (
                <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                  Decisão registrada nesta sessão (ver Trilha de auditoria).
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
