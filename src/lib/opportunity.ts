// Client-safe: types and pure helpers only. Never import "node:fs"/"node:path"
// here -- this module is imported by client components ("use client"), and
// Next.js bundles a module's full import graph even when only one pure
// function is used. Server-only file reading lives in ./opportunity-data.

export type SituacaoCounts = Record<string, number>;

export type OpportunityRecord = {
  unidade: number;
  nome_unidade: string | null;
  grupamento: string;
  horario: string;
  cre: number | null;
  bairro: string | null;
  microarea: string | null;
  latitude: number | null;
  longitude: number | null;
  tipo_unidade: string | null;
  demanda_1a_preferencia: number;
  demanda_total_preferencia_unidade: number;
  fila_por_situacao: SituacaoCounts;
  tipo_oferta: "parceira" | "publica" | null;
  capacidade_disponivel: boolean;
  meta_capacidade: number | null;
  matriculas: number | null;
  turmas: number | null;
  vagas_ofertadas: number | null;
  relacao_demanda_1a_por_capacidade: number | null;
  saldo_potencial: number | null;
};

export type OpportunityData = {
  ano: number;
  grao: string;
  join_key: string;
  definicoes: Record<string, string>;
  cobertura: {
    unidades_query_a_2025: number;
    unidades_com_registro_de_oferta: number;
    cobertura_oferta_pct: number;
    unidades_com_territorio: number;
    cobertura_territorio_pct: number;
  };
  registros: OpportunityRecord[];
  ranking_maior_pressao_com_capacidade_conhecida: OpportunityRecord[];
  ranking_possivel_superavit_com_capacidade_conhecida: OpportunityRecord[];
  ranking_maior_demanda_1a_preferencia_geral: OpportunityRecord[];
};

export function findOpportunityRecord(
  records: OpportunityRecord[],
  unidade: number,
  grupamento: string,
  horario: string,
): OpportunityRecord | null {
  return (
    records.find((r) => r.unidade === unidade && r.grupamento === grupamento && r.horario === horario) ?? null
  );
}

export function recordKey(r: Pick<OpportunityRecord, "unidade" | "grupamento" | "horario">): string {
  return `${r.unidade}-${r.grupamento}-${r.horario}`;
}

export type PressureLevel = "ALTA" | "MÉDIA" | "BAIXA";

export type PressureAssessment = {
  nivel: PressureLevel;
  capacidadeConhecida: boolean;
  explicacao: string;
};

/**
 * Deterministic, documented heuristic -- not a Claude output. When capacity
 * is known (partner units), compares 1st-preference demand to capacity.
 * When it isn't (public units), falls back to the observed waitlist size,
 * clearly flagged as a weaker signal since there is no capacity to compare against.
 */
export function assessPressure(r: OpportunityRecord): PressureAssessment {
  const filaEspera = r.fila_por_situacao["Lista de espera"] ?? 0;

  if (r.capacidade_disponivel && r.relacao_demanda_1a_por_capacidade !== null) {
    const relacao = r.relacao_demanda_1a_por_capacidade;
    const nivel: PressureLevel = relacao >= 2 ? "ALTA" : relacao >= 1 ? "MÉDIA" : "BAIXA";
    return {
      nivel,
      capacidadeConhecida: true,
      explicacao: `${r.demanda_1a_preferencia} primeiras preferências para ${r.meta_capacidade} vagas de capacidade conhecida (${relacao.toFixed(2)}×).`,
    };
  }

  const nivel: PressureLevel = filaEspera >= 100 ? "ALTA" : filaEspera >= 20 ? "MÉDIA" : "BAIXA";
  return {
    nivel,
    capacidadeConhecida: false,
    explicacao: `${filaEspera} crianças em lista de espera nesta unidade/grupamento/turno, sem capacidade contratada disponível nesta extração para comparar.`,
  };
}
