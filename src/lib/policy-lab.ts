// Client-safe: types and pure, deterministic simulation logic only. No
// "node:fs" here -- see the note in lib/opportunity.ts for why. Server-only
// file reading lives in ./policy-lab-data.

export type PolicyLabCandidate = {
  candidato_id: number;
  opcao: number;
  pontuacao: number;
  situacao: string;
};

export type PolicyLabFila = {
  unidade: number;
  nome_unidade: string | null;
  grupamento: string;
  horario: string;
  cre: number | null;
  bairro: string | null;
  candidatos: PolicyLabCandidate[];
};

export type PolicyLabData = {
  ano: number;
  rotulo: string;
  fonte: string;
  aviso: string;
  peso_padrao: Record<string, number>;
  amostra: string;
  filas: PolicyLabFila[];
  total_candidatos: number;
};

export type Pesos = Record<string, number>;

export type CandidateResult = PolicyLabCandidate & {
  posicaoBase: number;
  posicaoSimulada: number;
  mudanca: number;
};

export type FilaResult = {
  fila: PolicyLabFila;
  candidatos: CandidateResult[];
};

function rankPositions(candidatos: PolicyLabCandidate[], score: (c: PolicyLabCandidate) => number): Map<number, number> {
  const sorted = [...candidatos].sort((a, b) => score(b) - score(a) || a.candidato_id - b.candidato_id);
  const positions = new Map<number, number>();
  sorted.forEach((c, i) => positions.set(c.candidato_id, i + 1));
  return positions;
}

/** Deterministic re-ranking -- no Claude involved. */
export function simulateFila(fila: PolicyLabFila, pesos: Pesos): FilaResult {
  const baseScore = (c: PolicyLabCandidate) => c.pontuacao;
  const simScore = (c: PolicyLabCandidate) => c.pontuacao + (pesos[String(c.opcao)] ?? 0);
  const basePos = rankPositions(fila.candidatos, baseScore);
  const simPos = rankPositions(fila.candidatos, simScore);

  const candidatos = fila.candidatos.map((c) => {
    const posicaoBase = basePos.get(c.candidato_id)!;
    const posicaoSimulada = simPos.get(c.candidato_id)!;
    return { ...c, posicaoBase, posicaoSimulada, mudanca: posicaoBase - posicaoSimulada };
  });

  return { fila, candidatos };
}

export type ImpactoPorGrupo = {
  chave: string;
  rotulo: string;
  subiram: number;
  desceram: number;
  mantiveram: number;
};

export type ImpactoAgregado = {
  totalCandidatos: number;
  subiram: number;
  desceram: number;
  mantiveram: number;
  primeiraPreferencia: { subiram: number; desceram: number; mantiveram: number; total: number };
  porUnidade: ImpactoPorGrupo[];
  porCre: ImpactoPorGrupo[];
};

export function simulateAll(data: PolicyLabData, pesos: Pesos): { filas: FilaResult[]; impacto: ImpactoAgregado } {
  const filas = data.filas.map((f) => simulateFila(f, pesos));

  let subiram = 0;
  let desceram = 0;
  let mantiveram = 0;
  const pp = { subiram: 0, desceram: 0, mantiveram: 0, total: 0 };
  const porUnidade = new Map<string, ImpactoPorGrupo>();
  const porCre = new Map<string, ImpactoPorGrupo>();

  for (const { fila, candidatos } of filas) {
    const unidadeKey = `${fila.unidade}-${fila.grupamento}-${fila.horario}`;
    if (!porUnidade.has(unidadeKey)) {
      porUnidade.set(unidadeKey, {
        chave: unidadeKey,
        rotulo: `${fila.nome_unidade ?? `Unidade ${fila.unidade}`} (${fila.grupamento} · ${fila.horario})`,
        subiram: 0,
        desceram: 0,
        mantiveram: 0,
      });
    }
    const creKey = fila.cre !== null ? String(fila.cre) : "sem-cre";
    if (!porCre.has(creKey)) {
      porCre.set(creKey, {
        chave: creKey,
        rotulo: fila.cre !== null ? `CRE ${fila.cre}` : "CRE não disponível",
        subiram: 0,
        desceram: 0,
        mantiveram: 0,
      });
    }
    const u = porUnidade.get(unidadeKey)!;
    const c = porCre.get(creKey)!;

    for (const cand of candidatos) {
      if (cand.mudanca > 0) {
        subiram++;
        u.subiram++;
        c.subiram++;
      } else if (cand.mudanca < 0) {
        desceram++;
        u.desceram++;
        c.desceram++;
      } else {
        mantiveram++;
        u.mantiveram++;
        c.mantiveram++;
      }

      if (cand.opcao === 1) {
        pp.total++;
        if (cand.mudanca > 0) pp.subiram++;
        else if (cand.mudanca < 0) pp.desceram++;
        else pp.mantiveram++;
      }
    }
  }

  return {
    filas,
    impacto: {
      totalCandidatos: subiram + desceram + mantiveram,
      subiram,
      desceram,
      mantiveram,
      primeiraPreferencia: pp,
      porUnidade: [...porUnidade.values()].sort((a, b) => b.subiram + b.desceram - (a.subiram + a.desceram)),
      porCre: [...porCre.values()].sort((a, b) => (a.rotulo > b.rotulo ? 1 : -1)),
    },
  };
}
