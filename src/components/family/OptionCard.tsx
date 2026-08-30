import type { OpportunityRecord } from "@/lib/opportunity";
import { assessPressure } from "@/lib/opportunity";
import type { ReguaData } from "@/lib/regua";
import { statusMeta, TONE_CLASSNAMES } from "@/lib/status";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { OptionDetail } from "@/components/family/OptionDetail";

export function OptionCard({
  ordem,
  record,
  statusReal,
  expanded,
  onToggle,
  pendingClosure,
  regua,
  demoRespostas,
  totalDemonstrativo,
  suggestion,
}: {
  ordem: number;
  record: OpportunityRecord | null;
  statusReal: string;
  expanded: boolean;
  onToggle: () => void;
  pendingClosure: boolean;
  regua: ReguaData | null;
  demoRespostas: Record<number, boolean>;
  totalDemonstrativo: number;
  suggestion: OpportunityRecord | null;
}) {
  const meta = statusMeta(statusReal);
  const featured = ordem === 1;
  const pressure = featured && record ? assessPressure(record) : null;

  return (
    <div
      className={
        featured
          ? "rounded-xl border-2 border-blue-300 bg-blue-50/40 dark:border-blue-700 dark:bg-blue-950/20"
          : "rounded-xl border border-black/10 dark:border-white/10"
      }
    >
      <button type="button" onClick={onToggle} className="flex w-full flex-col gap-2 p-4 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            className={`text-xs font-medium uppercase tracking-wide ${
              featured ? "text-blue-800 dark:text-blue-300" : "text-black/50 dark:text-white/50"
            }`}
          >
            {featured ? "1ª preferência · sua principal escolha" : `${ordem}ª opção`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${TONE_CLASSNAMES[meta.tone]}`}
            >
              {statusReal}
            </span>
            {pendingClosure && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 ring-1 ring-inset ring-stone-300 dark:bg-stone-800/60 dark:text-stone-300 dark:ring-stone-700">
                  Encerramento pendente
                </span>
                <ProvenanceBadge kind="pendente-sme" />
              </>
            )}
          </div>
        </div>

        <p className={featured ? "text-lg font-semibold" : "font-medium"}>
          {record?.nome_unidade ?? `Unidade ${record?.unidade ?? "?"}`}
        </p>
        <p className="text-sm text-black/60 dark:text-white/60">
          {record?.bairro ? `${record.bairro} · ` : ""}
          {record?.grupamento} · {record?.horario}
        </p>

        {featured && pressure && (
          <p className="text-sm text-blue-900 dark:text-blue-200">
            Concorrência histórica: <strong>{pressure.nivel}</strong>
          </p>
        )}

        <span className="text-xs text-black/40 dark:text-white/40">
          {expanded ? "ocultar detalhes" : "ver detalhes"}
        </span>
      </button>

      {expanded && (
        <OptionDetail
          ordem={ordem}
          record={record}
          statusReal={statusReal}
          pendingClosure={pendingClosure}
          regua={regua}
          demoRespostas={demoRespostas}
          totalDemonstrativo={totalDemonstrativo}
          suggestion={suggestion}
        />
      )}
    </div>
  );
}
