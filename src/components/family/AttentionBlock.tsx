import type { OpportunityRecord } from "@/lib/opportunity";
import { CountdownDemo } from "@/components/family/CountdownDemo";

const CONVOCADO_STATUSES = new Set(["Selecionado", "Selecionado da lista"]);

export function AttentionBlock({
  statusReal,
  confirmed,
  hero,
  prazoMs,
  onConfirmarClick,
  confirming,
  onConfirm,
  onCancelar,
}: {
  statusReal: string;
  confirmed: boolean;
  hero: OpportunityRecord | null;
  prazoMs: number;
  onConfirmarClick: () => void;
  confirming: boolean;
  onConfirm: () => void;
  onCancelar: () => void;
}) {
  const convocado = CONVOCADO_STATUSES.has(statusReal) && !confirmed;

  if (confirmed) {
    return (
      <section className="flex flex-col gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950/30">
        <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide dark:text-emerald-300">
          Vaga confirmada
        </p>
        <p className="text-sm text-emerald-900 dark:text-emerald-200">
          Vaga confirmada nesta simulação. As demais opções mostram o encerramento pendente de
          parametrização oficial.
        </p>
      </section>
    );
  }

  if (!convocado) {
    return (
      <section className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-black/[.02] p-6 dark:border-white/10 dark:bg-white/[.03]">
        <p className="text-xs font-semibold text-black/50 uppercase tracking-wide dark:text-white/50">
          Tudo certo por enquanto
        </p>
        <p className="text-sm text-black/70 dark:text-white/70">
          Maria está em {statusReal.toLowerCase()}. A posição pode mudar conforme a fila avança.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-blue-300 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/30">
      <div>
        <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide dark:text-blue-300">
          Vaga disponível
        </p>
        <p className="mt-1 text-lg font-semibold">
          Maria foi convocada para: {hero?.nome_unidade ?? `Unidade ${hero?.unidade}`}
        </p>
        <p className="text-sm text-black/60 dark:text-white/60">
          {hero?.grupamento} · {hero?.horario}
        </p>
      </div>

      <CountdownDemo durationMs={prazoMs} />

      {!confirming ? (
        <div className="flex gap-2">
          <button
            onClick={onConfirmarClick}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-blue-600"
          >
            Confirmar vaga
          </button>
          <button className="rounded-md border border-blue-300 px-4 py-2 text-sm font-medium text-blue-800 dark:border-blue-700 dark:text-blue-300">
            Preciso de ajuda
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/40">
          <p className="text-sm">
            Esta é uma <strong>simulação de fluxo</strong> de confirmação de vaga. Nada é salvo em
            nenhum banco de dados -- atualizar a página restaura o cenário inicial.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onConfirm}
              className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white dark:bg-blue-600"
            >
              Confirmar (simulação)
            </button>
            <button
              onClick={onCancelar}
              className="rounded-md border border-black/20 px-3 py-1.5 text-sm font-medium dark:border-white/20"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
