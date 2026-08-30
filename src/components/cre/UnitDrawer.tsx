"use client";

import type { OpportunityRecord } from "@/lib/opportunity";
import { assessPressure } from "@/lib/opportunity";
import { buildAttentionReasons } from "@/lib/cre-insights";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { AnalyzeWithClaude } from "@/components/cre/AnalyzeWithClaude";

export function UnitDrawer({ record, onClose }: { record: OpportunityRecord; onClose: () => void }) {
  const pressure = assessPressure(record);
  const reasons = buildAttentionReasons(record);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col gap-5 overflow-y-auto bg-white p-6 shadow-xl dark:bg-neutral-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-black/50 dark:text-white/50">
              Unidade {record.unidade} · CRE {record.cre ?? "—"}
            </p>
            <h3 className="text-lg font-semibold">{record.nome_unidade ?? `Unidade ${record.unidade}`}</h3>
            <p className="text-sm text-black/60 dark:text-white/60">
              {record.grupamento} · {record.horario} · {record.bairro ?? "bairro não disponível"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10"
          >
            Fechar
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ProvenanceBadge kind="historico-2025" />
          <span className="text-xs text-black/50 dark:text-white/50">
            {record.tipo_oferta === "parceira" ? "Unidade parceira" : record.tipo_oferta === "publica" ? "Unidade pública" : "Tipo não identificado"}
          </span>
        </div>

        <section>
          <h4 className="mb-2 text-sm font-medium">Por que esta unidade precisa de atenção?</h4>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg font-semibold">{pressure.nivel}</span>
            <span className="text-xs text-black/50 dark:text-white/50">nível de pressão (heurística determinística)</span>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-black/70 dark:text-white/70">
            {reasons.map((reason, i) => (
              <li key={i} className="rounded-md bg-black/[.03] px-3 py-2 dark:bg-white/[.05]">
                {reason}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="1ª preferência" value={record.demanda_1a_preferencia} />
          <Metric label="Preferência total (unidade)" value={record.demanda_total_preferencia_unidade} />
          <Metric label="Lista de espera" value={record.fila_por_situacao["Lista de espera"] ?? 0} />
          <Metric
            label="Capacidade (Meta)"
            value={record.capacidade_disponivel ? record.meta_capacidade : "Capacidade não disponível nesta extração"}
          />
          <Metric label="Matrículas" value={record.matriculas ?? "—"} />
          <Metric
            label="Vagas ofertadas"
            value={record.capacidade_disponivel ? record.vagas_ofertadas : "Capacidade não disponível nesta extração"}
          />
        </section>

        <section className="flex flex-col gap-3 border-t border-black/10 pt-4 dark:border-white/10">
          <h4 className="text-sm font-medium">Analisar com Claude</h4>
          <AnalyzeWithClaude
            getContext={() => ({
              unidade: record.unidade,
              nome: record.nome_unidade,
              cre: record.cre,
              bairro: record.bairro,
              grupamento: record.grupamento,
              horario: record.horario,
              tipoOferta: record.tipo_oferta,
              capacidadeDisponivel: record.capacidade_disponivel,
              metaCapacidade: record.meta_capacidade,
              matriculas: record.matriculas,
              turmas: record.turmas,
              vagasOfertadas: record.vagas_ofertadas,
              demanda1aPreferencia: record.demanda_1a_preferencia,
              demandaTotalPreferenciaUnidade: record.demanda_total_preferencia_unidade,
              filaPorSituacao: record.fila_por_situacao,
              relacaoDemandaPorCapacidade: record.relacao_demanda_1a_por_capacidade,
              saldoPotencial: record.saldo_potencial,
              nivelPressaoHeuristico: pressure.nivel,
              avisosNormativos: [
                "Dados agregados históricos de 2025 do dataset do desafio -- não representam a situação atual da rede.",
                record.capacidade_disponivel
                  ? null
                  : "Sem capacidade/meta contratada conhecida para esta unidade nesta extração.",
              ].filter(Boolean),
            })}
          />
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10">
      <p className="text-xs text-black/50 dark:text-white/50">{label}</p>
      <p className="font-mono text-sm font-semibold tabular-nums">{value ?? "—"}</p>
    </div>
  );
}
