import type { OpportunityRecord } from "@/lib/opportunity";

/**
 * Deterministic bullet points explaining why a unit surfaced in the
 * ranking -- code, not Claude. Claude only narrates these facts later.
 */
export function buildAttentionReasons(record: OpportunityRecord): string[] {
  const filaEspera = record.fila_por_situacao["Lista de espera"] ?? 0;
  const reasons: string[] = [];

  if (record.capacidade_disponivel && record.meta_capacidade !== null) {
    if (record.relacao_demanda_1a_por_capacidade !== null) {
      reasons.push(
        `Demanda de 1ª preferência (${record.demanda_1a_preferencia}) é ${record.relacao_demanda_1a_por_capacidade.toFixed(2)}× a capacidade contratada (${record.meta_capacidade}).`,
      );
    }
    if ((record.vagas_ofertadas ?? 0) <= 0) {
      reasons.push(
        `Sem vagas ofertadas neste snapshot (Meta − Matrícula = ${record.vagas_ofertadas ?? 0}).`,
      );
    }
    if (filaEspera > 0) {
      reasons.push(`${filaEspera} crianças em lista de espera nesta unidade/grupamento/turno.`);
    }
  } else {
    reasons.push(
      "Unidade pública sem capacidade/meta contratada nesta extração -- só é possível observar matrícula e número de turmas, não déficit/superávit de vagas.",
    );
    if (filaEspera > 0) {
      reasons.push(`${filaEspera} crianças em lista de espera nesta unidade/grupamento/turno.`);
    }
    if (record.matriculas !== null) {
      reasons.push(
        `${record.matriculas} crianças matriculadas${record.turmas !== null ? ` em ${record.turmas} turmas` : ""} (histórico 2025).`,
      );
    }
  }

  if (reasons.length === 0) {
    reasons.push("Dados insuficientes para uma explicação determinística além da demanda observada.");
  }

  return reasons;
}
