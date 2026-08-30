"use client";

import { useMemo, useState } from "react";

import type { OpportunityRecord } from "@/lib/opportunity";
import type { ReguaData } from "@/lib/regua";
import { buildDemoTimeline } from "@/lib/demo-scenario";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { Tabs } from "@/components/Tabs";
import { ClaudeAction } from "@/components/ClaudeAction";
import { ChildCard } from "@/components/family/ChildCard";
import { AttentionBlock } from "@/components/family/AttentionBlock";
import { OptionCard } from "@/components/family/OptionCard";
import { ClassificationSection } from "@/components/family/ClassificationSection";
import { ValidationSources } from "@/components/family/ValidationSources";
import { ContactAttempts } from "@/components/family/ContactAttempts";
import { TrustedContacts } from "@/components/family/TrustedContacts";
import { DocumentTriage } from "@/components/family/DocumentTriage";

type OptionEntry = { ordem: number; statusReal: string; record: OpportunityRecord | null };

const CONVOCADO_STATUSES = new Set(["Selecionado", "Selecionado da lista"]);

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

  const totalDemonstrativo = useMemo(() => {
    if (!regua) return 0;
    return regua.perguntas.filter((p) => demoRespostas[p.perg_id]).reduce((sum, p) => sum + p.pontuacao, 0);
  }, [regua, demoRespostas]);

  const heroStatus = confirmed ? "Confirmado" : hero.statusReal;
  const isConvocado = CONVOCADO_STATUSES.has(hero.statusReal) || confirmed;

  const tabs = [
    { id: "inscricao", label: "Minha inscrição" },
    { id: "classificacao", label: "Minha classificação" },
    { id: "opcoes", label: "Minhas opções" },
    { id: "documentos", label: "Documentos e dados" },
    ...(isConvocado ? [{ id: "convocacao", label: "Convocação" }] : []),
  ];

  function optionCardProps(opt: OptionEntry) {
    return {
      ordem: opt.ordem,
      record: opt.record,
      statusReal: opt.ordem === hero.ordem && confirmed ? "Confirmado" : opt.statusReal,
      expanded: expandedOrdem === opt.ordem,
      onToggle: () => setExpandedOrdem(expandedOrdem === opt.ordem ? -1 : opt.ordem),
      pendingClosure: confirmed && opt.ordem !== hero.ordem,
      regua,
      demoRespostas,
      totalDemonstrativo,
      suggestion,
    };
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10 sm:py-14">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide dark:text-blue-300">
          Minha inscrição
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Olá, Ana</h1>
        <p className="text-black/60 dark:text-white/60">Acompanhe a inscrição de Maria.</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Inscrição Creche 2027</span>
          <ProvenanceBadge kind="demonstracao" />
          <span className="text-xs text-black/50 dark:text-white/50">Cenário demonstrativo</span>
        </div>
      </header>

      <ChildCard hero={hero.record} totalOpcoes={options.length} />

      <AttentionBlock
        statusReal={hero.statusReal}
        confirmed={confirmed}
        hero={hero.record}
        prazoMs={prazoMs}
        confirming={confirming}
        onConfirmarClick={() => setConfirming(true)}
        onConfirm={() => {
          setConfirmed(true);
          setConfirming(false);
        }}
        onCancelar={() => setConfirming(false)}
      />

      <Tabs tabs={tabs} initial="opcoes">
        {(active) => (
          <>
            {active === "inscricao" && (
              <div className="flex flex-col gap-4">
                <OptionCard key={hero.ordem} {...optionCardProps(hero)} />
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
                    Demais opções
                  </p>
                  <ul className="flex flex-wrap gap-2 text-sm">
                    {options.slice(1).map((o) => (
                      <li
                        key={o.ordem}
                        className="rounded-full border border-black/10 px-3 py-1 dark:border-white/10"
                      >
                        {o.ordem}ª -- {o.record?.nome_unidade ?? `Unidade ${o.record?.unidade}`} ·{" "}
                        {o.ordem === hero.ordem && confirmed ? "Confirmado" : o.statusReal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {active === "classificacao" && (
              <div className="flex flex-col gap-6">
                <ClassificationSection
                  regua={regua}
                  demoRespostas={demoRespostas}
                  totalDemonstrativo={totalDemonstrativo}
                />
              </div>
            )}

            {active === "opcoes" && (
              <div className="flex flex-col gap-3">
                {options.map((opt) => (
                  <OptionCard key={opt.ordem} {...optionCardProps(opt)} />
                ))}
              </div>
            )}

            {active === "documentos" && (
              <div className="flex flex-col gap-6">
                <DocumentTriage />
                <ValidationSources />
              </div>
            )}

            {active === "convocacao" && (
              <div className="flex flex-col gap-6">
                <ContactAttempts />
                <TrustedContacts />
                <div>
                  <p className="mb-2 text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
                    Linha do tempo
                  </p>
                  <ol className="flex flex-col gap-3">
                    {buildDemoTimeline(heroStatus).map((event, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="w-16 shrink-0 font-mono text-xs text-black/40 dark:text-white/40">
                          {event.data}
                          <br />
                          {event.hora}
                        </span>
                        <span>
                          <span className="font-medium">{event.evento}</span>
                          <span className="block text-xs text-black/60 dark:text-white/60">
                            {event.detalhe}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </>
        )}
      </Tabs>

      <ClaudeAction
        endpoint="/api/claude/explain-family"
        label="Explique minha situação"
        loadingLabel="Consultando Claude..."
        titulo="Explicação da situação"
        labels={["Resumo", "Pontos de atenção", "Próximo passo"]}
        getContext={() => ({
          status: heroStatus,
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
