import type { ReguaData } from "@/lib/regua";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function ClassificationSection({
  regua,
  demoRespostas,
  totalDemonstrativo,
}: {
  regua: ReguaData | null;
  demoRespostas: Record<number, boolean>;
  totalDemonstrativo: number;
}) {
  if (!regua) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        Régua não encontrada. Rode <code>python scripts/build_regua.py</code>.
      </p>
    );
  }

  return (
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
  );
}
