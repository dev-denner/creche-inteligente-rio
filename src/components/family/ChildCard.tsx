import type { OpportunityRecord } from "@/lib/opportunity";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function ChildCard({ hero, totalOpcoes }: { hero: OpportunityRecord | null; totalOpcoes: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/10 p-4 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <p className="text-lg font-semibold">Maria Souza</p>
          <ProvenanceBadge kind="demonstracao" />
        </div>
        <p className="font-mono text-sm text-black/60 dark:text-white/60">CPF da criança: ***.***.***-**</p>
        <p className="text-sm text-black/70 dark:text-white/70">
          {hero?.grupamento ?? "Grupamento"} · Turno preferencial: {hero?.horario ?? "--"}
        </p>
        <p className="text-xs text-black/50 dark:text-white/50">{totalOpcoes} opções cadastradas</p>
      </div>
      <div className="border-t border-black/10 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 dark:border-white/10">
        <p className="text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
          Responsável
        </p>
        <p className="text-sm font-medium">Ana Souza</p>
        <p className="font-mono text-xs text-black/60 dark:text-white/60">CPF: ***.***.***-**</p>
      </div>
    </div>
  );
}
