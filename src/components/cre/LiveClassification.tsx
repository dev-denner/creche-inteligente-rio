"use client";

import { useState } from "react";

import type { PolicyLabFila } from "@/lib/policy-lab";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function LiveClassification({
  fila,
  onExpire,
}: {
  fila: PolicyLabFila;
  onExpire?: (candidatoId: number, unidade: string) => void;
}) {
  const ordenados = [...fila.candidatos].sort(
    (a, b) => b.pontuacao - a.pontuacao || a.candidato_id - b.candidato_id,
  );
  const [step, setStep] = useState<"convocado" | "expirado">("convocado");

  const atual = ordenados[0];
  const proximo = ordenados[1];
  const unidadeLabel = fila.nome_unidade ?? `Unidade ${fila.unidade}`;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-black/10 p-6 dark:border-white/10">
      <div className="flex flex-wrap items-center gap-2">
        <ProvenanceBadge kind="demonstracao" />
        <h2 className="text-lg font-semibold">Classificação viva</h2>
      </div>
      <p className="text-sm text-black/60 dark:text-white/60">
        Demonstração de como a fila se recalcula quando uma convocação expira, usando a ordenação
        real por pontuação (histórico 2025) da fila {unidadeLabel} ({fila.grupamento} · {fila.horario}).
      </p>

      <ol className="flex flex-col items-center gap-2">
        <li className="w-full max-w-sm rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
          <span className="font-medium">Candidato {atual.candidato_id}</span>{" "}
          <span className="text-emerald-800 dark:text-emerald-300">convocado</span>
          <span className="ml-2 font-mono text-xs text-black/50 dark:text-white/50">
            pontuação {atual.pontuacao}
          </span>
        </li>

        {step === "expirado" && (
          <>
            <li className="text-black/30 dark:text-white/30">↓ prazo expirou ↓</li>
            <li className="w-full max-w-sm rounded-lg border border-stone-200 bg-stone-50 p-3 text-center text-sm dark:border-stone-800 dark:bg-stone-900/40">
              Opção encerrada -- Encerramento por expiração, status oficial pendente
              <div className="mt-1">
                <ProvenanceBadge kind="pendente-sme" />
              </div>
            </li>
            <li className="text-black/30 dark:text-white/30">↓ fila recalculada ↓</li>
            {proximo ? (
              <li className="w-full max-w-sm rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
                <span className="font-medium">Candidato {proximo.candidato_id}</span>{" "}
                <span className="text-emerald-800 dark:text-emerald-300">próximo elegível</span>
                <span className="ml-2 font-mono text-xs text-black/50 dark:text-white/50">
                  pontuação {proximo.pontuacao}
                </span>
              </li>
            ) : (
              <li className="text-sm text-black/50 dark:text-white/50">Sem próximo candidato nesta amostra.</li>
            )}
          </>
        )}
      </ol>

      {step === "expirado" && (
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-black/[.03] p-3 text-sm dark:bg-white/[.05]">
          <div>
            <p className="text-xs text-black/50 uppercase dark:text-white/50">Antes</p>
            <p className="font-medium">Candidato {atual.candidato_id} no topo</p>
          </div>
          <div>
            <p className="text-xs text-black/50 uppercase dark:text-white/50">Depois</p>
            <p className="font-medium">
              Candidato {proximo?.candidato_id ?? "--"} no topo
            </p>
          </div>
        </div>
      )}

      {step === "convocado" ? (
        <button
          onClick={() => {
            setStep("expirado");
            onExpire?.(atual.candidato_id, unidadeLabel);
          }}
          className="w-fit rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white dark:bg-blue-600"
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
