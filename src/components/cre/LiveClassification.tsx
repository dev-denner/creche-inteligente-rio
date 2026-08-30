"use client";

import { useState } from "react";

import type { PolicyLabFila } from "@/lib/policy-lab";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function LiveClassification({ fila }: { fila: PolicyLabFila }) {
  const ordenados = [...fila.candidatos].sort(
    (a, b) => b.pontuacao - a.pontuacao || a.candidato_id - b.candidato_id,
  );
  const [step, setStep] = useState<"convocado" | "expirado">("convocado");

  const atual = ordenados[0];
  const proximo = ordenados[1];

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-black/10 p-6 dark:border-white/10">
      <div className="flex flex-wrap items-center gap-2">
        <ProvenanceBadge kind="demonstracao" />
        <h2 className="text-lg font-semibold">Classificação viva</h2>
      </div>
      <p className="text-sm text-black/60 dark:text-white/60">
        Demonstração de como a fila se recalcula quando uma convocação expira, usando a ordenação
        real por pontuação (histórico 2025) da fila {fila.nome_unidade ?? `Unidade ${fila.unidade}`} (
        {fila.grupamento} · {fila.horario}).
      </p>

      <ol className="flex flex-col gap-3">
        <li className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
          <span className="font-medium">Candidato {atual.candidato_id}</span>
          <span className="text-emerald-800 dark:text-emerald-300">convocado</span>
          <span className="ml-auto font-mono text-xs text-black/50 dark:text-white/50">
            pontuação {atual.pontuacao}
          </span>
        </li>

        {step === "expirado" && (
          <>
            <li className="flex justify-center text-black/30 dark:text-white/30">↓ prazo expira ↓</li>
            <li className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm dark:border-stone-800 dark:bg-stone-900/40">
              <span className="font-medium">Candidato {atual.candidato_id}</span>
              <span>Encerramento por expiração — status oficial pendente</span>
              <ProvenanceBadge kind="pendente-sme" />
            </li>
            <li className="flex justify-center text-black/30 dark:text-white/30">↓ fila recalculada ↓</li>
            {proximo ? (
              <li className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
                <span className="font-medium">Candidato {proximo.candidato_id}</span>
                <span className="text-emerald-800 dark:text-emerald-300">próximo elegível</span>
                <span className="ml-auto font-mono text-xs text-black/50 dark:text-white/50">
                  pontuação {proximo.pontuacao}
                </span>
              </li>
            ) : (
              <li className="text-sm text-black/50 dark:text-white/50">Sem próximo candidato nesta amostra.</li>
            )}
          </>
        )}
      </ol>

      {step === "convocado" ? (
        <button
          onClick={() => setStep("expirado")}
          className="w-fit rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Simular expiração
        </button>
      ) : (
        <button
          onClick={() => setStep("convocado")}
          className="w-fit rounded-md border border-black/20 px-4 py-2 text-sm font-medium dark:border-white/20"
        >
          Reiniciar demonstração
        </button>
      )}
    </section>
  );
}
