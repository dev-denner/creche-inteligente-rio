import type { OpportunityRecord } from "@/lib/opportunity";
import { buildDemoTimeline } from "@/lib/demo-scenario";
import { statusMeta, TONE_CLASSNAMES } from "@/lib/status";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function OptionCard({
  ordem,
  record,
  statusReal,
  expanded,
  onToggle,
  pendingClosure,
}: {
  ordem: number;
  record: OpportunityRecord | null;
  statusReal: string;
  expanded: boolean;
  onToggle: () => void;
  pendingClosure: boolean;
}) {
  const meta = statusMeta(statusReal);
  const timeline = buildDemoTimeline(statusReal);

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-2 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
            {ordem}ª opção
          </p>
          <p className="font-medium">{record?.nome_unidade ?? `Unidade ${record?.unidade ?? "?"}`}</p>
          <p className="text-sm text-black/60 dark:text-white/60">
            {record?.grupamento} · {record?.horario}
          </p>
        </div>
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
          <span className="text-xs text-black/40 dark:text-white/40">{expanded ? "ocultar" : "detalhes"}</span>
        </div>
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-black/10 p-4 dark:border-white/10">
          <p className="text-sm text-black/70 dark:text-white/70">{meta.gloss}</p>

          {pendingClosure && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              <p className="font-medium">Encerramento das demais opções</p>
              <p className="text-xs">Regra/status final pendente de parametrização SME.</p>
            </div>
          )}

          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
              Linha do tempo <ProvenanceBadge kind="demonstracao" />
            </p>
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
        </div>
      )}
    </div>
  );
}
