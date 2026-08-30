import type { OpportunityRecord } from "@/lib/opportunity";
import type { ReguaData } from "@/lib/regua";
import { buildDemoTimeline } from "@/lib/demo-scenario";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { Tabs } from "@/components/Tabs";
import { ClassificationSection } from "@/components/family/ClassificationSection";
import { CompetitionCard } from "@/components/family/CompetitionCard";
import { PreferenceTransparency } from "@/components/family/PreferenceTransparency";

const DETAIL_TABS = [
  { id: "situacao", label: "Situação e histórico" },
  { id: "classificacao", label: "Entenda sua classificação" },
  { id: "preferencia", label: "Preferência" },
  { id: "concorrencia", label: "Concorrência e similares" },
];

export function OptionDetail({
  ordem,
  record,
  statusReal,
  pendingClosure,
  regua,
  demoRespostas,
  totalDemonstrativo,
  suggestion,
}: {
  ordem: number;
  record: OpportunityRecord | null;
  statusReal: string;
  pendingClosure: boolean;
  regua: ReguaData | null;
  demoRespostas: Record<number, boolean>;
  totalDemonstrativo: number;
  suggestion: OpportunityRecord | null;
}) {
  const timeline = buildDemoTimeline(statusReal);

  return (
    <div className="border-t border-black/10 p-4 dark:border-white/10">
      <Tabs tabs={DETAIL_TABS}>
        {(active) => (
          <>
            {active === "situacao" && (
              <div className="flex flex-col gap-4">
                {pendingClosure && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                    <p className="font-medium">Encerramento das demais opções</p>
                    <p className="text-xs">Regra/status final pendente de parametrização SME.</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
                    Linha do tempo
                  </p>
                  <ProvenanceBadge kind="demonstracao" />
                </div>
                <ol className="flex flex-col gap-3">
                  {timeline.map((event, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-16 shrink-0 font-mono text-xs text-black/40 dark:text-white/40">
                        {event.data}
                        <br />
                        {event.hora}
                      </span>
                      <span>
                        <span className="font-medium">{event.evento}</span>
                        <span className="block text-xs text-black/60 dark:text-white/60">{event.detalhe}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {active === "classificacao" && (
              <ClassificationSection
                regua={regua}
                demoRespostas={demoRespostas}
                totalDemonstrativo={totalDemonstrativo}
              />
            )}

            {active === "preferencia" && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-black/70 dark:text-white/70">
                  Esta é sua {ordem}ª preferência.
                </p>
                <PreferenceTransparency />
              </div>
            )}

            {active === "concorrencia" && (
              <div className="flex flex-col gap-4">
                {record ? (
                  <CompetitionCard record={record} />
                ) : (
                  <p className="text-sm text-black/60 dark:text-white/60">Sem dados para esta opção.</p>
                )}
                {ordem === 1 && suggestion && (
                  <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-sm font-medium">Outras unidades para considerar</p>
                      <ProvenanceBadge kind="proposta" />
                    </div>
                    <p className="font-medium">{suggestion.nome_unidade ?? `Unidade ${suggestion.unidade}`}</p>
                    <p className="text-sm text-black/60 dark:text-white/60">
                      {suggestion.grupamento} · {suggestion.horario} ·{" "}
                      {suggestion.bairro ?? "bairro não disponível"}
                    </p>
                    <p className="mt-2 text-xs text-black/50 dark:text-white/50">
                      Sugestão baseada em menor pressão histórica observada no mesmo grupamento/turno
                      (referência 2025 do dataset do desafio). Não substitui a escolha oficial da
                      família nem qualquer critério normativo da SME.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Tabs>
    </div>
  );
}
