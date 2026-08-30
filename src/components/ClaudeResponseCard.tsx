import { parseClaudeSections } from "@/lib/claude-response";

export function ClaudeResponseCard({
  text,
  labels,
  titulo = "Análise com Claude",
}: {
  text: string;
  labels: string[];
  titulo?: string;
}) {
  const sections = parseClaudeSections(text, labels);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900 dark:bg-blue-950/20">
      <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">{titulo}</p>
      {sections.map((s, i) => (
        <div key={i}>
          <p className="text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
            {s.titulo}
          </p>
          <p className="text-sm whitespace-pre-wrap text-black/80 dark:text-white/80">{s.corpo}</p>
        </div>
      ))}
      <p className="border-t border-blue-200 pt-2 text-xs text-black/50 dark:border-blue-900 dark:text-white/50">
        Claude apoia interpretação. Regras e cálculos permanecem determinísticos.
      </p>
    </div>
  );
}
