"use client";

import { useMemo, useState } from "react";

import type { OpportunityRecord } from "@/lib/opportunity";
import { assessPressure } from "@/lib/opportunity";
import type { ReguaData } from "@/lib/regua";
import { statusMeta, TONE_CLASSNAMES } from "@/lib/status";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { CountdownDemo } from "@/components/family/CountdownDemo";
import { OptionCard } from "@/components/family/OptionCard";
import { ExplainWithClaude } from "@/components/family/ExplainWithClaude";
import { CpfIdentity } from "@/components/family/CpfIdentity";
import { GovBrEntry } from "@/components/family/GovBrEntry";
import { TrustedContacts } from "@/components/family/TrustedContacts";
import { ContactAttempts } from "@/components/family/ContactAttempts";
import { ValidationSources } from "@/components/family/ValidationSources";
import { PreferenceTransparency } from "@/components/family/PreferenceTransparency";
import { DocumentTriage } from "@/components/family/DocumentTriage";

type OptionEntry = { ordem: number; statusReal: string; record: OpportunityRecord | null };

export function FamilyPortal({
  options,
  suggestion,
  regua,
  demoRespostas,
  prazoMs,
}: {
  options: OptionEntry[];
  suggestion: OpportunityRecord | null;
  regua: ReguaData | null;
  demoRespostas: Record<number, boolean>;
  prazoMs: number;
}) {
  const hero = options[0];
  const [expandedOrdem, setExpandedOrdem] = useState(hero.ordem);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const expandedOption = options.find((o) => o.ordem === expandedOrdem) ?? hero;

  const totalDemonstrativo = useMemo(() => {
    if (!regua) return 0;
    return regua.perguntas
      .filter((p) => demoRespostas[p.perg_id])
      .reduce((sum, p) => sum + p.pontuacao, 0);
  }, [regua, demoRespostas]);

  const heroPressure = hero.record ? assessPressure(hero.record) : null;
  const heroMeta = statusMeta(confirmed ? "Confirmado" : hero.statusReal);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10 sm:py-14">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-black/50 dark:text-white/50">Olá, responsável</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Acompanhe a inscrição da criança
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <ProvenanceBadge kind="demonstracao" />
          <span className="text-xs text-black/50 dark:text-white/50">Processo demonstrativo</span>
          <span className="ml-auto">
            <GovBrEntry />
          </span>
        </div>
      </header>

      <CpfIdentity />

      {/* Main status card */}
      <section className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-black/[.02] p-6 dark:border-white/10 dark:bg-white/[.03]">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">
            {confirmed ? "Vaga confirmada" : "Você foi convocado para uma vaga"}
          </h2>
          <p className="text-lg">{hero.record?.nome_unidade ?? `Unidade ${hero.record?.unidade}`}</p>
          <p className="text-black/60 dark:text-white/60">
            {hero.record?.grupamento} · {hero.record?.horario}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${TONE_CLASSNAMES[heroMeta.tone]}`}
          >
            {confirmed ? "Confirmado" : hero.statusReal}
          </span>
          {hero.record?.bairro && (
            <span className="text-xs text-black/50 dark:text-white/50">
              {hero.record.bairro}{hero.record.cre ? ` · CRE ${hero.record.cre}` : ""}
            </span>
          )}
        </div>

        {heroPressure && (
          <p className="text-xs text-black/50 dark:text-white/50">
            Referência histórica 2025: {heroPressure.explicacao}
          </p>
        )}

        {!confirmed && <CountdownDemo durationMs={prazoMs} />}

        {!confirmed && !confirming && (
          <div>
            <button
              onClick={() => setConfirming(true)}
              className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
            >
              Confirmar vaga
            </button>
            <p className="mt-2 text-xs text-black/50 dark:text-white/50">
              Confirme sua vaga dentro do prazo.
            </p>
          </div>
        )}

        {!confirmed && confirming && (
          <div className="flex flex-col gap-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/40">
            <p className="text-sm">
              Esta é uma <strong>simulação de fluxo</strong> de confirmação de vaga. Nada é salvo em
              nenhum banco de dados -- atualizar a página restaura o cenário inicial.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setConfirmed(true);
                  setConfirming(false);
                }}
                className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black"
              >
                Confirmar (simulação)
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-md border border-black/20 px-3 py-1.5 text-sm font-medium dark:border-white/20"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {confirmed && (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Vaga confirmada nesta simulação. As demais opções abaixo mostram o encerramento
            pendente de parametrização oficial.
          </p>
        )}
      </section>

      {/* Minhas opções */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
          Minhas opções
        </h2>
        <div className="flex flex-col gap-3">
          {options.map((opt) => (
            <OptionCard
              key={opt.ordem}
              ordem={opt.ordem}
              record={opt.record}
              statusReal={opt.ordem === hero.ordem && confirmed ? "Confirmado" : opt.statusReal}
              expanded={expandedOrdem === opt.ordem}
              onToggle={() => setExpandedOrdem(expandedOrdem === opt.ordem ? -1 : opt.ordem)}
              pendingClosure={confirmed && opt.ordem !== hero.ordem}
            />
          ))}
        </div>
      </section>

      {/* Central de Convocação Inteligente */}
      <ContactAttempts />

      {/* Contatos de confiança */}
      <TrustedContacts />

      {/* Entenda sua classificação */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
            Entenda sua classificação
          </h2>
        </div>
        {regua ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <ProvenanceBadge kind="historico-2025" />
              <span className="text-xs text-black/50 dark:text-white/50">{regua.rotulo}</span>
            </div>
            <p className="text-xs text-black/50 dark:text-white/50">{regua.aviso}</p>
            <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-black/[.03] text-left text-xs text-black/50 dark:bg-white/[.05] dark:text-white/50">
                  <tr>
                    <th className="px-3 py-2 font-medium">Critério</th>
                    <th className="px-3 py-2 font-medium">Pontos (histórico 2025)</th>
                    <th className="px-3 py-2 font-medium">Resposta demonstrativa</th>
                  </tr>
                </thead>
                <tbody>
                  {regua.perguntas.map((p) => (
                    <tr key={p.perg_id} className="border-t border-black/5 dark:border-white/5">
                      <td className="px-3 py-2">{p.pergunta_texto}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {p.criterio_desempate ? "critério de desempate" : p.pontuacao}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                            demoRespostas[p.perg_id]
                              ? "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900"
                              : "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:ring-slate-800"
                          }`}
                        >
                          {demoRespostas[p.perg_id] ? "Sim" : "Não"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-black/[.03] px-4 py-3 dark:bg-white/[.05]">
              <span className="text-sm font-medium">Total demonstrativo</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-lg font-semibold tabular-nums">{totalDemonstrativo} pts</span>
                <ProvenanceBadge kind="demonstracao" />
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-black/60 dark:text-white/60">
            Régua não encontrada. Rode <code>python scripts/build_regua.py</code>.
          </p>
        )}
      </section>

      <ValidationSources />

      {/* Concorrência histórica */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
          Concorrência histórica ({expandedOption.ordem}ª opção)
        </h2>
        {expandedOption.record ? (
          <CompetitionCard record={expandedOption.record} />
        ) : (
          <p className="text-sm text-black/60 dark:text-white/60">Sem dados para esta opção.</p>
        )}
      </section>

      {/* Outras unidades para considerar */}
      {suggestion && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
              Outras unidades para considerar
            </h2>
            <ProvenanceBadge kind="proposta" />
          </div>
          <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
            <p className="font-medium">{suggestion.nome_unidade ?? `Unidade ${suggestion.unidade}`}</p>
            <p className="text-sm text-black/60 dark:text-white/60">
              {suggestion.grupamento} · {suggestion.horario} · {suggestion.bairro ?? "bairro não disponível"}
            </p>
            <p className="mt-2 text-xs text-black/50 dark:text-white/50">
              Sugestão baseada em menor pressão histórica observada no mesmo grupamento/turno
              (referência 2025 do dataset do desafio). Não substitui a escolha oficial da família
              nem qualquer critério normativo da SME.
            </p>
          </div>
        </section>
      )}

      <PreferenceTransparency />

      <DocumentTriage />

      {/* Explique minha situação */}
      <ExplainWithClaude
        getContext={() => ({
          status: confirmed ? "Confirmado" : hero.statusReal,
          opcoes: options.map((o) => ({
            ordem: o.ordem,
            unidade: o.record?.nome_unidade ?? o.record?.unidade,
            grupamento: o.record?.grupamento,
            horario: o.record?.horario,
            status: o.ordem === hero.ordem && confirmed ? "Confirmado" : o.statusReal,
          })),
          classificacao: {
            regua: regua?.rotulo ?? null,
            totalDemonstrativo,
            observacao: "total calculado a partir de respostas demonstrativas, não de uma criança real",
          },
          prazo: {
            rotulo: "prazo demonstrativo",
            aviso: "A duração e a regra de contagem deverão seguir a parametrização oficial da SME.",
          },
          avisosNormativos: [
            "Cenário demonstrativo -- não representa uma família real do dataset.",
            "A régua de pontuação é histórica (2025) e pode não ser a vigente hoje.",
            "Encerramento de outras opções após confirmação depende de parametrização oficial da SME.",
          ],
        })}
      />
    </div>
  );
}

function CompetitionCard({ record }: { record: OpportunityRecord }) {
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
