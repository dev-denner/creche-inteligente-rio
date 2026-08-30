"use client";

import { useMemo, useState } from "react";

import type { PolicyLabData, Pesos } from "@/lib/policy-lab";
import { simulateAll } from "@/lib/policy-lab";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ClaudeAction } from "@/components/ClaudeAction";

const OPCOES = ["1", "2", "3", "4", "5"];
const OPCAO_LABEL: Record<string, string> = { "1": "1ª opção", "2": "2ª opção", "3": "3ª opção", "4": "4ª opção", "5": "5ª opção" };

export function PolicyLab({ data }: { data: PolicyLabData }) {
  const [pendingPesos, setPendingPesos] = useState<Pesos>(data.peso_padrao);
  const [appliedPesos, setAppliedPesos] = useState<Pesos | null>(null);
  const [selectedFilaIndex, setSelectedFilaIndex] = useState(0);

  const result = useMemo(() => {
    if (!appliedPesos) return null;
    return simulateAll(data, appliedPesos);
  }, [data, appliedPesos]);

  const selectedFilaResult = result?.filas[selectedFilaIndex] ?? null;
  const topMovers = useMemo(() => {
    if (!selectedFilaResult) return [];
    return [...selectedFilaResult.candidatos]
      .sort((a, b) => Math.abs(b.mudanca) - Math.abs(a.mudanca))
      .slice(0, 12);
  }, [selectedFilaResult]);

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-violet-200 bg-violet-50/40 p-6 dark:border-violet-900 dark:bg-violet-950/20">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold uppercase tracking-wide">Laboratório de Política Pública</h2>
        <ProvenanceBadge kind="proposta" />
      </div>
      <p className="text-sm text-black/70 dark:text-white/70">
        Simule como pesos diferentes para 1ª, 2ª, 3ª, 4ª e 5ª preferência alterariam a classificação,
        sem mudar a regra vigente. Isto <strong>não é regra vigente</strong> e <strong>não altera</strong>{" "}
        a classificação atual do Portal da Família -- a simulação é isolada, calculada aqui no
        navegador.
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-900/50 dark:text-violet-300">
          {data.total_candidatos.toLocaleString("pt-BR")} candidatos reais
        </span>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-900/50 dark:text-violet-300">
          {data.filas.length} filas reais de 2025
        </span>
        <ProvenanceBadge kind="historico-2025" />
      </div>
      <p className="text-xs text-black/50 dark:text-white/50">{data.aviso}</p>

      <div className="flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/30">
        <p className="text-sm font-medium">
          Peso adicional por ordem de preferência (somado à pontuação socioeconômica histórica 2025)
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          {OPCOES.map((opcao) => (
            <label key={opcao} className="flex flex-col gap-1 text-sm">
              <span className="flex items-center justify-between">
                <span>{OPCAO_LABEL[opcao]}</span>
                <span className="font-mono tabular-nums">{pendingPesos[opcao] ?? 0} pts</span>
              </span>
              <input
                type="range"
                min={0}
                max={30}
                step={1}
                value={pendingPesos[opcao] ?? 0}
                onChange={(e) =>
                  setPendingPesos((prev) => ({ ...prev, [opcao]: Number(e.target.value) }))
                }
                className="accent-violet-600"
              />
            </label>
          ))}
        </div>
        <button
          onClick={() => {
            setAppliedPesos({ ...pendingPesos, "6": 0 });
            setSelectedFilaIndex(0);
          }}
          className="w-fit rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Simular impacto
        </button>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
              <p className="text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
                Cenário base
              </p>
              <p className="text-sm">Pontuação socioeconômica histórica 2025</p>
            </div>
            <div className="rounded-xl border border-violet-300 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-950/30">
              <p className="text-xs font-medium text-violet-700 uppercase tracking-wide dark:text-violet-300">
                Cenário proposto
              </p>
              <p className="text-sm">Pontuação socioeconômica + peso de preferência</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Candidatos avaliados" value={result.impacto.totalCandidatos} />
            <StatTile label="Subiram de posição" value={result.impacto.subiram} tone="up" />
            <StatTile label="Desceram de posição" value={result.impacto.desceram} tone="down" />
            <StatTile label="Mantiveram posição" value={result.impacto.mantiveram} />
          </div>

          <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
            <p className="text-sm font-medium">Impacto sobre candidatos de 1ª preferência</p>
            <p className="text-sm text-black/70 dark:text-white/70">
              {result.impacto.primeiraPreferencia.total} candidatos de 1ª preferência na amostra --{" "}
              {result.impacto.primeiraPreferencia.subiram} subiram, {result.impacto.primeiraPreferencia.desceram}{" "}
              desceram, {result.impacto.primeiraPreferencia.mantiveram} mantiveram.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ImpactoLista titulo="Impacto por unidade" itens={result.impacto.porUnidade.slice(0, 8)} />
            <ImpactoLista titulo="Impacto por CRE" itens={result.impacto.porCre} />
          </div>

          <div className="flex flex-col gap-3">
            {topMovers[0] && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-violet-300 bg-white p-5 text-center dark:border-violet-800 dark:bg-black/30">
                <p className="text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
                  Maior mudança nesta fila -- Candidato {topMovers[0].candidato_id}
                </p>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-black/50 uppercase dark:text-white/50">Antes</p>
                    <p className="font-mono text-3xl font-bold tabular-nums">{topMovers[0].posicaoBase}º</p>
                  </div>
                  <span className="text-2xl text-black/20 dark:text-white/20">→</span>
                  <div>
                    <p className="text-xs text-black/50 uppercase dark:text-white/50">Simulação</p>
                    <p className="font-mono text-3xl font-bold tabular-nums text-violet-700 dark:text-violet-300">
                      {topMovers[0].posicaoSimulada}º
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm font-medium ${
                    topMovers[0].mudanca > 0
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {topMovers[0].mudanca > 0 ? "↑" : "↓"} {Math.abs(topMovers[0].mudanca)} posições
                </p>
                <p className="text-xs text-black/50 dark:text-white/50">
                  Candidato e pontuação são reais e anônimos; o resultado alternativo é uma simulação
                  de política.
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Detalhe por fila (maiores mudanças de posição)</p>
              <select
                value={selectedFilaIndex}
                onChange={(e) => setSelectedFilaIndex(Number(e.target.value))}
                className="rounded-md border border-black/20 bg-white px-2 py-1 text-sm dark:border-white/20 dark:bg-black"
              >
                {data.filas.map((f, i) => (
                  <option key={`${f.unidade}-${f.grupamento}-${f.horario}`} value={i}>
                    {f.nome_unidade ?? `Unidade ${f.unidade}`} ({f.grupamento} · {f.horario})
                  </option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-black/[.03] text-left text-xs text-black/50 dark:bg-white/[.05] dark:text-white/50">
                  <tr>
                    <th className="px-3 py-2 font-medium">Candidato</th>
                    <th className="px-3 py-2 font-medium">Opção usada</th>
                    <th className="px-3 py-2 font-medium text-right">Antes</th>
                    <th className="px-3 py-2 font-medium text-right">Depois</th>
                    <th className="px-3 py-2 font-medium text-right">Mudança</th>
                  </tr>
                </thead>
                <tbody>
                  {topMovers.map((c) => (
                    <tr key={c.candidato_id} className="border-t border-black/5 dark:border-white/5">
                      <td className="px-3 py-2">Candidato {c.candidato_id}</td>
                      <td className="px-3 py-2">{c.opcao}ª opção</td>
                      <td className="px-3 py-2 text-right tabular-nums">{c.posicaoBase}º</td>
                      <td className="px-3 py-2 text-right tabular-nums">{c.posicaoSimulada}º</td>
                      <td
                        className={`px-3 py-2 text-right font-medium tabular-nums ${
                          c.mudanca > 0
                            ? "text-emerald-700 dark:text-emerald-300"
                            : c.mudanca < 0
                              ? "text-rose-700 dark:text-rose-300"
                              : "text-black/50 dark:text-white/50"
                        }`}
                      >
                        {c.mudanca > 0 ? `↑ ${c.mudanca}` : c.mudanca < 0 ? `↓ ${Math.abs(c.mudanca)}` : "="}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-violet-200 pt-4 dark:border-violet-900">
            <ClaudeAction
              endpoint="/api/claude/analyze-policy"
              label="Analisar impacto com Claude"
              titulo="Análise do impacto da política"
              labels={["O que mudou", "Benefícios potenciais", "Riscos e efeitos adversos", "Pontos para análise normativa"]}
              getContext={() => ({
                pesos: appliedPesos,
                amostra: data.amostra,
                impactoGeral: {
                  totalCandidatos: result.impacto.totalCandidatos,
                  subiram: result.impacto.subiram,
                  desceram: result.impacto.desceram,
                  mantiveram: result.impacto.mantiveram,
                },
                impactoPrimeiraPreferencia: result.impacto.primeiraPreferencia,
                unidadesMaisAfetadas: result.impacto.porUnidade.slice(0, 5),
                impactoPorCre: result.impacto.porCre,
                avisosNormativos: [
                  "Simulação sobre amostra real de 2025, mas parcial (15 filas de maior demanda), sem replicar critérios de desempate oficiais da SME.",
                  "Proposta em avaliação -- não é regra vigente e não deve ser recomendada para adoção automática.",
                ],
              })}
            />
          </div>
        </>
      )}
    </section>
  );
}

function StatTile({ label, value, tone }: { label: string; value: number; tone?: "up" | "down" }) {
  const toneClass =
    tone === "up"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "down"
        ? "text-rose-700 dark:text-rose-300"
        : "";
  return (
    <div className="rounded-lg border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-black/30">
      <p className="text-xs text-black/60 dark:text-white/60">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}

function ImpactoLista({
  titulo,
  itens,
}: {
  titulo: string;
  itens: { chave: string; rotulo: string; subiram: number; desceram: number }[];
}) {
  return (
    <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
      <p className="mb-2 text-sm font-medium">{titulo}</p>
      <ul className="flex flex-col gap-1 text-sm">
        {itens.map((item) => (
          <li key={item.chave} className="flex items-center justify-between gap-2">
            <span className="truncate">{item.rotulo}</span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-black/50 dark:text-white/50">
              ↑{item.subiram} ↓{item.desceram}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
