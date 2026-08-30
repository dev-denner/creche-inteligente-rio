import type { OpportunityRecord } from "@/lib/opportunity";
import { assessPressure } from "@/lib/opportunity";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function CompetitionCard({ record }: { record: OpportunityRecord }) {
  const pressure = assessPressure(record);
  const filaEspera = record.fila_por_situacao["Lista de espera"] ?? 0;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">{pressure.nivel}</span>
        <ProvenanceBadge kind="historico-2025" />
      </div>
      <ul className="flex flex-col gap-1 text-sm text-black/70 dark:text-white/70">
        <li>{record.demanda_1a_preferencia} primeiras preferências (histórico 2025)</li>
        {record.capacidade_disponivel ? (
          <>
            <li>{record.meta_capacidade} de capacidade conhecida</li>
            <li>
              Pressão histórica:{" "}
              {record.relacao_demanda_1a_por_capacidade !== null
                ? `${record.relacao_demanda_1a_por_capacidade.toFixed(2)}×`
                : "não calculável"}
            </li>
          </>
        ) : (
          <li>Capacidade não disponível nesta extração (unidade pública)</li>
        )}
        <li>{filaEspera} crianças em lista de espera (histórico 2025)</li>
      </ul>
      <p className="text-xs text-black/50 dark:text-white/50">
        Referência histórica 2025 do dataset do desafio. Não é uma probabilidade individual de
        conseguir vaga.
      </p>
    </div>
  );
}
